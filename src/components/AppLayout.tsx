import React, { useState, FormEvent, useEffect } from 'react';
import { ArrowRight, Shield, Zap, Globe, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import Starfield from './Starfield';
import { supabase } from '@/lib/supabase';

type SubmissionStatus = 'idle' | 'loading' | 'success' | 'error' | 'duplicate';

const AppLayout: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{
          email: email.toLowerCase().trim(),
          source: 'landing_page',
        }]);

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          setStatus('duplicate');
          setErrorMessage('This email is already on our waitlist!');
        } else {
          console.error('Supabase error:', error);
          setStatus('error');
          setErrorMessage('Something went wrong. Please try again.');
        }
        return;
      }

      console.log('Email submitted successfully:', email);

      // Send welcome email
      try {
        const res = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim() }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error('Email API Failed:', errorData);
          // Optional: alert(JSON.stringify(errorData)); 
        }
      } catch (emailError) {
        console.error('Failed to send welcome email (Network):', emailError);
      }

      setStatus('success');
      setEmail('');

    } catch (err) {
      console.error('Submission error:', err);
      setStatus('error');
      setErrorMessage('Unable to connect. Please try again later.');
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'No Friction',
      description: 'One-click context teleportation.',
    },
    {
      icon: Shield,
      title: 'Private',
      description: 'Zero cloud storage. Local only.',
    },
    {
      icon: Globe,
      title: 'Universal',
      description: 'Works with all major AI models.',
    },
  ];

  const renderFormContent = () => {
    if (status === 'success') {
      return (
        <div className="flex items-center justify-center gap-3 text-white/80 animate-fade-in py-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-base font-medium">You're on the list.</span>
        </div>
      );
    }

    if (status === 'duplicate') {
      return (
        <div className="flex flex-col items-center gap-2 animate-fade-in py-2">
          <div className="flex items-center gap-2 text-white/60">
            <Check className="w-4 h-4" />
            <span className="text-base font-medium">Already on the list</span>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto w-full">
        <div
          className={`relative flex items-center gap-2 p-1.5 rounded-xl glass transition-all duration-500 ${status === 'error'
            ? 'border-red-500/30'
            : isFocused
              ? 'border-white/20'
              : 'border-white/10'
            }`}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="email@address.com"
            disabled={status === 'loading'}
            className="flex-1 bg-transparent px-3 py-2 text-white placeholder-white/20 outline-none text-sm font-body disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === 'loading' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <span>JOIN</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>

        {status === 'error' && errorMessage && (
          <div className="flex items-center justify-center gap-1.5 mt-3 text-red-400/80 text-xs animate-fade-in">
            <AlertCircle className="w-3 h-3" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>
    );
  };

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("/bg-lush.png")' }}
    >
      {/* Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Starfield Background (Low opacity) */}
      <div className="relative z-0 opacity-40">
        <Starfield />
      </div>

      {/* Subtle Spotlight */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[60%] h-[40%] radial-gradient-hero pointer-events-none opacity-40" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 h-full flex flex-col justify-between py-6 md:py-12">

        {/* Header */}
        <header
          className={`w-full flex justify-between items-center transition-all duration-1000 ease-out flex-none ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
        >
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="The Bridge Logo"
              className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-contain glow-border border border-white/10"
            />
            <span className="font-heading font-medium text-xs md:text-sm text-white tracing-wide">THE BRIDGE</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">Private Beta</span>
          </div>
        </header>

        {/* Hero */}
        <div className="flex flex-col items-center text-center justify-center flex-1 min-h-0">
          <h1
            className={`font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight mb-4 md:mb-6 transition-all duration-1000 ease-out delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            <span className="text-gradient">Stop Amnesia</span>
          </h1>

          <p
            className={`text-sm sm:text-lg text-white/40 max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed font-body transform transition-all duration-1000 ease-out delay-200 px-4 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            Teleport context between <span className="text-white">ChatGPT</span>, <span className="text-white">Claude</span>, and <span className="text-white">Gemini</span>.
            <br className="hidden sm:block" />
            Zero friction. Zero data loss.
          </p>

          <div
            className={`w-full px-4 transition-all duration-1000 ease-out delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
          >
            {renderFormContent()}
          </div>
        </div>

        {/* Footer / Features - Optimized for Mobile (Horizontal Scroll) */}
        <div
          className={`w-full flex md:grid md:grid-cols-3 gap-4 md:gap-8 border-t border-white/5 pt-6 flex-none overflow-x-auto snap-x no-scrollbar ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
        >
          {features.map((feature, index) => (
            <div key={index} className="flex-none w-[60vw] md:w-auto flex flex-col items-center md:items-start text-center md:text-left group snap-center first:pl-2 last:pr-2">
              <div className="mb-2 text-white/40 group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white/80 mb-1">{feature.title}</h3>
              <p className="text-xs text-white/30 whitespace-normal">{feature.description}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Decorative Lines */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export default AppLayout;
