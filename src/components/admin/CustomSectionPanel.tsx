import React, { useState } from "react";
import { RefreshCw, Save, Layers, Settings, Plus, Trash, X, Tag, FolderTree } from "lucide-react";
import { DBState, CMSFile } from "./types";
import { CustomListEditor } from "./CustomListEditor";
import { CustomSectionWizard } from "./CustomSectionWizard";
import { renderUrlInput, CustomSelect } from "./helpers";
import { toast } from "sonner";
import { ConfirmModal } from "./ConfirmModal";

function getNestedValue(obj: any, path: string): any {
  if (!obj) return undefined;
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === null || typeof current !== "object" || current[part] === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function setNestedValue(obj: any, path: string, value: any): any {
  const parts = path.split(".");
  const newObj = { ...obj };
  let current = newObj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = current[part] && typeof current[part] === "object" ? { ...current[part] } : {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
  return newObj;
}



interface CustomSectionPanelProps {
  activeTab: string;
  db: DBState;
  setDb: (db: DBState) => void;
  saveFile: (fileKey: CMSFile) => Promise<void>;
  publishing: string | null;
  handleDeleteCustomSection: (sectionKey: string) => void;
  token: string | null;
  onRefresh: () => void | Promise<void>;
  isRefreshing: boolean;
}

export function CustomSectionPanel({
  activeTab,
  db,
  setDb,
  saveFile,
  publishing,
  handleDeleteCustomSection,
  token,
  onRefresh,
  isRefreshing
}: CustomSectionPanelProps) {
  const [showEditSchema, setShowEditSchema] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);

  const [formatMap, setFormatMap] = useState<Record<string, "percent" | "out10" | "custom" | "tier">>({});
  const [customMaxMap, setCustomMaxMap] = useState<Record<string, number>>({});
  const [activeOpenSelect, setActiveOpenSelect] = useState<string | null>(null);
  
  const getSkillFormat = (skill: any, key: string) => {
    if (skill?.format) return skill.format;
    if (formatMap[key]) return formatMap[key];
    const progress = skill?.progress || 0;
    if (typeof progress === 'string' || progress === 95 || progress === 80 || progress === 60 || progress === 40) return "tier";
    return "percent";
  };

  const getCustomMax = (skill: any, key: string) => {
    if (skill?.customMax !== undefined) return skill.customMax;
    return customMaxMap[key] || 100;
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });
  
  // Field Creation States
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldType, setNewFieldType] = useState<"string" | "longtext" | "url" | "percentage" | "number" | "boolean" | "list">("string");

  let inferredSchema = db[activeTab]?.schema || [];
  if (inferredSchema.length === 0 && db[activeTab]?.content) {
    const content = db[activeTab].content;
    const inferFields = (obj: any): any[] => {
      return Object.keys(obj).map(k => {
        let fieldType = typeof obj[k] === "number" ? "number" : typeof obj[k] === "boolean" ? "boolean" : (typeof obj[k] === "string" && obj[k].startsWith("http") ? "url" : (typeof obj[k] === "string" && obj[k].length > 100 ? "longtext" : "string"));
        let subSchema: any[] = [];
        if (Array.isArray(obj[k])) {
          fieldType = "list";
          if (obj[k].length > 0 && typeof obj[k][0] === "object" && obj[k][0]) {
            subSchema = inferFields(obj[k][0]);
          } else {
            subSchema = [{ key: "title", label: "Title", type: "string" }];
          }
        }
        return {
          key: k,
          label: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1').trim(),
          type: fieldType,
          ...(fieldType === "list" ? { subSchema } : {})
        };
      });
    };
    if (typeof content === "object" && !Array.isArray(content)) {
      inferredSchema = inferFields(content);
    } else if (Array.isArray(content) && content.length > 0 && typeof content[0] === "object" && content[0]) {
      inferredSchema = inferFields(content[0]);
    }
  }

  const section = db[activeTab] ? {
    title: db[activeTab].title || activeTab,
    type: db[activeTab].type || (db[activeTab].content && typeof db[activeTab].content === "object" && !Array.isArray(db[activeTab].content) ? "object" : "list"),
    schema: inferredSchema
  } : null;

  if (!section) return null;

  const handleCustomSectionSave = () => {
    saveFile(activeTab as CMSFile);
  };

  const updateCustomContent = (newContent: any) => {
    setDb({
      ...db,
      [activeTab]: {
        ...db[activeTab],
        content: newContent
      }
    });
  };

  const handleAddFieldSubmit = () => {
    if (!newFieldLabel.trim()) {
      toast.error("Please enter a field label.");
      return;
    }
    if (!newFieldKey.trim()) {
      toast.error("Invalid field key generated.");
      return;
    }
    
    const schema = section.schema || [];
    if (schema.some((f: any) => f.key === newFieldKey)) {
      toast.error("A field with this name already exists in this section.");
      return;
    }

    const newField = {
      key: newFieldKey,
      label: newFieldLabel.trim(),
      type: newFieldType
    };

    const newSchema = [...schema, newField];

    let updatedContent = db[activeTab]?.content;
    if (section.type === "object") {
      const defaultVal = newFieldType === "percentage" || newFieldType === "number" ? 0 : newFieldType === "boolean" ? false : "";
      updatedContent = { ...(db[activeTab]?.content || {}), [newFieldKey]: defaultVal };
    }

    setDb({
      ...db,
      [activeTab]: {
        ...db[activeTab],
        schema: newSchema,
        content: updatedContent
      }
    });

    setNewFieldLabel("");
    setNewFieldKey("");
    setNewFieldType("string");
    setShowAddFieldModal(false);
    toast.success(`Field "${newFieldLabel}" added to schema!`);
  };

  const handleDeleteField = (fieldKey: string, fieldLabel: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Field From Schema",
      message: `Are you sure you want to permanently delete field "${fieldLabel}"? This will erase its value for all entries in the database.`,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        const newSchema = (section.schema || []).filter((f: any) => f.key !== fieldKey);
        let newContent = db[activeTab]?.content;

        if (section.type === "object") {
          newContent = { ...(db[activeTab]?.content || {}) };
          delete newContent[fieldKey];
        } else if (section.type === "list") {
          newContent = (db[activeTab]?.content || []).map((item: any) => {
            const updatedItem = { ...item };
            delete updatedItem[fieldKey];
            return updatedItem;
          });
        }

        setDb({
          ...db,
          [activeTab]: {
            ...db[activeTab],
            schema: newSchema,
            content: newContent
          }
        });

        toast.success(`Removed field "${fieldLabel}" from schema.`);
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1 text-muted-foreground hover:text-[#00ff88] hover:bg-white/5 border border-transparent hover:border-white/10 rounded transition-all cursor-pointer disabled:opacity-50"
              title="Refresh remote data"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin text-[#00ff88]' : ''}`} />
            </button>
            <span className="text-[9px] font-mono-fira px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground uppercase bg-white/[0.02]">
              {section.type === "list" 
                ? "Dynamic List" 
                : section.type === "categories" 
                  ? "Skills Matrix" 
                  : section.type === "tags" 
                    ? "Tech Stack" 
                    : "Single Config"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Stored independently on GitHub as <span className="font-mono-fira text-[#00ff88]">{activeTab}.json</span>.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEditSchema(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-[#00ff88]/20 bg-[#00ff88]/5 hover:bg-[#00ff88]/10 text-[#00ff88] text-xs font-bold rounded-lg transition-all uppercase cursor-pointer"
          >
            <Settings className="size-3.5" />
            <span>Configure Layout</span>
          </button>
          <button
            onClick={() => handleDeleteCustomSection(activeTab)}
            className="px-4 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-bold rounded-lg transition-all uppercase cursor-pointer"
          >
            Delete Section
          </button>
          <button
            onClick={handleCustomSectionSave}
            disabled={publishing !== null}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00ff88] hover:bg-[#00ff88]/90 disabled:bg-[#00ff88]/40 text-[#050505] text-xs font-bold rounded-lg shadow-[0_4px_20px_rgba(0,255,136,0.2)] transition-all uppercase cursor-pointer"
          >
            {publishing === activeTab ? <RefreshCw className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Publish Changes
          </button>
        </div>
      </div>

      {/* If Section Type is Object */}
      {section.type === "object" && (
        <div className="glass-card rounded-2xl p-6 w-full">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
            <div className="flex items-center gap-3">
              <Layers className="size-4 text-[#00ff88]" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-white">Configure Fields</h3>
            </div>
            <button
              onClick={() => setShowAddFieldModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ff88]/5 hover:bg-[#00ff88]/10 text-[#00ff88] text-[10px] font-bold uppercase rounded-lg border border-[#00ff88]/20 transition-all cursor-pointer animate-pulse-glow"
            >
              <Plus className="size-3" />
              <span>Add Field</span>
            </button>
          </div>
          
          {(!section.schema || section.schema.length === 0) ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-mono-fira uppercase tracking-wider">
              No fields configured. Click "Add Field" to define data attributes.
            </div>
          ) : (
            <div className="space-y-5">
              {section.schema?.map((field: any) => {
                const val = getNestedValue(db[activeTab]?.content, field.key);
                const handleObjectFieldChange = (newVal: any) => {
                  const updatedContent = setNestedValue(db[activeTab]?.content || {}, field.key, newVal);
                  updateCustomContent(updatedContent);
                };

                return (
                  <div key={field.key} className="space-y-1.5 p-3.5 bg-white/[0.005] border border-white/5 rounded-2xl relative group">
                    <div className="flex items-center justify-between">
                      <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">
                        {field.label}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleDeleteField(field.key, field.label)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-1 rounded hover:bg-white/5 cursor-pointer"
                        title="Delete Field"
                      >
                        <Trash className="size-3.5" />
                      </button>
                    </div>

                    {field.type === "string" && (
                      <input
                        type="text"
                        value={val || ""}
                        onChange={(e) => handleObjectFieldChange(e.target.value)}
                        className="w-full cyber-input font-sans"
                      />
                    )}

                    {field.type === "longtext" && (
                      <textarea
                        rows={5}
                        value={val || ""}
                        onChange={(e) => handleObjectFieldChange(e.target.value)}
                        className="w-full cyber-input font-sans leading-relaxed resize-none"
                      />
                    )}

                    {field.type === "url" && (
                      renderUrlInput(
                        val || "",
                        handleObjectFieldChange,
                        `Enter ${field.label.toLowerCase()}`
                      )
                    )}

                    {field.type === "percentage" && (
                      <div className="space-y-1.5 mt-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono-fira text-[#00ff88]">{val || 0}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={val || 0}
                          onChange={(e) => handleObjectFieldChange(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                        />
                      </div>
                    )}

                    {field.type === "number" && (
                      <input
                        type="number"
                        value={val !== undefined ? val : 0}
                        onChange={(e) => handleObjectFieldChange(parseFloat(e.target.value) || 0)}
                        className="w-full cyber-input font-mono-fira"
                      />
                    )}

                    {field.type === "boolean" && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono-fira text-muted-foreground uppercase">{val ? "Enabled" : "Disabled"}</span>
                        <button
                          type="button"
                          onClick={() => handleObjectFieldChange(!val)}
                          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            val ? "bg-[#00ff88]" : "bg-white/10"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                              val ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    )}

                    {field.type === "list" && (
                      <div className="mt-4 -mx-1 -mb-1 overflow-hidden border border-white/10 rounded-xl bg-[#030303] shadow-inner">
                        <CustomListEditor
                          schema={field.subSchema || []}
                          content={Array.isArray(val) ? val : []}
                          onChange={(newList) => handleObjectFieldChange(newList)}
                          renderUrlInput={renderUrlInput}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* If Section Type is List of Items */}
      {section.type === "list" && (
        <div className="space-y-6">
          {/* Schema Fields Summary for lists */}
          <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5 bg-white/[0.01]">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Layers className="size-3.5 text-[#00ff88]" />
                Schema Fields Configuration
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(!section.schema || section.schema.length === 0) ? (
                  <span className="text-[9px] font-mono text-muted-foreground/60 italic">No fields defined yet. Click "Add Field" to start.</span>
                ) : (
                  section.schema.map((f: any) => (
                    <span key={f.key} className="text-[9px] font-mono-fira bg-white/5 border border-white/10 px-2 py-0.5 rounded-lg text-muted-foreground flex items-center gap-1.5 hover:border-red-500/30 group/tag transition-all">
                      <span>{f.label}</span>
                      <span className="opacity-40">({f.type})</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteField(f.key, f.label)}
                        className="text-muted-foreground hover:text-red-400 font-bold ml-0.5 cursor-pointer text-xs"
                        title="Delete Field"
                      >
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => setShowAddFieldModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#00ff88]/20 bg-[#00ff88]/5 hover:bg-[#00ff88]/10 text-[#00ff88] text-xs font-bold rounded-lg transition-all uppercase cursor-pointer self-start sm:self-auto"
            >
              <Plus className="size-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <CustomListEditor
            schema={section.schema || []}
            content={db[activeTab]?.content || []}
            onChange={updateCustomContent}
            renderUrlInput={renderUrlInput}
          />
        </div>
      )}

      {/* If Section Type is Tags (Tag Cloud) */}
      {section.type === "tags" && (
        <div className="glass-card rounded-2xl p-6 space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <Tag className="size-4 text-[#00ff88]" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-white">{section.title} Tags Cloud</h3>
            </div>
            {(db[activeTab]?.content || []).length > 0 && (
              <button
                onClick={() => {
                  updateCustomContent([]);
                  toast.success("All tags cleared.");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg uppercase transition-all cursor-pointer"
              >
                <Trash className="size-3" /> Clear All
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div 
              className="flex flex-wrap gap-2.5 p-5 bg-white/[0.007] border border-white/5 rounded-2xl min-h-[120px] items-center content-start transition-all duration-300"
            >
              {(db[activeTab]?.content || []).length > 0 ? (
                (db[activeTab]?.content || []).map((tag: string, idx: number) => (
                  <div
                    key={idx}
                    className="group relative flex items-center gap-2 px-3 py-1.5 bg-[#00ff88]/5 border border-[#00ff88]/20 hover:border-[#00ff88] text-white hover:text-[#00ff88] text-xs font-bold rounded-xl active-tab-glow transition-all duration-300 scale-100 hover:scale-105 active:scale-95 shadow-[0_2px_10px_rgba(0,255,136,0.02)]"
                  >
                    <span className="font-mono-fira text-[11px] tracking-wide uppercase">{tag}</span>
                    <button
                      onClick={() => {
                        const newTags = [...(db[activeTab]?.content || [])];
                        newTags.splice(idx, 1);
                        updateCustomContent(newTags);
                        toast.success(`Removed ${tag}`);
                      }}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-white/5 cursor-pointer"
                      title={`Remove ${tag}`}
                    >
                      <svg className="size-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-8 text-muted-foreground text-xs font-mono-fira uppercase tracking-wider animate-pulse">
                  🛠️ Tags list is empty. Add items below!
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5">
              <label className="block text-muted-foreground mb-2 text-[10px] uppercase font-semibold tracking-wider">
                Add New Tag
              </label>
              <div className="flex gap-3 max-w-md">
                <input
                  type="text"
                  id="new-tag-input"
                  placeholder="e.g. Next.js, PyTorch, Kubernetes"
                  className="flex-1 cyber-input font-bold"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const inputEl = e.currentTarget;
                      const val = inputEl.value.trim().toUpperCase();
                      if (val) {
                        const currentTags = db[activeTab]?.content || [];
                        if (currentTags.includes(val)) {
                          toast.error(`${val} is already in the tags!`);
                          return;
                        }
                        const newTags = [...currentTags, val];
                        updateCustomContent(newTags);
                        inputEl.value = "";
                        toast.success(`Added ${val}!`);
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const inputEl = document.getElementById("new-tag-input") as HTMLInputElement;
                    const val = inputEl?.value.trim().toUpperCase();
                    if (val) {
                      const currentTags = db[activeTab]?.content || [];
                      if (currentTags.includes(val)) {
                        toast.error(`${val} is already in the tags!`);
                        return;
                      }
                      const newTags = [...currentTags, val];
                      updateCustomContent(newTags);
                      inputEl.value = "";
                      toast.success(`Added ${val}!`);
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
      )}

      {/* If Section Type is Categories (Matrix/Tiers) */}
      {section.type === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-3">
              <FolderTree className="size-4 text-[#00ff88]" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-white">{section.title} Categories</h3>
            </div>
            <button
              onClick={() => {
                const currentData = db[activeTab]?.content || { categories: [] };
                const newCategories = [...(currentData.categories || [])];
                newCategories.push({ title: "New Category", skills: [] });
                updateCustomContent({ ...currentData, categories: newCategories });
                toast.success("Added new category.");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ff88]/5 hover:bg-[#00ff88]/10 text-[#00ff88] text-[10px] font-bold uppercase rounded-lg border border-[#00ff88]/20 transition-all cursor-pointer animate-pulse-glow"
            >
              <Plus className="size-3" />
              <span>Add Category</span>
            </button>
          </div>

          {(!(db[activeTab]?.content?.categories) || db[activeTab].content.categories.length === 0) ? (
            <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground text-xs font-mono-fira uppercase tracking-wider">
              No categories configured. Click "Add Category" to get started.
            </div>
          ) : (
            <div className="space-y-6">
              {(db[activeTab].content.categories || []).map((cat: any, catIdx: number) => {
                const isCategoryActive = activeOpenSelect?.startsWith(`${catIdx}-`);
                return (
                  <div
                    key={catIdx}
                    className={`glass-card rounded-2xl p-6 border border-white/5 bg-white/[0.005] space-y-4 relative transition-all duration-200 ${
                      isCategoryActive ? "z-30" : "z-10"
                    }`}
                  >
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 gap-4">
                    <div className="flex-1 max-w-sm">
                      <input
                        type="text"
                        value={cat.title || ""}
                        placeholder="Category Title"
                        onChange={(e) => {
                          const currentData = db[activeTab].content;
                          const newCats = [...currentData.categories];
                          newCats[catIdx] = { ...newCats[catIdx], title: e.target.value };
                          updateCustomContent({ ...currentData, categories: newCats });
                        }}
                        className="cyber-input font-bold text-sm w-full"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const currentData = db[activeTab].content;
                          const newCats = [...currentData.categories];
                          newCats[catIdx].skills.push({ name: "New Skill", progress: 80, format: "percent" });
                          updateCustomContent({ ...currentData, categories: newCats });
                          toast.success("Added new item to category.");
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#00ff88]/5 hover:bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-bold rounded-lg uppercase transition-all animate-none cursor-pointer"
                      >
                        <Plus className="size-3" /> Add Item
                      </button>
                      <button
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: "Delete Category Sector",
                            message: `Are you sure you want to permanently delete category "${cat.title || 'unnamed'}"? This will delete all skills/items under this category.`,
                            onConfirm: () => {
                              setConfirmModal(prev => ({ ...prev, isOpen: false }));
                              const currentData = db[activeTab].content;
                              const newCats = currentData.categories.filter((_: any, idx: number) => idx !== catIdx);
                              updateCustomContent({ ...currentData, categories: newCats });
                              toast.success("Category deleted.");
                            }
                          });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-red-500/20 hover:border-red-500 hover:bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg uppercase transition-all cursor-pointer"
                      >
                        <Trash className="size-3" /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Skills List */}
                  {(!cat.skills || cat.skills.length === 0) ? (
                    <div className="py-4 text-center text-muted-foreground text-[10px] font-mono-fira uppercase tracking-wider">
                      No items in this category yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.skills.map((skill: any, skillIdx: number) => {
                        const isDropdownActive = activeOpenSelect === `${catIdx}-${skillIdx}`;
                        return (
                          <div
                            key={skillIdx}
                            className={`p-3 bg-white/[0.005] border rounded-2xl flex flex-col gap-2 relative group transition-all duration-200 ${
                              isDropdownActive 
                                ? "z-40 border-[#00ff88]/30 bg-[#070707] shadow-[0_0_20px_rgba(0,255,136,0.04)]" 
                                : "border-white/5 z-10"
                            }`}
                          >
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: "Remove Skill Item",
                                  message: `Are you sure you want to remove the skill item "${skill.name || 'unnamed'}" from this category?`,
                                  onConfirm: () => {
                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                    const currentData = db[activeTab].content;
                                    const newCats = [...currentData.categories];
                                    newCats[catIdx].skills = newCats[catIdx].skills.filter((_: any, idx: number) => idx !== skillIdx);
                                    updateCustomContent({ ...currentData, categories: newCats });
                                    toast.success("Item removed.");
                                  }
                                });
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-1 rounded hover:bg-white/5 cursor-pointer"
                              title="Remove Item"
                            >
                              <Trash className="size-3" />
                            </button>

                            <div className="space-y-1">
                              <span className="text-[8px] font-mono text-muted-foreground tracking-widest uppercase">Name</span>
                              <input
                                type="text"
                                value={skill.name || ""}
                                placeholder="e.g. Python"
                                onChange={(e) => {
                                  const currentData = db[activeTab].content;
                                  const newCats = [...currentData.categories];
                                  newCats[catIdx].skills[skillIdx] = { ...newCats[catIdx].skills[skillIdx], name: e.target.value };
                                  updateCustomContent({ ...currentData, categories: newCats });
                                }}
                                className="cyber-input text-xs w-full font-bold"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="space-y-1">
                                <span className="text-[8px] font-mono text-muted-foreground tracking-widest uppercase">Format</span>
                                <CustomSelect
                                  value={getSkillFormat(skill, `${catIdx}-${skillIdx}`)}
                                  onOpenChange={(open) => {
                                    if (open) setActiveOpenSelect(`${catIdx}-${skillIdx}`);
                                    else if (activeOpenSelect === `${catIdx}-${skillIdx}`) setActiveOpenSelect(null);
                                  }}
                                  onChange={(val) => {
                                    const format = val as any;
                                    setFormatMap({ ...formatMap, [`${catIdx}-${skillIdx}`]: format });
                                    
                                    let newProgress: any = skill.progress || 0;
                                    if (format === "tier") {
                                      newProgress = "expert";
                                    }
                                    const currentData = db[activeTab].content;
                                    const newCats = [...currentData.categories];
                                    newCats[catIdx].skills[skillIdx] = { 
                                      ...newCats[catIdx].skills[skillIdx], 
                                      progress: newProgress,
                                      format: format
                                    };
                                    updateCustomContent({ ...currentData, categories: newCats });
                                  }}
                                  options={[
                                    { value: "percent", label: "Percentage (%)" },
                                    { value: "out10", label: "Out of 10" },
                                    { value: "custom", label: "Custom Max" },
                                    { value: "tier", label: "Expertise Tier" }
                                  ]}
                                />
                              </div>

                              <div className="space-y-1">
                                <span className="text-[8px] font-mono text-muted-foreground tracking-widest uppercase">Value</span>
                                {getSkillFormat(skill, `${catIdx}-${skillIdx}`) === "tier" ? (
                                  <CustomSelect
                                    value={
                                      typeof skill.progress === 'string'
                                        ? skill.progress.toLowerCase()
                                        : (skill.progress > 95 ? "expert" : skill.progress >= 85 ? "advanced" : skill.progress >= 60 ? "intermediate" : skill.progress > 30 ? "beginner" : "aware")
                                    }
                                    onOpenChange={(open) => {
                                      if (open) setActiveOpenSelect(`${catIdx}-${skillIdx}`);
                                      else if (activeOpenSelect === `${catIdx}-${skillIdx}`) setActiveOpenSelect(null);
                                    }}
                                    onChange={(val) => {
                                      const currentData = db[activeTab].content;
                                      const newCats = [...currentData.categories];
                                      newCats[catIdx].skills[skillIdx] = { ...newCats[catIdx].skills[skillIdx], progress: val };
                                      updateCustomContent({ ...currentData, categories: newCats });
                                    }}
                                    options={[
                                      { value: "expert", label: "Expert" },
                                      { value: "advanced", label: "Advanced" },
                                      { value: "intermediate", label: "Intermediate" },
                                      { value: "beginner", label: "Beginner" },
                                      { value: "aware", label: "Aware" }
                                    ]}
                                  />
                                ) : getSkillFormat(skill, `${catIdx}-${skillIdx}`) === "custom" ? (
                                  <div className="flex gap-1">
                                    <input
                                      type="number"
                                      placeholder="Val"
                                      value={Math.round((skill.progress || 0) / 100 * getCustomMax(skill, `${catIdx}-${skillIdx}`))}
                                      onChange={(e) => {
                                        const numVal = parseFloat(e.target.value) || 0;
                                        const maxLimit = getCustomMax(skill, `${catIdx}-${skillIdx}`);
                                        const pct = Math.min(100, Math.max(0, Math.round((numVal / maxLimit) * 100)));
                                        const currentData = db[activeTab].content;
                                        const newCats = [...currentData.categories];
                                        newCats[catIdx].skills[skillIdx] = { ...newCats[catIdx].skills[skillIdx], progress: pct };
                                        updateCustomContent({ ...currentData, categories: newCats });
                                      }}
                                      className="w-1/2 cyber-input text-[10px] text-white font-bold py-1 px-1 text-center"
                                      title="Current Value"
                                    />
                                    <span className="text-[10px] text-muted-foreground self-center">/</span>
                                    <input
                                      type="number"
                                      placeholder="Max"
                                      value={getCustomMax(skill, `${catIdx}-${skillIdx}`)}
                                      onChange={(e) => {
                                        const newMax = parseFloat(e.target.value) || 100;
                                        setCustomMaxMap({ ...customMaxMap, [`${catIdx}-${skillIdx}`]: newMax });
                                        
                                        const currentVal = Math.round((skill.progress || 0) / 100 * getCustomMax(skill, `${catIdx}-${skillIdx}`));
                                        const pct = Math.min(100, Math.max(0, Math.round((currentVal / newMax) * 100)));
                                        const currentData = db[activeTab].content;
                                        const newCats = [...currentData.categories];
                                        newCats[catIdx].skills[skillIdx] = { 
                                          ...newCats[catIdx].skills[skillIdx], 
                                          progress: pct,
                                          customMax: newMax
                                        };
                                        updateCustomContent({ ...currentData, categories: newCats });
                                      }}
                                      className="w-1/2 cyber-input text-[10px] text-[#00ff88] font-bold py-1 px-1 text-center"
                                      title="Max limit"
                                    />
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    value={
                                      getSkillFormat(skill, `${catIdx}-${skillIdx}`) === "out10"
                                        ? parseFloat(((skill.progress || 0) / 10).toFixed(1))
                                        : skill.progress || 0
                                    }
                                    min="0"
                                    max={
                                      getSkillFormat(skill, `${catIdx}-${skillIdx}`) === "out10"
                                        ? 10
                                        : 100
                                    }
                                    step="0.1"
                                    onChange={(e) => {
                                      const format = getSkillFormat(skill, `${catIdx}-${skillIdx}`);
                                      const numVal = parseFloat(e.target.value) || 0;
                                      let newProgress = numVal;
                                      if (format === "out10") {
                                        newProgress = Math.min(100, Math.max(0, Math.round(numVal * 10)));
                                      } else {
                                        newProgress = Math.min(100, Math.max(0, Math.round(numVal)));
                                      }
                                      const currentData = db[activeTab].content;
                                      const newCats = [...currentData.categories];
                                      newCats[catIdx].skills[skillIdx] = { ...newCats[catIdx].skills[skillIdx], progress: newProgress };
                                      updateCustomContent({ ...currentData, categories: newCats });
                                    }}
                                    className="w-full cyber-input text-[10px] text-white font-bold py-1.5 px-3 text-center"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ADD FIELD DIALOG POPUP MODAL ── */}
      {showAddFieldModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md rounded-3xl border border-[#00ff88]/30 bg-[#080808]/95 shadow-[0_0_50px_rgba(0,255,136,0.15)] p-6 space-y-6 overflow-visible">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Plus className="size-4 text-[#00ff88]" />
                <span className="text-xs font-bold tracking-widest uppercase text-white font-mono-fira">Add Field to Schema</span>
              </div>
              <button
                onClick={() => setShowAddFieldModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white transition-all cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Field Label</label>
                <input
                  type="text"
                  value={newFieldLabel}
                  onChange={(e) => {
                    setNewFieldLabel(e.target.value);
                    const key = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");
                    setNewFieldKey(key);
                  }}
                  placeholder="e.g. Subtitle, External Link"
                  className="w-full cyber-input text-xs font-sans text-white font-bold"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="block text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Input Type</label>
                <CustomSelect
                  value={newFieldType}
                  onChange={(val) => setNewFieldType(val as any)}
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
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFieldModal(false)}
                className="flex-1 py-2.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddFieldSubmit}
                className="flex-1 py-2.5 bg-[#00ff88] hover:bg-[#00ff88]/90 text-[#050505] text-xs font-bold rounded-xl shadow-[0_4px_20px_rgba(0,255,136,0.2)] transition-all uppercase cursor-pointer"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditSchema && (
        <CustomSectionWizard
          db={db}
          setDb={setDb}
          onClose={() => setShowEditSchema(false)}
          setActiveTab={() => {}}
          editSectionKey={activeTab}
          token={token}
        />
      )}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
