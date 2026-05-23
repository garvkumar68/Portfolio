import React from "react";
import { DBState, CMSFile } from "./types";
import { ListEditor } from "./ListEditor";
import { renderUrlInput } from "./helpers";

interface ExperiencePanelProps {
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
}

export function ExperiencePanel({
  db,
  setDb,
  saveFile,
  publishing
}: ExperiencePanelProps) {
  return (
    <ListEditor 
      fileKey="experience"
      title="experience.json"
      description="Manage your professional career roadmap, corporate milestones, and development log entries."
      db={db}
      setDb={setDb}
      saveFile={saveFile}
      publishing={publishing}
      emptyItem={{ 
        title: "New Career Milestone", 
        duration: "2026 - Present", 
        description: "Brief description of responsibilities and achievements.", 
        ref: "", 
        link: "" 
      }}
      renderForm={(item, onChange) => (
        <div className="space-y-4">
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Job Title / Milestone Name
            </label>
            <input 
              type="text" 
              value={item.title} 
              onChange={e => onChange({ ...item, title: e.target.value })}
              className="w-full cyber-input font-bold"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
                Timeline Duration
              </label>
              <input 
                type="text" 
                value={item.duration} 
                onChange={e => onChange({ ...item, duration: e.target.value })}
                className="w-full cyber-input"
              />
            </div>
            <div>
              <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
                System Reference Tag (Optional)
              </label>
              <input 
                type="text" 
                value={item.ref || ""} 
                onChange={e => onChange({ ...item, ref: e.target.value })}
                className="w-full cyber-input font-mono-fira"
                placeholder="e.g. CORE_EXP_01"
              />
            </div>
          </div>
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Milestone Link URL (Optional)
            </label>
            {renderUrlInput(
              item.link || "",
              val => onChange({ ...item, link: val }),
              "https://..."
            )}
          </div>
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Detailed Description & Responsibilities
            </label>
            <textarea 
              rows={4}
              value={item.description} 
              onChange={e => onChange({ ...item, description: e.target.value })}
              className="w-full cyber-input resize-none leading-relaxed"
            />
          </div>
        </div>
      )}
    />
  );
}
