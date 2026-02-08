const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorData: any;
    let errorMessage = `HTTP error! status: ${response.status}`;
    let structuredErrorDetail = null;

    try {
      errorData = await response.json();
      if (errorData) {
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map((err: any) => {
              const loc = err.loc && Array.isArray(err.loc) ? err.loc.join('.') : 'unknown_location';
              return `Field '${loc}' - ${err.msg}`;
            })
            .join('; ') || "Validation error";
          structuredErrorDetail = errorData.detail;
        } else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
          structuredErrorDetail = errorData;
        } else if (typeof errorData.error === 'string') {
          errorMessage = errorData.error;
          structuredErrorDetail = errorData;
        } else if (typeof errorData.message === 'string') {
          errorMessage = errorData.message;
          structuredErrorDetail = errorData;
        } else if (response.statusText) {
          errorMessage = response.statusText;
        }
        else if (typeof errorData === 'object' && Object.keys(errorData).length > 0 && !Array.isArray(errorData.detail) && !errorData.detail && !errorData.error && !errorData.message) {
          structuredErrorDetail = errorData;
        }
      }
    } catch (e) {
      if (response.statusText) {
        errorMessage = response.statusText;
      }
    }

    const error = new Error(errorMessage) as any;
    error.status = response.status;
    error.detail = structuredErrorDetail || errorData;
    throw error;
  }

  if (response.status === 204) return null;

  try {
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (e) {
    console.warn("API response was not valid JSON or empty, returning null", e);
    return null;
  }
}


function getHeaders(token: string | null | undefined, contentType?: string) {
  const headers: Record<string, string> = { 'Accept': 'application/json' };
  if (contentType) headers['Content-Type'] = contentType;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(item => toCamelCase(item));
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z0-9])/g, g => g[1].toUpperCase());
    acc[camelKey] = toCamelCase(obj[key]);
    return acc;
  }, {} as any);
}
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(item => toSnakeCase(item));
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    acc[snakeKey] = toSnakeCase(obj[key]);
    return acc;
  }, {} as any);
}

export class ApiClient {
  private baseUrl: string;
  constructor(baseUrl = API_BASE_URL) { this.baseUrl = baseUrl; }

