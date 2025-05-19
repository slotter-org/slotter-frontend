import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/components/common/cards/LoginCard';
import { RegisterPage } from '@/components/common/cards/RegisterCard';
import { Dashboard } from '@/pages/Dashboard';
import { Slotting } from '@/pages/Slotting';
import { Inventory } from '@/pages/Inventory';
import { RolesPage } from '@/pages/Roles';
import { InvitationPage } from '@/pages/Invitation';
import { AppLayout } from '@/layouts/AppLayout';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/landing" replace />} />
          <Route path="landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="slotting" element={<RequireAuth><Slotting /></RequireAuth>} />
          <Route path="inventory" element={<RequireAuth><Inventory /></RequireAuth>} />
          <Route path="roles" element={<RequireAuth><RolesPage /></RequireAuth>} />
          <Route path="invitations" element={<RequireAuth><InvitationPage /></RequireAuth>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }
  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
