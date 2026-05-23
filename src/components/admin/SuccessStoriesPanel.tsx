import React from "react";
import { DBState, CMSFile } from "./types";
import { ListEditor } from "./ListEditor";
import { renderUrlInput } from "./helpers";

interface SuccessStoriesPanelProps {
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
}

export function SuccessStoriesPanel({
  db,
  setDb,
  saveFile,
  publishing
}: SuccessStoriesPanelProps) {
  return (
    <ListEditor 
      fileKey="successStories"
      title="successStories.json"
      description="Manage your competitive trophies, hackathon wins, and professional success stories."
      db={db}
      setDb={setDb}
      saveFile={saveFile}
      publishing={publishing}
      emptyItem={{ 
        title: "New Achievement Milestone", 
        description: "Details of the achievement, hackathon challenge details, and success stats.", 
        link: "", 
        imgUrl: "" 
      }}
      renderForm={(item, onChange) => (
        <div className="space-y-4">
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Achievement Title
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
                Trophy / Project Link
              </label>
              {renderUrlInput(
                item.link || "",
                val => onChange({ ...item, link: val }),
                "https://..."
              )}
            </div>
            <div>
              <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
                Badge / Event Image URL (Optional)
              </label>
              {renderUrlInput(
                item.imgUrl || "",
                val => onChange({ ...item, imgUrl: val }),
                "https://..."
              )}
            </div>
          </div>
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Victory Details & Analytical Breakdown
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
