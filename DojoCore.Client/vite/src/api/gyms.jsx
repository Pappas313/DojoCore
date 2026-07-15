// ==============================|| GYMS API ||============================== //

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

export async function getGyms() {
  const response = await fetch('/api/gyms', { credentials: 'include' });
  return handleResponse(response);
}

export async function getMyMembers() {
  const response = await fetch('/api/gyms/mine/members', { credentials: 'include' });
  return handleResponse(response);
}

export async function createGym(payload) {
  const response = await fetch('/api/gyms', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function updateGym(id, payload) {
  const response = await fetch(`/api/gyms/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function deleteGym(id) {
  const response = await fetch(`/api/gyms/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return handleResponse(response);
}
