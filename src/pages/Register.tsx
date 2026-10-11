import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [agreed, setAgreed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || fullName.length < 2) {
      toast({ title: "Invalid Name", description: "Please enter your full legal name.", variant: "destructive" });
      return;
    }
    if (!email || !email.includes('@')) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!phone || phone.length !== 10 || isNaN(Number(phone))) {
      toast({ title: "Invalid Phone", description: "Phone number must be exactly 10 digits.", variant: "destructive" });
      return;
    }
    if (!password || password.length < 8) {
      toast({ title: "Invalid Password", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (!pin || pin.length !== 6 || isNaN(Number(pin))) {
      toast({ title: "Invalid PIN", description: "6-digit PIN must be exactly 6 numeric digits.", variant: "destructive" });
      return;
    }
    if (pin !== confirmPin) {
      toast({ title: "PIN Mismatch", description: "PINs do not match.", variant: "destructive" });
      return;
    }
    if (!agreed) {
      toast({ title: "Terms Agreement Required", description: "You must agree to the demo terms.", variant: "destructive" });
      return;
    }

    // Call supabase.auth.signUp simulation
    const userId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const bankismId = 'BKSM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    
    // Hash PIN simulation for profiles table
    const hashedPin = 'hash_' + btoa(pin).split('').reverse().join('');

    const profileRecord = {
      user_id: userId,
      full_name: fullName,
      email: email,
      phone: phone,
      pin: pin,
      pin_hash: hashedPin,
      bankism_id: bankismId,
      enrollment_completed: true
    };

    const existingProfiles = JSON.parse(localStorage.getItem('bankism_profiles') || '{}');
    existingProfiles[email] = profileRecord;
    localStorage.setItem('bankism_profiles', JSON.stringify(existingProfiles));

    const authUser = {
      id: userId,
      email: email,
      full_name: fullName,
      bankism_id: bankismId,
      enrollment_completed: true
    };
    localStorage.setItem('bankism_user', JSON.stringify(authUser));

    toast({
      title: `Welcome to Bankism, ${fullName.split(' ')[0]}`,
      description: "Account created and profile registered successfully."
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 font-sans relative overflow-x-hidden flex flex-col items-center justify-center p-4 selection:bg-[#00f0ff]/30 selection:text-[#00f0ff]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="relative z-35 max-w-md w-full bg-[#0f1523]/90 backdrop-blur-xl border border-slate-800 rounded-xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col gap-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 border border-[#00f0ff]/30 flex items-center justify-center text-[#00f0ff]">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-mono text-white">BANKISM REGISTRATION</h2>
            <p className="text-[11px] font-mono text-slate-400">Create account & setup security PIN</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300">Full Legal Name *</label>
            <Input 
              required
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-[#070a12] border-slate-800 text-xs text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300">Email *</label>
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
            <label className="text-slate-300">Phone Number (10 digits) *</label>
            <Input 
              type="tel"
              maxLength={10}
              required
              placeholder="5550198234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-[#070a12] border-slate-800 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300">Password (min 8) *</label>
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
              <label className="text-slate-300">Confirm Password *</label>
              <Input 
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-[#070a12] border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300">6-Digit PIN *</label>
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
            <div className="space-y-1.5">
              <label className="text-slate-300">Confirm PIN *</label>
              <Input 
                type="password"
                maxLength={6}
                required
                placeholder="••••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="bg-[#070a12] border-slate-800 text-xs text-white tracking-widest"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="terms" 
              checked={agreed}
              onCheckedChange={(val) => setAgreed(val === true)}
            />
            <label htmlFor="terms" className="text-[11px] text-slate-400 cursor-pointer">
              I agree this is a demo app
            </label>
          </div>

          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-[#00f0ff] to-[#0072ff] hover:from-[#00d8e6] text-slate-950 font-mono font-bold text-xs h-11 uppercase mt-2 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            Create Account
          </Button>
        </form>

        <div className="text-xs font-mono text-slate-400 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00f0ff] hover:underline font-bold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
