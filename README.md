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
- The administrator creates accounts, resets passwords, and deletes accounts.
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
client/                   React app that runs in the browser
  public/                 favicon and link-preview image
  src/
    App.jsx               Refine setup and the list of pages
    authProvider.js       sign in, sign out, login check, role lookup
    dataProvider.js       calls to the server's API
    Layout.jsx            top bar for signed-in pages, links by role
    AuthPage.jsx          layout of the sign-in page
    Logo.jsx
    index.css             all styling
    pages/                one file per page
server/
  index.js                login, admin account setup, route setup
  db.js                   opens the database, creates and migrates tables
  requireAuth.js          login check for protected routes
  requireAdmin.js         admin check for account routes
  routes/                 participants, uploads, attempts, trends, users
docs/                     technical documentation
package.json              build and start commands used by Railway
```

## Running it locally

You need Git and Node.js 24.

```bash
git clone https://github.com/gian-anv/orotrack.git
cd orotrack/server
npm install
```

Create `server/.env` with your own values:

```
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=choose-a-password
JWT_SECRET=any-long-random-text
```

Start the server:

```bash
npm start
```

In a second terminal, start the client:

```bash
cd orotrack/client
npm install
npm run dev
```

Open http://localhost:5173 and sign in with the email and password from
your `.env` file. That account is the administrator. Create a therapist
account on the Users page, then sign in with it to add participants and
upload files. Your local copy has its own database in the `data` folder,
separate from the live site.

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
