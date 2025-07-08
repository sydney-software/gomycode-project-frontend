import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, LoginData, RegisterData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authApi.isAuthenticated()) {
          // Try to get current user profile
          const currentUser = await authApi.getProfile();
          setUser(currentUser);
        }
      } catch (error) {
        // If token is invalid, clear it
        authApi.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(data);
      setUser(response.user);
      toast({
        title: "Welcome back!",
        description: `Hello ${response.user.firstName}, you're now logged in.`,
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      setUser(response.user);
      toast({
        title: "Account created!",
        description: `Welcome ${response.user.firstName}! Your account has been created successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Logout error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      setUser(updatedUser);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (authApi.isAuthenticated()) {
        const currentUser = await authApi.getProfile();
        setUser(currentUser);
      }
    } catch (error) {
      // If refresh fails, logout
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="text-muted-foreground mb-4">Please log in to access this page.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
