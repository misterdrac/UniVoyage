import { Calendar, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { User } from '@/data/mockUsers';

interface AccountInformationCardProps {
  user: User;
  isEditingProfile: boolean;
  isEditingInterests: boolean;
  onLogout: () => void;
}

export const AccountInformationCard = ({
  user,
  isEditingProfile,
  isEditingInterests,
  onLogout,
}: AccountInformationCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Account Information
        </CardTitle>
        <CardDescription>Your account details and settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Member since</p>
              <p className="text-base font-semibold text-foreground">
                {new Date(user.dateOfRegister).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Last login</p>
              <p className="text-base font-semibold text-foreground">
                {user.dateOfLastSignin
                  ? new Date(user.dateOfLastSignin).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Never'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Account status</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--profile-account-status)' }}
                ></div>
                <p
                  className="text-base font-semibold"
                  style={{ color: 'var(--profile-account-status-text)' }}
                >
                  Active
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Button
              variant="destructive"
              onClick={onLogout}
              className="flex items-center gap-2"
              disabled={isEditingProfile || isEditingInterests}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

