import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Send, Loader2 } from "lucide-react";
import { submitReview } from "@/lib/api";
import { toast } from "sonner";

export function ReviewModal({ items, userName, open, onClose, onSubmitted }) {
  const [selectedItem, setSelectedItem] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync selected item when modal opens or items change
  useEffect(() => {
    if (open && items?.length > 0) {
      setSelectedItem(items[0].id);
    }
  }, [open, items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    setSubmitting(true);
    try {
      await submitReview({
        itemId: selectedItem,
        userName: userName || "Valued Guest",
        rating,
        comment,
      });
      toast.success("Thank you for your feedback! 🍝");
      onSubmitted?.();
      onClose();
      setComment("");
      setRating(5);
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border/40 bg-card rounded-3xl">
        <div className="h-2 w-full bg-gradient-to-r from-gold via-primary to-gold" />
        
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="font-display text-3xl font-bold tracking-tight">
            Share Your Experience
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            How was your meal? Your feedback helps us and other foodies!
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
          {/* Item Selector if multiple */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Select Dish to Rate</Label>
            <div className="grid grid-cols-2 gap-2">
              {items?.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item.id)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    selectedItem === item.id
                      ? "bg-primary/5 border-primary shadow-lg shadow-primary/5"
                      : "bg-secondary/20 border-transparent hover:border-primary/20"
                  }`}
                >
                  <p className="text-xs font-bold truncate">{item.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Your Rating</Label>
            <div className="flex justify-center gap-3 py-4 bg-secondary/10 rounded-3xl border border-border/20">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="transition-transform active:scale-90 hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      s <= rating ? "fill-gold text-gold" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Your Comments</Label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="The flavors were incredible! Highly recommended..."
                className="pl-12 min-h-[100px] bg-secondary/20 border-transparent rounded-2xl focus:bg-card focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none"
                maxLength={300}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={submitting || !selectedItem}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 gap-2 font-bold"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4" /> Post Review</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
