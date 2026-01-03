import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { apiService } from '@/services/api';
import type { AdminUser } from '@/services/api/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Home,
  Sun,
  Moon,
  Search,
  ChevronUp,
  ChevronDown,
  Save,
  Loader2,
  Users as UsersIcon,
  Mail,
  User,
  Shield,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

type SortField = 'name' | 'surname' | 'email' | 'role' | 'dateOfRegister';
type SortDirection = 'asc' | 'desc';

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Data state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & sorting state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('dateOfRegister');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Edit form state
  const [editRole, setEditRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getUsers({
        page,
        size: pageSize,
        sort: `${sortField},${sortDirection}`,
        search: searchQuery || undefined,
      });
      setUsers(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortField, sortDirection, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(0);
  };

  // Handle user selection
  const handleSelectUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditRole(user.role);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!selectedUser) {
      toast.error('Please select a user to update');
      return;
    }

    if (editRole === selectedUser.role) {
      toast.info('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await apiService.updateUserRole(selectedUser.id, editRole);
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      setSelectedUser(updatedUser);
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Main Page
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--admin-users-gradient-start), var(--admin-users-gradient-end))' }}>
                <UsersIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">User Management</h1>
            </div>
          </div>

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
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          {/* Left Side - Users Table */}
          <div className="xl:col-span-2 bg-card rounded-2xl border shadow-lg overflow-hidden flex flex-col h-[calc(100vh-180px)]">
            {/* Search Bar */}
            <div className="p-4 border-b bg-muted/30 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  className="pl-10 bg-background"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto flex-1 overflow-y-auto dropdown-scrollbar">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        <SortIndicator field="name" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('surname')}
                    >
                      <div className="flex items-center gap-1">
                        Surname
                        <SortIndicator field="surname" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1">
                        Email
                        <SortIndicator field="email" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-1">
                        Role
                        <SortIndicator field="role" />
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('dateOfRegister')}
                    >
                      <div className="flex items-center gap-1">
                        Registered
                        <SortIndicator field="dateOfRegister" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading users...</p>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`cursor-pointer border-b transition-colors ${
                          selectedUser?.id === user.id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-foreground">{user.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{user.surname || '-'}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: user.role === 'ADMIN' ? 'var(--admin-badge-admin-bg)' : 'var(--admin-badge-user-bg)',
                              color: user.role === 'ADMIN' ? 'var(--admin-badge-admin-text)' : 'var(--admin-badge-user-text)',
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {user.dateOfRegister ? formatDate(user.dateOfRegister) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t bg-muted/30 flex items-center justify-between flex-shrink-0">
              <p className="text-sm text-muted-foreground">
                Showing {users.length} of {totalElements} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {page + 1} of {totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Edit Form */}
          <div className="bg-card rounded-2xl border shadow-lg p-6 overflow-y-auto dropdown-scrollbar flex flex-col h-[calc(100vh-180px)]">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
              Edit User
            </h2>

            {selectedUser ? (
              <div className="space-y-5 flex-1 overflow-y-auto">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    Name
                  </Label>
                  <Input
                    value={selectedUser.name || ''}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                {/* Surname Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    Surname
                  </Label>
                  <Input
                    value={selectedUser.surname || ''}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    value={selectedUser.email}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                {/* Role Field - Editable */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={editRole === 'USER' ? 'default' : 'outline'}
                      onClick={() => setEditRole('USER')}
                      className="flex-1"
                    >
                      USER
                    </Button>
                    <Button
                      type="button"
                      variant={editRole === 'ADMIN' ? 'default' : 'outline'}
                      onClick={() => setEditRole('ADMIN')}
                      className="flex-1"
                    >
                      ADMIN
                    </Button>
                  </div>
                </div>

                {/* Date of Register Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Date of Register
                  </Label>
                  <Input
                    value={selectedUser.dateOfRegister ? formatDate(selectedUser.dateOfRegister) : '-'}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving || editRole === selectedUser.role}
                  className="w-full mt-6"
                  style={{ background: 'linear-gradient(to right, var(--admin-users-gradient-start), var(--admin-users-gradient-end))' }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      SAVE CHANGES
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Only the Role field can be edited.
                  <br />
                  Other fields are read-only.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Select a user from the table to edit
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
