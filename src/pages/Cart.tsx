import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, setQty, remove, totalPrice, totalCount } = useCart();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container max-w-3xl py-12">
        <h1 className="font-display text-4xl mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border/60">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-6">Your cart is empty</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-warm text-primary-foreground">
              Browse the Menu
            </Button>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {items.map((i) => (
                <Card key={i.id} className="p-4 flex items-center gap-4 bg-card border-border/60 shadow-card animate-fade-up">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-lg truncate">{i.name}</h3>
                    <p className="text-sm text-gold">${i.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setQty(i.id, i.quantity - 1)} aria-label={`Decrease ${i.name}`}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-7 text-center font-medium text-sm" aria-live="polite">{i.quantity}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setQty(i.id, i.quantity + 1)} aria-label={`Increase ${i.name}`}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right w-20 font-display text-lg">${(i.price * i.quantity).toFixed(2)}</div>
                  <Button size="icon" variant="ghost" onClick={() => remove(i.id)} aria-label={`Remove ${i.name}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Card>
              ))}
            </div>

            <Card className="mt-6 p-6 bg-secondary/50 border-border/60">
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">Subtotal ({totalCount} items)</span>
                <span className="font-display text-2xl">${totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-gradient-warm text-primary-foreground shadow-warm" size="lg" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </Button>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
