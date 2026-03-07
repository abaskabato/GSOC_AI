import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ensureSchema, createLicense, setLicenseStatus } from "@/lib/db";
import { generateLicenseKey, sendLicenseEmail } from "@/lib/license";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    await ensureSchema();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const trialEndsAt = sub.trial_end
          ? new Date(sub.trial_end * 1000)
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

        const licenseKey = generateLicenseKey();
        const email = session.customer_email ?? (session.customer_details?.email ?? "");
        const orgName = (session.metadata?.org_name ?? "") as string;
        const plan = (session.metadata?.plan ?? "starter") as string;

        await createLicense({
          key: licenseKey,
          email,
          orgName,
          plan,
          subscriptionId: sub.id,
          customerId: sub.customer as string,
          trialEndsAt,
        });

        await sendLicenseEmail({ email, orgName, plan, licenseKey, trialEndsAt });

        console.log("[webhook] License provisioned:", licenseKey, "→", email);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await setLicenseStatus(sub.id, "cancelled");
        console.log("[webhook] License cancelled for sub:", sub.id);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const status = sub.status === "active" || sub.status === "trialing" ? "active" : sub.status;
        await setLicenseStatus(sub.id, status);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        if (invoice.subscription) {
          await setLicenseStatus(invoice.subscription, "past_due");
        }
        console.log("[webhook] Payment failed:", invoice.customer_email);
        break;
      }
    }
  } catch (err: unknown) {
    console.error("[webhook] Handler error:", err instanceof Error ? err.message : err);
    // Return 200 so Stripe doesn't retry — log and investigate separately
  }

  return NextResponse.json({ received: true });
}
