# AyuChain Backend API — Member 4 Modules

Endpoints added by the IPFS / QR / Security module. For the auth, user, admin and
herb endpoints see the backend `README.md`.

Base URL (local): `http://localhost:5000`

Authenticated endpoints require:

```
Authorization: Bearer <JWT_TOKEN>
```

Roles are lowercase: `farmer`, `collector`, `laboratory`, `manufacturer`, `customer`, `admin`.

---

## Health

### GET /api/health

| | |
|---|---|
| Auth | No |
| Role | Public |
| Rate limit | 100 / 15 min |

Response `200`:

```json
{
  "status": "ok",
  "uptime": 132,
  "db": "connected"
}
```

Returns `503` with `"status": "degraded"` and `"db": "disconnected"` when the
database is unreachable. Used as the Render health check path.

---

## Upload (IPFS via Pinata)

### POST /api/upload/herb-image

| | |
|---|---|
| Auth | Yes |
| Role | `farmer` |
| Rate limit | 20 / 15 min |
| Content-Type | `multipart/form-data` |

Form data:

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | file | Yes | jpeg / png / webp, max 5 MB. Validated by magic bytes, not just the declared `Content-Type` |
| `herbId` | integer | No | Links the image to a herb so it appears in `/api/verify` |

Response `201`:

```json
{
  "message": "File uploaded to IPFS successfully",
  "upload": {
    "id": 1,
    "cid": "bafybeigd...",
    "url": "https://your-gateway.mypinata.cloud/ipfs/bafybeigd...",
    "size": 84213,
    "fileType": "herb_image",
    "herbId": 3,
    "status": null,
    "createdAt": "2026-09-01T10:12:44.221Z"
  }
}
```

Errors: `400` no file / oversized / wrong type / extension mismatch / content does
not match its declared type / invalid `herbId`, `401` no or invalid token,
`403` wrong role, `404` herb not found, `429` rate limit, `502` Pinata unavailable.

A file whose bytes do not match its declared `Content-Type` is rejected with
`400 {"message": "File content does not match its type"}` **before** anything is
sent to IPFS, so a mismatched file is never pinned.

### POST /api/upload/lab-report

| | |
|---|---|
| Auth | Yes |
| Role | `laboratory` |
| Rate limit | 20 / 15 min |
| Content-Type | `multipart/form-data` |

Form data:

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | file | Yes | PDF only, max 5 MB. Validated by magic bytes, not just the declared `Content-Type` |
| `herbId` | integer | No | Links the report to a herb |
| `status` | string | No | `pending` (default), `passed`, `failed` |

Response `201`: same shape as herb-image, with `"fileType": "lab_report"` and the
supplied `status`.

Errors: same set as herb-image, plus `400` for an invalid `status` value.

### GET /api/upload/:cid

| | |
|---|---|
| Auth | No |
| Role | Public |
| Rate limit | 20 / 15 min |

Looks the CID up in the `uploads` table and issues a `302` redirect to the
configured Pinata gateway URL. Only CIDs this backend uploaded resolve, so the
endpoint cannot be used as an open IPFS proxy.

Errors: `400` malformed CID, `404` CID not recorded, `429` rate limit.

---

## Batches and QR

### POST /api/qr/batches

Creates the manufacturer package record that a QR code is generated for.

| | |
|---|---|
| Auth | Yes |
| Role | `manufacturer`, `admin` |
| Content-Type | `application/json` |

Request:

```json
{
  "herbId": 3,
  "productName": "Ashwagandha Churna 100g",
  "quantity": "500 units"
}
```

Response `201`:

```json
{
  "message": "Batch created successfully",
  "batch": {
    "id": 1,
    "batch_code": "AYU-9F3C2A7B1D04",
    "herb_id": 3,
    "manufacturer_id": 7,
    "product_name": "Ashwagandha Churna 100g",
    "quantity": "500 units",
    "qr_cid": null,
    "blockchain_tx_hash": null,
    "created_at": "2026-09-01T10:20:03.114Z"
  }
}
```

`batch_code` is the public identifier used everywhere below as `:batchId`. The
internal numeric `id` is never exposed to customers.

