import Link from "next/link";
import { Shield } from "lucide-react";

const EFFECTIVE_DATE = "March 7, 2026";

export const metadata = {
  title: "Terms of Service — GSOC AI",
};

export default function TOS() {
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
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-white/50 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using GSOC AI (&quot;Service&quot;, &quot;Software&quot;), you (&quot;Customer&quot;, &quot;you&quot;) agree to be bound
              by these Terms of Service (&quot;Terms&quot;). If you are entering into these Terms on behalf of an organization,
              you represent that you have authority to bind that organization. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              GSOC AI is a desktop software platform that provides a unified workspace for Global Security Operations
              Center (&quot;GSOC&quot;) teams. The Software integrates with third-party services including, but not limited to,
              threat intelligence feeds, mass notification platforms, video management systems (&quot;VMS&quot;), SIEM platforms,
              and VoIP providers (collectively, &quot;Third-Party Services&quot;).
            </p>
            <p className="mt-3">
              GSOC AI acts solely as an integration layer. You are responsible for maintaining separate subscriptions and
              accounts with any Third-Party Services you choose to connect. We do not resell, guarantee, or warrant the
              accuracy, availability, or fitness for purpose of any Third-Party Service data or functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. License Grant</h2>
            <p>
              Subject to your compliance with these Terms and timely payment of applicable fees, we grant you a
              limited, non-exclusive, non-transferable, revocable license to install and use the Software solely for
              your internal business security operations during the term of your subscription.
            </p>
            <p className="mt-3">
              You may not: (a) sublicense, sell, resell, or distribute the Software; (b) reverse engineer or attempt
              to extract source code; (c) use the Software for any unlawful purpose; or (d) remove or alter any
              proprietary notices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Subscriptions and Payment</h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li><strong>Trial Period:</strong> New subscribers receive a 14-day free trial. No charges are made during the trial. You may cancel before the trial ends at no cost.</li>
              <li><strong>Billing:</strong> After the trial, subscriptions are billed monthly in advance via Stripe. Prices are listed on our pricing page and may change with 30 days&apos; notice.</li>
              <li><strong>Auto-renewal:</strong> Subscriptions automatically renew unless cancelled at least 24 hours before the renewal date.</li>
              <li><strong>Refunds:</strong> Payments are non-refundable except where required by law. If you cancel mid-cycle, your access continues until the end of the current billing period.</li>
              <li><strong>Taxes:</strong> Prices exclude applicable taxes, which will be added at checkout where required.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Customer Data and API Keys</h2>
            <p>
              You retain all rights to your data, including incident records, audit logs, and configuration. GSOC AI
              stores data locally on your device using SQLite and does not transmit your operational data to our servers
              except as required to validate your license.
            </p>
            <p className="mt-3">
              API keys and credentials you enter for Third-Party Services are stored locally on your device. You are
              solely responsible for safeguarding these credentials and for all activity conducted through Third-Party
              Services using your credentials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
              <li>Conduct unauthorized surveillance or monitoring of individuals</li>
              <li>Violate any applicable law, regulation, or third-party rights</li>
              <li>Transmit malware, spam, or other harmful content</li>
              <li>Attempt to interfere with or disrupt the Service</li>
              <li>Use AI triage output as the sole basis for actions affecting life safety without human review</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. AI Features and Limitations</h2>
            <p>
              GSOC AI uses the Anthropic Claude API to provide AI-assisted incident triage. AI-generated assessments
              are for informational purposes only and do not constitute legal, security, or professional advice.
              You are solely responsible for all decisions made based on AI output. Always apply human judgment,
              especially for high-stakes escalation decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Intellectual Property</h2>
            <p>
              The Software, including its source code, design, trademarks, and documentation, is and remains the
              exclusive property of GSOC AI and its licensors. These Terms do not convey any intellectual property
              rights except the limited license expressly granted herein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Confidentiality</h2>
            <p>
              Each party agrees to keep confidential any non-public information of the other party disclosed in
              connection with these Terms, and to use such information only as permitted herein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
              INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
              NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL GSOC AI BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR LOSS OF PROFITS, DATA, OR GOODWILL,
              ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR THE USE OF THE SERVICE, EVEN IF ADVISED OF THE
              POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p className="mt-3">
              OUR TOTAL CUMULATIVE LIABILITY TO YOU FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE
              GREATER OF (A) THE FEES PAID BY YOU IN THE THREE MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED
              DOLLARS ($100).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless GSOC AI and its officers, directors, employees, and
              agents from any claims, damages, losses, liabilities, and costs (including legal fees) arising from:
              (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party
              rights; or (d) your use or configuration of Third-Party Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Term and Termination</h2>
            <p>
              These Terms remain in effect while you have an active subscription. Either party may terminate for
              convenience with 30 days&apos; written notice. We may suspend or terminate your access immediately for
              material breach of these Terms. Upon termination, your license ends and you must cease all use of the Software.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict of law
              principles. Any disputes shall be resolved by binding arbitration in accordance with the AAA Commercial
              Arbitration Rules, conducted in English. Class action waiver: all claims must be brought in an individual
              capacity, not as a class or representative action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">15. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will provide at least 30 days&apos; notice for material
              changes via email or in-app notice. Continued use after the effective date of changes constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">16. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:legal@gsocai.com" className="text-white/60 hover:underline">legal@gsocai.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 px-6 text-center text-sm text-white/30">
        <Link href="/" className="hover:text-slate-300 transition-colors">← Back to GSOC AI</Link>
        {" · "}
        <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
      </footer>
    </div>
  );
}
