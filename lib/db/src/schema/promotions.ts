import { pgTable, text, serial, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";

export const promotionsTable = pgTable("promotions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  badgeText: text("badge_text"),
  discountPercent: integer("discount_percent"),
  targetCategory: text("target_category"),
  active: boolean("active").notNull().default(true),
  bgColor: text("bg_color").notNull().default("#b8860b"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Promotion = typeof promotionsTable.$inferSelect;
