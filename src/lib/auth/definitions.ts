import { z } from "zod";

export const COUNTRIES = [
  { code: "DE", name: "Germany" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "PL", name: "Poland" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "NO", name: "Norway" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "OTHER", name: "Other" },
] as const;

const COUNTRY_CODES: ReadonlySet<string> = new Set(COUNTRIES.map((c) => c.code));

export const SignupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, { error: "First name is required." })
      .max(40, { error: "First name is too long." })
      .trim(),
    lastName: z
      .string()
      .min(1, { error: "Last name is required." })
      .max(40, { error: "Last name is too long." })
      .trim(),
    email: z.email({ error: "Please enter a valid work email." }).trim(),
    company: z
      .string()
      .min(2, { error: "Company name must be at least 2 characters." })
      .max(120, { error: "Company name is too long." })
      .trim(),
    country: z
      .string()
      .min(2, { error: "Select your country." })
      .refine((v) => COUNTRY_CODES.has(v), { error: "Select a valid country." }),
    password: z
      .string()
      .min(10, { error: "Password must be at least 10 characters." })
      .regex(/[a-z]/, { error: "Must contain a lowercase letter." })
      .regex(/[A-Z]/, { error: "Must contain an uppercase letter." })
      .regex(/[0-9]/, { error: "Must contain a number." })
      .regex(/[^a-zA-Z0-9]/, { error: "Must contain a special character." }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const SigninSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export type AuthFieldErrors = {
  firstName?: string[];
  lastName?: string[];
  email?: string[];
  company?: string[];
  country?: string[];
  password?: string[];
  confirmPassword?: string[];
  termsAccepted?: string[];
};

export const AUTH_FIELD_KEYS: ReadonlyArray<keyof AuthFieldErrors> = [
  "firstName",
  "lastName",
  "email",
  "company",
  "country",
  "password",
  "confirmPassword",
  "termsAccepted",
];

export type AuthSuccess = {
  ok: true;
  user: { id: string; email: string; name: string };
  needsVerification?: boolean;
};

export type AuthFailure = {
  ok: false;
  message?: string;
  errors?: AuthFieldErrors;
  needsVerification?: boolean;
  email?: string;
};

export type AuthFormState = AuthSuccess | AuthFailure | undefined;
