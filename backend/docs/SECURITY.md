# AyuChain Backend — Security Measures

Everything implemented in the backend security layer, and why each control is
there.

## 1. Transport and HTTP headers

| Control | Implementation | Reasoning |
|---|---|---|
| Security headers | `helmet()` in `src/app.js` | Sets `X-Content-Type-Options: nosniff`, `X-Frame-Options`, HSTS, a restrictive CSP and more in one place. Stops MIME sniffing, clickjacking and mixed-content downgrades. |
| `X-Powered-By` removed | `app.disable("x-powered-by")` | Does not advertise Express and its version to a scanner. |
| Cross-origin resource policy | `crossOriginResourcePolicy: "cross-origin"` | Helmet's default `same-origin` would block the Vercel frontend from loading the QR PNG served by `GET /api/qr/:batchId`. Relaxed only for that reason. |
| Proxy awareness | `app.set("trust proxy", 1)` | Render terminates TLS at a proxy. Without this the rate limiter would see one proxy IP for every client and throttle everybody together. |

## 2. CORS

`cors()` runs with an origin callback that only accepts `FRONTEND_URL`, with
`credentials: true`. The previous configuration was a bare `cors()`, which sends
`Access-Control-Allow-Origin: *` and lets any website on the internet call the
API from a logged-in user's browser. Requests without an `Origin` header (Postman,
curl, server-to-server) are still allowed, since CORS is a browser control and
blocking them would break tooling without adding security.

## 3. Authentication

| Control | Implementation | Reasoning |
|---|---|---|
| Password hashing | `bcrypt.hash(password, 10)` in `authController.js` | 10 salt rounds meets the project requirement of >= 10. bcrypt is salted per-password, so identical passwords do not produce identical hashes. |
| Password never returned | `createUser` and `findUserById` use explicit `RETURNING` / `SELECT` column lists; the login response builds its own object | A `SELECT *` anywhere in a response path leaks the hash. Column lists make the leak impossible rather than merely unlikely. |
| Token expiry | `expiresIn: process.env.JWT_EXPIRY \|\| "1d"` in `utils/jwt.js` | A stolen token stops working. Now environment-driven so production can be tightened without a code change. |
| Uniform login failure | Same `401 Invalid email or password` for unknown email and wrong password | Prevents user enumeration through differing error messages. |

## 4. Authorization

`src/middleware/role.middleware.js` exports `allow(...roles)`, which runs after
`authenticate` and returns `403` when `req.user.role` is not in the list. It is a
separate middleware rather than an `if` inside each controller, so a route's
permissions are visible in the route file and cannot be forgotten in a new branch
of controller logic.

Applied as:

| Route | Roles |
|---|---|
| `POST /api/upload/herb-image` | `farmer` |
| `POST /api/upload/lab-report` | `laboratory` |
| `POST /api/qr/batches` | `manufacturer`, `admin` |
| `POST /api/qr/generate/:batchId` | `manufacturer`, `admin` |

Because `allow` checks `req.user`, a route that forgets `authenticate` fails
closed with `401` instead of silently permitting the request.

**Privilege escalation fixed:** `POST /api/auth/register` previously accepted any
`role` string from the request body, so anyone could register themselves as
`admin` and reach the admin dashboard. The validator now rejects `admin` at
self-registration. Admin accounts must be created by promoting an existing user
directly in the database.

## 5. Input validation

`express-validator` rules live in `src/validators/`, and
`src/middleware/validate.middleware.js` turns any failures into a single `400`
with a field-level breakdown. Every `POST` and `PATCH` route is covered:

| Route | Validated |
|---|---|
| `POST /api/auth/register` | name 2–100, valid email <= 150, password 6–128, role in allow-list minus `admin` |
| `POST /api/auth/login` | valid email, non-empty password |
| `POST /api/herbs` | name 2–150, description <= 2000, origin <= 150 |
| `PATCH /api/herbs/:id/status` | id positive integer, status in the six-value allow-list |
| `GET /api/herbs/:id`, `GET /api/herbs/:id/tracking` | id positive integer |
| `POST /api/upload/*` | `herbId` positive integer, `status` in `pending`/`passed`/`failed` |
| `POST /api/qr/batches` | `herbId` positive integer, productName 2–150, quantity <= 50 |
| `:batchId` params | `^[A-Za-z0-9-]{4,64}$` |
| `:cid` param | CIDv0 / CIDv1 pattern |

Length caps matter as much as type checks: without them a request can push
megabytes of text into a `TEXT` column. `express.json({ limit: "1mb" })` caps the
overall JSON body.

**SQL injection:** every query in `src/models/` uses `pg` parameterized queries
(`$1`, `$2`, …). Values travel outside the SQL string, so a payload such as
`'; DROP TABLE users; --` is stored or compared as literal text and can never be
parsed as SQL. No query anywhere is built by string concatenation. Validation is
a second layer, not the primary defence.

## 6. File upload hardening

`src/middleware/upload.middleware.js`:

| Control | Reasoning |
|---|---|
| `multer.memoryStorage()` | Nothing is written to the server's disk, so a malicious filename cannot cause a path traversal write, and Render's ephemeral filesystem stays clean. |
| 5 MB `fileSize` limit, `files: 1` | Bounds memory use per request and blocks a trivial denial-of-service by upload. |
| Allow-list of MIME types | jpeg/png/webp for images, pdf for reports. An allow-list fails closed for anything new. |
| Extension must match the MIME type | A client fully controls the `Content-Type` header, so a `.exe` sent as `image/png` would pass a MIME-only check. Requiring both to agree closes that gap. |
| **Magic-byte validation** | The decisive check. See below. |
| Multer errors caught in a wrapper | `LIMIT_FILE_SIZE` and filter rejections become clean `400` JSON responses rather than an unhandled error crashing the process. |

