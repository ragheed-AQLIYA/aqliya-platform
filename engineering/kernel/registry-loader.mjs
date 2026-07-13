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
function parseSimpleYaml(content) {
  const result = {};
  const lines = content.split("\n");
  let currentKey = null;
  let currentList = null;
  let inMultiline = false;
  let multilineKey = null;
  let multilineValue = [];

  for (const line of lines) {
    // Multiline continuation
    if (inMultiline) {
      if (line.trim() === "" || line.match(/^\S/)) {
        // End of multiline
        result[multilineKey] = multilineValue.join("\n").trim();
        inMultiline = false;
        multilineValue = [];
      } else {
        multilineValue.push(line.trim());
        continue;
      }
    }

    if (line.trim() === "" || line.startsWith("#")) continue;

    // Multiline start: "key: |"
    const mlMatch = line.match(/^(\w[\w_]*):\s*\|\s*$/);
    if (mlMatch) {
      inMultiline = true;
      multilineKey = mlMatch[1];
      continue;
    }

    // List item: "  - value"
    const listMatch = line.match(/^\s+-\s+(.+)$/);
    if (listMatch && currentList !== null) {
      result[currentList].push(listMatch[1].trim());
      continue;
    }

    // Key: value
    const kvMatch = line.match(/^(\w[\w_]*):\s*(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      const value = kvMatch[2].trim();
      if (value === "") {
        currentList = key;
        result[key] = [];
      } else if (value === "null") {
        result[key] = null;
      } else if (/^\d+$/.test(value)) {
        result[key] = parseInt(value, 10);
      } else if (/^\d+\.\d+$/.test(value)) {
        result[key] = parseFloat(value);
      } else {
        result[key] = value;
      }
    }
  }

  // Handle trailing multiline
  if (inMultiline && multilineKey) {
    result[multilineKey] = multilineValue.join("\n").trim();
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
