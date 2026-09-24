import type { Metadata } from "next";
import { start } from "@/lib/rooms";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lighthouse, by Dan",
  description: "A small text adventure set in a lighthouse.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Rendered with the starting room so the theme is right before hydration. */}
      <body data-room={start}>
        <div className="beam" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
