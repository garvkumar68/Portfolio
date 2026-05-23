import React, { useState } from "react";
import { Wrench, X, Layers, LayoutGrid, Plus, Trash, Tag, FolderTree, Zap } from "lucide-react";
import { toast } from "sonner";
import { DBState } from "./types";
import { CustomSelect } from "./helpers";

interface CustomSectionWizardProps {
  db: DBState;
  setDb: (db: DBState) => void;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  editSectionKey?: string;
  token?: string | null;
}

// Reusable toggle row
function ToggleRow({
  checked,
  onChange,
  label,
  description,
  color = "green"
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
  color?: "green" | "amber";
}) {
  const accent = color === "amber" ? "bg-amber-500" : "bg-[#00ff88]";
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-8 h-4 rounded-full transition-all duration-300 ${checked ? accent : "bg-white/10"}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${checked ? "left-[18px]" : "left-0.5"}`} />
        </div>
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-white group-hover:text-[#00ff88] transition-colors">{label}</div>
        <div className="text-[8px] text-muted-foreground/70 font-sans mt-0.5 leading-relaxed">{description}</div>
      </div>
    </label>
  );
}

type WizardMode = "content" | "system";

export function CustomSectionWizard({
  db,
  setDb,
  onClose,
  setActiveTab,
  editSectionKey,
  token
}: CustomSectionWizardProps) {
  const existing = editSectionKey ? db[editSectionKey] : null;

  // Derive initial mode from existing db flags
  const getInitialMode = (): WizardMode => {
    if (!existing) return "content";
    if (existing.isSystemFile) return "system";
    return "content";
  };

  const [wizardName, setWizardName] = useState(existing?.title || editSectionKey || "");
  const [wizardType, setWizardType] = useState<"list" | "object" | "tags" | "categories">(
    (existing?.type as any) || "list"
  );
  const [wizardFields, setWizardFields] = useState<Array<{ key: string; label: string; type: string }>>(
    existing?.schema?.length ? existing.schema : [{ key: "title", label: "Title", type: "string" }]
  );

  // Classification
  const [wizardMode, setWizardMode] = useState<WizardMode>(getInitialMode());
  // System file sub-options
  const [wizardReadOnly, setWizardReadOnly] = useState(existing?.readOnly ?? true);
  const [wizardSkipCompile, setWizardSkipCompile] = useState(
    // read from registry for existing sections
    (db["admin_config/json_structure"]?.content?.[editSectionKey!] as any)?.skipPromptCompile ?? true
  );

  const [isSaving, setIsSaving] = useState(false);

  const WORKER_BASE = "https://dodo-ai-agent.dodoai.workers.dev";

  const handleGenerateSection = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wizardName.trim()) {
      toast.error("Please enter a valid section name.");
      return;
    }
    const sectionKey = editSectionKey || wizardName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    if (!editSectionKey) {
      const registry = db["admin_config/json_structure"]?.content || {};
      const reservedKeys = Object.keys(registry).filter(k =>
        (registry[k] as any)?.isStandard || (registry[k] as any)?.isSystemFile
      );
      if (reservedKeys.includes(sectionKey)) {
        toast.error("This name conflicts with a reserved portfolio section.");
        return;
      }
      if (db[sectionKey]) {
        toast.error("A section with this name already exists.");
        return;
      }
    }

    const schema = wizardType === "tags" || wizardType === "categories" ? [] : wizardFields;
    const existingContent = existing?.content !== undefined
      ? existing.content
      : (wizardType === "list" || wizardType === "tags" ? []
        : wizardType === "categories" ? { categories: [] }
        : {});

    // Build db entry — only write flags that are true, never write false
    const dbEntry: Record<string, any> = {
      content: existingContent,
      sha: existing?.sha || "",
      title: wizardName.trim(),
      type: wizardType,
      schema,
      schemaSha: existing?.schemaSha || "",
    };
    // Content sections: no flags needed (they go to AI by default)
    // System files: isSystemFile + sub-options
    if (wizardMode === "system") {
      dbEntry.isSystemFile = true;
      dbEntry.readOnly = wizardReadOnly;
    }

    const newDb = { ...db };
    if (editSectionKey && editSectionKey !== sectionKey) {
      delete newDb[editSectionKey];
      if (token) {
        fetch(`${WORKER_BASE}/api/cms/delete`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ filename: editSectionKey })
        }).catch(err => console.error("Failed to delete renamed section:", err));
      }
    }
    newDb[sectionKey] = dbEntry as any;

    setDb(newDb);
    setActiveTab(sectionKey);
    onClose();
    toast.success(editSectionKey ? `Section "${wizardName}" updated!` : `Section "${wizardName}" created!`);

    // Save to GitHub immediately
    if (token) {
      setIsSaving(true);
      try {
        // 1. Save content file
        await fetch(`${WORKER_BASE}/api/cms/save`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ filename: sectionKey, content: existingContent })
        });

        // 2. Rebuild registry — only write flags that are explicitly true, never false
        const existingRegistry = newDb["admin_config/json_structure"]?.content || {};
        const jsonStructure: Record<string, any> = {};
        for (const key of Object.keys(newDb)) {
          if (key === "admin_config/json_structure" || key === "dodo_prompt") continue;
          const prev = (existingRegistry[key] || {}) as Record<string, any>;
          const entry: Record<string, any> = {
            title:  newDb[key].title || key,
            type:   newDb[key].type  || "list",
            schema: newDb[key].schema || [],
          };
          // Only write flags when true — merge from prev registry and current db state
          const isStandard    = newDb[key].isStandard  ?? prev.isStandard;
          const isSystemFile  = newDb[key].isSystemFile ?? prev.isSystemFile;
          const readOnly      = newDb[key].readOnly     ?? prev.readOnly;
          const skipCompile   = key === sectionKey
            ? (wizardMode === "system" ? wizardSkipCompile : undefined)
            : prev.skipPromptCompile;

          if (isStandard)   entry.isStandard      = true;
          if (isSystemFile) entry.isSystemFile    = true;
          if (isSystemFile && readOnly !== undefined) entry.readOnly = readOnly;
          if (skipCompile)  entry.skipPromptCompile = true;

          jsonStructure[key] = entry;
        }

        await fetch(`${WORKER_BASE}/api/cms/save`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ filename: "admin_config/json_structure", content: jsonStructure })
        });
        toast.success(`"${wizardName}" saved to GitHub!`);
      } catch (err: any) {
        toast.error(err.message || "Failed to save section to GitHub.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const MODE_OPTIONS: { id: WizardMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: "content",
      label: "Content Section",
      desc: "Portfolio content that gets included in the AI prompt. Fully deletable from GitHub.",
      icon: <Layers className="size-3.5" />,
    },
    {
      id: "system",
      label: "System / Tooling File",
      desc: "Infrastructure file not included in AI. Appears in System & Tooling group. Configure read-only and compile options below.",
      icon: <Zap className="size-3.5" />,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-xl rounded-3xl border border-[#00ff88]/30 bg-[#080808]/95 overflow-hidden shadow-[0_0_50px_rgba(0,255,136,0.15)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Wrench className="size-4 text-[#00ff88]" />
            <span className="text-xs font-bold tracking-widest uppercase text-white font-mono-fira">
              {editSectionKey ? "Edit Section" : "New Section"}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all">
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section Name */}
          <div className="space-y-1.5">
            <label className="block text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Section Name</label>
            <input
              type="text"
              value={wizardName}
              onChange={(e) => setWizardName(e.target.value)}
              placeholder="e.g. Certifications, Publications"
              className="w-full cyber-input font-sans text-sm font-bold text-white placeholder-white/20"
            />
          </div>

          {/* Layout Structure */}
          <div className="space-y-1.5">
            <label className="block text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Layout Structure Type</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "list",       icon: <Layers className="size-4 shrink-0" />,      label: "List of Items",            desc: "A timeline or collection layout (e.g. certificates, coursework)." },
                { val: "object",     icon: <LayoutGrid className="size-4 shrink-0" />,   label: "Single Config Object",     desc: "A single block of key-value configuration items." },
                { val: "tags",       icon: <Tag className="size-4 shrink-0" />,          label: "Tech Stack / Tag Cloud",   desc: "A flat layout of draggable badge tags." },
                { val: "categories", icon: <FolderTree className="size-4 shrink-0" />,   label: "Skills Matrix / Tiered",   desc: "A nested categories-and-items structure with metrics." },
              ].map(({ val, icon, label, desc }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setWizardType(val as any)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-1.5 ${
                    wizardType === val
                      ? "bg-[#00ff88]/5 border-[#00ff88]/20 text-[#00ff88]"
                      : "bg-white/[0.005] border-white/5 text-muted-foreground hover:bg-white/[0.02]"
                  }`}
                >
                  {icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                  <span className="text-[8px] leading-normal font-sans opacity-70">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Field Builder */}
          {(wizardType === "list" || wizardType === "object") && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Define Fields & Data Types</span>
                <button
                  type="button"
                  onClick={() => setWizardFields([...wizardFields, { key: `field_${Date.now()}`, label: "New Field", type: "string" }])}
                  className="flex items-center gap-1 text-[9px] font-bold text-[#00ff88] hover:text-[#00ff88]/80 uppercase tracking-widest cursor-pointer"
                >
                  <Plus className="size-3" /> Add Field
                </button>
              </div>
              <div className="space-y-3">
                {wizardFields.map((field, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-white/[0.005] border border-white/5 rounded-2xl animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex-1 w-full space-y-1">
                      <span className="text-[8px] font-mono text-muted-foreground tracking-widest uppercase">Display Label</span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...wizardFields];
                          const newLabel = e.target.value;
                          updated[index] = { ...updated[index], label: newLabel, key: newLabel.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "") };
                          setWizardFields(updated);
                        }}
                        className="w-full cyber-input text-xs font-sans"
                        placeholder="Field Label"
                      />
                    </div>
                    <div className="w-full sm:w-44 space-y-1">
                      <span className="text-[8px] font-mono text-muted-foreground tracking-widest uppercase">Input Type</span>
                      <CustomSelect
                        value={field.type}
                        onChange={(val) => {
                          const updated = [...wizardFields];
                          updated[index] = { ...updated[index], type: val };
                          setWizardFields(updated);
                        }}
                        options={[
                          { value: "string", label: "Plain Text" },
                          { value: "longtext", label: "Biography / Textarea" },
                          { value: "url", label: "URL with live preview" },
                          { value: "percentage", label: "Percentage Slider" },
                          { value: "number", label: "Numeric Value" },
                          { value: "boolean", label: "Toggle Switch" }
                        ]}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (wizardFields.length <= 1) { toast.error("A section must contain at least one field."); return; }
                        setWizardFields(wizardFields.filter((_, i) => i !== index));
                      }}
                      className="mt-5 p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 border border-white/10 hover:border-red-500/20 transition-all self-end shrink-0 cursor-pointer"
                    >
                      <Trash className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Classification ── */}
          <div className="border border-white/5 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 bg-white/[0.01] border-b border-white/5">
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Section Classification</span>
            </div>
            <div className="px-4 py-3 space-y-2">
              {MODE_OPTIONS.map(({ id, label, desc, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setWizardMode(id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 ${
                    wizardMode === id
                      ? "bg-[#00ff88]/5 border-[#00ff88]/20"
                      : "bg-white/[0.005] border-white/5 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 ${wizardMode === id ? "text-[#00ff88]" : "text-muted-foreground"}`}>
                    {icon}
                  </div>
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${wizardMode === id ? "text-[#00ff88]" : "text-white"}`}>
                      {label}
                    </div>
                    <div className="text-[8px] text-muted-foreground/70 font-sans mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                  {/* Radio dot */}
                  <div className={`ml-auto mt-1 shrink-0 size-3 rounded-full border-2 transition-all ${
                    wizardMode === id ? "border-[#00ff88] bg-[#00ff88]" : "border-white/20 bg-transparent"
                  }`} />
                </button>
              ))}
            </div>

            {/* System File sub-options */}
            {wizardMode === "system" && (
              <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5 bg-amber-500/[0.02]">
                <div className="text-[9px] font-mono text-amber-400/60 uppercase tracking-widest pt-2">System File Options</div>
                <ToggleRow
                  checked={wizardReadOnly}
                  onChange={setWizardReadOnly}
                  color="amber"
                  label="Read Only"
                  description="Disable direct JSON editing in the editor. Use this for compiler output or files managed by another UI."
                />
                <ToggleRow
                  checked={wizardSkipCompile}
                  onChange={setWizardSkipCompile}
                  color="amber"
                  label="Skip Prompt Compile"
                  description="Exclude this file from the prompt compiler source list. Enable for tooling/config files not meant for AI context."
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex gap-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleGenerateSection(e)}
            className="flex-1 py-3 bg-[#00ff88] hover:bg-[#00ff88]/90 text-[#050505] text-xs font-bold rounded-xl shadow-[0_4px_20px_rgba(0,255,136,0.2)] transition-all uppercase cursor-pointer"
          >
            {editSectionKey ? "Update Schema" : isSaving ? "Saving to GitHub..." : "Generate Section"}
          </button>
        </div>
      </div>
    </div>
  );
}
