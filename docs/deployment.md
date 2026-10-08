# Deployment

The live site runs on Railway as one service, connected to the GitHub
repository `gian-anv/orotrack`.

Live site: https://orotrack-production.up.railway.app

## How a push deploys

Every push to the `main` branch starts a new deployment, which uses the
`package.json` at the top of the repository:

```json
"engines": { "node": "24.x" },
"scripts": {
  "build": "npm install --prefix client --include=dev && npm run build --prefix client && npm install --prefix server",
  "start": "npm start --prefix server"
}
```

1. **Build:** install the client's libraries (including development tools
   such as Vite), build the client into `client/dist`, then install the
   server's libraries.
2. **Start:** run `node --env-file-if-exists=.env index.js` in the `server`
   folder. `setupAdmin.js` updates the admin account, then Express serves
   `client/dist` and the API.

The `engines` field makes Railway use Node.js 24, the version the project
needs for its built-in SQLite module.

## Service settings

| Setting | Value |
|---|---|
| Source | GitHub repository `gian-anv/orotrack`, branch `main` |
| Root directory | `/` (the top of the repository) |
| Public domain | `orotrack-production.up.railway.app` |
| Volume | Mounted at `/data` |

The volume holds `data.sqlite` and the `uploads` folder. Without it, every
deployment would start with an empty database.

## Environment variables

Set in the service's Variables tab. They are never stored in the repository.

| Variable | Value | Purpose |
|---|---|---|
| `DATA_DIR` | `/data` | Where the database and uploaded files are kept |
| `JWT_SECRET` | A long random string | Signs and verifies login tokens |
| `ADMIN_EMAIL` | The administrator's email | Applied to the first account at every start |
| `ADMIN_PASSWORD` | The administrator's password | Applied to the first account at every start |
| `PORT` | Set by Railway | The port the server listens on |

A random secret can be made with `openssl rand -hex 32`.

On a developer's computer the same variables, except `DATA_DIR` and `PORT`,
go in `server/.env`, which `.gitignore` keeps out of the repository.

## Checking a deployment

Open the latest deployment's logs. A healthy start prints:

```
Admin account is admin@example.com
Server listening on port 8080
```

Then sign in on the live site. If a deployment is broken, an earlier
deployment can be restored from the service's Deployments tab.

## Common tasks

**Change the administrator's email or password:** edit `ADMIN_EMAIL` or
`ADMIN_PASSWORD` and redeploy. The old credentials stop working once the
server starts.

**Sign everyone out:** replace `JWT_SECRET` with a new random value and
redeploy. Every existing token stops working.

**Rename a therapist or reset their password:** use Rename or Reset password
on the Users page while signed in as the administrator.

## Things to know

- The app has no backup step. The database and uploaded files exist only on
  the volume.
- Deleting the Railway project or the volume deletes all data.
- Railway bills by usage. Check the account's Usage page, and delete the
  project when it is no longer needed.
