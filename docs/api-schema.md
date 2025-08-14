# Phoenix Project - API Schema

This document defines the REST API for the Phoenix application. It serves as the contract between the frontend and the backend.

---

## Authentication

-   **Base URL:** `/api/auth`
-   Authentication is handled via JWT (JSON Web Tokens). The token is returned on login/register and must be sent in the `Authorization: Bearer <token>` header for all protected endpoints.

### `POST /api/auth/register`
-   **Description:** Registers a new user.
-   **Body:** `{ "email": "user@example.com", "password": "strongpassword123" }`
-   **Response (201):** `{ "token": "jwt.token.string", "user": { "id": "...", "email": "..." } }`

### `POST /api/auth/login`
-   **Description:** Authenticates a user and returns a JWT.
-   **Body:** `{ "email": "user@example.com", "password": "strongpassword123" }`
-   **Response (200):** `{ "token": "jwt.token.string", "user": { "id": "...", "email": "..." } }`

---

## Assets

-   **Base URL:** `/api/assets`
-   **Protection:** All endpoints require authentication.

### `GET /api/assets`
-   **Description:** Retrieves all assets for the authenticated user.
-   **Response (200):** `[ { "id": "...", "name": "My Bitcoin Wallet", "type": "DIGITAL", ... } ]`

### `POST /api/assets`
-   **Description:** Creates a new asset.
-   **Body:** `{ "name": "Family Home", "type": "REAL_ESTATE", "description": "...", "value": 500000 }`
-   **Response (201):** `{ "id": "...", "name": "Family Home", ... }`

### `PUT /api/assets/{assetId}`
-   **Description:** Updates an existing asset.
-   **Body:** `{ "name": "Updated Asset Name", ... }`
-   **Response (200):** `{ "id": "...", "name": "Updated Asset Name", ... }`

### `DELETE /api/assets/{assetId}`
-   **Description:** Deletes an asset.
-   **Response (204):** No content.

---

## Documents

-   **Base URL:** `/api/documents`
-   **Protection:** All endpoints require authentication.

### `POST /api/documents/upload`
-   **Description:** Uploads a new document. This is a multipart/form-data request. The backend should return a signed URL for the client to upload the file directly to cloud storage (e.g., S3).
-   **Body (form-data):** `file: (the file blob)`
-   **Response (201):** `{ "documentId": "...", "uploadUrl": "https://s3.signed.url/..." }`
-   **Note:** After the client uploads the file, it should notify the backend to confirm the upload is complete.

### `GET /api/documents`
-   **Description:** Retrieves metadata for all of the user's documents.
-   **Response (200 ):** `[ { "id": "...", "filename": "will.pdf", "classification": "Last Will", ... } ]`

---

## AI Service (Premium)

-   **Base URL:** `/api/ai`
-   **Protection:** Requires authentication and a "premium" subscription plan.

### `POST /api/ai/process-document`
-   **Description:** Triggers AI processing (OCR and classification) for a document that has been uploaded.
-   **Body:** `{ "documentId": "..." }`
-   **Response (202):** Accepted. `{ "message": "Document processing started. Results will be available shortly." }` (Processing is asynchronous).

### `POST /api/ai/generate-story`
-   **Description:** Generates an emotional story for an asset or a time capsule.
-   **Body:** `{ "prompt": "This is my grandfather's watch. He was a pilot in the war." }`
-   **Response (200):** `{ "story": "This is not just a timepiece; it's a legacy of courage..." }`
