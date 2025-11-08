"use client";

import * as React from "react";
import {
  format,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const DAYS_OF_WEEK = [
  { key: "sun", label: "Sun" },
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
];

export interface MiniCalendarProps {
  selected?: Date | null;
  onSelect?: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selected,
  onSelect,
  minDate,
  maxDate,
  weekStartsOn = 0,
  className,
}) => {
  const initialDate = selected ?? new Date();
  const [currentWeek, setCurrentWeek] = React.useState<Date>(initialDate);
  const [internalSelected, setInternalSelected] = React.useState<Date | null>(selected ?? null);

  React.useEffect(() => {
    if (selected) {
      setInternalSelected(selected);
      setCurrentWeek(selected);
    } else if (selected === null) {
      setInternalSelected(null);
    }
  }, [selected]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleSelectDay = (day: Date) => {
    setInternalSelected(day);
    onSelect?.(day);
  };

  const handleClearSelection = () => {
    setInternalSelected(null);
    onSelect?.(undefined);
  };

  const canNavigateTo = (target: Date) => {
    if (minDate && target < minDate) return false;
    if (maxDate && target > maxDate) return false;
    return true;
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow", className)}>
      <div className="flex items-center justify-between p-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            const nextWeek = subWeeks(currentWeek, 1);
            if (canNavigateTo(nextWeek)) {
              setCurrentWeek(nextWeek);
            }
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span>{format(currentWeek, "MMMM")}</span>
          <span className="text-muted-foreground">{format(currentWeek, "yyyy")}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            const nextWeek = addWeeks(currentWeek, 1);
            if (canNavigateTo(nextWeek)) {
              setCurrentWeek(nextWeek);
            }
          }}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 px-3 pb-2 text-center text-[11px] font-medium text-muted-foreground">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day.key}>{day.label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 p-3 pt-0">
        {weekDays.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const isSelected = internalSelected && format(internalSelected, "yyyy-MM-dd") === iso;
          const isDisabled = (minDate && day < minDate) || (maxDate && day > maxDate);

          return (
            <Button
              key={iso}
              type="button"
              variant={isSelected ? "default" : "ghost"}
              className={cn(
                "h-9 w-9 p-0 text-sm font-normal",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => handleSelectDay(day)}
              disabled={isDisabled}
            >
              <time dateTime={iso}>{format(day, "d")}</time>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center justify-end gap-2 px-3 pb-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={handleClearSelection}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};