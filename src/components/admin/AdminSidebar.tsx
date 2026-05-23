import React from "react";
import { 
  Terminal, ChevronRight, Plus, Search, LayoutGrid, Globe, 
  User, Briefcase, Wrench, BookOpen, Trophy, Layers, LogOut, Unlock, Code2 
} from "lucide-react";
import { DBState } from "./types";

// ── SOURCE OF TRUTH for built-in sections with dedicated UI panels ──
// Any key listed here is excluded from the "Custom Dynamic Sections" list.
// System & Tooling files are identified dynamically via db[key].isSystemFile.
export const STANDARD_NAV_TABS = [
  { id: "systemMetadata",    title: "System Info",         label: "systemMetadata.json",    icon: LayoutGrid },
  { id: "professionalLinks", title: "Professional Links",  label: "professionalLinks.json", icon: Globe },
  { id: "logo",              title: "Brand Logo",          label: "logo.json",             icon: Globe },
  { id: "BannerDetails",     title: "Banner Details",      label: "BannerDetails.json",     icon: User },
  { id: "experience",        title: "Work Experience",     label: "experience.json",        icon: Briefcase },
  { id: "projects",          title: "Core Projects",       label: "projects.json",          icon: Wrench },
  { id: "researchInsights",  title: "Scientific Research", label: "researchInsights.json",  icon: BookOpen },
  { id: "successStories",    title: "Achievements Log",    label: "successStories.json",    icon: Trophy },
  { id: "skillsData",        title: "Skills Matrix",       label: "skillsData.json",        icon: Layers },
  { id: "techstack",         title: "Tech Stack",          label: "techstack.json",         icon: Wrench },
  { id: "dodoPromptConfig",  title: "Assistant Rules",     label: "dodoPromptConfig.json", icon: Terminal },
] as const;

const STANDARD_KEYS = STANDARD_NAV_TABS.map(t => t.id);

interface AdminSidebarProps {
  db: DBState | null;
  activeTab: string;
  setActiveTab: (val: string) => void;
  setEditMode: (mode: "visual" | "json") => void;
  setShowWizard: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  sidebarMinimized: boolean;
  setSidebarMinimized: (val: boolean) => void;
  hideSystemFiles: boolean;
  setHideSystemFiles: (val: boolean) => void;
  handleLogout: () => void;
}

