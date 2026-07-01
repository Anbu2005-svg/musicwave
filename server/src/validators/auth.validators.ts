import { z } from "zod";

export const supportedLanguages = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Kannada",
  "Bengali",
  "Marathi",
  "Punjabi",
  "Gujarati",
  "Urdu",
  "Odia",
  "Assamese"
] as const;

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1)
});

export const languagePreferencesSchema = z.object({
  languages: z
    .array(z.enum(supportedLanguages))
    .min(1, "Choose at least one language")
    .max(6, "Choose up to 6 languages")
});
