"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/lib/context/WalletContext";
import { createCrisisCase } from "@/lib/genlayer/crisisproof";
import { validateCaseForm } from "@/lib/validation/case-schema";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TransactionCommandBar } from "@/components/contract/TransactionCommandBar";
import { TxState } from "@/lib/genlayer/types";
import { CRISIS_TYPES, URGENCY_LEVELS, CONTRACT_ADDRESS } from "@/lib/genlayer/constants";
import { AlertTriangle } from "lucide-react";

export function CrisisCaseForm() {
  const router = useRouter();
  const { address, connected, wrongNetwork, provider } = useWallet();
  const [tx, setTx] = useState<TxState>({ status: "idle" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [form, setForm] = useState({
    title: "",
    organisation: "",
    crisis_type: "",
    incident_summary: "",
    affected_users: "",
    reported_harm: "",
    urgency_level: "",
    decision_deadline: "",
    current_response_hypothesis: "",
    known_constraints: "",
    evidence_summary: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateCaseForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!CONTRACT_ADDRESS) { alert("Contract not deployed yet. Set NEXT_PUBLIC_CRISISPROOF_CONTRACT_ADDRESS."); return; }

    setTx({ status: "pending", fn: "create_crisis_case" });
    try {
      const hash = await createCrisisCase(form, address as `0x${string}`);
      setTx({ status: "success", hash, fn: "create_crisis_case" });
      router.push("/app?new=1");
    } catch (err: unknown) {
      setTx({ status: "error", error: err instanceof Error ? err.message : "Transaction failed", fn: "create_crisis_case" });
    }
  }

  if (!connected) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-8 h-8 text-emergency-amber mx-auto mb-3" />
        <p className="text-cold-white font-inter">Connect your wallet to create a crisis case</p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input id="title" label="Case Title *" placeholder="e.g. Bridge Contract Exploit — June 2026"
            value={form.title} onChange={set("title")} error={errors.title} />
          <Input id="organisation" label="Organisation *" placeholder="Protocol, DAO, or institution name"
            value={form.organisation} onChange={set("organisation")} error={errors.organisation} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select id="crisis_type" label="Crisis Type *"
            options={CRISIS_TYPES.map((t) => ({ value: t, label: t }))}
            placeholder="Select crisis type" value={form.crisis_type} onChange={set("crisis_type")}
            error={errors.crisis_type} />
          <Select id="urgency_level" label="Urgency Level *"
            options={URGENCY_LEVELS.map((u) => ({ value: u, label: u }))}
            placeholder="Select urgency" value={form.urgency_level} onChange={set("urgency_level")}
            error={errors.urgency_level} />
        </div>

        <Textarea id="incident_summary" label="Incident Summary *" rows={4}
          placeholder="Describe what happened, when it was detected, and its current scope..."
          value={form.incident_summary} onChange={set("incident_summary")} error={errors.incident_summary} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Textarea id="affected_users" label="Affected Users / Stakeholders *" rows={3}
            placeholder="Who is affected and how many..."
            value={form.affected_users} onChange={set("affected_users")} error={errors.affected_users} />
          <Textarea id="reported_harm" label="Reported Harm *" rows={3}
            placeholder="What harm has been confirmed or alleged..."
            value={form.reported_harm} onChange={set("reported_harm")} error={errors.reported_harm} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input id="decision_deadline" label="Decision Deadline" placeholder="e.g. 2026-06-28 18:00 UTC"
            value={form.decision_deadline} onChange={set("decision_deadline")} />
          <Textarea id="current_response_hypothesis" label="Current Response Hypothesis" rows={2}
            placeholder="What action is the team considering right now..."
            value={form.current_response_hypothesis} onChange={set("current_response_hypothesis")} />
        </div>

        <Textarea id="known_constraints" label="Known Constraints" rows={2}
          placeholder="Legal, regulatory, operational, or technical constraints on your response..."
          value={form.known_constraints} onChange={set("known_constraints")} />

        <Textarea id="evidence_summary" label="Evidence Summary" rows={3}
          placeholder="Brief summary of available evidence (full evidence will be added next)..."
          value={form.evidence_summary} onChange={set("evidence_summary")} />

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-muted-text font-mono">
            Caller: {address?.slice(0, 14)}...
          </p>
          <Button type="submit" variant="redline" size="lg" loading={tx.status === "pending"}
            disabled={!connected || wrongNetwork}>
            Create Crisis Case
          </Button>
        </div>
      </form>
      <TransactionCommandBar tx={tx} walletAddress={address || ""} contractAddress={CONTRACT_ADDRESS} />
    </>
  );
}
