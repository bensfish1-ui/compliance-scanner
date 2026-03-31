"use client";

import { useState } from "react";
import { Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScanModal } from "./scan-modal";

export function ScanButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/25"
      >
        <Radar className="mr-2 h-4 w-4" />
        Scan for New Legislation
      </Button>
      <ScanModal open={open} onOpenChange={setOpen} />
    </>
  );
}
