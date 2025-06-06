# TODO
# install
The project installs dependencies via pnpm catalog feature. With @antfu/nip, dependency installation becomes even more effortless
```bash
npx nip tsx
```
# Events
- onDidOpenTerminal (TODO)
- onDidChangeTextDocument (TODO)
- onDidCloseTextDocument (TODO)
- onDidCreateFiles (TODO)
- onDidDeleteFiles (TODO)
- onDidRenameFiles (TODO)
- onDidSaveTextDocument (TODO)
## Commands

<!-- commands -->

| Command           | Title            |
| ----------------- | ---------------- |
| `codeBeat.toggle` | CodeBeat: Toggle |

<!-- commands -->

## Configurations

<!-- configs -->

| Key               | Description | Type      | Default |
| ----------------- | ----------- | --------- | ------- |
| `codeBeat.enable` |             | `boolean` | `true`  |

<!-- configs -->

## prisma & database
<code>Prisma ORM</code> supports two [connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls).<br/>
With prsma postgres(Connection URL starts with prisma):
```env
// Deprecated
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
```
```json
// packages/codebeat-server/package.json
{
  "scripts": {
    "prepare": "dotenv -e .dev.vars prisma generate --no-engine"
  }
}
```
Setting up a Cloudflare Workers project with Prisma ORM, you have to use <code>Prisma Accelerate<code>- it has 100k operations* free operations with <code> Prisma Postgres</code> or 60k operations* free operations with your own database.
```ts
// packages\codebeat-server\src\db\prisma.ts
new PrismaClient({ datasourceUrl }).$extends(withAccelerate())
```
with other postgres database(Connection URL starts with postgres):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codebeat"
```

## local database development
```bash
// cwd packages/codebeat-server
docker-compose up -d
```
Docker will create two databases when it init.
```bash
// database migration
pnpm migrate-local
```
Migration will creat tables this program needs.
```bash
// Node server
pnpm dev
```
## export trpc router
If your tsconfig.json uses moduleResolution: "node", it will cause errors when bundling and exporting tRPC routers. This configuration incorrectly imports a non-existent package @trpc/server/dist/unstable-core-do-not-import, leading to type definition errors. The correct configuration should be moduleResolution: "bundler", which allows tsup to properly handle the exports.

## TODO
- [x] database connection log
- [x] when opening new file, codebeat-ext can't collect heartbeatparams
- [] when codebeat-cli is not found, download it automatically.
- [x] show duration when changing project folder
- [x] debug build heartbeat collection
- [] project cicd
- [x] when extension is activated, then fetch render data
- [x] save necessary data in vscode context
- [] projects pie charts
- [] summary date calculation performance benchmark
- [] when git committing, code will be linted
- [] when server shut down, codebeat cli has memory address error
- [] when server shut down, prsima should disconnect
- [] Using '*' activation is usually a bad idea as it impacts performance.
- [] changing heartbeat table schema to save prev project and sendAt
