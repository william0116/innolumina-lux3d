import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Layout } from "@/components/Layout";
import AppProviders from "@/components/AppProviders";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProtectedLayout from "@/components/ProtectedLayout";
import HomePage from "@/pages/HomePage/HomePage";
import CreationPage from "@/pages/CreationPage/CreationPage";
import SquarePage from "@/pages/SquarePage/SquarePage";
import Preview3DPage from "@/pages/Preview3DPage/Preview3DPage";
import OrderPage from "@/pages/OrderPage/OrderPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import RechargePage from "@/pages/RechargePage/RechargePage";
import CreatorApplyPage from "@/pages/CreatorApplyPage/CreatorApplyPage";
import HelpPage from "@/pages/HelpPage/HelpPage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import RegisterPage from "@/pages/RegisterPage/RegisterPage";
import OrderDetailPage from "@/pages/OrderDetailPage/OrderDetailPage";
import AdminPage from "@/pages/AdminPage/AdminPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

export default function App() {
  return (
    <AppProviders>
      <Routes>
        {/* 带 chrome 的主布局 */}
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="create" element={<CreationPage />} />
          <Route path="square" element={<SquarePage />} />
          <Route path="preview/:id" element={<Preview3DPage />} />
          <Route path="creator/apply" element={<CreatorApplyPage />} />
          <Route path="help" element={<HelpPage />} />

          {/* 受保护路由（需登录） */}
          <Route element={<ProtectedLayout />}>
            <Route path="order/:id" element={<OrderPage />} />
            <Route path="order-detail/:id" element={<OrderDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="recharge" element={<RechargePage />} />
          </Route>
        </Route>

        {/* 无 chrome：登录/注册 */}
         <Route path="login" element={<LoginPage />} />
         <Route path="register" element={<RegisterPage />} />

         {/* 无 chrome：管理后台（独立布局） */}
         <Route path="admin" element={
           <ProtectedRoute><AdminPage /></ProtectedRoute>
         } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppProviders>
  );
}
