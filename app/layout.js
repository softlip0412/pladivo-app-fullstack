import "./globals.css";
import { Toaster} from "@/components/ui/sonner"

export const metadata = {
  title: "Pladivo Admin",
  description: "Pladivo Admin Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
