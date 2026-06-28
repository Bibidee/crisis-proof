"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCase, getEvidence, getEvidenceCount, getResponseOption, getResponseOptionCount, getLatestVerdict } from "@/lib/genlayer/crisisproof";
import { CrisisCase, EvidenceRecord, ResponseOption, CrisisVerdict } from "@/lib/genlayer/types";
import { CrisisTimelineRail } from "@/components/crisis/CrisisTimelineRail";
import { HarmRadius } from "@/components/crisis/HarmRadius";
import { EvidenceWall } from "@/components/evidence/EvidenceWall";
import { ResponseOptionBoard } from "@/components/response-options/ResponseOptionBoard";
import { VerdictChamber } from "@/components/verdict/VerdictChamber";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Loader, ArrowLeft, RefreshCw } from "lucide-react";

export default function CaseDetailPage() {
  const { caseId } = useParams();
  const id = Number(caseId);

  const [crisisCase, setCrisisCase] = useState<CrisisCase | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [options, setOptions] = useState<ResponseOption[]>([]);
  const [verdict, setVerdict] = useState<CrisisVerdict | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    try {
      const [c, evCount, optCount] = await Promise.all([
        getCase(id), getEvidenceCount(id), getResponseOptionCount(id),
      ]);
      setCrisisCase(c);

      const [evList, optList, v] = await Promise.all([
        Promise.all(Array.from({ length: evCount }, (_, i) => getEvidence(id, i))),
        Promise.all(Array.from({ length: optCount }, (_, i) => getResponseOption(id, i))),
        getLatestVerdict(id),
      ]);
      setEvidence(evList);
      setOptions(optList);
      setVerdict(v);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-6 h-6 text-redline animate-spin" />
      </div>
    );
  }

  if (!crisisCase) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-text font-mono">Case #{id} not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-grotesk font-bold text-cold-white">{crisisCase.title}</h1>
            <p className="text-xs text-muted-text font-mono">Case #{id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={loadAll}><RefreshCw className="w-4 h-4" /></Button>
          {!["VERDICT_ISSUED", "UNDER_REVIEW", "CLOSED"].includes(crisisCase.status) && (
            <Link href={`/app/cases/${id}/review`}>
              <Button variant="redline" size="sm">Request Review</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 md:col-span-3 space-y-4">
          <CrisisTimelineRail crisisCase={crisisCase} evidenceCount={evidence.length} optionCount={options.length} />
          <HarmRadius crisisCase={crisisCase} />
          <div className="flex flex-col gap-2">
            <Link href={`/app/cases/${id}/evidence`}><Button variant="outline" size="sm" className="w-full">+ Add Evidence</Button></Link>
            <Link href={`/app/cases/${id}/options`}><Button variant="outline" size="sm" className="w-full">+ Add Option</Button></Link>
            <Link href={`/app/public/${id}`}><Button variant="ghost" size="sm" className="w-full">View Public Dossier</Button></Link>
          </div>
        </div>

        <div className="col-span-12 md:col-span-9 space-y-5">
          <EvidenceWall evidence={evidence} caseId={id} />
          <ResponseOptionBoard options={options} caseId={id} recommendedOptionId={verdict?.recommended_response_option_id} />
          <VerdictChamber verdict={verdict} status={crisisCase.status} />
        </div>
      </div>
    </div>
  );
}
