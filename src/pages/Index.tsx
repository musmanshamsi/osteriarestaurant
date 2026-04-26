import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Search, ChefHat } from "lucide-react";
import heroImg from "@/assets/hero-trattoria.jpg";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: "starter" | "pizza" | "pasta" | "main" | "dessert" | "drink";
  image_url: string | null;
  is_available: boolean;
};

const CATEGORIES: { key: MenuItem["category"] | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "starter", label: "Starters" },
  { key: "pizza", label: "Pizza" },
  { key: "pasta", label: "Pasta" },
  { key: "main", label: "Mains" },
  { key: "dessert", label: "Desserts" },
  { key: "drink", label: "Drinks" },
];

const Index = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<MenuItem["category"] | "all">("all");
  const [query, setQuery] = useState("");
  const { add } = useCart();

  useEffect(() => {
    document.title = "Osteria Bella · Wood-fired Italian Menu & Online Ordering";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Order from Osteria Bella's wood-fired Italian menu — pizza, pasta, mains and desserts. Fast, friendly online ordering.");
    (async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("category");
      if (error) toast.error("Couldn't load menu");
      setItems((data as MenuItem[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchCat = active === "all" || i.category === active;
      const matchQ = !query || i.name.toLowerCase().includes(query.toLowerCase()) || i.description?.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [items, active, query]);

  const handleAdd = (i: MenuItem) => {
    add({ id: i.id, name: i.name, price: Number(i.price), image_url: i.image_url });
    toast.success(`${i.name} added to cart`, { duration: 1600 });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[72vh] min-h-[480px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Wood-fired Margherita pizza, spaghetti and red wine on a rustic wooden table"
          className="absolute inset-0 h-full w-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="container relative z-10 flex h-full flex-col justify-end pb-16 text-primary-foreground">
          <Badge className="w-fit bg-primary/90 text-primary-foreground mb-4 animate-fade-up">Since 1978 · Wood-fired</Badge>
          <h1 className="font-display text-5xl md:text-7xl font-bold text-balance text-white animate-fade-up" style={{ animationDelay: "0.1s" }}>
            A taste of <em className="text-primary-glow not-italic">Italia</em>,<br className="hidden sm:block" /> made for you.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/85 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Hand-stretched dough, slow-simmered ragù, and family recipes — delivered hot to your door.
          </p>
          <div className="mt-8 flex gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button size="lg" className="bg-gradient-warm text-primary-foreground shadow-warm hover:opacity-95" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>
              Browse the Menu
            </Button>
            <Button size="lg" variant="outline" className="bg-background/10 text-white border-white/40 hover:bg-background/20 hover:text-white" onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}>
              Order Now
            </Button>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="container py-16 scroll-mt-20">
        <div className="flex flex-col items-center text-center mb-10">
          <ChefHat className="h-8 w-8 text-primary mb-2" />
          <h2 className="font-display text-4xl md:text-5xl">Our Menu</h2>
          <p className="text-muted-foreground mt-2 max-w-xl">Crafted daily from the finest Italian ingredients.</p>
        </div>

        {/* Search + categories */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="relative max-w-md mx-auto w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              placeholder="Search dishes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 bg-card"
              aria-label="Search menu"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="Menu categories">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                role="tab"
                aria-selected={active === c.key}
                onClick={() => setActive(c.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-smooth border ${
                  active === c.key
                    ? "bg-primary text-primary-foreground border-primary shadow-soft"
                    : "bg-card text-foreground border-border hover:border-primary/40"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 rounded-lg bg-muted/60 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No dishes match your search.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((i, idx) => (
              <Card
                key={i.id}
                className="group overflow-hidden border-border/60 bg-card shadow-card transition-smooth hover:shadow-warm hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${Math.min(idx * 0.04, 0.4)}s` }}
              >
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="font-display text-xl leading-tight">{i.name}</h3>
                    <span className="font-display text-xl text-gold whitespace-nowrap">${Number(i.price).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">{i.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="capitalize bg-secondary text-secondary-foreground">{i.category}</Badge>
                    <Button
                      size="sm"
                      onClick={() => handleAdd(i)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                      aria-label={`Add ${i.name} to cart`}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Index;
