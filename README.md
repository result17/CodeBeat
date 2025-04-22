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

## prsima & database
<code>Prisma ORM</code> supports two [connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls).<br/>
With prsma postgres:
```json
// packages/codebeat-server/package.json
{
  "scripts": {
    "prepare": "dotenv -e .dev.vars prisma generate --data-proxy"
  }
}
```
```ts
// packages\codebeat-server\src\db\prisma.ts
```

## TODO
- [x] database connection log
