export type OptionFormErrors = Record<string, string | undefined>;

export function validateOptionForm(data: Record<string, string>): OptionFormErrors {
  const errors: OptionFormErrors = {};
  if (!data.title?.trim()) errors.title = "Title is required";
  if (!data.summary?.trim()) errors.summary = "Summary is required";
  else if (data.summary.length > 500) errors.summary = "Max 500 characters";
  if (!data.action_type?.trim()) errors.action_type = "Action type is required";
  if (!data.expected_benefit?.trim()) errors.expected_benefit = "Expected benefit is required";
  if (!data.key_risk?.trim()) errors.key_risk = "Key risk is required";
  return errors;
}
