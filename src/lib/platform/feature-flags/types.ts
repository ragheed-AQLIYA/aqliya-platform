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
  /** Optional expiry date (YYYY-MM-DD). After this date, the flag is treated as permanently "on" or removed. */
  expiresAt?: string
}