  private async request(
    endpoint: string, options: RequestInit = {}, requestContentType?: string,
    requiresAuthToken: boolean = true, explicitToken?: string | null
  ) {
    let tokenToUse: string | null = null;
    if (requiresAuthToken) {
      if (explicitToken !== undefined && explicitToken !== null) {
        tokenToUse = explicitToken;
      } else if (typeof window !== 'undefined') {
        tokenToUse = localStorage.getItem('token');
      }
    }
    const url = `${this.baseUrl}${endpoint}`;
    const actualContentType = options.body ? (requestContentType || 'application/json') : undefined;
    const headers = getHeaders(tokenToUse, actualContentType);

    if ((options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') && options.body) {
      console.log(`ApiClient: Making ${options.method || 'POST/PUT/PATCH'} request to ${url} with body:`, options.body);
    } else if (options.method === 'GET' || options.method === 'DELETE') {
      console.log(`ApiClient: Making ${options.method} request to ${url}`);
    }

    const response = await fetch(url, { ...options, headers: headers });
    const data = await handleResponse(response);

    return data !== null ? toCamelCase(data) : null;
  }

  async login(email: string, password: string): Promise<{ accessToken: string, tokenType: string }> {
    const details = { 'username': email, 'password': password };
    const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key as keyof typeof details])).join('&');
    return this.request('/token', { method: 'POST', body: formBody }, 'application/x-www-form-urlencoded', false);
  }

  async register(userData: any) {
    const payloadToBackend = { ...userData, role: 'CUSTOMER', status: 'ACTIVE' };
    return this.request('/users/', { method: 'POST', body: JSON.stringify(toSnakeCase(payloadToBackend)) }, 'application/json', false);
  }

  async getCurrentUser(token?: string | null) {
    return this.request('/users/me', {}, undefined, true, token);
  }

  async getAppointments(filters?: Record<string, any>, token?: string | null) {
    const queryParams = filters ? `?${new URLSearchParams(toSnakeCase(filters)).toString()}` : '';
    return this.request(`/appointments${queryParams}`, {}, undefined, true, token);
  }
  async getAppointmentByRef(bookingReference: string, token?: string | null) {
    return this.request(`/appointments/${bookingReference}`, {}, undefined, true, token);
  }
  async createAppointment(data: any, token?: string | null) {
    return this.request('/appointments/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token);
  }
  async updateAppointment(bookingReference: string, data: any, token?: string | null) {
    return this.request(`/appointments/${bookingReference}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token);
  }
  async deleteAppointment(bookingReference: string, token?: string | null) {
    return this.request(`/appointments/${bookingReference}`, { method: 'DELETE' }, undefined, true, token);
  }

  async getClinics(token?: string | null) { return this.request('/clinics/', {}, undefined, false, token); }
  async getClinicById(id: string, token?: string | null) { return this.request(`/clinics/${id}`, {}, undefined, false, token); }
  async createClinic(data: any, token?: string | null) { return this.request('/clinics/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateClinic(id: string, data: any, token?: string | null) { return this.request(`/clinics/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteClinic(id: string, token?: string | null) { return this.request(`/clinics/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getServices(token?: string | null) { return this.request('/services/', {}, undefined, false, token); }
  async getServiceById(id: string, token?: string | null) { return this.request(`/services/${id}`, {}, undefined, false, token); }
  async createService(data: any, token?: string | null) { return this.request('/services/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateService(id: string, data: any, token?: string | null) { return this.request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteService(id: string, token?: string | null) { return this.request(`/services/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getDoctors(filters?: Record<string, any>, token?: string | null) {
    const queryParams = filters ? `?${new URLSearchParams(toSnakeCase(filters)).toString()}` : '';
    return this.request(`/doctors${queryParams}`, {}, undefined, false, token);
  }
  async getDoctorById(id: string, token?: string | null) {
    return this.request(`/doctors/${id}`, {}, undefined, false, token);
  }
  async createDoctor(data: any, token?: string | null) { return this.request('/doctors/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateDoctor(id: string, data: any, token?: string | null) { return this.request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteDoctor(id: string, token?: string | null) { return this.request(`/doctors/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getUsers(filters?: Record<string, any>, token?: string | null) {
    const queryParams = filters ? `?${new URLSearchParams(toSnakeCase(filters)).toString()}` : '';
    return this.request(`/users${queryParams}`, {}, undefined, true, token);
  }
  async getUserById(id: string, token?: string | null) { return this.request(`/users/${id}`, {}, undefined, true, token); }
  async createUser(data: any, token?: string | null) {
    return this.request('/users/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token);
  }
  async updateUser(id: string, data: any, token?: string | null) { return this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteUser(id: string, token?: string | null) { return this.request(`/users/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getShifts(filters?: Record<string, any>, token?: string | null) {
    const queryParams = filters ? `?${new URLSearchParams(toSnakeCase(filters)).toString()}` : '';
    return this.request(`/shifts${queryParams}`, {}, undefined, true, token);
  }
  async createShift(data: any, token?: string | null) {
    return this.request('/shifts/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token);
  }
  async updateShift(id: string, data: any, token?: string | null) {
    return this.request(`/shifts/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token);
  }
  async deleteShift(id: string, token?: string | null) {
    return this.request(`/shifts/${id}`, { method: 'DELETE' }, undefined, true, token);
  }

  async getSurgeryBookings(filters?: Record<string, any>, token?: string | null) {
    const queryParams = filters ? `?${new URLSearchParams(toSnakeCase(filters)).toString()}` : '';
    return this.request(`/surgery-bookings${queryParams}`, {}, undefined, true, token);
  }
  async createSurgeryBooking(data: any, token?: string | null) {
    return this.request('/surgery-bookings/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token);
  }
  async updateSurgeryBooking(id: string, data: any, token?: string | null) {
    return this.request(`/surgery-bookings/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token);
  }
  async deleteSurgeryBooking(id: string, token?: string | null) {
    return this.request(`/surgery-bookings/${id}`, { method: 'DELETE' }, undefined, true, token);
  }
}

export const api = new ApiClient();
export default api;