import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiService } from "@/services/api";
import type {
  AdminHobby,
  CreateAdminHobbyRequest,
} from "@/services/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatHobbyLabel } from "@/lib/referenceOptions";
import {
  AdminHeader,
  AdminSearchBar,
  AdminPagination,
  AdminLoadingState,
  AdminEmptyState,
  AdminEmptySelection,
  SortableTableHeader,
  AdminEmojiCell,
} from "@/components/admin";
import { useAdminTable } from "@/hooks/useAdminTable";
import { Loader2, Sparkles, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQueryClient } from "@tanstack/react-query";

type HobbySortField = "displayLabel" | "hobbyName";

const HOBBY_SORT_COLUMNS: { field: HobbySortField; label: string }[] = [
  { field: "displayLabel", label: "Label" },
  { field: "hobbyName", label: "Key" },
];

const EMPTY_FORM: CreateAdminHobbyRequest = {
  hobbyName: "",
  displayLabel: "",
  emoji: "",
};

const AdminHobbiesPage: React.FC = () => {
  useDocumentTitle("Admin - Hobbies");
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<AdminHobby[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const table = useAdminTable<HobbySortField>({
    defaultSortField: "displayLabel",
    defaultSortDirection: "asc",
  });

  const [selected, setSelected] = useState<AdminHobby | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CreateAdminHobbyRequest>(EMPTY_FORM);
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
      const result = await apiService.getAdminHobbies({
        page: table.page,
        size: table.pageSize,
        sort: table.sortString,
        search: table.searchQuery || undefined,
      });
      setRows(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch {
      toast.error("Failed to load hobbies");
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
    if (
      !form.hobbyName.trim() ||
      !form.displayLabel.trim() ||
      !form.emoji.trim()
    ) {
      toast.error("Key, label, and emoji are required");
      return;
    }
    setIsSaving(true);
    try {
      await apiService.createAdminHobby({
        hobbyName: form.hobbyName.trim(),
        displayLabel: form.displayLabel.trim(),
        emoji: form.emoji.trim(),
      });
      toast.success("Hobby added");
      invalidateReference();
      await fetchRows();
      cancelCreate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add hobby");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || isCreating) return;
    if (!window.confirm("Delete this hobby? User links will be removed."))
      return;
    setIsDeleting(true);
    try {
      await apiService.deleteAdminHobby(selected.id);
      toast.success("Hobby deleted");
      invalidateReference();
      setRows((prev) => prev.filter((r) => r.id !== selected.id));
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
        title="Hobbies"
        icon={
          <Sparkles
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
            Add Hobby
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
              placeholder="Search label or key..."
            />

            <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto dropdown-scrollbar -mx-4 sm:mx-0">
              <div className="min-w-[640px] sm:min-w-0">
                <table className="w-full border-collapse table-fixed">
                  <colgroup>
                    <col className="w-[18%]" />
                    <col className="w-[41%]" />
                    <col className="w-[41%]" />
                  </colgroup>
                  <thead className="bg-muted/50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                        Emoji
                      </th>
                      {HOBBY_SORT_COLUMNS.map(({ field, label }) => (
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
                      <AdminEmptyState colSpan={3} message="No hobbies" />
                    ) : (
                      rows.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => {
                            setSelected(row);
                            setIsCreating(false);
                          }}
                          className={`cursor-pointer transition-colors ${
                            selected?.id === row.id
                              ? "bg-primary/10 hover:bg-primary/15"
                              : "hover:bg-muted/50 active:bg-muted/70"
                          }`}
                        >
                          <td className="px-4 py-3 text-center align-middle">
                            <AdminEmojiCell emoji={row.emoji} />
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground text-center">
                            {formatHobbyLabel(row)}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground text-center font-mono">
                            {row.hobbyName}
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
              itemLabel="hobbies"
            />
          </div>

          <div
            ref={editorRef}
            className="bg-card rounded-2xl border shadow-lg overflow-hidden flex flex-col min-h-[50vh]"
          >
            {!selected && !isCreating ? (
              <AdminEmptySelection
                icon={<Sparkles className="w-8 h-8 text-muted-foreground" />}
                message="Select a hobby from the table to delete, or create a new one"
                action={
                  <Button onClick={startCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Hobby
                  </Button>
                }
              />
            ) : isCreating ? (
              <div className="p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
                <h3 className="text-lg font-semibold text-foreground">
                  New hobby
                </h3>
                <div className="space-y-2">
                  <Label>Key (slug)</Label>
                  <Input
                    value={form.hobbyName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hobbyName: e.target.value }))
                    }
                    placeholder="e.g. wine_tasting"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display label</Label>
                  <Input
                    value={form.displayLabel}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, displayLabel: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emoji</Label>
                  <Input
                    value={form.emoji}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, emoji: e.target.value }))
                    }
                    className="text-2xl min-h-11 admin-cms-emoji"
                    maxLength={16}
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
                <h3 className="text-lg font-semibold text-foreground">
                  {selected
                    ? formatHobbyLabel(selected)
                    : ""}
                </h3>
                <dl className="space-y-3 text-muted-foreground">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Key
                    </dt>
                    <dd className="font-mono text-sm mt-1">{selected?.hobbyName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground/80">
                      Emoji
                    </dt>
                    <dd className="mt-1">
                      <AdminEmojiCell
                        emoji={selected?.emoji}
                        className="text-3xl min-h-11"
                      />
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

export default AdminHobbiesPage;
