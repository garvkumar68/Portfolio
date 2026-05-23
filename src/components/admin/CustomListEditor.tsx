import React, { useState } from "react";
import { GripVertical, ArrowUp, ArrowDown, Trash, Plus, Terminal, Layers } from "lucide-react";
import { toast } from "sonner";
import { ConfirmModal } from "./ConfirmModal";

interface CustomListEditorProps {
  schema: Array<{ key: string; label: string; type: string }>;
  content: any[];
  onChange: (newContent: any[]) => void;
  renderUrlInput: (value: string, onChange: (val: string) => void, placeholder?: string) => React.ReactNode;
}

export function CustomListEditor({ schema, content, onChange, renderUrlInput }: CustomListEditorProps) {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dropPlacement, setDropPlacement] = useState<"above" | "below" | null>(null);

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

  const list = content || [];

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const placement = relativeY < rect.height / 2 ? "above" : "below";

    setDragOverIdx(idx);
    setDropPlacement(placement);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
    setDropPlacement(null);
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const placement = relativeY < rect.height / 2 ? "above" : "below";

    const newList = [...list];
    const draggedItem = newList[draggedIdx];

    newList.splice(draggedIdx, 1);

    let insertIdx = targetIdx;
    if (draggedIdx < targetIdx) {
      insertIdx = placement === "below" ? targetIdx : targetIdx - 1;
    } else {
      insertIdx = placement === "below" ? targetIdx + 1 : targetIdx;
    }

    insertIdx = Math.max(0, Math.min(newList.length, insertIdx));
    newList.splice(insertIdx, 0, draggedItem);

    onChange(newList);
    setSelectedIdx(insertIdx);
    setDraggedIdx(null);
    setDragOverIdx(null);
    setDropPlacement(null);
    toast.success("Item sorted successfully!");
  };

  const handleItemFieldChange = (fieldKey: string, val: any) => {
    const newList = [...list];
    newList[selectedIdx] = { ...newList[selectedIdx], [fieldKey]: val };
    onChange(newList);
  };

  const handleAddNew = () => {
    const newItem: any = {};
    schema.forEach(field => {
      if (field.type === "percentage") newItem[field.key] = 0;
      else if (field.type === "number") newItem[field.key] = 0;
      else if (field.type === "boolean") newItem[field.key] = false;
      else newItem[field.key] = "";
    });

    const newList = [...list];
    newList.push(newItem);
    onChange(newList);
    setSelectedIdx(newList.length - 1);
  };

  const handleDelete = (idx: number) => {
    const itemLabel = getItemLabel(list[idx], idx);
    setConfirmModal({
      isOpen: true,
      title: "Delete Entry Record",
      message: `Are you sure you want to permanently delete "${itemLabel}" from this list?`,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        const newList = [...list];
        newList.splice(idx, 1);
        onChange(newList);
        setSelectedIdx(Math.max(0, idx - 1));
        toast.success("Entry removed from list.");
      }
    });
  };

  const handleMove = (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const newList = [...list];
    const temp = newList[idx];
    newList[idx] = newList[targetIdx];
    newList[targetIdx] = temp;

    onChange(newList);
    setSelectedIdx(targetIdx);
  };

  const getItemLabel = (item: any, idx: number) => {
    if (!item) return `Item #${idx + 1}`;
    const possibleKeys = ["title", "name", "label", "heading", "id"];
    for (const key of possibleKeys) {
      if (item[key]) return String(item[key]);
    }
    if (schema[0] && item[schema[0].key]) {
      return String(item[schema[0].key]);
    }
    return `Item #${idx + 1}`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start w-full">
      {/* Left: Scrollable Items List */}
      <div className="w-full md:w-80 shrink-0 glass-card rounded-2xl p-4 space-y-3 self-stretch flex flex-col justify-between max-h-[70vh] min-h-[500px]">
        <div
          className="space-y-2 overflow-y-auto pr-1 flex-1 mb-3"
          onDragOver={(e) => {
            if (draggedIdx !== null) e.preventDefault();
          }}
          onDrop={(e) => {
            if (draggedIdx !== null && draggedIdx !== list.length - 1) {
              e.preventDefault();
              const newList = [...list];
              const draggedItem = newList[draggedIdx];
              newList.splice(draggedIdx, 1);
              newList.push(draggedItem);
              onChange(newList);
              setSelectedIdx(newList.length - 1);
              handleDragEnd();
              toast.success("Sorted to bottom!");
            }
          }}
        >
          {list.length === 0 ? (
            <div className="h-40 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-muted-foreground text-[10px] uppercase font-mono-fira text-center p-4">
              No entries found.
            </div>
          ) : (
            list.map((item, idx) => {
              const isSelected = selectedIdx === idx;
              const isDragged = draggedIdx === idx;
              const isDragOver = dragOverIdx === idx;

              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`relative select-none p-3 border rounded-xl flex items-center justify-between group transition-all duration-300 ${
                    isDragged ? "opacity-30 border-dashed border-[#00ff88]/30 bg-black/40" : ""
                  } ${
                    isSelected 
                      ? "bg-[#00ff88]/5 border-[#00ff88]/20 text-[#00ff88]" 
                      : "bg-white/[0.005] border-white/5 text-muted-foreground hover:bg-white/[0.02]"
                  }`}
                  style={{
                    cursor: "grab",
                    boxShadow: isSelected ? "0 0 15px rgba(0, 255, 136, 0.03)" : "none"
                  }}
                >
                  {/* Reordering indicators */}
                  {isDragOver && dropPlacement === "above" && (
                    <div className="absolute left-0 right-0 -top-1 h-0.5 bg-[#00ff88] shadow-[0_0_8px_#00ff88] z-30 animate-pulse" />
                  )}
                  {isDragOver && dropPlacement === "below" && (
                    <div className="absolute left-0 right-0 -bottom-1 h-0.5 bg-[#00ff88] shadow-[0_0_8px_#00ff88] z-30 animate-pulse" />
                  )}

                  <div className="flex items-center gap-3 overflow-hidden flex-1" onClick={() => setSelectedIdx(idx)}>
                    <GripVertical className="size-3.5 text-muted-foreground/30 group-hover:text-[#00ff88]/50 transition-colors shrink-0" />
                    <span className="text-[10px] font-bold tracking-wider uppercase truncate">{getItemLabel(item, idx)}</span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className="p-1 text-muted-foreground hover:text-white disabled:opacity-30 rounded cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === list.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className="p-1 text-muted-foreground hover:text-white disabled:opacity-30 rounded cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                      title="Delete Record"
                    >
                      <Trash className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={handleAddNew}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white/[0.02] border border-white/10 hover:border-[#00ff88]/30 hover:text-[#00ff88] text-xs font-bold rounded-xl uppercase transition-all cursor-pointer"
        >
          <Plus className="size-4" /> Add Item
        </button>
      </div>

      {/* Right: Active Item Form Editor */}
      <div className="flex-1 w-full glass-card rounded-2xl p-6 self-stretch">
        {list[selectedIdx] ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <Layers className="size-4 text-[#00ff88]" />
              <h3 className="text-xs font-bold tracking-wider uppercase text-white">
                Edit Record #{selectedIdx + 1}: {getItemLabel(list[selectedIdx], selectedIdx)}
              </h3>
            </div>

            <div className="space-y-5 animate-in fade-in duration-300">
              {schema.map(field => {
                const val = list[selectedIdx]?.[field.key];
                
                // 1. Text Field
                if (field.type === "string") {
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">{field.label}</label>
                      <input
                        type="text"
                        value={val || ""}
                        onChange={(e) => handleItemFieldChange(field.key, e.target.value)}
                        className="w-full cyber-input font-sans"
                      />
                    </div>
                  );
                }

                // 2. Long Text Area
                if (field.type === "longtext") {
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">{field.label}</label>
                      <textarea
                        rows={6}
                        value={val || ""}
                        onChange={(e) => handleItemFieldChange(field.key, e.target.value)}
                        className="w-full cyber-input font-sans leading-relaxed resize-none"
                      />
                    </div>
                  );
                }

                // 3. URL Fields
                if (field.type === "url") {
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">{field.label}</label>
                      {renderUrlInput(
                        val || "",
                        (newUrl) => handleItemFieldChange(field.key, newUrl),
                        `Enter ${field.label.toLowerCase()}`
                      )}
                    </div>
                  );
                }

                // 4. Percentage Slider
                if (field.type === "percentage") {
                  const percentVal = typeof val === "number" ? val : parseInt(val) || 0;
                  return (
                    <div key={field.key} className="space-y-1.5 bg-white/[0.005] border border-white/5 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">{field.label}</label>
                        <span className="text-xs font-mono-fira text-[#00ff88] font-bold">{percentVal}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={percentVal}
                        onChange={(e) => handleItemFieldChange(field.key, parseInt(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                      />
                    </div>
                  );
                }

                // 5. Number Field
                if (field.type === "number") {
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <label className="block text-muted-foreground text-[10px] uppercase font-semibold tracking-wider">{field.label}</label>
                      <input
                        type="number"
                        value={val !== undefined ? val : 0}
                        onChange={(e) => handleItemFieldChange(field.key, parseFloat(e.target.value) || 0)}
                        className="w-full cyber-input font-mono-fira"
                      />
                    </div>
                  );
                }

                // 6. Boolean Toggle
                if (field.type === "boolean") {
                  const boolVal = !!val;
                  return (
                    <div key={field.key} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl">
                      <label className="text-white text-xs font-bold tracking-wide uppercase">{field.label}</label>
                      <button
                        type="button"
                        onClick={() => handleItemFieldChange(field.key, !boolVal)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          boolVal ? "bg-[#00ff88]" : "bg-white/10"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block size-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                            boolVal ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <Terminal className="size-8 text-[#00ff88]/40 mb-3" />
            <p className="text-xs font-mono-fira uppercase tracking-widest">No active dataset selected.</p>
            <button 
              onClick={handleAddNew}
              className="mt-4 px-4 py-2 border border-white/10 hover:border-[#00ff88]/20 hover:text-white text-xs font-bold rounded-lg uppercase transition-all cursor-pointer"
            >
              Create New Entry
            </button>
          </div>
        )}
      </div>
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
