import { Router } from "express";
import { db } from "@workspace/db";
import { brandsTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

const router = Router();

// GET all brands (public)
router.get("/", async (req: any, res: any) => {
  try {
    const brands = await db.query.brandsTable.findMany({ orderBy: asc(brandsTable.name) });
    return res.json(brands);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// POST create brand (admin only)
router.post("/", async (req: any, res: any) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "not_authenticated" });
    const { usersTable } = await import("@workspace/db/schema");
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user || user.role !== "admin") return res.status(403).json({ error: "forbidden" });

    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "name_required", message: "اسم الشركة مطلوب" });

    const [brand] = await db.insert(brandsTable).values({ name: name.trim() }).returning();
    return res.json(brand);
  } catch (err: any) {
    if (err?.code === "23505") return res.status(400).json({ error: "duplicate", message: "هذه الشركة موجودة مسبقاً" });
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// DELETE brand (admin only)
router.delete("/:id", async (req: any, res: any) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "not_authenticated" });
    const { usersTable } = await import("@workspace/db/schema");
    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user || user.role !== "admin") return res.status(403).json({ error: "forbidden" });

    const id = parseInt(req.params.id);
    await db.delete(brandsTable).where(eq(brandsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
