import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to admin login if not authenticated
  if (!user) {
    return <Navigate to="/admin" replace />;
  }

  // Show access denied if not an admin
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 p-8 text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin panel. 
            Only administrators can access this area.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 p-3 bg-muted/50 rounded-lg">
            <Shield className="w-4 h-4" />
            <span>Current role: <strong className="text-foreground">{user.role}</strong></span>
          </div>
          <Button 
            onClick={() => window.location.href = '/'} 
            className="w-full"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Render admin content if authenticated and is admin
  return <>{children}</>;
};

export default AdminProtectedRoute;

