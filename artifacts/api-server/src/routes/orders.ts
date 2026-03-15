import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, sampleProductsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

async function getOrderWithItems(orderId: number) {
  const order = await db.query.ordersTable.findFirst({
    where: eq(ordersTable.id, orderId),
  });
  if (!order) return null;

  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    userId: order.userId,
    guestName: order.guestName,
    guestPhone: order.guestPhone,
    guestGovernorate: order.guestGovernorate,
    guestDistrict: order.guestDistrict,
    totalAmount: parseFloat(order.totalAmount),
    status: order.status,
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    items: items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productNameAr: item.productNameAr,
      quantity: item.quantity,
      price: parseFloat(item.price),
    })),
  };
}

// Create order
router.post("/", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    const { guestName, guestPhone, guestGovernorate, guestDistrict, items, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "no_items", message: "يجب إضافة منتج واحد على الأقل" });
    }

    if (!userId && (!guestName || !guestPhone || !guestGovernorate || !guestDistrict)) {
      return res.status(400).json({ error: "guest_info_required", message: "يجب إدخال بيانات التوصيل" });
    }

    // Calculate total
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      // Handle sample product items (with size)
      if (item.sampleProductId) {
        const sample = await db.query.sampleProductsTable.findFirst({
          where: eq(sampleProductsTable.id, item.sampleProductId),
        });
        if (!sample) {
          return res.status(400).json({ error: "product_not_found", message: `التقسيمة غير موجودة` });
        }
        let price = 0;
        if (item.size === '3ml') price = sample.price3ml ? parseFloat(sample.price3ml) : 0;
        else if (item.size === '5ml') price = sample.price5ml ? parseFloat(sample.price5ml) : 0;
        else if (item.size === '10ml') price = sample.price10ml ? parseFloat(sample.price10ml) : 0;

        totalAmount += price * item.quantity;
        orderItemsData.push({
          productId: sample.id,
          productName: `${sample.name} - ${item.size}`,
          productNameAr: `${sample.nameAr} - ${item.size}`,
          quantity: item.quantity,
          price: price.toString(),
        });
        continue;
      }

      // Regular product
      const product = await db.query.productsTable.findFirst({
        where: eq(productsTable.id, item.productId),
      });

      if (!product) {
        return res.status(400).json({ error: "product_not_found", message: `المنتج غير موجود` });
      }

      const price = parseFloat(product.price);
      totalAmount += price * item.quantity;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productNameAr: product.nameAr,
        quantity: item.quantity,
        price: price.toString(),
      });
    }

    const [order] = await db.insert(ordersTable).values({
      userId: userId || null,
      guestName: guestName || null,
      guestPhone: guestPhone || null,
      guestGovernorate: guestGovernorate || null,
      guestDistrict: guestDistrict || null,
      totalAmount: totalAmount.toString(),
      status: "pending",
      notes: notes || null,
    }).returning();

    for (const itemData of orderItemsData) {
      await db.insert(orderItemsTable).values({
        orderId: order.id,
        ...itemData,
      });
    }

    const fullOrder = await getOrderWithItems(order.id);
    return res.status(201).json(fullOrder);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Get orders
router.get("/", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;

    let orders;
    if (!userId) {
      return res.status(401).json({ error: "not_authenticated", message: "غير مسجل الدخول" });
    }

    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });

    if (user?.role === "admin") {
      orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    } else {
      orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, userId));
    }

    const fullOrders = await Promise.all(orders.map(o => getOrderWithItems(o.id)));
    return res.json(fullOrders.filter(Boolean));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await getOrderWithItems(id);

    if (!order) {
      return res.status(404).json({ error: "not_found", message: "الطلب غير موجود" });
    }

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Update order status (admin)
router.put("/:id", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "not_authenticated", message: "غير مسجل الدخول" });
    }

    const user = await db.query.usersTable.findFirst({ where: eq(usersTable.id, userId) });
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "forbidden", message: "غير مصرح لك" });
    }

    const id = parseInt(req.params.id);
    const { status } = req.body;

    await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id));

    const order = await getOrderWithItems(id);
    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

export default router;
