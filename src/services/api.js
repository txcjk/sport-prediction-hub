import {
  todayMatches,
  backtestHistory,
  capitalCurve,
} from '../data/mockData';

async function apiCall(endpoint, mockDataFn, options = {}) {
  const mockMode = import.meta.env.VITE_API_MOCK === 'true';

  if (mockMode) {
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 500));
    return mockDataFn();
  }

  const baseUrl = import.meta.env.VITE_API_URL;
  const timeout = options.timeout || 10000;
  const retries = options.retries || 2;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: options.method || 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...(options.body ? { body: JSON.stringify(options.body) } : {}),
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timer);

      if (attempt === retries) {
        throw err;
      }

      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
}

export const api = {
  async healthCheck() {
    return apiCall('/api/health', () => ({ status: 'ok' }));
  },

  async triggerExtract() {
    return apiCall(
      '/api/extract',
      () => ({
        job_id: `mock-extract-${Date.now()}`,
        status: 'started',
      }),
      {
        method: 'POST',
        body: { mode: 'manual' },
      }
    );
  },

  async triggerRetrain() {
    return apiCall(
      '/api/retrain',
      () => ({
        job_id: `mock-train-${Date.now()}`,
        status: 'started',
      }),
      {
        method: 'POST',
        body: { mode: 'full' },
      }
    );
  },

  async getPredictions() {
    return apiCall('/api/predictions', () => todayMatches);
  },

  async getBacktest(season, championship) {
    return apiCall(
      `/api/backtest?season=${encodeURIComponent(season)}&championship=${encodeURIComponent(championship)}`,
      () => ({
        history: backtestHistory,
        capital: capitalCurve,
      })
    );
  },
};
