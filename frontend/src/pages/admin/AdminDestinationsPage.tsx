import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
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
  Home,
  Sun,
  Moon,
  Search,
  ChevronUp,
  ChevronDown,
  Save,
  Loader2,
  MapPin,
  Globe,
  DollarSign,
  Image,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type SortField = 'name' | 'location' | 'continent' | 'budgetPerDay' | 'createdAt' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const CONTINENTS = ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania', 'Antarctica'];
const MAX_PERKS = 5;

const AdminDestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Data state
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & sorting state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state
  const [selectedDestination, setSelectedDestination] = useState<AdminDestination | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState<CreateDestinationRequest>({
    name: '',
    location: '',
    continent: '',
    imageUrl: '',
    imageAlt: '',
    overview: '',
    budgetPerDay: 0,
    whyVisit: '',
    studentPerks: [],
  });
  const [newPerk, setNewPerk] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch destinations
  const fetchDestinations = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getAdminDestinations({
        page,
        size: pageSize,
        sort: `${sortField},${sortDirection}`,
        search: searchQuery || undefined,
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
  }, [page, pageSize, sortField, sortDirection, searchQuery]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

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

  // Handle destination selection
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

  // Handle create new
  const handleCreateNew = () => {
    setSelectedDestination(null);
    setIsCreating(true);
    setFormData({
      name: '',
      location: '',
      continent: '',
      imageUrl: '',
      imageAlt: '',
      overview: '',
      budgetPerDay: 0,
      whyVisit: '',
      studentPerks: [],
    });
  };

  // Add perk
  const handleAddPerk = () => {
    const currentPerks = formData.studentPerks || [];
    if (currentPerks.length >= MAX_PERKS) {
      toast.error(`Maximum ${MAX_PERKS} perks allowed`);
      return;
    }
    if (newPerk.trim()) {
      setFormData({
        ...formData,
        studentPerks: [...currentPerks, newPerk.trim()],
      });
      setNewPerk('');
    }
  };

  // Remove perk
  const handleRemovePerk = (index: number) => {
    setFormData({
      ...formData,
      studentPerks: (formData.studentPerks || []).filter((_, i) => i !== index),
    });
  };

  // Handle save changes
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

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDestination) return;
    
    if (!confirm('Are you sure you want to delete this destination?')) return;

    setIsDeleting(true);
    try {
      await apiService.deleteDestination(selectedDestination.id);
      setDestinations(destinations.filter(d => d.id !== selectedDestination.id));
      setSelectedDestination(null);
      setFormData({
        name: '',
        location: '',
        continent: '',
        imageUrl: '',
        imageAlt: '',
        overview: '',
        budgetPerDay: 0,
        whyVisit: '',
        studentPerks: [],
      });
      toast.success('Destination deleted successfully');
    } catch (error) {
      console.error('Failed to delete destination:', error);
      toast.error('Failed to delete destination');
    } finally {
      setIsDeleting(false);
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

  const currentPerksCount = formData.studentPerks?.length || 0;

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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, var(--admin-gradient-start), var(--admin-gradient-end))' }}>
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Destination Management</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateNew}
              className="gap-2"
              style={{ background: 'linear-gradient(to right, var(--admin-gradient-start), var(--admin-gradient-end))' }}
            >
              <Plus className="w-4 h-4" />
              Add Destination
            </Button>
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

      {/* Main Content */}
      <main className="p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
          {/* Left Side - Destinations Table */}
          <div className="xl:col-span-2 bg-card rounded-2xl border shadow-lg overflow-hidden flex flex-col h-[calc(100vh-180px)]">
            {/* Search Bar */}
            <div className="p-4 border-b bg-muted/30 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search destinations by name, location..."
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
                      className="px-3 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        <SortIndicator field="name" />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('location')}
                    >
                      <div className="flex items-center gap-1">
                        Location
                        <SortIndicator field="location" />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('continent')}
                    >
                      <div className="flex items-center gap-1">
                        Continent
                        <SortIndicator field="continent" />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('budgetPerDay')}
                    >
                      <div className="flex items-center gap-1">
                        Budget/Day
                        <SortIndicator field="budgetPerDay" />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-1">
                        Created
                        <SortIndicator field="createdAt" />
                      </div>
                    </th>
                    <th
                      className="px-3 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleSort('updatedAt')}
                    >
                      <div className="flex items-center gap-1">
                        Updated
                        <SortIndicator field="updatedAt" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading destinations...</p>
                      </td>
                    </tr>
                  ) : destinations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        No destinations found
                      </td>
                    </tr>
                  ) : (
                    destinations.map((destination) => (
                      <tr
                        key={destination.id}
                        onClick={() => handleSelectDestination(destination)}
                        className={`cursor-pointer border-b transition-colors ${
                          selectedDestination?.id === destination.id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <td className="px-3 py-3 text-sm text-foreground font-medium">{destination.name}</td>
                        <td className="px-3 py-3 text-sm text-foreground">{destination.location}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--admin-decorative-emerald)', color: 'var(--admin-gradient-start)' }}>
                            {destination.continent}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-sm text-foreground">
                          ${destination.budgetPerDay || 0}
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {destination.createdAt ? formatDate(destination.createdAt) : '-'}
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">
                          {destination.updatedAt ? formatDate(destination.updatedAt) : '-'}
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
                Showing {destinations.length} of {totalElements} destinations
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
              <MapPin className="w-5 h-5 text-primary" />
              {isCreating ? 'Create Destination' : 'Edit Destination'}
            </h2>

            {selectedDestination || isCreating ? (
              <div className="space-y-5 flex-1 overflow-y-auto">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Name *
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Paris"
                  />
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Location *
                  </Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., France"
                  />
                </div>

                {/* Continent Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Continent *
                  </Label>
                  <Select
                    value={formData.continent}
                    onValueChange={(value) => setFormData({ ...formData, continent: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select continent" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTINENTS.map((continent) => (
                        <SelectItem key={continent} value={continent}>
                          {continent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget Per Day Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget Per Day
                  </Label>
                  <Input
                    type="number"
                    value={formData.budgetPerDay || ''}
                    onChange={(e) => setFormData({ ...formData, budgetPerDay: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 100"
                    className="no-spinners"
                  />
                </div>

                {/* Image URL Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Image URL
                  </Label>
                  <Input
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                {/* Image Alt Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Image Alt Text
                  </Label>
                  <Input
                    value={formData.imageAlt || ''}
                    onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                    placeholder="Description of the image"
                  />
                </div>

                {/* Overview Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Overview
                  </Label>
                  <Textarea
                    value={formData.overview || ''}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Brief overview of the destination..."
                    rows={3}
                  />
                </div>

                {/* Why Visit Field */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Why Visit
                  </Label>
                  <Textarea
                    value={formData.whyVisit || ''}
                    onChange={(e) => setFormData({ ...formData, whyVisit: e.target.value })}
                    placeholder="Why should students visit this destination..."
                    rows={3}
                  />
                </div>

                {/* Student Perks Field */}
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
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddPerk}
                        disabled={currentPerksCount >= MAX_PERKS || !newPerk.trim()}
                        className="gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Perk
                      </Button>
                    </div>
                    {currentPerksCount > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(formData.studentPerks || []).map((perk, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            {perk}
                            <button
                              type="button"
                              onClick={() => handleRemovePerk(index)}
                              className="hover:text-destructive"
                            >
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
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isCreating ? 'CREATE DESTINATION' : 'SAVE CHANGES'}
                      </>
                    )}
                  </Button>

                  {selectedDestination && !isCreating && (
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          DELETE DESTINATION
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Fields marked with * are required.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Select a destination from the table to edit
                </p>
                <Button
                  onClick={handleCreateNew}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create New Destination
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDestinationsPage;
