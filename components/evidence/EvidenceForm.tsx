"use client";

import { useState } from "react";
import { useWallet } from "@/lib/context/WalletContext";
import { addEvidence } from "@/lib/genlayer/crisisproof";
import { validateEvidenceForm } from "@/lib/validation/evidence-schema";
import { hashUrl } from "@/lib/utils/hashes";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TransactionCommandBar } from "@/components/contract/TransactionCommandBar";
import { TxState } from "@/lib/genlayer/types";
import { EVIDENCE_CATEGORIES, CONTRACT_ADDRESS } from "@/lib/genlayer/constants";
import { AlertCircle } from "lucide-react";

interface Props {
  caseId: number;
  onSuccess?: () => void;
}

export function EvidenceForm({ caseId, onSuccess }: Props) {
  const { address, connected } = useWallet();
  const [tx, setTx] = useState<TxState>({ status: "idle" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [form, setForm] = useState({
    title: "", evidence_type: "", evidence_url: "", source_name: "",
    source_credibility_note: "", relevance: "", category: "", related_response_option_ids: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateEvidenceForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const hash = await hashUrl(form.evidence_url);
    setTx({ status: "pending", fn: "add_evidence" });
    try {
      const txHash = await addEvidence({ ...form, case_id: caseId, evidence_hash: hash }, address as `0x${string}`);
      setTx({ status: "success", hash: txHash, fn: "add_evidence" });
      setForm({ title: "", evidence_type: "", evidence_url: "", source_name: "",
        source_credibility_note: "", relevance: "", category: "", related_response_option_ids: "" });
      setErrors({});
      onSuccess?.();
    } catch (err: unknown) {
      setTx({ status: "error", error: err instanceof Error ? err.message : "Failed", fn: "add_evidence" });
    }
  }

  return (
    <>
      <div className="bg-emergency-amber/10 border border-emergency-amber/30 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-emergency-amber shrink-0 mt-0.5" />
          <p className="text-xs text-cold-white/80 font-inter">
            Only submit evidence URLs that are intentionally public. Do not submit confidential, private, privileged, employee, customer, legal, or security-sensitive material unless already approved for public use.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input id="ev-title" label="Evidence Title *" placeholder="e.g. Etherscan exploit tx"
            value={form.title} onChange={set("title")} error={errors.title} />
          <Select id="ev-category" label="Evidence Category *"
            options={EVIDENCE_CATEGORIES.map((c) => ({ value: c, label: c }))}
            placeholder="Select category" value={form.category} onChange={set("category")} error={errors.category} />
        </div>

        <Input id="ev-url" label="Evidence URL *" placeholder="https://..."
          value={form.evidence_url} onChange={set("evidence_url")} error={errors.evidence_url} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input id="ev-type" label="Evidence Type" placeholder="e.g. Transaction hash, Audit report"
            value={form.evidence_type} onChange={set("evidence_type")} />
          <Input id="ev-source" label="Source Name *" placeholder="e.g. Etherscan, GitHub"
            value={form.source_name} onChange={set("source_name")} error={errors.source_name} />
        </div>

        <Textarea id="ev-credibility" label="Source Credibility Note" rows={2}
          placeholder="Why is this source credible for this crisis decision..."
          value={form.source_credibility_note} onChange={set("source_credibility_note")} />

        <Textarea id="ev-relevance" label="Relevance to Crisis Decision *" rows={2}
          placeholder="How this evidence informs the response decision..."
          value={form.relevance} onChange={set("relevance")} error={errors.relevance} />

        <Input id="ev-related" label="Related Response Option IDs (optional)"
          placeholder="e.g. option_1, option_2"
          value={form.related_response_option_ids} onChange={set("related_response_option_ids")} />

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" loading={tx.status === "pending"} disabled={!connected}>
            Submit Evidence
          </Button>
        </div>
      </form>
      <TransactionCommandBar tx={tx} walletAddress={address || ""} contractAddress={CONTRACT_ADDRESS} />
    </>
  );
}
