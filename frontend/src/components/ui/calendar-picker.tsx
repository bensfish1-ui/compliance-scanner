"use client";

import * as React from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface CalendarPickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  className?: string;
}

export function CalendarPicker({ value, onChange, placeholder = "Pick a date", className }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date());
  const [open, setOpen] = React.useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();

  const blanks = Array.from({ length: startDay }, (_, i) => i);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-slate-500",
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-white">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                {day}
              </div>
            ))}
            {blanks.map((i) => (
              <div key={`blank-${i}`} />
            ))}
            {days.map((day) => {
              const isSelected = value && isSameDay(day, value);
              const isCurrentDay = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    onChange?.(day);
                    setOpen(false);
                  }}
                  className={cn(
                    "h-8 w-8 rounded-md text-sm transition-colors flex items-center justify-center",
                    isSelected
                      ? "bg-primary-600 text-white"
                      : isCurrentDay
                      ? "bg-primary-600/20 text-primary-300"
                      : "text-slate-300 hover:bg-white/5"
                  )}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
