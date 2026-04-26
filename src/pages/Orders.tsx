import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

type Order = {
  id: string;
  status: string;
  total: number;
  notes: string | null;
  address: string | null;
  created_at: string;
  order_items: { name: string; quantity: number; price: number }[];
};

const statusColor: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  preparing: "bg-gold text-gold-foreground",
  ready: "bg-accent text-accent-foreground",
  delivered: "bg-primary text-primary-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
};

const Orders = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { document.title = "My Orders · Osteria Bella"; }, []);

  useEffect(() => {
    if (!loading && !user) { navigate("/auth"); return; }
    if (!user) return;

    const load = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(name, quantity, price)")
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) ?? []);
      setFetching(false);
    };
    load();

    const channel = supabase
      .channel("user-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loading, navigate]);

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-4xl mb-8">My Orders</h1>
        {fetching ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border/60">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o.id} className="p-6 bg-card border-border/60 shadow-card animate-fade-up">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                  </div>
                  <Badge className={`${statusColor[o.status]} capitalize`}>{o.status}</Badge>
                </div>
                <div className="space-y-1 text-sm border-t border-border/60 pt-3">
                  {o.order_items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{it.name} × {it.quantity}</span>
                      <span className="text-muted-foreground">${(Number(it.price) * it.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/60">
                  <span className="text-sm text-muted-foreground">{o.address}</span>
                  <span className="font-display text-lg text-gold">${Number(o.total).toFixed(2)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
