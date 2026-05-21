import { PageFooterVersion } from "@/components/layout/PageFooterVersion";

/** Slim version strip for admin pages (no main site header/footer). */
export function AdminPageFooter() {
  return (
    <footer className="border-t border-border px-6 py-3 text-center bg-card/40">
      <PageFooterVersion />
    </footer>
  );
}
