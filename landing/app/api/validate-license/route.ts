import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getLicense, incrementActivations } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { licenseKey, appVersion } = await req.json();

    if (!licenseKey || typeof licenseKey !== "string") {
      return NextResponse.json({ valid: false, reason: "Missing license key" }, { status: 400 });
    }

    await ensureSchema();
    const license = await getLicense(licenseKey.trim().toUpperCase());

    if (!license) {
      return NextResponse.json({ valid: false, reason: "License key not found" }, { status: 200 });
    }

    if (license.status === "cancelled") {
      return NextResponse.json({ valid: false, reason: "Subscription cancelled" }, { status: 200 });
    }

    if (license.status === "past_due") {
      return NextResponse.json({ valid: false, reason: "Payment overdue — please update your billing details" }, { status: 200 });
    }

    if (license.trial_ends_at) {
      const trialEnd = new Date(license.trial_ends_at);
      if (license.status !== "active" && Date.now() > trialEnd.getTime()) {
        return NextResponse.json({ valid: false, reason: "Trial expired" }, { status: 200 });
      }
    }

    if (license.activations >= license.max_activations) {
      return NextResponse.json({
        valid: false,
        reason: `Activation limit reached (${license.max_activations} devices). Contact support to reset.`,
      }, { status: 200 });
    }

    // Count this activation
    await incrementActivations(licenseKey.trim().toUpperCase());

    console.log("[license] Activated:", licenseKey, "app:", appVersion, "org:", license.org_name);

    return NextResponse.json({
      valid: true,
      plan: license.plan,
      org: license.org_name,
      email: license.email,
      trialEndsAt: license.trial_ends_at,
      activationsUsed: license.activations + 1,
      maxActivations: license.max_activations,
    });
  } catch (err: unknown) {
    console.error("[validate-license]", err);
    return NextResponse.json({ valid: false, reason: "Server error" }, { status: 500 });
  }
}
