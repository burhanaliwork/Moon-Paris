import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sampleProductsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

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

function formatSample(p: any) {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    description: p.description,
    descriptionAr: p.descriptionAr,
    imageUrl: p.imageUrl,
    brand: p.brand,
    price3ml: p.price3ml ? parseFloat(p.price3ml) : null,
    price5ml: p.price5ml ? parseFloat(p.price5ml) : null,
    price10ml: p.price10ml ? parseFloat(p.price10ml) : null,
    inStock: p.inStock,
    createdAt: p.createdAt.toISOString(),
  };
}

// Get all sample products (public)
router.get("/", async (req, res) => {
  try {
    const samples = await db.select().from(sampleProductsTable);
    return res.json(samples.map(formatSample));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Get sample by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sample = await db.query.sampleProductsTable.findFirst({ where: eq(sampleProductsTable.id, id) });
    if (!sample) return res.status(404).json({ error: "not_found" });
    return res.json(formatSample(sample));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Create sample product (admin)
router.post("/", async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;
    const { name, nameAr, description, descriptionAr, imageUrl, brand, price3ml, price5ml, price10ml, inStock } = req.body;
    const [sample] = await db.insert(sampleProductsTable).values({
      name, nameAr, description, descriptionAr, imageUrl, brand,
      price3ml: price3ml ? price3ml.toString() : null,
      price5ml: price5ml ? price5ml.toString() : null,
      price10ml: price10ml ? price10ml.toString() : null,
      inStock: inStock ?? true,
    }).returning();
    return res.status(201).json(formatSample(sample));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Update sample product (admin)
router.put("/:id", async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;
    const id = parseInt(req.params.id);
    const { name, nameAr, description, descriptionAr, imageUrl, brand, price3ml, price5ml, price10ml, inStock } = req.body;
    const [sample] = await db.update(sampleProductsTable).set({
      name, nameAr, description, descriptionAr, imageUrl, brand,
      price3ml: price3ml ? price3ml.toString() : null,
      price5ml: price5ml ? price5ml.toString() : null,
      price10ml: price10ml ? price10ml.toString() : null,
      inStock,
    }).where(eq(sampleProductsTable.id, id)).returning();
    if (!sample) return res.status(404).json({ error: "not_found" });
    return res.json(formatSample(sample));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

// Delete sample product (admin)
router.delete("/:id", async (req, res) => {
  try {
    if (!await requireAdmin(req, res)) return;
    const id = parseInt(req.params.id);
    await db.delete(sampleProductsTable).where(eq(sampleProductsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
});

export default router;
