/**
 * AEOS Kernel — Registry Loader
 *
 * Loads agent and skill registries from YAML files into the runtime.
 * This bridges the file-system YAML definitions with the in-memory registry.
 *
 * Supports:
 *   - Loading all agents from engineering/registry/agents/*.yaml
 *   - Loading all skills from engineering/registry/skills/*.yaml
 *   - Loading all skills from .skills/aqliya/eng-*.md
 *   - Validating against contracts before registration
 *
 * @module kernel/registry-loader
 * @version 1.1
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join, extname, basename } from "path";
import { emit } from "./event-engine.mjs";

// ═══════════════════════════════════════════════════════════
// YAML Parser (minimal — production would use js-yaml)
// ═══════════════════════════════════════════════════════════

/**
 * Parse a simple YAML file (flat key: value format).
 * @param {string} content
 * @returns {object}
 */
/**
 * Parse a YAML file supporting nested objects, lists, and multiline strings.
 * @param {string} content
 * @returns {object}
 */
function parseSimpleYaml(content) {
  const lines = content.split("\n").map((l) => l.replace(/\r$/, ""));
  const result = {};
  let i = 0;

  function getIndent(line) {
    const m = line.match(/^(\s*)/);
    return m ? m[1].length : 0;
  }

  function parseScalar(value) {
    if (value === "" || value === "~" || value === "null") return null;
    if (value === "true") return true;
    if (value === "false") return false;
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
    // Strip quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    // Inline array: [item1, item2, item3]
    if (value.startsWith("[") && value.endsWith("]")) {
      const inner = value.slice(1, -1).trim();
      if (inner === "") return [];
      return inner.split(",").map((item) => parseScalar(item.trim()));
    }
    // Inline object: { key1: val1, key2: val2 }
    if (value.startsWith("{") && value.endsWith("}")) {
      const inner = value.slice(1, -1).trim();
      if (inner === "") return {};
      const obj = {};
      // Simple comma-separated key: value pairs
      // Split on ", " but not inside nested structures
      const pairs = inner.split(/,\s*(?=\w+:)/);
      for (const pair of pairs) {
        const colonIdx = pair.indexOf(":");
        if (colonIdx > 0) {
          const k = pair.slice(0, colonIdx).trim();
          const v = pair.slice(colonIdx + 1).trim();
          obj[k] = parseScalar(v);
        }
      }
      return obj;
    }
    return value;
  }

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip blanks and comments
    if (trimmed === "" || trimmed.startsWith("#")) { i++; continue; }

    const indent = getIndent(raw);

    // Multiline: key: |
    const mlMatch = trimmed.match(/^(\w[\w_-]*):\s*\|\s*$/);
    if (mlMatch) {
      const key = mlMatch[1];
      const bodyLines = [];
      i++;
      while (i < lines.length) {
        const nextRaw = lines[i];
        const nextTrimmed = nextRaw.trim();
        if (nextTrimmed === "") { bodyLines.push(""); i++; continue; }
        if (getIndent(nextRaw) <= indent) break;
        bodyLines.push(nextRaw.trimStart());
        i++;
      }
      result[key] = bodyLines.join("\n").trim();
      continue;
    }

    // List: key: followed by indented "- " items
    const kvMatch = trimmed.match(/^(\w[\w_-]*):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const value = kvMatch[2].trim();

      if (value === "") {
        // Peek next non-blank line to decide: list or object
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === "") j++;
        if (j < lines.length) {
          const nextTrimmed = lines[j].trim();
          if (nextTrimmed.startsWith("- ")) {
            // It's a list
            const list = [];
            i = j;
            while (i < lines.length) {
              const lt = lines[i].trim();
              if (lt === "") { i++; continue; }
              if (!lt.startsWith("- ")) break;
              list.push(parseScalar(lt.slice(2)));
              i++;
            }
            result[key] = list;
            continue;
          } else if (getIndent(lines[j]) > indent) {
            // It's a nested object
            const obj = {};
            i = j;
            while (i < lines.length) {
              const lt = lines[i].trim();
              if (lt === "") { i++; continue; }
              if (getIndent(lines[i]) <= indent) break;
              const m = lt.match(/^(\w[\w_-]*):\s*(.*)$/);
              if (m) {
                const subKey = m[1];
                const subVal = m[2].trim();
                if (subVal === "") {
                  // Sub-list inside nested object
                  i++;
                  const subList = [];
                  while (i < lines.length) {
                    const slt = lines[i].trim();
                    if (slt === "") { i++; continue; }
                    if (slt.startsWith("- ")) {
                      subList.push(parseScalar(slt.slice(2)));
                      i++;
                    } else {
                      break;
                    }
                  }
                  obj[subKey] = subList;
                  continue;
                } else {
                  obj[subKey] = parseScalar(subVal);
                }
              }
              i++;
            }
            result[key] = obj;
            continue;
          }
        }
        // Empty key with no following content → null
        result[key] = null;
        i++;
        continue;
      }

      // Inline value
      result[key] = parseScalar(value);
      i++;
      continue;
    }

    i++;
  }

  return result;
}

