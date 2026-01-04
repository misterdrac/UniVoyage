import React, { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '@/services/api';
import type { AdminUser } from '@/services/api/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  AdminHeader,
  AdminSearchBar,
  AdminPagination,
  AdminLoadingState,
  AdminEmptyState,
  AdminEmptySelection,
  SortableTableHeader,
} from '@/components/admin';
import { useAdminTable } from '@/hooks/useAdminTable';
import { formatDateShort } from '@/lib/dateUtils';
import {
  Save,
  Loader2,
  Users as UsersIcon,
  Mail,
  User,
  Shield,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

type UserSortField = 'name' | 'surname' | 'email' | 'role' | 'dateOfRegister';

const USER_TABLE_COLUMNS: { field: UserSortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'surname', label: 'Surname' },
  { field: 'email', label: 'Email' },
  { field: 'role', label: 'Role' },
  { field: 'dateOfRegister', label: 'Registered' },
];

const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  // Data state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Table state (pagination, sorting, search)
  const table = useAdminTable<UserSortField>({
    defaultSortField: 'dateOfRegister',
    defaultSortDirection: 'desc',
  });

  // Selection state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isSaving, setIsSaving] = useState(false);

  // Refs for matching heights
  const tableCardRef = useRef<HTMLDivElement>(null);
  const editorCardRef = useRef<HTMLDivElement>(null);

  // Match editor height to table height
  useEffect(() => {
    const matchHeights = () => {
      if (tableCardRef.current && editorCardRef.current) {
        editorCardRef.current.style.height = `${tableCardRef.current.offsetHeight}px`;
      }
    };

    // Use setTimeout to ensure DOM has updated
    const timeoutId = setTimeout(matchHeights, 0);
    window.addEventListener('resize', matchHeights);
    
    // Use MutationObserver to watch for DOM changes
    const observer = new MutationObserver(matchHeights);
    if (tableCardRef.current) {
      observer.observe(tableCardRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', matchHeights);
      observer.disconnect();
    };
  }, [users, selectedUser, table.page]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getUsers({
        page: table.page,
        size: table.pageSize,
        sort: table.sortString,
        search: table.searchQuery || undefined,
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
  }, [table.page, table.pageSize, table.sortString, table.searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSelectUser = (user: AdminUser) => {
    setSelectedUser(user);
    // Only allow USER or ADMIN roles in the UI, HEAD_ADMIN is set manually in DB
    setEditRole(user.role === 'HEAD_ADMIN' ? 'ADMIN' : (user.role === 'USER' || user.role === 'ADMIN' ? user.role : 'USER'));
  };

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--admin-bg-gradient)' }}>
      <AdminHeader
        title="User Management"
        icon={<UsersIcon className="w-4 h-4" style={{ color: 'var(--ds-contrast-fg)' }} />}
        gradientStyle={{ background: 'linear-gradient(to bottom right, var(--admin-users-gradient-start), var(--admin-users-gradient-end))' }}
      />

      <main className="p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {/* Left Side - Users Table */}
          <div ref={tableCardRef} className="xl:col-span-2 bg-card rounded-2xl border shadow-lg">
            <AdminSearchBar
              value={table.searchQuery}
              onChange={table.handleSearchChange}
              placeholder="Search users by name, email..."
            />

            <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto dropdown-scrollbar -mx-4 sm:mx-0">
              <div className="min-w-[640px] sm:min-w-0">
                <table className="w-full border-collapse table-fixed">
                <colgroup>
                  <col className="w-[15%]" />
                  <col className="w-[15%]" />
                  <col className="w-[30%]" />
                  <col className="w-[15%]" />
                  <col className="w-[25%]" />
                </colgroup>
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr>
                    {USER_TABLE_COLUMNS.map(({ field, label }) => (
                      <SortableTableHeader
                        key={field}
                        field={field}
                        label={label}
                        currentSortField={table.sortField}
                        sortDirection={table.sortDirection}
                        isUsingDefaultSort={table.isUsingDefaultSort}
                        onSort={table.handleSort}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <AdminLoadingState colSpan={5} message="Loading users..." />
                  ) : users.length === 0 ? (
                    <AdminEmptyState colSpan={5} message="No users found" />
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`cursor-pointer transition-colors ${
                          selectedUser?.id === user.id 
                            ? 'bg-primary/10 hover:bg-primary/15' 
                            : 'hover:bg-muted/50 active:bg-muted/70'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-foreground text-center">{user.name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-foreground text-center">{user.surname || '-'}</td>
                        <td className="px-4 py-3 text-sm text-foreground text-center">{user.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                              backgroundColor: (user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') ? 'var(--admin-badge-admin-bg)' : 'var(--admin-badge-user-bg)',
                              color: (user.role === 'ADMIN' || user.role === 'HEAD_ADMIN') ? 'var(--admin-badge-admin-text)' : 'var(--admin-badge-user-text)',
                            }}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap text-center">
                          {user.dateOfRegister ? formatDateShort(user.dateOfRegister, 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>

            <AdminPagination
              currentCount={users.length}
              totalCount={totalElements}
              page={table.page}
              totalPages={totalPages}
              onPageChange={table.setPage}
              itemLabel="users"
            />
          </div>

          {/* Right Side - Edit Form */}
          <div ref={editorCardRef} className="bg-card rounded-2xl border shadow-lg overflow-hidden flex flex-col min-h-170">
            <div className="p-6 pb-4 shrink-0">
              <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Edit User
              </h2>
            </div>

            {selectedUser ? (
              <div className="px-6 pb-6 overflow-y-auto dropdown-scrollbar flex-1 min-h-0">
                <div className="space-y-5">
                <FormField icon={<User className="w-4 h-4" />} label="Name" value={selectedUser.name || ''} disabled />
                <FormField icon={<User className="w-4 h-4" />} label="Surname" value={selectedUser.surname || ''} disabled />
                <FormField icon={<Mail className="w-4 h-4" />} label="Email" value={selectedUser.email} disabled />

                {/* Role Field - Editable */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </Label>
                  <div className="flex gap-2">
                    {(['USER', 'ADMIN'] as const).map((role) => {
                      const isEditingSelf = currentUser?.id === selectedUser.id;
                      const isAdminBlocked = currentUser?.role === 'ADMIN' && (selectedUser.role === 'ADMIN' || selectedUser.role === 'HEAD_ADMIN');
                      const isDisabled = isEditingSelf || isAdminBlocked;
                      return (
                        <Button
                          key={role}
                          type="button"
                          variant={editRole === role ? 'default' : 'outline'}
                          onClick={() => setEditRole(role)}
                          disabled={isDisabled}
                          className="flex-1"
                        >
                          {role}
                        </Button>
                      );
                    })}
                  </div>
                  {currentUser?.id === selectedUser.id && (
                    <p className="text-xs text-muted-foreground mt-2">
                      You cannot change your own role.
                    </p>
                  )}
                  {currentUser?.role === 'ADMIN' && currentUser?.id !== selectedUser.id && (selectedUser.role === 'ADMIN' || selectedUser.role === 'HEAD_ADMIN') && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Admins cannot modify other admin accounts. Contact the head admin to change the role.
                    </p>
                  )}
                </div>

                <FormField
                  icon={<Calendar className="w-4 h-4" />}
                  label="Date of Register"
                  value={selectedUser.dateOfRegister ? formatDateShort(selectedUser.dateOfRegister, 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                  disabled
                />

                <Button
                  onClick={handleSaveChanges}
                  disabled={
                    isSaving || 
                    editRole === selectedUser.role ||
                    currentUser?.id === selectedUser.id ||
                    (currentUser?.role === 'ADMIN' && (selectedUser.role === 'ADMIN' || selectedUser.role === 'HEAD_ADMIN'))
                  }
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
                  Only the Role field can be edited.<br />Other fields are read-only.
                </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <AdminEmptySelection
                  icon={<UsersIcon className="w-8 h-8 text-muted-foreground" />}
                  message="Select a user from the table to edit"
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Simple reusable form field for display-only fields
const FormField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  disabled?: boolean;
}> = ({ icon, label, value, disabled }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-muted-foreground">
      {icon}
      {label}
    </Label>
    <Input value={value} disabled={disabled} className="bg-muted/50" />
  </div>
);

export default AdminUsersPage;
