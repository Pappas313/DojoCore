Here are the two markdown files detailing the API contracts. You can provide these directly to your .NET developer. They act as the blueprint for building the Swagger/OpenAPI specifications. 

I have included specific architectural notes to ensure the backend strictly respects the `status: 0` (pending) rule and handles the relational mapping to `users`, `gyms`, `user_gym`, and `documents` tables correctly.

***

### 1. Save as: `docs/api/sign_in.md`

```markdown
# Authentication API: Sign-In

## `POST /api/auth/login`

Authenticates a user using their credentials. 

**Important Business Logic:** 
Users with `status: 0` (Pending) *can* successfully authenticate, but the frontend will use the returned `status` claim to restrict their access to a "Waiting for Admin Approval" screen via Refine's Access Control logic.

### Request

**Headers:**
* `Content-Type: application/json`

**Body:**
```json
{
  "identifier": "info@codedthemes.com", // Can be email OR username
  "password": "SecurePassword123!"
}
```

### Responses

#### `200 OK` (Successful Login)
**Headers:**
* `Set-Cookie: accessToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict` *(Recommended for security, alternatively return token in body)*

**Body:**
```json
{
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "username": "info_user",
    "email": "info@codedthemes.com",
    "role": 2,          // 0=admin, 1=coach, 2=manager, 3=athlete
    "status": 0         // 0=pending, 1=approved, 2=inprogress, 3=rejected
  },
  "message": "Authentication successful."
}
```

#### `401 Unauthorized`
```json
{
  "error": "InvalidCredentials",
  "message": "Invalid username/email or password."
}
```

#### `403 Forbidden` (Optional: If you prefer blocking login entirely for pending users)
```json
{
  "error": "AccountPending",
  "message": "Your account is pending administrator approval."
}
```

