import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  ChefHat, 
  TrendingUp, 
  Star, 
  Clock, 
  RefreshCw,
  CheckCircle2,
  BarChart3,
  LayoutDashboard,
  Utensils,
  Layers,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Database
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import heroImg from "@/assets/hero-trattoria.jpg";
import { getMenu } from "@/lib/api";

import { ItemDetailsModal } from "@/components/ItemDetailsModal";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "starter", label: "Starters" },
  { key: "pizza", label: "Pizza" },
  { key: "pasta", label: "Pasta" },
  { key: "main", label: "Mains" },
  { key: "dessert", label: "Desserts" },
  { key: "drink", label: "Drinks" },
];


const Index = () => {
  const [active, setActive] = useState("all");
  const [sortBy, setSortBy] = useState("featured"); // featured, price-low, price-high, alphabetical
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const { add } = useCart();

  useEffect(() => {
    document.title = "Osteria Bella · Wood-fired Italian Menu";
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const { items: data } = await getMenu();
      
      // Add visual badges
      const enriched = (data ?? []).map((item, idx) => ({
        ...item,
        is_trending: idx % 7 === 0,
        is_bestseller: idx % 5 === 0,
      }));
      setItems(enriched);
    } catch (err) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = items.filter((i) => {
      const matchCat = active === "all" || i.category === active;
      const matchQ =
        !query ||
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.description?.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });

    // Apply Sorting
    if (sortBy === "price-low") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") list.sort((a, b) => b.price - a.price);
    if (sortBy === "alphabetical") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "top-rated") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === "featured") {
      // Bestsellers, trending, and highest rated first
      list.sort((a, b) => {
        const scoreA = (a.is_bestseller ? 5 : 0) + (a.is_trending ? 3 : 0) + (a.rating || 0);
        const scoreB = (b.is_bestseller ? 5 : 0) + (b.is_trending ? 3 : 0) + (b.rating || 0);
        return scoreB - scoreA;
      });
    }

    return list;
  }, [items, active, query, sortBy]);

  const handleAdd = (i) => {
    add({
      id: i.id,
      name: i.name,
      price: Number(i.price),
      image_url: i.image_url,
    });
    toast.success(`${i.name} added to cart`, { 
      duration: 1600,
      description: "You're going to love this choice!",
      icon: <Star className="h-4 w-4 text-gold" />
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col justify-between">
        <img
          src={heroImg}
          alt="Wood-fired Margherita pizza, spaghetti and red wine on a rustic wooden table"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[10000ms] hover:scale-105"
          width={1920}
          height={1080}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
        
        <div className="container relative z-10 flex flex-1 flex-col justify-center py-16 text-primary-foreground">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-up">
              <Badge className="bg-primary/90 text-primary-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-sm">
                Est. 1978
              </Badge>
              <Badge variant="outline" className="text-white border-white/40 backdrop-blur-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                Authentic Wood-Fired
              </Badge>
              <Badge variant="outline" className="text-amber-300 border-amber-400/40 bg-amber-500/10 backdrop-blur-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3 w-3" /> Three-Tier HCI Architecture
              </Badge>
            </div>
            <h1
              className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold text-balance text-white leading-[1.05] animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              A taste of <em className="text-primary-glow not-italic">Italia</em>,
              <br /> delivered to <span className="text-gold italic">you.</span>
            </h1>
            <p
              className="mt-5 max-w-lg text-base sm:text-xl text-white/85 font-medium leading-relaxed animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              Hand-stretched dough, slow-simmered ragù, and family secrets — crafted with passion, delivered hot with full-stack kitchen tracking.
            </p>
            <div
              className="mt-8 flex flex-wrap gap-3.5 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-8 h-12 rounded-full shadow-xl hover:scale-102 transition-transform text-sm font-semibold"
                onClick={() =>
                  document
                    .getElementById("menu")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Browse the Menu
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-md text-white border-white/30 hover:bg-white/20 px-8 h-12 rounded-full text-sm font-semibold transition-transform"
                onClick={() =>
                  document
                    .getElementById("menu")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Order Now
              </Button>
              <a href="/admin">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-amber-500/20 backdrop-blur-md text-amber-200 border-amber-500/40 hover:bg-amber-500/30 px-6 h-12 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" /> Admin & BI Dashboard
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative z-10 pb-6 text-center">
          <button
            onClick={() =>
              document
                .getElementById("features-showcase")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll down to features showcase"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Scroll to explore system</span>
            <div className="h-4 w-px bg-white/40 animate-pulse" />
          </button>
        </div>
      </section>

      {/* System Features & HCI Architecture Showcase Section */}
      <section id="features-showcase" className="relative py-20 bg-gradient-to-b from-black/95 via-secondary/30 to-background border-b border-border/40 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        
        <div className="container px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold tracking-widest uppercase mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Full-Stack System Features
            </div>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Osteria Bella <span className="text-primary italic">Platform</span> Architecture
            </h2>
            <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
              Designed with a warm, authentic Italian bistro aesthetic adhering to strict Human-Computer Interaction (HCI) standards and a robust three-tier architecture.
            </p>
          </div>

          {/* 6 Feature Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Customer Experience */}
            <div className="group relative p-8 rounded-[2rem] bg-card/80 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Utensils className="h-7 w-7" />
                </div>
                <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] uppercase font-bold tracking-wider mb-3">
                  Tier 1: Client Portal
                </Badge>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  Customer Experience
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Seamless, intuitive menu browsing with instant category filtering, real-time search, interactive dish detail modals, smart cart management, and streamlined order placement.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                <CheckCircle2 className="h-4 w-4" /> Intuitive UI & Cart Management
              </div>
            </div>

            {/* Card 2: Admin Dashboard */}
            <div className="group relative p-8 rounded-[2rem] bg-card/80 backdrop-blur-md border border-border/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="h-7 w-7" />
                </div>
                <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] uppercase font-bold tracking-wider mb-3">
                  Kitchen Operations
                </Badge>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  Admin Kitchen Dashboard
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Real-time kitchen order management with live status tracking (<span className="text-amber-500 font-semibold">Pending</span> ➔ <span className="text-blue-500 font-semibold">Preparing</span> ➔ <span className="text-indigo-500 font-semibold">Ready</span> ➔ <span className="text-emerald-500 font-semibold">Delivered</span>), instant status updates, and printable kitchen receipts.
                </p>
              </div>
              <a href="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline">
                Explore Admin Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Card 3: Business Intelligence */}
            <div className="group relative p-8 rounded-[2rem] bg-card/80 backdrop-blur-md border border-border/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider mb-3">
                  Data & Metrics
                </Badge>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  Business Intelligence
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Analytics widgets displaying real-time revenue metrics, total orders, average order value, and category-wise sales distribution charts powered by Recharts.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                <TrendingUp className="h-4 w-4" /> Live Revenue & Sales Charts
              </div>
            </div>

            {/* Card 4: Menu Management */}
            <div className="group relative p-8 rounded-[2rem] bg-card/80 backdrop-blur-md border border-border/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ChefHat className="h-7 w-7" />
                </div>
                <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px] uppercase font-bold tracking-wider mb-3">
                  Full CRUD Operations
                </Badge>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  Menu Management
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Complete CRUD operations for menu items with availability toggles, image URLs, pricing updates, and instant menu synchronization across all customers.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-500">
                <CheckCircle2 className="h-4 w-4" /> Real-time Availability Control
              </div>
            </div>

            {/* Card 5: Review System */}
            <div className="group relative p-8 rounded-[2rem] bg-card/80 backdrop-blur-md border border-border/50 hover:border-gold/50 transition-all duration-300 hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-amber-400/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <Badge className="bg-amber-400/15 text-amber-600 dark:text-amber-400 border-amber-400/20 text-[10px] uppercase font-bold tracking-wider mb-3">
                  Interactive Feedback
                </Badge>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  Customer Review System
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Customers can rate individual menu items, write detailed reviews, view aggregate star ratings, and leave dish feedback for the kitchen.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                <Star className="h-4 w-4 fill-current" /> 5-Star Rating & Review Modal
              </div>
            </div>

            {/* Card 6: 3-Tier Architecture & HCI Standards */}
            <div className="group relative p-8 rounded-[2rem] bg-card/80 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 flex flex-col justify-between">
              <div>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Database className="h-7 w-7" />
                </div>
                <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px] uppercase font-bold tracking-wider mb-3">
                  Engineering Architecture
                </Badge>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                  3-Tier Architecture & HCI
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  Strict three-tier separation (<span className="text-primary font-semibold">React Frontend</span> ➔ <span className="text-foreground font-semibold">API Middleware</span> ➔ <span className="text-emerald-500 font-semibold">Database</span>) with robust error handling, responsive mobile layout, and high HCI usability.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <ShieldCheck className="h-4 w-4" /> HCI & Clean Separation Standards
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="container py-14 sm:py-16 scroll-mt-16">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Our Menu</h2>
          <p className="text-muted-foreground mt-2 max-w-md text-sm sm:text-base">
            Every dish is a story of tradition, crafted daily with the finest DOP-certified ingredients.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="sticky top-20 z-30 bg-background/80 backdrop-blur-xl border-y border-border/40 py-6 mb-12 flex flex-col lg:flex-row items-center justify-between gap-6 px-4 rounded-3xl shadow-xl shadow-black/5">
          <div
            className="flex flex-wrap justify-center lg:justify-start gap-2"
            role="tablist"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                role="tab"
                aria-selected={active === c.key}
                onClick={() => setActive(c.key)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${
                  active === c.key
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-secondary/30 text-muted-foreground border-transparent hover:border-primary/20 hover:text-foreground"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:max-w-2xl">
            <div className="relative flex-1 group w-full">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <Input
                type="search"
                placeholder="Find your favorite..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-11 h-12 bg-secondary/30 border-transparent rounded-full focus:bg-card focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner"
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 rounded-full bg-secondary/30 border-transparent focus:ring-4 focus:ring-primary/5 shadow-inner px-6 text-xs font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <SelectValue placeholder="Sort By" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                  <SelectItem value="featured" className="text-xs font-bold py-3 uppercase tracking-widest">✨ Featured</SelectItem>
                  <SelectItem value="top-rated" className="text-xs font-bold py-3 uppercase tracking-widest">⭐ Top Rated</SelectItem>
                  <SelectItem value="price-low" className="text-xs font-bold py-3 uppercase tracking-widest">💸 Cheapest First</SelectItem>
                  <SelectItem value="price-high" className="text-xs font-bold py-3 uppercase tracking-widest">💎 Highest Price</SelectItem>
                  <SelectItem value="alphabetical" className="text-xs font-bold py-3 uppercase tracking-widest">🔤 A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[400px] rounded-[2rem] bg-muted/30 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="h-16 w-16 text-muted-foreground/20 mb-6" />
            <h3 className="text-2xl font-display font-bold">No matches found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {filtered.map((i, idx) => (
              <Card
                key={i.id}
                onClick={() => setSelectedDetailItem(i)}
                className="group relative flex flex-col h-full rounded-[2.5rem] border-border/40 bg-card overflow-hidden transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] hover:-translate-y-3 animate-fade-up cursor-pointer"
                style={{ animationDelay: `${Math.min(idx * 0.05, 0.5)}s` }}
              >
                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden">
                  <img 
                    src={i.image_url || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80"} 
                    alt={i.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                    {i.is_trending && (
                      <Badge className="bg-amber-500 text-white border-none text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-xl px-3 py-1 rounded-full">
                        <TrendingUp className="h-3 w-3" /> Trending
                      </Badge>
                    )}
                    {i.is_bestseller && (
                      <Badge className="bg-primary text-primary-foreground border-none text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-xl px-3 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-current" /> Bestseller
                      </Badge>
                    )}
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                      <Star className="h-3 w-3 text-gold fill-gold" />
                      <span className="text-[11px] font-black text-white">{i.rating?.toFixed(1) || "4.8"}</span>
                      <span className="text-[9px] text-white/60 font-medium">({i.reviewCount || "120"}+)</span>
                    </div>
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl shadow-xl border border-primary/20">
                      <span className="font-display text-xl font-black">
                        ${Number(i.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col h-full bg-gradient-to-b from-transparent to-secondary/5">
                  <div className="mb-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-1.5 block opacity-60">
                      {i.category}
                    </span>
                    <h3 className="font-display text-3xl font-bold leading-tight tracking-tight group-hover:text-primary transition-colors">
                      {i.name}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-8 line-clamp-3">
                    {i.description || "Our signature recipe using premium Italian ingredients and traditional techniques."}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60">
                        <Clock className="h-3.5 w-3.5" />
                        <span>15-20 MIN</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500/80">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>FRESH</span>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(i);
                      }}
                      className="rounded-full h-14 w-14 p-0 bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
                    >
                      <Plus className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Psychological Engagement Section */}
      <section className="bg-secondary/20 py-24 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: <Star className="h-8 w-8" />, title: "Premium Quality", desc: "We use only DOP-certified ingredients imported directly from local Italian producers." },
              { icon: <Clock className="h-8 w-8" />, title: "Fast Delivery", desc: "Our localized delivery network ensures your pizza arrives exactly as it left the oven." },
              { icon: <TrendingUp className="h-8 w-8" />, title: "Family Tradition", desc: "Recipes passed down through generations, refined for the modern palate." },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                <div className="h-16 w-16 rounded-3xl bg-card shadow-xl flex items-center justify-center text-primary mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-display font-bold mb-3">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ItemDetailsModal 
        open={!!selectedDetailItem} 
        onClose={() => setSelectedDetailItem(null)} 
        item={selectedDetailItem} 
      />
    </Layout>
  );
};

export default Index;
