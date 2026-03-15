import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

const IRAQI_PHONE_REGEX = /^07[3-9]\d{8}$/;

// Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, phone, email, password, governorate, district } = req.body;

    if (!fullName || !phone || !governorate || !district) {
      return res.status(400).json({ error: "missing_fields", message: "الاسم الكامل ورقم الهاتف والمحافظة والمنطقة مطلوبة" });
    }

    if (!IRAQI_PHONE_REGEX.test(phone)) {
      return res.status(400).json({ error: "invalid_phone", message: "رقم الهاتف يجب أن يكون عراقياً صحيحاً (11 رقم يبدأ بـ 07)" });
    }

    const existingUser = await db.query.usersTable.findFirst({ where: eq(usersTable.phone, phone) });
    if (existingUser) {
      return res.status(400).json({ error: "phone_exists", message: "رقم الهاتف مسجل مسبقاً" });
    }

    if (email) {
      const existingEmail = await db.query.usersTable.findFirst({ where: eq(usersTable.email, email) });
      if (existingEmail) {
        return res.status(400).json({ error: "email_exists", message: "البريد الإلكتروني مسجل مسبقاً" });
      }
    }

    let passwordHash: string | undefined = undefined;
    if (password) passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db.insert(usersTable).values({
      fullName,
      phone,
      email: email || null,
      passwordHash: passwordHash || null,
      governorate,
      district,
      role: "user",
    }).returning();

    (req.session as any).userId = user.id;

    return res.status(201).json({
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        governorate: user.governorate,
        district: user.district,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      message: "تم إنشاء الحساب بنجاح",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    let user: any = null;

    if (phone) {
      if (!IRAQI_PHONE_REGEX.test(phone)) {
        return res.status(400).json({ error: "invalid_phone", message: "رقم الهاتف يجب أن يكون عراقياً صحيحاً" });
      }
      user = await db.query.usersTable.findFirst({ where: eq(usersTable.phone, phone) });
      if (!user) {
        return res.status(401).json({ error: "user_not_found", message: "رقم الهاتف غير مسجل" });
      }
    } else if (email && password) {
      user = await db.query.usersTable.findFirst({ where: eq(usersTable.email, email) });
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "invalid_credentials", message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: "invalid_credentials", message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }
    } else {
      return res.status(400).json({ error: "missing_fields", message: "يرجى إدخال بيانات تسجيل الدخول" });
    }

    (req.session as any).userId = user.id;

    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        governorate: user.governorate,
        district: user.district,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "تم تسجيل الخروج", success: true });
  });
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ error: "not_authenticated", message: "غير مسجل الدخول" });
    }

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user) {
      return res.status(401).json({ error: "user_not_found", message: "المستخدم غير موجود" });
    }

    return res.json({
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      governorate: user.governorate,
      district: user.district,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

export default router;
