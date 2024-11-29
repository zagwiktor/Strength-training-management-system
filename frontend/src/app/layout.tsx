import type { Metadata } from "next";
import "./globals.css";
import { Inter, Poppins } from 'next/font/google'



export const metadata: Metadata = {
  title: "STMS",
  description: "Strength training management system",
};

const poppins = Poppins({
  subsets: ['latin'], 
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], 
  style: ['normal', 'italic'], // Dostosuj style
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <div className="container-center">
          {children}
        </div>
      </body>
    </html>
  );
}
