import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/services/api';
import type { AdminDestination, CreateDestinationRequest } from '@/services/api/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  MapPin,
  Globe,
  DollarSign,
  Image,
  FileText,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type DestinationSortField = 'name' | 'location' | 'continent' | 'budgetPerDay' | 'createdAt' | 'updatedAt';

const DESTINATION_TABLE_COLUMNS: { field: DestinationSortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'location', label: 'Location' },
  { field: 'continent', label: 'Continent' },
  { field: 'budgetPerDay', label: 'Budget/Day' },
  { field: 'createdAt', label: 'Created' },
  { field: 'updatedAt', label: 'Updated' },
];

const CONTINENTS = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania', 'Antarctica'];
const MAX_PERKS = 5;

const EMPTY_FORM: CreateDestinationRequest = {
  name: '',
  location: '',
  continent: '',
  imageUrl: '',
  imageAlt: '',
  overview: '',
  budgetPerDay: 0,
  whyVisit: '',
  studentPerks: [],
};

const AdminDestinationsPage: React.FC = () => {
  // Data state
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Table state
  const table = useAdminTable<DestinationSortField>({
    defaultSortField: 'createdAt',
    defaultSortDirection: 'desc',
  });

  // Selection state
  const [selectedDestination, setSelectedDestination] = useState<AdminDestination | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<CreateDestinationRequest>(EMPTY_FORM);
  const [newPerk, setNewPerk] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch destinations
  const fetchDestinations = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getAdminDestinations({
        page: table.page,
        size: table.pageSize,
        sort: table.sortString,
        search: table.searchQuery || undefined,
      });
      setDestinations(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
      toast.error('Failed to load destinations');
    } finally {
      setIsLoading(false);
    }
  }, [table.page, table.pageSize, table.sortString, table.searchQuery]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const handleSelectDestination = (destination: AdminDestination) => {
    setSelectedDestination(destination);
    setIsCreating(false);
    setFormData({
      name: destination.name,
      location: destination.location,
      continent: destination.continent,
      imageUrl: destination.imageUrl || '',
      imageAlt: destination.imageAlt || '',
      overview: destination.overview || '',
      budgetPerDay: destination.budgetPerDay || 0,
      whyVisit: destination.whyVisit || '',
      studentPerks: destination.studentPerks || [],
    });
  };

  const handleCreateNew = () => {
    setSelectedDestination(null);
    setIsCreating(true);
    setFormData(EMPTY_FORM);
  };

  const handleAddPerk = () => {
    const currentPerks = formData.studentPerks || [];
    if (currentPerks.length >= MAX_PERKS) {
      toast.error(`Maximum ${MAX_PERKS} perks allowed`);
      return;
    }
    if (newPerk.trim()) {
      setFormData({ ...formData, studentPerks: [...currentPerks, newPerk.trim()] });
      setNewPerk('');
    }
  };

  const handleRemovePerk = (index: number) => {
    setFormData({
      ...formData,
      studentPerks: (formData.studentPerks || []).filter((_, i) => i !== index),
    });
  };

  const handleSaveChanges = async () => {
    if (!formData.name || !formData.location || !formData.continent) {
      toast.error('Name, Location, and Continent are required');
      return;
    }

    setIsSaving(true);
    try {
      if (isCreating) {
        const newDestination = await apiService.createDestination(formData);
        setDestinations([newDestination, ...destinations]);
        setSelectedDestination(newDestination);
        setIsCreating(false);
        toast.success('Destination created successfully');
      } else if (selectedDestination) {
        const updatedDestination = await apiService.updateDestination(selectedDestination.id, formData);
        setDestinations(destinations.map(d => d.id === updatedDestination.id ? updatedDestination : d));
        setSelectedDestination(updatedDestination);
        toast.success('Destination updated successfully');
      }
    } catch (error) {
      console.error('Failed to save destination:', error);
      toast.error('Failed to save destination');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDestination || !confirm('Are you sure you want to delete this destination?')) return;

    setIsDeleting(true);
    try {
      await apiService.deleteDestination(selectedDestination.id);
      setDestinations(destinations.filter(d => d.id !== selectedDestination.id));
      setSelectedDestination(null);
      setFormData(EMPTY_FORM);
      toast.success('Destination deleted successfully');
    } catch (error) {
      console.error('Failed to delete destination:', error);
      toast.error('Failed to delete destination');
    } finally {
      setIsDeleting(false);
    }
  };

  const updateField = <K extends keyof CreateDestinationRequest>(field: K, value: CreateDestinationRequest[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentPerksCount = formData.studentPerks?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <AdminHeader
        title="Destination Management"
        icon={<MapPin className="w-4 h-4 text-white" />}
        gradientStyle={{ background: 'linear-gradient(to bottom right, var(--admin-gradient-start), var(--admin-gradient-end))' }}
        actions={
          <Button
            onClick={handleCreateNew}
            className="gap-2"
            style={{ background: 'linear-gradient(to right, var(--admin-gradient-start), var(--admin-gradient-end))' }}
          >
            <Plus className="w-4 h-4" />
            Add Destination
          </Button>
        }
      />

      <main className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          {/* Left Side - Destinations Table */}
          <div className="xl:col-span-2 bg-card rounded-2xl border shadow-lg overflow-hidden flex flex-col h-[calc(100vh-180px)]">
            <AdminSearchBar
              value={table.searchQuery}
              onChange={table.handleSearchChange}
              placeholder="Search destinations by name, location..."
            />

            <div className="overflow-x-auto flex-1 overflow-y-auto dropdown-scrollbar">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {DESTINATION_TABLE_COLUMNS.map(({ field, label }) => (
                      <SortableTableHeader
                        key={field}
                        field={field}
                        label={label}
                        currentSortField={table.sortField}
                        sortDirection={table.sortDirection}
                        onSort={table.handleSort}
                        className="px-3 py-3"
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <AdminLoadingState colSpan={6} message="Loading destinations..." />
                  ) : destinations.length === 0 ? (
                    <AdminEmptyState colSpan={6} message="No destinations found" />
                  ) : (
                    destinations.map((destination) => (
                      <tr
                        key={destination.id}
                        onClick={() => handleSelectDestination(destination)}
                        className={`cursor-pointer border-b transition-colors ${
                          selectedDestination?.id === destination.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                      >
                        <td className="px-3 py-3 text-sm text-foreground font-medium">{destination.name}</td>
                        <td className="px-3 py-3 text-sm text-foreground">{destination.location}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--admin-decorative-emerald)', color: 'var(--admin-gradient-start)' }}>
                            {destination.continent}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-foreground">${destination.budgetPerDay || 0}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {destination.createdAt ? formatDateShort(destination.createdAt, 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {destination.updatedAt ? formatDateShort(destination.updatedAt, 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <AdminPagination
              currentCount={destinations.length}
              totalCount={totalElements}
              page={table.page}
              totalPages={totalPages}
              onPageChange={table.setPage}
              itemLabel="destinations"
            />
          </div>

          {/* Right Side - Edit Form */}
          <div className="bg-card rounded-2xl border shadow-lg p-6 overflow-y-auto dropdown-scrollbar flex flex-col h-[calc(100vh-180px)]">
            <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
              {isCreating ? 'Create Destination' : 'Edit Destination'}
            </h2>

            {selectedDestination || isCreating ? (
              <div className="space-y-5 flex-1 overflow-y-auto">
                {/* Basic Fields */}
                <FormField icon={<MapPin />} label="Name *" value={formData.name} onChange={(v) => updateField('name', v)} placeholder="e.g., Paris" />
                <FormField icon={<Globe />} label="Location *" value={formData.location} onChange={(v) => updateField('location', v)} placeholder="e.g., France" />
                
                {/* Continent Select */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Continent *
                  </Label>
                  <Select value={formData.continent} onValueChange={(v) => updateField('continent', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select continent" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTINENTS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget Per Day
                  </Label>
                  <Input
                    type="number"
                    value={formData.budgetPerDay || ''}
                    onChange={(e) => updateField('budgetPerDay', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 100"
                    className="no-spinners"
                  />
                </div>

                {/* Image Fields */}
                <FormField icon={<Image />} label="Image URL" value={formData.imageUrl || ''} onChange={(v) => updateField('imageUrl', v)} placeholder="https://..." />
                <FormField icon={<Image />} label="Image Alt Text" value={formData.imageAlt || ''} onChange={(v) => updateField('imageAlt', v)} placeholder="Description of the image" />

                {/* Text Areas */}
                <TextAreaField icon={<FileText />} label="Overview" value={formData.overview || ''} onChange={(v) => updateField('overview', v)} placeholder="Brief overview of the destination..." />
                <TextAreaField icon={<FileText />} label="Why Visit" value={formData.whyVisit || ''} onChange={(v) => updateField('whyVisit', v)} placeholder="Why should students visit this destination..." />

                {/* Student Perks */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Student Perks ({currentPerksCount}/{MAX_PERKS})
                  </Label>
                  <div className="space-y-3">
                    <Input
                      value={newPerk}
                      onChange={(e) => setNewPerk(e.target.value)}
                      placeholder="Add a perk..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerk())}
                      disabled={currentPerksCount >= MAX_PERKS}
                    />
                    <div className="flex justify-center">
                      <Button type="button" size="sm" onClick={handleAddPerk} disabled={currentPerksCount >= MAX_PERKS || !newPerk.trim()} className="gap-1">
                        <Plus className="w-4 h-4" />
                        Add Perk
                      </Button>
                    </div>
                    {currentPerksCount > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(formData.studentPerks || []).map((perk, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm">
                            {perk}
                            <button type="button" onClick={() => handleRemovePerk(i)} className="hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="w-full"
                    style={{ background: 'linear-gradient(to right, var(--admin-gradient-start), var(--admin-gradient-end))' }}
                  >
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />{isCreating ? 'CREATE DESTINATION' : 'SAVE CHANGES'}</>
                    )}
                  </Button>

                  {selectedDestination && !isCreating && (
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="w-full">
                      {isDeleting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</>
                      ) : (
                        <><Trash2 className="w-4 h-4 mr-2" />DELETE DESTINATION</>
                      )}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center">Fields marked with * are required.</p>
              </div>
            ) : (
              <AdminEmptySelection
                icon={<MapPin className="w-8 h-8 text-muted-foreground" />}
                message="Select a destination from the table to edit"
                action={
                  <Button onClick={handleCreateNew} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Destination
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable form field components
const FormField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ icon, label, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2">
      <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      {label}
    </Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const TextAreaField: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ icon, label, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2">
      <span className="w-4 h-4 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      {label}
    </Label>
    <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} />
  </div>
);

export default AdminDestinationsPage;
