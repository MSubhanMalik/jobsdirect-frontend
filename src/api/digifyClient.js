const ACCESS_TOKEN_KEY = 'jd_access';

const getApiBase = () => import.meta.env.VITE_API_URL || process.env.VITE_API_URL || '';

const getAccessToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY); 
};

const setAccessToken = (token) => {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

let isRefreshing = false;
let pendingRequests = [];

function onTokenRefreshed(newToken) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...(options.headers || {}),
  };

  // Don't set Content-Type for raw body (webhook)
  if (!options.rawBody) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
    credentials: 'include', // Send cookies for refresh token
  });

  // Check for new access token from silent refresh
  const newAccessToken = response.headers.get('X-New-Access-Token');
  if (newAccessToken) {
    setAccessToken(newAccessToken);
  }

  if (response.status === 401 && !options._isRetry) {
    // Try silent refresh
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${getApiBase()}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const refreshedToken = refreshData.data?.accessToken || refreshData.accessToken;
          if (refreshedToken) {
            setAccessToken(refreshedToken);
            onTokenRefreshed(refreshedToken);
            isRefreshing = false;
            // Retry original request
            return apiFetch(path, { ...options, _isRetry: true });
          }
        }

        // Refresh failed — clear token
        setAccessToken(null);
        isRefreshing = false;
        onTokenRefreshed(null);
      } catch {
        setAccessToken(null);
        isRefreshing = false;
        onTokenRefreshed(null);
      }
    } else {
      // Queue this request until refresh completes
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (newToken) {
            resolve(apiFetch(path, { ...options, _isRetry: true }));
          } else {
            reject(new Error('Authentication required'));
          }
        });
      });
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.code = data.error || data.code;
    Object.assign(error, data);
    throw error;
  }

  return data;
}

function unwrapData(response) {
  // The new router wraps responses in { data, message, status, success }
  return response?.data !== undefined ? response.data : response;
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  const unwrapped = unwrapData(data);
  if (Array.isArray(unwrapped)) return unwrapped;
  return [];
}

