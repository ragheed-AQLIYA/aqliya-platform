"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  disabled?: boolean;
}

export function TbImportTrigger({ disabled }: Props) {
  return (
    <Button variant="outline" size="sm" disabled={disabled}>
      <Upload className="h-4 w-4 ml-1" />
      استيراد ميزان
    </Button>
  );
}
