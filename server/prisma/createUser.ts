import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const supportedLanguages = new Set([
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
]);

function getArg(name: string) {
  const prefix = `--${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length).trim();

  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1]?.trim();

  return undefined;
}

function requireArg(name: string) {
  const value = getArg(name);
  if (!value) {
    throw new Error(`Missing required argument --${name}`);
  }
  return value;
}

function assertStrongPassword(password: string) {
  const valid =
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  if (!valid) {
    throw new Error("Password must be 12+ characters and include uppercase, lowercase, number, and symbol");
  }
}

async function main() {
  const name = requireArg("name");
  const email = requireArg("email").toLowerCase();
  const password = requireArg("password");
  const languages = (getArg("languages") ?? "")
    .split(",")
    .map((language) => language.trim())
    .filter(Boolean);
  assertStrongPassword(password);

  for (const language of languages) {
    if (!supportedLanguages.has(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      emailVerifiedAt: new Date(),
      ...(languages.length ? { languagePreferences: languages } : {})
    },
    create: {
      name,
      email,
      passwordHash,
      emailVerifiedAt: new Date(),
      languagePreferences: languages
    },
    select: {
      id: true,
      name: true,
      email: true,
      languagePreferences: true
    }
  });

  console.log(`Allowed user ready: ${user.email} (${user.id})`);
  if (user.languagePreferences.length) {
    console.log(`Language preferences: ${user.languagePreferences.join(", ")}`);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
