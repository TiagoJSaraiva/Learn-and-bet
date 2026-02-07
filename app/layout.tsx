import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/components/AuthProvider";
import { MoneyChoiceModal } from "@/app/components/MoneyChoiceModal";
import { GlobalPopup } from "@/app/components/GlobalPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn & Bet | Quizzes Educacionais",
  description: "MVP de quizzes educacionais gamificados com foco em aprendizagem rápida.",
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
        <AuthProvider>
          {children}
          <MoneyChoiceModal />
          <GlobalPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
