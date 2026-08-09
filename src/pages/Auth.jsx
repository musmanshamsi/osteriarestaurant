import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  UtensilsCrossed,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User,
} from "lucide-react";

const signInSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(72),
});
const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
});

// Emails that hint at admin — purely cosmetic UX
const ADMIN_EMAIL_HINTS = ["admin", "manager", "staff", "kitchen"];
const looksLikeAdmin = (email) =>
  ADMIN_EMAIL_HINTS.some((h) => email.toLowerCase().includes(h));

const Auth = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signIn, signUp } = useAuth();
  const [mode, setMode]           = useState("signin");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [fullName, setFullName]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminHint, setAdminHint] = useState(false);

  // Page title
  useEffect(() => {
    document.title = mode === "signin"
      ? "Sign In · Osteria Bella"
      : "Create Account · Osteria Bella";
  }, [mode]);

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? "/admin" : "/");
    }
  }, [user, isAdmin, loading, navigate]);

  // Detect admin email hint
  useEffect(() => {
    setAdminHint(email.length > 4 && looksLikeAdmin(email));
  }, [email]);

  const handle = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const parsed = signUpSchema.safeParse({ email, password, fullName });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        await signUp(parsed.data.email, parsed.data.password, parsed.data.fullName);
        toast.success("🎉 Welcome! Your account is ready.");
        navigate("/");
      } else {
        const parsed = signInSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          return;
        }
        await signIn(parsed.data.email, parsed.data.password);
        toast.success("Welcome back! 👋");
      }
    } catch (err) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-gold/5 blur-3xl" />
        </div>

        <div className="relative w-full max-w-sm sm:max-w-md animate-fade-up">
          {/* Card */}
          <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-sm shadow-xl overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary via-gold to-primary" />

            <div className="p-6 sm:p-7">
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <UtensilsCrossed className="h-6 w-6 text-primary" />
                  </div>
                  {adminHint && (
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gold flex items-center justify-center shadow-md">
                      <ShieldCheck className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                <h1 className="font-display text-2xl font-bold tracking-tight">
                  {mode === "signin" ? "Welcome Back" : "Join Osteria Bella"}
                </h1>
                <p className="text-muted-foreground text-xs mt-1">
                  {adminHint
                    ? "Admin portal — secure sign in"
                    : mode === "signin"
                    ? "Sign in to place your order"
                    : "Create an account to start ordering"}
                </p>

                {/* Admin hint badge */}
                {adminHint && (
                  <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-[11px] font-medium">
                    <ShieldCheck className="h-3 w-3" />
                    Admin Portal Detected
                  </div>
                )}
              </div>

              {/* Mode toggle pills */}
              <div className="flex rounded-lg bg-muted/60 p-1 mb-5">
                {["signin", "signup"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                      mode === m
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "signin" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              {/* Demo Credentials Helper */}
              {mode === "signin" && (
                <div className="mb-5 p-3 rounded-lg border border-border/50 bg-muted/20 text-center animate-fade-up">
                  <span className="block text-[10px] font-bold tracking-wider uppercase text-muted-foreground/80 mb-2">
                    Demo Accounts (Click to Autofill)
                  </span>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("admin@osteria.com");
                        setPassword("ChefMarco_Osteria2026!");
                        toast.success("🔑 Admin credentials loaded!");
                      }}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 active:scale-95 transition-all duration-200 flex items-center gap-1"
                    >
                      <span>Chef Marco</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-primary/20 text-primary uppercase font-bold">Admin</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("customer@osteria.com");
                        setPassword("SofiaEsposito_Osteria2026!");
                        toast.success("👋 Customer credentials loaded!");
                      }}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 active:scale-95 transition-all duration-200 flex items-center gap-1"
                    >
                      <span>Sofia Esposito</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-gold/20 text-gold uppercase font-bold">Customer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handle} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5 animate-fade-up">
                    <Label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        maxLength={100}
                        autoComplete="name"
                        placeholder="John Doe"
                        className="pl-10 bg-background border-border/60 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-background border-border/60 focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      minLength={6}
                      placeholder="••••••••"
                      className="pl-10 pr-10 bg-background border-border/60 focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md hover:shadow-lg hover:opacity-95 transition-all duration-200 font-medium mt-2"
                  disabled={submitting}
                  id="auth-submit-btn"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Please wait…
                    </>
                  ) : (
                    <>
                      {mode === "signin" ? "Sign In" : "Create Account"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer */}
              <p className="text-center text-xs text-muted-foreground mt-6">
                By continuing you agree to our{" "}
                <span className="text-primary cursor-pointer hover:underline">Terms</span>{" "}
                &amp;{" "}
                <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
              </p>
              <p className="text-center text-xs text-muted-foreground mt-3">
                <Link to="/" className="hover:text-primary hover:underline transition-colors">
                  ← Back to the menu
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
