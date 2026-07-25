import { existsSync } from "fs"
import { DEFAULT_CONFIG } from "./common"

export async function listAvailableSkills(skillsRoot?: string): Promise<string[]> {
  const root = skillsRoot ?? DEFAULT_CONFIG.skillsRoot
  const { readdirSync } = await import("fs")
  const { join: pathJoin } = await import("path")

  const skills: string[] = []
  const fullPath =
    root.startsWith("/") || /^[A-Za-z]:\\/.test(root)
      ? root
      : pathJoin(process.cwd(), root)

  if (!existsSync(fullPath)) return skills

  const categories = readdirSync(fullPath, { withFileTypes: true })
  for (const category of categories) {
    if (!category.isDirectory()) continue
    const categoryPath = pathJoin(fullPath, category.name)
    const files = readdirSync(categoryPath).filter((f) => f.endsWith(".skill.yaml"))
    for (const file of files) {
      const skillName = file.replace(".skill.yaml", "")
      skills.push(`skill:${category.name}:${skillName}`)
    }
  }

  return skills.sort()
}
