# AyuChain Backend — Security Test Cases

Security test cases with expected and actual results.

**Last full run:** 2026-09-01, automated end-to-end against a live server on
PostgreSQL 18.6 (Neon) with a **real Pinata account connected**. **54 checks, 54
passed, 0 failed.** All test data was deleted afterwards and the database returned
to its pre-test baseline.

The magic-byte gap found in the first run (then case 10) is **fixed and
re-verified** — see cases 42–52 below.

Set up tokens first:

```
FARMER_TOKEN        — login as a user with role "farmer"
LAB_TOKEN           — login as a user with role "laboratory"
MANUFACTURER_TOKEN  — login as a user with role "manufacturer"
CUSTOMER_TOKEN      — login as a user with role "customer"
```

## Results

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 1 | No token on a protected route | `401` | `401 "Authentication token required"` | PASS |
| 2 | Malformed token | `401` | `401 "Invalid or expired token"` | PASS |
| 3 | Expired token (signed with `expiresIn: -10s`) | `401` | `401 "Invalid or expired token"` | PASS |
| 4 | Wrong role: customer → `POST /api/upload/herb-image` | `403` | `403 "Access denied for this role"` | PASS |
| 5 | Wrong role: farmer → `POST /api/upload/lab-report` | `403` | `403 "Access denied for this role"` | PASS |
| 6 | Wrong role: customer → `POST /api/qr/batches` | `403` | `403 "Access denied for this role"` | PASS |
| 7 | Oversized file (6 MB, `image/jpeg`) | `400` | `400 "File is larger than the 5MB limit"` | PASS |
| 8 | Wrong mimetype (`.exe`, `application/x-msdownload`) | `400` | `400 "Unsupported file type..."` | PASS |
| 9 | Extension/mimetype mismatch (`.jpg` sent as `application/pdf`) | `400` | `400 "Unsupported file type..."` | PASS |
| 10 | **Magic-byte check**: PDF bytes, `.jpg` name, `Content-Type: image/jpeg` | `400` | `400 "File content does not match its type"` | PASS *(was FAIL; fixed — see cases 42–52)* |
| 11 | SQLi in login body (`'; DROP TABLE users;--`) | `400` | `400 "Validation failed"` | PASS |
| 12 | SQLi in URL param (`/api/herbs/1;DROP TABLE users`) | `400` | `400 "Herb id must be a positive integer"` | PASS |
| 13 | SQLi payload that **passes** validation, stored via `POST /api/herbs` | stored as literal text | `201`, name stored as `Ashwa'; DROP TABLE users;--` | PASS |
| 14 | Direct model query with an injection payload | no match, no SQL executed | returned `undefined` | PASS |
| 15 | Tables survive all injection attempts | row counts unchanged | `users` unchanged, `herbs` +1 (the literal row) | PASS |
| 16 | Auth rate limit | attempts 1–10 `401`, 11th `429` | first `429` at attempt 11 exactly | PASS |
| 17 | CORS: `Origin: https://evil.com` | no `Access-Control-Allow-Origin` | header absent | PASS |
| 18 | CORS: `Origin: <FRONTEND_URL>` | origin echoed, credentials true | `http://localhost:3000`, `credentials=true` | PASS |
| 19 | Helmet headers | `nosniff`, no `X-Powered-By` | `nosniff`, `X-Powered-By` absent | PASS |
| 20 | Stack trace in development | `stack` present | keys `["message","error","stack"]` | PASS |
| 21 | Stack trace with `NODE_ENV=production` | `stack` absent | keys `["message"]`, full detail in server log | PASS |
| 22 | Unknown route | `404` JSON | `404 application/json "Route not found: GET /api/does-not-exist"` | PASS |
| 23 | Open IPFS proxy (valid CID never uploaded here) | `404`, no redirect | `404 "CID not found"`, no `Location` | PASS |
| 24 | Malformed CID | `400` | `400 "Invalid IPFS CID"` | PASS |
| 25 | Malformed batch code | `400` | `400 "Invalid batch code"` | PASS |
| 26 | Pinata unavailable | `502`, server stays up | `502 "Failed to upload file to IPFS"`, server stayed up | PASS |
| 27 | Register `role: "admin"` | `400` | `400 "Role must be one of: farmer, collector, laboratory, manufacturer, customer"` | PASS |
| 28 | Password in register response (×4 roles) | absent | absent in all four | PASS |
| 29 | Password in login response (×4 roles) | absent | absent in all four | PASS |
| 30 | Password in `GET /api/users/profile` | absent | absent | PASS |
| 31 | `GET /api/verify/:batchId` without auth | `200` | `200` | PASS |
| 32 | `/api/verify` assembles the full chain | farmer, herb, images, labReports, manufacturer, tracking, txHash | all 7 sections present | PASS |
| 33 | `/api/verify` leaks no sensitive data | no email/phone/password/raw id | recursive key **and** value scan found none | PASS |
| 34 | QR PNG served | `200`, `image/png`, PNG magic | `200`, `image/png`, magic `PNG`, 3147 bytes | PASS |
| 35 | QR decodes to the right URL | `<FRONTEND_URL>/verify/<batchCode>` | decoded exactly, byte-for-byte match | PASS |
| 36 | Batch code is unguessable | random, not sequential | `AYU-3C8FBFC7689D` (12 hex from `crypto.randomBytes`) | PASS |
| 37 | Health check | `200`, `db: connected` | `200 {"status":"ok","db":"connected"}` | PASS |
| 38 | Upload herb image (real JPEG) to IPFS | `201` + CID | `201`, `bafkreidiza…kdi`, 14500 bytes | PASS |
| 39 | Upload lab report (real PDF) to IPFS | `201` + CID | `201`, `bafkreidzjk…upm`, status `passed` | PASS |
| 40 | Generate QR and pin to IPFS | `201` + CID | `201`, `bafkreiezuk…shu` | PASS |
| 41 | Gateway URL actually retrievable | file downloads, byte-identical | `200`, 14500 bytes, byte-identical to the original | PASS |

