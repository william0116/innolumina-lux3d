import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 受保护布局：用于嵌套多个需登录的子路由
 * 子路由通过 <Outlet /> 渲染，避免每个 Route 都包一层 ProtectedRoute
 */
export default function ProtectedLayout() {
  const { state } = useAuth();
  const location = useLocation();

  if (!state.isInitialized) {
    return null; // 加载中
  }

  if (!state.user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return <Outlet />;
}
