import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { RouteLoadingFallback } from "./common/components/RouteLoadingFallback/RouteLoadingFallback";
import { ErrorFallback } from "./common/components/ErrorFallback/ErrorFallback";
import { NotFoundPage } from "./common/pages/NotFoundPage";
import { AdminLayout } from "./features/admin/components/AdminLayout/AdminLayout";
import { AdminProtectedRoute } from "./features/admin/components/AdminProtectedRoute/AdminProtectedRoute";
import { RsvpPage } from "./features/rsvp/pages/RsvpPage";
import { WeddingLandingPage } from "./features/wedding/pages/WeddingLandingPage";
import { setAuthTokenGetter } from "./lib/api/client";
import { Sentry } from "./lib/monitoring/sentry";

// Carga diferida (code-splitting) de las páginas administrativas
const AdminLoginPage = React.lazy(() =>
  import("./features/admin/pages/AdminLoginPage").then((m) => ({
    default: m.AdminLoginPage,
  }))
);
const AdminDashboardPage = React.lazy(() =>
  import("./features/admin/pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  }))
);
const AdminWeddingPage = React.lazy(() =>
  import("./features/admin/pages/AdminWeddingPage").then((m) => ({
    default: m.AdminWeddingPage,
  }))
);
const AdminPartiesPage = React.lazy(() =>
  import("./features/admin/pages/AdminPartiesPage").then((m) => ({
    default: m.AdminPartiesPage,
  }))
);
const AdminEventsPage = React.lazy(() =>
  import("./features/admin/pages/AdminEventsPage").then((m) => ({
    default: m.AdminEventsPage,
  }))
);
const AdminRsvpPage = React.lazy(() =>
  import("./features/admin/pages/AdminRsvpPage").then((m) => ({
    default: m.AdminRsvpPage,
  }))
);
const AdminGuestPhotosPage = React.lazy(() =>
  import("./features/admin/pages/AdminGuestPhotosPage").then((m) => ({
    default: m.AdminGuestPhotosPage,
  }))
);
const AdminSongSuggestionsPage = React.lazy(() =>
  import("./features/admin/pages/AdminSongSuggestionsPage").then((m) => ({
    default: m.AdminSongSuggestionsPage,
  }))
);

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
        <React.Suspense fallback={<RouteLoadingFallback />}>
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
              <Route path="wedding" element={<AdminWeddingPage />} />
              <Route path="parties" element={<AdminPartiesPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="rsvp" element={<AdminRsvpPage />} />
              <Route path="guest-photos" element={<AdminGuestPhotosPage />} />
              <Route path="song-suggestions" element={<AdminSongSuggestionsPage />} />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </React.Suspense>
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
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <ErrorFallback error={error} resetError={resetError} />
      )}
    >
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
};

export default App;
