import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GSOC AI — Global Security Operations Center",
  description:
    "AI-powered desktop platform for enterprise security operations. Real-time incident triage, threat intelligence, mass notifications, and VMS integration — all in one unified workspace.",
  openGraph: {
    title: "GSOC AI",
    description:
      "AI-powered GSOC platform for enterprise security teams. Triage faster, respond smarter.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-slate-950 text-white`}>
        {children}
      </body>
    </html>
  );
}
