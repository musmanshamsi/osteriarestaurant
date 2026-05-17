import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, UtensilsCrossed, LogOut, ShieldCheck, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { totalCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const linkCls = (path: string) =>
    `text-sm font-medium transition-smooth hover:text-primary ${
      location.pathname === path ? "text-primary" : "text-foreground/80"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group" aria-label="Osteria Bella home">
          <UtensilsCrossed className="h-6 w-6 text-primary transition-smooth group-hover:rotate-12" />
          <span className="font-display text-xl font-bold tracking-tight">Osteria Bella</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main">
          <Link to="/" className={linkCls("/")}>Menu</Link>
          {user && <Link to="/orders" className={linkCls("/orders")}>My Orders</Link>}
          {isAdmin && <Link to="/admin" className={linkCls("/admin")}>Admin</Link>}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/cart")}
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
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} aria-label="Admin dashboard" className="hidden sm:inline-flex">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </Button>
          )}

          {user ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate("/orders")} aria-label="My orders" className="hidden sm:inline-flex">
                <ClipboardList className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")} className="bg-gradient-warm text-primary-foreground shadow-soft hover:opacity-95">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
