"use client";

import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  disabled: boolean;
  onParse: () => void;
}

export function TbParseButton({ disabled, onParse }: Props) {
  return (
    <Button
      variant="secondary"
      onClick={onParse}
      disabled={disabled}
      className="w-full"
    >
      <FileSpreadsheet className="h-4 w-4 ml-1" />
      تحليل البيانات / Parse
    </Button>
  );
}
