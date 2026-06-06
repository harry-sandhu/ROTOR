import type { ReactNode } from "react";
import Link from "next/link";

import { AuthStatus } from "../components/auth/AuthStatus";
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/builder", label: "Builder" },
  { href: "/products", label: "Products" },
  { href: "/builds", label: "Builds" },
  { href: "/admin", label: "Admin" },
  { href: "/auth", label: "Auth" },
];

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            borderBottom: "1px solid #27272a",
            position: "sticky",
            top: 0,
            background: "rgba(9, 9, 11, 0.92)",
            backdropFilter: "blur(12px)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "1rem 1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Link href="/" style={{ fontWeight: 700, fontSize: "1.125rem" }}>
              Rotor
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <AuthStatus />
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
