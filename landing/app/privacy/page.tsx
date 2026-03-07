import Link from "next/link";
import { Shield } from "lucide-react";

const EFFECTIVE_DATE = "March 7, 2026";

export const metadata = {
  title: "Privacy Policy — GSOC AI",
};

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="text-white/60" size={20} />
            <span className="font-bold">GSOC AI</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/50 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="space-y-8 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Overview</h2>
            <p>
              GSOC AI is designed with a privacy-first architecture. Your operational security data — incidents,
              locations, camera feeds, audit logs — is stored locally on your device and is never sent to our servers.
              This policy explains the limited data we do collect and how we use it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>

            <h3 className="font-semibold text-slate-200 mt-4 mb-2">2.1 Account and Billing Data</h3>
            <p>
              When you purchase a subscription, Stripe collects and processes your payment information on our behalf.
              We receive from Stripe: your email address, organization name, subscription plan, and billing status.
              We do not store credit card numbers.
            </p>

            <h3 className="font-semibold text-slate-200 mt-4 mb-2">2.2 License Validation</h3>
            <p>
              The desktop application periodically contacts our license server to validate your subscription status.
              This check transmits your license key and app version. No operational data is transmitted.
            </p>

            <h3 className="font-semibold text-slate-200 mt-4 mb-2">2.3 Website Analytics</h3>
            <p>
              Our landing website uses privacy-respecting analytics (no cross-site tracking, no fingerprinting)
              to understand aggregate traffic patterns such as page views and referral sources.
            </p>

            <h3 className="font-semibold text-slate-200 mt-4 mb-2">2.4 Support Communications</h3>
            <p>
              If you contact us for support, we retain your email address and the content of your communication to
              resolve your issue.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Information We Do Not Collect</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Incident records, triage notes, or audit logs from the desktop app</li>
              <li>Video footage or camera feed data</li>
              <li>Third-party API keys or credentials you enter in the app</li>
              <li>Business location details or employee information</li>
              <li>AI triage inputs or outputs</li>
            </ul>
            <p className="mt-3">
              All of the above stays on your device.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To provision and manage your subscription</li>
              <li>To send transactional emails (receipts, license keys, trial reminders)</li>
              <li>To validate your software license</li>
              <li>To provide customer support</li>
              <li>To improve the product based on aggregate usage patterns</li>
            </ul>
            <p className="mt-3">We do not sell your data to third parties. We do not use your data for advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
            <p>We use the following sub-processors:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
              <li><strong>Stripe</strong> — payment processing. <a href="https://stripe.com/privacy" className="text-white/60 hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a></li>
              <li><strong>Anthropic</strong> — AI triage (your app connects directly to Anthropic using your API key; we are not in that data path)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
            <p>
              Account and billing records are retained for as long as your subscription is active and for up to 7 years
              thereafter for legal and tax compliance purposes. Support emails are retained for 2 years.
              You may request deletion of your account data at any time (see Section 8).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Security</h2>
            <p>
              We implement industry-standard security controls including TLS encryption for all data in transit,
              access controls for our internal systems, and regular security reviews. Your local app data is protected
              by your device&apos;s security controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have rights including: access to your personal data, correction
              of inaccurate data, deletion of your data (&quot;right to be forgotten&quot;), portability, and objection to
              certain processing. To exercise these rights, email{" "}
              <a href="mailto:privacy@gsocai.com" className="text-white/60 hover:underline">privacy@gsocai.com</a>.
              We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>
              The Service is intended for enterprise business use only. We do not knowingly collect personal
              information from anyone under 18 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. International Transfers</h2>
            <p>
              Our services are operated from the United States. If you are accessing the Service from outside the US,
              your information may be transferred to and processed in the US. We rely on standard contractual clauses
              for international transfers where required.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of material changes via email or
              in-app notice at least 30 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact</h2>
            <p>
              For privacy inquiries, contact our Data Protection contact at{" "}
              <a href="mailto:privacy@gsocai.com" className="text-white/60 hover:underline">privacy@gsocai.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 px-6 text-center text-sm text-white/30">
        <Link href="/" className="hover:text-slate-300 transition-colors">← Back to GSOC AI</Link>
        {" · "}
        <Link href="/tos" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
      </footer>
    </div>
  );
}
