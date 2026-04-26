import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ChefHat, Plus, ShieldAlert, Trash2 } from "lucide-react";

type Order = {
  id: string;
  status: string;
  total: number;
  notes: string | null;
  address: string | null;
  created_at: string;
  user_id: string | null;
  order_items: { name: string; quantity: number; price: number }[];
};

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
};

const statusList = ["pending", "preparing", "ready", "delivered", "cancelled"];
const categoryList = ["starter", "pizza", "pasta", "main", "dessert", "drink"];

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState<string>("all");

  // new item form
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCat, setNewCat] = useState("pizza");

  useEffect(() => { document.title = "Admin · Osteria Bella"; }, []);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) return;
    if (!user) return;
    loadAll();
    const ch = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, loadAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, loading]);

  const loadAll = async () => {
    const [oRes, iRes] = await Promise.all([
      supabase.from("orders").select("*, order_items(name, quantity, price)").order("created_at", { ascending: false }),
      supabase.from("menu_items").select("*").order("category"),
    ]);
    setOrders((oRes.data as Order[]) ?? []);
    setItems((iRes.data as MenuItem[]) ?? []);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) toast.error(error.message);
    else toast.success(`Order marked ${status}`);
  };

  const toggleAvailable = async (it: MenuItem) => {
    const { error } = await supabase.from("menu_items").update({ is_available: !it.is_available }).eq("id", it.id);
    if (error) toast.error(error.message);
    else { toast.success("Updated"); loadAll(); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); loadAll(); }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newPrice);
    if (!newName.trim() || isNaN(price) || price < 0) {
      toast.error("Enter a valid name and price");
      return;
    }
    const { error } = await supabase.from("menu_items").insert({
      name: newName.trim().slice(0, 100),
      description: newDesc.trim().slice(0, 500) || null,
      price,
      category: newCat as any,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Item added");
      setNewName(""); setNewDesc(""); setNewPrice("");
      loadAll();
    }
  };

  if (loading) return <Layout><div className="container py-12">Loading…</div></Layout>;

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="container max-w-md py-16">
          <Card className="p-8 text-center bg-card border-border/60">
            <ShieldAlert className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h1 className="font-display text-2xl mb-2">Admin only</h1>
            <p className="text-muted-foreground mb-6">You need admin access to view this page.</p>
            <Button onClick={() => navigate("/")}>Back to menu</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex items-center gap-3 mb-8">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="font-display text-4xl">Admin Dashboard</h1>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-secondary">
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="menu">Menu ({items.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {["all", ...statusList].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize border transition-smooth ${
                    filter === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40"
                  }`}
                >
                  {s} {s !== "all" && `(${orders.filter((o) => o.status === s).length})`}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">No orders.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredOrders.map((o) => (
                  <Card key={o.id} className="p-5 bg-card border-border/60 shadow-card">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">{o.status}</Badge>
                    </div>
                    <div className="space-y-1 text-sm border-t border-border/60 pt-3">
                      {o.order_items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.name} × {it.quantity}</span>
                          <span className="text-muted-foreground">${(Number(it.price) * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    {o.address && <p className="text-xs text-muted-foreground mt-3">📍 {o.address}</p>}
                    {o.notes && <p className="text-xs text-muted-foreground mt-1">📝 {o.notes}</p>}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/60 gap-3">
                      <span className="font-display text-lg text-gold">${Number(o.total).toFixed(2)}</span>
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className="w-40 bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statusList.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <Card className="p-6 mb-6 bg-secondary/40 border-border/60">
              <h3 className="font-display text-xl mb-4">Add a new dish</h3>
              <form onSubmit={addItem} className="grid gap-3 md:grid-cols-5">
                <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={100} className="md:col-span-2 bg-background" />
                <Input type="number" step="0.01" min="0" placeholder="Price" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="bg-background" />
                <Select value={newCat} onValueChange={setNewCat}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>{categoryList.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
                <Button type="submit" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Add</Button>
                <Textarea placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} maxLength={500} className="md:col-span-5 bg-background" />
              </form>
            </Card>

            <div className="grid gap-3">
              {items.map((it) => (
                <Card key={it.id} className="p-4 flex items-center gap-4 bg-card border-border/60">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg truncate">{it.name}</h3>
                      <Badge variant="outline" className="capitalize text-xs">{it.category}</Badge>
                    </div>
                    {it.description && <p className="text-xs text-muted-foreground truncate">{it.description}</p>}
                  </div>
                  <span className="font-display text-lg text-gold">${Number(it.price).toFixed(2)}</span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`av-${it.id}`} className="text-xs text-muted-foreground">Available</Label>
                    <Switch id={`av-${it.id}`} checked={it.is_available} onCheckedChange={() => toggleAvailable(it)} />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteItem(it.id)} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
