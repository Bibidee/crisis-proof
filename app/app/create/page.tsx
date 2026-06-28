import { CrisisCaseForm } from "@/components/crisis/CrisisCaseForm";
import { AlertTriangle } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-redline" />
          <h1 className="text-2xl font-grotesk font-bold text-cold-white">Create Crisis Case</h1>
        </div>
        <p className="text-sm text-muted-text font-mono">
          Define the crisis. Evidence and response options will be added next.
        </p>
      </div>
      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-6">
        <CrisisCaseForm />
      </div>
    </div>
  );
}
