# Orotrack

A web app for speech-language pathologists to review articulation practice.
A child practises target sounds on a separate device, the device exports a
CSV file after each session, and the therapist uploads it here to review
every attempt and see how practice is going over time.

Live site: https://orotrack-production.up.railway.app

The practice device is not built yet, so the CSV format is our own design
and all data in the app is invented.

## Features

- Sign in with an account created by the administrator. There is no sign-up.
- The administrator creates accounts, renames them, resets passwords, and
  deletes accounts.
- Each therapist account has its own private participants, uploads, and attempts.
- Add, edit, and delete participants, stored as codes such as `PT-0142`.
- Upload a session CSV for a participant.
- View every attempt, filtered by participant, exercise, input validity, and date.
- See practice trends per participant: sessions logged, average score,
  invalid input rate, and a chart of average score per session.
- A public Help page explaining the app and the CSV format.

## Built with

| Part | Tools |
|---|---|
| Client | React, Refine (core), React Router, Vite, Recharts |
| Server | Node.js 24, Express |
| Database | SQLite, through Node's built-in `node:sqlite` |
| Login | bcryptjs for password hashing, jsonwebtoken for tokens |
| Uploads | Multer |
| Hosting | Railway, with a volume for the database and uploaded files |

## Documentation

| Document | What it covers |
|---|---|
| [docs/architecture.md](docs/architecture.md) | How the client, server, and database fit together, and how roles work |
| [docs/api.md](docs/api.md) | Every API route: who may call it, what it expects, and what it returns |
| [docs/database.md](docs/database.md) | The four tables, their columns, how they link, and the migrations |
| [docs/deployment.md](docs/deployment.md) | Railway settings, environment variables, and how a push deploys |

## Project structure

```
client/                         React app that runs in the browser
  index.html
  vite.config.js                dev server, forwards /api to port 3000
  public/                       favicon and link-preview image
  src/
    main.jsx                    starts React
    App.jsx                     Refine setup and the list of pages
    index.css                   all styling
    assets/                     hero image for the sign-in page
    providers/
      authProvider.js           sign in, sign out, login check, role lookup
      dataProvider.js           calls to the server's API
    components/
      Layout.jsx                top bar for signed-in pages, links by role
      AuthPage.jsx              layout of the sign-in page
      Logo.jsx
    pages/
      Home.jsx                  sends each role to its first page
      Login.jsx
      Help.jsx
      participants/             list, create, and edit
      uploads/                  upload a CSV, list uploaded files
      attempts/                 every attempt, with filters
      trends/                   summary numbers and chart
      users/                    account list and create (admin)
server/
  index.js                      connects middleware and routes, serves the client
  db.js                         opens the database, creates and migrates tables
  setupAdmin.js                 creates or updates the admin account at startup
  middleware/
    requireAuth.js              login check for protected routes
    requireAdmin.js             admin check for account routes
  routes/
    auth.js                     sign in, and who is signed in
    participants.js
    uploads.js
    attempts.js
    trends.js
    users.js                    accounts (admin)
docs/                           technical documentation
package.json                    build and start commands used by Railway
```

The pages are grouped by resource, and each resource has a matching route
file on the server: `pages/participants/` and `routes/participants.js`,
`pages/users/` and `routes/users.js`, and so on.

## Running it locally

You need Git and Node.js 24.

```bash
git clone git@github.com:gian-anv/orotrack.git
cd orotrack/server
npm install
cd ../client
npm install
```

The clone command uses SSH, which needs an SSH key added to GitHub. Without
one, clone with `https://github.com/gian-anv/orotrack.git` instead. That
copy can be read and run but not pushed.

Create `server/.env` with your own values:

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=choose-a-password
JWT_SECRET=any-long-random-text
```

`openssl rand -hex 32` prints a suitable secret. Do not set `DATA_DIR` or
`PORT` locally.

Start the server from the `server` folder:

```bash
npm start
```

In a second terminal, start the client from the `client` folder:

```bash
npm run dev
```

Open http://localhost:5173 and sign in with the email and password from
your `.env` file. That account is the administrator. Create a therapist
account on the Users page, then sign in with it to add participants and
upload files.

The server creates the `data` folder on its first start. It holds the local
database and uploaded files, is kept out of Git, and is separate from the
live site's data.

## CSV format

One file is one practice session for one participant. The first line must
be this header:

```
timestamp,exercise,result,confidence_score,input_validity
2026-09-18 09:12:04,/r/ initial,correct,0.91,valid
2026-09-18 09:12:31,/r/ initial,incorrect,0.64,valid
2026-09-18 09:13:02,/r/ initial,,0.12,low_input
```

`result` is empty when the device could not judge the attempt. Values
cannot contain commas or quotation marks.

## Known limits

- Uploading the same file twice saves its rows twice.
- Participant codes are unique across all accounts.
- Login tokens last seven days and cannot be cancelled early.
- There is no password reset by email. The administrator resets passwords.
- Deleting a participant or an account leaves the original CSV files on disk.
- The administrator's name, email, and password come from the server
  settings, so they can't be changed on the Users page.
