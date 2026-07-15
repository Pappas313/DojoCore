// ==============================|| DASHBOARD API ||============================== //

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

export async function getDashboardStats() {
  const response = await fetch('/api/dashboard/stats', { credentials: 'include' });
  return handleResponse(response);
}