## Post-fix run — magic-byte validation

Added after the finding in case 10. Server on port 5055, real Pinata account.

| # | Test case | Expected | Actual | Result |
|---|---|---|---|---|
| 42 | PDF bytes + `.jpg` name + `Content-Type: image/jpeg` | `400` | `400 "File content does not match its type"` | PASS |
| 43 | **Reverse**: JPEG bytes + `.pdf` name + `Content-Type: application/pdf` | `400` | `400 "File content does not match its type"` | PASS |
| 44 | PDF bytes + `.png` name + `Content-Type: image/png` | `400` | `400 "File content does not match its type"` | PASS |
| 45 | Regression: valid JPEG still uploads | `201` + CID | `201`, `bafkreidiza…kdi` | PASS |
| 46 | Regression: valid PNG still uploads | `201` + CID | `201`, `bafkreidzj5…nye` | PASS |
| 47 | Regression: valid WebP still uploads | `201` + CID | `201`, `bafkreih3sp…qqu` | PASS |
| 48 | Regression: valid PDF still uploads | `201` + CID | `201`, `bafkreidzjk…upm` | PASS |
| 49 | Unit: detector on real JPEG/PNG/WebP/PDF | correct type for each | all four detected correctly | PASS |
| 50 | Unit: plain text, empty buffer, truncated header | `null` | `null` for all three | PASS |
| 51 | Unit: `RIFF` container that is not WebP (AVI) | `null` | `null` — offset-8 check required | PASS |
| 52 | Rejected file never reaches IPFS | no pin created | check runs before `uploadFile`; no CID returned, nothing pinned | PASS |
| 53 | `/api/verify` shows real CIDs, not placeholders | 3 image CIDs + 1 report CID + `qrCid` | all present, all `bafkrei…` | PASS |
| 54 | `/api/verify` leak scan, post-fix | no email/phone/password/raw id | recursive key **and** value scan found none | PASS |

