import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getReceipt } from "@/lib/api";
import { toast } from "sonner";
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  XCircle,
  Loader2,
  UtensilsCrossed,
} from "lucide-react";

const statusConfig = {
  delivered: { label: "DELIVERED", color: "text-green-500", icon: CheckCircle2 },
  cancelled: { label: "CANCELLED", color: "text-destructive", icon: XCircle },
  pending:   { label: "PENDING",   color: "text-amber-500",  icon: null },
  preparing: { label: "PREPARING", color: "text-blue-500",   icon: null },
  ready:     { label: "READY",     color: "text-primary",    icon: null },
};

export function AdminReceiptModal({ orderId, open, onClose }) {
  const [receipt, setReceipt] = useState(null);
  const [fetching, setFetching] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    if (!open || !orderId) return;
    setReceipt(null);
    setFetching(true);
    getReceipt(orderId)
      .then(({ receipt: r }) => setReceipt(r))
      .catch((err) => toast.error(err.message || "Failed to load receipt"))
      .finally(() => setFetching(false));
  }, [open, orderId]);

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const printContent = receiptRef.current.innerHTML;
    const win = window.open("", "_blank", "width=420,height=700");
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt — ${receipt?.receiptNumber}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Courier New', Courier, monospace; font-size: 13px; background: #fff; color: #000; padding: 16px; }
            .receipt-header { text-align: center; padding-bottom: 12px; border-bottom: 2px dashed #999; margin-bottom: 12px; }
            .restaurant-name { font-size: 22px; font-weight: 900; letter-spacing: 2px; }
            .receipt-table { width: 100%; border-collapse: collapse; }
            .receipt-table td { padding: 3px 0; vertical-align: top; }
            .divider { border: none; border-top: 1px dashed #999; margin: 10px 0; }
            .total-row { font-size: 15px; font-weight: 700; }
            .status-stamp { text-align: center; font-size: 20px; font-weight: 900; letter-spacing: 4px; border: 3px solid currentColor; padding: 6px 12px; display: inline-block; margin-top: 14px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .text-muted { color: #666; }
            .mt-1 { margin-top: 4px; }
            .mt-2 { margin-top: 8px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  const handleDownloadPDF = async () => {
    if (!receipt) return;
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: [80, 220] });
      const lm = 5, rm = 75, y = (ref) => { ref.val += 0; return ref.val; };
      let cy = 8;

      doc.setFont("Courier", "bold");
      doc.setFontSize(14);
      doc.text(receipt.restaurantName, 40, cy, { align: "center" });
      cy += 6;
      doc.setFontSize(8);
      doc.setFont("Courier", "normal");
      doc.text(receipt.restaurantAddress, 40, cy, { align: "center" });
      cy += 4;
      doc.text(receipt.restaurantPhone, 40, cy, { align: "center" });
      cy += 6;

      doc.setLineDashPattern([1, 1], 0);
      doc.line(lm, cy, rm, cy);
      cy += 4;

      doc.setFont("Courier", "bold");
      doc.text(`Receipt: ${receipt.receiptNumber}`, lm, cy);
      cy += 4;
      doc.setFont("Courier", "normal");
      doc.text(`Order: #${receipt.orderId.slice(0, 8).toUpperCase()}`, lm, cy);
      cy += 4;
      doc.text(`Date: ${new Date(receipt.placedAt).toLocaleString()}`, lm, cy);
      cy += 4;
      doc.text(`Customer: ${receipt.customer.name}`, lm, cy);
      cy += 4;
      if (receipt.customer.deliveryAddress !== "Dine-in") {
        const wrapped = doc.splitTextToSize(`Addr: ${receipt.customer.deliveryAddress}`, 68);
        doc.text(wrapped, lm, cy);
        cy += wrapped.length * 4;
      }
      cy += 2;

      doc.line(lm, cy, rm, cy);
      cy += 4;
      doc.setFont("Courier", "bold");
      doc.text("Item", lm, cy);
      doc.text("Qty", 52, cy, { align: "right" });
      doc.text("Total", rm, cy, { align: "right" });
      cy += 2;
      doc.line(lm, cy, rm, cy);
      cy += 4;

      doc.setFont("Courier", "normal");
      receipt.items.forEach((item) => {
        const name = doc.splitTextToSize(item.name, 44);
        doc.text(name, lm, cy);
        doc.text(String(item.quantity), 52, cy, { align: "right" });
        doc.text(`$${item.lineTotal.toFixed(2)}`, rm, cy, { align: "right" });
        cy += name.length * 4 + 1;
      });

      cy += 1;
      doc.line(lm, cy, rm, cy);
      cy += 4;
      doc.text("Subtotal:", lm, cy); doc.text(`$${receipt.subtotal.toFixed(2)}`, rm, cy, { align: "right" }); cy += 4;
      doc.text("Tax (8%):", lm, cy); doc.text(`$${receipt.tax.toFixed(2)}`, rm, cy, { align: "right" }); cy += 4;
      doc.setFont("Courier", "bold");
      doc.text("TOTAL:", lm, cy); doc.text(`$${receipt.total.toFixed(2)}`, rm, cy, { align: "right" }); cy += 6;

      doc.setFont("Courier", "bold");
      doc.setFontSize(11);
      doc.text((statusConfig[receipt.status]?.label || receipt.status).toUpperCase(), 40, cy, { align: "center" });
      cy += 6;

      doc.setFont("Courier", "normal");
      doc.setFontSize(8);
      doc.text("Thank you for dining with us!", 40, cy, { align: "center" });
      cy += 4;
      doc.text(receipt.restaurantEmail, 40, cy, { align: "center" });

      doc.save(`receipt-${receipt.receiptNumber}.pdf`);
      toast.success("Receipt downloaded as PDF");
    } catch (err) {
      toast.error("Could not generate PDF: " + err.message);
    }
  };

  const cfg = receipt ? (statusConfig[receipt.status] ?? statusConfig.pending) : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-0 gap-0 overflow-hidden border-border/60 bg-card">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-secondary/30">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            <span className="font-display text-lg">Receipt Preview</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[65vh] overflow-y-auto">
          {fetching && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-muted-foreground text-sm">Loading receipt…</p>
            </div>
          )}

          {!fetching && !receipt && (
            <p className="text-center text-muted-foreground py-12">Receipt not found.</p>
          )}

          {receipt && (
            <div
              ref={receiptRef}
              className="font-mono text-sm bg-background rounded-xl border border-border/40 p-5 shadow-inner"
            >
              {/* Restaurant header */}
              <div className="text-center receipt-header pb-3 border-b border-dashed border-border/60 mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <span className="restaurant-name text-xl font-black tracking-widest text-foreground">
                    {receipt.restaurantName.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{receipt.restaurantAddress}</p>
                <p className="text-xs text-muted-foreground">{receipt.restaurantPhone}</p>
                <p className="text-xs text-muted-foreground">{receipt.restaurantEmail}</p>
              </div>

              {/* Order info */}
              <div className="space-y-0.5 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt</span>
                  <span className="font-semibold">{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span>#{receipt.orderId.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(receipt.placedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{receipt.customer.name}</span>
                </div>
                {receipt.customer.deliveryAddress !== "Dine-in" && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">Address</span>
                    <span className="text-right text-xs">{receipt.customer.deliveryAddress}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-border/60 my-3" />

              {/* Items header */}
              <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1.5">
                <span>ITEM</span>
                <div className="flex gap-6">
                  <span>QTY</span>
                  <span className="w-16 text-right">TOTAL</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-1.5 mb-3">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="flex-1 mr-2">{item.name}</span>
                    <div className="flex gap-6 shrink-0">
                      <span className="text-center">×{item.quantity}</span>
                      <span className="w-16 text-right">${item.lineTotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-border/60 my-3" />

              {/* Totals */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${receipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (8%)</span>
                  <span>${receipt.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-base mt-1 text-foreground">
                  <span>TOTAL</span>
                  <span className="text-primary">${receipt.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              {receipt.notes && (
                <p className="mt-3 text-xs text-muted-foreground border-t border-dashed border-border/60 pt-3">
                  📝 {receipt.notes}
                </p>
              )}

              {/* Status stamp */}
              <div className="flex justify-center mt-4">
                <span
                  className={`inline-block border-2 px-4 py-1.5 text-sm font-black tracking-[0.3em] rotate-[-3deg] ${cfg.color}`}
                  style={{ borderColor: "currentColor" }}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Footer */}
              <div className="border-t border-dashed border-border/60 mt-4 pt-3 text-center text-xs text-muted-foreground">
                <p>Thank you for dining with us! 🍕</p>
                <p className="mt-0.5">Printed: {new Date(receipt.printedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {receipt && (
          <div className="flex gap-3 px-5 py-4 border-t border-border/60 bg-secondary/20">
            <Button
              onClick={handlePrint}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              id="receipt-print-btn"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex-1 border-border/60 hover:border-primary/60 gap-2"
              id="receipt-pdf-btn"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
