import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import styles from './AdminLayout.module.css';

export const AdminLayout: React.FC = () => {
  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar Lateral */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoTitle}>Nuestra Boda</div>
          <span className={styles.logoTag}>Panel de Gestión</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <span className={styles.navIcon}>📊</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/wedding"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <span className={styles.navIcon}>💍</span>
            Boda & Web
          </NavLink>

          <NavLink
            to="/admin/events"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <span className={styles.navIcon}>📅</span>
            Eventos & Menús
          </NavLink>

          <NavLink
            to="/admin/parties"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <span className={styles.navIcon}>💌</span>
            Invitados & Grupos
          </NavLink>

          <NavLink
            to="/admin/rsvp"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <span className={styles.navIcon}>✓</span>
            Control RSVP
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link to="/" target="_blank" rel="noreferrer" className={styles.publicSiteButton}>
            <span>🌐</span> Ver Web Pública
          </Link>
        </div>
      </aside>

      {/* Área Principal */}
      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          <div className={styles.headerTitleWrapper}>
            <div className={styles.headerTitle}>Administración</div>
            <span className={styles.headerSubtitle}>Panel de Control y Gestión</span>
          </div>
          <div className={styles.headerRight}>
            {/* UserButton nativo de Clerk para perfil y cerrar sesión */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: {
                    width: '42px',
                    height: '42px',
                    border: '2px solid var(--color-primary-border)',
                  },
                },
              }}
            />
          </div>
        </header>

        <main className={styles.contentArea}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
