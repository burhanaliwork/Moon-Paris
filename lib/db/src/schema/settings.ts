import { pgTable, text, serial } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: text("site_name").notNull().default("مون باريس"),
  heroTitle: text("hero_title").notNull().default("عطور فاخرة من باريس"),
  heroSubtitle: text("hero_subtitle").notNull().default("اكتشف عالماً من الرقي والأناقة"),
  heroImageUrl: text("hero_image_url"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  aboutText: text("about_text"),
  infoSectionTitle: text("info_section_title").default("الجودة الأصيلة، مباشرة من باريس"),
  stat1Value: text("stat1_value").default("عطور أصلية"),
  stat1Label: text("stat1_label").default("100%"),
  stat2Value: text("stat2_value").default("توصيل سريع"),
  stat2Label: text("stat2_label").default("لكافة محافظات العراق"),
});
