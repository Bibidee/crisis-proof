export type EvidenceFormErrors = Record<string, string | undefined>;

export function validateEvidenceForm(data: Record<string, string>): EvidenceFormErrors {
  const errors: EvidenceFormErrors = {};
  if (!data.title?.trim()) errors.title = "Title is required";
  if (!data.evidence_url?.trim()) errors.evidence_url = "Evidence URL is required";
  else {
    try { new URL(data.evidence_url); } catch { errors.evidence_url = "Must be a valid URL"; }
  }
  if (!data.source_name?.trim()) errors.source_name = "Source name is required";
  if (!data.relevance?.trim()) errors.relevance = "Relevance is required";
  if (!data.category?.trim()) errors.category = "Category is required";
  return errors;
}
