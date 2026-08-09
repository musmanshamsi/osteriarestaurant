import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, ChefHat, MessageSquare, Plus, X } from "lucide-react";
import { getItemReviews } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export function ItemDetailsModal({ item, open, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { add } = useCart();

  useEffect(() => {
    if (open && item?.id) {
      loadReviews();
    }
  }, [open, item]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { reviews: data } = await getItemReviews(item.id);
      setReviews(data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-border/40 bg-card rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row h-full max-h-[85vh] overflow-y-auto lg:overflow-hidden">
          {/* Left: Image & Quick Stats */}
          <div className="lg:w-1/2 relative h-52 lg:h-auto">
            <img 
              src={item.image_url || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80"} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <Badge className="bg-primary text-primary-foreground mb-2.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md border-none">
                {item.category}
              </Badge>
              <h2 className="font-display text-2xl font-bold text-white leading-tight mb-1.5">
                {item.name}
              </h2>
              <div className="flex items-center gap-3 text-white/80">
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span>{item.rating?.toFixed(1) || "4.8"}</span>
                  <span className="opacity-60 font-normal">({item.reviewCount || "0"} reviews)</span>
                </div>
                <div className="h-3 w-[1px] bg-white/20" />
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <Clock className="h-3.5 w-3.5" />
                  <span>15-20m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Content & Reviews */}
          <div className="lg:w-1/2 flex flex-col p-6 lg:p-7 overflow-y-auto custom-scrollbar bg-gradient-to-b from-card to-secondary/5">
            <div className="mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Description</h3>
              <p className="text-muted-foreground leading-relaxed text-sm italic font-normal">
                "{item.description || "Our signature creation crafted with traditional Italian passion and premium seasonal ingredients."}"
              </p>
            </div>

            <div className="flex-1 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary block">Customer Reviews</h3>
                {reviews.length > 0 && <span className="text-[10px] font-medium text-muted-foreground/60 uppercase">{reviews.length} Reviews</span>}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-secondary/20 animate-pulse" />)}
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-6 text-center bg-secondary/10 rounded-xl border border-dashed border-border/40">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r, idx) => (
                    <div key={r.id} className="animate-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-semibold">{r.user_name}</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-gold text-gold" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-3 border-l-2 border-primary/20">
                        {r.comment}
                      </p>
                      <span className="text-[9px] text-muted-foreground/40 mt-1 block font-medium">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-0.5 block">Price</span>
                <span className="text-2xl font-display font-bold text-gold">${Number(item.price).toFixed(2)}</span>
              </div>
              <Button 
                onClick={() => {
                  add({ ...item, quantity: 1 });
                  toast.success(`Added ${item.name} to cart!`);
                  onClose();
                }}
                className="h-11 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-2 font-semibold text-sm transition-transform active:scale-95"
              >
                <Plus className="h-4 w-4" /> Add to Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
