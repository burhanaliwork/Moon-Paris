import { pgTable, text, serial, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sampleProductsTable = pgTable("sample_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  imageUrl: text("image_url"),
  brand: text("brand"),
  price3ml: numeric("price_3ml", { precision: 10, scale: 2 }),
  price5ml: numeric("price_5ml", { precision: 10, scale: 2 }),
  price10ml: numeric("price_10ml", { precision: 10, scale: 2 }),
  inStock: boolean("in_stock").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSampleProductSchema = createInsertSchema(sampleProductsTable).omit({ id: true, createdAt: true });
export type InsertSampleProduct = z.infer<typeof insertSampleProductSchema>;
export type SampleProduct = typeof sampleProductsTable.$inferSelect;
