interface Env {
  DATABASE_URL: string
  DIRECT_DATABASE_URL: string
  SHADOW_DATABASE_URL: string
  RUNTIME_ENV: 'production' | 'development'
}
