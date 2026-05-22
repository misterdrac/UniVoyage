import { toast as sonnerToast } from "sonner";
import { announceAuth } from "@/lib/auth/authAnnounce";

function publish(message: string, level: "success" | "error" | "info") {
  announceAuth(message);
  if (level === "success") return sonnerToast.success(message);
  if (level === "error") return sonnerToast.error(message);
  return sonnerToast.info(message);
}

export const authToast = {
  success: (message: string) => publish(message, "success"),
  error: (message: string) => publish(message, "error"),
  info: (message: string) => publish(message, "info"),
};
