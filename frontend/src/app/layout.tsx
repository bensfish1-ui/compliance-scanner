"use client";

import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useState } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <title>Compliance Scanner - Enterprise Compliance Platform</title>
        <meta
          name="description"
          content="AI-powered enterprise compliance management platform"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-[Inter] antialiased bg-navy-900 text-slate-100 min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster
              theme="dark"
              position="top-right"
              richColors
              toastOptions={{
                style: {
                  background: "#1e293b",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#f1f5f9",
                },
              }}
            />
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
