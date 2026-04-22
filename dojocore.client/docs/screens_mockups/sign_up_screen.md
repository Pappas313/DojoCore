# Sign-Up Screen Architecture (Role-Based)

## Overview
The Sign-Up screen is a dynamic, role-based form. The UI components rendered depend entirely on the user's initial role selection. This architecture ensures strict mapping to the underlying `.NET` PostgreSQL database schemas (`users`, `gyms`, `user_gym`, and `documents`).

**Theme:** MUI v5 (Berry Theme) - Dark Mode.
**i18n:** English (en) and Greek (el) namespaces required.

---

## 1. Initial State: Role Selection
Before displaying the full form, the user must select their intended role via a Dropdown/Select component.

**Field:** `role` (Maps to `users.role` SMALLINT)
**Available Options in UI:**
*   **Athlete (Αθλητής)** -> Value: `3`
*   **Manager (Παράγοντας)** -> Value: `2`
*   **Coach (Προπονητής)** -> Value: `1`

*(Note: Admin `0` and Super-Admin are excluded from public registration and are injected manually via DB/Superadmin panel).*

---

## 2. Common Base Fields
Regardless of the role selected, the following core fields map directly to the `users` table and are always required:

*   `username` (Text Input)
*   `email` (Email Input)
*   `password` (Password Input with visibility toggle - maps to `password_hash` on backend)
*   `address` (Text Input)

---

## 3. Role-Specific Conditional Flows

### A. Athlete (Αθλητής) Flow
When `role === 3` (Athlete), render the base fields plus a **Toggle Switch** for membership status:

*   **Toggle:** Member (Μέλος) vs. Freelancer (Ελεύθερος)
    *   **If Member:** 
        *   Display Text Input: `gym_code` (Κωδικός Γυμναστηρίου).
        *   *Backend Action:* System will use this code to create a record in the `user_gym` table linking the athlete to the specific gym.
    *   **If Freelancer:**
        *   Display File Upload Dropzone (for medical/certification documents).
        *   *Backend Action:* Files are uploaded and logged in the `documents` table, linked to the `user_id`.

### B. Manager (Παράγοντας) Flow
When `role === 2` (Manager), render the base fields plus **Radio Buttons** for gym association:

*   **Radio Buttons:** Belong to a Gym (Ανήκω σε γυμναστήριο) vs. Create New (Δημιουργία καινούργιου)
    *   **If "Belong to a Gym":**
        *   Display Text Input: `gym_code` (Κωδικός Γυμναστηρίου).
        *   *Backend Action:* Link user to existing gym in `user_gym` table.
    *   **If "Create New":**
        *   Append the **Gym Creation Form** (Maps to `gyms` table schema):
            *   `gym_name` (Text Input)
            *   `gym_address` (Text Input)
            *   *(Optional)* Coordinates integration for `latitude`/`longitude`.
        *   Append **File Upload Dropzone** (for gym registration documents / manager IDs).
        *   *Backend Action:* Create new `gyms` record (with `created_by` = new user id), link via `user_gym`, and upload files to `documents`.

### C. Coach (Προπονητής) Flow
When `role === 1` (Coach), the flow is logically identical to the Manager flow. Render the base fields plus **Radio Buttons**:

*   **Radio Buttons:** Belong to a Gym (Ανήκω σε γυμναστήριο) vs. Create New (Δημιουργία καινούργιου)
    *   **If "Belong to a Gym":**
        *   Display Text Input: `gym_code` (Κωδικός Γυμναστηρίου).
    *   **If "Create New":**
        *   Append the **Gym Creation Form** (Name, Address).
        *   Append **File Upload Dropzone** (for coach certifications / gym docs).

---

## 4. Administrator Roles (Out of Scope for UI)
*   **Admin (`role: 0`) & Super-Admin:** 
    *   No sign-up screen.
    *   Accounts are created manually via direct database insertion or by a Super-Admin from within the authenticated Refine CRM dashboard.

---

## 5. API Data Payload Expectations (For .NET Dev)

The frontend will construct a dynamic JSON payload based on the selected flow. 

**Example Payload for Coach creating a new Gym:**
```json
{
  "user": {
    "username": "coach_john",
    "email": "john@example.com",
    "password": "SecurePassword123",
    "role": 1,
    "address": "123 Athens St"
  },
  "gymData": {
    "isCreatingNew": true,
    "gymCode": null,
    "newGym": {
      "name": "Elite Taekwondo",
      "address": "456 Sparta Ave"
    }
  },
  "documents": [
    /* Array of base64 strings or FormData depending on Axios implementation */
  ]
}