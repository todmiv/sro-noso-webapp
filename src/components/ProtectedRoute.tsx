import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Показываем загрузку, пока проверяется аутентификация
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если пользователь аутентифицирован, отображаем защищенный контент
  return <>{children}</>;
};

export default ProtectedRoute;
