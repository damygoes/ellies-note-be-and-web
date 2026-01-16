type StringSanitizer = (value: string) => string;

type FieldRule =
  | { kind: "string"; sanitize?: StringSanitizer; optional?: boolean }
  | { kind: "number"; optional?: boolean }
  | { kind: "boolean"; optional?: boolean }
  | {
      kind: "array";
      optional?: boolean;
      sanitizeItem?: (value: unknown) => unknown;
      maxLength?: number;
    };

type InferField<R extends FieldRule> = R extends { kind: "string" }
  ? string
  : R extends { kind: "number" }
  ? number
  : R extends { kind: "boolean" }
  ? boolean
  : R extends { kind: "array" }
  ? unknown[] // you can narrow later if you want
  : never;

type OptionalKeys<R extends Record<string, FieldRule>> = {
  [K in keyof R]: R[K] extends { optional: true } ? K : never;
}[keyof R];

type RequiredKeys<R extends Record<string, FieldRule>> = Exclude<
  keyof R,
  OptionalKeys<R>
>;

type InferFromRules<R extends Record<string, FieldRule>> = {
  [K in RequiredKeys<R>]: InferField<R[K]>;
} & {
  [K in OptionalKeys<R>]?: InferField<R[K]>;
};

export function allowlistAndSanitize<R extends Record<string, FieldRule>>(
  input: unknown,
  rules: R
): { ok: true; data: InferFromRules<R> } | { ok: false; message: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, message: "Invalid JSON body" };
  }

  const obj = input as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const key of Object.keys(rules) as Array<keyof R>) {
    const rule = rules[key];
    const value = obj[key as string];

    // required field missing
    if (value === undefined) {
      if (!rule.optional) {
        return { ok: false, message: `Missing required field: ${String(key)}` };
      }
      continue;
    }

    if (rule.kind === "string") {
      if (typeof value !== "string") {
        return { ok: false, message: `Invalid type for ${String(key)}` };
      }
      out[key as string] = rule.sanitize ? rule.sanitize(value) : value;
      continue;
    }

    if (rule.kind === "number") {
      if (typeof value !== "number") {
        return { ok: false, message: `Invalid type for ${String(key)}` };
      }
      out[key as string] = value;
      continue;
    }

    if (rule.kind === "boolean") {
      if (typeof value !== "boolean") {
        return { ok: false, message: `Invalid type for ${String(key)}` };
      }
      out[key as string] = value;
      continue;
    }

    if (rule.kind === "array") {
      if (!Array.isArray(value)) {
        return { ok: false, message: `Invalid type for ${String(key)}` };
      }
      let arr: unknown[] = value;

      if (rule.sanitizeItem) arr = arr.map(rule.sanitizeItem);
      if (rule.maxLength) arr = arr.slice(0, rule.maxLength);

      out[key as string] = arr;
      continue;
    }
  }

  return { ok: true, data: out as InferFromRules<R> };
}
