import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_USERNAME = "claims.officer";
const DEMO_PASSWORD = "Password123!";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { username: DEMO_USERNAME },
    update: {},
    create: { username: DEMO_USERNAME, passwordHash },
  });

  console.log("Seeded demo user:");
  console.log(`  username: ${user.username}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
