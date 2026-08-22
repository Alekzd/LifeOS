import { QueryCtx, MutationCtx } from "./_generated/server";

// ─────────────────────────────────────────────────────────────────
// AUTH HELPERS — Server-side RBAC Guards
// CRITICAL: Never rely on client-side checks alone.
// All sensitive mutations MUST call requireAdmin(ctx) first.
// ─────────────────────────────────────────────────────────────────

/**
 * Lấy identity của user từ Clerk JWT.
 * Throw nếu chưa đăng nhập.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error(
      "UNAUTHORIZED: Yêu cầu đăng nhập. (Vui lòng đảm bảo bạn đã tạo JWT Template tên 'convex' trên Clerk Dashboard)."
    );
  }
  return identity;
}

/**
 * Lấy clerkId an toàn từ identity (tránh undefined nếu JWT thiếu claim sub).
 */
export function getClerkId(identity: any): string {
  if (!identity) return "";
  const sub = identity.subject;
  if (sub && sub.trim() !== "") return sub;
  const tokenSub = identity.tokenIdentifier?.split("|").pop();
  if (tokenSub && tokenSub.trim() !== "") return tokenSub;
  if (identity.email && identity.email.trim() !== "") return identity.email;
  return identity.nickname ?? "user_default";
}

/**
 * Lấy user document từ Convex DB theo clerkId.
 * Trả về null nếu chưa đăng nhập hoặc user chưa tồn tại trong DB.
 */
export async function getUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const clerkId = getClerkId(identity);
  if (!clerkId) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", clerkId))
    .first();
}

/**
 * Lấy user document từ Convex DB theo clerkId.
 * Throw nếu chưa đăng nhập. Nếu đã đăng nhập với Clerk nhưng chưa có doc DB (do upsert trễ), tự động khởi tạo doc.
 */
export async function requireUser(ctx: MutationCtx) {
  const identity = await requireAuth(ctx);
  const clerkId = getClerkId(identity);

  if (!clerkId) {
    throw new Error("UNAUTHORIZED: Không tìm thấy Clerk User ID trong JWT identity.");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q: any) => q.eq("clerkId", clerkId))
    .first();

  if (!user) {
    const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    const userEmail = (identity.email ?? "").trim().toLowerCase();
    const isAdminEmailMatch = adminEmail !== "" && userEmail === adminEmail;
    const role = isAdminEmailMatch ? "admin" : "user";
    const now = Date.now();
    const referralCode = generateReferralCode();

    const userId = await ctx.db.insert("users", {
      clerkId,
      email: identity.email ?? "",
      name: identity.name ?? identity.givenName ?? "User",
      avatarUrl: identity.pictureUrl ?? undefined,
      role,
      streakCount: 0,
      lastActiveDate: undefined,
      referralCode,
      createdAt: now,
      updatedAt: now,
    });
    user = (await ctx.db.get(userId))!;
  }

  return user;
}

/**
 * Lấy admin user document từ Convex DB.
 * Trả về null nếu chưa đăng nhập hoặc không phải admin.
 */
export async function getAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getUser(ctx);
  if (!user || user.role !== "admin") return null;
  return user;
}

/**
 * Server-side Admin Role Guard.
 * Throw FORBIDDEN nếu user không phải admin.
 * Dùng cho tất cả admin-only mutations.
 */
export async function requireAdmin(ctx: MutationCtx) {
  const user = await requireUser(ctx);

  if (user.role !== "admin") {
    throw new Error("FORBIDDEN: Thao tác này chỉ dành cho Admin.");
  }

  return user;
}

/**
 * Tạo referral code ngẫu nhiên 8 ký tự.
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Loại I, O, 0, 1
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Format ngày thành YYYY-MM-DD cho streak tracking.
 */
export function formatDateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Tính streak: Nếu lastActiveDate là hôm qua hoặc hôm nay, tiếp tục streak.
 * Nếu cách hơn 1 ngày, reset về 1.
 */
export function calculateNewStreak(
  currentStreak: number,
  lastActiveDate: string | undefined,
  today: string
): number {
  if (!lastActiveDate) return 1;
  if (lastActiveDate === today) return currentStreak; // Đã tính hôm nay

  const last = new Date(lastActiveDate);
  const todayDate = new Date(today);
  const diffDays = Math.floor(
    (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) return currentStreak + 1; // Ngày liên tiếp
  return 1; // Reset streak
}
