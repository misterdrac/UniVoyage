import React, { useCallback, useEffect, useRef, useState } from "react";
import { apiService } from "@/services/api";
import type { CmsAuditEventType, CmsAuditLog } from "@/services/api/adminApi";
import {
  AdminHeader,
  AdminSearchBar,
  AdminPagination,
  AdminLoadingState,
  AdminEmptyState,
  SortableTableHeader,
  AdminPageFooter,
} from "@/components/admin";
import { useAdminTable } from "@/hooks/useAdminTable";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 400;

type AuditSortField = "createdAt";

const EVENT_OPTIONS: { value: CmsAuditEventType | "all"; label: string }[] = [
  { value: "all", label: "All events" },
  { value: "ADMIN_LOGIN_SUCCESS", label: "Admin login" },
  { value: "ADMIN_LOGIN_FAILED", label: "Failed admin login" },
  { value: "ADMIN_LOGOUT", label: "Admin logout" },
  { value: "USER_ROLE_CHANGED", label: "Role change" },
];

function auditEventLabel(type: CmsAuditEventType): string {
  switch (type) {
    case "ADMIN_LOGIN_SUCCESS":
      return "Admin login";
    case "ADMIN_LOGIN_FAILED":
      return "Failed login";
    case "ADMIN_LOGOUT":
      return "Logout";
    case "USER_ROLE_CHANGED":
      return "Role change";
    default:
      return type;
  }
}

function eventBadgeClass(type: CmsAuditEventType): string {
  switch (type) {
    case "ADMIN_LOGIN_SUCCESS":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    case "ADMIN_LOGIN_FAILED":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "ADMIN_LOGOUT":
      return "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20";
    case "USER_ROLE_CHANGED":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function formatAuditDetails(row: CmsAuditLog): string {
  if (!row.metadata) return "—";
  try {
    const m = JSON.parse(row.metadata) as Record<string, string>;
    if (row.eventType === "USER_ROLE_CHANGED" && m.fromRole && m.toRole) {
      return `${m.fromRole} → ${m.toRole}`;
    }
    if (row.eventType === "ADMIN_LOGIN_SUCCESS" && m.authMethod) {
      return m.authMethod === "google" ? "Google OAuth" : "Password";
    }
    if (row.eventType === "ADMIN_LOGIN_FAILED" && m.reason) {
      return m.reason.replace(/_/g, " ");
    }
  } catch {
    return row.metadata;
  }
  return "—";
}

const AdminAuditPage: React.FC = () => {
  useDocumentTitle("Admin - Audit log");
  const [rows, setRows] = useState<CmsAuditLog[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<CmsAuditEventType | "all">(
    "all",
  );
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const lastCommittedSearchRef = useRef("");

  const table = useAdminTable<AuditSortField>({
    defaultSortField: "createdAt",
    defaultSortDirection: "desc",
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (searchInput !== lastCommittedSearchRef.current) {
        lastCommittedSearchRef.current = searchInput;
        table.setPage(0);
      }
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [searchInput, table.setPage]);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getAuditLogs({
        page: table.page,
        size: table.pageSize,
        sort: table.sortString,
        search: debouncedSearch.trim() || undefined,
        eventType: eventFilter === "all" ? undefined : eventFilter,
      });
      setRows(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load audit log");
    } finally {
      setIsLoading(false);
    }
  }, [
    table.page,
    table.pageSize,
    table.sortString,
    debouncedSearch,
    eventFilter,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--admin-bg-gradient)" }}
    >
      <AdminHeader
        title="Audit log"
        icon={
          <ScrollText
            className="w-4 h-4"
            style={{ color: "var(--ds-contrast-fg)" }}
          />
        }
        gradientStyle={{
          background: "linear-gradient(to bottom right, #64748b, #334155)",
          boxShadow: "0 4px 6px -1px rgba(100, 116, 139, 0.25)",
        }}
      />

      <main className="p-4 sm:p-6">
        <div className="bg-card rounded-2xl border shadow-lg overflow-hidden">
          <AdminSearchBar
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search email, IP, event, details…"
          />

          <div className="px-4 py-3 border-b bg-muted/20 flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-2 min-w-[220px] max-w-sm flex-1">
              <Label
                htmlFor="audit-event-filter"
                className="text-xs font-medium text-muted-foreground"
              >
                Event type
              </Label>
              <Select
                value={eventFilter}
                onValueChange={(v) => {
                  setEventFilter(v as CmsAuditEventType | "all");
                  table.setPage(0);
                }}
              >
                <SelectTrigger
                  id="audit-event-filter"
                  className={cn(
                    "h-10 w-full rounded-2xl border border-border/80 bg-background/90 px-4",
                    "shadow-sm text-sm font-medium text-foreground",
                    "transition-[box-shadow,border-color,background-color]",
                    "hover:bg-background hover:border-border",
                    "focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring",
                  )}
                >
                  <SelectValue placeholder="All events" />
                </SelectTrigger>
                <SelectContent
                  className={cn(
                    "rounded-2xl border border-border/80 shadow-lg",
                    "bg-popover/95 backdrop-blur-md",
                  )}
                  position="popper"
                  sideOffset={6}
                >
                  {EVENT_OPTIONS.map((o) => (
                    <SelectItem
                      key={o.value}
                      value={o.value}
                      className="rounded-xl py-2.5 pl-3 pr-8 text-sm cursor-pointer"
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[720px]">
              <thead className="bg-muted/50">
                <tr>
                  <SortableTableHeader<AuditSortField>
                    field="createdAt"
                    label="Time"
                    currentSortField={table.sortField}
                    sortDirection={table.sortDirection}
                    isUsingDefaultSort={table.isUsingDefaultSort}
                    onSort={table.handleSort}
                    align="left"
                    className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  />
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Event
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Actor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    IP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <AdminLoadingState colSpan={6} message="Loading audit log…" />
                ) : rows.length === 0 ? (
                  <AdminEmptyState colSpan={6} message="No audit entries yet" />
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            eventBadgeClass(row.eventType),
                          )}
                        >
                          {auditEventLabel(row.eventType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                        {row.actorEmail ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">
                        {row.targetEmail ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs">
                        {formatAuditDetails(row)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                        {row.ipAddress ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentCount={rows.length}
            totalCount={totalElements}
            page={table.page}
            totalPages={totalPages}
            onPageChange={table.setPage}
            itemLabel="entries"
          />
        </div>
      </main>
      <AdminPageFooter />
    </div>
  );
};

export default AdminAuditPage;
