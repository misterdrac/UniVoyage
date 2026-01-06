import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Home, Sun, Moon } from 'lucide-react';
import { ROUTE_PATHS } from '@/config/routes';

interface AdminHeaderProps {
  title: string;
  icon: React.ReactNode;
  gradientStyle: React.CSSProperties;
  actions?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  icon,
  gradientStyle,
  actions,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTE_PATHS.ADMIN_DASHBOARD)}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={gradientStyle}
            >
              {icon}
            </div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-500" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

