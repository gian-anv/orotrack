# API reference

All routes are under `/api` and answer in JSON. Request bodies are JSON,
except for file uploads, which use multipart form data.

## All routes

| Method and address | Who may call | Server file |
|---|---|---|
| `POST /api/login` | Public | `routes/auth.js` |
| `GET /api/me` | Signed in | `routes/auth.js` |
| `GET /api/participants` | Signed in | `routes/participants.js` |
| `GET /api/participants/:id` | Signed in | `routes/participants.js` |
| `POST /api/participants` | Signed in | `routes/participants.js` |
| `PUT /api/participants/:id` | Signed in | `routes/participants.js` |
| `DELETE /api/participants/:id` | Signed in | `routes/participants.js` |
| `GET /api/uploads` | Signed in | `routes/uploads.js` |
| `POST /api/uploads` | Signed in | `routes/uploads.js` |
| `GET /api/attempts` | Signed in | `routes/attempts.js` |
| `GET /api/trends/:participantId` | Signed in | `routes/trends.js` |
| `GET /api/users` | Admin | `routes/users.js` |
| `POST /api/users` | Admin | `routes/users.js` |
| `PUT /api/users/:id` | Admin | `routes/users.js` |
| `PUT /api/users/:id/password` | Admin | `routes/users.js` |
| `DELETE /api/users/:id` | Admin | `routes/users.js` |

## Authentication

Every route except `POST /api/login` needs a login token in the request
headers:

```
Authorization: Bearer <token>
```

| Who may call | Meaning |
|---|---|
| Public | No token needed |
| Signed in | Any valid token. Data is limited to the caller's own. |
| Admin | A valid token whose role is `admin` |

## Errors

Every error has the same shape:

```json
{ "message": "A sentence describing the problem" }
```

| Status | Meaning |
|---|---|
| 400 | Missing or unacceptable input, or a CSV that fails the checks |
| 401 | Wrong email or password, or a missing, altered, or expired token ("Not logged in") |
| 403 | The route is for the administrator only ("Admins only") |
| 404 | No such record for this user, or an unknown `/api` address ("Not found") |
| 409 | The email or participant code is already used |
| 500 | An unexpected server error ("Something went wrong on the server") |

## Sign-in

### POST /api/login

Public.

Request:

```json
{ "email": "you@example.com", "password": "your-password" }
```

Response `200`:

```json
{ "token": "eyJhbGciOi..." }
```

Errors:

- `400` "Email and password are required"
- `401` "Wrong email or password". The message is the same for an unknown
  email and a wrong password, so it doesn't reveal which emails have accounts.

### GET /api/me

Signed in. Returns what the token says about the caller.

```json
{ "userId": 3, "email": "you@example.com", "role": "user" }
```

## Participants

All signed in. Each user reaches only their own participants.

| Field | Type | Notes |
|---|---|---|
| `id` | number | Assigned by the database |
| `code` | text | Required. Unique across all accounts. |
| `age_group` | text | Required, such as `7-9` |
| `target_sounds` | text | Optional. Stored as empty text when not given. |
| `user_id` | number | The owner, set from the token |

### GET /api/participants

Returns a list of the caller's participants, sorted by code.

### GET /api/participants/:id

Returns one participant. Error: `404` "Participant not found" if it doesn't
exist or belongs to someone else.

### POST /api/participants

Request:

```json
{ "code": "PT-0142", "age_group": "7-9", "target_sounds": "/r/, /s/" }
```

Response `201`: the new participant.

Errors:

- `400` "Code and age group are required"
- `409` "That code is already in use. Pick a different one."

### PUT /api/participants/:id

Same body as create. Response `200`: the updated participant.
Errors: the same `400` and `409` as create, and `404` "Participant not found".

### DELETE /api/participants/:id

Response `200`: `{ "id": 5 }`. Also deletes the participant's uploads and
attempts. Error: `404` "Participant not found".

## Uploads

All signed in.

### GET /api/uploads

Returns the caller's uploaded files, newest first.

```json
[
  {
    "id": 12,
    "participant_id": 5,
    "participant_code": "PT-0142",
    "original_name": "PT-0142_session_0918.csv",
    "stored_name": "9f2c1a...",
    "row_count": 36,
    "uploaded_at": "2026-10-08T07:05:12.000Z"
  }
]
```

