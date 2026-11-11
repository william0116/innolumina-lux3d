import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

type Role = 'user' | 'creator' | 'admin';

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole?: Role;
}) {
  const { state } = useAuth();
  const location = useLocation();

  if (!state.isInitialized) {
    return null; // 加载中
  }

  if (!state.user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (requiredRole && state.user.role !== requiredRole) {
    // 角色不足，跳首页
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
