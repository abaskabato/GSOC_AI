import Link from "next/link";
import { Shield, Zap, Globe, Camera, Bell, Brain, CheckCircle, ChevronRight, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Triage",
    desc: "Claude AI analyzes every incident in seconds — severity scoring, dismissal suggestions, escalation recommendations — so your analysts focus on what matters.",
  },
  {
    icon: Globe,
    title: "Threat Intelligence Feeds",
    desc: "Real-time alerts from Factal and Dataminr auto-geo-matched to your business locations. No manual monitoring, no missed threats.",
  },
  {
    icon: Bell,
    title: "Mass Notification",
    desc: "Escalate to AlertMedia or Everbridge with one click. SMS, email, and push to your entire workforce — instantly.",
  },
  {
    icon: Camera,
    title: "VMS Integration",
    desc: "Live camera feeds from Genetec Security Center and Milestone XProtect, surfaced directly inside your GSOC workspace.",
  },
  {
    icon: Zap,
    title: "SIEM Push",
    desc: "Every incident automatically forwarded to Splunk HEC or Microsoft Sentinel for compliance, forensics, and correlation.",
  },
  {
    icon: Shield,
    title: "Audit & Compliance",
    desc: "Immutable audit log of every action — who triaged what, when, and why. CSV export for auditors and legal teams.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: 299,
    desc: "One GSOC site, up to 5 analysts",
    features: [
      "AI incident triage (Claude)",
      "1 threat feed (Factal or Dataminr)",
      "Slack escalation",
      "Up to 10 camera sources",
      "Audit log & CSV export",
      "Email support",
    ],
    highlight: false,
  },
  {
    name: "Professional",
    price: 799,
    desc: "Multi-site, up to 25 analysts",
    features: [
      "Everything in Starter",
      "All threat feeds (Factal + Dataminr)",
      "AlertMedia & Everbridge",
      "Unlimited camera sources",
      "Splunk HEC + Sentinel push",
      "Twilio VoIP integration",
      "Priority support",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: null,
    desc: "Unlimited sites & analysts",
    features: [
      "Everything in Professional",
      "Custom integrations",
      "On-premise deployment option",
      "SSO / SAML",
      "Dedicated SLA & CSM",
      "Security review & custom MSA",
    ],
    highlight: false,
  },
];

const INTEGRATIONS = [
  { name: "Factal", cat: "Threat Intel" },
  { name: "Dataminr", cat: "Threat Intel" },
  { name: "AlertMedia", cat: "Mass Notification" },
  { name: "Everbridge", cat: "Mass Notification" },
  { name: "Genetec", cat: "VMS" },
  { name: "Milestone", cat: "VMS" },
  { name: "Splunk", cat: "SIEM" },
  { name: "Sentinel", cat: "SIEM" },
  { name: "Slack", cat: "Collaboration" },
  { name: "Twilio", cat: "VoIP" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="text-white" size={22} />
            <span className="font-bold text-lg tracking-tight">GSOC AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <a
            href="#pricing"
            className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-white/20 text-white/60 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            <Zap size={12} />
            AI-Powered Security Operations
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6">
            Your entire GSOC.
            <br />
            <span className="text-white/50">One desktop app.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            GSOC AI is the unified operations center for enterprise security teams — real-time threat intelligence,
            AI triage, mass notifications, VMS cameras, and SIEM push. Bring your own subscriptions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="bg-white text-black font-semibold px-8 py-4 rounded-xl text-lg flex items-center gap-2 justify-center hover:bg-white/90 transition-colors"
            >
              Start Free Trial <ArrowRight size={18} />
            </a>
            <a
              href="https://github.com/abaskabato/GSOC_AI/releases"
              className="border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-semibold px-8 py-4 rounded-xl text-lg flex items-center gap-2 justify-center transition-colors"
            >
              Download App
            </a>
          </div>
          <p className="mt-5 text-sm text-white/30">14-day free trial. No credit card required to download.</p>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-y border-white/10 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm">
          <span className="font-semibold text-white/40 uppercase tracking-wider text-xs">Trusted integrations</span>
          {INTEGRATIONS.map(({ name }) => (
            <span key={name} className="font-medium text-white/60">{name}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything your GSOC needs</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Built for physical security operations teams who need real-time situational awareness without switching between a dozen tools.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border border-white/10 rounded-2xl p-6 hover:border-white/25 transition-colors">
                <div className="w-10 h-10 border border-white/15 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="text-white/70" size={20} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-24 px-6 border-y border-white/10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Bring your own subscriptions</h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-12">
            GSOC AI is an integration layer. You pay your existing vendors directly — we connect everything into one workspace. Your data stays yours.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {INTEGRATIONS.map(({ name, cat }) => (
              <div key={name} className="border border-white/10 rounded-xl p-4 text-center hover:border-white/25 transition-colors">
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-white/35 mt-1">{cat}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-white/30 text-sm">
            More integrations added regularly.{" "}
            <a href="mailto:hello@gsocai.com" className="text-white/60 hover:text-white underline underline-offset-2">Request one</a>.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-white/50 text-lg">Per month, per organization. No per-seat fees.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.highlight
                    ? "bg-white text-black border-white"
                    : "border-white/10 hover:border-white/25 transition-colors"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-4 py-1 rounded-full border border-white/20">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-black" : ""}`}>{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? "text-black/50" : "text-white/50"}`}>{plan.desc}</p>
                  {plan.price != null ? (
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold">${plan.price.toLocaleString()}</span>
                      <span className={`mb-1 ${plan.highlight ? "text-black/40" : "text-white/40"}`}>/mo</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-extrabold">Custom</div>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle className={`mt-0.5 shrink-0 ${plan.highlight ? "text-black" : "text-white/50"}`} size={16} />
                      <span className={plan.highlight ? "text-black/80" : "text-white/70"}>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.price != null ? (
                  <Link
                    href={`/checkout?plan=${plan.name.toLowerCase()}`}
                    className={`w-full text-center py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                      plan.highlight
                        ? "bg-black text-white hover:bg-black/80"
                        : "border border-white/20 hover:border-white/40 text-white"
                    }`}
                  >
                    Start Free Trial <ChevronRight size={16} />
                  </Link>
                ) : (
                  <a
                    href="mailto:sales@gsocai.com"
                    className="w-full text-center py-3 rounded-xl font-semibold border border-white/20 hover:border-white/40 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    Contact Sales <ChevronRight size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-white/30 text-sm mt-8">
            All plans include a 14-day free trial. Cancel anytime.{" "}
            <Link href="/tos" className="text-white/60 hover:text-white underline underline-offset-2">Terms apply</Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to unify your GSOC?</h2>
          <p className="text-white/50 text-lg mb-8">
            Download GSOC AI today. Connect your existing tools. Triage incidents in seconds.
          </p>
          <a
            href="#pricing"
            className="bg-white text-black font-semibold px-8 py-4 rounded-xl text-lg inline-flex items-center gap-2 hover:bg-white/90 transition-colors"
          >
            Get Started Free <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <Shield className="text-white/60" size={16} />
            <span className="font-semibold text-white/60">GSOC AI</span>
            <span>© {new Date().getFullYear()} All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/tos" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <a href="mailto:support@gsocai.com" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
