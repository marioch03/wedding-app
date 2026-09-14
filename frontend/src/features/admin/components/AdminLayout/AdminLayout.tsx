import { UserButton } from "@clerk/clerk-react";
import React, { useEffect, useState, useMemo } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { weddingApi } from "../../../../lib/api";
import type { WeddingPublicResponse } from "../../../../types";
import styles from "./AdminLayout.module.css";

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [partnerNames, setPartnerNames] = useState<{ p1: string; p2: string } | null>(null);
  const location = useLocation();

  // Carga los nombres de los contrayentes para el monograma
  useEffect(() => {
    weddingApi
      .getPublic()
      .then((data: WeddingPublicResponse) => {
        if (data?.partner1Name && data?.partner2Name) {
          setPartnerNames({ p1: data.partner1Name, p2: data.partner2Name });
        }
      })
      .catch(() => {
        // Fallback elegante si la API no responde
      });
  }, []);

  const monogram = useMemo(() => {
    const p1 = partnerNames?.p1?.trim() ? partnerNames.p1.trim().charAt(0).toUpperCase() : 'E';
    const p2 = partnerNames?.p2?.trim() ? partnerNames.p2.trim().charAt(0).toUpperCase() : 'C';
    return { p1, p2 };
  }, [partnerNames]);

  // Cierra el sidebar al navegar (útil en móvil)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Cierra el sidebar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Bloquea el scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`;

  return (
    <div className={styles.layoutContainer}>
      {/* ── Overlay backdrop (móvil) ── */}
      <div
        className={`${styles.mobileOverlay} ${isSidebarOpen ? styles.mobileOverlayVisible : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── Sidebar / Drawer ── */}
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div
            className={styles.miniLogo}
            title={partnerNames ? `${partnerNames.p1} & ${partnerNames.p2}` : 'Monograma de los novios'}
          >
            <span className={styles.monogramLetter}>{monogram.p1}</span>
            <span className={styles.monogramAmp}>&amp;</span>
            <span className={styles.monogramLetter}>{monogram.p2}</span>
          </div>
          <div className={styles.logoArea}>
            <div className={styles.logoTitle}>
              {partnerNames ? `${partnerNames.p1} & ${partnerNames.p2}` : 'Nuestra Boda'}
            </div>
            <span className={styles.logoTag}>Panel de Gestión</span>
          </div>
          {/* Botón de cierre — solo visible en móvil */}
          <button
            className={styles.sidebarCloseBtn}
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Cerrar menú de navegación"
          >
            ✕
          </button>
        </div>

        <nav
          className={styles.nav}
          aria-label="Menú principal de administración"
        >
          <NavLink to="/admin" end className={navLinkClass} title="Dashboard">
            <span className={styles.navIcon}>📊</span>
            <span className={styles.navLabel}>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/wedding" className={navLinkClass} title="Boda & Web">
            <span className={styles.navIcon}>💍</span>
            <span className={styles.navLabel}>Boda &amp; Web</span>
          </NavLink>

          <NavLink to="/admin/events" className={navLinkClass} title="Eventos & Menús">
            <span className={styles.navIcon}>📅</span>
            <span className={styles.navLabel}>Eventos &amp; Menús</span>
          </NavLink>

          <NavLink to="/admin/parties" className={navLinkClass} title="Invitados & Grupos">
            <span className={styles.navIcon}>💌</span>
            <span className={styles.navLabel}>Invitados &amp; Grupos</span>
          </NavLink>

          <NavLink to="/admin/rsvp" className={navLinkClass} title="Control RSVP">
            <span className={styles.navIcon}>✓</span>
            <span className={styles.navLabel}>Control RSVP</span>
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className={styles.publicSiteButton}
            title="Ver Web Pública"
          >
            <span className={styles.publicSiteIcon}>🌐</span>
            <span className={styles.publicSiteLabel}>Ver Web Pública</span>
          </Link>
        </div>
      </aside>

      {/* ── Área Principal ── */}
      <div className={styles.mainWrapper}>
        <header className={styles.topHeader}>
          {/* Botón hamburguesa — solo visible en móvil */}
          <button
            className={styles.hamburgerBtn}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
            aria-expanded={isSidebarOpen}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>

          <div className={styles.headerTitleWrapper}>
            <div className={styles.headerTitle}>Administración</div>
            <span className={styles.headerSubtitle}>
              Panel de Control y Gestión
            </span>
          </div>

          <div className={styles.headerRight}>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: {
                    width: "42px",
                    height: "42px",
                    border: "2px solid var(--color-primary-border)",
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