### Magic-byte validation

`src/utils/fileType.js` reads the leading bytes of the uploaded buffer and derives
the file's real type from its own content:

| Type | Signature |
|---|---|
| `image/jpeg` | `ff d8 ff` at offset 0 |
| `image/png` | `89 50 4e 47 0d 0a 1a 0a` at offset 0 |
| `image/webp` | `52 49 46 46` (`RIFF`) at offset 0 **and** `57 45 42 50` (`WEBP`) at offset 8 |
| `application/pdf` | `25 50 44 46` (`%PDF`) at offset 0 |

`assertContentMatchesType(buffer, declaredMimeType, allowedMimeTypes)` throws a
`400 "File content does not match its type"` unless the detected type is
recognised, equals the declared `Content-Type`, and is on the route's allow-list.

**Why this exists.** Both signals the extension/MIME check relies on are supplied
by the client. An attacker who names a file `photo.jpg` and declares
`Content-Type: image/jpeg` satisfies both while shipping arbitrary content. Two
attacker-controlled values agreeing with each other proves nothing; only the bytes
do. This gap was found by the automated security run on 2026-09-01 and is now
closed.

**Why it lives in the controller, not the multer `fileFilter`.** `fileFilter` is
invoked before the file body is buffered, so `file.buffer` is not yet populated
there. The check runs in `uploadController.saveUpload` — **before** the call to
`ipfs.service.uploadFile`, so a file that fails validation is never pinned. This
ordering matters because IPFS content is immutable and public once pinned: a
rejected upload must never reach the network in the first place.

Verified against real files: JPEG, PNG, WebP and PDF all still upload (no false
positives); PDF-as-JPEG, JPEG-as-PDF and PDF-as-PNG are all rejected with `400`.
`RIFF` containers that are not WebP (e.g. AVI) are correctly not detected as
images.

## 7. Rate limiting

`express-rate-limit`, 15-minute windows, `standardHeaders` on:

| Scope | Limit | Reasoning |
|---|---|---|
| All routes | 100 / 15 min | General abuse and scraping ceiling. |
| `/api/auth/*` | 10 / 15 min | Brute-forcing a 6-character password is the cheapest attack on the system; ten attempts per quarter hour makes it useless. |
| `/api/upload/*` | 20 / 15 min | Each upload costs Pinata storage quota and bandwidth, so this is a cost control as well as a security one. |

## 8. Data exposure on the public verify endpoint

`GET /api/verify/:batchId` is intentionally unauthenticated — a customer scanning
a QR code has no account. The response is therefore assembled field by field in
the controller rather than returned from a `SELECT *`:

- **Included:** herb name/description/origin/status, participant names and roles,
  IPFS CIDs and gateway URLs, lab report status, blockchain tx hash, timestamps.
- **Excluded:** email, phone, password hash, and every internal numeric id.

Batches are addressed by a random `batch_code` (`AYU-` + 12 hex characters from
`crypto.randomBytes`), not by a sequential integer. A sequential id would let
anyone enumerate `/api/verify/1`, `/2`, `/3` and scrape the full supply chain.

## 9. Gateway redirect is not an open proxy

`GET /api/upload/:cid` looks the CID up in the `uploads` table before redirecting.
Redirecting on any CID would turn the backend into an open IPFS proxy that
attackers could use to serve arbitrary content from the project's domain.

## 10. Error handling

`src/middleware/error.middleware.js` is the single terminal handler:

- `5xx` responses always read `Internal server error`.
- `error.message` and `error.stack` are attached **only** when
  `NODE_ENV !== "production"`. Stack traces disclose absolute file paths,
  dependency versions and query fragments.
- Unknown routes return a JSON `404` instead of Express's default HTML page.
- Full detail always goes to `console.error`, so Render's logs keep everything the
  response withholds.

## 11. Secrets

No secret is hardcoded. `PINATA_JWT`, `JWT_SECRET` and `DATABASE_URL` are read
from the environment only. `.env` is in `.gitignore`; `.env.example` carries the
key names with blank values. On Render, `JWT_SECRET` uses `generateValue: true`
and the rest are `sync: false`, so no secret is ever committed to `render.yaml`.

## Known gaps

Recorded honestly rather than left to be discovered later:

1. **No refresh-token or revocation mechanism.** A leaked JWT stays valid until it
   expires. Acceptable at a 1-day expiry for this project's scope.
2. **`blockchain_tx_hash` is unverified.** The column is populated by the backend,
   not read back from Polygon Amoy. Until Member 1's contract is deployed and the
   backend reads the on-chain record, a customer is trusting the database rather
   than the chain.
3. **File contents are type-checked but not scanned for malice.** Magic-byte
   validation guarantees a file is the type it claims to be, but a genuine PDF is
   not inspected for embedded JavaScript and images are not re-encoded to strip
   metadata. The frontend should never render an IPFS PDF inline in a same-origin
   context.
4. **No account lockout.** Rate limiting is per IP, so a distributed brute force
   is only slowed, not stopped.
