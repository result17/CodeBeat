interface Env {
  DATABASE_URL: string
  DIRECT_DATABASE_URL: string
  SHADOW_DATABASE_URL: string
}

declare namespace NodeJS {
  interface ProcessEnv extends Env {}
}