/**
 * Parse a markdown file with YAML frontmatter (skills format).
 * @param {string} content
 * @returns {{ frontmatter: object, body: string }}
 */
function parseFrontmatter(content) {
  // Handle both LF and CRLF
  const normalized = content.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = parseSimpleYaml(match[1]);
  return { frontmatter, body: match[2] };
}

// ═══════════════════════════════════════════════════════════
// Loader Functions
// ═══════════════════════════════════════════════════════════

/**
 * Load all agent registries from YAML files.
 * @param {string} agentsDir - Path to agents directory
 * @returns {Array<object>}
 */
export function loadAgents(agentsDir) {
  if (!existsSync(agentsDir)) {
    console.warn(`[RegistryLoader] Agents directory not found: ${agentsDir}`);
    return [];
  }

  const files = readdirSync(agentsDir).filter((f) => extname(f) === ".yaml" || extname(f) === ".yml");
  const loaded = [];

  for (const file of files) {
    try {
      const content = readFileSync(join(agentsDir, file), "utf-8");
      const data = parseSimpleYaml(content);

      if (!data.id || !data.name) {
        console.warn(`[RegistryLoader] Skipping invalid agent file: ${file} (missing id or name)`);
        continue;
      }

      loaded.push({
        id: data.id,
        type: "agent",
        version: data.version || "1.0",
        metadata: {
          name: data.name,
          layer: data.layer || 1,
          owner: data.owner || "Unknown",
          priority: data.priority || "medium",
          status: data.status || "active",
          skills: data.skills || [],
          dependencies: data.dependencies || [],
          permissions: data.permissions || [],
          description: data.description || "",
          metrics: data.metrics || { successRate: 100, tasksCompleted: 0, avgCompletionTimeMs: 0, lastActive: null },
        },
        dependencies: data.dependencies || [],
        tags: [`layer-${data.layer}`, data.priority || "medium", data.owner?.toLowerCase().replace(/\s+/g, "-") || "unknown"],
      });

      emit("registry-loader.agent_loaded", { agentId: data.id, file }, { source: "registry-loader" });
    } catch (err) {
      console.error(`[RegistryLoader] Error loading agent ${file}:`, err.message);
    }
  }

  console.log(`[RegistryLoader] Loaded ${loaded.length} agents from ${agentsDir}`);
  return loaded;
}

/**
 * Load all skill registries from YAML files.
 * @param {string} skillsDir - Path to skills directory
 * @returns {Array<object>}
 */
