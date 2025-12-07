import "./globals.css";
import { Toaster} from "@/components/ui/sonner"
import { Be_Vietnam_Pro } from "next/font/google";

export const metadata = {
  title: "Pladivo Admin",
  description: "Pladivo Admin Dashboard",
};

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className={`min-h-screen bg-gray-50 text-gray-900 ${beVietnamPro.className}`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
