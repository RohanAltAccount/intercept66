import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Satellite, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      
      {/* Animated rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 orbit-ring opacity-10" />
        <div className="absolute inset-[80px] orbit-ring opacity-20" />
        <div className="absolute inset-[160px] orbit-ring opacity-30" />
      </div>
      
      <div className="text-center relative z-10 px-4">
        <div className="flex justify-center mb-6">
          <div className="relative animate-float">
            <Satellite className="w-20 h-20 text-primary opacity-50" />
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
          </div>
        </div>
        
        <h1 className="text-8xl md:text-9xl font-display font-bold text-primary text-glow mb-4">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-display font-semibold mb-4">
          Lost in Space
        </h2>
        
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The orbital coordinates you're looking for don't exist in our tracking system. 
          Let's get you back to mission control.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button variant="hero" size="lg">
              <Home className="w-4 h-4 mr-2" />
              Return to Base
            </Button>
          </Link>
          <Button variant="glass" size="lg" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
        
        <p className="mt-8 text-xs text-muted-foreground font-mono">
          Path attempted: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
