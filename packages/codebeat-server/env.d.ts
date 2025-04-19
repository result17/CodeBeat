interface Env {
  DATABASE_URL: string
}

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
  }
}

