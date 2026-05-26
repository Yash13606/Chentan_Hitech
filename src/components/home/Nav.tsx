"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { IndustrialButton } from "@/components/ui/industrial-button";

/**
 * Top navigation — client component because it needs:
 *   - useSession for the auth-aware links
 *   - useState for the mobile menu toggle
 * Everything else on the homepage is RSC.
 */
export function Nav() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NAV_LINKS = [
    { href: "/catalog", label: "Catalog" },
    { href: "/knowledge", label: "Knowledge" },
    { href: "/portal/consultations", label: "Consultations" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-md border-b border-border z-50 flex items-center px-6">
        <div className="flex items-center gap-8 flex-1">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-sm bg-foreground flex items-center justify-center">
              <span className="font-heading font-medium text-background text-[13px] leading-none">
                C
              </span>
            </div>
            <span className="font-heading font-medium tracking-tight text-base text-foreground">
              Chetan Hi-Tech
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground font-medium">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/portal"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/cart">
                <IndustrialButton size="sm" className="hidden md:flex gap-2">
                  <ShoppingCart className="w-4 h-4" /> My Cart
                </IndustrialButton>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">
                <IndustrialButton variant="tertiary" className="hidden md:flex">
                  Login
                </IndustrialButton>
              </Link>
              <Link href="/cart">
                <IndustrialButton className="gap-2" size="sm">
                  <ShoppingCart className="w-4 h-4" /> Request Quote
                </IndustrialButton>
              </Link>
            </>
          )}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-16 px-6 flex flex-col gap-4 lg:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="py-3 border-b border-border text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                href="/portal"
                className="py-3 border-b border-border text-sm font-medium flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                href="/cart"
                className="py-3 border-b border-border text-sm font-medium flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-4 h-4" /> My Cart
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="py-3 text-sm font-medium flex items-center gap-2 text-muted-foreground"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="py-3 border-b border-border text-sm font-medium flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" /> Login
              </Link>
              <Link
                href="/signup"
                className="py-3 border-b border-border text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
}
