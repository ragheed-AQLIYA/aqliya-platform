export type FlagVariant = "on" | "off"

export interface FeatureFlag {
  key: string
  name: string
  description: string
  variant: FlagVariant
  owner: string
  dependencies: string[]
  createdAt: string
  updatedAt: string
}
