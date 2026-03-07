"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Download, Shield } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="w-16 h-16 bg-green-900/40 border border-green-700/40 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="text-green-400" size={32} />
      </div>

      <h1 className="text-4xl font-bold mb-3 text-center">You&apos;re all set!</h1>
      <p className="text-slate-400 text-lg text-center max-w-md mb-10">
        Your 14-day free trial has started. Download GSOC AI and enter your license key to activate.
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full mb-8">
        <h2 className="font-semibold mb-4">Next steps</h2>
        <ol className="space-y-4 text-sm text-slate-300">
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            Check your inbox for a confirmation email with your license key.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            Download GSOC AI for your platform below.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            Open the app, go to Settings → License, and enter your key.
          </li>
          <li className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
            Configure your business locations and connect your integrations.
          </li>
        </ol>
      </div>

      <a
        href="https://github.com/yourusername/gsoc-ai/releases/latest"
        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition-colors mb-4"
      >
        <Download size={18} />
        Download GSOC AI
      </a>

      {sessionId && (
        <p className="text-xs text-slate-600 mt-2">Session: {sessionId.slice(0, 20)}...</p>
      )}

      <div className="mt-8 flex items-center gap-2 text-slate-500 text-sm">
        <Shield className="text-blue-400" size={16} />
        <Link href="/" className="hover:text-slate-300 transition-colors">Back to GSOC AI</Link>
        {" · "}
        <a href="mailto:support@gsocai.com" className="hover:text-slate-300 transition-colors">Contact Support</a>
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
