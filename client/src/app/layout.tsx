import type { Metadata, Viewport } from "next";
import { Outfit, Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ServerPing from "@/components/ServerPing";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NextKey — Premium Home Rental Marketplace",
  description: "Find your next luxury homestay, apartment, or room listing with NextKey rental solutions.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-700">
        <AuthProvider>
          <ServerPing />
          {children}
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              style: { 
                borderRadius: '12px',
                background: '#334155',
                color: '#fff',
                fontSize: '12.5px',
                fontWeight: '600',
              } 
            }} 
          />
        </AuthProvider>
      </body>
    </html>
  );
}
