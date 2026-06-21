import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../lib/styles';
import { OfflineBanner } from './ui/OfflineBanner';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MANAGER_LINKS = [
  { to: '/',           icon: '📊', label: 'Dashboard'  },
  { to: '/inventory',  icon: '📋', label: 'Inventory'  },
  { to: '/history',    icon: '📜', label: 'History'    },
  { to: '/items',      icon: '📦', label: 'Items'      },
  { to: '/categories', icon: '🏷️', label: 'Categories' },
  { to: '/suppliers',  icon: '🚚', label: 'Suppliers'  },
  { to: '/users',      icon: '👥', label: 'Users'      },
];

const EMPLOYEE_LINKS = [
  { to: '/inventory', icon: '📋', label: 'Inventory' },
];

const SIDEBAR_W = 240;

function NavItem({ to, icon, label, onClick }: { to: string; icon: string; label: string; onClick?: () => void }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      onClick={(e) => {
        console.log(`[NavItem] clicked: ${label} → ${to}`, { defaultPrevented: e.defaultPrevented });
        onClick?.();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: isActive ? colors.accent : colors.textSecondary,
        backgroundColor: isActive ? colors.accentLight : 'transparent',
        fontWeight: isActive ? '600' : '500',
        fontSize: '14px',
        transition: 'all 0.15s',
        borderLeft: `3px solid ${isActive ? colors.accent : 'transparent'}`,
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = colors.textPrimary;
          e.currentTarget.style.backgroundColor = colors.bgHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = colors.textSecondary;
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <span style={{ fontSize: '18px', width: '22px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = user?.role === 'manager' ? MANAGER_LINKS : EMPLOYEE_LINKS;

  return (
    <div style={{
      width: `${SIDEBAR_W}px`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.bgCard,
      borderRight: `1px solid ${colors.borderSubtle}`,
    }}>
      {/* Brand */}
      <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${colors.borderSubtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🍴</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 'bold', color: colors.textPrimary, lineHeight: 1.3 }}>Clean Kitchen</p>
              <p style={{ fontSize: '11px', color: colors.accent, fontWeight: '600', letterSpacing: '0.05em' }}>INVENTORY</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: '4px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        <p style={{ fontSize: '10px', fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px 6px' }}>
          Navigation
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map((link) => (
            <NavItem key={link.to} {...link} onClick={onClose} />
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div style={{ padding: '16px', borderTop: `1px solid ${colors.borderSubtle}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            backgroundColor: colors.accentLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 'bold', color: colors.accent, flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: colors.textSecondary, textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: colors.red,
            padding: '8px 12px',
            borderRadius: '8px',
            border: `1px solid ${colors.red}`,
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.redBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export function Layout({ children, title }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close drawer when resizing to desktop
  useEffect(() => {
    if (isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bgBase, display: 'flex', flexDirection: 'column' }}>
      <OfflineBanner />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Desktop sidebar — always visible on wide screens */}
        {isDesktop && (
          <aside style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
            <Sidebar />
          </aside>
        )}

        {/* Mobile drawer overlay */}
        {!isDesktop && drawerOpen && (
          <>
            <div
              onClick={() => setDrawerOpen(false)}
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40 }}
            />
            <aside style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 50 }}>
              <Sidebar onClose={() => setDrawerOpen(false)} />
            </aside>
          </>
        )}

        {/* Main area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>

          {/* Mobile top bar */}
          {!isDesktop && (
            <header style={{
              backgroundColor: colors.bgCard,
              borderBottom: `1px solid ${colors.borderSubtle}`,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              position: 'sticky',
              top: 0,
              zIndex: 30,
            }}>
              <button
                onClick={() => setDrawerOpen(true)}
                style={{ background: 'none', border: 'none', color: colors.textPrimary, cursor: 'pointer', fontSize: '22px', lineHeight: 1, padding: '2px 6px', minWidth: '44px', minHeight: '44px' }}
              >
                ☰
              </button>
              <span style={{ fontWeight: 'bold', color: colors.textPrimary, fontSize: '16px' }}>
                🍴 <span style={{ color: colors.accent }}>Clean Kitchen</span>
              </span>
            </header>
          )}

          <main style={{ flex: 1, padding: '24px 20px', maxWidth: '1100px', width: '100%' }}>
            {title && (
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '24px' }}>
                {title}
              </h1>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
