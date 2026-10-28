import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Chat - Modern Assistant",
  description: "Modern AI chatbot user interface built with Next.js and Tailwind CSS",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="h-full min-h-screen bg-white text-zinc-900 dark:bg-[#212121] dark:text-[#ececec]">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
