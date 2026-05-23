import React from "react";
import { RefreshCw, Save } from "lucide-react";
import { DBState, CMSFile } from "./types";
import { renderDynamicObjectEditor } from "./helpers";

interface ObjectTabPanelProps {
  fileKey: CMSFile;
  title: string;
  description: string;
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
}

export function ObjectTabPanel({
  fileKey,
  title,
  description,
  db,
  setDb,
  saveFile,
  publishing
}: ObjectTabPanelProps) {
  const content = db[fileKey]?.content || {};

  const handleChange = (newVal: any) => {
    setDb({
      ...db,
      [fileKey]: {
        ...db[fileKey],
        content: newVal
      }
    });
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
          {publishing === fileKey ? (
            <RefreshCw className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          Publish Changes
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-6">
        {renderDynamicObjectEditor(content, handleChange)}
      </div>
    </div>
  );
}
