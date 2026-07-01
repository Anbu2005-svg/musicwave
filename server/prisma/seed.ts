import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "demo@musicwave.local" },
    update: {},
    create: {
      name: "MusicWave Demo",
      email: "demo@musicwave.local",
      passwordHash,
      emailVerifiedAt: new Date(),
      playlists: {
        create: {
          name: "Starter Mix",
          description: "A sample playlist ready for YouTube music picks."
        }
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
