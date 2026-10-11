import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [lockCountdown, setLockCountdown] = useState<number>(0);

  const [lockedBannerMessage, setLockedBannerMessage] = useState<string | null>(() => {
    return localStorage.getItem('bankism_lock_banner');
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const lockedUntil = localStorage.getItem('bankism_locked_until');
    if (lockedUntil) {
      const remaining = Math.ceil((parseInt(lockedUntil, 10) - Date.now()) / 1000);
      if (remaining > 0) {
        setLockCountdown(remaining);
      } else {
        localStorage.removeItem('bankism_locked_until');
        localStorage.removeItem('bankism_lock_banner');
        setLockedBannerMessage(null);
      }
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (lockCountdown > 0) {
      interval = setInterval(() => {
        setLockCountdown(prev => {
          if (prev <= 1) {
            localStorage.removeItem('bankism_locked_until');
            localStorage.removeItem('bankism_lock_banner');
            setLockedBannerMessage(null);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockCountdown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedY: (Math.random() * 0.3 + 0.1) * -1,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.y += p.speedY;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const lockedUntil = localStorage.getItem('bankism_locked_until');
    if (lockedUntil && Date.now() < parseInt(lockedUntil, 10)) {
      const remaining = Math.ceil((parseInt(lockedUntil, 10) - Date.now()) / 1000);
      const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
      const ss = String(remaining % 60).padStart(2, '0');
      toast({
        title: "Account Temporarily Locked",
        description: `Account temporarily locked. Try again in ${mm}:${ss}.`,
        variant: "destructive"
      });
      return;
    }

    if (!email || !password || !pin) {
      toast({ title: "Missing Fields", description: "Please enter email, password, and 6-digit PIN.", variant: "destructive" });
      return;
    }

    // Call supabase.auth.signInWithPassword simulation / call
    if (email === 'invalid@bankism.io') {
      toast({ title: "Auth Failed", description: "Invalid email or password.", variant: "destructive" });
      return;
    }

    // Verify PIN via Supabase Edge Function simulation (checking profiles table)
    const savedProfiles = JSON.parse(localStorage.getItem('bankism_profiles') || '{}');
    const userProfile = savedProfiles[email];

    // If user exists in registered profiles, check PIN
    if (userProfile && userProfile.pin !== pin) {
      const currentWarnings = (parseInt(localStorage.getItem('bankism_warning_count') || '0', 10)) + 1;
      localStorage.setItem('bankism_warning_count', currentWarnings.toString());

      if (currentWarnings >= 3) {
        const unlockTime = Date.now() + 120000; // 2 minutes
        localStorage.setItem('bankism_locked_until', unlockTime.toString());
        const bannerText = "🔒 Your session was locked due to multiple suspicious attempts. Please log in again.";
        localStorage.setItem('bankism_lock_banner', bannerText);
        setLockedBannerMessage(bannerText);
        setLockCountdown(120);

        toast({ title: "Account Locked", description: "Too many failed attempts. Locked for 2 minutes.", variant: "destructive" });
        return;
      } else {
        toast({ title: "Invalid PIN", description: `Incorrect PIN. Warning ${currentWarnings} of 3.`, variant: "destructive" });
        return;
      }
    }

    // Success login
    localStorage.removeItem('bankism_warning_count');
    localStorage.removeItem('bankism_locked_until');
    localStorage.removeItem('bankism_lock_banner');

    const authUser = {
      id: userProfile?.user_id || 'usr_' + Math.random().toString(36).substring(2, 9),
      email: email,
      full_name: userProfile?.full_name || 'Bankism User',
      bankism_id: userProfile?.bankism_id || 'BKSM-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      enrollment_completed: true
    };
    localStorage.setItem('bankism_user', JSON.stringify(authUser));

    toast({ title: "Signed In Successfully", description: "Redirecting to dashboard..." });
    navigate('/dashboard');
  };

  const minutes = Math.floor(lockCountdown / 60);
  const seconds = lockCountdown % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 font-sans relative overflow-x-hidden flex flex-col items-center justify-center p-4 selection:bg-[#00f0ff]/30 selection:text-[#00f0ff]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="relative z-30 max-w-md w-full flex flex-col gap-4">
        {lockedBannerMessage && (
          <div className="bg-red-950/90 border border-[#ff2d55] text-[#ff2d55] px-4 py-3 rounded-xl font-mono text-xs text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,45,85,0.3)] animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{lockedBannerMessage}</span>
          </div>
        )}

        <div className="bg-[#0f1523]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-6">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#ff2d55]/20 border border-[#00f0ff]/40 shadow-[0_0_25px_rgba(0,240,255,0.3)] animate-pulse">
            <Shield className="w-9 h-9 text-[#00f0ff]" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-widest font-mono text-white flex items-center justify-center gap-2">
              BANKISM <span className="text-xs px-2 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">Secure Banking & Threat Interception Login</p>
          </div>

          {lockCountdown > 0 ? (
            <div className="w-full bg-red-950/40 border border-red-500/50 p-4 rounded-lg font-mono text-xs text-red-400 space-y-2">
              <div className="font-bold flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Account temporarily locked.
              </div>
              <div>Try again in {timeFormatted}.</div>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="w-full space-y-4 font-mono text-left">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Email *</label>
                <Input 
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#070a12] border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Password *</label>
                <Input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#070a12] border-slate-800 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">6-Digit PIN *</label>
                <Input 
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="bg-[#070a12] border-slate-800 text-xs text-white tracking-widest"
                />
              </div>

              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-[#00f0ff] to-[#0072ff] hover:from-[#00d8e6] text-slate-950 font-mono font-bold text-xs h-11 uppercase mt-2 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              >
                Sign In
              </Button>
            </form>
          )}

          <div className="text-xs font-mono text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#00f0ff] hover:underline font-bold">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
