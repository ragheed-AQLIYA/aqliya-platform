import { createElement } from "react";
import type { ReactElement, ComponentType } from "react";
import {
  XCircle,
  Clock,
  Upload,
  Link,
  RefreshCw,
  CheckCircle,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

export const stateColors: Record<string, string> = {
  missing: "bg-red-100 text-red-700 border-red-300",
  requested: "bg-blue-100 text-blue-700 border-blue-300",
  uploaded: "bg-gray-100 text-gray-700 border-gray-300",
  linked: "bg-purple-100 text-purple-700 border-purple-300",
  reviewed: "bg-amber-100 text-amber-700 border-amber-300",
  accepted: "bg-green-100 text-green-700 border-green-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
};

type IconComp = ComponentType<{ className?: string }>;

const stateIconMap: Record<string, IconComp> = {
  missing: XCircle,
  requested: Clock,
  uploaded: Upload,
  linked: Link,
  reviewed: RefreshCw,
  accepted: CheckCircle,
  rejected: XCircle,
};

export const renderStateIcon = (
  state: string,
  className = "size-3",
): ReactElement | null => {
  const Icon = stateIconMap[state];
  return Icon ? createElement(Icon, { className }) : null;
};

const fileIconMap: Record<string, IconComp> = {
  xlsx: FileSpreadsheet,
  pdf: FileText,
  docx: FileText,
};

export const renderFileIcon = (
  fileType: string,
  className = "size-4",
): ReactElement | null => {
  const Icon = fileIconMap[fileType];
  return Icon ? createElement(Icon, { className }) : null;
};
