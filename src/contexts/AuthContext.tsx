import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useToast } from '../components/ToastProvider';

export interface User {
  id: string;
  email: string;
  inn: string;
  org_name: string;
  status: string;
  registration_date: string;
  role: 'guest' | 'member';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient;
  signIn: (inn: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  checkInnExists: (inn: string) => Promise<{ exists: boolean; data?: any }>;
  guestRequestsToday: number;
  checkGuestLimit: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.warn('Supabase client initialization failed, using mock client');
  supabase = {} as SupabaseClient;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestRequestsToday, setGuestRequestsToday] = useState(0);
  const { showToast } = useToast();

  // Static reestr data for MVP
  const STATIC_REESTR: Record<string, any> = {
    '1234567890': {
      status: 'Активно',
      org_name: 'ООО "СтройКомпани"',
      registration_date: '15.03.2024'
    },
    '9876543210': {
      status: 'Активно',
      org_name: 'ЗАО "ГорТехстрой"',
      registration_date: '22.01.2024'
    },
    '5556667778': {
      status: 'Истекает',
      org_name: 'ООО "Архитектурное бюро"',
      registration_date: '10.08.2023'
    },
    '1112223334': {
      status: 'Приостановлено',
      org_name: 'ООО "МегаСтрой"',
      registration_date: '05.12.2023'
    },
    '444555666777': {
      status: 'Активно',
      org_name: 'ИП Иванов Иван Иванович',
      registration_date: '20.05.2024'
    }
  };

  // Load local reestr data
  const loadLocalReestr = async (): Promise<Record<string, any>> => {
    try {
      const response = await fetch('/local_reestr.txt');
      const text = await response.text();

      if (text && text.trim()) {
        const reestr: Record<string, any> = {};
        const lines = text.trim().split('\n');

        for (const line of lines) {
          const parts = line.split('\t');
          if (parts.length >= 4) {
            const [status, orgName, inn, regDate] = parts.map(s => s.trim());
            if (inn && orgName) {
              reestr[inn] = {
                status,
                org_name: orgName,
                registration_date: regDate
              };
            }
          }
        }
        return reestr;
      } else {
        throw new Error('Empty file');
      }
    } catch (error) {
      console.warn('Using static reestr data');
      return STATIC_REESTR;
    }
  };

  // Check if INN exists in local reestr
  const checkInnExists = async (inn: string): Promise<{ exists: boolean; data?: any }> => {
    // Try static data first (immediate availability)
    if (STATIC_REESTR[inn]) {
      console.log(`INN ${inn} found in static data:`, STATIC_REESTR[inn]);
      return {
        exists: true,
        data: {
          inn,
          ...STATIC_REESTR[inn],
          role: 'member'
        }
      };
    }

    // Fallback to file loading (if file exists and accessible)
    const reestr = await loadLocalReestr();

    if (reestr[inn]) {
      console.log(`INN ${inn} found in loaded reestr:`, reestr[inn]);
      return {
        exists: true,
        data: {
          inn,
          ...reestr[inn],
          role: 'member'
        }
      };
    }

    console.log(`INN ${inn} not found`);
    return { exists: false };
  };

  // Check guest request limits
  const checkGuestLimit = (): boolean => {
    const today = new Date().toDateString();
    const lastRequestDate = localStorage.getItem('sro_guest_last_request');
    const storedRequests = parseInt(localStorage.getItem('sro_guest_requests_today') || '0');

    if (lastRequestDate !== today) {
      // Reset counter for new day
      localStorage.setItem('sro_guest_last_request', today);
      localStorage.setItem('sro_guest_requests_today', '0');
      setGuestRequestsToday(0);
      return true;
    }

    return storedRequests < 3; // Allow 3 requests per day for guests
  };

