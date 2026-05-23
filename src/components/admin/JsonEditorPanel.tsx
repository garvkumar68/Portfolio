import React, { useState, useEffect } from "react";
import { RefreshCw, Save, AlertTriangle, Code2, Eye, Clipboard } from "lucide-react";
import { toast } from "sonner";
import { DBState, CMSFile } from "./types";

interface JsonEditorPanelProps {
  activeTab: string;
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
  onClose: () => void;
  onRefresh: () => void | Promise<void>;
  isRefreshing: boolean;
}

export function JsonEditorPanel({
  activeTab,
  db,
  setDb,
  saveFile,
  publishing,
  onClose,
  onRefresh,
  isRefreshing
}: JsonEditorPanelProps) {
  const isReadOnly = db[activeTab as keyof DBState]?.readOnly || false;

  const getInitialContent = () => {
    const content = db[activeTab as keyof DBState]?.content;

    if (activeTab === "compile_prompt_py") {
      return typeof content === "object" && content !== null && "code" in content ? (content as any).code : String(content || "");
    }
    return JSON.stringify(content || {}, null, 2);
  };

  const [jsonText, setJsonText] = useState(getInitialContent());
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Sync editor if activeTab changes
  useEffect(() => {
    setJsonText(getInitialContent());
    setJsonError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleJsonTextChange = (text: string) => {
    setJsonText(text);
    if (isReadOnly) {
      setJsonError(null);
      return;
    }
    try {
      if (!text.trim()) {
        throw new Error("JSON document cannot be empty.");
      }
      const parsed = JSON.parse(text);
      setJsonError(null);

      // Sync valid changes directly to the database state root
      setDb({
        ...db,
        [activeTab]: {
          ...db[activeTab as keyof DBState],
          content: parsed
        }
      });
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  const handleFormatJson = () => {
    if (isReadOnly) return;
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setJsonError(null);
      toast.success("Code formatted successfully!");
    } catch (err: any) {
      setJsonError(err.message);
      toast.error("Cannot format: Invalid JSON syntax.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    toast.success("Copied to clipboard!");
  };

  const handlePublish = async () => {
    if (isReadOnly) return;
    if (jsonError) {
      toast.error("Cannot save: Fix JSON syntax errors first.");
      return;
    }
    await saveFile(activeTab as CMSFile);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Code2 className="size-5 text-[#00ff88]" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              {activeTab === "compile_prompt_py" ? "compile_prompt.py" : activeTab.endsWith(".json") ? activeTab : `${activeTab}.json`}
            </h2>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1 text-muted-foreground hover:text-[#00ff88] hover:bg-white/5 border border-transparent hover:border-white/10 rounded transition-all cursor-pointer disabled:opacity-50"
              title="Refresh remote data"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin text-[#00ff88]' : ''}`} />
            </button>
            <span className={`text-[9px] font-mono-fira px-2 py-0.5 rounded-full border uppercase ${
              isReadOnly 
                ? "border-amber-500/20 text-amber-400 bg-amber-500/5" 
                : "border-red-500/20 text-red-400 bg-red-500/5"
            }`}>
              {isReadOnly ? "Read-Only Protected" : "Source Editor"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isReadOnly 
              ? "Viewing protected system file. Changes cannot be made directly in this interface."
              : "Directly edit raw database structures. Syntax validation is active to prevent database corruption."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {!isReadOnly && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 text-white text-xs font-bold rounded-lg transition-all uppercase cursor-pointer"
            >
              <Eye className="size-3.5" />
              <span>Visual Editor</span>
            </button>
          )}
          {!isReadOnly && (
            <button
              onClick={handleFormatJson}
              className="px-4 py-2 border border-[#00ff88]/20 hover:border-[#00ff88]/40 bg-[#00ff88]/5 text-[#00ff88] text-xs font-bold rounded-lg transition-all uppercase cursor-pointer"
            >
              Format
            </button>
          )}
          {!isReadOnly && (
            <button
              onClick={handlePublish}
              disabled={publishing !== null || jsonError !== null}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00ff88] hover:bg-[#00ff88]/90 disabled:bg-[#00ff88]/40 disabled:text-[#050505]/40 text-[#050505] text-xs font-bold rounded-lg shadow-[0_4px_20px_rgba(0,255,136,0.2)] transition-all uppercase cursor-pointer"
            >
              {publishing === activeTab ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              <span>Publish JSON</span>
            </button>
          )}
        </div>
      </div>

      {jsonError && (
        <div className="p-4 bg-red-950/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-mono tracking-wide flex items-start gap-2.5 animate-in slide-in-from-top-2 duration-300">
          <AlertTriangle className="size-4 shrink-0 mt-0.5 text-red-500" />
          <div>
            <div className="font-bold uppercase text-[9px] tracking-wider text-red-400">JSON Syntax Error Detected</div>
            <div className="mt-1 opacity-90 leading-relaxed">{jsonError}</div>
            <div className="mt-2 text-[9px] text-red-400/60 uppercase">Publishing is disabled until resolved.</div>
          </div>
        </div>
      )}

      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden flex flex-col relative">
        {/* Editor Controls Bar */}
        <div className="bg-white/[0.01] border-b border-white/5 px-4 py-2 flex items-center justify-between">
          <span className="text-[10px] font-mono-fira text-muted-foreground/60 uppercase tracking-widest">
            {activeTab === "compile_prompt_py" ? "File Buffer (Python UTF-8)" : "File Buffer (JSON UTF-8)"}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all cursor-pointer"
            title="Copy Code"
          >
            <Clipboard className="size-3.5" />
          </button>
        </div>

        {/* Text Area Code Editor */}
        <div className="p-4 bg-[#030303]/40 min-h-[500px] flex">
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonTextChange(e.target.value)}
            readOnly={isReadOnly}
            className="w-full min-h-[500px] bg-transparent border-0 text-white focus:outline-none focus:ring-0 leading-relaxed font-mono-fira text-xs resize-y"
            placeholder="{}"
            spellCheck={false}
            style={{
              fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
              outline: "none"
            }}
          />
        </div>
      </div>
    </div>
  );
}