### POST /api/uploads

Multipart form data with two fields:

| Field | Value |
|---|---|
| `participant_id` | The id of one of the caller's participants |
| `file` | The CSV file, up to 10 MB |

Example:

```bash
curl -X POST http://localhost:3000/api/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -F participant_id=5 \
  -F file=@PT-0142_session_0918.csv
```

Response `201`:

```json
{ "id": 12, "row_count": 36 }
```

The server checks that a file was sent and that the participant belongs to
the caller, then that the header contains the five required columns and that
there is at least one data row. A failed check deletes the saved file and
answers `400` with one of these messages:

- "A participant and a CSV file are required"
- "Missing column: confidence_score", naming every missing column
- "The file has no data rows"

The required columns are `timestamp`, `exercise`, `result`,
`confidence_score`, and `input_validity`. An empty `result` is stored as no
value.

## Attempts

### GET /api/attempts

Signed in. Returns every attempt from the caller's uploads, newest first,
with the participant's code attached.

```json
[
  {
    "id": 310,
    "upload_id": 12,
    "participant_id": 5,
    "participant_code": "PT-0142",
    "timestamp": "2026-09-18 09:13:02",
    "exercise": "/r/ initial",
    "result": null,
    "confidence_score": 0.12,
    "input_validity": "low_input"
  }
]
```

## Trends

### GET /api/trends/:participantId

Signed in. Optional query parameter `exercise` limits the summary and the
points to one exercise, for example `/api/trends/5?exercise=%2Fr%2F%20initial`.
The value must be URL-encoded.

Response `200`:

```json
{
  "exercises": ["/r/ initial", "/s/ blends", "Multisyllabic"],
  "summary": { "sessions": 2, "average_score": 63.5, "invalid_rate": 5.1 },
  "points": [
    { "session_date": "2026-09-15", "exercise": "/r/ initial", "average_score": 72.7 }
  ]
}
```

| Field | Meaning |
|---|---|
| `exercises` | Every exercise the participant has practised, sorted. Not affected by the filter. |
| `summary.sessions` | Number of uploaded files with attempts that match the filter |
| `summary.average_score` | Percentage of valid attempts that were correct, or `null` if there are none |
| `summary.invalid_rate` | Percentage of all attempts that were invalid, or `null` if there are none |
| `points` | One entry per day per exercise: the percentage of that day's valid attempts that were correct |

Error: `404` "Participant not found" if the participant doesn't exist or
belongs to someone else.

## Accounts

All admin only. Any other caller gets `403` "Admins only".

### GET /api/users

Returns every account, sorted by id. Password hashes are never returned.

```json
[
  { "id": 1, "name": "Administrator", "email": "admin@example.com", "role": "admin", "participant_count": 0 },
  { "id": 2, "name": "Test User", "email": "test@example.com", "role": "user", "participant_count": 3 }
]
```

### POST /api/users

Creates a therapist account. The role is always `user`.

```json
{ "name": "Test User", "email": "test@example.com", "password": "at-least-8-chars" }
```

Response `201`: `{ "id", "name", "email", "role" }`.

Errors:

- `400` "Enter a name, an email, and a password of at least 8 characters",
  also when the email has no "@"
- `409` "An account with that email already exists"

### PUT /api/users/:id

Renames an account.

```json
{ "name": "New Name" }
```

Response `200`: `{ "id": 2, "name": "New Name" }`.

Errors: `400` "Name is required", `404` "User not found".

The Users page offers this only for therapist accounts. The administrator's
name is set back to "Administrator" every time the server starts.

### PUT /api/users/:id/password

```json
{ "password": "new-password" }
```

Response `200`: `{ "id": 2 }`.

Errors: `400` "The new password needs at least 8 characters",
`404` "User not found".

The administrator's own password comes from `ADMIN_PASSWORD` and is reset to
it whenever the server starts, so it should be changed in the settings, not
here.

### DELETE /api/users/:id

Deletes the account and all of its participants, uploads, and attempts.
Response `200`: `{ "id": 2 }`.

Errors: `404` "User not found", `400` "The admin account can't be deleted".
