import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { WeddingLandingPage } from "./features/wedding/pages/WeddingLandingPage";
import { RsvpPage } from "./features/rsvp/pages/RsvpPage";
import { AdminLoginPage } from "./features/admin/pages/AdminLoginPage";
import { AdminProtectedRoute } from "./features/admin/components/AdminProtectedRoute/AdminProtectedRoute";
import { AdminLayout } from "./features/admin/components/AdminLayout/AdminLayout";
import { AdminDashboardPage } from "./features/admin/pages/AdminDashboardPage";
import { AdminPartiesPage } from "./features/admin/pages/AdminPartiesPage";
import { AdminEventsPage } from "./features/admin/pages/AdminEventsPage";
import { AdminRsvpPage } from "./features/admin/pages/AdminRsvpPage";
import { NotFoundPage } from "./common/pages/NotFoundPage";
import { setAuthTokenGetter } from "./lib/api/client";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Componente para sincronizar el token de Clerk con el cliente Axios
const ClerkAuthSync: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
};

// Componente interno con enrutador integrado
const AppRoutes: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY || ""}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <ClerkAuthSync>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<WeddingLandingPage />} />
          <Route path="/rsvp" element={<RsvpPage />} />
          <Route path="/rsvp/:token" element={<RsvpPage />} />

          {/* Login de Administración */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Rutas Protegidas de Administración */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="parties" element={<AdminPartiesPage />} />
            <Route path="events" element={<AdminEventsPage />} />
            <Route path="rsvp" element={<AdminRsvpPage />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ClerkAuthSync>
    </ClerkProvider>
  );
};

export const App: React.FC = () => {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn(
      "VITE_CLERK_PUBLISHABLE_KEY no está configurada en .env.local",
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
