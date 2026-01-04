import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import IntercomProvider from "@/components/IntercomProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Treki - Your Travel Planner AI Agent",
  description: "Plan your travels from YouTube recommendations",
  icons: {
    icon: "/Favicon.svg",
    apple: "/Favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <IntercomProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
