export type CaseFormErrors = Record<string, string | undefined>;

export function validateCaseForm(data: Record<string, string>): CaseFormErrors {
  const errors: CaseFormErrors = {};
  if (!data.title?.trim()) errors.title = "Title is required";
  else if (data.title.length > 200) errors.title = "Max 200 characters";
  if (!data.organisation?.trim()) errors.organisation = "Organisation is required";
  if (!data.crisis_type?.trim()) errors.crisis_type = "Crisis type is required";
  if (!data.incident_summary?.trim()) errors.incident_summary = "Incident summary is required";
  else if (data.incident_summary.length > 1000) errors.incident_summary = "Max 1000 characters";
  if (!data.affected_users?.trim()) errors.affected_users = "Affected users/stakeholders required";
  if (!data.reported_harm?.trim()) errors.reported_harm = "Reported harm is required";
  if (!data.urgency_level?.trim()) errors.urgency_level = "Urgency level is required";
  return errors;
}
