import type { Metadata } from "next";
import "./globals.css";

// Google Fonts (Geist) are unavailable in offline/CI environments.
// We fall back to system-ui / monospace which are always available.
// In production with internet access, add back next/font/google imports.

export const metadata: Metadata = {
  title: "GameForge AI — Generate. Transform. Organize. Ship.",
  description: "SaaS platform for indie game developers to generate and manage game-ready visual assets using AI and Cloudinary media pipeline.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={
        {
          "--font-geist-sans": "system-ui, -apple-system, sans-serif",
          "--font-geist-mono": "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
