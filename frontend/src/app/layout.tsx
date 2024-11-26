import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google'



export const metadata: Metadata = {
  title: "STMS",
  description: "Strength training management system",
};

const inter = Inter({
  subsets: ['latin']
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="container-center">
          {children}
        </div>
      </body>
    </html>
  );
}
