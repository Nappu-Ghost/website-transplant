// Token storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export const auth = {
  // Get the stored auth token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  // Set the auth token
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // Remove the auth token
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Get the stored user data
  getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Set the user data
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Remove the user data
  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  },

  // Clear all auth data
  clearAuth(): void {
    this.removeToken();
    this.removeUser();
  },

  // Get user role
  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  },

  // Check if user has specific role
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  },

  // Check if user has any of the specified roles
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }
};

export default auth;