Errors: `400` validation, `401`, `403`, `404` herb not found, `429`.

### POST /api/qr/generate/:batchId

Generates the QR PNG, pins it to IPFS, and saves the CID on the batch record.

| | |
|---|---|
| Auth | Yes |
| Role | `manufacturer`, `admin` |

The encoded value is `${FRONTEND_URL}/verify/${batchId}`.

Response `201`:

```json
{
  "message": "QR code generated successfully",
  "qr": {
    "batchCode": "AYU-9F3C2A7B1D04",
    "verifyUrl": "https://ayuchain.vercel.app/verify/AYU-9F3C2A7B1D04",
    "cid": "bafkreih...",
    "ipfsUrl": "https://your-gateway.mypinata.cloud/ipfs/bafkreih...",
    "dataUrl": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

Errors: `400` invalid batch code, `401`, `403`, `404` batch not found, `429`,
`502` Pinata unavailable.

### GET /api/qr/:batchId

Serves the QR code as a raw PNG image (`Content-Type: image/png`), regenerated
deterministically from the batch code. Safe to use directly as an `<img src>`.

| | |
|---|---|
| Auth | No |
| Role | Public |

Errors: `400` invalid batch code, `404` batch not found.

---

## Public verification

### GET /api/verify/:batchId

The customer-facing endpoint behind every QR scan. No authentication.

| | |
|---|---|
| Auth | No |
| Role | Public |
| Rate limit | 100 / 15 min |

Response `200`:

```json
{
  "verified": true,
  "batch": {
    "batchCode": "AYU-9F3C2A7B1D04",
    "productName": "Ashwagandha Churna 100g",
    "quantity": "500 units",
    "qrCid": "bafkreih...",
    "verifyUrl": "https://ayuchain.vercel.app/verify/AYU-9F3C2A7B1D04",
    "createdAt": "2026-09-01T10:20:03.114Z"
  },
  "herb": {
    "name": "Ashwagandha",
    "description": "Traditional Ayurvedic herb",
    "origin": "Rajasthan",
    "currentStatus": "ready",
    "registeredAt": "2026-08-28T06:41:10.000Z"
  },
  "farmer": { "name": "Ram Singh", "role": "farmer" },
  "manufacturer": { "name": "Herbal Works Pvt Ltd", "role": "manufacturer" },
  "images": [
    {
      "cid": "bafybeigd...",
      "url": "https://your-gateway.mypinata.cloud/ipfs/bafybeigd...",
      "uploadedAt": "2026-08-28T06:45:00.000Z"
    }
  ],
  "labReports": [
    {
      "cid": "bafybeic7...",
      "url": "https://your-gateway.mypinata.cloud/ipfs/bafybeic7...",
      "status": "passed",
      "uploadedAt": "2026-08-29T11:02:00.000Z"
    }
  ],
  "blockchain": {
    "network": "polygon-amoy",
    "txHash": null
  },
  "tracking": [
    {
      "status": "collected",
      "updatedByName": "Ram Singh",
      "updatedByRole": "farmer",
      "createdAt": "2026-08-28T07:00:00.000Z"
    }
  ]
}
```

`blockchain.txHash` stays `null` until the smart contract is deployed and
Member 1 supplies the transaction hash — the column and the response field
already exist so no client change is needed later.

**Fields deliberately excluded:** email, phone, password hash, and all internal
numeric ids (`users.id`, `herbs.id`, `batches.id`, `uploads.id`). Only names and
roles identify participants.

Errors: `400` invalid batch code format, `404` batch not found.

---

## Error codes

| Code | Meaning |
|---|---|
| `400` | Validation failed, bad file type, file too large, extension mismatch, file content does not match its declared type |
| `401` | Missing, malformed or expired JWT |
| `403` | Authenticated but the role is not permitted |
| `404` | Resource not found |
| `409` | Email already registered |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error (no stack trace in production) |
| `502` | Pinata / IPFS upstream failure |

Validation errors carry a field-level breakdown:

```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "herbId", "message": "herbId must be a positive integer" }
  ]
}
```
