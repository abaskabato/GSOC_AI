"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Download, Shield, Monitor, Apple } from "lucide-react";
import Link from "next/link";

const RELEASES_BASE = "https://github.com/abaskabato/GSOC_AI/releases/latest/download";

const DOWNLOADS = [
  {
    label: "macOS",
    sub: "Apple Silicon (M1/M2/M3)",
    icon: Apple,
    file: "GSOC.AI_aarch64.dmg",
    ext: ".dmg",
  },
  {
    label: "macOS",
    sub: "Intel (x86_64)",
    icon: Apple,
    file: "GSOC.AI_x64.dmg",
    ext: ".dmg",
  },
  {
    label: "Windows",
    sub: "64-bit installer",
    icon: Monitor,
    file: "GSOC.AI_x64-setup.exe",
    ext: ".exe",
  },
  {
    label: "Windows",
    sub: "MSI package",
    icon: Monitor,
    file: "GSOC.AI_x64_en-US.msi",
    ext: ".msi",
  },
];

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="text-white" size={32} />
      </div>

      <h1 className="text-4xl font-bold mb-3 text-center">You&apos;re all set!</h1>
      <p className="text-white/50 text-lg text-center max-w-md mb-10">
        Your 14-day free trial has started. Download GSOC AI for your platform and enter your license key.
      </p>

      {/* Next steps */}
      <div className="border border-white/10 rounded-2xl p-8 max-w-lg w-full mb-10">
        <h2 className="font-semibold mb-4">Next steps</h2>
        <ol className="space-y-4 text-sm text-white/70">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 border border-white/20 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
            Check your inbox — your license key will arrive within a few minutes.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 border border-white/20 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
            Download GSOC AI for your operating system below.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 border border-white/20 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
            Open the app, go to <span className="font-mono text-white/90 text-xs bg-white/10 px-1.5 py-0.5 rounded">Settings → License</span> and enter your key.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 border border-white/20 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
            Configure your business locations and connect your integrations.
          </li>
        </ol>
      </div>

      {/* Platform download grid */}
      <div className="w-full max-w-lg mb-6">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4 text-center">Download for your platform</h2>
        <div className="grid grid-cols-2 gap-3">
          {DOWNLOADS.map(({ label, sub, icon: Icon, file, ext }) => (
            <a
              key={file}
              href={`${RELEASES_BASE}/${file}`}
              className="border border-white/10 hover:border-white/30 rounded-xl p-4 flex items-center gap-3 transition-colors group"
            >
              <div className="w-9 h-9 border border-white/15 rounded-lg flex items-center justify-center shrink-0 group-hover:border-white/30 transition-colors">
                <Icon size={18} className="text-white/60" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight">{label}</p>
                <p className="text-white/40 text-xs leading-tight mt-0.5 truncate">{sub}</p>
                <p className="text-white/25 text-xs mt-1 font-mono">{ext}</p>
              </div>
              <Download size={14} className="text-white/30 ml-auto shrink-0 group-hover:text-white/60 transition-colors" />
            </a>
          ))}
        </div>

        <p className="text-center text-white/25 text-xs mt-4">
          All releases also available on{" "}
          <a
            href="https://github.com/abaskabato/GSOC_AI/releases"
            className="text-white/50 hover:text-white underline underline-offset-2 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Releases
          </a>
        </p>
      </div>

      {sessionId && (
        <p className="text-xs text-white/20 mt-2 font-mono">ref: {sessionId.slice(0, 24)}…</p>
      )}

      <div className="mt-8 flex items-center gap-3 text-white/30 text-sm">
        <Shield className="text-white/60" size={16} />
        <Link href="/" className="hover:text-white transition-colors">Back to GSOC AI</Link>
        <span>·</span>
        <a href="mailto:support@gsocai.com" className="hover:text-white transition-colors">Contact Support</a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
