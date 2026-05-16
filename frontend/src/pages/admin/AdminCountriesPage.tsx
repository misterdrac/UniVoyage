import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import type {
  AdminCountry,
  CreateAdminCountryRequest,
} from "@/services/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AdminHeader,
  AdminSearchBar,
  AdminPagination,
  AdminLoadingState,
  AdminEmptyState,
  AdminEmptySelection,
  SortableTableHeader,
} from "@/components/admin";
import { useAdminTable } from "@/hooks/useAdminTable";
import { Loader2, Globe2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQueryClient } from "@tanstack/react-query";

type CountrySortField = "countryName" | "isoCode" | "currencyCode";

const COUNTRY_TABLE_COLUMNS: { field: CountrySortField; label: string }[] = [
  { field: "countryName", label: "Country" },
  { field: "isoCode", label: "ISO" },
  { field: "currencyCode", label: "Currency" },
];

const EMPTY_FORM: CreateAdminCountryRequest = {
  isoCode: "",
  countryName: "",
  currencyCode: "",
  currencyName: "",
};

const AdminCountriesPage: React.FC = () => {
  useDocumentTitle("Admin - Countries");
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<AdminCountry[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const table = useAdminTable<CountrySortField>({
    defaultSortField: "countryName",
    defaultSortDirection: "asc",
  });

  const [selected, setSelected] = useState<AdminCountry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CreateAdminCountryRequest>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const tableCardRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const matchHeights = () => {
      if (tableCardRef.current && editorRef.current) {
        editorRef.current.style.height = `${tableCardRef.current.offsetHeight}px`;
      }
    };
    const timeoutId = setTimeout(matchHeights, 0);
    window.addEventListener("resize", matchHeights);
    const observer = new MutationObserver(matchHeights);
    if (tableCardRef.current) {
      observer.observe(tableCardRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", matchHeights);
      observer.disconnect();
    };
  }, [rows, selected, isCreating, table.page]);

  const fetchRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getAdminCountries({
        page: table.page,
        size: table.pageSize,
        sort: table.sortString,
        search: table.searchQuery || undefined,
      });
      setRows(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      toast.error("Failed to load countries");
    } finally {
      setIsLoading(false);
    }
  }, [table.page, table.pageSize, table.sortString, table.searchQuery]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const invalidateReference = () => {
    void queryClient.invalidateQueries({
      queryKey: ["reference", "dictionaries"],
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setSelected(null);
    setForm(EMPTY_FORM);
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setForm(EMPTY_FORM);
  };

  const handleCreate = async () => {
    const iso = form.isoCode.trim().toUpperCase();
    const cc = form.currencyCode.trim().toUpperCase();
    if (!form.countryName.trim() || iso.length !== 2) {
      toast.error("Valid 2-letter ISO code and country name are required");
      return;
    }
    if (cc.length !== 3) {
      toast.error("Currency code must be 3 letters");
      return;
    }
    setIsSaving(true);
    try {
      await apiService.createAdminCountry({
        isoCode: iso,
        countryName: form.countryName.trim(),
        currencyCode: cc,
        currencyName: (form.currencyName ?? "").trim() || null,
      });
      toast.success("Country added");
      invalidateReference();
      await fetchRows();
      cancelCreate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add country");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || isCreating) return;
    if (
      !window.confirm("Delete this country? Related user data may be removed.")
    )
      return;
    setIsDeleting(true);
    try {
      await apiService.deleteAdminCountry(selected.isoCode);
      toast.success("Country deleted");
      invalidateReference();
      setRows((prev) => prev.filter((r) => r.isoCode !== selected.isoCode));
      setSelected(null);
    } catch {
      toast.error("Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--admin-bg-gradient)" }}
    >
      <AdminHeader
        title="Countries"
        icon={
          <Globe2
            className="w-4 h-4"
            style={{ color: "var(--ds-contrast-fg)" }}
          />
        }
        gradientStyle={{
          background:
            "linear-gradient(to bottom right, var(--admin-gradient-start), var(--admin-gradient-end))",
        }}
        actions={
          <Button
            onClick={startCreate}
            className="gap-2"
            style={{
              background:
                "linear-gradient(to right, var(--admin-gradient-start), var(--admin-gradient-end))",
            }}
          >
            <Plus className="w-4 h-4" />
            Add Country
          </Button>
        }
      />

      <main className="p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div
            ref={tableCardRef}
            className="xl:col-span-2 bg-card rounded-2xl border shadow-lg"
          >
            <AdminSearchBar
              value={table.searchQuery}
              onChange={table.handleSearchChange}
              placeholder="Search name or ISO code..."
            />

            <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto dropdown-scrollbar -mx-4 sm:mx-0">
              <div className="min-w-[640px] sm:min-w-0">
                <table className="w-full border-collapse table-fixed">
                  <colgroup>
                    <col className="w-[45%]" />
                    <col className="w-[15%]" />
                    <col className="w-[40%]" />
                  </colgroup>
                  <thead className="bg-muted/50 sticky top-0 z-10">
                    <tr>
                      {COUNTRY_TABLE_COLUMNS.map(({ field, label }) => (
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
                      <AdminLoadingState colSpan={3} message="Loading..." />
                    ) : rows.length === 0 ? (
                      <AdminEmptyState colSpan={3} message="No countries" />
                    ) : (
                      rows.map((row) => (
                        <tr
                          key={row.isoCode}
                          onClick={() => {
                            setSelected(row);
                            setIsCreating(false);
                          }}
                          className={`cursor-pointer transition-colors ${
                            selected?.isoCode === row.isoCode
                              ? "bg-primary/10 hover:bg-primary/15"
                              : "hover:bg-muted/50 active:bg-muted/70"
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-foreground text-center">
                            {row.countryName}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground text-center font-mono">
                            {row.isoCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-mono">
                            {row.currencyCode ?? "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <AdminPagination
              currentCount={rows.length}
              totalCount={totalElements}
              page={table.page}
              totalPages={totalPages}
              onPageChange={table.setPage}
              itemLabel="countries"
            />
          </div>

          <div
            ref={editorRef}
            className="bg-card rounded-2xl border shadow-lg overflow-hidden flex flex-col min-h-[50vh]"
          >
            {!selected && !isCreating ? (
              <AdminEmptySelection
                icon={<Globe2 className="w-8 h-8 text-muted-foreground" />}
                message="Select a country from the table to delete, or create a new one"
                action={
                  <Button onClick={startCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Country
                  </Button>
                }
              />
            ) : isCreating ? (
              <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
                <h3 className="text-lg font-semibold text-foreground">
                  New country
                </h3>
                <div className="space-y-2">
                  <Label>ISO 3166-1 alpha-2</Label>
                  <Input
                    value={form.isoCode}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        isoCode: e.target.value.slice(0, 2).toUpperCase(),
                      }))
                    }
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country name</Label>
                  <Input
                    value={form.countryName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, countryName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency code (ISO 4217)</Label>
                  <Input
                    className="font-mono"
                    value={form.currencyCode}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        currencyCode: e.target.value.slice(0, 3).toUpperCase(),
                      }))
                    }
                    maxLength={3}
                    placeholder="EUR"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency name (optional)</Label>
                  <Input
                    value={form.currencyName ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, currencyName: e.target.value }))
                    }
                    placeholder="Euro"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-auto pt-4">
                  <Button onClick={handleCreate} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Add
                  </Button>
                  <Button variant="ghost" onClick={cancelCreate}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-4 flex-1 text-sm overflow-y-auto">
                <h3 className="text-lg font-semibold">
                  {selected?.countryName}
                </h3>
                <dl className="space-y-3 text-muted-foreground">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      ISO
                    </dt>
                    <dd className="font-mono text-sm mt-1">
                      {selected?.isoCode}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Currency
                    </dt>
                    <dd className="font-mono text-sm mt-1">
                      {selected?.currencyCode ?? "—"}
                      {selected?.currencyName
                        ? ` · ${selected.currencyName}`
                        : ""}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto pt-4">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCountriesPage;
