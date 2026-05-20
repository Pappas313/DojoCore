// ==============================|| MENU MANAGE API ||============================== //

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

export async function getMenuItems() {
  const response = await fetch('/api/menu', { credentials: 'include' });
  return handleResponse(response);
}

export async function createMenuItem(payload) {
  const response = await fetch('/api/menu', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function updateMenuItem(id, payload) {
  const response = await fetch(`/api/menu/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return handleResponse(response);
}

export async function deleteMenuItem(id) {
  const response = await fetch(`/api/menu/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return handleResponse(response);
}
