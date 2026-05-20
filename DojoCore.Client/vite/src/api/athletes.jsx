// ==============================|| ATHLETES API ||============================== //

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

export async function getAthletes() {
  const response = await fetch('/api/athletes', { credentials: 'include' });
  return handleResponse(response);
}

export async function createAthlete(payload) {
  const response = await fetch('/api/athletes', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function updateAthlete(id, payload) {
  const response = await fetch(`/api/athletes/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function deleteAthlete(id) {
  const response = await fetch(`/api/athletes/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return handleResponse(response);
}
