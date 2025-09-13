import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TabBar from "../components/TabBar";
import DeviceGuard from "../components/DeviceGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Xply",
  description:
    "Xply — kunlik vazifalarni nazorat qilish uchun Next.js ilovasi. Siz vazifalarni bajarish orqali darajangizni (level) oshirishingiz mumkin.",
  icons: {
    icon: [
      {
        url: "https://i.pinimg.com/1200x/d1/7c/bf/d17cbf464feeb23ffd4f83fb1dd7dbba.jpg",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white`}
      >
        {/* <DeviceGuard> */}
        <div className="pb-20">{children}</div>
        <TabBar />
        {/* </DeviceGuard> */}
      </body>
    </html>
  );
}
