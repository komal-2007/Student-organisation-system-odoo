const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

async function request(endpoint, options = {}) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}${endpoint}`, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.text().then((text) => (text ? JSON.parse(text) : null));
}

export async function fetchPublicEvents() {
  const { publicEvents } = await import('../dashboards/public/data/publicMockData.js');
  return publicEvents;
}

export async function fetchMerchandise() {
  const { merchandise } = await import('../dashboards/public/data/publicMockData.js');
  return merchandise;
}

export async function pingApi() {
  return request('/health');
}

export default {
  fetchPublicEvents,
  fetchMerchandise,
  pingApi,
};
