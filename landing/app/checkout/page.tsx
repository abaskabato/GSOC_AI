"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Shield, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const PLANS = {
  starter: {
    name: "Starter",
    price: 299,
    desc: "One GSOC site, up to 5 analysts",
    features: ["AI incident triage", "1 threat feed", "Slack escalation", "Audit log & CSV export"],
  },
  professional: {
    name: "Professional",
    price: 799,
    desc: "Multi-site, up to 25 analysts",
    features: ["All threat feeds", "AlertMedia & Everbridge", "Splunk + Sentinel push", "Twilio VoIP"],
  },
};

function CheckoutForm() {
  const params = useSearchParams();
  const planKey = (params.get("plan") ?? "professional") as keyof typeof PLANS;
  const plan = PLANS[planKey] ?? PLANS.professional;

  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError("You must agree to the Terms of Service to continue."); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, email, orgName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment setup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="text-blue-400" size={20} />
            <span className="font-bold">GSOC AI</span>
          </Link>
          <span className="text-slate-600 ml-2">/ Checkout</span>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
          {/* Plan summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Your Plan</div>
            <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
            <p className="text-slate-400 text-sm mb-6">{plan.desc}</p>

            <div className="flex items-end gap-1 mb-8">
              <span className="text-5xl font-extrabold">${plan.price.toLocaleString()}</span>
              <span className="text-slate-400 mb-1">/month</span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="text-blue-400 shrink-0" size={16} />
                  {f}
                </li>
              ))}
            </ul>

            <div className="bg-blue-950/40 border border-blue-700/30 rounded-xl p-4 text-sm text-blue-300">
              14-day free trial — your card will not be charged until the trial ends. Cancel anytime.
            </div>

            <div className="mt-6 flex items-center gap-2 text-slate-500 text-xs">
              <Lock size={12} />
              Secured by Stripe. PCI DSS compliant.
            </div>
          </div>

          {/* Checkout form */}
          <div>
            <h3 className="text-xl font-bold mb-6">Start your free trial</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Work email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Organization name
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => { setAgreed(e.target.checked); if (e.target.checked) setError(null); }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreed ? "bg-blue-600 border-blue-600" : "border-slate-600 bg-slate-800 group-hover:border-slate-500"}`}>
                    {agreed && <CheckCircle size={12} className="text-white" />}
                  </div>
                </div>
                <span className="text-sm text-slate-400 leading-snug">
                  I agree to the{" "}
                  <Link href="/tos" target="_blank" className="text-blue-400 hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" target="_blank" className="text-blue-400 hover:underline">Privacy Policy</Link>
                </span>
              </label>

              {error && (
                <div className="bg-red-950/50 border border-red-700/50 text-red-400 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Redirecting to Stripe...
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Start 14-Day Free Trial
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                You will be redirected to Stripe to securely enter payment details.
                You will not be charged during your trial.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  );
}