export function AdminSidebar({
  db,
  activeTab,
  setActiveTab,
  setEditMode,
  setShowWizard,
  searchQuery,
  setSearchQuery,
  sidebarMinimized,
  setSidebarMinimized,
  hideSystemFiles,
  setHideSystemFiles,
  handleLogout
}: AdminSidebarProps) {
  return (
    <aside className={`h-full shrink-0 bg-[#080808]/95 border-r border-white/5 p-5 flex flex-col justify-between glass-card md:rounded-none select-none transition-all duration-300 ease-in-out z-20 ${
      sidebarMinimized ? "w-20" : "w-64"
    }`}>
      <div className="flex flex-col h-[88%]">
        {/* Logo Header with Collapse Trigger */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-10 shrink-0 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              <Terminal className="size-5 text-[#00ff88]" />
            </div>
            {!sidebarMinimized && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className="font-display text-sm tracking-[0.25em] text-white uppercase font-bold">Dodo CMS</h1>
                <p className="text-[9px] text-[#00ff88] font-mono-fira tracking-widest uppercase mt-0.5">Edge Operations</p>
              </div>
            )}
          </div>

          {/* Collapse toggle icon button */}
          <button 
            onClick={() => setSidebarMinimized(!sidebarMinimized)}
            className="p-1.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-[#00ff88]/30 hover:bg-[#00ff88]/10 text-muted-foreground hover:text-[#00ff88] transition-all ml-1.5 shrink-0"
            title={sidebarMinimized ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <ChevronRight className={`size-3.5 transition-transform duration-300 ${sidebarMinimized ? "" : "rotate-180 text-[#00ff88]"}`} />
          </button>
        </div>

        {/* Search bar & Global Add button (if not minimized) */}
        {!sidebarMinimized && (
          <div className="space-y-2 mb-4 px-1 shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-white/[0.015] border border-white/5 rounded-lg text-[10px] font-sans text-white focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/[0.035] transition-all placeholder:text-muted-foreground/50"
                />
                <Search className="size-3 text-muted-foreground/60 absolute left-2.5 top-2.5" />
              </div>
              <button
                onClick={() => setShowWizard(true)}
                className="p-1.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 hover:border-[#00ff88] text-[#00ff88] rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="New Custom Section"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between px-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[8.5px] text-muted-foreground hover:text-white transition-all font-mono-fira">
                <input
                  type="checkbox"
                  checked={hideSystemFiles}
                  onChange={(e) => setHideSystemFiles(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-[#00ff88] focus:ring-0 focus:ring-offset-0 size-3 accent-[#00ff88] cursor-pointer"
                />
                <span>PARTICIPATING FILES ONLY</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Links - Standard + Dynamic Custom Sections */}
        <nav className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 scrollbar-width-none">
          {STANDARD_NAV_TABS
          .filter(tab => 
            (!db || db[tab.id] !== undefined) && (
              tab.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              tab.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              tab.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
          .map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditMode("visual");
                }}
                className={`flex items-start gap-3 py-2 px-3 rounded-lg text-left transition-all duration-300 relative shrink-0 ${
                  sidebarMinimized ? "justify-center px-0 py-3" : ""
                } ${
                  isActive 
                    ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 active-tab-glow" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent"
                }`}
                title={sidebarMinimized ? tab.title : undefined}
              >
                <Icon className={`size-3.5 shrink-0 ${isActive ? "text-[#00ff88]" : "text-muted-foreground"} mt-0.5`} />
                {!sidebarMinimized && (
                  <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className={`text-[10px] font-bold tracking-wide uppercase truncate ${isActive ? "text-white" : "text-muted-foreground"}`}>
                      {tab.title}
                    </span>
                    <span className="text-[8px] font-mono-fira text-muted-foreground/50 truncate mt-0.5">
                      {tab.label}
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          {/* Render Custom Dynamic Sections */}
          {/* Fully dynamic: any key in db that is NOT a standard section and NOT a system file
              is automatically listed here — no hardcoding needed. */}
          {db && Object.keys(db)
            .filter(key => !STANDARD_KEYS.includes(key as any) && !db[key]?.isSystemFile)
            .filter(key => {
              const title = db[key]?.title || key;
              return (
                title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                key.toLowerCase().includes(searchQuery.toLowerCase())
              );
            })
            .map(key => {
              const isActive = activeTab === key;
              const title = db[key]?.title || key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setEditMode("visual");
                  }}
                  className={`flex items-start gap-3 py-2 px-3 rounded-lg text-left transition-all duration-300 relative shrink-0 ${
                    sidebarMinimized ? "justify-center px-0 py-3" : ""
                  } ${
                    isActive 
                      ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 active-tab-glow" 
                      : "text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                  title={sidebarMinimized ? title : undefined}
                >
                  <Layers className={`size-3.5 shrink-0 ${isActive ? "text-[#00ff88]" : "text-muted-foreground"} mt-0.5`} />
                  {!sidebarMinimized && (
                    <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                      <span className={`text-[10px] font-bold tracking-wide uppercase truncate ${isActive ? "text-white" : "text-muted-foreground"}`}>
                        {title}
                      </span>
                      <span className="text-[8px] font-mono-fira text-muted-foreground/50 truncate mt-0.5">
                        {key}.json
                      </span>
                    </div>
                  )}
                </button>
              );
            })}

          {/* Render System & Tooling Files */}
          {/* Fully dynamic: driven entirely by the isSystemFile flag set in loadDatabase.
              To add a new system file, just mark it isSystemFile:true there — nothing to change here. */}
          {db && !hideSystemFiles && (
            <>
              <div className="h-[1px] bg-white/5 my-3 shrink-0" />
              {!sidebarMinimized && (
                <span className="text-[8px] font-mono-fira text-muted-foreground/45 tracking-widest uppercase mb-1.5 shrink-0 px-2">
                  System & Tooling Files
                </span>
              )}
              {Object.keys(db)
              .filter(key =>
                db[key]?.isSystemFile && (
                  (db[key]?.title || key).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  key.toLowerCase().includes(searchQuery.toLowerCase())
                )
              )
              .map(key => {
                const isActive = activeTab === key;
                const title = db[key]?.title || key;
                // Derive a sensible file label: admin_config/json_structure → json_structure.json etc.
                const label = key.includes("/") ? key.split("/").pop() + ".json" : `${key}.json`;
                // Pick icon based on key heuristics
                const Icon = key.includes("prompt") || key.includes("dodo") ? Terminal
                           : key.includes("compile") ? Code2
                           : Layers;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveTab(key);
                      setEditMode("json");
                    }}
                    className={`flex items-start gap-3 py-2 px-3 rounded-lg text-left transition-all duration-300 relative shrink-0 ${
                      sidebarMinimized ? "justify-center px-0 py-3" : ""
                    } ${
                      isActive 
                        ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 active-tab-glow" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                    title={sidebarMinimized ? title : undefined}
                  >
                    <Icon className={`size-3.5 shrink-0 ${isActive ? "text-[#00ff88]" : "text-muted-foreground"} mt-0.5`} />
                    {!sidebarMinimized && (
                      <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className={`text-[10px] font-bold tracking-wide uppercase truncate ${isActive ? "text-white" : "text-muted-foreground"}`}>
                          {title}
                        </span>
                        <span className="text-[8px] font-mono-fira text-muted-foreground/50 truncate mt-0.5">
                          {label}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {/* Create Custom Section Action Button (when minimized) */}
          {db && sidebarMinimized && (
            <button
              onClick={() => setShowWizard(true)}
              className="flex items-center justify-center py-3 rounded-lg border border-dashed border-white/10 hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 text-muted-foreground hover:text-[#00ff88] shrink-0 cursor-pointer"
              title="Create Dynamic Custom Section"
            >
              <Plus className="size-3.5 shrink-0" />
            </button>
          )}
        </nav>
      </div>

      {/* System Credentials Status Footer */}
      <div className="pt-4 border-t border-white/5 font-mono-fira text-[9px] text-muted-foreground flex flex-col gap-2 shrink-0">
        {sidebarMinimized ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-[#00ff88] flex justify-center" title="Core Session Secure">
              <Unlock className="size-3.5 animate-pulse" />
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/[0.02] border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all flex items-center justify-center"
              title="Secure Log Out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span>CORE STATUS:</span>
              <span className="text-[#00ff88] flex items-center gap-1 font-bold"><Unlock className="size-3" /> SECURE</span>
            </div>
            <div className="flex items-center justify-between">
              <span>KERNEL REF:</span>
              <span>{db?.systemMetadata?.content?.kernel || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>DATABASE:</span>
              <span>REAL-TIME API</span>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 font-bold uppercase rounded-lg transition-all"
              title="Secure Log Out"
            >
              <LogOut className="size-3" /> Close Session
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
