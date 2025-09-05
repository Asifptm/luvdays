import config from '../config/environment';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  connected_accounts: any[];
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at?: string;
}

export interface Session {
  id: string;
  auth_token: string;
  expires_at: string;
  platform: string;
  login_method: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface LoginRequest {
  identifier: string; // email or username
}

export interface RegisterRequest {
  email: string;
  username: string;
  name: string;
  connected_accounts?: any[];
}

class AuthService {
  private static instance: AuthService;
  private baseURL = config.auth.baseUrl;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Check if user exists
  async checkUserExists(identifier: string): Promise<{ exists: boolean; user?: User }> {
    try {
      const response = await fetch(`${this.baseURL}/check-exists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          exists: data.data.exists,
          user: data.data.user
        };
      } else {
        throw new Error(data.message || 'Failed to check user');
      }
    } catch (error) {
      console.error('Check user exists error:', error);
      throw error;
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('Attempting registration with data:', userData);
      
      const response = await fetch(`${this.baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Registration response:', data);
      
      if (data.status === 'success') {
        // Store auth token and user data
        localStorage.setItem('auth_token', data.data.session.auth_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        console.log('Registration successful, session saved');
        console.log('Auth token:', data.data.session.auth_token);
        console.log('User data:', data.data.user);
        
        return data.data;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  async login(identifier: string): Promise<AuthResponse> {
    try {
      console.log('Attempting login with identifier:', identifier);
      
      const response = await fetch(`${this.baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.status === 'success') {
        // Store auth token and user data
        localStorage.setItem('auth_token', data.data.session.auth_token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        console.log('Session saved successfully');
        console.log('Auth token:', data.data.session.auth_token);
        console.log('User data:', data.data.user);
        
        return data.data;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data.user;
      } else {
        throw new Error(data.message || 'Failed to get profile');
      }
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data.user;
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (token) {
        console.log('Logging out user with token');
        await fetch(`${this.baseURL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('Server logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      this.clearLocalData();
      console.log('User logged out successfully');
    }
  }

  // Get auth token from localStorage
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const user = this.getCurrentUser();
    const isAuth = !!(token && user);
    
    console.log('Authentication check:');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    console.log('Is authenticated:', isAuth);
    
    return isAuth;
  }

  // Refresh session
  async refreshSession(): Promise<Session> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${this.baseURL}/refresh-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Update stored auth token
        localStorage.setItem('auth_token', data.data.session.auth_token);
        return data.data.session;
      } else {
        throw new Error(data.message || 'Failed to refresh session');
      }
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  }

  // Validate session with server
  async validateSession(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.log('No token found for session validation');
        return false;
      }

      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Session validation successful');
        return true;
      } else {
        console.log('Session validation failed, clearing local data');
        this.clearLocalData();
        return false;
      }
    } catch (error) {
      console.error('Session validation error:', error);
      this.clearLocalData();
      return false;
    }
  }

  // Clear local authentication data
  private clearLocalData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    console.log('Local authentication data cleared');
  }
}

export default AuthService.getInstance();