const auth = {
  async isAuthenticated() {
    const token = getAccessToken();
    if (!token) {
      // Try refresh via cookie
      try {
        const response = await fetch(`${getApiBase()}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          const newToken = data.data?.accessToken || data.accessToken;
          if (newToken) {
            setAccessToken(newToken);
            return true;
          }
        }
      } catch {}
      return false;
    }
    try {
      await apiFetch('/api/auth/user-info');
      return true;
    } catch {
      return false;
    }
  },

  async me() {
    const data = await apiFetch('/api/auth/user-info');
    return unwrapData(data);
  },

  async login({ email, password }) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const result = unwrapData(data);
    if (result.accessToken) {
      setAccessToken(result.accessToken);
    }
    return result;
  },

  async googleAuth(credential) {
    const data = await apiFetch('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    const result = unwrapData(data);
    if (result.accessToken) {
      setAccessToken(result.accessToken);
    }
    return result;
  },

  async register({ firstName, lastName, email, password, role }) {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password, role }),
    });
    const result = unwrapData(data);
    if (result.accessToken) {
      setAccessToken(result.accessToken);
    }
    return result;
  },

  async verifyEmail({ token }) {
    const data = await apiFetch('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    const result = unwrapData(data);
    if (result.accessToken) {
      setAccessToken(result.accessToken);
    }
    return result.user;
  },

  async resendVerification() {
    const data = await apiFetch('/api/auth/resend-verification', {
      method: 'POST',
    });
    return unwrapData(data);
  },

  async forgotPassword({ email }) {
    const data = await apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return unwrapData(data);
  },

  async resetPassword({ token, password }) {
    const data = await apiFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
    return unwrapData(data);
  },

  async logout(redirectTo = '/') {
    try {
      await apiFetch('/api/auth/logout');
    } catch {}
    setAccessToken(null);
    if (typeof window !== 'undefined' && redirectTo) {
      window.location.assign(redirectTo);
    }
  },

  redirectToLogin(returnTo) {
    if (typeof window === 'undefined') return;
    const target = `/auth${returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : ''}`;
    window.location.assign(target);
  },
};

const createResourceApi = (basePath) => ({
  async list(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.set(key, String(value));
    });
    const qs = params.toString();
    const data = await apiFetch(`/api/${basePath}${qs ? `?${qs}` : ''}`);
    return normalizeList(data);
  },
  async filter(filters = {}, order, limit) {
    const query = { ...filters };
    if (order) query.order = order;
    if (typeof limit === 'number') query.limit = String(limit);
    return this.list(query);
  },
  async getById(id) {
    const data = await apiFetch(`/api/${basePath}/${id}`);
    return unwrapData(data);
  },
  async create(payload = {}) {
    const data = await apiFetch(`/api/${basePath}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return unwrapData(data);
  },
  async update(id, updates = {}) {
    const data = await apiFetch(`/api/${basePath}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return unwrapData(data);
  },
  async remove(id) {
    const data = await apiFetch(`/api/${basePath}/${id}`, {
      method: 'DELETE',
    });
    return unwrapData(data);
  },
});

const admin = {
  async listUsers() {
    const data = await apiFetch('/api/admin/users');
    return normalizeList(data);
  },
  async createUser(payload = {}) {
    const data = await apiFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return unwrapData(data);
  },
  async updateUser(id, updates = {}) {
    const data = await apiFetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return unwrapData(data);
  },
  async deleteUser(id) {
    const data = await apiFetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
    return unwrapData(data);
  },
};

const payments = {
  async listPlans() {
    const data = await apiFetch('/api/payments/plans');
    return normalizeList(data);
  },
  async list(query = {}) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.set(key, String(value));
    });
    const qs = params.toString();
    const data = await apiFetch(`/api/payments${qs ? `?${qs}` : ''}`);
    return normalizeList(data);
  },
  async createCheckoutSession(payload = {}) {
    const data = await apiFetch('/api/payments/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return unwrapData(data);
  },
  async syncCheckoutSession(sessionId) {
    const data = await apiFetch('/api/payments/sync-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    return unwrapData(data);
  },
  async createPortalSession(payload = {}) {
    const data = await apiFetch('/api/payments/portal', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return unwrapData(data);
  },
  async getPricing() {
    const data = await apiFetch('/api/payments/pricing');
    return unwrapData(data);
  },
  async getBalance(employerId) {
    const qs = employerId ? `?employerId=${employerId}` : '';
    const data = await apiFetch(`/api/payments/balance${qs}`);
    return unwrapData(data);
  },
};

const settings = {
  async getSiteSettings() {
    const data = await apiFetch('/api/settings/site');
    return unwrapData(data);
  },
  async updateSiteSettings(updates) {
    const data = await apiFetch('/api/settings/site', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return unwrapData(data);
  },
  async listPages() {
    const data = await apiFetch('/api/settings/pages');
    return normalizeList(data);
  },
  async getPage(slug) {
    const data = await apiFetch(`/api/settings/pages/${slug}`);
    return unwrapData(data);
  },
  async upsertPage(slug, content) {
    const data = await apiFetch(`/api/settings/pages/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    });
    return unwrapData(data);
  },
  async removePage(slug) {
    const data = await apiFetch(`/api/settings/pages/${slug}`, {
      method: 'DELETE',
    });
    return unwrapData(data);
  },
};

const functions = {
  async invoke(name, payload = {}) {
    if (name === 'scrapeJobsIreland') {
      const data = await apiFetch('/api/jobs/scrape/jobsireland', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return { data: { data: unwrapData(data) } };
    }
    throw new Error(`Unknown function: ${name}`);
  },
};

export const digify = {
  auth,
  admin,
  payments,
  settings,
  entities: {
    Job: {
      ...createResourceApi('jobs'),
      async duplicate(id) {
        const data = await apiFetch(`/api/jobs/${id}/duplicate`, { method: 'POST' });
        return unwrapData(data);
      },
      async costEstimate(payload) {
        const data = await apiFetch('/api/jobs/cost-estimate', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return unwrapData(data);
      },
    },
    Employer: createResourceApi('employers'),
    Employee: createResourceApi('employees'),
    Application: createResourceApi('applications'),
    ContactMessage: createResourceApi('contact'),
    Payment: { list: payments.list, filter: payments.list },
    SiteSetting: {
      async list() { return [await settings.getSiteSettings()]; },
      async filter() { return [await settings.getSiteSettings()]; },
      async update(id, updates) { return settings.updateSiteSettings(updates); },
    },
    PageContent: createResourceApi('settings/pages'),
  },
  functions,
  utils: {
    reset() {
      setAccessToken(null);
    },
    readSession() {
      const token = getAccessToken();
      return token ? { token } : null;
    },
  },
};
