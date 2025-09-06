import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto bg-red-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <svg className="icon-xl text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11"/>
            <path d="M15 9l-6 6m0-6l6 6"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Необходимо войти в систему</h2>
        <p className="text-gray-600 mb-6">Для просмотра профиля требуется авторизация</p>
        <Button onClick={() => navigate('/login')} className="btn-primary">
          Войти в систему
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Активно':
        return 'text-green-700 bg-green-100';
      case 'Истекает':
        return 'text-yellow-700 bg-yellow-100';
      case 'Приостановлено':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mx-auto bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
          <svg className="icon-xl text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11"/>
            <circle cx="12" cy="9" r="3"/>
            <path d="M5 20c0-3 3-5 7-5s7 2 7 5"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Профиль члена СРО</h1>
        <p className="text-gray-600 mt-2">Информация о вашем членстве в СРО НОСО</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        {/* Organization Info */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Информация об организации</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="icon-standard text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect width="20" height="15" x="2" y="3" rx="2"/>
                  <path d="M10 9l2 2 4-4"/>
                </svg>
                <label className="text-sm font-medium text-gray-700">Статус членства</label>
              </div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                {user.status === 'Найдена в реестре СРО' ? 'Член СРО' :
                 user.status === 'Исключен' ? 'Исключен из СРО' :
                 user.status?.includes('Исключен') ? 'Исключен из СРО' :
                 user.status}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="icon-standard text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <label className="text-sm font-medium text-gray-700">Название организации</label>
              </div>
              <p className="text-gray-900 font-medium">
                {user.org_name === 'Краткое наименование организации:' ||
                 user.org_name?.startsWith('Краткое наименование организации:') ?
                 'Информация временно недоступна (парсер сайта требует настройки)' :
                 user.org_name || 'Информация временно недоступна'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="icon-standard text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 007 0"/>
                  <path d="M20 13a9 9 0 10-14 0"/>
                </svg>
                <label className="text-sm font-medium text-gray-700">ИНН</label>
              </div>
              <p className="text-gray-900 font-mono">{user.inn}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="icon-standard text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect width="18" height="18" x="3" y="4" ry="2" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
                <label className="text-sm font-medium text-gray-700">Дата регистрации</label>
              </div>
              <p className="text-gray-900">
                {user.registration_date?.startsWith('Исключен') ?
                 'Информация временно недоступна' :
                 user.registration_date?.includes('- ошибка') ?
                 user.registration_date.replace('- ошибка', '').trim() :
                 user.registration_date || 'Информация временно недоступна'}
              </p>
            </div>
          </div>

          {/* Data Source Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <svg className="icon-standard text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <label className="text-sm font-medium text-blue-800">Источник данных</label>
            </div>
            <p className="text-blue-900">
              Вход выполнен по данным{' '}
              <span className="font-semibold">
                {user.dataSource === 'website' ? 'с официального сайта СРО НОСО' : 'локального реестра'}
              </span>
            </p>
          </div>
        </div>

        {/* Status Explanation */}
        {user.status === 'Приостановлено' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Членство приостановлено
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Ваше членство в СРО временно приостановлено. Обратитесь в техническую поддержку СРО НОСО для восстановления доступа.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
          <Button onClick={() => navigate('/documents')} className="bg-gray-600 hover:bg-gray-700">
            вернуться к документам
          </Button>
          <Button onClick={handleSignOut} style={{backgroundColor: '#dc2626', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '500'}} className="hover:bg-red-700 transition-colors">
            Выйти из профиля
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
