"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCase, getResponseOption, getResponseOptionCount } from "@/lib/genlayer/crisisproof";
import { CrisisCase, ResponseOption } from "@/lib/genlayer/types";
import { ResponseOptionForm } from "@/components/response-options/ResponseOptionForm";
import { ResponseOptionCard } from "@/components/response-options/ResponseOptionCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Loader, LayoutGrid } from "lucide-react";

export default function OptionsPage() {
  const { caseId } = useParams();
  const id = Number(caseId);
  const [crisisCase, setCrisisCase] = useState<CrisisCase | null>(null);
  const [options, setOptions] = useState<ResponseOption[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [c, count] = await Promise.all([getCase(id), getResponseOptionCount(id)]);
      setCrisisCase(c);
      const optList = await Promise.all(Array.from({ length: count }, (_, i) => getResponseOption(id, i)));
      setOptions(optList);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/app/cases/${id}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-emergency-amber" />
            <h1 className="text-xl font-grotesk font-bold text-cold-white">Response Option Board</h1>
          </div>
          <p className="text-xs text-muted-text font-mono">Case #{id} — Add 2–6 crisis response options</p>
        </div>
      </div>

      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-5">
        <p className="text-sm font-grotesk font-semibold text-cold-white mb-4">Add Response Option</p>
        <ResponseOptionForm caseId={id} onSuccess={load} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader className="w-5 h-5 text-emergency-amber animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-mono text-muted-text uppercase tracking-wider">Options ({options.length}/6)</p>
          {options.map((o) => <ResponseOptionCard key={o.option_id} option={o} />)}
        </div>
      )}
    </div>
  );
}
