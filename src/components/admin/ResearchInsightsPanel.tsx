import React from "react";
import { DBState, CMSFile } from "./types";
import { ListEditor } from "./ListEditor";
import { renderUrlInput } from "./helpers";

interface ResearchInsightsPanelProps {
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
}

export function ResearchInsightsPanel({
  db,
  setDb,
  saveFile,
  publishing
}: ResearchInsightsPanelProps) {
  return (
    <ListEditor 
      fileKey="researchInsights"
      title="researchInsights.json"
      description="Manage your published scientific papers, patents, analytical breakdowns, and deep research insights."
      db={db}
      setDb={setDb}
      saveFile={saveFile}
      publishing={publishing}
      emptyItem={{ 
        title: "New Research Insight", 
        description: "Brief description of the research methodology, findings, and publications.", 
        link: "" 
      }}
      renderForm={(item, onChange) => (
        <div className="space-y-4">
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Research / Article Title
            </label>
            <input 
              type="text" 
              value={item.title} 
              onChange={e => onChange({ ...item, title: e.target.value })}
              className="w-full cyber-input font-bold"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
                Publication / Article Link URL
              </label>
              {renderUrlInput(
                item.link || "",
                val => onChange({ ...item, link: val }),
                "https://taylorandfrancis.com/..."
              )}
            </div>
            <div>
              <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
                Year of Publishing
              </label>
              <input 
                type="text" 
                value={item.year || ""} 
                onChange={e => onChange({ ...item, year: e.target.value })}
                placeholder="e.g. 2023"
                className="w-full cyber-input"
              />
            </div>
          </div>
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Research Overview & Academic Abstract
            </label>
            <textarea 
              rows={5}
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
