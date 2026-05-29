import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import type {
  AdminLanguage,
  CreateAdminLanguageRequest,
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
  AdminPageFooter,
} from "@/components/admin";
import { useAdminTable } from "@/hooks/useAdminTable";
import { Loader2, Languages, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQueryClient } from "@tanstack/react-query";

type LangSortField = "langName" | "langCode";

const LANG_TABLE_COLUMNS: { field: LangSortField; label: string }[] = [
  { field: "langName", label: "Language" },
  { field: "langCode", label: "Code" },
];

const EMPTY_FORM: CreateAdminLanguageRequest = {
  langCode: "",
  langName: "",
};

const AdminLanguagesPage: React.FC = () => {
  useDocumentTitle("Admin - Languages");
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<AdminLanguage[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const table = useAdminTable<LangSortField>({
    defaultSortField: "langName",
    defaultSortDirection: "asc",
  });

  const [selected, setSelected] = useState<AdminLanguage | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CreateAdminLanguageRequest>(EMPTY_FORM);
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
      const result = await apiService.getAdminLanguages({
        page: table.page,
        size: table.pageSize,
        sort: table.sortString,
        search: table.searchQuery || undefined,
      });
      setRows(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      toast.error("Failed to load languages");
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
    if (!form.langName.trim() || form.langCode.length !== 2) {
      toast.error("Valid 2-letter code and name are required");
      return;
    }
    setIsSaving(true);
    try {
      await apiService.createAdminLanguage({
        langCode: form.langCode.toLowerCase(),
        langName: form.langName.trim(),
      });
      toast.success("Language added");
      invalidateReference();
      await fetchRows();
      cancelCreate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add language");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || isCreating) return;
    if (!window.confirm("Delete this language? User links will be removed."))
      return;
    setIsDeleting(true);
    try {
      await apiService.deleteAdminLanguage(selected.langCode);
      toast.success("Language deleted");
      invalidateReference();
      setRows((prev) => prev.filter((r) => r.langCode !== selected.langCode));
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
        title="Languages"
        icon={
          <Languages
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
            Add Language
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
              placeholder="Search code or name..."
            />

            <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto dropdown-scrollbar -mx-4 sm:mx-0">
              <div className="min-w-[640px] sm:min-w-0">
                <table className="w-full border-collapse table-fixed">
                  <colgroup>
                    <col className="w-[60%]" />
                    <col className="w-[40%]" />
                  </colgroup>
                  <thead className="bg-muted/50 sticky top-0 z-10">
                    <tr>
                      {LANG_TABLE_COLUMNS.map(({ field, label }) => (
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
                      <AdminLoadingState colSpan={2} message="Loading..." />
                    ) : rows.length === 0 ? (
                      <AdminEmptyState colSpan={2} message="No languages" />
                    ) : (
                      rows.map((row) => (
                        <tr
                          key={row.langCode}
                          onClick={() => {
                            setSelected(row);
                            setIsCreating(false);
                          }}
                          className={`cursor-pointer transition-colors ${
                            selected?.langCode === row.langCode
                              ? "bg-primary/10 hover:bg-primary/15"
                              : "hover:bg-muted/50 active:bg-muted/70"
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-foreground text-center">
                            {row.langName}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground text-center font-mono">
                            {row.langCode}
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
              itemLabel="languages"
            />
          </div>

          <div
            ref={editorRef}
            className="bg-card rounded-2xl border shadow-lg overflow-hidden flex flex-col min-h-[50vh]"
          >
            {!selected && !isCreating ? (
              <AdminEmptySelection
                icon={<Languages className="w-8 h-8 text-muted-foreground" />}
                message="Select a language from the table to delete, or create a new one"
                action={
                  <Button onClick={startCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Language
                  </Button>
                }
              />
            ) : isCreating ? (
              <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
                <h3 className="text-lg font-semibold text-foreground">
                  New language
                </h3>
                <div className="space-y-2">
                  <Label>ISO 639-1 code</Label>
                  <Input
                    value={form.langCode}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        langCode: e.target.value.slice(0, 2).toLowerCase(),
                      }))
                    }
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.langName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, langName: e.target.value }))
                    }
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
                <h3 className="text-lg font-semibold">{selected?.langName}</h3>
                <dl className="space-y-3 text-muted-foreground">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Code
                    </dt>
                    <dd className="font-mono text-sm mt-1">
                      {selected?.langCode}
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
      <AdminPageFooter />
    </div>
  );
};

export default AdminLanguagesPage;
