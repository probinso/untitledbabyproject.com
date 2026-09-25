import type { RJSFSchema, ValidatorType } from "@rjsf/utils";

// Whether formData is fully valid per the schema — delegates to the same
// validator instance passed to <Form>, so this can never disagree with
// what submitting the form would actually accept.
export function isComplete(validator: ValidatorType, schema: RJSFSchema, formData: unknown): boolean {
  return validator.isValid(schema, formData, schema);
}

// A ref to an RJSF <Form>, typed loosely on purpose: @rjsf/mantine's Form
// export doesn't cleanly expose its underlying @rjsf/core class type for
// TypeScript to match a ref against. We only ever call `.submit()` on it.
export type RjsfFormInstance = any;
