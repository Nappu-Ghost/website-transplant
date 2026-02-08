import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Island Resort - Your Perfect Getaway",
  description:
    "Discover our luxurious island resort featuring a theme park, pristine beaches, and world-class amenities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <AuthProvider>
          <Layout>{children}</Layout>
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </AuthProvider>
      </body>
    </html>
  );
}
