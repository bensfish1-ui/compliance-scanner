"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useAudits } from "@/hooks/use-audits";

export default function AuditCalendarPage() {
  const { data } = useAudits();
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarLoaded, setCalendarLoaded] = useState(false);

  useEffect(() => {
    // Dynamic import for FullCalendar to avoid SSR issues
    async function loadCalendar() {
      if (!calendarRef.current || calendarLoaded) return;
      try {
        const { Calendar } = await import("@fullcalendar/core");
        const dayGridPlugin = (await import("@fullcalendar/daygrid")).default;
        const listPlugin = (await import("@fullcalendar/list")).default;
        const interactionPlugin = (await import("@fullcalendar/interaction")).default;

        const events = (data?.data || []).map((audit) => ({
          id: audit.id,
          title: audit.title,
          start: audit.startDate,
          end: audit.endDate,
          backgroundColor:
            audit.ragStatus === "red" ? "#ef4444" :
            audit.ragStatus === "amber" ? "#f59e0b" : "#10b981",
          borderColor: "transparent",
          url: `/audits/${audit.id}`,
        }));

        const calendar = new Calendar(calendarRef.current, {
          plugins: [dayGridPlugin, listPlugin, interactionPlugin],
          initialView: "dayGridMonth",
          headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,listWeek",
          },
          events,
          height: "auto",
          eventClick: (info) => {
            info.jsEvent.preventDefault();
            if (info.event.url) {
              window.location.href = info.event.url;
            }
          },
        });

        calendar.render();
        setCalendarLoaded(true);
      } catch (e) {
        console.error("Failed to load calendar:", e);
      }
    }

    if (data) loadCalendar();
  }, [data, calendarLoaded]);

  return (
    <div>
      <div className="mb-4">
        <Link href="/audits" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Audits
        </Link>
      </div>

      <PageHeader title="Audit Calendar" description="View scheduled and completed audits" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card glass>
          <CardContent className="p-6">
            <div ref={calendarRef} className="min-h-[600px]" />
            {!calendarLoaded && (
              <div className="flex items-center justify-center h-[600px] text-slate-500">
                Loading calendar...
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
