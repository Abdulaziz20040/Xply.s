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
  title: "Hikari",
  description: "Moliyaviy boshqaruv uchun Next.js ilovasi",
  icons: {
    icon: "https://i.pinimg.com/736x/f4/23/b5/f423b57479009fe7057ab06bebafc6ed.jpg",
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
