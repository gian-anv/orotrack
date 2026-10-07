# Orotrack

A web app for speech-language pathologists to review articulation practice.
A child practises target sounds on a separate device, the device exports a
CSV file after each session, and the therapist uploads it here to review
every attempt.

Live site: https://orotrack-production.up.railway.app

The practice device is not built yet, so the CSV format is our own design
and all data in the app is invented.

## Features

- Register and sign in. Each account has its own private data.
- Add, edit, and delete participants, stored as codes such as `PT-0142`.
- Upload a session CSV for a participant.
- View every attempt and filter by participant, exercise, input validity,
  and date.

## Built with

| Part | Tools |
|---|---|
| Client | React, Refine (core), React Router, Vite |
| Server | Node.js 24, Express |
| Database | SQLite, through Node's built-in `node:sqlite` |
| Login | bcryptjs for password hashing, jsonwebtoken for tokens |
| Uploads | Multer |
| Hosting | Railway, with a volume for the database and uploaded files |

## Project structure

```
client/                 React app that runs in the browser
  public/               favicon and link-preview image
  src/
    App.jsx             Refine setup and the list of pages
    authProvider.js     sign in, register, sign out
    dataProvider.js     calls to the server's API
    Layout.jsx          top bar for signed-in pages
    AuthPage.jsx        layout shared by the sign-in and register pages
    Logo.jsx
    index.css           all styling
    pages/              one file per page
server/                 Express server
  index.js              login, registration, and route setup
  db.js                 opens the database and creates the tables
  requireAuth.js        login check for protected routes
  routes/               participants, uploads, attempts
package.json            build and start commands used by Railway
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
your `.env` file. Your local copy has its own database in the `data`
folder, separate from the live site.

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

## Deployment

Railway rebuilds and restarts the app on every push to `main`. The server
reads these environment variables, which are set in Railway and never
stored in this repository:

| Variable | Purpose |
|---|---|
| `DATA_DIR` | Folder for the database and uploads (`/data` on Railway) |
| `JWT_SECRET` | Secret used to sign login tokens |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Details of the first account |

## Known limits

- Uploading the same file twice saves its rows twice.
- Participant codes are unique across all accounts.
- Registration closes after six accounts.
- There is no password reset.
- The Trends chart from the wireframes is not built yet.
