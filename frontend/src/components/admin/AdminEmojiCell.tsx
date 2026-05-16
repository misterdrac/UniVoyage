import React from "react";
import { cn } from "@/lib/utils";

type AdminEmojiCellProps = {
  emoji: string | null | undefined;
  className?: string;
};

/**
 * Emoji-only display for admin tables. No custom font stack — same rendering path as body text / profile labels.
 */
export const AdminEmojiCell: React.FC<AdminEmojiCellProps> = ({
  emoji,
  className,
}) => (
  <span
    className={cn(
      "admin-cms-emoji inline-block text-2xl leading-normal text-foreground",
      className,
    )}
    dir="auto"
  >
    {emoji?.trim() ? emoji : "—"}
  </span>
);
