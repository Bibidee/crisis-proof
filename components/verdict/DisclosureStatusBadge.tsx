"use client";

import { Badge } from "@/components/ui/Badge";
import { Eye, EyeOff, Clock } from "lucide-react";

interface Props {
  recommendation: string;
  compensation?: string;
}

function disclosureVariant(rec: string): "redline" | "amber" | "green" | "default" {
  if (rec.includes("IMMEDIATELY") || rec.includes("URGENT")) return "redline";
  if (rec.includes("WITHIN") || rec.includes("HOURS")) return "amber";
  if (rec.includes("NONE") || rec.includes("NO_DISCLOSURE")) return "default";
  return "blue" as "default";
}

export function DisclosureStatusBadge({ recommendation, compensation }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Eye className="w-3.5 h-3.5 text-muted-text" />
        <span className="text-xs font-mono text-muted-text">Disclosure:</span>
        <Badge variant={disclosureVariant(recommendation)}>
          {recommendation.replace(/_/g, " ")}
        </Badge>
      </div>
      {compensation && (
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-text" />
          <span className="text-xs font-mono text-muted-text">Compensation:</span>
          <Badge variant="amber">{compensation.replace(/_/g, " ")}</Badge>
        </div>
      )}
    </div>
  );
}
