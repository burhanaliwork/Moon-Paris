import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db/schema";
import { eq, ilike, or } from "drizzle-orm";

const router: IRouter = Router();

function formatProduct(p: any) {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    description: p.description,
    descriptionAr: p.descriptionAr,
    price: parseFloat(p.price),
    originalPrice: p.originalPrice ? parseFloat(p.originalPrice) : null,
    imageUrl: p.imageUrl,
    images: p.images || [],
    category: p.category,
    brand: p.brand,
    volume: p.volume,
    inStock: p.inStock,
    stockQuantity: p.stockQuantity,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
  };
}

// Get all products
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;

    let products;
    if (search) {
      products = await db.select().from(productsTable).where(
        or(
          ilike(productsTable.name, `%${search}%`),
          ilike(productsTable.nameAr, `%${search}%`)
        )
      );
    } else if (category) {
      products = await db.select().from(productsTable).where(eq(productsTable.category, category as string));
    } else {
      products = await db.select().from(productsTable);
    }

    return res.json(products.map(formatProduct));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, id),
    });

    if (!product) {
      return res.status(404).json({ error: "not_found", message: "المنتج غير موجود" });
    }

    return res.json(formatProduct(product));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Create product (admin)
router.post("/", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "not_authenticated", message: "غير مسجل الدخول" });
    }

    const { usersTable: ut } = await import("@workspace/db/schema");
    const { eq: eqOp } = await import("drizzle-orm");
    const user = await db.query.usersTable.findFirst({ where: eqOp(ut.id, userId) });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "forbidden", message: "غير مصرح لك" });
    }

    const { name, nameAr, description, descriptionAr, price, originalPrice, imageUrl, images, category, brand, volume, inStock, stockQuantity, featured } = req.body;

    const [product] = await db.insert(productsTable).values({
      name,
      nameAr,
      description,
      descriptionAr,
      price: price.toString(),
      originalPrice: originalPrice ? originalPrice.toString() : null,
      imageUrl,
      images: images || [],
      category,
      brand,
      volume,
      inStock: inStock ?? true,
      stockQuantity: stockQuantity ?? 0,
      featured: featured ?? false,
    }).returning();

    return res.status(201).json(formatProduct(product));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Update product (admin)
router.put("/:id", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "not_authenticated", message: "غير مسجل الدخول" });
    }

    const { usersTable: ut } = await import("@workspace/db/schema");
    const { eq: eqOp } = await import("drizzle-orm");
    const user = await db.query.usersTable.findFirst({ where: eqOp(ut.id, userId) });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "forbidden", message: "غير مصرح لك" });
    }

    const id = parseInt(req.params.id);
    const { name, nameAr, description, descriptionAr, price, originalPrice, imageUrl, images, category, brand, volume, inStock, stockQuantity, featured } = req.body;

    const [product] = await db.update(productsTable).set({
      name,
      nameAr,
      description,
      descriptionAr,
      price: price.toString(),
      originalPrice: originalPrice ? originalPrice.toString() : null,
      imageUrl,
      images: images || [],
      category,
      brand,
      volume,
      inStock,
      stockQuantity,
      featured,
    }).where(eq(productsTable.id, id)).returning();

    if (!product) {
      return res.status(404).json({ error: "not_found", message: "المنتج غير موجود" });
    }

    return res.json(formatProduct(product));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Delete product (admin)
router.delete("/:id", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "not_authenticated", message: "غير مسجل الدخول" });
    }

    const { usersTable: ut } = await import("@workspace/db/schema");
    const { eq: eqOp } = await import("drizzle-orm");
    const user = await db.query.usersTable.findFirst({ where: eqOp(ut.id, userId) });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "forbidden", message: "غير مصرح لك" });
    }

    const id = parseInt(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));

    return res.json({ message: "تم حذف المنتج بنجاح", success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

export default router;