Gateway downloads were verified byte-for-byte against the originals for the JPEG
(14500 bytes), the PDF (193 bytes) and the QR PNG (3175 bytes), through both the
dedicated gateway and the public `gateway.pinata.cloud`. All six uploads were
confirmed present on the Pinata account through `GET /v3/files/public`.

## Resolved finding — case 10, magic-byte validation

**Status: fixed 2026-09-01.**

`src/middleware/upload.middleware.js` checked the client-supplied `Content-Type`
header and the filename extension and required them to agree, but never read the
file's bytes. Both signals are attacker-controlled, so a caller naming a file
`photo.jpg` and declaring `Content-Type: image/jpeg` could upload any content and
have it pinned to IPFS — where it is immutable and public.

The fix adds `src/utils/fileType.js`, which derives the real type from the leading
bytes:

```
image/jpeg       ff d8 ff
image/png        89 50 4e 47 0d 0a 1a 0a
image/webp       52 49 46 46 ("RIFF") at 0, plus 57 45 42 50 ("WEBP") at 8
application/pdf  25 50 44 46 ("%PDF")
```

`assertContentMatchesType` runs in `uploadController.saveUpload`, **before** the
IPFS call, so a mismatched file is rejected with
`400 "File content does not match its type"` and is never pinned. It lives in the
controller rather than the multer `fileFilter` because `fileFilter` runs before
the file body has been buffered into memory.

Verified by cases 42–52.

## Reproducing the file-upload cases

```bash
# 7 — oversized
head -c 6291456 /dev/urandom > big.jpg
curl -i -X POST http://localhost:5000/api/upload/herb-image \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -F "file=@big.jpg;type=image/jpeg"

# 8 — wrong mimetype
curl -i -X POST http://localhost:5000/api/upload/herb-image \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -F "file=@evil.exe;type=application/x-msdownload"

# 9 — extension mismatch
cp test.pdf disguised.jpg
curl -i -X POST http://localhost:5000/api/upload/herb-image \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -F "file=@disguised.jpg;type=application/pdf"

# 10/42 — magic-byte check: same file, declared as an image
curl -i -X POST http://localhost:5000/api/upload/herb-image \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  -F "file=@disguised.jpg;type=image/jpeg"
# expect 400 "File content does not match its type"

# 43 — reverse: a real JPEG declared as a PDF
curl -i -X POST http://localhost:5000/api/upload/lab-report \
  -H "Authorization: Bearer $LAB_TOKEN" \
  -F "file=@test.jpg;type=application/pdf" \
  --form-string "herbId=1"
# expect 400 "File content does not match its type"
```

## Reproducing the rate limit

```bash
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"nobody@test.com","password":"wrongpass"}'
done
# expect ten 401 responses, then 429
```

The limiter counts per IP. Restart the server to reset the window during testing.

## Reproducing the injection cases

```bash
# 11 — body
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'"'"' OR 1=1 --","password":"x"}'

# a payload that passes email validation still cannot inject,
# because pg sends it as a bound parameter:
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com'"'"'; DROP TABLE users; --","password":"x"}'
# expect 400 (invalid email). The users table is untouched either way.
```

Confirm afterwards that the tables still exist:

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM herbs;
```

## Checking that passwords never leave the API

```bash
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Farmer","email":"f1@test.com","password":"secret123","role":"farmer"}' \
  | grep -i password && echo "LEAK" || echo "clean"

curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"f1@test.com","password":"secret123"}' \
  | grep -i password && echo "LEAK" || echo "clean"

curl -s http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $FARMER_TOKEN" \
  | grep -i password && echo "LEAK" || echo "clean"
```

All three must print `clean`.

## Checking the public verify response

```bash
curl -s http://localhost:5000/api/verify/AYU-XXXXXXXXXXXX \
  | grep -Ei '"email"|"phone"|"password"|"id":' && echo "LEAK" || echo "clean"
```

Must print `clean`. `batchCode`, `cid` and names are expected in the output;
numeric ids and contact details are not.