export function loadSkills(skillsDir) {
  if (!existsSync(skillsDir)) {
    console.warn(`[RegistryLoader] Skills directory not found: ${skillsDir}`);
    return [];
  }

  const files = readdirSync(skillsDir).filter((f) => extname(f) === ".yaml" || extname(f) === ".yml");
  const loaded = [];

  for (const file of files) {
    try {
      const content = readFileSync(join(skillsDir, file), "utf-8");
      const data = parseSimpleYaml(content);

      if (!data.id || !data.name) {
        console.warn(`[RegistryLoader] Skipping invalid skill file: ${file} (missing id or name)`);
        continue;
      }

      loaded.push({
        id: data.id,
        type: "skill",
        version: data.version || "1.0.0",
        metadata: {
          name: data.name,
          layer: data.layer || 1,
          owner: data.owner || "Unknown",
          status: data.status || "active",
          inputs: data.inputs || [],
          outputs: data.outputs || [],
          compatibleAgents: data.compatible_agents || [],
          qualityScore: data.quality_score || 70,
          successRate: data.success_rate || 100,
          timesUsed: data.times_used || 0,
          lastUsed: data.last_used || null,
          hasTests: data.tests || false,
          description: data.description || "",
        },
        dependencies: data.dependencies || [],
        tags: [`layer-${data.layer}`, data.owner?.toLowerCase().replace(/\s+/g, "-") || "unknown"],
      });

      emit("registry-loader.skill_loaded", { skillId: data.id, file }, { source: "registry-loader" });
    } catch (err) {
      console.error(`[RegistryLoader] Error loading skill ${file}:`, err.message);
    }
  }

  console.log(`[RegistryLoader] Loaded ${loaded.length} skills from ${skillsDir}`);
  return loaded;
}

/**
 * Load engineering skills from .skills/aqliya/eng-*.md files.
 * @param {string} skillsMdDir
 * @returns {Array<object>}
 */
export function loadEngineeringSkills(skillsMdDir) {
  if (!existsSync(skillsMdDir)) {
    console.warn(`[RegistryLoader] Engineering skills directory not found: ${skillsMdDir}`);
    return [];
  }

  const files = readdirSync(skillsMdDir).filter((f) => f.startsWith("eng-") && f.endsWith(".md"));
  const loaded = [];

  for (const file of files) {
    try {
      const content = readFileSync(join(skillsMdDir, file), "utf-8");
      const { frontmatter, body } = parseFrontmatter(content);

      if (!frontmatter.name) {
        console.warn(`[RegistryLoader] Skipping skill markdown without name: ${file}`);
        continue;
      }

      loaded.push({
        id: frontmatter.name.replace(/\s+/g, "-").toLowerCase(),
        type: "skill",
        version: frontmatter.version || "1.0",
        metadata: {
          name: frontmatter.name,
          description: frontmatter.description || "",
          status: frontmatter.status || "active",
          owner: frontmatter.owner || "Unknown",
          layer: parseInt(frontmatter.layer) || 7,
          inputs: frontmatter.inputs || [],
          outputs: frontmatter.outputs || [],
          qualityScore: 80,
          successRate: 100,
          timesUsed: 0,
          hasTests: false,
          contentLength: body.length,
        },
        dependencies: frontmatter.dependencies || [],
        tags: ["engineering-skill", `layer-${frontmatter.layer || 7}`],
      });

      emit("registry-loader.engineering_skill_loaded", { skillId: frontmatter.name, file }, { source: "registry-loader" });
    } catch (err) {
      console.error(`[RegistryLoader] Error loading skill ${file}:`, err.message);
    }
  }

  console.log(`[RegistryLoader] Loaded ${loaded.length} engineering skills from ${skillsMdDir}`);
  return loaded;
}

/**
 * Full bootstrap: load all registries.
 * @param {string} engineeringDir - Root engineering/ directory
 * @returns {{ agents: number, skills: number, total: number }}
 */
export function bootstrapAll(engineeringDir) {
  const agentsDir = join(engineeringDir, "registry", "agents");
  const skillsDir = join(engineeringDir, "registry", "skills");
  const engSkillsDir = join(engineeringDir, "..", ".skills", "aqliya");

  const agents = loadAgents(agentsDir);
  const skills = loadSkills(skillsDir);
  const engSkills = loadEngineeringSkills(engSkillsDir);

  const total = agents.length + skills.length + engSkills.length;

  emit("registry-loader.bootstrap_complete", { agents: agents.length, skills: skills.length + engSkills.length, total }, { source: "registry-loader" });

  return {
    agents: agents.length,
    skills: skills.length + engSkills.length,
    total,
    agentList: agents,
    skillList: [...skills, ...engSkills],
  };
}

export default { loadAgents, loadSkills, loadEngineeringSkills, bootstrapAll };