  // Sign in function
  const signIn = async (inn: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Check guest request limits for non-members
      if (!user && !checkGuestLimit()) {
        showToast('warning', 'Лимит превышен', 'Превышен суточный лимит запросов для гостей (3 запроса). Войдите как член СРО для безлимитного доступа.');
        return { success: false, message: 'GUEST_LIMIT_EXCEEDED' };
      }

      // Increment guest request counter
      if (!user) {
        const currentRequests = parseInt(localStorage.getItem('sro_guest_requests_today') || '0');
        localStorage.setItem('sro_guest_requests_today', (currentRequests + 1).toString());
        setGuestRequestsToday(currentRequests + 1);
      }

      const innCheck = await checkInnExists(inn);

      if (!innCheck.exists) {
        showToast('error', 'ИНН не найден', 'Введенный ИНН не найден в реестре СРО');
        return { success: false, message: 'INN_NOT_FOUND' };
      }

      // Create guest user for MVP (when Supabase is not configured as a fallback)
      if (!supabaseUrl || !supabaseKey) {
        console.log('Using guest user authentication');
        const guestUser: User = {
          id: `guest-${Date.now()}`,
          email: `${inn}@guest.sro`,
          inn: innCheck.data.inn,
          org_name: innCheck.data.org_name,
          status: innCheck.data.status,
          registration_date: innCheck.data.registration_date,
          role: 'member' // In MVP, all valid INN users are treated as members
        };

        setUser(guestUser);
        localStorage.setItem('sro_guest_user', JSON.stringify(guestUser));

        showToast('success', 'Успешный вход', `Добро пожаловать, ${innCheck.data.org_name}`);
        return { success: true };
      }

      // Real Supabase authentication (only if we have a valid client)
      if (supabase.auth) {
        const tempEmail = `${inn}@sro.temp`;
        const tempPassword = inn; // Use INN as password for MVP

        try {
          // Try to sign up first
          const { data, error } = await supabase.auth.signUp({
            email: tempEmail,
            password: tempPassword,
            options: {
              data: {
                inn,
                org_name: innCheck.data.org_name,
                status: innCheck.data.status,
                registration_date: innCheck.data.registration_date
              }
            }
          });

          if (!error) {
            // New user created successfully
            if (data.user) {
              const userData: User = {
                id: data.user.id,
                email: data.user.email || '',
                inn: innCheck.data.inn,
                org_name: innCheck.data.org_name,
                status: innCheck.data.status,
                registration_date: innCheck.data.registration_date,
                role: 'member'
              };

              setUser(userData);
              showToast('success', 'Регистрация успешна', `Добро пожаловать, ${innCheck.data.org_name}!`);
              return { success: true };
            }
          } else if (error.message.includes('already registered')) {
            // User exists, try to sign in
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: tempEmail,
              password: tempPassword
            });

            if (!signInError && signInData.user) {
              const userData: User = {
                id: signInData.user.id,
                email: signInData.user.email || '',
                inn: innCheck.data.inn,
                org_name: innCheck.data.org_name,
                status: innCheck.data.status,
                registration_date: innCheck.data.registration_date,
                role: 'member'
              };

              setUser(userData);
              showToast('success', 'Успешный вход', `Добро пожаловать, ${innCheck.data.org_name}`);
              return { success: true };
            }
          }

          console.error('Authentication error:', error);
          showToast('error', 'Ошибка аутентификации', 'Не удалось выполнить вход');
          return { success: false, message: 'AUTH_FAILED' };

        } catch (error) {
          console.error('Supabase auth error:', error);
          showToast('error', 'Ошибка', 'Сервис аутентификации временно недоступен');
          return { success: false, message: 'SERVICE_UNAVAILABLE' };
        }

      } else {
        console.log('Supabase client not available, using mock authentication');
        // Fallback mock authentication
        const guestUser: User = {
          id: `guest-${Date.now()}`,
          email: `${inn}@guest.sro`,
          inn: innCheck.data.inn,
          org_name: innCheck.data.org_name,
          status: innCheck.data.status,
          registration_date: innCheck.data.registration_date,
          role: 'member'
        };

        setUser(guestUser);
        localStorage.setItem('sro_guest_user', JSON.stringify(guestUser));

        showToast('success', 'Успешный вход', `Добро пожаловать, ${innCheck.data.org_name}`);
        return { success: true };
      }

    } catch (error) {
      console.error('Sign in error:', error);
      showToast('error', 'Ошибка', 'Произошла непредвиденная ошибка');
      return { success: false, message: 'UNKNOWN_ERROR' };
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    try {
      if (supabase.auth) {
        await supabase.auth.signOut();
      }

      // Clear guest user data
      localStorage.removeItem('sro_guest_user');
      setUser(null);
      showToast('success', 'Выход выполнен', 'Вы успешно вышли из системы');
    } catch (error) {
      console.error('Sign out error:', error);
      showToast('error', 'Ошибка выхода', 'Не удалось выполнить выход');
    }
  };

  // Load user on app startup
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Load guest request count
        const today = new Date().toDateString();
        const lastRequestDate = localStorage.getItem('sro_guest_last_request');
        if (lastRequestDate === today) {
          const storedRequests = parseInt(localStorage.getItem('sro_guest_requests_today') || '0');
          setGuestRequestsToday(storedRequests);
        }

        // Check for guest user in localStorage
        const guestUserData = localStorage.getItem('sro_guest_user');
        if (guestUserData) {
          const guestUser = JSON.parse(guestUserData);
          setUser(guestUser);
          setLoading(false);
          return;
        }

        // DEVELOPMENT MODE: Auto-login for testing
        if (process.env.NODE_ENV === 'development') {
          const testUser: User = {
            id: 'test-user',
            email: 'test@sro.local',
            inn: '1234567890',
            org_name: 'АО Тестовая Организация',
            status: 'Активно',
            registration_date: new Date().toISOString().split('T')[0],
            role: 'member'
          };
          setUser(testUser);
          localStorage.setItem('sro_guest_user', JSON.stringify(testUser));
          setLoading(false);
          return;
        }

        // Check for real auth session
        if (supabase.auth) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              const userData: User = {
                id: session.user.id,
                email: session.user.email || '',
                inn: session.user.user_metadata?.inn || '',
                org_name: session.user.user_metadata?.org_name || 'Организация',
                status: session.user.user_metadata?.status || 'Активно',
                registration_date: session.user.user_metadata?.registration_date || '',
                role: 'member'
              };
              setUser(userData);
            }
          } catch (error) {
            console.error('Error getting session:', error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Listen for auth state changes
    if (supabase.auth) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state change:', event, session);

        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            inn: session.user.user_metadata?.inn || '',
            org_name: session.user.user_metadata?.org_name || 'Организация',
            status: session.user.user_metadata?.status || 'Активно',
            registration_date: session.user.user_metadata?.registration_date || '',
            role: 'member'
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    supabase,
    signIn,
    signOut,
    checkInnExists,
    guestRequestsToday,
    checkGuestLimit
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
