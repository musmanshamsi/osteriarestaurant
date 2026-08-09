import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ChefHat, 
  Plus, 
  ShieldAlert, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Settings2, 
  Utensils, 
  ClipboardList,
  Search,
  RefreshCw,
  TrendingUp,
  LayoutDashboard,
  Users,
  User,
  Settings,
  DollarSign,
  Package,
  Clock,
  Edit,
  Power,
  Download,
  Mail
} from "lucide-react";
import { 
  getOrders, 
  updateOrderStatus, 
  getMenu, 
  deleteMenuItem, 
  getAnalytics,
  updateMenuItem,
  getUsers
} from "@/lib/api";
import { AdminReceiptModal } from "@/components/AdminReceiptModal";
import { MenuItemEditor } from "@/components/MenuItemEditor";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Clock },
  preparing: { label: "Preparing", color: "bg-blue-500/10 text-blue-500 border-blue-500/20",   icon: RefreshCw },
  ready:     { label: "Ready",     color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: CheckCircle2 },
  delivered: { label: "Delivered", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

const CATEGORY_ICONS = {
  starter: "🥗",
  pizza: "🍕",
  pasta: "🍝",
  main: "🍖",
  dessert: "🍮",
  drink: "🥤",
};

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // New state for customer list
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState(""); // For customer tab
  const [orderSortOrder, setOrderSortOrder] = useState("fifo");
  
  // Modals
  const [receiptOrderId, setReceiptOrderId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [isItemEditorOpen, setIsItemEditorOpen] = useState(false);

  useEffect(() => {
    document.title = "Admin Dashboard · Osteria Bella";
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [oRes, mRes, aRes, uRes] = await Promise.all([
        getOrders(),
        getMenu(true),
        getAnalytics(),
        getUsers()
      ]);
      
      const sortedOrders = (oRes.orders ?? []).sort((a, b) => 
        new Date(a.created_at) - new Date(b.created_at)
      );
      
      setOrders(sortedOrders);
      setMenuItems(mRes.items ?? []);
      setAnalytics(aRes);
      setAllUsers(uRes.users ?? []);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      toast.error("Failed to sync dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) return;
    if (!user) return;
    loadData();
    
    // Polling for simulation in class project
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [user, isAdmin, authLoading]);

  // Filtered and Sorted Orders
  const filteredOrders = useMemo(() => {
    let list = orders.filter(o => 
      o.customer_name.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase())
    );
    
    // Default FIFO for active, LIFO for history is handled in the columns
    return list;
  }, [orders, orderSearchQuery]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      toast.success(`Order marked as ${status}`);
      // Local update for speed
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDownloadReport = () => {
    if (!orders.length) return toast.error("No data to export");

    // CSV Headers
    const headers = ["Order ID", "Date", "Customer", "Items", "Total ($)", "Status", "Address"];
    
    // CSV Rows
    const rows = orders.map(o => [
      o.id,
      new Date(o.created_at).toLocaleString(),
      o.customer_name,
      o.order_items.map(it => `${it.quantity}x ${it.name}`).join(" | "),
      o.total,
      o.status,
      o.address || "Dine-in"
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Osteria_Bella_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel-compatible report downloaded!");
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this item?")) return;
    try {
      await deleteMenuItem(id);
      toast.success("Item deleted");
      setMenuItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleAvailable = async (item) => {
    try {
      await updateMenuItem(item.id, { is_available: !item.is_available });
      toast.success(`Item marked as ${item.is_available ? 'unavailable' : 'available'}`);
      setMenuItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(i => 
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-20 flex flex-col items-center justify-center gap-4">
          <RefreshCw className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Authenticating...</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <Layout>
        <div className="container max-w-md py-20">
          <Card className="border-destructive/20 shadow-xl overflow-hidden">
            <div className="h-2 w-full bg-destructive" />
            <CardContent className="p-10 text-center">
              <ShieldAlert className="h-16 w-16 mx-auto text-destructive mb-6" />
              <h1 className="font-display text-3xl font-bold mb-3">Access Denied</h1>
              <p className="text-muted-foreground mb-8 text-balance">
                You do not have the required administrative permissions to access this dashboard.
              </p>
              <Button onClick={() => navigate("/")} className="w-full h-12 text-lg">
                Return to Menu
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6 sm:py-10 px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <ChefHat className="h-7 w-7 text-primary" />
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground text-base sm:text-lg">Manage your kitchen, menu, and business performance.</p>
          </div>
          
          <div className="flex gap-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <Button 
              variant="outline" 
              onClick={loadData} 
              disabled={loading}
              className="h-11 rounded-xl border-border/60 hover:bg-secondary/50 gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Data
            </Button>
            <Button onClick={() => { setEditingItem(null); setIsItemEditorOpen(true); }} className="h-11 rounded-xl shadow-lg shadow-primary/20 gap-2">
              <Plus className="h-4 w-4" /> New Dish
            </Button>
          </div>
        </div>

        {/* Analytics Summary Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Today's Revenue", value: `$${analytics.kpis.todayRevenue}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10", trend: "+12% vs yesterday" },
              { label: "Orders Today", value: analytics.kpis.todayOrders, icon: Package, color: "text-primary", bg: "bg-primary/10", trend: "+5 from average" },
              { label: "Pending Now", value: analytics.kpis.pendingCount, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", pulse: analytics.kpis.pendingCount > 0 },
              { label: "Active Orders", value: analytics.kpis.activeCount, icon: RefreshCw, color: "text-blue-500", bg: "bg-blue-500/10" },
            ].map((stat, i) => (
              <Card key={i} className="border-border/40 shadow-sm hover:shadow-md transition-all animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                      <stat.icon className={`h-6 w-6 ${stat.pulse ? 'animate-pulse' : ''}`} />
                    </div>
                    {stat.trend && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{stat.trend}</span>}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            {/* Horizontally scrollable tabs on mobile */}
            <div className="w-full sm:w-auto overflow-x-auto scrollbar-none">
              <TabsList className="bg-secondary/20 p-1.5 rounded-2xl border border-border/40 flex-nowrap min-w-max">
              <TabsTrigger value="orders" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <ClipboardList className="h-4 w-4 mr-2" /> Live Orders
              </TabsTrigger>
              <TabsTrigger value="menu" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <Utensils className="h-4 w-4 mr-2" /> Menu Editor
              </TabsTrigger>
              <TabsTrigger value="customers" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <Users className="h-4 w-4 mr-2" /> Customers
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                <BarChart3 className="h-4 w-4 mr-2" /> Insights
              </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:max-w-md">
              {activeTab === "menu" ? (
                <div className="relative w-full group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search menu items..." 
                    className="w-full pl-10 pr-4 h-11 rounded-xl bg-secondary/30 border-transparent focus:bg-card focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              ) : activeTab === "orders" ? (
                <>
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search orders or customers..." 
                      className="w-full pl-10 pr-4 h-11 rounded-xl bg-secondary/30 border-transparent focus:bg-card focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none"
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={orderSortOrder} onValueChange={setOrderSortOrder}>
                    <SelectTrigger className="w-32 h-11 rounded-xl bg-secondary/30 border-transparent focus:ring-4 focus:ring-primary/5 shadow-none text-xs font-bold uppercase tracking-widest">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40 shadow-2xl">
                      <SelectItem value="fifo" className="text-[10px] font-bold py-2 uppercase tracking-widest">⏳ FIFO</SelectItem>
                      <SelectItem value="lifo" className="text-[10px] font-bold py-2 uppercase tracking-widest">⚡ LIFO</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : activeTab === "customers" ? (
                <div className="relative w-full group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    className="w-full pl-10 pr-4 h-11 rounded-xl bg-secondary/30 border-transparent focus:bg-card focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all text-sm outline-none"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                </div>
              ) : null}
            </div>
          </div>

          {/* ORDERS TAB - Live Kanban */}
          <TabsContent value="orders" className="space-y-6 mt-0">
            {loading ? (
              <div className="grid md:grid-cols-3 gap-6 h-[500px]">
                {[1, 2, 3].map(i => <div key={i} className="bg-muted/30 rounded-2xl animate-pulse border border-border/40" />)}
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="py-20 border-dashed border-2 bg-transparent rounded-[2rem]">
                <div className="flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
                    <ClipboardList className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">No Active Orders</h3>
                  <p className="text-muted-foreground max-w-xs">New orders will appear here automatically as they are placed.</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* 3-column kanban - stacks on mobile, columns on lg */}
                {/* 1. Pending Column */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="font-display text-xl font-bold flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                      Pending
                      <Badge variant="secondary" className="ml-2 font-mono">{filteredOrders.filter(o => o.status === 'pending').length}</Badge>
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {filteredOrders
                      .filter(o => o.status === 'pending')
                      .sort((a, b) => orderSortOrder === 'fifo' 
                        ? new Date(a.created_at) - new Date(b.created_at) 
                        : new Date(b.created_at) - new Date(a.created_at))
                      .map((o, idx) => (
                        <OrderCard key={o.id} order={o} onUpdate={handleStatusUpdate} onPrint={() => setReceiptOrderId(o.id)} delay={idx * 0.05} />
                      ))}
                    {filteredOrders.filter(o => o.status === 'pending').length === 0 && (
                      <div className="p-8 text-center text-muted-foreground/50 border border-dashed rounded-[2rem] text-sm italic bg-secondary/10">Queue empty</div>
                    )}
                  </div>
                </div>

                {/* 2. In Progress Column */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="font-display text-xl font-bold flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      Kitchen
                      <Badge variant="secondary" className="ml-2 font-mono">{filteredOrders.filter(o => ['preparing', 'ready'].includes(o.status)).length}</Badge>
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {filteredOrders
                      .filter(o => ['preparing', 'ready'].includes(o.status))
                      .sort((a, b) => orderSortOrder === 'fifo' 
                        ? new Date(a.created_at) - new Date(b.created_at) 
                        : new Date(b.created_at) - new Date(a.created_at))
                      .map((o, idx) => (
                        <OrderCard key={o.id} order={o} onUpdate={handleStatusUpdate} onPrint={() => setReceiptOrderId(o.id)} delay={idx * 0.05} />
                      ))}
                    {filteredOrders.filter(o => ['preparing', 'ready'].includes(o.status)).length === 0 && (
                      <div className="p-8 text-center text-muted-foreground/50 border border-dashed rounded-[2rem] text-sm italic bg-secondary/10">Kitchen clear</div>
                    )}
                  </div>
                </div>

                {/* 3. Recent History Column */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="font-display text-xl font-bold flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      Completed
                      <Badge variant="secondary" className="ml-2 font-mono">{filteredOrders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length}</Badge>
                    </h4>
                  </div>
                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredOrders
                      .filter(o => ['delivered', 'cancelled'].includes(o.status))
                      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // History always LIFO
                      .slice(0, 20)
                      .map((o, idx) => (
                        <OrderCard key={o.id} order={o} onUpdate={handleStatusUpdate} onPrint={() => setReceiptOrderId(o.id)} delay={idx * 0.05} isHistory />
                      ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* MENU TAB - Item Grid */}
          <TabsContent value="menu" className="mt-0 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMenuItems.map((item, idx) => (
                <Card 
                  key={item.id} 
                  className={`group border-border/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-up ${!item.is_available ? 'opacity-70 grayscale-[0.5]' : ''}`}
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div className="relative h-44 w-full bg-muted overflow-hidden">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">{CATEGORY_ICONS[item.category] || "🍽️"}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="flex gap-2 w-full">
                        <Button size="sm" variant="secondary" className="flex-1 bg-white/90 text-black border-none" onClick={() => { setEditingItem(item); setIsItemEditorOpen(true); }}>
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" className="px-3" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white border-none text-[10px] uppercase font-black">
                      {item.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="font-display font-bold text-lg leading-tight truncate">{item.name}</h3>
                      <span className="font-display text-lg text-gold font-bold">${Number(item.price).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] mb-4">{item.description || "No description provided."}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${item.is_available ? 'bg-emerald-500' : 'bg-destructive'}`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {item.is_available ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className={`h-8 w-8 p-0 rounded-full ${item.is_available ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10' : 'text-primary hover:bg-primary/10'}`}
                        onClick={() => handleToggleAvailable(item)}
                        title={item.is_available ? "Hide from menu" : "Make available"}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* CUSTOMERS TAB */}
          <TabsContent value="customers" className="mt-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allUsers
                .filter(u => 
                  u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                  u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                )
                .map((u, idx) => (
                <Card 
                  key={u.id} 
                  className="group rounded-3xl border-border/40 bg-card hover:shadow-xl transition-all duration-500 animate-fade-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-secondary/30 flex items-center justify-center text-primary border border-border/40">
                        <User className="h-8 w-8" />
                      </div>
                      <Badge className={`${u.role === 'admin' ? 'bg-gold text-white' : 'bg-primary/10 text-primary'} border-none text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full`}>
                        {u.role}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 mb-6">
                      <h3 className="font-display text-2xl font-bold truncate">{u.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 opacity-40" />
                        {u.email}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border/40 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      <span>Customer ID</span>
                      <span className="font-mono text-primary/60">#{u.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {allUsers.length === 0 && (
                <div className="col-span-full py-20 text-center bg-secondary/10 rounded-[3rem] border border-dashed border-border/40">
                  <Users className="h-16 w-16 text-muted-foreground/10 mx-auto mb-6" />
                  <p className="text-muted-foreground font-medium">No customers registered yet.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ANALYTICS TAB - Charts */}
          <TabsContent value="analytics" className="mt-0 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Revenue Chart */}
              <Card className="border-border/40 shadow-sm overflow-hidden">
                <CardHeader className="bg-secondary/20 pb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-display text-xl">Revenue Trends</CardTitle>
                      <CardDescription>Daily revenue performance for the past 7 days.</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDownloadReport}
                        className="bg-card hover:bg-secondary border-border/60 rounded-xl gap-2 font-bold text-[10px] uppercase tracking-widest"
                      >
                        <Download className="h-4 w-4 text-emerald-500" />
                        Download Report
                      </Button>
                      <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-xl">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 h-[350px]">
                  {analytics ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.dailyChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${v}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />}
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card className="border-border/40 shadow-sm overflow-hidden">
                <CardHeader className="bg-secondary/20 pb-8">
                  <CardTitle className="font-display text-xl">Order Volume</CardTitle>
                  <CardDescription>Distribution of order statuses this week.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 h-[350px]">
                  {analytics ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Pending',   val: analytics.statusCounts.pending,   color: '#f59e0b' },
                        { name: 'Preparing', val: analytics.statusCounts.preparing, color: '#3b82f6' },
                        { name: 'Ready',     val: analytics.statusCounts.ready,     color: '#6366f1' },
                        { name: 'Delivered', val: analytics.statusCounts.delivered, color: '#10b981' },
                        { name: 'Cancelled', val: analytics.statusCounts.cancelled, color: '#ef4444' },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                        <Bar dataKey="val" name="Orders" radius={[6, 6, 0, 0]} barSize={40}>
                          { [1,2,3,4,5].map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#f59e0b','#3b82f6','#6366f1','#10b981','#ef4444'][index]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />}
                </CardContent>
              </Card>

              {/* Top Items Table */}
              <Card className="border-border/40 shadow-sm lg:col-span-2">
                <CardHeader className="pb-4">
                  <CardTitle className="font-display text-xl">Bestsellers This Week</CardTitle>
                  <CardDescription>Items that generated the most interest and revenue.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary/30 border-y border-border/40">
                          <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Dish</th>
                          <th className="text-center px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Qty Sold</th>
                          <th className="text-right px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Revenue</th>
                          <th className="text-right px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Performance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {analytics?.topItems.map((item, i) => (
                          <tr key={i} className="hover:bg-secondary/10 transition-colors">
                            <td className="px-6 py-4 font-medium flex items-center gap-3">
                              <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-bold">{i+1}</span>
                              {item.name}
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-bold">{item.qty}</td>
                            <td className="px-6 py-4 text-right font-mono text-gold font-bold">${item.revenue.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="w-full max-w-[100px] ml-auto h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${(item.qty / (analytics.topItems[0]?.qty || 1)) * 100}%` }} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AdminReceiptModal 
        orderId={receiptOrderId} 
        open={!!receiptOrderId} 
        onClose={() => setReceiptOrderId(null)} 
      />
      
      <MenuItemEditor 
        item={editingItem} 
        open={isItemEditorOpen} 
        onClose={() => { setIsItemEditorOpen(false); setEditingItem(null); }}
        onSaved={loadData}
      />
    </Layout>
  );
};

// Helper component for Order Cards
const OrderCard = ({ order, onUpdate, onPrint, delay = 0, isHistory = false }) => {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <Card 
      className={`relative border-border/40 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 animate-fade-up ${order.status === 'pending' ? 'ring-2 ring-amber-500/10 ring-offset-0' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Background glow for pending orders */}
      {order.status === 'pending' && <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />}
      
      <div className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-muted-foreground/40 font-mono tracking-tighter">#{order.id.slice(-8).toUpperCase()}</span>
              <Badge variant="outline" className={`px-1.5 py-0 text-[9px] uppercase font-black tracking-widest ${cfg.color}`}>
                {order.status}
              </Badge>
            </div>
            <h5 className="font-display font-bold text-base leading-none">{order.customer_name}</h5>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={onPrint}>
            <Printer className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1.5 mb-5 border-y border-border/40 py-4 my-4">
          {order.order_items?.map((it, idx) => (
            <div key={idx} className="flex justify-between text-xs font-medium">
              <span className="text-foreground/80"><span className="text-primary/60 font-bold mr-1">{it.quantity}×</span> {it.name}</span>
              <span className="text-muted-foreground font-mono">${(Number(it.price) * it.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Paid</span>
            <span className="text-base font-display font-black text-gold">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {order.address && (
          <div className="flex items-start gap-2 mb-4 text-xs text-muted-foreground bg-secondary/30 p-2 rounded-lg">
            <Package className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="line-clamp-1">{order.address}</span>
          </div>
        )}

        {!isHistory && (
          <div className="flex gap-2">
            {order.status === 'pending' && (
              <>
                <Button size="sm" className="flex-1 h-9 bg-primary" onClick={() => onUpdate(order.id, 'preparing')}>
                  Accept
                </Button>
                <Button size="sm" variant="ghost" className="h-9 text-destructive hover:bg-destructive/5" onClick={() => onUpdate(order.id, 'cancelled')}>
                  Reject
                </Button>
              </>
            )}
            {order.status === 'preparing' && (
              <Button size="sm" className="flex-1 h-9 bg-indigo-500 hover:bg-indigo-600" onClick={() => onUpdate(order.id, 'ready')}>
                Mark Ready
              </Button>
            )}
            {order.status === 'ready' && (
              <Button size="sm" className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600" onClick={() => onUpdate(order.id, 'delivered')}>
                Complete
              </Button>
            )}
          </div>
        )}

        {isHistory && (
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            <span>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <div className="flex items-center gap-1">
              <Icon className="h-3 w-3" />
              {order.status}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Admin;
