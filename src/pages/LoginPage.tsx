import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  // Добавляем эффект прокрутки к началу страницы при монтировании компонента
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [inn, setInn] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  // Определяем, куда перенаправить после успешного входа
  const from = location.state?.from?.pathname || '/documents';

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inn.trim()) return;

    setLoading(true);
    try {
      const result = await signIn(inn.trim());
      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex justify-center">
      <div className="w-full bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <svg className="icon-xl text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <circle cx="12" cy="12" r="11"/>
              <circle cx="12" cy="9" r="3"/>
              <path d="M5 20c0-3 3-5 7-5s7 2 7 5"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Вход для членов СРО</h2>
          <p className="text-gray-600 mt-2">Введите ваш ИНН для доступа к личному кабинету</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="inn" className="flex items-center text-gray-700 text-sm font-bold mb-2">
              <svg className="icon-standard mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              ИНН
            </label>
            <input
              type="text"
              id="inn"
              value={inn}
              onChange={(e) => setInn(e.target.value)}
              disabled={loading}
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Введите 10 или 12 цифр"
              required
              pattern="\d{10}|\d{12}"
              title="ИНН должен состоять из 10 (для юрлиц) или 12 (для физлиц) цифр"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Вход...
                </>
              ) : (
                <>
                  <svg className="icon-standard mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Войти
                </>
              )}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Еще не являетесь членом СРО?</p>
          <Link to="/chat" className="text-blue-600 hover:underline font-medium">
            Получите бесплатную консультацию
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
