import React from "react";
import { Lock, Unlock, RefreshCw } from "lucide-react";
import { NeuralBackground } from "../NeuralBackground";

interface SecurityGatewayProps {
  inputKey: string;
  setInputKey: (val: string) => void;
  isSubmittingKey: boolean;
  keyError: string | null;
  handleLoginSubmit: (e: React.FormEvent) => void;
}

export function SecurityGateway({
  inputKey,
  setInputKey,
  isSubmittingKey,
  keyError,
  handleLoginSubmit
}: SecurityGatewayProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white relative px-4 select-none">
      <NeuralBackground />
      
      <form 
        onSubmit={handleLoginSubmit}
        className="relative max-w-sm w-full glass-card rounded-3xl p-8 border border-white/5 shadow-[0_15px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-500"
      >
        {/* Neon Header Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent shadow-[0_0_12px_#00ff88]" />

        <div className="flex flex-col items-center gap-3">
          <div className="size-16 rounded-2xl bg-white/[0.01] border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,136,0.02)]">
            <Lock className="size-7 text-[#00ff88] animate-pulse" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-[0.3em] uppercase text-white">Security Gateway</h1>
            <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase tracking-wider">Dodo Operations Kernel</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed font-sans px-2">
            Authentication required to modify portfolio memory databases. Enter your operations security key to open workspace.
          </p>

          <div className="space-y-2">
            <input 
              type="password"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="Security Access Token"
              className="w-full cyber-input text-center font-mono-fira text-sm tracking-widest placeholder:tracking-normal placeholder:font-sans focus:placeholder-opacity-50 focus:outline-none"
              disabled={isSubmittingKey}
            />

            {keyError && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-[9.5px] font-mono tracking-wide uppercase leading-tight animate-in fade-in slide-in-from-top-1">
                ⚠️ {keyError}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmittingKey || !inputKey.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#00ff88] hover:bg-[#00ff88]/90 disabled:bg-[#00ff88]/40 disabled:text-[#050505]/40 text-[#050505] text-xs font-bold rounded-xl shadow-[0_4px_25px_rgba(0,255,136,0.15)] transition-all uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/50"
        >
          {isSubmittingKey ? (
            <>
              <RefreshCw className="size-3.5 animate-spin" />
              <span>Decrypting Layers...</span>
            </>
          ) : (
            <>
              <Unlock className="size-3.5" />
              <span>Establish Connection</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
