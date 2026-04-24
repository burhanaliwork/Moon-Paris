import app from "./app";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function seedAdmin() {
  try {
    const existing = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, "admin1@test.com"),
    });
    if (!existing) {
      const passwordHash = await bcrypt.hash("paris@oqba", 12);
      await db.insert(usersTable).values({
        fullName: "Admin",
        email: "admin1@test.com",
        phone: "07700000000",
        passwordHash,
        role: "admin",
      });
      console.log("Admin account created successfully.");
    } else {
      // Temporary: reset admin password
      const passwordHash = await bcrypt.hash("paris@oqba", 12);
      await db.update(usersTable)
        .set({ passwordHash })
        .where(eq(usersTable.email, "admin1@test.com"));
      console.log("Admin password reset.");
    }
  } catch (err) {
    console.error("Failed to seed admin account:", err);
  }
}

seedAdmin().then(() => {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
