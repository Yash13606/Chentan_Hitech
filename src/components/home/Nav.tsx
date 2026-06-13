"use client";

import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { IndustrialButton } from "@/components/ui/industrial-button";
import { useCartCount } from "@/lib/use-cart-count";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/server/actions/auth";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Nav() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.id;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useCartCount();

  const NAV_LINKS = [
    { href: "/catalog", label: "Catalog" },
    { href: "/knowledge", label: "Knowledge" },
    { href: "/portal/consultations", label: "Consultations" },
    { href: "/inquiry", label: "Contact" },
  ];

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-md border-b border-border z-50 flex items-center px-4 sm:px-6">
        <div className="flex items-center gap-6 flex-1 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="w-7 h-7 rounded-sm bg-foreground flex items-center justify-center shrink-0">
              <span className="font-heading font-medium text-background text-[13px] leading-none">
                C
              </span>
            </div>
            <span className="font-heading font-medium tracking-tight text-sm sm:text-base text-foreground">
              Chetan Hi-Tech
            </span>
          </Link>
          <div className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground font-medium">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition-colors whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isLoggedIn ? (
            <>
              <Link
                href="/portal"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link href="/cart" className="relative hidden md:inline-flex">
                <IndustrialButton size="sm" className="gap-2 pr-3">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">My Cart</span>
                  {cartCount > 0 && (
                    <span
                      className={cn(
                        "ml-1 h-5 min-w-5 px-1.5 grid place-items-center rounded-full",
                        "bg-background text-foreground text-[11px] font-mono font-medium tabular-nums leading-none"
                      )}
                      aria-label={`${cartCount} items in cart`}
                    >
                      {cartCount}
                    </span>
                  )}
                </IndustrialButton>
              </Link>
              <form action={signOutAction} className="hidden md:block">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
              <Link href="/cart" className="relative">
                <IndustrialButton className="gap-1.5 sm:gap-2 pr-2 sm:pr-3" size="sm">
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span className="hidden xs:inline sm:inline whitespace-nowrap">Request Quote</span>
                  {cartCount > 0 && (
                    <span
                      className={cn(
                        "ml-0.5 sm:ml-1 h-5 min-w-5 px-1.5 grid place-items-center rounded-full",
                        "bg-background text-foreground text-[11px] font-mono font-medium tabular-nums leading-none"
                      )}
                      aria-label={`${cartCount} items in cart`}
                    >
                      {cartCount}
                    </span>
                  )}
                </IndustrialButton>
              </Link>
            </>
          )}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center text-foreground rounded-md hover:bg-muted/50 transition-colors shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ rotate: 45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={closeMenu}
            />

            {/* Menu panel */}
            <motion.div
              className="fixed top-16 left-0 right-0 z-40 bg-background border-b border-border lg:hidden overflow-y-auto max-h-[calc(100dvh-4rem)]"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: EASE }}
            >
              <div className="px-4 sm:px-6 py-3 flex flex-col">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="py-3.5 border-b border-border text-sm font-medium text-foreground hover:text-muted-foreground transition-colors flex items-center"
                    onClick={closeMenu}
                  >
                    {l.label}
                  </Link>
                ))}

                {isLoggedIn ? (
                  <>
                    <Link
                      href="/portal"
                      className="py-3.5 border-b border-border text-sm font-medium flex items-center gap-2"
                      onClick={closeMenu}
                    >
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Dashboard
                    </Link>
                    <Link
                      href="/cart"
                      className="py-3.5 border-b border-border text-sm font-medium flex items-center gap-2"
                      onClick={closeMenu}
                    >
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" /> My Cart
                      {cartCount > 0 && (
                        <span className="ml-auto font-mono text-xs text-muted-foreground">
                          {cartCount} items
                        </span>
                      )}
                    </Link>
                    <form action={signOutAction} className="mt-1">
                      <button
                        type="submit"
                        className="w-full py-3.5 text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="py-3.5 border-b border-border text-sm font-medium flex items-center gap-2"
                      onClick={closeMenu}
                    >
                      <User className="w-4 h-4 text-muted-foreground" /> Login
                    </Link>
                    <Link
                      href="/signup"
                      className="py-3.5 text-sm font-medium"
                      onClick={closeMenu}
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
