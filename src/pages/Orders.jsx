import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Package, 
  ChevronRight, 
  ArrowLeft,
  XCircle,
  RefreshCw,
  Star
} from "lucide-react";
import { getMyOrders } from "@/lib/api";
import { AdminReceiptModal } from "@/components/AdminReceiptModal";
import { ReviewModal } from "@/components/ReviewModal";
import { toast } from "sonner";
import { useRef } from "react";

const statusConfig = {
  pending:   { label: "Pending",   color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock, desc: "Waiting for kitchen to accept" },
  preparing: { label: "Preparing", color: "bg-blue-500/10 text-blue-500 border-blue-500/20",   icon: RefreshCw, desc: "Chef is crafting your meal" },
  ready:     { label: "Ready",     color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: CheckCircle2, desc: "Order is ready for pickup/delivery!" },
  delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2, desc: "Enjoy your meal!" },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle, desc: "Order was cancelled" },
};

const Orders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [receiptOrderId, setReceiptOrderId] = useState(null);
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const prevOrdersRef = useRef({});

  useEffect(() => {
    document.title = "My Orders · Osteria Bella";
  }, []);

  const loadOrders = async (silent = false) => {
    if (!user) return;
    if (!silent) setFetching(true);
    try {
      const { orders: data } = await getMyOrders(user.id);
      
      // Notification Logic
      data.forEach(order => {
        const prevStatus = prevOrdersRef.current[order.id];
        if (prevStatus && prevStatus !== order.status) {
          const cfg = statusConfig[order.status];
          toast(order.status === 'ready' ? "🔔 Order Ready!" : `🍴 Order Update: ${cfg.label}`, {
            description: cfg.desc,
            duration: 6000,
          });
        }
        prevOrdersRef.current[order.id] = order.status;
      });

      setOrders(data ?? []);
    } catch (err) {
      if (!silent) toast.error(err.message || "Failed to load orders");
    } finally {
      if (!silent) setFetching(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!user) return;

    loadOrders();
    
    // In-memory real-time simulation: Refresh every 10 seconds for class project
    const interval = setInterval(() => loadOrders(true), 10000);
    return () => clearInterval(interval);
  }, [user, authLoading, navigate]);

  return (
    <Layout>
      <div className="container max-w-4xl py-8 sm:py-12 px-4">
        {/* ... (rest of the header and empty state remains the same) */}
        
        {/* Header (re-included for context) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-up">
          <div>
            <Button 
              variant="ghost" 
              className="mb-4 -ml-4 text-muted-foreground hover:text-primary" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">Order History</h1>
            <p className="text-muted-foreground text-base sm:text-lg mt-2">Track your current cravings and past favorites.</p>
          </div>
          <Button variant="outline" onClick={() => loadOrders()} disabled={fetching} className="rounded-full border-border/60">
            <RefreshCw className={`h-4 w-4 mr-2 ${fetching ? 'animate-spin' : ''}`} />
            Sync Status
          </Button>
        </div>

        {fetching && orders.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-3xl bg-muted/30 animate-pulse border border-border/40" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 bg-transparent overflow-hidden">
            <CardContent className="p-20 text-center">
              <div className="h-24 w-24 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">No orders yet</h3>
              <p className="text-muted-foreground mb-8 max-w-xs mx-auto text-balance">
                Your future delicious meals will appear here. Start by browsing our menu!
              </p>
              <Button onClick={() => navigate("/")} size="lg" className="rounded-full px-8 h-12 shadow-lg shadow-primary/20">
                Explore the Menu
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((o, idx) => {
              const cfg = statusConfig[o.status] ?? statusConfig.pending;
              const StatusIcon = cfg.icon;
              
              return (
                <Card
                  key={o.id}
                  className="group rounded-3xl border-border/40 overflow-hidden bg-card hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 animate-fade-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Info */}
                      <div className="flex-1 p-8">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">#{o.id.slice(-8).toUpperCase()}</span>
                              <Badge className={`${cfg.color} border-none text-[10px] uppercase font-black tracking-widest rounded-full px-3 py-0.5 shadow-sm`}>
                                <StatusIcon className="h-3 w-3 mr-1.5" />
                                {o.status}
                              </Badge>
                            </div>
                            <h3 className="text-sm font-medium text-muted-foreground">
                              {new Date(o.created_at).toLocaleString('en-US', { 
                                weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                              })}
                            </h3>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Total Paid</p>
                            <h4 className="text-3xl font-display font-black text-gold">${Number(o.total).toFixed(2)}</h4>
                          </div>
                        </div>

                        <div className="space-y-3 mb-8">
                          {o.order_items?.map((it, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-3">
                                <span className="h-6 w-6 rounded-lg bg-secondary flex items-center justify-center text-[10px] font-bold text-primary">{it.quantity}×</span>
                                <span className="font-medium text-foreground/80">{it.name}</span>
                              </div>
                              <span className="font-mono text-muted-foreground">${(Number(it.price) * it.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border/40">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-full">
                            <Package className="h-3.5 w-3.5" />
                            <span className="truncate max-w-[200px]">{o.address || "Dine-in"}</span>
                          </div>
                          {o.notes && (
                            <div className="text-xs italic text-muted-foreground/80">
                              " {o.notes} "
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions (Desktop) */}
                      <div className="w-full md:w-32 bg-secondary/10 border-t md:border-t-0 md:border-l border-border/40 flex flex-row md:flex-col items-center justify-center p-4 gap-4">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-2xl bg-card hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
                          onClick={() => setReceiptOrderId(o.id)}
                          title="Print Receipt"
                        >
                          <Printer className="h-5 w-5" />
                        </Button>
                        
                        {o.status === 'delivered' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-12 w-12 rounded-2xl bg-card hover:bg-gold/10 hover:text-gold transition-all shadow-sm"
                            onClick={() => setReviewingOrder(o)}
                            title="Rate & Review"
                          >
                            <Star className="h-5 w-5" />
                          </Button>
                        )}

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-2xl bg-card hover:bg-gold/10 hover:text-gold transition-all shadow-sm"
                          onClick={() => navigate("/")}
                          title="Order Again"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AdminReceiptModal 
        orderId={receiptOrderId} 
        open={!!receiptOrderId} 
        onClose={() => setReceiptOrderId(null)} 
      />

      <ReviewModal 
        open={!!reviewingOrder}
        onClose={() => setReviewingOrder(null)}
        items={reviewingOrder?.order_items}
        userName={user?.name}
        onSubmitted={() => {}}
      />
    </Layout>
  );
};

export default Orders;
