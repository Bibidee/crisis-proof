"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { getCase, getEvidence, getEvidenceCount } from "@/lib/genlayer/crisisproof";
import { CrisisCase, EvidenceRecord } from "@/lib/genlayer/types";
import { EvidenceForm } from "@/components/evidence/EvidenceForm";
import { EvidenceCard } from "@/components/evidence/EvidenceCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Loader, FileSearch } from "lucide-react";
import { pollUntilChanged } from "@/lib/utils/poll";

export default function EvidencePage() {
  const { caseId } = useParams();
  const id = Number(caseId);
  const [crisisCase, setCrisisCase] = useState<CrisisCase | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const countRef = useRef<number>(0);

  async function load() {
    setLoading(true);
    try {
      const [c, count] = await Promise.all([getCase(id), getEvidenceCount(id)]);
      setCrisisCase(c);
      countRef.current = count;
      const evList = await Promise.all(Array.from({ length: count }, (_, i) => getEvidence(id, i)));
      setEvidence(evList);
    } finally {
      setLoading(false);
    }
  }

  async function handleSuccess() {
    setPolling(true);
    const prevCount = countRef.current;
    await pollUntilChanged(
      () => getEvidenceCount(id),
      (count) => count > prevCount,
      async (newCount) => {
        countRef.current = newCount;
        const evList = await Promise.all(Array.from({ length: newCount }, (_, i) => getEvidence(id, i)));
        setEvidence(evList);
      }
    );
    setPolling(false);
  }

  useEffect(() => { load(); }, [id]);

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/app/cases/${id}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-legal-blue" />
            <h1 className="text-xl font-grotesk font-bold text-cold-white">Evidence Wall</h1>
          </div>
          <p className="text-xs text-muted-text font-mono">Case #{id} — {crisisCase?.title}</p>
        </div>
      </div>

      <div className="bg-panel-charcoal border border-border-steel rounded-lg p-5">
        <p className="text-sm font-grotesk font-semibold text-cold-white mb-4">Submit New Evidence</p>
        <EvidenceForm caseId={id} onSuccess={handleSuccess} />
      </div>

      {(loading || polling) ? (
        <div className="flex items-center gap-3 justify-center py-8">
          <Loader className="w-5 h-5 text-legal-blue animate-spin" />
          <p className="text-muted-text font-mono text-sm">
            {polling ? "Waiting for transaction to confirm..." : "Loading..."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-mono text-muted-text uppercase tracking-wider">Submitted Evidence ({evidence.length})</p>
          {evidence.map((e) => <EvidenceCard key={e.evidence_id} evidence={e} />)}
        </div>
      )}
    </div>
  );
}
