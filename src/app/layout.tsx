import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "../lib/providers/QueryProvider";
import "./globals.css";
import "./tiptap.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Determine icon based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const iconPath = isDevelopment ? '/sparkles-white.png' : '/icon.svg';

export const metadata: Metadata = {
  title: "Vela",
  description: "Application de gestion de notes et projets",
  icons: {
    icon: [
      {
        url: iconPath,
        type: isDevelopment ? 'image/png' : 'image/svg+xml',
      },
    ],
    shortcut: iconPath,
    apple: iconPath,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
