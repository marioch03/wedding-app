import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WeddingLandingPage } from "./features/wedding/pages/WeddingLandingPage";
import { RsvpPage } from "./features/rsvp/pages/RsvpPage";
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

export const App: React.FC = () => {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.warn(
      "VITE_CLERK_PUBLISHABLE_KEY no está configurada en .env.local",
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY || ""}>
      <ClerkAuthSync>
        <BrowserRouter>
          <Routes>
            {/* Ruta Publica: Landing de la Boda */}
            <Route path="/" element={<WeddingLandingPage />} />

            {/* Rutas Publicas: Flujo de Confirmacion RSVP */}
            <Route path="/rsvp" element={<RsvpPage />} />
            <Route path="/rsvp/:token" element={<RsvpPage />} />

            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ClerkAuthSync>
    </ClerkProvider>
  );
};

export default App;
