import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, ScrollText, Package,
  Tag, Truck, Users, Utensils, Menu, X,
  ChevronLeft, ChevronRight, LogOut, type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../lib/styles';
import { OfflineBanner } from './ui/OfflineBanner';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MANAGER_LINKS: { to: string; icon: LucideIcon; label: string }[] = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/inventory',  icon: ClipboardList,   label: 'Inventory'  },
  { to: '/history',    icon: ScrollText,      label: 'History'    },
  { to: '/items',      icon: Package,         label: 'Items'      },
  { to: '/categories', icon: Tag,             label: 'Categories' },
  { to: '/suppliers',  icon: Truck,           label: 'Suppliers'  },
  { to: '/users',      icon: Users,           label: 'Users'      },
];

const EMPLOYEE_LINKS: { to: string; icon: LucideIcon; label: string }[] = [
  { to: '/inventory', icon: ClipboardList, label: 'Inventory' },
];

const W_OPEN = 220;
const W_CLOSED = 60;

function NavItem({ to, icon: Icon, label, collapsed, onClick }: {
  to: string; icon: LucideIcon; label: string; collapsed: boolean; onClick?: () => void;
}) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : '12px',
        padding: '10px 12px',
        borderRadius: '8px',
        textDecoration: 'none',
        color: isActive ? colors.accent : colors.textSecondary,
        backgroundColor: isActive ? colors.accentLight : 'transparent',
        fontWeight: isActive ? '600' : '500',
        fontSize: '14px',
        transition: 'all 0.15s',
        borderLeft: `3px solid ${isActive ? colors.accent : 'transparent'}`,
        justifyContent: collapsed ? 'center' : 'flex-start',
        overflow: 'hidden',
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
      <Icon size={18} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
    </Link>
  );
}

function Sidebar({ collapsed, onToggle, onClose }: {
  collapsed: boolean; onToggle: () => void; onClose?: () => void;
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = user?.role === 'manager' ? MANAGER_LINKS : EMPLOYEE_LINKS;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.bgCard,
      borderRight: `1px solid ${colors.borderSubtle}`,
      overflow: 'hidden',
    }}>
      {/* Brand + collapse toggle */}
      <div style={{ padding: '16px 12px', borderBottom: `1px solid ${colors.borderSubtle}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Utensils size={22} color={colors.accent} />
              <div>
                <p style={{ fontSize: '14px', fontWeight: 'bold', color: colors.textPrimary, lineHeight: 1.3 }}>Clean Kitchen</p>
                <p style={{ fontSize: '11px', color: colors.accent, fontWeight: '600', letterSpacing: '0.05em' }}>INVENTORY</p>
              </div>
            </div>
          )}

          {collapsed && <Utensils size={22} color={colors.accent} />}

          {onClose ? (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              <X size={18} />
            </button>
          ) : (
            <button
              onClick={onToggle}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                background: 'none',
                border: `1px solid ${colors.borderSubtle}`,
                borderRadius: '6px',
                color: colors.textSecondary,
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                transition: 'all 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.textPrimary; e.currentTarget.style.borderColor = colors.borderStrong; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.textSecondary; e.currentTarget.style.borderColor = colors.borderSubtle; }}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {!collapsed && (
          <p style={{ fontSize: '10px', fontWeight: '700', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px 6px' }}>
            Navigation
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map((link) => (
            <NavItem key={link.to} {...link} collapsed={collapsed} onClick={onClose} />
          ))}
        </div>
      </nav>

      {/* User footer */}
      <div style={{ padding: collapsed ? '12px 8px' : '16px', borderTop: `1px solid ${colors.borderSubtle}`, flexShrink: 0 }}>
        {!collapsed && (
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
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            color: colors.red,
            padding: collapsed ? '8px' : '8px 12px',
            borderRadius: '8px',
            border: `1px solid ${colors.red}`,
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.redBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={15} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
}

export function Layout({ children, title }: LayoutProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const sidebarWidth = collapsed ? W_CLOSED : W_OPEN;

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (isDesktop) setDrawerOpen(false);
  }, [isDesktop]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.bgBase }}>
      <OfflineBanner />

      {/* Desktop fixed sidebar */}
      {isDesktop && (
        <aside style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: `${sidebarWidth}px`,
          transition: 'width 0.2s ease',
          zIndex: 40,
        }}>
          <Sidebar collapsed={collapsed} onToggle={toggleCollapse} />
        </aside>
      )}

      {/* Mobile drawer overlay */}
      {!isDesktop && drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40 }}
          />
          <aside style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: `${W_OPEN}px`, zIndex: 50 }}>
            <Sidebar collapsed={false} onToggle={toggleCollapse} onClose={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div style={{
        marginLeft: isDesktop ? `${sidebarWidth}px` : 0,
        transition: 'margin-left 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}>
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
              style={{ background: 'none', border: 'none', color: colors.textPrimary, cursor: 'pointer', padding: '2px 6px', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={22} />
            </button>
            <span style={{ fontWeight: 'bold', color: colors.textPrimary, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Utensils size={18} color={colors.accent} />
              <span style={{ color: colors.accent }}>Clean Kitchen</span>
            </span>
          </header>
        )}

        <main style={{ flex: 1, padding: '16px', maxWidth: '1100px', width: '100%', boxSizing: 'border-box' as const, overflowX: 'hidden' }}>
          {title && (
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary, marginBottom: '24px' }}>
              {title}
            </h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
