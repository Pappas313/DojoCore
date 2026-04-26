// ==============================|| AUTH API ||============================== //

async function handleResponse(response) {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || data.title || message;
    } catch {
      // ignore JSON parse errors on error body
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function loginApi({ identifier, password }) {
  const form = new FormData();
  form.append('identifier', identifier);
  form.append('password', password);
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    body: form
  });
  return handleResponse(response);
}

export async function logoutApi() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  return handleResponse(response);
}

/**
 * payload shape:
 * {
 *   user: { username, email, password, user_code?, role, address?, gender, dateOfBirth },
 *   gymAction: 'none' | 'join' | 'create',
 *   gymCode: string | null,
 *   newGym: { name, address } | null
 * }
 */
export async function registerApi(payload, files = {}) {
  const hasFiles = (files.athleteDocuments?.length > 0) || (files.gymDocuments?.length > 0);

  if (hasFiles) {
    const form = new FormData();
    form.append('data', JSON.stringify(payload));
    (files.athleteDocuments || []).forEach((f) => form.append('athleteDocuments', f));
    (files.gymDocuments || []).forEach((f) => form.append('gymDocuments', f));
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      body: form
    });
    return handleResponse(response);
  }

  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}
