import type { UserConfig as ViteConfig } from 'vite'

export interface UserConfig {
  main?: ViteConfig & { configFile?: string | false }
  preload?: ViteConfig & { configFile?: string | false }
  renderer?: ViteConfig & { configFile?: string | false }
}

export type InlineConfig = Omit<ViteConfig, 'base'> & {
  configFile?: string | false
  envFile?: false
  ignoreConfigWarning?: boolean
}

export interface ResolvedConfig {
  config?: UserConfig
  configFile?: string
  configFileDependencies: string[]
}
