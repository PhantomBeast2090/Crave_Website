"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Receipt, Search, User, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { useApp } from "./providers";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/orders", label: "Orders", icon: Receipt },
  { href: "/favorites", label: "Saved", icon: Heart },
  { href: "/profile", label: "Profile", icon: User },
];

export function ConsumerShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { cartCount } = useApp();
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 bg-base/90 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-4">
          <Link href="/" className="font-display font-bold text-xl tracking-tight" aria-label="CRAVE home">
            CRAVE<span className="text-accent">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Primary">
            {[["Explore", "/search"], ["Offers", "/offers"], ["Favourites", "/favorites"], ["Orders", "/orders"]].map(([l, h]) => (
              <Link key={h + l} href={h} className={cn("px-3 py-2 rounded-m hover:bg-surface-2", path === h && "bg-ink text-white")}>{l}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/search" className="md:hidden p-2 rounded-m hover:bg-surface-2" aria-label="Search"><Search size={20} /></Link>
            <Link href="/cart" className="relative p-2 rounded-m bg-ink text-white hover:bg-charcoal-2" aria-label={`Cart, ${cartCount} items`}>
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-pill bg-accent text-accent-ink text-[11px] font-bold grid place-items-center tabular">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>
      <main id="main" className="flex-1 pb-24 md:pb-0">{children}</main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-line" aria-label="Mobile">
        <div className="grid grid-cols-5" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {TABS.map((t) => {
            const active = path === t.href;
            return (
              <Link key={t.href} href={t.href} aria-current={active ? "page" : undefined}
                className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold min-h-11", active ? "text-accent-deep" : "text-ink-2")}>
                <t.icon size={20} strokeWidth={active ? 2.5 : 2} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <footer className="hidden md:block border-t border-line mt-16">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-ink-2 flex flex-wrap gap-x-8 gap-y-2">
          <span className="font-display font-bold text-ink">CRAVE.</span>
          <span>SRM campus food OS · demo build</span>
          <Link href="/help" className="underline">Help</Link>
          <Link href="/campus" className="underline">Campus</Link>
          <span className="ml-auto flex items-center gap-1"><UtensilsCrossed size={14} /> Find it. Grab it. Get back to life.</span>
        </div>
      </footer>
    </div>
  );
}
