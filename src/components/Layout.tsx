import { ReactNode } from "react";
import { Header } from "./Header";

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1">{children}</main>
    <footer className="border-t border-border/60 mt-16 py-8 bg-secondary/40">
      <div className="container text-center text-sm text-muted-foreground">
        <p className="font-display text-base text-foreground">Osteria Bella</p>
        <p className="mt-1">Wood-fired Italian, served with love · Open 12—23 daily</p>
      </div>
    </footer>
  </div>
);
