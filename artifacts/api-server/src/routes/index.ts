import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/admin", adminRouter);

// Site settings
router.get("/site-settings", async (req: any, res: any) => {
  try {
    const { db } = await import("@workspace/db");
    const { siteSettingsTable } = await import("@workspace/db/schema");
    let settings = await db.query.siteSettingsTable.findFirst();
    if (!settings) {
      const [created] = await db.insert(siteSettingsTable).values({}).returning();
      settings = created;
    }
    return res.json({
      siteName: settings.siteName,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      heroImageUrl: settings.heroImageUrl,
      contactPhone: settings.contactPhone,
      contactEmail: settings.contactEmail,
      aboutText: settings.aboutText,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

router.put("/site-settings", async (req: any, res: any) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "not_authenticated" });
    const { db } = await import("@workspace/db");
    const { usersTable, siteSettingsTable } = await import("@workspace/db/schema");
    const { eq } = await import("drizzle-orm");
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user || user.role !== "admin") return res.status(403).json({ error: "forbidden" });

    const { siteName, heroTitle, heroSubtitle, heroImageUrl, contactPhone, contactEmail, aboutText } = req.body;
    let settings = await db.query.siteSettingsTable.findFirst();
    if (!settings) {
      const [created] = await db.insert(siteSettingsTable).values({ siteName, heroTitle, heroSubtitle, heroImageUrl, contactPhone, contactEmail, aboutText }).returning();
      settings = created;
    } else {
      const [updated] = await db.update(siteSettingsTable).set({ siteName, heroTitle, heroSubtitle, heroImageUrl, contactPhone, contactEmail, aboutText }).where(eq(siteSettingsTable.id, settings.id)).returning();
      settings = updated;
    }
    return res.json(settings);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
