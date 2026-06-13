import { db } from "./src/server/db";

async function main() {
  const users = await db.user.findMany({
    include: { accounts: true },
  });
  console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => db.$disconnect());
