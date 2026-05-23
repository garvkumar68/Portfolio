import { useState, useEffect } from "react";
import {
  Check, 
  RefreshCw, 
  Terminal, 
  X,
  Code2,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { NeuralBackground } from "./NeuralBackground";
import { DBState } from "./admin/types";
import { CustomSectionPanel } from "./admin/CustomSectionPanel";
import { CustomSectionWizard } from "./admin/CustomSectionWizard";
import { JsonEditorPanel } from "./admin/JsonEditorPanel";
import { ConfirmModal } from "./admin/ConfirmModal";
import { SecurityGateway } from "./admin/SecurityGateway";
import { AdminSidebar } from "./admin/AdminSidebar";

export default function AdminPage() {
  return <AdminComponent />;
}


const ADMIN_STYLES = `
  select.cyber-input option {
    background-color: #080808 !important;
    color: #ffffff !important;
  }
  select.cyber-input {
    color-scheme: dark;
  }
  body {
    font-family: 'Outfit', sans-serif;
    background-color: #050505;
    overflow: hidden;
  }
  .font-mono-fira {
    font-family: 'Fira Code', monospace;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.012);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.04);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .glass-card:hover {
    border-color: rgba(0, 255, 136, 0.12);
    background: rgba(255, 255, 255, 0.02);
    box-shadow: 0 12px 40px 0 rgba(0, 255, 136, 0.03);
  }
  .cyber-input {
    background: rgba(255, 255, 255, 0.015);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 10px 14px;
    color: #ffffff;
    font-size: 13px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .cyber-input:focus {
    outline: none;
    border-color: #00ff88;
    box-shadow: 0 0 16px rgba(0, 255, 136, 0.15);
    background: rgba(255, 255, 255, 0.035);
  }
  .neon-text-glow {
    text-shadow: 0 0 12px rgba(0, 255, 136, 0.4);
  }
  .active-tab-glow {
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
  }

  /* ── EXQUISITE UX: HIDE ALL UGLY SCROLLBARS NATIVELY ── */
  ::-webkit-scrollbar {
    display: none !important;
    width: 0px !important;
    background: transparent !important;
  }
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
`;


function AdminComponent() {
  const [token, setToken] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<"checking" | "unauthorized" | "authorized">("checking");
  const [inputKey, setInputKey] = useState("");
  const [isSubmittingKey, setIsSubmittingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  
  const [db, setDb] = useState<DBState | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>("systemMetadata");
  const [editMode, setEditMode] = useState<"visual" | "json">("visual");
  const [isReloading, setIsReloading] = useState(false);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  const reloadDatabase = async () => {
    if (!token) {
      toast.error("Access token not available. Please verify session.");
      return;
    }
    setIsReloading(true);
    toast.loading(`Reloading ${activeTab} from GitHub...`, { id: "refresh-db" });
    try {
      const res = await fetch(`${WORKER_BASE}/api/cms/file?filename=${activeTab}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to reload ${activeTab} contents.`);
      }
      const data = await res.json() as { content: any; sha: string };
      setDb(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            content: data.content,
            sha: data.sha
          }
        };
      });
      toast.success(`${activeTab} updated to latest remote version!`, { id: "refresh-db" });
    } catch (err: any) {
      toast.error(err.message || "Failed to reload database.", { id: "refresh-db" });
    } finally {
      setIsReloading(false);
    }
  };

  // Lazily fetch individual file contents on-demand
  useEffect(() => {
    if (!db || !token || !activeTab) return;
    
    // Skip loading if the active tab is already fully loaded
    if (db[activeTab] && db[activeTab].content !== null) return;
    
    const fetchFileContent = async () => {
      setLoadingFile(activeTab);
      try {
        const res = await fetch(`${WORKER_BASE}/api/cms/file?filename=${activeTab}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error(`Failed to load ${activeTab} contents.`);
        }
        const data = await res.json() as { content: any; sha: string };
        setDb(prev => {
          if (!prev) return null;
          return {
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              content: data.content,
              sha: data.sha
            }
          };
        });
      } catch (err: any) {
        toast.error(err.message || `Failed to retrieve contents for ${activeTab}`);
      } finally {
        setLoadingFile(null);
      }
    };
    fetchFileContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, db === null, token]);
  // Custom Schema Wizard States
  const [showWizard, setShowWizard] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hideSystemFiles, setHideSystemFiles] = useState(true);

  // Compile Modal States
  const [showCompileModal, setShowCompileModal] = useState(false);
  const [compileSearchQuery, setCompileSearchQuery] = useState("");

  // Load garvAITwinPromptInclusion on demand when Compile Modal is opened
  useEffect(() => {
    if (showCompileModal && db && db.garvAITwinPromptInclusion && db.garvAITwinPromptInclusion.content === null && token) {
      const fetchInclusion = async () => {
        try {
          const res = await fetch(`${WORKER_BASE}/api/cms/file?filename=garvAITwinPromptInclusion&token=${token}`);
          if (!res.ok) throw new Error("Failed to load prompt inclusion list");
          const data = await res.json();
          setDb(prev => {
            if (!prev) return null;
            return {
              ...prev,
              garvAITwinPromptInclusion: {
                ...prev.garvAITwinPromptInclusion,
                content: data.content,
                sha: data.sha
              }
            };
          });
        } catch (err: any) {
          toast.error(err.message || "Failed to load prompt inclusion list");
        }
      };
      fetchInclusion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCompileModal, db === null, token]);

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

  const handleDeleteCustomSection = async (sectionKey: string) => {
    if (!db || !token) return;

    setConfirmModal({
      isOpen: true,
      title: "Delete Section Data",
      message: `Are you sure you want to permanently delete the section "${sectionKey}" and its JSON data schema from GitHub? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setPublishing(sectionKey);
        try {
          // 1. Instantly delete the content and schema files from GitHub
          const res = await fetch(`${WORKER_BASE}/api/cms/delete`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ filename: sectionKey })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || `Failed to delete ${sectionKey} from GitHub`);
          }

          // All sections are fully deletable — remove from db state and navigate away
          const updatedDb = { ...db };
          delete updatedDb[sectionKey];
          if (activeTab === sectionKey) {
            setActiveTab(Object.keys(updatedDb)[0] || "");
          }
          setDb(updatedDb);

          // 3. Rebuild and save updated admin_config/json_structure — preserve all flags
          const existingRegistry = db["admin_config/json_structure"]?.content || {};
          const jsonStructure: Record<string, any> = {};
          for (const key of Object.keys(updatedDb)) {
            if (key === "admin_config/json_structure" || key === "garv_ai_twin_prompt") continue;
            const prev = (existingRegistry[key] || {}) as Record<string, any>;
            const entry: Record<string, any> = {
              title:  updatedDb[key].title || key,
              type:   updatedDb[key].type  || "list",
              schema: updatedDb[key].schema || [],
            };
            if (prev.isStandard      || updatedDb[key].isStandard)     entry.isStandard      = true;
            if (prev.isSystemFile    || updatedDb[key].isSystemFile)   entry.isSystemFile    = true;
            if (entry.isSystemFile && (prev.readOnly !== undefined || updatedDb[key].readOnly !== undefined))
              entry.readOnly = updatedDb[key].readOnly ?? prev.readOnly;
            if (prev.skipPromptCompile || updatedDb[key].readOnly)      entry.skipPromptCompile = true;
            jsonStructure[key] = entry;
          }
          await fetch(`${WORKER_BASE}/api/cms/save`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ filename: "admin_config/json_structure", content: jsonStructure })
          });

          toast.success(`Successfully deleted "${sectionKey}" from GitHub!`);
        } catch (err: any) {
          toast.error(err.message);
        } finally {
          setPublishing(null);
        }
      }
    });
  };

  const [publishing, setPublishing] = useState<string | null>(null);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  // ── 100% PRODUCTION EDGE MODE: Always fetch dynamically from live Cloudflare & GitHub! ──
  const WORKER_BASE = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://127.0.0.1:8787"
    : "https://dodo-ai-agent.dodoai.workers.dev";

  // Dynamically load premium fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      try {
        document.head.removeChild(link);
      } catch (e) {}
    };
  }, []);

  // 1. Verify Credentials & Retrieve Auth Token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get("token");

    if (queryToken !== null) {
      // Clear token from URL immediately to prevent exposure!
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (queryToken === "") {
        setToken(null);
        setAuthStatus("unauthorized");
        return;
      }
    }

    // Sessions do not persist across refreshes (in-memory only)
    if (queryToken) {
      setToken(queryToken);

      // Verify Token on the live Worker API
      fetch(`${WORKER_BASE}/api/cms/verify`, {
        headers: { "Authorization": `Bearer ${queryToken}` }
      })
      .then(res => {
        if (res.ok) {
          setAuthStatus("authorized");
          loadDatabase(queryToken);
        } else {
          setAuthStatus("unauthorized");
        }
      })
      .catch(() => {
        setAuthStatus("unauthorized");
      });
    } else {
      setAuthStatus("unauthorized");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Securely verify credentials entered via the popup modal
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;

    setIsSubmittingKey(true);
    setKeyError(null);

    try {
      const res = await fetch(`${WORKER_BASE}/api/cms/verify`, {
        headers: { "Authorization": `Bearer ${inputKey.trim()}` }
      });

      if (res.ok) {
        setToken(inputKey.trim());
        setAuthStatus("authorized");
        await loadDatabase(inputKey.trim());
        toast.success("Terminal Access Granted!");
      } else {
        setKeyError("INVALID KERNEL ACCESS KEY. DECRYPTION TIMEOUT.");
        toast.error("Verification failed: Invalid key.");
      }
    } catch (err: any) {
      setKeyError("ERROR: OPERATIONS KERNEL UNREACHABLE.");
      toast.error("Network error during verification.");
    } finally {
      setIsSubmittingKey(false);
    }
  };

  // Securely close session and destroy memory footprints
  const handleLogout = () => {
    setToken(null);
    setAuthStatus("unauthorized");
    setDb(null);
    setInputKey("");
    setKeyError(null);
    toast.success("Operations Session Discharged Safely.");
  };

  // 2. Fetch all Portfolio Datasets in one single secure call
  const loadDatabase = async (authToken: string) => {
    try {
      const res = await fetch(`${WORKER_BASE}/api/cms/load`, {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (!res.ok) {
        throw new Error("Failed to download master dynamic databases from Cloudflare Worker.");
      }
      const data = await res.json() as { db: DBState };
      const loadedDb = data.db;

      // Unwrap any potential legacy wrapped values cleanly
      for (const key of Object.keys(loadedDb)) {
        if (loadedDb[key]?.content && typeof loadedDb[key].content === "object" && "schema" in loadedDb[key].content && "content" in loadedDb[key].content) {
          loadedDb[key].content = (loadedDb[key].content as any).content;
        }
      }

      // ── SINGLE SOURCE OF TRUTH: read all flags from json_structure.json registry ──
      // isSystemFile, readOnly, isStandard are all declared there, not hardcoded here.
      const registry = loadedDb["admin_config/json_structure"]?.content || {};

      for (const [key, regInfo] of Object.entries(registry) as [string, any][]) {
        if (!loadedDb[key]) continue;
        const flags: Record<string, any> = {};
        if (regInfo?.isSystemFile) { flags.isSystemFile = true; flags.readOnly = regInfo.readOnly === true; }
        if (regInfo?.isStandard)   { flags.isStandard = true; }
        if (Object.keys(flags).length) {
          loadedDb[key] = { ...loadedDb[key], ...flags };
        }
      }

      // Special case: the registry file itself (self-referential — cannot describe itself)
      if (loadedDb["admin_config/json_structure"]) {
        loadedDb["admin_config/json_structure"] = {
          ...loadedDb["admin_config/json_structure"],
          isSystemFile: true,
          readOnly: false,
          title: "Schema Registry"
        };
      }

      // Ensure garvAITwinPromptInclusion exists even if not yet pushed to GitHub
      if (!loadedDb["garvAITwinPromptInclusion"]) {
        const regInfo = registry["garvAITwinPromptInclusion"] || {};
        loadedDb["garvAITwinPromptInclusion"] = {
          content: null, sha: "", schema: [],
          type: "object",
          title: regInfo.title || "Garv AI Twin Prompt Inclusion",
          isSystemFile: true,
          readOnly: true
        };
      }

      // Ensure all standard sections exist with empty defaults if missing from GitHub.
      // Standard sections are those flagged isStandard:true in the registry.
      const standardKeys = Object.keys(registry).filter(k => (registry[k] as any)?.isStandard);
      for (const key of standardKeys) {
        if (!loadedDb[key]) {
          const regInfo = registry[key] as any;
          const type = regInfo?.type || "object";
          loadedDb[key] = {
            content: type === "list" || type === "tags" ? []
                   : type === "categories" ? { categories: [] }
                   : {},
            sha: "",
            schema: regInfo?.schema || [],
            type,
            title: regInfo?.title || key,
            isStandard: true
          };
        }
      }

      setDb(loadedDb);
      toast.success("Primal dynamic databases compiled successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to load database contents.");
    }
  };

  // 3. Save a specific JSON file back to GitHub
  const saveFile = async (fileKey: string) => {
    if (!token || !db) return;
    setPublishing(fileKey);

    try {
      // 1. Save the content file (clean content only)
      const contentToSave = db[fileKey].content;
      const resSection = await fetch(`${WORKER_BASE}/api/cms/save`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: fileKey,
          content: contentToSave
        })
      });

      if (!resSection.ok) {
        const errData = await resSection.json();
        throw new Error(errData.error || `Failed to save ${fileKey}.json`);
      }

      // 2. Rebuild and save the unified admin_config/json_structure
      // Read the existing registry to preserve any flags that are not held in db state.
      const existingRegistry = db["admin_config/json_structure"]?.content || {};
      const jsonStructure: Record<string, any> = {};
      for (const key of Object.keys(db)) {
        if (key === "admin_config/json_structure" || key === "garv_ai_twin_prompt") continue;
        const existing = existingRegistry[key] || {};
        jsonStructure[key] = {
          title:             db[key].title || key,
          type:              db[key].type  || "list",
          schema:            db[key].schema || [],
          // Preserve all metadata flags — never strip them on save
          ...(existing.isStandard      !== undefined && { isStandard:      existing.isStandard }),
          ...(existing.isSystemFile    !== undefined && { isSystemFile:    existing.isSystemFile }),
          ...(existing.readOnly        !== undefined && { readOnly:        existing.readOnly }),
          ...(existing.skipPromptCompile !== undefined && { skipPromptCompile: existing.skipPromptCompile }),
          // Also pick up any freshly set flags from db state (e.g. newly created sections)
          ...(db[key].isStandard      !== undefined && { isStandard:      db[key].isStandard }),
          ...(db[key].isSystemFile    !== undefined && { isSystemFile:    db[key].isSystemFile }),
          ...(db[key].readOnly        !== undefined && { readOnly:        db[key].readOnly }),
        };
      }

      const resSchema = await fetch(`${WORKER_BASE}/api/cms/save`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: "admin_config/json_structure",
          content: jsonStructure
        })
      });

      if (!resSchema.ok) {
        const errData = await resSchema.json();
        throw new Error(errData.error || "Failed to update admin_config/json_structure.json");
      }

      toast.success(`Successfully saved and recompiled ${fileKey}!`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPublishing(null);
    }
  };

  const [isCompiling, setIsCompiling] = useState(false);

  const handleManualCompile = async () => {
    if (!token) {
      toast.error("Authentication required to compile prompt.");
      return;
    }
    setIsCompiling(true);
    toast.loading("Recompiling master prompt on Cloudflare Edge...", { id: "manual-compile" });
    try {
      const res = await fetch(`${WORKER_BASE}/api/cms/compile`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Edge compilation failed." }));
        throw new Error(errData.error || "Edge compilation failed.");
      }
      toast.success("Master Prompt compiled & Fallbacks synchronized successfully!", { id: "manual-compile" });
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger Edge compiler.", { id: "manual-compile" });
    } finally {
      setIsCompiling(false);
    }
  };

  const handleFullReload = async () => {
    if (!token) return;
    setIsReloading(true);
    toast.loading("Syncing database registry from GitHub...", { id: "full-reload" });
    try {
      await loadDatabase(token);
      toast.success("Database registry synced successfully!", { id: "full-reload" });
    } catch (err: any) {
      toast.error(err.message || "Failed to sync database registry.", { id: "full-reload" });
    } finally {
      setIsReloading(false);
    }
  };

  const getIncludedToggles = (): Record<string, boolean> => {
    if (!db) return {};
    return db.garvAITwinPromptInclusion?.content?.included_datasets || {};
  };

  const getSourceKeys = (): string[] => {
    if (!db) return [];
    const registry = db["admin_config/json_structure"]?.content || {};
    return Object.keys(db).filter(key => {
      if (db[key].isSystemFile) return false;
      if (registry[key]?.skipPromptCompile) return false;
      return true;
    });
  };

  const toggleDatasetSelection = async (key: string) => {
    if (!db || !token) return;
    const currentToggles = getIncludedToggles();
    const updatedToggles = {
      ...currentToggles,
      [key]: currentToggles[key] === false ? true : false
    };
    
    // Update local DB state
    const updatedDb = {
      ...db,
      garvAITwinPromptInclusion: {
        ...db.garvAITwinPromptInclusion,
        content: {
          ...(db.garvAITwinPromptInclusion?.content || {}),
          included_datasets: updatedToggles
        }
      }
    };
    setDb(updatedDb);

    // Save garvAITwinPromptInclusion to GitHub automatically
    setPublishing("garvAITwinPromptInclusion");
    try {
      const res = await fetch(`${WORKER_BASE}/api/cms/save`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          filename: "garvAITwinPromptInclusion",
          content: updatedDb.garvAITwinPromptInclusion.content
        })
      });

      if (!res.ok) {
        throw new Error("Failed to save prompt configuration toggles to GitHub");
      }
      
      const resData = await res.json();
      // Update local SHA
      setDb(prev => {
        if (!prev) return null;
        return {
          ...prev,
          garvAITwinPromptInclusion: {
            ...prev.garvAITwinPromptInclusion,
            sha: resData.sha || prev.garvAITwinPromptInclusion.sha
          }
        };
      });
      toast.success(`Prompt source "${key}" updated successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save toggle change");
    } finally {
      setPublishing(null);
    }
  };


  // Render checking lockscreen
  if (authStatus === "checking") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-[#050505] text-white">
        <style dangerouslySetInnerHTML={{ __html: ADMIN_STYLES }} />
        <div className="relative size-20 flex items-center justify-center rounded-full bg-primary/5 border border-primary/20 animate-pulse mb-6 shadow-[0_0_50px_rgba(0,255,136,0.1)]">
          <RefreshCw className="size-8 text-[#00ff88] animate-spin" />
        </div>
        <h2 className="font-display text-xs font-semibold tracking-[0.4em] text-[#00ff88] uppercase neon-text-glow">Authenticating Core Session</h2>
        <p className="text-[10px] text-muted-foreground font-mono mt-3 uppercase tracking-widest">Decrypting Terminal Keys...</p>
      </div>
    );
  }

  // Render unauthorized access screen
  if (authStatus === "unauthorized") {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: ADMIN_STYLES }} />
        <SecurityGateway
          inputKey={inputKey}
          setInputKey={setInputKey}
          isSubmittingKey={isSubmittingKey}
          keyError={keyError}
          handleLoginSubmit={handleLoginSubmit}
        />
      </>
    );
  }

  if (!db) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center bg-[#050505] text-white">
        <style dangerouslySetInnerHTML={{ __html: ADMIN_STYLES }} />
        <RefreshCw className="size-10 text-[#00ff88] animate-spin mb-4" />
        <h2 className="font-display text-xs font-semibold tracking-widest text-[#00ff88]/80 uppercase">Downloading dynamic databases from GitHub...</h2>
        <p className="text-[10px] text-muted-foreground font-mono mt-2 tracking-widest uppercase">Syncing CDN layers in real-time...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#050505] font-sans antialiased text-white selection:bg-[#00ff88]/20 relative">
      <NeuralBackground />
      <style dangerouslySetInnerHTML={{ __html: ADMIN_STYLES }} />
      
      {/* ── STATIC LEFT PANEL NAV ── */}
      <AdminSidebar
        db={db}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setEditMode={setEditMode}
        setShowWizard={setShowWizard}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sidebarMinimized={sidebarMinimized}
        setSidebarMinimized={setSidebarMinimized}
        hideSystemFiles={hideSystemFiles}
        setHideSystemFiles={setHideSystemFiles}
        handleLogout={handleLogout}
      />
 
      {/* ── INDEPENDENTLY SCROLLABLE RIGHT PANEL ── */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-12 w-full max-w-[1600px] mx-auto">
        {db && (
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={() => setShowCompileModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00ff88]/20 bg-[#00ff88]/5 hover:bg-[#00ff88]/10 hover:border-[#00ff88]/30 text-[#00ff88] text-[10px] font-bold uppercase transition-all tracking-wider cursor-pointer"
            >
              <Terminal className="size-3.5" />
              <span>Compile Master Prompt</span>
            </button>
            {editMode === "visual" && (
              <button
                onClick={() => setEditMode("json")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 text-white/80 text-[10px] font-bold uppercase transition-all tracking-wider cursor-pointer"
              >
                <Code2 className="size-3.5" />
                <span>View JSON Source</span>
              </button>
            )}
          </div>
        )}

        {loadingFile === activeTab ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <RefreshCw className="size-8 text-[#00ff88] animate-spin mb-4" />
            <h3 className="font-display text-xs font-semibold tracking-widest text-[#00ff88]/80 uppercase">Loading section data...</h3>
            <p className="text-[9px] text-muted-foreground font-mono mt-2 tracking-widest uppercase">Fetching from GitHub CDN...</p>
          </div>
        ) : db && db[activeTab]?.isSystemFile ? (
          <JsonEditorPanel
            activeTab={activeTab}
            db={db}
            setDb={setDb}
            saveFile={saveFile}
            publishing={publishing}
            onClose={() => {}}
            onRefresh={reloadDatabase}
            isRefreshing={isReloading}
          />
        ) : editMode === "json" && db ? (
          <JsonEditorPanel
            activeTab={activeTab}
            db={db}
            setDb={setDb}
            saveFile={saveFile}
            publishing={publishing}
            onClose={() => setEditMode("visual")}
            onRefresh={reloadDatabase}
            isRefreshing={isReloading}
          />
        ) : (
          <>
            {/* ── UNIFIED SCHEMA/CONTENT SECTION PANEL (Covers standard dynamic lists, objects, tag clouds, matrices, & custom sections!) ── */}
            {db && (
              <CustomSectionPanel
                activeTab={activeTab}
                db={db}
                setDb={setDb}
                saveFile={saveFile}
                publishing={publishing}
                handleDeleteCustomSection={handleDeleteCustomSection}
                token={token}
                onRefresh={reloadDatabase}
                isRefreshing={isReloading}
              />
            )}

            {/* ── CUSTOM SCHEMA CREATOR WIZARD MODAL ── */}
            {showWizard && db && (
              <CustomSectionWizard
                db={db}
                setDb={setDb}
                onClose={() => setShowWizard(false)}
                setActiveTab={setActiveTab}
                token={token}
              />
            )}
          </>
        )}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />

        {showCompileModal && db && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-[#080808]/95 border border-[#00ff88]/20 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(0,255,136,0.05)] relative space-y-6">
              
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#00ff88]/5 border border-[#00ff88]/10 text-[#00ff88]">
                    <Terminal className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-wider uppercase text-white font-mono-fira">Prompt Edge Compiler</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-0.5">Select databases to merge into system prompt</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleFullReload}
                    disabled={isReloading}
                    title="Sync Database Registry"
                    className="p-1.5 rounded-lg border border-white/5 hover:border-[#00ff88]/30 hover:bg-[#00ff88]/5 text-muted-foreground hover:text-[#00ff88] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`size-4 ${isReloading ? "animate-spin text-[#00ff88]" : ""}`} />
                  </button>
                  <button 
                    onClick={() => setShowCompileModal(false)}
                    className="p-1.5 rounded-lg border border-white/5 hover:border-white/20 text-muted-foreground hover:text-white transition-all cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    placeholder="Search database sources..."
                    value={compileSearchQuery}
                    onChange={(e) => setCompileSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-xs uppercase font-bold tracking-wider placeholder:text-muted-foreground/30 text-white focus:outline-none focus:border-[#00ff88]/30 transition-all font-sans"
                  />
                </div>

                {/* Sources List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {(() => {
                    const registry = db["admin_config/json_structure"]?.content || {};
                    return getSourceKeys()
                      .map(key => ({
                        key,
                        label: registry[key]?.title || key,
                        description: `${key}.json database source`
                      }))
                      .filter(item => 
                        item.label.toLowerCase().includes(compileSearchQuery.toLowerCase()) ||
                        item.key.toLowerCase().includes(compileSearchQuery.toLowerCase())
                      );
                  })().map(item => {
                    const isChecked = getIncludedToggles()[item.key] !== false;
                    const isSaving = publishing === "garvAITwinPromptConfig";
                    return (
                      <div
                        key={item.key}
                        onClick={() => !isSaving && toggleDatasetSelection(item.key)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
                          isChecked 
                            ? "bg-[#00ff88]/5 border-[#00ff88]/20 text-[#00ff88]" 
                            : "bg-white/[0.005] border-white/5 text-muted-foreground hover:bg-white/[0.02]"
                        } ${isSaving ? "opacity-60 cursor-not-allowed" : "cursor-pointer select-none"}`}
                      >
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider">{item.label}</div>
                          <div className="text-[8px] uppercase tracking-widest text-muted-foreground/75 font-mono mt-0.5">{item.description}</div>
                        </div>
                        <div className={`size-4.5 rounded-lg flex items-center justify-center border transition-all ${
                          isChecked ? "bg-[#00ff88] border-[#00ff88] text-black" : "border-white/20"
                        }`}>
                          {isChecked && <Check className="size-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCompileModal(false)}
                  className="flex-1 px-4 py-3 bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={isCompiling}
                  onClick={async () => {
                    await handleManualCompile();
                    setShowCompileModal(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#00ff88] hover:bg-[#00ff88]/90 text-black text-[10px] font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(0,255,136,0.15)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCompiling ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Terminal className="size-3.5" />
                  )}
                  <span>Run Compiler & Sync</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

