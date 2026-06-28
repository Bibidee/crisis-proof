"use client";

import { useState } from "react";
import { useWallet } from "@/lib/context/WalletContext";
import { addResponseOption } from "@/lib/genlayer/crisisproof";
import { validateOptionForm } from "@/lib/validation/option-schema";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TransactionCommandBar } from "@/components/contract/TransactionCommandBar";
import { TxState } from "@/lib/genlayer/types";
import { REVERSIBILITY_OPTIONS, TIME_SENSITIVITY_OPTIONS, CONTRACT_ADDRESS } from "@/lib/genlayer/constants";

const ACTION_TYPES = [
  "Emergency shutdown", "Pause affected function", "Full protocol pause", "Targeted freeze",
  "Public disclosure", "Governance escalation", "Compensation review", "Continue with monitoring",
  "Request independent audit", "Reject claim", "Request more evidence", "Regulatory escalation",
].map((v) => ({ value: v, label: v }));

interface Props {
  caseId: number;
  onSuccess?: () => void;
}

export function ResponseOptionForm({ caseId, onSuccess }: Props) {
  const { address, connected } = useWallet();
  const [tx, setTx] = useState<TxState>({ status: "idle" });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [form, setForm] = useState({
    title: "", summary: "", action_type: "", expected_benefit: "",
    key_risk: "", affected_stakeholders: "", time_sensitivity: "",
    reversibility: "", communication_requirement: "", failure_conditions: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateOptionForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setTx({ status: "pending", fn: "add_response_option" });
    try {
      const hash = await addResponseOption({ ...form, case_id: caseId }, address as `0x${string}`);
      setTx({ status: "success", hash, fn: "add_response_option" });
      setForm({ title: "", summary: "", action_type: "", expected_benefit: "",
        key_risk: "", affected_stakeholders: "", time_sensitivity: "",
        reversibility: "", communication_requirement: "", failure_conditions: "" });
      setErrors({});
      onSuccess?.();
    } catch (err: unknown) {
      setTx({ status: "error", error: err instanceof Error ? err.message : "Failed", fn: "add_response_option" });
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input id="opt-title" label="Option Title *" placeholder="e.g. Pause affected function only"
            value={form.title} onChange={set("title")} error={errors.title} />
          <Select id="opt-action" label="Action Type *" options={ACTION_TYPES}
            placeholder="Select action type" value={form.action_type} onChange={set("action_type")} error={errors.action_type} />
        </div>

        <Textarea id="opt-summary" label="Option Summary *" rows={3}
          placeholder="Describe what this option entails and how it would be executed..."
          value={form.summary} onChange={set("summary")} error={errors.summary} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea id="opt-benefit" label="Expected Benefit *" rows={2}
            placeholder="What does this option achieve if it works..."
            value={form.expected_benefit} onChange={set("expected_benefit")} error={errors.expected_benefit} />
          <Textarea id="opt-risk" label="Key Risk *" rows={2}
            placeholder="What is the main risk if this option fails or is wrong..."
            value={form.key_risk} onChange={set("key_risk")} error={errors.key_risk} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select id="opt-time" label="Time Sensitivity"
            options={TIME_SENSITIVITY_OPTIONS.map((v) => ({ value: v, label: v }))}
            placeholder="Select" value={form.time_sensitivity} onChange={set("time_sensitivity")} />
          <Select id="opt-rev" label="Reversibility"
            options={REVERSIBILITY_OPTIONS.map((v) => ({ value: v, label: v }))}
            placeholder="Select" value={form.reversibility} onChange={set("reversibility")} />
          <Input id="opt-stakeholders" label="Affected Stakeholders"
            placeholder="e.g. All token holders"
            value={form.affected_stakeholders} onChange={set("affected_stakeholders")} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea id="opt-comms" label="Communication Requirement" rows={2}
            placeholder="What needs to be communicated and to whom..."
            value={form.communication_requirement} onChange={set("communication_requirement")} />
          <Textarea id="opt-fail" label="Failure Conditions" rows={2}
            placeholder="Under what conditions would this option make things worse..."
            value={form.failure_conditions} onChange={set("failure_conditions")} />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="amber" loading={tx.status === "pending"} disabled={!connected}>
            Add Response Option
          </Button>
        </div>
      </form>
      <TransactionCommandBar tx={tx} walletAddress={address || ""} contractAddress={CONTRACT_ADDRESS} />
    </>
  );
}
