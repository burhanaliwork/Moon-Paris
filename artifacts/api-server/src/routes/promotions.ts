import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { promotionsTable, productsTable, usersTable } from "@workspace/db/schema";
import { eq, gt, or, isNull } from "drizzle-orm";

const router: IRouter = Router();

async function isAdmin(req: any): Promise<boolean> {
  const userId = req.session?.userId;
  if (!userId) return false;
  const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
  return user?.role === "admin";
}

// Get active promotions (public)
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const promotions = await db.select().from(promotionsTable).where(
      eq(promotionsTable.active, true)
    );
    const active = promotions.filter(p => !p.expiresAt || p.expiresAt > now);
    return res.json(active);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Get all promotions (admin)
router.get("/all", async (req, res) => {
  try {
    if (!await isAdmin(req)) return res.status(403).json({ error: "forbidden" });
    const promotions = await db.select().from(promotionsTable).orderBy(promotionsTable.createdAt);
    return res.json(promotions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Create promotion (admin)
router.post("/", async (req, res) => {
  try {
    if (!await isAdmin(req)) return res.status(403).json({ error: "forbidden" });
    const { title, description, badgeText, discountPercent, targetCategory, active, bgColor, expiresAt } = req.body;

    const [promotion] = await db.insert(promotionsTable).values({
      title,
      description,
      badgeText,
      discountPercent: discountPercent ? Number(discountPercent) : null,
      targetCategory,
      active: active ?? true,
      bgColor: bgColor || "#b8860b",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).returning();

    // If discount percent set + category, update product prices
    if (discountPercent && targetCategory) {
      const products = await db.select().from(productsTable).where(eq(productsTable.category, targetCategory));
      for (const product of products) {
        const currentPrice = parseFloat(product.price);
        const newPrice = Math.round(currentPrice * (1 - discountPercent / 100));
        await db.update(productsTable).set({
          originalPrice: product.price,
          price: newPrice.toString(),
        }).where(eq(productsTable.id, product.id));
      }
    }

    return res.status(201).json(promotion);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Update promotion (admin)
router.put("/:id", async (req, res) => {
  try {
    if (!await isAdmin(req)) return res.status(403).json({ error: "forbidden" });
    const id = parseInt(req.params.id);
    const { title, description, badgeText, discountPercent, targetCategory, active, bgColor, expiresAt } = req.body;

    const [promotion] = await db.update(promotionsTable).set({
      title,
      description,
      badgeText,
      discountPercent: discountPercent ? Number(discountPercent) : null,
      targetCategory,
      active,
      bgColor: bgColor || "#b8860b",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    }).where(eq(promotionsTable.id, id)).returning();

    return res.json(promotion);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Delete promotion (admin)
router.delete("/:id", async (req, res) => {
  try {
    if (!await isAdmin(req)) return res.status(403).json({ error: "forbidden" });
    const id = parseInt(req.params.id);
    await db.delete(promotionsTable).where(eq(promotionsTable.id, id));
    return res.json({ message: "تم حذف العرض", success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Bulk price update by category (admin)
router.post("/bulk-price", async (req, res) => {
  try {
    if (!await isAdmin(req)) return res.status(403).json({ error: "forbidden" });
    const { category, discountPercent, newPrice } = req.body;

    if (!category) return res.status(400).json({ error: "category_required" });

    const products = await db.select().from(productsTable).where(eq(productsTable.category, category));

    for (const product of products) {
      if (discountPercent) {
        const currentPrice = parseFloat(product.price);
        const updated = Math.round(currentPrice * (1 - discountPercent / 100));
        await db.update(productsTable).set({
          originalPrice: product.price,
          price: updated.toString(),
        }).where(eq(productsTable.id, product.id));
      } else if (newPrice) {
        await db.update(productsTable).set({ price: Number(newPrice).toString() }).where(eq(productsTable.id, product.id));
      }
    }

    return res.json({ message: `تم تحديث ${products.length} منتج بنجاح`, success: true, count: products.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
