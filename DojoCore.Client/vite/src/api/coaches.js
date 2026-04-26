// ==============================|| COACHES API ||============================== //

async function handleResponse(response) {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || data.title || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function getCoaches() {
  const response = await fetch('/api/coaches', { credentials: 'include' });
  return handleResponse(response);
}

export async function createCoach(payload) {
  const response = await fetch('/api/coaches', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function updateCoach(id, payload) {
  const response = await fetch(`/api/coaches/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function deleteCoach(id) {
  const response = await fetch(`/api/coaches/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return handleResponse(response);
}
