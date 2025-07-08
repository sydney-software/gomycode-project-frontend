import { apiRequest } from './queryClient';

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

// Auth token management
class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user';

  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static getUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Enhanced API request with authentication
export async function authenticatedApiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const token = TokenManager.getAccessToken();
  
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle 401 unauthorized
  if (res.status === 401) {
    TokenManager.clearTokens();
    // Optionally redirect to login
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

// Auth API
export const authApi = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', data);
    const result = await response.json();
    
    // Store tokens and user data
    TokenManager.setAccessToken(result.accessToken);
    TokenManager.setRefreshToken(result.refreshToken);
    TokenManager.setUser(result.user);
    
    return result;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/register', data);
    const result = await response.json();
    
    // Store tokens and user data
    TokenManager.setAccessToken(result.accessToken);
    TokenManager.setRefreshToken(result.refreshToken);
    TokenManager.setUser(result.user);
    
    return result;
  },

  async logout(): Promise<void> {
    try {
      await authenticatedApiRequest('POST', '/api/auth/logout');
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      TokenManager.clearTokens();
    }
  },

  async getProfile(): Promise<User> {
    const response = await authenticatedApiRequest('GET', '/api/auth/profile');
    const result = await response.json();
    TokenManager.setUser(result.user);
    return result.user;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await authenticatedApiRequest('PUT', '/api/auth/profile', data);
    const result = await response.json();
    TokenManager.setUser(result.user);
    return result.user;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await authenticatedApiRequest('PUT', '/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  getCurrentUser(): User | null {
    return TokenManager.getUser();
  },

  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  },
};

// Products API
export const productsApi = {
  async getProducts(filters: Record<string, any> = {}): Promise<any[]> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`/api/products?${queryParams}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProduct(id: string): Promise<any> {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) throw new Error('Failed to fetch product');
    return response.json();
  },

  async getFeaturedProducts(): Promise<any[]> {
    const response = await fetch('/api/products/featured');
    if (!response.ok) throw new Error('Failed to fetch featured products');
    return response.json();
  },
};

// Orders API
export const ordersApi = {
  async createOrder(orderData: any): Promise<any> {
    const response = await authenticatedApiRequest('POST', '/api/orders', orderData);
    return response.json();
  },

  async getOrder(id: string): Promise<any> {
    const response = await authenticatedApiRequest('GET', `/api/orders/${id}`);
    return response.json();
  },

  async getUserOrders(): Promise<any[]> {
    const response = await authenticatedApiRequest('GET', '/api/orders/user/me');
    return response.json();
  },
};

// Categories and Brands API
export const catalogApi = {
  async getCategories(): Promise<any[]> {
    const response = await fetch('/api/categories');
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  async getBrands(): Promise<any[]> {
    const response = await fetch('/api/brands');
    if (!response.ok) throw new Error('Failed to fetch brands');
    return response.json();
  },
};

// Search API
export const searchApi = {
  async searchProducts(query: string, filters: Record<string, any> = {}): Promise<any> {
    const queryParams = new URLSearchParams({ q: query, ...filters });
    const response = await fetch(`/api/search/products?${queryParams}`);
    if (!response.ok) throw new Error('Failed to search products');
    return response.json();
  },

  async getSearchSuggestions(query: string): Promise<string[]> {
    const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to get suggestions');
    const result = await response.json();
    return result.suggestions;
  },

  async getTrendingProducts(): Promise<any[]> {
    const response = await fetch('/api/search/trending');
    if (!response.ok) throw new Error('Failed to get trending products');
    const result = await response.json();
    return result.products;
  },
};

// Reviews API
export const reviewsApi = {
  async getProductReviews(productId: string, page = 1, limit = 10): Promise<any> {
    const response = await fetch(`/api/reviews/product/${productId}?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  async createReview(reviewData: any): Promise<any> {
    const response = await authenticatedApiRequest('POST', '/api/reviews', reviewData);
    return response.json();
  },

  async updateReview(reviewId: string, reviewData: any): Promise<any> {
    const response = await authenticatedApiRequest('PUT', `/api/reviews/${reviewId}`, reviewData);
    return response.json();
  },

  async deleteReview(reviewId: string): Promise<void> {
    await authenticatedApiRequest('DELETE', `/api/reviews/${reviewId}`);
  },

  async getUserReviews(): Promise<any[]> {
    const response = await authenticatedApiRequest('GET', '/api/reviews/user/me');
    return response.json();
  },
};

// Wishlist API
export const wishlistApi = {
  async getWishlist(): Promise<any> {
    const response = await authenticatedApiRequest('GET', '/api/wishlist');
    return response.json();
  },

  async addToWishlist(productId: string): Promise<any> {
    const response = await authenticatedApiRequest('POST', '/api/wishlist/add', { productId });
    return response.json();
  },

  async removeFromWishlist(productId: string): Promise<any> {
    const response = await authenticatedApiRequest('DELETE', `/api/wishlist/remove/${productId}`);
    return response.json();
  },

  async clearWishlist(): Promise<any> {
    const response = await authenticatedApiRequest('DELETE', '/api/wishlist/clear');
    return response.json();
  },

  async checkInWishlist(productId: string): Promise<boolean> {
    const response = await authenticatedApiRequest('GET', `/api/wishlist/check/${productId}`);
    const result = await response.json();
    return result.inWishlist;
  },
};

export { TokenManager };
