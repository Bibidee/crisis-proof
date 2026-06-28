"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCase, getLatestVerdict } from "@/lib/genlayer/crisisproof";
import { CrisisCase, CrisisVerdict } from "@/lib/genlayer/types";
import { VerdictChamber } from "@/components/verdict/VerdictChamber";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Gavel } from "lucide-react";

export default function VerdictPage() {
  const { caseId } = useParams();
  const id = Number(caseId);
  const [crisisCase, setCrisisCase] = useState<CrisisCase | null>(null);
  const [verdict, setVerdict] = useState<CrisisVerdict | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [c, v] = await Promise.all([getCase(id), getLatestVerdict(id)]);
      setCrisisCase(c);
      setVerdict(v);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/app/cases/${id}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-redline" />
              <h1 className="text-xl font-grotesk font-bold text-cold-white">Verdict Chamber</h1>
            </div>
            <p className="text-xs text-muted-text font-mono">Case #{id} — GenLayer canonical verdict</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
      </div>

      <VerdictChamber verdict={verdict} loading={loading} status={crisisCase?.status || ""} />
    </div>
  );
}
