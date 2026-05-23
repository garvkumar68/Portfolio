import React from "react";
import { DBState, CMSFile } from "./types";
import { ListEditor } from "./ListEditor";
import { renderUrlInput } from "./helpers";

interface ProjectsPanelProps {
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
}

export function ProjectsPanel({
  db,
  setDb,
  saveFile,
  publishing
}: ProjectsPanelProps) {
  return (
    <ListEditor 
      fileKey="projects"
      title="projects.json"
      description="Manage your production projects, personal tools, models, and application showcases."
      db={db}
      setDb={setDb}
      saveFile={saveFile}
      publishing={publishing}
      emptyItem={{ 
        title: "New Project", 
        description: "Brief description of project specs, technologies used, and outcomes.", 
        link: "", 
        imgUrl: "" 
      }}
      renderForm={(item, onChange) => (
        <div className="space-y-4">
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Project Title
            </label>
            <input 
              type="text" 
              value={item.title} 
              onChange={e => onChange({ ...item, title: e.target.value })}
              className="w-full cyber-input font-bold"
            />
          </div>
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Repository / Live Link URL
            </label>
            {renderUrlInput(
              item.link || "",
              val => onChange({ ...item, link: val }),
              "https://github.com/..."
            )}
          </div>
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Banner Image URL
            </label>
            {renderUrlInput(
              item.imgUrl || "",
              val => onChange({ ...item, imgUrl: val }),
              "https://cloudinary.com/..."
            )}
          </div>
          <div>
            <label className="block text-muted-foreground mb-1 text-[10px] uppercase font-semibold">
              Project Overview & Architecture Details
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
