import { z } from "zod";
import { PACKAGE_IDS } from "@/features/pricing/types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Legfeljebb ${max} karakter.`)
    .optional()
    .transform((value) => (value ? value : undefined));

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
});

export type Submission = z.input<typeof submissionSchema>;
