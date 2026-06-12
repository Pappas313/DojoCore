// ==============================|| MAP API ||============================== //

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

export async function getAllMapPins() {
  const response = await fetch('/api/map/pins', { credentials: 'include' });
  return handleResponse(response);
}

export async function getAthleteMapPins() {
  const response = await fetch('/api/map/athletes', { credentials: 'include' });
  return handleResponse(response);
}

export async function getCoachMapPins() {
  const response = await fetch('/api/map/coaches', { credentials: 'include' });
  return handleResponse(response);
}

export async function getManagerMapPins() {
  const response = await fetch('/api/map/managers', { credentials: 'include' });
  return handleResponse(response);
}
