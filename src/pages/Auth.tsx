import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Satellite, Mail, Lock, User, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      
      if (error) {
        toast({
          title: "Google sign-in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      
      if (error) {
        toast({
          title: "Apple sign-in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAppleLoading(false);
    }
  };

  useEffect(() => {
    setIsSignUp(searchParams.get("mode") === "signup");
  }, [searchParams]);

  // Check if user is already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: formData.name },
          },
        });

        if (error) {
          toast({
            title: error.message.includes("already registered") ? "Account exists" : "Sign up failed",
            description: error.message.includes("already registered") 
              ? "This email is already registered. Please sign in instead."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "Account created!", description: "You have been signed in successfully." });
          navigate("/dashboard");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!", description: "You have been signed in successfully." });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      {/* Background effects */}
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      
      {/* Animated orbit rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none">
        <div className="absolute inset-0 orbit-ring opacity-20" style={{ animationDuration: "20s" }} />
        <div className="absolute inset-[100px] orbit-ring opacity-30" style={{ animationDuration: "15s" }} />
        <div className="absolute inset-[200px] orbit-ring opacity-40" style={{ animationDuration: "10s" }} />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        <Card variant="glass" className="border-primary/20">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Satellite className="w-12 h-12 text-primary" />
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
              </div>
            </div>
            <CardTitle className="text-2xl font-display">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Join Intercept66 and start tracking satellites" 
                : "Sign in to access your mission control"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Social Sign-In Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-background hover:bg-secondary text-foreground border-border"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading || isAppleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                )}
                Continue with Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-background hover:bg-secondary text-foreground border-border"
                onClick={handleAppleSignIn}
                disabled={isLoading || isGoogleLoading || isAppleLoading}
              >
                {isAppleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                )}
                Continue with Apple
              </Button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className="pl-10 bg-secondary/50"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 bg-secondary/50"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-secondary/50"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {!isSignUp && (
                  <div className="text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                )}
              </div>
              <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </>
                ) : (
                  isSignUp ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
                disabled={isLoading}
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Feature callout */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Track <span className="text-primary font-mono">23,000+</span> debris objects in real-time
          </p>
        </div>
      </div>
    </div>
  );
}
