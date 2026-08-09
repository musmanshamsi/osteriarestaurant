import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  UtensilsCrossed,
  LogOut,
  ShieldCheck,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { totalCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkCls = (path) =>
    `text-sm font-medium transition-smooth hover:text-primary ${
      location.pathname === path ? "text-primary" : "text-foreground/80"
    }`;

  const mobileLinkCls = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
      location.pathname === path
        ? "bg-primary/10 text-primary"
        : "text-foreground/80 hover:bg-secondary/60 hover:text-primary"
    }`;

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 group"
          aria-label="Osteria Bella home"
          onClick={closeMobile}
        >
          <UtensilsCrossed className="h-6 w-6 text-primary transition-smooth group-hover:rotate-12" />
          <span className="font-display text-xl font-bold tracking-tight">
            Osteria Bella
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          <Link to="/" className={linkCls("/")}>
            Menu
          </Link>
          {user && (
            <Link to="/orders" className={linkCls("/orders")}>
              My Orders
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className={linkCls("/admin")}>
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { navigate("/cart"); closeMobile(); }}
            className="relative"
            aria-label={`Cart with ${totalCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCount > 0 && (
              <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-primary px-1 text-[10px] animate-pop-in">
                {totalCount}
              </Badge>
            )}
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { navigate("/admin"); closeMobile(); }}
              aria-label="Admin dashboard"
              className="hidden sm:inline-flex"
            >
              <ShieldCheck className="h-5 w-5 text-accent" />
            </Button>
          )}

          {user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { navigate("/orders"); closeMobile(); }}
                aria-label="My orders"
                className="hidden sm:inline-flex"
              >
                <ClipboardList className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                  closeMobile();
                }}
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => { navigate("/auth"); closeMobile(); }}
              className="hidden sm:inline-flex bg-gradient-warm text-primary-foreground shadow-soft hover:opacity-95"
            >
              Sign in
            </Button>
          )}

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl px-4 py-4 space-y-1 animate-fade-up">
          <nav aria-label="Mobile">
            <Link to="/" className={mobileLinkCls("/")} onClick={closeMobile}>
              <UtensilsCrossed className="h-4 w-4" /> Menu
            </Link>
            {user && (
              <Link to="/orders" className={mobileLinkCls("/orders")} onClick={closeMobile}>
                <ClipboardList className="h-4 w-4" /> My Orders
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={mobileLinkCls("/admin")} onClick={closeMobile}>
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>
          <div className="pt-3 border-t border-border/40 flex flex-col gap-2">
            {user ? (
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                  closeMobile();
                }}
              >
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            ) : (
              <Button
                className="w-full bg-gradient-warm text-primary-foreground"
                onClick={() => { navigate("/auth"); closeMobile(); }}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
