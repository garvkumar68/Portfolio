import React, { useState } from "react";
import { RefreshCw, Save, Layers, Plus, Trash, GripVertical } from "lucide-react";
import { DBState, CMSFile } from "./types";
import { toast } from "sonner";

interface SkillsDataPanelProps {
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
}

export function SkillsDataPanel({
  db,
  setDb,
  saveFile,
  publishing
}: SkillsDataPanelProps) {
  // Skills Drag & Drop States
  const [draggedSkill, setDraggedSkill] = useState<{ catIdx: number; sIdx: number } | null>(null);
  const [dragOverSkill, setDragOverSkill] = useState<{ catIdx: number; sIdx: number } | null>(null);
  const [skillDropPlacement, setSkillDropPlacement] = useState<"above" | "below" | null>(null);

  const handleSkillDragStart = (e: React.DragEvent, catIdx: number, sIdx: number) => {
    setDraggedSkill({ catIdx, sIdx });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSkillDragOver = (e: React.DragEvent, catIdx: number, sIdx: number) => {
    e.preventDefault();
    if (!draggedSkill || (draggedSkill.catIdx === catIdx && draggedSkill.sIdx === sIdx)) return;
    if (draggedSkill.catIdx !== catIdx) return; // Prevent category cross-contamination
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const placement = relativeY < rect.height / 2 ? "above" : "below";
    
    setDragOverSkill({ catIdx, sIdx });
    setSkillDropPlacement(placement);
  };

  const handleSkillDragEnd = () => {
    setDraggedSkill(null);
    setDragOverSkill(null);
    setSkillDropPlacement(null);
  };

  const handleSkillDrop = (e: React.DragEvent, catIdx: number, targetSIdx: number) => {
    e.preventDefault();
    if (!draggedSkill || draggedSkill.catIdx !== catIdx) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const placement = relativeY < rect.height / 2 ? "above" : "below";
    
    const categories = [...db.skillsData.content.categories];
    const skillsList = [...categories[catIdx].skills];
    
    const draggedItem = skillsList[draggedSkill.sIdx];
    skillsList.splice(draggedSkill.sIdx, 1);
    
    let insertIdx = targetSIdx;
    if (draggedSkill.sIdx < targetSIdx) {
      insertIdx = placement === "below" ? targetSIdx : targetSIdx - 1;
    } else {
      insertIdx = placement === "below" ? targetSIdx + 1 : targetSIdx;
    }
    
    insertIdx = Math.max(0, Math.min(skillsList.length, insertIdx));
    skillsList.splice(insertIdx, 0, draggedItem);
    
    categories[catIdx].skills = skillsList;
    
    setDb({
      ...db,
      skillsData: {
        ...db.skillsData,
        content: { ...db.skillsData.content, categories }
      }
    });
    
    setDraggedSkill(null);
    setDragOverSkill(null);
    setSkillDropPlacement(null);
    toast.success("Skill sorted successfully!");
  };

  const categories = db.skillsData?.content?.categories || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">skillsData.json</h2>
          <p className="text-xs text-muted-foreground mt-1">Configure your skill categories and technical expertise matrix.</p>
        </div>
        <button
          onClick={() => saveFile("skillsData")}
          disabled={publishing !== null}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#00ff88] hover:bg-[#00ff88]/90 disabled:bg-[#00ff88]/40 text-[#050505] text-xs font-bold rounded-lg shadow-[0_4px_20px_rgba(0,255,136,0.2)] transition-all uppercase cursor-pointer"
        >
          {publishing === "skillsData" ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          Publish Changes
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <Layers className="size-4 text-[#00ff88]" />
            <h3 className="text-xs font-bold tracking-wider uppercase text-white">Skill Matrix Categories</h3>
          </div>
          <button
            onClick={() => {
              const updatedCats = [...categories];
              updatedCats.push({ title: "New Skill Sector", skills: [{ name: "Skill A", progress: 80 }] });
              setDb({
                ...db,
                skillsData: {
                  ...db.skillsData,
                  content: { ...db.skillsData.content, categories: updatedCats }
                }
              });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-[#00ff88]/30 hover:text-[#00ff88] text-[10px] font-bold rounded-lg uppercase transition-all cursor-pointer"
          >
            <Plus className="size-3" /> Add Category
          </button>
        </div>

        <div className="space-y-6">
          {categories.map((cat: any, catIdx: number) => (
            <div key={catIdx} className="bg-white/[0.01] border border-white/5 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2.5">
                <input 
                  type="text" 
                  value={cat.title} 
                  onChange={e => {
                    const updatedCats = [...categories];
                    updatedCats[catIdx].title = e.target.value;
                    setDb({...db, skillsData: {...db.skillsData, content: {...db.skillsData.content, categories: updatedCats}}});
                  }}
                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#00ff88] font-bold text-sm text-white focus:outline-none px-1"
                />
                <button
                  onClick={() => {
                    const updatedCats = [...categories];
                    updatedCats.splice(catIdx, 1);
                    setDb({...db, skillsData: {...db.skillsData, content: {...db.skillsData.content, categories: updatedCats}}});
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                  title="Delete Category"
                >
                  <Trash className="size-3.5" />
                </button>
              </div>

              {/* Skill items list */}
              <div 
                className="space-y-3"
                onDragOver={(e) => {
                  if (draggedSkill !== null && draggedSkill.catIdx === catIdx) {
                    e.preventDefault();
                  }
                }}
                onDrop={(e) => {
                  if (draggedSkill !== null && draggedSkill.catIdx === catIdx && draggedSkill.sIdx !== cat.skills.length - 1) {
                    e.preventDefault();
                    
                    const updatedCats = [...categories];
                    const skillsList = [...updatedCats[catIdx].skills];
                    
                    const draggedItem = skillsList[draggedSkill.sIdx];
                    skillsList.splice(draggedSkill.sIdx, 1);
                    skillsList.push(draggedItem);
                    
                    updatedCats[catIdx].skills = skillsList;
                    
                    setDb({
                      ...db,
                      skillsData: {
                        ...db.skillsData,
                        content: { ...db.skillsData.content, categories: updatedCats }
                      }
                    });
                    
                    setDraggedSkill(null);
                    setDragOverSkill(null);
                    setSkillDropPlacement(null);
                    toast.success("Skill sorted to bottom successfully!");
                  }
                }}
              >
                {cat.skills && cat.skills.map((s: any, sIdx: number) => {
                  const isDragging = draggedSkill?.catIdx === catIdx && draggedSkill?.sIdx === sIdx;
                  const isDragOver = dragOverSkill?.catIdx === catIdx && dragOverSkill?.sIdx === sIdx;
                  
                  return (
                    <div 
                      key={sIdx} 
                      draggable="true"
                      onDragStart={(e) => handleSkillDragStart(e, catIdx, sIdx)}
                      onDragOver={(e) => handleSkillDragOver(e, catIdx, sIdx)}
                      onDragEnd={handleSkillDragEnd}
                      onDrop={(e) => handleSkillDrop(e, catIdx, sIdx)}
                      className={`group relative flex items-center gap-3 p-2 rounded-xl transition-all duration-300 border ${
                        isDragging 
                          ? "opacity-30 border-dashed border-[#00ff88]/40 bg-[#00ff88]/5 scale-[0.98] cursor-grabbing" 
                          : isDragOver
                            ? "bg-[#00ff88]/10 border-transparent text-[#00ff88] scale-[1.01] shadow-[0_0_15px_rgba(0,255,136,0.06)] cursor-grabbing"
                            : "bg-transparent border-transparent hover:bg-white/[0.02] border-white/0 hover:border-white/5"
                      }`}
                    >
                      {/* Glowing insertion line indicators */}
                      {isDragOver && skillDropPlacement === "above" && (
                        <div className="absolute -top-[1.5px] left-0 right-0 h-[2.5px] bg-[#00ff88] shadow-[0_0_8px_#00ff88] pointer-events-none rounded-full z-20 animate-pulse" />
                      )}
                      {isDragOver && skillDropPlacement === "below" && (
                        <div className="absolute -bottom-[1.5px] left-0 right-0 h-[2.5px] bg-[#00ff88] shadow-[0_0_8px_#00ff88] pointer-events-none rounded-full z-20 animate-pulse" />
                      )}

                      {/* Drag handle */}
                      <GripVertical className="size-4 text-muted-foreground/30 group-hover:text-muted-foreground/75 shrink-0 transition-colors cursor-grab active:cursor-grabbing" />

                      <div className="grid grid-cols-12 gap-3 items-center flex-1">
                        <div className="col-span-6">
                          <input 
                            type="text" 
                            value={s.name} 
                            onChange={e => {
                              const updatedCats = [...categories];
                              updatedCats[catIdx].skills[sIdx].name = e.target.value;
                              setDb({...db, skillsData: {...db.skillsData, content: {...db.skillsData.content, categories: updatedCats}}});
                            }}
                            className="w-full cyber-input font-medium"
                            placeholder="Skill Name"
                          />
                        </div>
                        <div className="col-span-4 flex items-center gap-2">
                          <input 
                            type="number" 
                            min="0" 
                            max="100"
                            value={s.progress} 
                            onChange={e => {
                              const updatedCats = [...categories];
                              updatedCats[catIdx].skills[sIdx].progress = parseInt(e.target.value) || 0;
                              setDb({...db, skillsData: {...db.skillsData, content: {...db.skillsData.content, categories: updatedCats}}});
                            }}
                            className="w-full cyber-input font-bold"
                            placeholder="Progress %"
                          />
                          <span className="text-[10px] text-muted-foreground font-mono">%</span>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button
                            onClick={() => {
                              const updatedCats = [...categories];
                              updatedCats[catIdx].skills.splice(sIdx, 1);
                              setDb({...db, skillsData: {...db.skillsData, content: {...db.skillsData.content, categories: updatedCats}}});
                            }}
                            className="p-1.5 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                            title="Delete Skill"
                          >
                            <Trash className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    const updatedCats = [...categories];
                    updatedCats[catIdx].skills.push({ name: "New Expertise", progress: 75 });
                    setDb({...db, skillsData: {...db.skillsData, content: {...db.skillsData.content, categories: updatedCats}}});
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:text-white text-muted-foreground text-[9px] font-bold rounded-lg uppercase transition-all mt-2 cursor-pointer"
                >
                  <Plus className="size-3" /> Add Skill
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
