import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0d1117",
};

export const metadata: Metadata = {
  title: {
    default: "Life OS — Quản Lý Cuộc Sống Trong 1 Chạm",
    template: "%s | Life OS",
  },
  description:
    "Ứng dụng quản lý công việc và lịch trình phong cách Terminal Cyber. Tạo task nhanh, theo dõi streak năng suất, đồng bộ 100% trên mọi thiết bị.",
  keywords: ["task management", "calendar", "productivity", "life os", "quản lý công việc", "terminal theme"],
  authors: [{ name: "Life OS Team" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    title: "Life OS — Quản Lý Cuộc Sống Trong 1 Chạm",
    description: "Tăng năng suất mỗi ngày với Life OS — ứng dụng quản lý tác vụ thế hệ mới.",
    siteName: "Life OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Life OS",
    description: "Quản lý cuộc sống trong 1 chạm",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            variables: {
              colorPrimary: "oklch(0.72 0.22 142)",
              colorBackground: "#141920",
              colorInputBackground: "#0d1117",
              colorText: "#ffffff",
              colorTextSecondary: "#9ca3af",
              colorInputText: "#3fb950",
              borderRadius: "0px",
              fontFamily: '"Be Vietnam Pro", system-ui, sans-serif',
            },
            elements: {
              card: "rounded-none border border-[#30363d] bg-[#141920] shadow-2xl",
              headerTitle: "text-white font-mono font-bold text-lg",
              headerSubtitle: "text-gray-400 font-mono text-xs",
              socialButtonsBlockButton: "rounded-none border border-[#30363d] bg-[#0d1117] text-white hover:bg-[#1f242c]",
              socialButtonsBlockButtonText: "text-white font-semibold text-xs",
              socialButtonsBlockButtonArrow: "text-emerald-400",
              formButtonPrimary: "rounded-none bg-[#3fb950] text-black font-bold border border-[#3fb950] hover:bg-[#34a847]",
              formFieldInput: "rounded-none border border-[#30363d] bg-[#0d1117] text-emerald-400 focus:border-[#3fb950] font-mono text-xs",
              formFieldLabel: "text-gray-300 font-mono text-xs",
              formFieldHintText: "text-gray-400 font-mono text-[11px]",
              footerActionLink: "text-emerald-400 font-bold hover:underline",
              identityPreviewText: "text-white font-mono text-xs",
              identityPreviewEditButtonIcon: "text-emerald-400",
              dividerLine: "bg-[#30363d]",
              dividerText: "text-gray-400 font-mono text-xs",
            },
          }}
        >
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
