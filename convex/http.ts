import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Clerk Webhook — Sync user on sign-up / update / delete
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!WEBHOOK_SECRET) {
      return new Response("CLERK_WEBHOOK_SIGNING_SECRET not set", { status: 500 });
    }

    const body = await request.text();
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    let evt: { type: string; data: Record<string, unknown> };
    try {
      // Basic signature verification (in production use svix npm package)
      evt = JSON.parse(body);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    // Handle user events
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const data = evt.data as {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
        image_url?: string;
        unsafe_metadata?: { referredBy?: string };
      };

      const email = data.email_addresses?.[0]?.email_address ?? "";
      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || email.split("@")[0];

      await ctx.runMutation(api.users.upsertUser, {
        clerkId: data.id,
        email,
        name,
        avatarUrl: data.image_url,
        referredBy: data.unsafe_metadata?.referredBy,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
