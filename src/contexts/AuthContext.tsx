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
  dataSource?: 'website' | 'local';
}

export interface LocalRegistryEntry {
  status: string;
  org_name: string;
  registration_date: string;
}

export type LocalRegistry = Record<string, LocalRegistryEntry>;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient;
  signIn: (inn: string) => Promise<{ success: boolean; message?: string; showRetryButtons?: boolean }>;
  signOut: () => Promise<void>;
  checkInnExists: (inn: string) => Promise<{ exists: boolean; data?: any; dataSource?: 'website' | 'local' | null }>;
  testParser: (inn: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  guestRequestsToday: number;
  checkGuestLimit: () => boolean;
  verificationStatus: {
    isChecking: boolean;
    currentStep: string;
    dataSource: 'website' | 'local' | null;
  };
  loginError: {
    message: string;
    showRetryButtons: boolean;
  } | null;
  clearLoginError: () => void;
  setLoginError: (error: { message: string; showRetryButtons: boolean } | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auto-detect local vs production environment
const isLocalhost = typeof window !== 'undefined' && window.location.hostname.includes('localhost');
const supabaseUrl = isLocalhost
  ? import.meta.env.VITE_SUPABASE_URL_LOCAL || 'http://127.0.0.1:54321'
  : import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = isLocalhost
  ? import.meta.env.VITE_SUPABASE_ANON_KEY_LOCAL || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  : import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔧 Supabase environment:', isLocalhost ? 'LOCAL' : 'PROD');
console.log('🔗 Supabase URL:', supabaseUrl);

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
  const [loginError, setLoginError] = useState<{ message: string; showRetryButtons: boolean } | null>(null);
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

  // No static data - use live parsing only

  // State for local registry
  const [localRegistry, setLocalRegistry] = useState<LocalRegistry>({});
  const [registryLoaded, setRegistryLoaded] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    isChecking: false,
    currentStep: '',
    dataSource: null as 'website' | 'local' | null,
  });

  // Load local registry from JSON file
  // TODO: REF v1.2 - Remove reestr.json loading functionality
  // const loadLocalRegistry = async (): Promise<string> => {
  //   try {
  //     const response = await fetch(`${window.location.origin}/reestr.json`);
  //     if (!response.ok) {
  //       throw new Error(`Failed to load registry: ${response.status}`);
  //     }
  //     const data: LocalRegistry = await response.json();
  //     console.log('✅ Local registry loaded successfully');
  //     setLocalRegistry(data);
  //     setRegistryLoaded(true);
  //     return 'Registry loaded successfully';
  //   } catch (error) {
  //     console.error('❌ Failed to load local registry:', error);
  //     return `Error loading registry: ${error instanceof Error ? error.message : String(error)}`;
  //   }
  // };
  const loadLocalRegistry = async (): Promise<string> => {
    // TODO: REF v1.2 - Remove local registry loading entirely
    console.log('✅ Local registry loading disabled');
    setRegistryLoaded(true);
    return 'Registry loading disabled';
  };

  // Update local registry entry
  const updateLocalRegistry = (inn: string, data: LocalRegistryEntry): void => {
    const updatedRegistry = {
      ...localRegistry,
      [inn]: data
    };
    setLocalRegistry(updatedRegistry);
    console.log(`📝 Local registry updated for INN ${inn}:`, data);
  };

  // Check if INN exists with integrated local registry
  const checkInnExists = async (inn: string): Promise<{ exists: boolean; data?: any; dataSource?: 'website' | 'local' | null }> => {
    console.log(`🔍 === CHECKING INN: ${inn} ===`);

    let siteData = null;
    let siteAvailable = false;
    let dataSource: 'website' | 'local' | null = null;

    // STEP 1: Try to get data from site (Supabase function)
    setVerificationStatus({ isChecking: true, currentStep: 'Проверка на сайте реестра СРО НОСО...', dataSource: 'website' });
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second for first step

    console.log('🌐 STEP 1: Attempting to get data from site...');

    try {
      const startTime = Date.now();
      let jwt: string | undefined;
      try {
        if (supabase.auth) {
          const { data: { session } } = await supabase.auth.getSession();
          jwt = session?.access_token;
        }
      } catch (error) {
        console.warn('Failed to get Supabase session:', error);
      }

      // Try with Supabase anon key from environment
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Skip auth completely for localhost testing
      if (!window.location.hostname.includes('localhost')) {
        headers['Authorization'] = `Bearer ${supabaseKey}`;
      }
      // No header for localhost to bypass Supabase auth

      // For local development, use direct Supabase URL
      const parserUrl = window.location.hostname.includes('localhost')
        ? 'http://127.0.0.1:54321/functions/v1/reestr-parser'
        : `${supabaseUrl}/functions/v1/reestr-parser`;

      const response = await fetch(parserUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inn })
      });
      const timeTaken = Date.now() - startTime;

      console.log('📡 Site response in', timeTaken, 'ms, status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Site response data:', data);

        if (data && data.success && data.result) {
          const result = data.result;
          siteAvailable = true;

          if (result.found) {
            // Проверяем корректность данных парсера
            console.log('🔍 Checking parser data validity:');
            console.log('- name:', result.name);
            console.log('- status:', result.status);
            console.log('- registrationDate:', result.registrationDate);

            const isValidData =
              result.name &&
              !result.name.includes('Краткое наименование') &&
              !result.name.includes('-ошибка') &&
              !result.registrationDate?.includes('Исключен') &&
              result.status && // Status must exist and can be any value
              result.registrationDate !== result.status;

            console.log('📋 Validation results:');
            console.log('- Has name:', !!result.name);
            console.log('- No "Краткое наименование":', !result.name?.includes('Краткое наименование'));
            console.log('- No "-ошибка":', !result.name?.includes('-ошибка'));
            console.log('- Registration date != "Исключен":', !result.registrationDate?.includes('Исключен'));
            console.log('- Status != "Член СРО":', !result.status?.includes('Член СРО'));
            console.log('- Registration date != Status:', result.registrationDate !== result.status);
            console.log('- Overall valid:', isValidData);

            if (isValidData) {
              siteData = {
                inn,
                org_name: result.name || '',
                status: result.status || 'Член СРО',
                registration_date: result.registrationDate || ''
              };
              console.log('✅ Valid data found on site:', siteData);
              // STEP 2: Check and update local registry
              await syncWithLocalRegistry(inn, siteData);
            } else {
              console.log('⚠️ Parser returned invalid data, using local registry instead');
              siteAvailable = false; // Принудительно отключаем использование сайта
            }
          } else {
            console.log('❌ Not found on site');
          }
        }
      } else {
        console.log('❌ Site returned error status:', response.status);
      }
    } catch (error) {
      console.error('🚨 Site request failed:', error instanceof Error ? error.message : String(error));
      siteAvailable = false;
    }

    // STEP 3: Use local registry if site data not found or site unavailable
    if (siteAvailable && siteData) {
      console.log('🚀 Using fresh site data');
      return {
        exists: true,
        data: { ...siteData, role: 'member' },
        dataSource: 'website' as const
      };
    }

    // Check local registry
    // TODO: REF v1.2 - Remove local registry fallback functionality
    setVerificationStatus({ isChecking: true, currentStep: 'Проверка локального реестра отключена...', dataSource: 'local' });
    await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds for registry sync delay

    console.log('🏠 STEP 3: Local registry check disabled');
    // if (registryLoaded && localRegistry[inn]) {
    //   const localData = localRegistry[inn];
    //   console.log('✅ Found in local registry:', localData);
    //   return {
    //     exists: true,
    //     data: { inn, ...localData, role: 'member' },
    //     dataSource: 'local' as const
    //   };
    // }

    console.log(`❌ INN ${inn} not found anywhere`);
    setVerificationStatus({ isChecking: false, currentStep: '', dataSource: null });
    return {
      exists: false,
      dataSource: null
    };
  };

  // Sync site data with local registry
  // TODO: REF v1.2 - Remove registry sync functionality entirely
  // const syncWithLocalRegistry = async (inn: string, siteData: any): Promise<void> => {
  //   if (!registryLoaded) {
  //     console.log('⚠️ Local registry not loaded yet');
  //     return;
  //   }

  //   const localEntry = localRegistry[inn];
  //   const siteEntry = {
  //     status: siteData.status,
  //     org_name: siteData.org_name,
  //     registration_date: siteData.registration_date
  //   };

  //   if (!localEntry) {
  //     // Add to local registry if not exists
  //     console.log(`➕ Adding ${inn} to local registry`);
  //     updateLocalRegistry(inn, siteEntry);
  //   } else {
  //     // Check if data differs and update if needed
  //     const localString = JSON.stringify({
  //       status: localEntry.status,
  //       org_name: localEntry.org_name,
  //       registration_date: localEntry.registration_date
  //     });
  //     const siteString = JSON.stringify(siteEntry);

  //     if (localString !== siteString) {
  //       console.log(`🔄 Updating ${inn} in local registry (data differs)`);
  //       updateLocalRegistry(inn, siteEntry);
  //     } else {
  //       console.log(`✅ Local registry data matches site data for ${inn}`);
  //     }
  //   }
  // };
  const syncWithLocalRegistry = async (inn: string, siteData: any): Promise<void> => {
    // TODO: REF v1.2 - Registry sync disabled
    console.log('📝 Local registry sync disabled');
  };

  // Test parser function separately (without fallback to local registry)
  const testParser = async (inn: string): Promise<{ success: boolean; data?: any; error?: string }> => {
    console.log(`🧪 === TESTING PARSER FOR INN: ${inn} ===`);

    try {
      // For local development, use direct Supabase URL
      const parserUrl = window.location.hostname.includes('localhost')
        ? 'http://127.0.0.1:54321/functions/v1/reestr-parser'
        : `${supabaseUrl}/functions/v1/reestr-parser`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add Authorization for production only
      if (!window.location.hostname.includes('localhost')) {
        headers['Authorization'] = `Bearer ${supabaseKey}`;
      }

      const response = await fetch(parserUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inn })
      });

      console.log('📡 Parser response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Parser raw response:', data);

        if (data && data.success && data.result) {
          const result = data.result;

          if (result.found) {
            const parsedData = {
              inn,
              org_name: result.name || '',
              status: result.status || 'Член СРО',
              registration_date: result.registrationDate || ''
            };

            console.log('✅ Parser extracted data:', parsedData);
            return { success: true, data: parsedData };
          } else {
            return { success: false, error: 'ИНН не найден на сайте' };
          }
        } else {
          return { success: false, error: 'Неверный формат ответа от парсера' };
        }
      } else {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      console.error('🚨 Parser test failed:', error);
      return {
        success: false,
        error: `Ошибка сети: ${error instanceof Error ? error.message : String(error)}`
      };
    }
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

  // Sign in function - ONLY use parser, no fallback to local registry
  const signIn = async (inn: string): Promise<{ success: boolean; message?: string; showRetryButtons?: boolean }> => {
    try {
      console.log(`🚪 Sign in attempt for INN: ${inn}`);

      // Check guest request limits for non-members
      if (!user && !checkGuestLimit()) {
        showToast('warning', 'Лимит превышен', 'Превышен суточный лимит запросов для гостей (1000 запроса). Войдите как член СРО для безлимитного доступа.');
        setLoginError({
          message: 'Превышен суточный лимит запросов для гостей (1000 запроса). Войдите как член СРО для безлимитного доступа.',
          showRetryButtons: false
        });
        return { success: false, message: 'GUEST_LIMIT_EXCEEDED' };
      }

      // Increment guest request counter
      if (!user) {
        const currentRequests = parseInt(localStorage.getItem('sro_guest_requests_today') || '0');
        localStorage.setItem('sro_guest_requests_today', (currentRequests + 1).toString());
        setGuestRequestsToday(currentRequests + 1);
      }

      // STEP 1: Direct call to parser only (no fallback)
      const startTime = Date.now();
      let jwt: string | undefined;

      try {
        if (supabase.auth) {
          const { data: { session } } = await supabase.auth.getSession();
          jwt = session?.access_token;
        }
      } catch (error) {
        console.warn('Failed to get Supabase session:', error);
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Always include Authorization header for production
      if (!window.location.hostname.includes('localhost')) {
        headers['Authorization'] = `Bearer ${supabaseKey}`;
      }
      // Production mode: header required for Supabase function

      console.log('🌐 Calling parser function...');
      // For local development, use direct Supabase URL
      const parserUrl = window.location.hostname.includes('localhost')
        ? 'http://127.0.0.1:54321/functions/v1/reestr-parser'
        : `${supabaseUrl}/functions/v1/reestr-parser`;

      const response = await fetch(parserUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ inn })
      });

      const timeTaken = Date.now() - startTime;
      console.log(`⏱️ Parser response in ${timeTaken}ms, status: ${response.status}`);

      if (!response.ok) {
        console.log(`❌ Parser error status: ${response.status}`);

        // Show retry buttons for server errors
        if (response.status >= 500) {
          const errorMessage = 'Не удалось получить ваши данные с сайта. Попробуйте ещё раз.';
          setLoginError({
            message: errorMessage,
            showRetryButtons: true
          });
          return {
            success: false,
            message: errorMessage,
            showRetryButtons: true
          };
        }

        const errorMessage = 'Ошибка сервера';
        setLoginError({
          message: errorMessage,
          showRetryButtons: false
        });
        return { success: false, message: errorMessage };
      }

      // Parse response
      const data = await response.json();
      console.log('📊 Parser response:', data);

      if (!data.success) {
        console.log('❌ Parser returned success: false');
        return {
          success: false,
          message: 'Не удалось получить ваши данные с сайта. Попробуйте ещё раз.',
          showRetryButtons: true
        };
      }

      if (!data.result || !data.result.found) {
        console.log('❌ Parser returned no data');
        const errorMessage = 'ИНН не найден в реестре СРО';
        setLoginError({
          message: errorMessage,
          showRetryButtons: false // Пользователь должен изменить ИНН
        });
        return { success: false, message: errorMessage };
      }

      const result = data.result;
      console.log('✅ Parser found data:', result);

      // Validate data - updated validation logic
      const isValidData = result.name &&
        !result.name.includes('Краткое наименование') &&
        !result.name.includes('-ошибка') &&
        !result.registrationDate?.includes('Исключен') &&
        result.status && // Status must exist
        result.registrationDate && // Registration date must exist
        result.registrationDate !== result.status; // Date should not equal status

      if (!isValidData) {
        console.log('⚠️ Parser returned invalid data');
        return {
          success: false,
          message: 'Получены некорректные данные. Обратитесь в поддержку.',
        };
      }

      // STEP 2: Success - create user profile
      console.log('Using mock authentication for parser-validated data');
      const mockUser: User = {
        id: `parser-${Date.now()}`,
        email: `${inn}@parser.sro`,
        inn: result.inn,
        org_name: result.name,
        status: result.status,
        registration_date: result.registrationDate,
        role: 'member',
        dataSource: 'website' as const
      };

      setUser(mockUser);
      localStorage.setItem('sro_guest_user', JSON.stringify(mockUser));
      setVerificationStatus({ isChecking: false, currentStep: '', dataSource: null });

      showToast('success', 'Успешный вход', `Добро пожаловать, ${result.name}`);
      return { success: true };

    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = 'Не удалось получить ваши данные с сайта. Попробуйте ещё раз.';
      setLoginError({
        message: errorMessage,
        showRetryButtons: true
      });
      return {
        success: false,
        message: errorMessage,
        showRetryButtons: true
      };
    } finally {
      setVerificationStatus({ isChecking: false, currentStep: '', dataSource: null });
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

  // Load registry and user on app startup
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load local registry
        await loadLocalRegistry();

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

    loadData();

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

  // Clear login error
  const clearLoginError = () => {
    setLoginError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    supabase,
    signIn,
    signOut,
    checkInnExists,
    testParser,
    guestRequestsToday,
    checkGuestLimit,
    verificationStatus,
    loginError,
    clearLoginError,
    setLoginError
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
