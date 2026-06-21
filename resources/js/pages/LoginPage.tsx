import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function LoginPage() {
  const [email, setEmail] = useState('manager@restaurant.local');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const authStore = useAuthStore;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      const role = authStore.getState().user?.role;
      navigate(role === 'manager' ? '/' : '/inventory');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f1117',
      backgroundImage: 'radial-gradient(rgb(46, 53, 73) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    },
    card: {
      backgroundColor: '#1e2333',
      border: '1px solid #2e3549',
      borderRadius: '12px',
      padding: '32px',
      width: '100%',
      maxWidth: '28rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    heading1: {
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#f0f2f8',
      marginBottom: '8px',
    },
    heading2: {
      fontSize: '30px',
      fontWeight: 'bold',
      color: '#f97316',
      marginBottom: '16px',
    },
    label: {
      fontSize: '10px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#8892a4',
      marginBottom: '8px',
      display: 'block',
    },
    input: {
      height: '44px',
      padding: '0 14px',
      backgroundColor: '#252b3b',
      border: '1px solid #2e3549',
      borderRadius: '8px',
      color: '#f0f2f8',
      fontSize: '14px',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: "'DM Sans', sans-serif",
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      height: '56px',
      width: '100%',
      backgroundColor: '#f97316',
      color: 'white',
      fontWeight: '600',
      fontSize: '16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.15s',
      disabled: { opacity: 0.5 },
    },
    divider: {
      height: '1px',
      background: 'linear-gradient(to right, transparent, rgb(46, 53, 73), transparent)',
      margin: '32px 0',
    },
    credentialsBox: {
      backgroundColor: '#252b3b',
      borderRadius: '8px',
      padding: '12px',
      marginTop: '24px',
      marginBottom: '16px',
    },
    apiBox: {
      backgroundColor: '#7c3a0f',
      border: '1px solid rgba(249, 115, 22, 0.3)',
      borderRadius: '8px',
      padding: '12px',
    },
    errorBox: {
      backgroundColor: '#450a0a',
      border: '1px solid #ef4444',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '24px',
      color: '#ef4444',
      fontSize: '14px',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Card */}
        <div style={styles.card}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔥</div>
            <h1 style={styles.heading1}>Restaurant</h1>
            <h2 style={styles.heading2}>Inventory</h2>
            <p style={{ fontSize: '14px', color: '#8892a4' }}>Management System</p>
          </div>

          {/* Divider */}
          <div style={styles.divider}></div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Error Message */}
            {error && (
              <div style={styles.errorBox}>
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="your@email.com"
                disabled={isLoading}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="••••••••"
                disabled={isLoading}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.button,
                opacity: isLoading ? 0.7 : 1,
              } as any}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fb923c')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #2e3549' }}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8892a4', marginBottom: '12px' }}>
              📝 Demo Credentials
            </p>
            <div style={styles.credentialsBox}>
              <p style={{ fontSize: '12px', color: '#f0f2f8', margin: '0 0 8px 0' }}>
                <span style={{ color: '#8892a4' }}>Email:</span> manager@restaurant.local
              </p>
              <p style={{ fontSize: '12px', color: '#f0f2f8', margin: '0' }}>
                <span style={{ color: '#8892a4' }}>Password:</span> password
              </p>
            </div>
          </div>

          {/* API Info */}
          <div style={styles.apiBox}>
            <p style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f97316', marginBottom: '4px' }}>
              🔗 API Connection
            </p>
            <p style={{ fontSize: '12px', color: '#8892a4', margin: '0' }}>
              http://127.0.0.1:8000/api
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
