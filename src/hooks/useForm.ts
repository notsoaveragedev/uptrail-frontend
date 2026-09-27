import { useState, useTransition, type FormEvent } from "react";
import { z } from "zod";

type UseFormOptions<Schema extends z.ZodType> = {
  schema: Schema;
  onSubmit: (values: z.output<Schema>) => Promise<void>;
};

type FieldErrors<Schema extends z.ZodType> = Partial<Record<keyof z.input<Schema>, string>>;

export function useForm<Schema extends z.ZodType>({ schema, onSubmit }: UseFormOptions<Schema>) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<Schema>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const result = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!result.success) {
      setFieldErrors(firstErrorPerField(result.error));
      return;
    }

    setFieldErrors({});
    startTransition(async () => {
      try {
        await onSubmit(result.data);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Something went wrong. Try again.");
      }
    });
  }

  function handleChange(event: FormEvent<HTMLFormElement>) {
    const name = (event.target as HTMLInputElement).name as keyof FieldErrors<Schema>;
    if (name && fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  return {
    formProps: { onSubmit: handleSubmit, onChange: handleChange, noValidate: true },
    fieldErrors,
    setFieldErrors,
    formError,
    isPending,
  };
}

function firstErrorPerField<Schema extends z.ZodType>(error: z.ZodError): FieldErrors<Schema> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    errors[field] ??= issue.message;
  }
  return errors as FieldErrors<Schema>;
}
