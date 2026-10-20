import {
  AnalysisResult,
  URLInspection,
  DashboardSummary,
  TrendPoint,
  Scenario,
  ScenarioAttemptResult,
  PatternGraphData,
  User
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('scamsense_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getSessionId(): string {
  let sid = localStorage.getItem('scamsense_session_id');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 12);
    localStorage.setItem('scamsense_session_id', sid);
  }
  return sid;
}

export const api = {
  // --- Health ---
  async checkHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  // --- Analyzer ---
  async getPresetSamples() {
    const res = await fetch(`${API_BASE_URL}/analyze/samples`);
    return res.json();
  },

  async analyzeContent(payload: {
    content: string;
    analysis_type?: string;
    suspicious_url?: string;
    consent_store?: boolean;
  }): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        ...payload,
        session_id: getSessionId(),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
      throw new Error(err.detail || 'Analysis request failed');
    }
    return res.json();
  },

  // --- URL Inspector ---
  async getSampleUrls() {
    const res = await fetch(`${API_BASE_URL}/inspect-url/samples`);
    return res.json();
  },

  async inspectUrl(payload: {
    url: string;
    consent_store?: boolean;
  }): Promise<URLInspection> {
    const res = await fetch(`${API_BASE_URL}/inspect-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        ...payload,
        session_id: getSessionId(),
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'URL Inspection failed' }));
      throw new Error(err.detail || 'URL Inspection failed');
    }
    return res.json();
  },

  // --- Dashboard ---
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load dashboard metrics');
    return res.json();
  },

  async getDashboardTrends(): Promise<TrendPoint[]> {
    const res = await fetch(`${API_BASE_URL}/dashboard/trends`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load dashboard trends');
    return res.json();
  },

  // --- Reports & History ---
  async getReports(params: {
    assessment?: string;
    analysis_type?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const query = new URLSearchParams();
    if (params.assessment) query.append('assessment', params.assessment);
    if (params.analysis_type) query.append('analysis_type', params.analysis_type);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    query.append('session_id', getSessionId());

    const res = await fetch(`${API_BASE_URL}/reports?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch reports');
    return res.json();
  },

  async getReportDetail(id: number): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch report detail');
    return res.json();
  },

  async deleteReport(id: number) {
    const res = await fetch(`${API_BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete report');
    return res.json();
  },

  async clearAllReports() {
    const query = new URLSearchParams({ session_id: getSessionId() });
    const res = await fetch(`${API_BASE_URL}/reports?${query.toString()}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to clear reports');
    return res.json();
  },

  getExportUrl(format: 'json' | 'csv'): string {
    const token = localStorage.getItem('scamsense_token');
    const sid = getSessionId();
    return `${API_BASE_URL}/reports/export?format=${format}&session_id=${sid}`;
  },

  // --- Simulator ---
  async getScenarios(category?: string): Promise<Scenario[]> {
    const url = category && category !== 'all'
      ? `${API_BASE_URL}/simulator/scenarios?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/simulator/scenarios`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch simulator scenarios');
    return res.json();
  },

  async submitScenarioAttempt(
    scenarioId: string,
    selectedOptionId: string
  ): Promise<ScenarioAttemptResult> {
    const res = await fetch(`${API_BASE_URL}/simulator/scenarios/${scenarioId}/attempt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({
        selected_option_id: selectedOptionId,
        session_id: getSessionId(),
      }),
    });
    if (!res.ok) throw new Error('Failed to submit scenario attempt');
    return res.json();
  },

  async getSimulatorProgress() {
    const res = await fetch(`${API_BASE_URL}/simulator/progress?session_id=${getSessionId()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch simulator progress');
    return res.json();
  },

  // --- Pattern Explorer ---
  async getPatternGraph(category?: string, search?: string): Promise<PatternGraphData> {
    const query = new URLSearchParams();
    if (category && category !== 'all') query.append('category', category);
    if (search) query.append('search', search);

    const res = await fetch(`${API_BASE_URL}/patterns/graph?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch pattern graph data');
    return res.json();
  },

  // --- Safety Center ---
  async getSafetyResources(category?: string) {
    const url = category && category !== 'all'
      ? `${API_BASE_URL}/safety/resources?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/safety/resources`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch safety resources');
    return res.json();
  },

  // --- Auth ---
  async register(data: { email: string; password: string; full_name?: string; consent_store_content?: boolean }) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Invalid email or password');
    }
    return res.json();
  },

  async getProfile(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  async updateSettings(data: { full_name?: string; consent_store_content?: boolean }) {
    const res = await fetch(`${API_BASE_URL}/auth/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  async purgeUserData() {
    const res = await fetch(`${API_BASE_URL}/auth/data`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to purge user data');
    return res.json();
  },
};
