"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCase, getEvidence, getEvidenceCount, getResponseOption, getResponseOptionCount, getLatestVerdict } from "@/lib/genlayer/crisisproof";
import { CrisisCase, EvidenceRecord, ResponseOption, CrisisVerdict } from "@/lib/genlayer/types";
import { PublicCaseDossier } from "@/components/crisis/PublicCaseDossier";
import { Loader, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function PublicDossierPage() {
  const { caseId } = useParams();
  const id = Number(caseId);
  const [crisisCase, setCrisisCase] = useState<CrisisCase | null>(null);
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [options, setOptions] = useState<ResponseOption[]>([]);
  const [verdict, setVerdict] = useState<CrisisVerdict | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([getCase(id), getEvidenceCount(id), getResponseOptionCount(id)])
      .then(async ([c, evCount, optCount]) => {
        setCrisisCase(c);
        const [evList, optList, v] = await Promise.all([
          Promise.all(Array.from({ length: evCount }, (_, i) => getEvidence(id, i))),
          Promise.all(Array.from({ length: optCount }, (_, i) => getResponseOption(id, i))),
          getLatestVerdict(id),
        ]);
        setEvidence(evList);
        setOptions(optList);
        setVerdict(v);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-crisis-black flex items-center justify-center">
      <Loader className="w-6 h-6 text-redline animate-spin" />
    </div>
  );

  if (error || !crisisCase) return (
    <div className="min-h-screen bg-crisis-black flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="w-8 h-8 text-emergency-amber" />
      <p className="text-cold-white font-inter">This crisis case is not available publicly or does not exist.</p>
      <Link href="/" className="text-xs text-legal-blue font-mono hover:text-cold-white">← Back to CrisisProof</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-crisis-black">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <PublicCaseDossier crisisCase={crisisCase} evidence={evidence} options={options} verdict={verdict} />
      </div>
    </div>
  );
}
