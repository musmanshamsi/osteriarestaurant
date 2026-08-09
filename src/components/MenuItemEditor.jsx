import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMenuItem, updateMenuItem } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, ImageIcon, Save, Plus } from "lucide-react";

const CATEGORIES = [
  { value: "starter",  label: "🥗 Starter" },
  { value: "pizza",    label: "🍕 Pizza" },
  { value: "pasta",    label: "🍝 Pasta" },
  { value: "main",     label: "🍖 Main" },
  { value: "dessert",  label: "🍮 Dessert" },
  { value: "drink",    label: "🥤 Drink" },
];

const itemSchema = z.object({
  name:        z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(500).optional(),
  price:       z.number({ invalid_type_error: "Price must be a number" }).min(0, "Price must be ≥ 0"),
  category:    z.enum(["starter","pizza","pasta","main","dessert","drink"]),
  image_url:   z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  is_available: z.boolean(),
});

/**
 * MenuItemEditor — Create or Edit a menu item.
 * Props:
 *   item       — existing item object (edit mode) or null (create mode)
 *   open       — boolean
 *   onClose()  — called when modal closes
 *   onSaved(updatedItem) — called after successful save
 */
export function MenuItemEditor({ item, open, onClose, onSaved }) {
  const isEdit = Boolean(item);

  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [price,       setPrice]       = useState("");
  const [category,    setCategory]    = useState("pizza");
  const [imageUrl,    setImageUrl]    = useState("");
  const [available,   setAvailable]   = useState(true);
  const [imgError,    setImgError]    = useState(false);
  const [saving,      setSaving]      = useState(false);

  // Populate fields when editing
  useEffect(() => {
    if (item) {
      setName(item.name ?? "");
      setDescription(item.description ?? "");
      setPrice(String(item.price ?? ""));
      setCategory(item.category ?? "pizza");
      setImageUrl(item.image_url ?? "");
      setAvailable(item.is_available ?? true);
      setImgError(false);
    } else {
      setName(""); setDescription(""); setPrice(""); setCategory("pizza");
      setImageUrl(""); setAvailable(true); setImgError(false);
    }
  }, [item, open]);

  const handleSave = async (e) => {
    e.preventDefault();
    const parsed = itemSchema.safeParse({
      name,
      description: description || undefined,
      price: parseFloat(price),
      category,
      image_url: imageUrl || undefined,
      is_available: available,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      let result;
      if (isEdit) {
        result = await updateMenuItem(item.id, {
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          price: parsed.data.price,
          category: parsed.data.category,
          image_url: parsed.data.image_url ?? null,
          is_available: parsed.data.is_available,
        });
        toast.success(`✅ "${parsed.data.name}" updated`);
      } else {
        result = await createMenuItem({
          name: parsed.data.name,
          description: parsed.data.description ?? null,
          price: parsed.data.price,
          category: parsed.data.category,
          image_url: parsed.data.image_url ?? null,
        });
        toast.success(`🎉 "${parsed.data.name}" added to menu`);
      }
      onSaved?.(result.item);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  const catLabel = CATEGORIES.find((c) => c.value === category)?.label ?? category;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg gap-0 p-0 overflow-hidden border-border/60 bg-card">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-gold to-primary" />

        <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/40">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            {isEdit ? (
              <><Save className="h-5 w-5 text-primary" /> Edit Item</>
            ) : (
              <><Plus className="h-5 w-5 text-primary" /> Add New Item</>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
            {/* Image preview */}
            <div className="relative rounded-xl overflow-hidden bg-muted/40 border border-border/40 h-36 flex items-center justify-center">
              {imageUrl && !imgError ? (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Image preview</span>
                </div>
              )}
              {imageUrl && !imgError && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur">
                    {catLabel}
                  </Badge>
                </div>
              )}
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="image-url" className="text-sm">Image URL <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImgError(false); }}
                placeholder="https://example.com/dish.jpg"
                className="bg-background border-border/60 text-sm"
              />
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="item-name" className="text-sm">Dish Name <span className="text-destructive">*</span></Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Margherita Pizza"
                required
                maxLength={100}
                className="bg-background border-border/60"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="item-desc" className="text-sm">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="item-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the dish — ingredients, taste, prep style…"
                maxLength={500}
                rows={2}
                className="bg-background border-border/60 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
            </div>

            {/* Price + Category (side by side) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="item-price" className="text-sm">Price ($) <span className="text-destructive">*</span></Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className="bg-background border-border/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="item-cat" className="text-sm">Category <span className="text-destructive">*</span></Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="item-cat" className="bg-background border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability toggle */}
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Available on menu</p>
                <p className="text-xs text-muted-foreground">
                  {available ? "Visible to customers" : "Hidden from customers"}
                </p>
              </div>
              <Switch
                id="item-available"
                checked={available}
                onCheckedChange={setAvailable}
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border/40 bg-secondary/10 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-border/60"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 min-w-[120px]"
              disabled={saving}
              id="menu-item-save-btn"
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
              ) : isEdit ? (
                <><Save className="h-4 w-4" /> Save Changes</>
              ) : (
                <><Plus className="h-4 w-4" /> Add to Menu</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
