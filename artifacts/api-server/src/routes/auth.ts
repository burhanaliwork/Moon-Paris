import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, otpTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendWhatsAppOtp(phone: string, code: string): Promise<boolean> {
  try {
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappToken = process.env.WHATSAPP_TOKEN;

    if (whatsappApiUrl && whatsappToken) {
      const response = await fetch(whatsappApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${whatsappToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: {
            body: `رمز التحقق الخاص بك في مون باريس هو: ${code}\nصالح لمدة 10 دقائق.`,
          },
        }),
      });
      return response.ok;
    }
    // In development, just log the OTP
    console.log(`[DEV] OTP for ${phone}: ${code}`);
    return true;
  } catch (err) {
    console.error("Failed to send WhatsApp OTP:", err);
    console.log(`[FALLBACK] OTP for ${phone}: ${code}`);
    return true;
  }
}

// Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "phone_required", message: "رقم الهاتف مطلوب" });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(otpTable).values({ phone, code, expiresAt });

    const sent = await sendWhatsAppOtp(phone, code);

    return res.json({ message: "تم إرسال رمز التحقق", success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: "missing_fields", message: "رقم الهاتف والرمز مطلوبان" });
    }

    const otp = await db.query.otpTable.findFirst({
      where: and(
        eq(otpTable.phone, phone),
        eq(otpTable.code, code),
        eq(otpTable.verified, false),
        gt(otpTable.expiresAt, new Date())
      ),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    if (!otp) {
      return res.status(400).json({ error: "invalid_otp", message: "رمز التحقق غير صحيح أو منتهي الصلاحية" });
    }

    await db.update(otpTable).set({ verified: true }).where(eq(otpTable.id, otp.id));

    return res.json({ message: "تم التحقق بنجاح", success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error", message: "حدث خطأ في الخادم" });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, phone, email, password, governorate, district, otpCode } = req.body;

    if (!fullName || !phone || !governorate || !district || !otpCode) {
      return res.status(400).json({ error: "missing_fields", message: "جميع الحقول المطلوبة يجب ملؤها" });
    }

    // Verify OTP was verified
    const otp = await db.query.otpTable.findFirst({
      where: and(
        eq(otpTable.phone, phone),
        eq(otpTable.code, otpCode),
        eq(otpTable.verified, true)
      ),
    });

    if (!otp) {
      return res.status(400).json({ error: "otp_not_verified", message: "يجب التحقق من رقم الهاتف أولاً" });
    }

    // Check if user exists
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.phone, phone),
    });
    if (existingUser) {
      return res.status(400).json({ error: "phone_exists", message: "رقم الهاتف مسجل مسبقاً" });
    }

    if (email) {
      const existingEmail = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });
      if (existingEmail) {
        return res.status(400).json({ error: "email_exists", message: "البريد الإلكتروني مسجل مسبقاً" });
      }
    }

    let passwordHash: string | undefined = undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

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
    const { phone, email, password, otpCode } = req.body;

    let user: any = null;

    if (phone && otpCode) {
      // Login by phone + OTP
      const otp = await db.query.otpTable.findFirst({
        where: and(
          eq(otpTable.phone, phone),
          eq(otpTable.code, otpCode),
          eq(otpTable.verified, true)
        ),
      });

      if (!otp) {
        return res.status(401).json({ error: "invalid_otp", message: "رمز التحقق غير صحيح" });
      }

      user = await db.query.usersTable.findFirst({
        where: eq(usersTable.phone, phone),
      });
    } else if (email && password) {
      // Login by email + password
      user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email),
      });

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

    if (!user) {
      return res.status(401).json({ error: "user_not_found", message: "المستخدم غير موجود" });
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
