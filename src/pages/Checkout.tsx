import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const schema = z.object({
  address: z.string().trim().min(5, "Address must be at least 5 characters").max(300),
  notes: z.string().trim().max(500).optional(),
});

const Checkout = () => {
  const { items, totalPrice, clear } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = "Checkout · Osteria Bella"; }, []);
  useEffect(() => {
    if (!loading && !user) navigate("/auth");
    if (items.length === 0 && !submitting) navigate("/cart");
  }, [user, loading, items.length, navigate, submitting]);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse({ address, notes });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total: totalPrice,
          address: parsed.data.address,
          notes: parsed.data.notes || null,
          status: "pending",
        })
        .select()
        .single();
      if (error || !order) throw error;

      const orderItems = items.map((i) => ({
        order_id: order.id,
        menu_item_id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      clear();
      toast.success("Order placed! Buon appetito 🍝");
      navigate("/orders");
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't place order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <h1 className="font-display text-4xl mb-8">Checkout</h1>
        <div className="grid gap-6">
          <Card className="p-6 bg-card border-border/60">
            <h2 className="font-display text-xl mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between">
                  <span className="text-foreground/80">{i.name} × {i.quantity}</span>
                  <span className="text-gold font-medium">${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border/60 pt-3 mt-3 flex justify-between font-display text-lg">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border/60">
            <form onSubmit={placeOrder} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="address">Delivery address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required maxLength={300} placeholder="Street, city, postcode" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Allergies, instructions…" />
              </div>
              <Button type="submit" className="w-full bg-gradient-warm text-primary-foreground shadow-warm" size="lg" disabled={submitting}>
                {submitting ? "Placing order…" : `Place Order · $${totalPrice.toFixed(2)}`}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
