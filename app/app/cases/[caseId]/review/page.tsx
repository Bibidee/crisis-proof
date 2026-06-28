"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCase, getEvidenceCount, getResponseOptionCount } from "@/lib/genlayer/crisisproof";
import { CrisisCase } from "@/lib/genlayer/types";
import { ReviewRequestPanel } from "@/components/crisis/ReviewRequestPanel";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Loader } from "lucide-react";
import { pollUntilChanged } from "@/lib/utils/poll";

export default function ReviewPage() {
  const { caseId } = useParams();
  const router = useRouter();
  const id = Number(caseId);
  const [crisisCase, setCrisisCase] = useState<CrisisCase | null>(null);
  const [evCount, setEvCount] = useState(0);
  const [optCount, setOptCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    Promise.all([getCase(id), getEvidenceCount(id), getResponseOptionCount(id)])
      .then(([c, ev, opt]) => { setCrisisCase(c); setEvCount(ev); setOptCount(opt); })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSuccess() {
    setPolling(true);
    await pollUntilChanged(
      () => getCase(id),
      (c) => c.status === "VERDICT_ISSUED",
      () => { router.push(`/app/cases/${id}/verdict`); },
      { maxAttempts: 40, interval: 4000 }
    );
    setPolling(false);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={`/app/cases/${id}`}><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-grotesk font-bold text-cold-white">Request Crisis Review</h1>
          <p className="text-xs text-muted-text font-mono">Case #{id}</p>
        </div>
      </div>

      {polling && (
        <div className="flex items-center gap-3 bg-panel-charcoal border border-border-steel rounded-lg p-5">
          <Loader className="w-5 h-5 text-redline animate-spin shrink-0" />
          <div>
            <p className="text-cold-white font-inter font-medium">GenLayer validators are reviewing this case</p>
            <p className="text-sm text-muted-text font-mono">Waiting for consensus verdict — this may take 1–2 minutes...</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader className="w-5 h-5 text-redline animate-spin" /></div>
      ) : crisisCase && !polling ? (
        <ReviewRequestPanel
          crisisCase={crisisCase}
          evidenceCount={evCount}
          optionCount={optCount}
          onSuccess={handleSuccess}
        />
      ) : null}
    </div>
  );
}
