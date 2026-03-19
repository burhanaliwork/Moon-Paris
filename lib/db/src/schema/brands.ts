import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const brandsTable = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
