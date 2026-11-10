import { z } from "zod";
import { PACKAGE_IDS } from "@/features/pricing/types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Legfeljebb ${max} karakter.`)
    .optional()
    .transform((value) => (value ? value : undefined));

export const CALLBACK_TIMES = ["asap", "morning", "afternoon", "evening"] as const;
export type CallbackTime = (typeof CALLBACK_TIMES)[number];
export const CALLBACK_LABELS: Record<CallbackTime, string> = {
  asap: "Minél előbb",
  morning: "Délelőtt",
  afternoon: "Délután",
  evening: "Este",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s()./-]{5,}$/;

/** Shared by the form (client) and the API route (server). */
export const contactSchema = z
  .object({
    name: optionalText(100),
    email: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((value) => (value ? value : undefined))
      .pipe(z.email("Érvénytelen e-mail-cím.").optional()),
    phone: optionalText(40).pipe(
      z
        .string()
        .regex(/^[+\d][\d\s()./-]{5,}$/, "Érvénytelen telefonszám.")
        .optional(),
    ),
    company: optionalText(150),
    message: optionalText(2000),
    callbackTime: z.enum(CALLBACK_TIMES).optional(),
    wantsCopy: z.boolean(),
    consent: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Adj meg e-mail-címet vagy telefonszámot, hogy válaszolhassunk." });
    }
    if (data.wantsCopy && !data.email) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "A másolathoz add meg az e-mail-címed." });
    }
    if (!data.consent) {
      ctx.addIssue({ code: "custom", path: ["consent"], message: "Az elküldéshez el kell fogadnod az adatkezelési tájékoztatót." });
    }
  });

export type ContactInput = z.input<typeof contactSchema>;

/**
 * The quick form: one "phone or e-mail" field instead of two.
 * `toContact` maps it onto the shared contact schema the server validates.
 */
export const quickContactSchema = z
  .object({
    reach: z.string().trim().min(1, "Add meg a telefonszámod vagy az e-mail-címed.").max(200),
    callbackTime: z.enum(CALLBACK_TIMES),
    name: z.string().max(100),
    company: z.string().max(150),
    message: z.string().max(2000),
    wantsCopy: z.boolean(),
    consent: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const value = data.reach.trim();
    if (value && !EMAIL_PATTERN.test(value) && !PHONE_PATTERN.test(value)) {
      ctx.addIssue({ code: "custom", path: ["reach"], message: "Ez nem tűnik telefonszámnak vagy e-mail-címnek." });
    }
    if (!data.consent) {
      ctx.addIssue({ code: "custom", path: ["consent"], message: "Az elküldéshez el kell fogadnod az adatkezelési tájékoztatót." });
    }
  });

export type QuickContactValues = z.infer<typeof quickContactSchema>;

export function isEmailLike(value: string): boolean {
  return value.includes("@");
}

export function toContact(values: QuickContactValues): ContactInput {
  const reach = values.reach.trim();
  const email = isEmailLike(reach);
  return {
    email: email ? reach : undefined,
    phone: email ? undefined : reach,
    name: values.name,
    company: values.company,
    message: values.message,
    callbackTime: values.callbackTime,
    wantsCopy: email && values.wantsCopy,
    consent: values.consent,
  };
}

export type ContactData = z.output<typeof contactSchema>;

const answerValue = z.union([z.string().max(2000), z.array(z.string().max(64)).max(20)]);

export const submissionSchema = z.object({
  answers: z.record(z.string().max(64), answerValue).refine((value) => Object.keys(value).length <= 80, "Túl sok válasz."),
  packageId: z.enum(PACKAGE_IDS),
  contact: contactSchema,
  /** Honeypot: humans never fill it. */
  website: z.string().max(200).optional(),
  /** ms since the contact form was shown. */
  elapsedMs: z.number().int().nonnegative(),
  /** "save": the visitor only e-mails the offer to themselves (no consultation yet). */
  intent: z.enum(["consultation", "save"]).default("consultation"),
});

export type Submission = z.input<typeof submissionSchema>;
