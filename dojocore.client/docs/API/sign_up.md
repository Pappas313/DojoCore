### 2. Save as: `docs/api/sign_up.md`

```markdown
# Authentication API: Sign-Up (Role-Based)

## `POST /api/auth/register`

Registers a new user. Because registration can include file uploads (Certificates, IDs), this endpoint must accept `multipart/form-data`. 

**Global Backend Execution Rules:**
1. **Status:** All created entities (`users`, `gyms`, `user_gym`, `documents`) MUST be created with `status: 0` (Pending).
2. **Password:** Must be hashed before inserting into `password_hash`.
3. **Transactions:** The entire creation flow (User -> Gym -> User_Gym -> Documents) must be wrapped in a database transaction. If document upload fails, the user creation must rollback.

---

### Implementation Note for .NET Developer
The request will be sent as `multipart/form-data`. The JSON payload should be stringified and sent in a field named `payload`, while files are sent as standard form files.

---

### Request Payload Structures (The `payload` field)

#### Scenario 1: Athlete - Member (Joining existing gym)
**Condition:** `role === 3` and joining a gym.
```json
{
  "user": {
    "username": "athlete_john",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "user_code": "gfgfgfhfgh",
    "role": 3,
    "address": "123 Athens St",
    "gender": 1,
    "dateOfBirth": "1990-01-01"
  },
  "gymAction": "join", // Enum: "join", "create", "none"
  "gymCode": "GYM-X7B9Q", // Used to lookup gym_id to populate user_gym table
  "newGym": null
}
```
*Note: No files attached in this scenario.*

#### Scenario 2: Athlete - Freelancer
**Condition:** `role === 3` and acting as freelancer.
```json
{
  "user": {
    "username": "athlete_jane",
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "role": 3,
    "address": "456 Sparta Ave",
    "gender": 0,
    "dateOfBirth": "1992-05-15"
  },
  "gymAction": "none",
  "gymCode": null,
  "newGym": null
}
```
*Attached Form Data:* `files` array containing medical/freelancer documents (Populates `documents` table, linked to new `user_id`).

#### Scenario 3: Coach or Manager - Join Existing Gym
**Condition:** `role === 1` OR `role === 2`, joining existing gym.
```json
{
  "user": {
    "username": "coach_mike",
    "email": "mike@example.com",
    "password": "SecurePassword123!",
    "role": 1, // 1 for Coach, 2 for Manager
    "address": "789 Crete Blvd",
    "gender": 1,
    "dateOfBirth": "1985-11-20"
  },
  "gymAction": "join",
  "gymCode": "GYM-X7B9Q",
  "newGym": null
}
```
*Attached Form Data:* `files` array containing certifications (optional).

#### Scenario 4: Coach or Manager - Create New Gym
**Condition:** `role === 1` OR `role === 2`, creating a new gym.
```json
{
  "user": {
    "username": "manager_anna",
    "email": "anna@example.com",
    "password": "SecurePassword123!",
    "role": 2, 
    "address": "101 Rhodes St",
    "gender": 0,
    "dateOfBirth": "1988-08-08"
  },
  "gymAction": "create",
  "gymCode": null,
  "newGym": {
    "name": "Elite Taekwondo Academy",
    "address": "101 Rhodes St",
    "latitude": 37.9838, // Optional based on frontend capability
    "longitude": 23.7275
  }
}
```
*Attached Form Data:* `files` array containing business registration/certifications.
*Backend Action:* 
1. Create `users` (status: 0).
2. Create `gyms` (status: 0, created_by: new user_id, generate unique `gym_code`).
3. Create `user_gym` (status: 0, linking user and new gym).
4. Save files to `documents` (status: 0, linked to user_id and gym_id).

---

### Responses

#### `201 Created`
Successfully registered. Returns the user claims (same format as login).
```json
{
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "username": "manager_anna",
    "email": "anna@example.com",
    "role": 2,
    "status": 0
  },
  "message": "Registration successful. Your account is pending administrator approval."
}
```

#### `400 Bad Request` (Validation Errors)
```json
{
  "error": "ValidationError",
  "message": "Invalid registration data.",
  "details": {
    "email": ["Email is already in use."],
    "gymCode": ["Gym code 'GYM-X7B9Q' does not exist."]
  }
}
```

#### `500 Internal Server Error` (Database Transaction Failure)
```json
{
  "error": "TransactionFailed",
  "message": "An error occurred while saving documents. Registration rolled back."
}
```