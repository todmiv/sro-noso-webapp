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

  // Static reestr data for TESTING (embedded directly for reliability)
  const TESTING_REESTR: Record<string, any> = {
    '5258098350': {
      status: 'Член СРО',
      org_name: 'ООО СТК «Грейт»',
      registration_date: '30.08.2022'
    },
    '5249116108': {
      status: 'Член СРО',
      org_name: 'ООО СК «СтройМакс»',
      registration_date: '22.12.2016'
    },
    '5249004549': {
      status: 'Член СРО',
      org_name: 'ПК «Ремстроймонтаж»',
      registration_date: '30.03.2017'
    },
    '5260344281': {
      status: 'Член СРО',
      org_name: 'ООО СМП «СтальМонтаж»',
      registration_date: '09.11.2016'
    },
    '524501693705': {
      status: 'Член СРО',
      org_name: 'Полетаев А.В.',
      registration_date: '02.12.2021'
    }
  };

  // Check if INN exists (TESTING CLEAN PARSING MODE)
  const checkInnExists = async (inn: string): Promise<{ exists: boolean; data?: any }> => {
    console.log(`🔍 === STARTING PARSING TEST for INN: ${inn} ===`);

    // STEP 1: Always try real parsing FIRST
    console.log('🏄‍♂️ STEP 1: Attempting real Supabase parsing...');
    console.log('📡 Calling: /api/functions/v1/reestr-parser (proxied to Supabase)');
    console.log('📨 Request data:', { inn });

    try {
      const startTime = Date.now();
      // Get JWT token from Supabase session for authorization
      let jwt: string | undefined;
      try {
        if (supabase.auth) {
          const { data: { session } } = await supabase.auth.getSession();
          jwt = session?.access_token;
        }
      } catch (error) {
        console.warn('Failed to get Supabase session:', error);
      }

      const authHeader = jwt ? `Bearer ${jwt}` : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
      console.log('🔐 Using Auth Header:', jwt ? '[JWT from session]' : '[Anon key fallback]');

      const response = await fetch(`/api/functions/v1/reestr-parser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({ inn })
      });
      const timeTaken = Date.now() - startTime;

      console.log('📡 RESPONSE in', timeTaken, 'ms');
      console.log('📡 Supabase response status:', response.status);

      if (!response.ok) {
        console.log('❌ Supabase returned error status, trying to get error text...');
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Supabase response data:', data);

      if (data && data.success && data.result) {
        const result = data.result;
        console.log('💡 Parsing result found?', result.found);

        if (result.found) {
          console.log('✅ SUCCESS: INN found via real parsing:', result);
          return {
            exists: true,
            data: {
              inn,
              org_name: result.name || '',
              status: result.status || 'Член СРО',
              registration_date: result.registrationDate || '',
              role: 'member'
            }
          };
        } else {
          console.log('❌ INN confirmed NOT found in real reestr');
        }
      } else {
        console.log('🚨 Response format unexpected - checking fallback');
      }
    } catch (error) {
      console.error('🚨 Real parser ERROR:', error instanceof Error ? error.message : String(error));
      console.log('🔄 Moving to local fallback...');
    }

    console.log('📚 STEP 2: Checking local testing reestr...');
    if (TESTING_REESTR[inn]) {
      console.log(`📚 FOUND: INN ${inn} in local testing reestr:`, TESTING_REESTR[inn]);
      return {
        exists: true,
        data: {
          inn,
          org_name: TESTING_REESTR[inn].org_name,
          status: TESTING_REESTR[inn].status,
          registration_date: TESTING_REESTR[inn].registration_date,
          role: 'member'
        }
      };
    }
    console.log(`❌ NOT found in local testing reestr`);

    console.log('💾 STEP 3: Checking static data...');
    if (STATIC_REESTR[inn]) {
      console.log(`💾 FOUND: INN ${inn} in static data:`, STATIC_REESTR[inn]);
      return {
        exists: true,
        data: {
          inn,
          ...STATIC_REESTR[inn],
          role: 'member'
        }
      };
    }
    console.log(`❌ NOT found in static data`);

    console.log(`🚫 === FINAL RESULT: INN ${inn} not found anywhere ===`);

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

  return storedRequests < 1000; // Allow 1000 requests per day for guests (testing)
  };

  // Sign in function
  const signIn = async (inn: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Check guest request limits for non-members
      if (!user && !checkGuestLimit()) {
        showToast('warning', 'Лимит превышен', 'Превышен суточный лимит запросов для гостей (1000 запроса). Войдите как член СРО для безлимитного доступа.');
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

        // For TESTING: disable user persistence on app restart
        // Uncomment the line below to enable user persistence
        // const guestUserData = localStorage.getItem('sro_guest_user');
        // if (guestUserData) {
        //   const guestUser = JSON.parse(guestUserData);
        //   setUser(guestUser);
        //   setLoading(false);
        //   return;
        // }

        // DEVELOPMENT MODE: Auto-login disabled for testing
        // if (process.env.NODE_ENV === 'development') {
        //   const testUser: User = {
        //     id: 'test-user',
        //     email: 'test@sro.local',
        //     inn: '1234567890',
        //     org_name: 'АО Тестовая Организация',
        //     status: 'Активно',
        //     registration_date: new Date().toISOString().split('T')[0],
        //     role: 'member'
        //   };
        //   setUser(testUser);
        //   localStorage.setItem('sro_guest_user', JSON.stringify(testUser));
        //   setLoading(false);
        //   return;
        // }

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
