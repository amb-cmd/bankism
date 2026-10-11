import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Play, UserCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Landing() {
  const navigate = useNavigate();
  const { toast } = useToast();
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

    const particles = Array.from({ length: 35 }, () => ({
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

  const handleTryDemo = async () => {
    // Demo credentials spec: demo@bankism.app, demo1234, PIN 123456
    const demoEmail = 'demo@bankism.app';
    const demoPin = '123456';
    const hashedPin = 'hash_' + btoa(demoPin).split('').reverse().join('');

    const demoProfile = {
      user_id: 'usr_demo_123',
      full_name: 'Demo User',
      email: demoEmail,
      phone: '0000000000',
      pin: demoPin,
      pin_hash: hashedPin,
      bankism_id: 'BKSM-DEMO',
      enrollment_completed: true
    };

    const existingProfiles = JSON.parse(localStorage.getItem('bankism_profiles') || '{}');
    existingProfiles[demoEmail] = demoProfile;
    localStorage.setItem('bankism_profiles', JSON.stringify(existingProfiles));

    const authUser = {
      id: 'usr_demo_123',
      email: demoEmail,
      full_name: 'Demo User',
      bankism_id: 'BKSM-DEMO',
      enrollment_completed: true,
      is_demo: true
    };
    localStorage.setItem('bankism_user', JSON.stringify(authUser));

    toast({
      title: "Signed in as Demo User",
      description: "Demo environment initialized successfully."
    });

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 font-sans relative overflow-x-hidden flex flex-col items-center justify-center p-4 selection:bg-[#00f0ff]/30 selection:text-[#00f0ff]">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(to_right,#1f293d_1px,transparent_1px),linear-gradient(to_bottom,#1f293d_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="relative z-30 max-w-md w-full bg-[#0f1523]/80 backdrop-blur-xl border border-slate-800 rounded-xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-6">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#ff2d55]/20 border border-[#00f0ff]/40 shadow-[0_0_25px_rgba(0,240,255,0.3)] animate-pulse">
          <Shield className="w-9 h-9 text-[#00f0ff]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-widest font-mono text-white flex items-center justify-center gap-2">
            BANKISM <span className="text-xs px-2 py-0.5 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono tracking-tight">Blue-Team AI Firewall // Threat Interception Layer</p>
        </div>

        <p className="text-xs text-slate-300 font-mono leading-relaxed">
          Intercept and neutralize adversarial banking requests before they reach the core.
        </p>

        <div className="w-full flex flex-col gap-3 font-mono">
          <Button 
            onClick={handleTryDemo}
            className="w-full h-12 bg-gradient-to-r from-[#00f0ff] to-[#0072ff] hover:from-[#00d8e6] text-slate-950 font-bold text-xs gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all hover:scale-[1.02] uppercase"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Try Demo
          </Button>

          <Button 
            onClick={() => navigate('/register')}
            variant="outline"
            className="w-full h-11 bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white border-slate-800 hover:border-[#00f0ff]/50 text-xs gap-2 transition-all uppercase"
          >
            <UserCheck className="w-4 h-4 text-[#00f0ff]" />
            Register
          </Button>

          <Button 
            onClick={() => navigate('/login')}
            variant="ghost"
            className="w-full h-11 text-slate-300 hover:text-white hover:bg-slate-900 text-xs gap-2 transition-all uppercase border border-transparent hover:border-slate-800"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900/60 px-3 py-1 rounded border border-slate-800">
          DEMO ENVIRONMENT — SECURE AUTHENTICATION
        </div>
      </div>
    </div>
  );
}
