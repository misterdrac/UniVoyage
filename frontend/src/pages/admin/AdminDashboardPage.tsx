import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Users, MapPin, LogOut, Sun, Moon, Shield, Settings, ExternalLink } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--admin-bg-gradient)' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--admin-decorative-purple),transparent_50%),radial-gradient(circle_at_70%_80%,var(--admin-decorative-purple-light),transparent_50%)]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: 'var(--admin-decorative-emerald)' }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--admin-decorative-teal)' }} />

      {/* Header */}
      <header className="relative z-10 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(to bottom right, var(--admin-gradient-start), var(--admin-gradient-end))', boxShadow: `0 10px 15px -3px var(--admin-shadow-emerald-25)` }}>
            <Shield className="w-5 h-5" style={{ color: 'var(--ds-contrast-fg)' }} />
          </div>
          <div>
            <h1 className="font-bold text-foreground">UniVoyage Admin</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user?.name || user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full bg-card/80 backdrop-blur-sm border shadow-sm hover:bg-card"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" style={{ color: 'var(--admin-badge-admin-text)' }} />
            ) : (
              <Moon className="h-5 w-5" style={{ color: 'var(--muted-foreground)' }} />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl" style={{ background: 'linear-gradient(to bottom right, var(--admin-gradient-start), var(--admin-gradient-end))', boxShadow: `0 20px 25px -5px var(--admin-shadow-emerald-30)` }}>
            <Settings className="w-10 h-10" style={{ color: 'var(--ds-contrast-fg)' }} />
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-3">Admin Dashboard</h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Manage users and destinations for the UniVoyage platform
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
          {/* Users Button */}
          <button
            onClick={() => navigate('/admin/users')}
            className="group flex-1 bg-card hover:bg-card/80 rounded-2xl p-8 border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(to bottom right, var(--admin-users-gradient-start), var(--admin-users-gradient-end))', boxShadow: `0 10px 15px -3px var(--admin-shadow-blue-30)` }}>
              <Users className="w-8 h-8" style={{ color: 'var(--ds-contrast-fg)' }} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">USERS</h3>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </button>

          {/* Destinations Button */}
          <button
            onClick={() => navigate('/admin/destinations')}
            className="group flex-1 bg-card hover:bg-card/80 rounded-2xl p-8 border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(to bottom right, var(--admin-gradient-start), var(--admin-gradient-end))', boxShadow: `0 10px 15px -3px var(--admin-shadow-emerald-30)` }}>
              <MapPin className="w-8 h-8" style={{ color: 'var(--ds-contrast-fg)' }} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">DESTINATIONS</h3>
            <p className="text-muted-foreground">
              Manage travel destinations and content
            </p>
          </button>
        </div>
      </main>

      {/* Footer with Actions */}
      <footer className="relative z-10 p-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="gap-2 bg-card/80 backdrop-blur-sm hover:bg-primary/10 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Back to UniVoyage
        </Button>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2 bg-card/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          LOGOUT
        </Button>
      </footer>
    </div>
  );
};

export default AdminDashboardPage;

