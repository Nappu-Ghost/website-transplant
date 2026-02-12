import auth from './auth';
import { createApiError } from './api-error';

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

    throw createApiError(errorMessage, response.status, structuredErrorDetail || errorData);
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
      } else {
        tokenToUse = auth.getToken();
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

  async getHotels(token?: string | null) { return this.request('/hotels/', {}, undefined, false, token); }
  async getHotelById(id: string, token?: string | null) { return this.request(`/hotels/${id}`, {}, undefined, false, token); }
  async createHotel(data: any, token?: string | null) { return this.request('/hotels/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateHotel(id: string, data: any, token?: string | null) { return this.request(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteHotel(id: string, token?: string | null) { return this.request(`/hotels/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getRooms(filters?: Record<string, any>, token?: string | null) {
    const queryParams = filters ? `?${new URLSearchParams(toSnakeCase(filters)).toString()}` : '';
    return this.request(`/rooms${queryParams}`, {}, undefined, false, token);
  }
  async getRoomById(id: string, token?: string | null) { return this.request(`/rooms/${id}`, {}, undefined, false, token); }
  async createRoom(data: any, token?: string | null) { return this.request('/rooms/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateRoom(id: string, data: any, token?: string | null) { return this.request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteRoom(id: string, token?: string | null) { return this.request(`/rooms/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getActivities(token?: string | null) { return this.request('/activities/', {}, undefined, false, token); }
  async getActivityById(id: string, token?: string | null) { return this.request(`/activities/${id}`, {}, undefined, false, token); }
  async createActivity(data: any, token?: string | null) { return this.request('/activities/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateActivity(id: string, data: any, token?: string | null) { return this.request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteActivity(id: string, token?: string | null) { return this.request(`/activities/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getBookings(filters?: Record<string, any>, token?: string | null) {
    const queryParams = filters ? `?${new URLSearchParams(toSnakeCase(filters)).toString()}` : '';
    return this.request(`/bookings${queryParams}`, {}, undefined, true, token);
  }
  async getBookingById(id: string, token?: string | null) { return this.request(`/bookings/${id}`, {}, undefined, true, token); }
  async getUserBookings(userId?: string, token?: string | null) {
    const queryParams = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
    return this.request(`/bookings/user${queryParams}`, {}, undefined, true, token);
  }
  async getUserPayments(token?: string | null) {
    return this.request('/payments/user', {}, undefined, true, token);
  }
  async createBooking(data: any, token?: string | null) { return this.request('/bookings/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateBooking(id: string, data: any, token?: string | null) { return this.request(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteBooking(id: string, token?: string | null) { return this.request(`/bookings/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getEvents(token?: string | null) { return this.request('/events/', {}, undefined, false, token); }
  async getEventById(id: string, token?: string | null) { return this.request(`/events/${id}`, {}, undefined, false, token); }
  async createEvent(data: any, token?: string | null) { return this.request('/events/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateEvent(id: string, data: any, token?: string | null) { return this.request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteEvent(id: string, token?: string | null) { return this.request(`/events/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getFerries(token?: string | null) { return this.request('/ferries/', {}, undefined, false, token); }
  async getFerryById(id: string, token?: string | null) { return this.request(`/ferries/${id}`, {}, undefined, false, token); }
  async createFerry(data: any, token?: string | null) { return this.request('/ferries/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateFerry(id: string, data: any, token?: string | null) { return this.request(`/ferries/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteFerry(id: string, token?: string | null) { return this.request(`/ferries/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getFerrySchedules(filters?: Record<string, any>, token?: string | null) {
    const queryParams = filters ? `?${new URLSearchParams(toSnakeCase(filters)).toString()}` : '';
    return this.request(`/ferry-schedules${queryParams}`, {}, undefined, false, token);
  }
  async getFerryScheduleById(id: string, token?: string | null) { return this.request(`/ferry-schedules/${id}`, {}, undefined, false, token); }
  async createFerrySchedule(data: any, token?: string | null) { return this.request('/ferry-schedules/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async updateFerrySchedule(id: string, data: any, token?: string | null) { return this.request(`/ferry-schedules/${id}`, { method: 'PUT', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
  async deleteFerrySchedule(id: string, token?: string | null) { return this.request(`/ferry-schedules/${id}`, { method: 'DELETE' }, undefined, true, token); }

  async getFerryTicket(bookingId: string, token?: string | null) {
    return this.request(`/ferry-tickets?booking_id=${encodeURIComponent(bookingId)}`, {}, undefined, true, token);
  }
  async createFerryTicket(data: any, token?: string | null) { return this.request('/ferry-tickets/', { method: 'POST', body: JSON.stringify(toSnakeCase(data)) }, 'application/json', true, token); }
}

export const api = new ApiClient();
export default api;