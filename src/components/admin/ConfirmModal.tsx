import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
      <div className="w-full max-w-md glass-card bg-[#050505]/95 border border-[#00ff88]/30 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,255,136,0.15)] relative overflow-hidden animate-in zoom-in-95 duration-300 text-center">
        {/* Futuristic glowing backdrop orb */}
        <div className="absolute -top-24 -left-24 size-48 bg-[#00ff88]/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 size-48 bg-red-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        {/* Warning Icon Badge */}
        <div className="mx-auto size-14 rounded-full bg-[#00ff88]/5 border border-[#00ff88]/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,255,136,0.05)]">
          <AlertTriangle className="size-6 text-[#00ff88] animate-pulse" />
        </div>

        <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white font-mono-fira mb-3">
          {title || "Confirm System Deletion"}
        </h3>
        
        <p className="text-[10px] text-muted-foreground leading-relaxed font-sans px-4 mb-6 uppercase tracking-wider">
          {message}
        </p>
        
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest cursor-pointer hover:border-white/20 active:scale-95"
          >
            Cancel Action
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/40 hover:border-[#00ff88] text-[#00ff88] text-[10px] font-bold rounded-xl shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all uppercase tracking-widest cursor-pointer active:scale-95"
          >
            Purge Database
          </button>
        </div>
      </div>
    </div>
  );
}
