import React, { useState } from "react";
import { GripVertical, ArrowUp, ArrowDown, Trash, Plus, Terminal, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { DBState, CMSFile } from "./types";

interface ListEditorProps {
  fileKey: CMSFile;
  title: string;
  description: string;
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
  emptyItem: any;
  renderForm: (item: any, onChange: (updated: any) => void) => React.ReactNode;
}

export function ListEditor({
  fileKey,
  title,
  description,
  db,
  setDb,
  saveFile,
  publishing,
  emptyItem,
  renderForm
}: ListEditorProps) {
  const list = db[fileKey].content || [];
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dropPlacement, setDropPlacement] = useState<"above" | "below" | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const placement = relativeY < rect.height / 2 ? "above" : "below";
    
    setDragOverIdx(idx);
    setDropPlacement(placement);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
    setDropPlacement(null);
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const placement = relativeY < rect.height / 2 ? "above" : "below";
    
    const newList = [...list];
    const draggedItem = newList[draggedIdx];
    
    newList.splice(draggedIdx, 1);
    
    let insertIdx = targetIdx;
    if (draggedIdx < targetIdx) {
      insertIdx = placement === "below" ? targetIdx : targetIdx - 1;
    } else {
      insertIdx = placement === "below" ? targetIdx + 1 : targetIdx;
    }
    
    insertIdx = Math.max(0, Math.min(newList.length, insertIdx));
    newList.splice(insertIdx, 0, draggedItem);
    
    setDb({
      ...db,
      [fileKey]: {
        ...db[fileKey],
        content: newList
      }
    });
    setSelectedIdx(insertIdx);
    setDraggedIdx(null);
    setDragOverIdx(null);
    setDropPlacement(null);
    toast.success("Item sorted successfully!");
  };

  const handleItemChange = (updatedItem: any) => {
    const newList = [...list];
    newList[selectedIdx] = updatedItem;
    setDb({
      ...db,
      [fileKey]: {
        ...db[fileKey],
        content: newList
      }
    });
  };

  const handleAddNew = () => {
    const newList = [...list];
    newList.push({ ...emptyItem });
    setDb({
      ...db,
      [fileKey]: {
        ...db[fileKey],
        content: newList
      }
    });
    setSelectedIdx(newList.length - 1);
  };

  const handleDelete = (idx: number) => {
    const newList = [...list];
    newList.splice(idx, 1);
    setDb({
      ...db,
      [fileKey]: {
        ...db[fileKey],
        content: newList
      }
    });
    setSelectedIdx(Math.max(0, idx - 1));
  };

  const handleMove = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    
    const newList = [...list];
    const temp = newList[idx];
    newList[idx] = newList[targetIdx];
    newList[targetIdx] = temp;

    setDb({
      ...db,
      [fileKey]: {
        ...db[fileKey],
        content: newList
      }
    });
    setSelectedIdx(targetIdx);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <button
          onClick={() => saveFile(fileKey)}
          disabled={publishing !== null}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00ff88] hover:bg-[#00ff88]/90 disabled:bg-[#00ff88]/40 text-[#050505] text-xs font-bold rounded-lg shadow-[0_4px_20px_rgba(0,255,136,0.2)] transition-all uppercase cursor-pointer"
        >
          {publishing === fileKey ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Publish Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left: Scrollable Items List */}
        <div className="w-full md:w-80 shrink-0 glass-card rounded-2xl p-4 space-y-3 self-stretch flex flex-col justify-between max-h-[70vh] min-h-[500px]">
          <div 
            className="space-y-2 overflow-y-auto pr-1 flex-1"
            onDragOver={(e) => {
              if (draggedIdx !== null) {
                e.preventDefault();
              }
            }}
            onDrop={(e) => {
              if (draggedIdx !== null && draggedIdx !== list.length - 1) {
                e.preventDefault();
                
                const newList = [...list];
                const draggedItem = newList[draggedIdx];
                newList.splice(draggedIdx, 1);
                newList.push(draggedItem);
                
                setDb({
                  ...db,
                  [fileKey]: {
                    ...db[fileKey],
                    content: newList
                  }
                });
                setSelectedIdx(newList.length - 1);
                setDraggedIdx(null);
                setDragOverIdx(null);
                setDropPlacement(null);
                toast.success("Item sorted to bottom successfully!");
              }
            }}
          >
            {list.map((item: any, idx: number) => {
              const isSelected = selectedIdx === idx;
              const isDragging = draggedIdx === idx;
              const isDragOver = dragOverIdx === idx;
              
              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`group relative flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 border ${
                    isDragging 
                      ? "opacity-30 border-dashed border-[#00ff88]/40 bg-[#00ff88]/5 scale-[0.97] cursor-grabbing" 
                      : isDragOver
                        ? "bg-[#00ff88]/10 border-transparent text-[#00ff88] scale-[1.01] shadow-[0_0_15px_rgba(0,255,136,0.06)] cursor-grabbing"
                        : isSelected 
                          ? "bg-[#00ff88]/5 border-[#00ff88]/20 text-[#00ff88] cursor-grab" 
                          : "bg-white/[0.005] border-white/5 text-white hover:bg-white/5 hover:border-white/10 cursor-grab"
                  }`}
                >
                  {/* Glowing insertion line indicators */}
                  {isDragOver && dropPlacement === "above" && (
                    <div className="absolute -top-[1.5px] left-0 right-0 h-[2.5px] bg-[#00ff88] shadow-[0_0_8px_#00ff88] pointer-events-none rounded-full z-20 animate-pulse" />
                  )}
                  {isDragOver && dropPlacement === "below" && (
                    <div className="absolute -bottom-[1.5px] left-0 right-0 h-[2.5px] bg-[#00ff88] shadow-[0_0_8px_#00ff88] pointer-events-none rounded-full z-20 animate-pulse" />
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <GripVertical className="size-3.5 text-muted-foreground/30 group-hover:text-muted-foreground/75 shrink-0 transition-colors cursor-grab active:cursor-grabbing" />
                    <span className="text-xs font-bold truncate pr-2 flex-1">
                      {item.title || item.name || "Untitled Milestone"}
                    </span>
                  </div>
                  
                  {/* Sorting & Deleting controls */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMove(idx, "up"); }}
                      disabled={idx === 0}
                      className="p-1 text-muted-foreground hover:text-white disabled:opacity-30 rounded cursor-pointer"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMove(idx, "down"); }}
                      disabled={idx === list.length - 1}
                      className="p-1 text-muted-foreground hover:text-white disabled:opacity-30 rounded cursor-pointer"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                    >
                      <Trash className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleAddNew}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.02] border border-white/10 hover:border-[#00ff88]/30 hover:text-[#00ff88] text-xs font-bold rounded-xl uppercase transition-all cursor-pointer"
          >
            <Plus className="size-4" /> Add Item
          </button>
        </div>

        {/* Right: Active Item Form Editor */}
        <div className="flex-1 w-full glass-card rounded-2xl p-6 self-stretch">
          {list[selectedIdx] ? (
            renderForm(list[selectedIdx], handleItemChange)
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
              <Terminal className="size-8 text-[#00ff88]/40 mb-3" />
              <p className="text-xs font-mono-fira uppercase tracking-widest">No active dataset selected.</p>
              <button 
                onClick={handleAddNew}
                className="mt-4 px-4 py-2 border border-white/10 hover:border-[#00ff88]/20 hover:text-white text-xs font-bold rounded-lg uppercase transition-all cursor-pointer"
              >
                Create New Entry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
