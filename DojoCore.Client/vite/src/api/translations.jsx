// ==============================|| TRANSLATIONS API ||============================== //

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
 * Returns a flat key/value map for a given language and page.
 * Used as the i18next-http-backend loadPath endpoint.
 */
export async function getTranslationMap(language, page) {
  const response = await fetch(`/api/translations/${encodeURIComponent(language)}/${encodeURIComponent(page)}`, {
    credentials: 'include'
  });
  return handleResponse(response);
}

/**
 * Returns an array of all distinct language codes available in the database.
 */
export async function getLanguages() {
  const response = await fetch('/api/translations/languages', { credentials: 'include' });
  return handleResponse(response);
}

/**
 * Bulk upserts an array of translation rows.
 * @param {Array<{language, page, key, value}>} rows
 */
export async function bulkUpsertTranslations(rows) {
  const response = await fetch('/api/translations/bulk', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows)
  });
  return handleResponse(response);
}

/**
 * Returns a paginated list of all translation rows with optional filtering.
 * @param {object} params - { page, pageSize, language, page: translationPage, key }
 */
export async function getTranslations({ page = 1, pageSize = 25, language = '', translationPage = '', key = '' } = {}) {
  const params = new URLSearchParams();
  params.set('pageNumber', page);
  params.set('pageSize', pageSize);
  if (language) params.set('language', language);
  if (translationPage) params.set('page', translationPage);
  if (key) params.set('key', key);

  const response = await fetch(`/api/translations?${params.toString()}`, { credentials: 'include' });
  return handleResponse(response);
}

/**
 * Upserts a single translation row identified by language, page and key.
 */
export async function upsertTranslation(language, page, key, value) {
  const response = await fetch(
    `/api/translations/${encodeURIComponent(language)}/${encodeURIComponent(page)}/${encodeURIComponent(key)}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    }
  );
  return handleResponse(response);
}

/**
 * Deletes a single translation row identified by language, page and key.
 */
export async function deleteTranslation(language, page, key) {
  const response = await fetch(
    `/api/translations/${encodeURIComponent(language)}/${encodeURIComponent(page)}/${encodeURIComponent(key)}`,
    {
      method: 'DELETE',
      credentials: 'include'
    }
  );
  return handleResponse(response);
}
