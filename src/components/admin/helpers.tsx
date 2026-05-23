import React, { useState, useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";

// Sleek helper to render a text input with an integrated "Open Link" action button if it contains a URL
export const renderUrlInput = (
  value: string,
  onChange: (val: string) => void,
  placeholder = "https://...",
  className = "w-full cyber-input font-mono-fira"
) => {
  const isUrl = value && (
    value.startsWith("http://") || 
    value.startsWith("https://") || 
    value.includes("cloudinary.com") || 
    value.includes("github.com")
  );
  return (
    <div className="relative flex items-center w-full">
      <input 
        type="text" 
        value={value} 
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} ${isUrl ? "pr-10" : ""}`}
      />
      {isUrl && (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute right-3 p-1 rounded-md bg-white/5 border border-white/10 text-muted-foreground hover:text-[#00ff88] hover:border-[#00ff88]/30 hover:bg-[#00ff88]/10 transition-all cursor-pointer z-10 flex items-center justify-center"
          title="Open Live Link"
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </div>
  );
};

// Recursively renders a beautiful dynamic form for nested JSON objects and primitive values
export const renderDynamicObjectEditor = (
  obj: any, 
  onChange: (newObj: any) => void, 
  path: string[] = []
): React.ReactNode => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;

  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...obj, [key]: value };
    onChange(updated);
  };

  const formatLabel = (str: string) => {
    return str
      .replace(/_/g, " ")
      .replace(/([A-Z]+)/g, " $1")
      .replace(/([A-Z][a-z])/g, " $1")
      .trim()
      .replace(/\s+/g, " ")
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {Object.entries(obj).map(([key, val]) => {
        const label = formatLabel(key);

        // 1. Nested Object
        if (val !== null && typeof val === "object" && !Array.isArray(val)) {
          return (
            <div key={key} className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold tracking-wider text-[#00ff88] uppercase">{label}</span>
              </div>
              {renderDynamicObjectEditor(val, (newSubObj) => handleFieldChange(key, newSubObj), [...path, key])}
            </div>
          );
        }

        // 2. Array of Strings
        if (Array.isArray(val)) {
          const isStringArray = val.every(item => typeof item === "string");
          if (isStringArray) {
            return (
              <div key={key} className="space-y-1.5 animate-in fade-in duration-300">
                <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">
                  {label} (Comma Separated)
                </label>
                <input
                  type="text"
                  value={val.join(", ")}
                  onChange={(e) => {
                    const arr = e.target.value.split(",").map(t => t.trim());
                    handleFieldChange(key, arr);
                  }}
                  className="w-full cyber-input font-sans"
                />
              </div>
            );
          }
        }

        // 3. String Values
        if (typeof val === "string") {
          const isUrl = val.startsWith("http://") || val.startsWith("https://") || val.includes("cloudinary.com") || val.includes("github.com");
          const isLongText = val.length > 100 || key.toLowerCase().includes("description") || key.toLowerCase().includes("bio");

          return (
            <div key={key} className="space-y-1.5 animate-in fade-in duration-300">
              <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">
                {label}
              </label>
              {isLongText ? (
                <textarea
                  rows={5}
                  value={val}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-full cyber-input font-sans leading-relaxed resize-none"
                />
              ) : isUrl ? (
                renderUrlInput(
                  val,
                  (newVal) => handleFieldChange(key, newVal),
                  `Enter ${label.toLowerCase()} URL`
                )
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-full cyber-input font-sans"
                />
              )}
            </div>
          );
        }

        // 4. Number Values
        if (typeof val === "number") {
          return (
            <div key={key} className="space-y-1.5 animate-in fade-in duration-300">
              <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">
                {label}
              </label>
              <input
                type="number"
                value={val}
                onChange={(e) => handleFieldChange(key, parseFloat(e.target.value) || 0)}
                className="w-full cyber-input font-mono-fira"
              />
            </div>
          );
        }

        // 5. Boolean Values
        if (typeof val === "boolean") {
          return (
            <div key={key} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl animate-in fade-in duration-300">
              <label className="text-white text-xs font-bold tracking-wide uppercase">
                {label}
              </label>
              <button
                type="button"
                onClick={() => handleFieldChange(key, !val)}
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
          );
        }

        return null;
      })}
    </div>
  );
};

// Compile active selected datasets locally into Atri's Information block
export const compileAtrisInformationText = (db: any, included: Record<string, boolean>): string => {
  if (!db) return "";
  const prompt_lines: string[] = [];

  const registry = db["admin_config/json_structure"]?.content || {};

  for (const [key, regInfo] of Object.entries(registry) as [string, any][]) {
    if (regInfo.skipPromptCompile) continue;
    if (key === "admin_config/json_structure" || key === "dodoPromptInclusion" || key === "dodo_prompt") continue;
    if (included[key] === false) continue; // Default to true if not explicitly set to false
    const title = regInfo.title || key;
    const sectionType = regInfo.type || "list";
    const sectionData = db[key]?.content;

    if (!sectionData) continue;

    // 1. Categories Type (Skills)
    if (sectionType === "categories" && typeof sectionData === "object" && sectionData !== null) {
      prompt_lines.push(`#### 📊 ${title}:`);
      const categories = sectionData.categories || [];
      for (const cat of categories) {
        prompt_lines.push(`- **${cat.title || cat.name || ""}**:`);
        const skillsList = (cat.skills || []).map((s: any) => {
          if (s.progress) return `${s.name} (${s.progress}% proficiency)`;
          return s.name;
        });
        prompt_lines.push(`  - ${skillsList.join(", ")}`);
      }
      prompt_lines.push("");
    }
    // 2. Tags Type (Techstack)
    else if (sectionType === "tags" && Array.isArray(sectionData)) {
      prompt_lines.push(`#### 🏷️ ${title}: ${sectionData.join(", ")}`);
      prompt_lines.push("");
    }
    // 3. List Type (Experience, Projects, etc.)
    else if (sectionType === "list" && Array.isArray(sectionData)) {
      prompt_lines.push(`#### 📋 ${title}:`);
      for (const item of sectionData) {
        if (typeof item !== "object" || item === null) continue;
        const itemTitle = item.title || item.name || Object.values(item).find(v => typeof v === "string" && v !== item.imgUrl && v !== item.link) || "";
        prompt_lines.push(`- **${itemTitle}**`);
        for (const [k, v] of Object.entries(item)) {
          if (k === "title" || k === "name" || !v || !String(v).trim()) continue;
          if (k === "imgUrl" || k === "image") continue;
          
          const isUrl = String(v).startsWith("http://") || String(v).startsWith("https://");
          const label = k.charAt(0).toUpperCase() + k.slice(1);
          if (isUrl) {
            prompt_lines.push(`  - *${label}:* [View Document](${v})`);
          } else {
            prompt_lines.push(`  - *${label}:* ${v}`);
          }
        }
      }
      prompt_lines.push("");
    }
    // 4. Object Type (BannerDetails, links, logo, etc.)
    else if (sectionType === "object" && typeof sectionData === "object" && sectionData !== null) {
      prompt_lines.push(`#### ℹ️ ${title}:`);
      for (const [k, v] of Object.entries(sectionData)) {
        if (!v || !String(v).trim()) continue;
        if (k === "imgUrl" || k === "image") continue;

        const isUrl = String(v).startsWith("http://") || String(v).startsWith("https://");
        const label = k.charAt(0).toUpperCase() + k.slice(1);
        if (isUrl) {
          prompt_lines.push(`- **${label}:** [Link](${v})`);
        } else {
          prompt_lines.push(`- **${label}:** ${v}`);
        }
      }
      prompt_lines.push("");
    }
  }

  return prompt_lines.join("\n");
};

export function CustomSelect({
  value,
  onChange,
  options,
  onOpenChange
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  const selectedOpt = options.find(o => o.value === value) || options[0];

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between cyber-input text-[10px] font-sans bg-[#050505] border-white/10 hover:border-[#00ff88]/20 text-white cursor-pointer py-1.5 px-2 rounded-lg transition-all"
      >
        <span className="truncate">{selectedOpt?.label}</span>
        <span className="text-[8px] text-muted-foreground ml-1">▼</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-[#0a0a0a]/95 border border-[#00ff88]/20 rounded-lg shadow-[0_4px_20px_rgba(0,255,136,0.1)] z-50 py-1 max-h-48 overflow-y-auto backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-[10px] font-sans transition-all hover:bg-[#00ff88]/10 hover:text-[#00ff88] block truncate cursor-pointer ${
                opt.value === value ? "text-[#00ff88] bg-[#00ff88]/5 font-bold" : "text-white/70"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
