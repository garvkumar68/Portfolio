import React, { useState } from "react";
import { RefreshCw, Save, Wrench, Trash, Plus, GripVertical } from "lucide-react";
import { DBState, CMSFile } from "./types";
import { toast } from "sonner";

interface TechStackPanelProps {
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
}

export function TechStackPanel({
  db,
  setDb,
  saveFile,
  publishing
}: TechStackPanelProps) {
  // Tech Stack Tags Drag & Drop States
  const [draggedTechIdx, setDraggedTechIdx] = useState<number | null>(null);
  const [dragOverTechIdx, setDragOverTechIdx] = useState<number | null>(null);
  const [techDropPlacement, setTechDropPlacement] = useState<"left" | "right" | null>(null);

  const handleTechDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedTechIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleTechDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedTechIdx === null || draggedTechIdx === idx) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const placement = relativeX < rect.width / 2 ? "left" : "right";
    
    setDragOverTechIdx(idx);
    setTechDropPlacement(placement);
  };

  const handleTechDragEnd = () => {
    setDraggedTechIdx(null);
    setDragOverTechIdx(null);
    setTechDropPlacement(null);
  };

  const handleTechDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedTechIdx === null) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const placement = relativeX < rect.width / 2 ? "left" : "right";
    
    const newStack = [...db.techstack.content];
    const draggedItem = newStack[draggedTechIdx];
    newStack.splice(draggedTechIdx, 1);
    
    let insertIdx = targetIdx;
    if (draggedTechIdx < targetIdx) {
      insertIdx = placement === "right" ? targetIdx : targetIdx - 1;
    } else {
      insertIdx = placement === "right" ? targetIdx + 1 : targetIdx;
    }
    
    insertIdx = Math.max(0, Math.min(newStack.length, insertIdx));
    newStack.splice(insertIdx, 0, draggedItem);
    
    setDb({
      ...db,
      techstack: {
        ...db.techstack,
        content: newStack
      }
    });
    
    setDraggedTechIdx(null);
    setDragOverTechIdx(null);
    setTechDropPlacement(null);
    toast.success("Tech tag sorted successfully!");
  };

  const stackList = db.techstack?.content || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">techstack.json</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure your dynamic marquee dashboard tech stack items.</p>
        </div>
        <button
          onClick={() => saveFile("techstack")}
          disabled={publishing !== null}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00ff88] hover:bg-[#00ff88]/90 disabled:bg-[#00ff88]/40 text-[#050505] text-xs font-bold rounded-lg shadow-[0_4px_20px_rgba(0,255,136,0.2)] transition-all uppercase cursor-pointer"
        >
          {publishing === "techstack" ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Publish Changes
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-6 w-full">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <Wrench className="size-4 text-[#00ff88]" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-white">Marquee Tech Stack Configuration</h3>
          </div>
          {stackList.length > 0 && (
            <button
              onClick={() => {
                setDb({
                  ...db,
                  techstack: { ...db.techstack, content: [] }
                });
                toast.success("Slate cleared! Stack wiped.");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg uppercase transition-all cursor-pointer"
            >
              <Trash className="size-3" /> Clear All
            </button>
          )}
        </div>

        {/* Glowing Interactive Badges Wrapper */}
        <div className="space-y-4">
          <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">
            Active Technologies Stack ({stackList.length} items)
          </label>
          
          <div 
            className="flex flex-wrap gap-2.5 p-5 bg-white/[0.007] border border-white/5 rounded-2xl min-h-[120px] items-center content-start transition-all duration-300"
            onDragOver={(e) => {
              if (draggedTechIdx !== null) {
                e.preventDefault();
              }
            }}
            onDrop={(e) => {
              if (draggedTechIdx !== null && draggedTechIdx !== stackList.length - 1) {
                e.preventDefault();
                
                const newStack = [...stackList];
                const draggedItem = newStack[draggedTechIdx];
                newStack.splice(draggedTechIdx, 1);
                newStack.push(draggedItem);
                
                setDb({
                  ...db,
                  techstack: {
                    ...db.techstack,
                    content: newStack
                  }
                });
                
                setDraggedTechIdx(null);
                setDragOverTechIdx(null);
                setTechDropPlacement(null);
                toast.success("Tech tag sorted to bottom successfully!");
              }
            }}
          >
            {stackList.length > 0 ? (
              stackList.map((tech: string, idx: number) => {
                const isDragging = draggedTechIdx === idx;
                const isDragOver = dragOverTechIdx === idx;
                
                return (
                  <div
                    key={idx}
                    draggable="true"
                    onDragStart={(e) => handleTechDragStart(e, idx)}
                    onDragOver={(e) => handleTechDragOver(e, idx)}
                    onDragEnd={handleTechDragEnd}
                    onDrop={(e) => handleTechDrop(e, idx)}
                    className={`group relative flex items-center gap-2 px-3 py-1.5 bg-[#00ff88]/5 border border-[#00ff88]/20 hover:border-[#00ff88] text-white hover:text-[#00ff88] text-xs font-bold rounded-xl active-tab-glow transition-all duration-300 scale-100 hover:scale-105 active:scale-95 shadow-[0_2px_10px_rgba(0,255,136,0.02)] ${isDragging ? "opacity-30 border-dashed" : ""} cursor-grab active:cursor-grabbing`}
                  >
                    {/* Glowing insertion line indicators for horizontal grid */}
                    {isDragOver && techDropPlacement === "left" && (
                      <div className="absolute top-0 bottom-0 -left-[1.5px] w-[2.5px] bg-[#00ff88] shadow-[0_0_8px_#00ff88] pointer-events-none rounded-full z-20 animate-pulse" />
                    )}
                    {isDragOver && techDropPlacement === "right" && (
                      <div className="absolute top-0 bottom-0 -right-[1.5px] w-[2.5px] bg-[#00ff88] shadow-[0_0_8px_#00ff88] pointer-events-none rounded-full z-20 animate-pulse" />
                    )}

                    <GripVertical className="size-3 text-muted-foreground/30 group-hover:text-muted-foreground/75 shrink-0 transition-colors cursor-grab active:cursor-grabbing" />
                    <span className="font-mono-fira text-[11px] tracking-wide uppercase">{tech}</span>
                    <button
                      onClick={() => {
                        const newStack = [...stackList];
                        newStack.splice(idx, 1);
                        setDb({
                          ...db,
                          techstack: { ...db.techstack, content: newStack }
                        });
                        toast.success(`Removed ${tech}`);
                      }}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-white/5 cursor-pointer"
                      title={`Remove ${tech}`}
                    >
                      <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-8 text-muted-foreground text-xs font-mono-fira uppercase tracking-wider animate-pulse">
                🛠️ Tech stack is empty. Add technologies below to populate!
              </div>
            )}
          </div>

          {/* Add Tag Section */}
          <div className="pt-4 border-t border-white/5">
            <label className="block text-muted-foreground mb-2 text-[10px] uppercase font-semibold tracking-wider">
              Add New Technology Tag
            </label>
            <div className="flex gap-3 max-w-md">
              <input
                type="text"
                id="new-tech-input"
                placeholder="e.g. Next.js, PyTorch, Kubernetes"
                className="flex-1 cyber-input font-bold"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const inputEl = e.currentTarget;
                    const val = inputEl.value.trim().toUpperCase();
                    if (val) {
                      const currentStack = stackList;
                      if (currentStack.includes(val)) {
                        toast.error(`${val} is already in your tech stack!`);
                        return;
                      }
                      const newStack = [...currentStack, val];
                      setDb({
                        ...db,
                        techstack: { ...db.techstack, content: newStack }
                      });
                      inputEl.value = "";
                      toast.success(`Added ${val} to your tech stack!`);
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const inputEl = document.getElementById("new-tech-input") as HTMLInputElement;
                  const val = inputEl?.value.trim().toUpperCase();
                  if (val) {
                    const currentStack = stackList;
                    if (currentStack.includes(val)) {
                      toast.error(`${val} is already in your tech stack!`);
                      return;
                    }
                    const newStack = [...currentStack, val];
                    setDb({
                      ...db,
                      techstack: { ...db.techstack, content: newStack }
                    });
                    inputEl.value = "";
                    toast.success(`Added ${val} to your tech stack!`);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#00ff88] hover:bg-[#00ff88]/90 text-[#050505] text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(0,255,136,0.15)] hover:scale-105 active:scale-95 active:shadow-none cursor-pointer"
              >
                <Plus className="size-3.5 stroke-[3]" /> Add Tag
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground font-sans mt-2 uppercase tracking-wider">
              Tip: Press <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded font-mono">Enter</kbd> to add tags quickly!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
