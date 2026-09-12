import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../../test/test-utils';
import { AdminProtectedRoute } from '../components/AdminProtectedRoute/AdminProtectedRoute';
import { useAuth } from '@clerk/clerk-react';
import { Route, Routes } from 'react-router-dom';

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
}));

describe('Panel Admin: Protección de Rutas (AdminProtectedRoute)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra un spinner con role="status" y aria-label mientras Clerk carga la sesión (isLoaded: false)', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: false,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn(),
    } as any);

    renderWithRouter(
      <AdminProtectedRoute>
        <div>Contenido Privado del Panel Admin</div>
      </AdminProtectedRoute>
    );

    const spinner = screen.getByRole('status', { name: /Verificando sesión/i });
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText('Contenido Privado del Panel Admin')).not.toBeInTheDocument();
  });

  it('redirige hacia /admin/login cuando el usuario no está autenticado (isSignedIn: false)', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      userId: null,
      sessionId: null,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn(),
    } as any);

    renderWithRouter(
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <div>Contenido Privado del Panel Admin</div>
            </AdminProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<div>Página de Login Admin</div>} />
      </Routes>,
      { initialEntries: ['/admin'] }
    );

    // Debe haberse redirigido al login
    expect(screen.getByText('Página de Login Admin')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Privado del Panel Admin')).not.toBeInTheDocument();
  });

  it('permite el acceso y renderiza los componentes hijos cuando el usuario está autenticado (isSignedIn: true)', () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      userId: 'user_clerk_123',
      sessionId: 'sess_456',
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: vi.fn(),
      signOut: vi.fn(),
      getToken: vi.fn().mockResolvedValue('fake-jwt-token'),
    } as any);

    renderWithRouter(
      <AdminProtectedRoute>
        <div>Contenido Privado del Panel Admin</div>
      </AdminProtectedRoute>
    );

    expect(screen.getByText('Contenido Privado del Panel Admin')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: /Verificando sesión/i })).not.toBeInTheDocument();
  });
});
