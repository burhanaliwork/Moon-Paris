import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, productsTable, ordersTable, siteSettingsTable } from "@workspace/db/schema";
import { eq, count, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

async function requireAdmin(req: any, res: any): Promise<boolean> {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "not_authenticated", message: "غير مسجل الدخول" });
    return false;
  }
  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "forbidden", message: "غير مصرح لك" });
    return false;
  }
  return true;
}

// Admin stats
router.get("/stats", async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;

    const [usersCount] = await db.select({ count: count() }).from(usersTable);
    const [productsCount] = await db.select({ count: count() }).from(productsTable);
    const [ordersCount] = await db.select({ count: count() }).from(ordersTable);

    const allOrders = await db.select({ totalAmount: ordersTable.totalAmount, status: ordersTable.status }).from(ordersTable);
    const totalRevenue = allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const pendingOrders = allOrders.filter(o => o.status === "pending").length;

    return res.json({
      totalOrders: Number(ordersCount.count),
      totalRevenue,
      totalProducts: Number(productsCount.count),
      totalUsers: Number(usersCount.count),
      pendingOrders,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Get all users (admin)
router.get("/users", async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;

    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    return res.json(users.map(u => ({
      id: u.id,
      fullName: u.fullName,
      phone: u.phone,
      email: u.email,
      governorate: u.governorate,
      district: u.district,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Delete user (admin)
router.delete("/users/:id", async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;

    const id = parseInt(req.params.id);
    await db.delete(usersTable).where(eq(usersTable.id, id));
    return res.json({ message: "تم حذف المستخدم بنجاح", success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Get site settings
router.get("/site-settings", async (req, res) => {
  try {
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
      infoSectionTitle: settings.infoSectionTitle,
      stat1Value: settings.stat1Value,
      stat1Label: settings.stat1Label,
      stat2Value: settings.stat2Value,
      stat2Label: settings.stat2Label,
      infoImageUrl: settings.infoImageUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Update site settings (admin)
router.put("/site-settings", async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;

    const { siteName, heroTitle, heroSubtitle, heroImageUrl, contactPhone, contactEmail, aboutText, infoSectionTitle, stat1Value, stat1Label, stat2Value, stat2Label, infoImageUrl } = req.body;

    let settings = await db.query.siteSettingsTable.findFirst();
    if (!settings) {
      const [created] = await db.insert(siteSettingsTable).values({
        siteName, heroTitle, heroSubtitle, heroImageUrl, contactPhone, contactEmail, aboutText, infoSectionTitle, stat1Value, stat1Label, stat2Value, stat2Label, infoImageUrl
      }).returning();
      settings = created;
    } else {
      const [updated] = await db.update(siteSettingsTable)
        .set({ siteName, heroTitle, heroSubtitle, heroImageUrl, contactPhone, contactEmail, aboutText, infoSectionTitle, stat1Value, stat1Label, stat2Value, stat2Label, infoImageUrl })
        .where(eq(siteSettingsTable.id, settings.id))
        .returning();
      settings = updated;
    }

    return res.json({
      siteName: settings!.siteName,
      heroTitle: settings!.heroTitle,
      heroSubtitle: settings!.heroSubtitle,
      heroImageUrl: settings!.heroImageUrl,
      contactPhone: settings!.contactPhone,
      contactEmail: settings!.contactEmail,
      aboutText: settings!.aboutText,
      infoSectionTitle: settings!.infoSectionTitle,
      stat1Value: settings!.stat1Value,
      stat1Label: settings!.stat1Label,
      stat2Value: settings!.stat2Value,
      stat2Label: settings!.stat2Label,
      infoImageUrl: settings!.infoImageUrl,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Change admin password
router.post("/change-password", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) return res.status(401).json({ error: "not_authenticated", message: "غير مسجل الدخول" });

    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user || user.role !== "admin") return res.status(403).json({ error: "forbidden", message: "غير مصرح لك" });

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "missing_fields", message: "جميع الحقول مطلوبة" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "weak_password", message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "password_mismatch", message: "كلمة المرور الجديدة وتأكيدها غير متطابقتين" });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ error: "no_password", message: "الحساب لا يحتوي على كلمة مرور" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "wrong_password", message: "كلمة المرور الحالية غير صحيحة" });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, user.id));

    return res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

export default router;
