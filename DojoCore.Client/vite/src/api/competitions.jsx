// ==============================|| COMPETITIONS API ||============================== //

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

/**
 * Imports an Excel file into the database.
 * @param {File} file - The .xls or .xlsx file to upload.
 * @param {string} title - User-provided grouping title.
 * @returns {Promise<{importId: string, rowsImported: number, categories: string[]}>}
 */
export async function importCompetition(file, title) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const response = await fetch('/api/competitions/import', {
    method: 'POST',
    credentials: 'include',
    body: formData
  });
  return handleResponse(response);
}

/**
 * Returns all competition imports (summary list).
 * @returns {Promise<Array>}
 */
export async function getCompetitionImports() {
  const response = await fetch('/api/competitions', { credentials: 'include' });
  return handleResponse(response);
}

/**
 * Returns the results for a specific import, including metadata.
 * @param {string} importId
 * @returns {Promise<{importId, title, tournament, results: Array}>}
 */
export async function getCompetitionResults(importId) {
  const response = await fetch(`/api/competitions/${encodeURIComponent(importId)}/results`, {
    credentials: 'include'
  });
  return handleResponse(response);
}

/**
 * Returns all athlete results across ALL imports, enriched with importTitle and tournament.
 * Used by the grouped list grid at /admin/competitions/list.
 * @returns {Promise<Array>}
 */
export async function getAllCompetitionResults() {
  const response = await fetch('/api/competitions/results', { credentials: 'include' });
  return handleResponse(response);
}

/**
 * Deletes a competition import and all its results.
 * @param {string} importId
 * @returns {Promise<null>}
 */
export async function deleteCompetitionImport(importId) {
  const response = await fetch(`/api/competitions/${encodeURIComponent(importId)}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  return handleResponse(response);
}
