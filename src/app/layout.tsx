import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IndieDeck Submission",
  description: "Submit your own Indie Game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{ fontFamily: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` }}
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
