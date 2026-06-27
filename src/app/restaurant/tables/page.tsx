"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { Table } from "@/types/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Save, Trash2, Star, Users, Circle, Square, LayoutDashboard, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_AREAS = ["Main Hall", "A/C", "Non A/C", "Bar", "Outdoor"];

export default function RestaurantTablesPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>("Main Hall");
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchTables = async () => {
      try {
        const q = query(collection(db, "tables"), where("restaurantId", "==", user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Table);
        setTables(data);
        
        // Find if there are custom areas and add them
        const allAreas = data.map(t => t.area || "Main Hall");
        if (allAreas.length > 0 && !allAreas.includes(selectedArea)) {
            setSelectedArea(allAreas[0]);
        }
      } catch (err) {
        console.error("Failed to fetch tables", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [user]);

  const allAreasSet = useMemo(() => {
    const areas = new Set(DEFAULT_AREAS);
    tables.forEach(t => {
        if (t.area) areas.add(t.area);
    });
    return Array.from(areas);
  }, [tables]);

  const tablesInArea = useMemo(() => {
    return tables.filter(t => (t.area || "Main Hall") === selectedArea);
  }, [tables, selectedArea]);

  const handleAddTable = () => {
    const newId = `T${tables.length + 1}-${Math.floor(Math.random() * 1000)}`;
    const newTable: Table = {
      id: newId,
      restaurantId: user!.uid,
      tableNumber: `Table ${tables.length + 1}`,
      capacity: 2,
      shape: "rect",
      isVip: false,
      area: selectedArea,
      positionX: 50,
      positionY: 50,
    };
    setTables([...tables, newTable]);
    setActiveTableId(newId);
  };

  const handleUpdateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDeleteTable = async (id: string) => {
    setTables(tables.filter(t => t.id !== id));
    if (activeTableId === id) setActiveTableId(null);
  };

  const [draggingTable, setDraggingTable] = useState<{ id: string, x: number, y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.preventDefault(); // prevent text selection
    setActiveTableId(id);
    
    const table = tables.find(t => t.id === id);
    if (!table) return;

    setDraggingTable({ id, x: table.positionX, y: table.positionY });

    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      
      let xPos = ((moveEvent.clientX - containerRect.left) / containerRect.width) * 100;
      let yPos = ((moveEvent.clientY - containerRect.top) / containerRect.height) * 100;
      
      xPos = Math.max(2, Math.min(98, xPos));
      yPos = Math.max(2, Math.min(98, yPos));
      
      setDraggingTable({ id, x: xPos, y: yPos });
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      el.releasePointerCapture(upEvent.pointerId);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      
      setDraggingTable(prev => {
        if (prev && prev.id === id) {
          handleUpdateTable(id, { positionX: prev.x, positionY: prev.y });
        }
        return null;
      });
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const q = query(collection(db, "tables"), where("restaurantId", "==", user.uid));
      const snap = await getDocs(q);
      const existingIds = snap.docs.map(d => d.id);
      
      const currentIds = tables.map(t => t.id);
      const toDelete = existingIds.filter(id => !currentIds.includes(id));

      const batch = writeBatch(db);
      
      toDelete.forEach(id => {
        batch.delete(doc(db, "tables", id));
      });

      tables.forEach(table => {
        batch.set(doc(db, "tables", table.id), table);
      });

      await batch.commit();
      alert("Table layout saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save layout.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const activeTable = tables.find(t => t.id === activeTableId);

  return (
    <div className="fixed inset-0 md:left-64 p-4 lg:p-6 bg-[#f8fafc] flex flex-col z-40">
      <div className="flex justify-between items-center mb-6 shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-emerald-500" /> Floor Plan Builder
          </h1>
          <p className="text-slate-500 text-sm mt-1">Design your restaurant layout by dragging and dropping tables.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleAddTable} variant="outline" className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-11 px-5 rounded-xl font-semibold">
            <Plus className="w-4 h-4" /> Add Table
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#0A1616] hover:bg-[#0A1616]/90 text-white gap-2 h-11 px-6 rounded-xl font-semibold shadow-md">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Layout
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Main Floor Plan Area */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            {/* Area Tabs */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
                {allAreasSet.map((area) => (
                    <button
                        key={area}
                        onClick={() => {
                            setSelectedArea(area);
                            setActiveTableId(null);
                        }}
                        className={cn(
                            "px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all",
                            selectedArea === area 
                                ? "bg-white text-emerald-700 shadow-sm border border-slate-200/60" 
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent"
                        )}
                    >
                        {area}
                    </button>
                ))}
            </div>
            
            {/* Interactive Canvas */}
            <div 
                className="flex-1 relative bg-[#f1f5f9] overflow-hidden" 
                ref={containerRef}
                style={{
                    backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 0)",
                    backgroundSize: "32px 32px"
                }}
            >
                {tablesInArea.map(table => {
                    const isSelected = activeTableId === table.id;
                    const isCircle = table.shape === "circle";
                    const isDragging = draggingTable?.id === table.id;
                    const posX = isDragging ? draggingTable.x : table.positionX;
                    const posY = isDragging ? draggingTable.y : table.positionY;
                    
                    return (
                        <div
                            key={table.id}
                            id={`table-${table.id}`}
                            onPointerDown={(e) => handlePointerDown(e, table.id)}
                            style={{ 
                                left: `calc(${posX}% - ${isCircle ? 40 : 50}px)`, 
                                top: `calc(${posY}% - 40px)` 
                            }}
                            className={cn(
                                "absolute cursor-grab active:cursor-grabbing flex flex-col items-center justify-center transition-shadow duration-200 z-10 touch-none select-none",
                                isCircle ? "w-[80px] h-[80px] rounded-full" : "w-[100px] h-[80px] rounded-2xl",
                                isSelected || isDragging
                                    ? "bg-emerald-50 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 z-20 scale-105" 
                                    : "bg-white border border-slate-300 shadow-md hover:border-emerald-300 hover:shadow-lg"
                            )}
                        >
                            <span className="font-bold text-slate-800 tracking-tight text-lg">
                            {table.tableNumber}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-slate-500">
                                <Users className="w-3.5 h-3.5" /> {table.capacity}
                            </div>
                            
                            {table.isVip && (
                                <div className="absolute -top-3 -right-3 z-30 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md border-2 border-white">
                                    <Star className="w-3 h-3 fill-current" />
                                </div>
                            )}

                            {/* Chairs indicators */}
                            {!isCircle && (
                                <>
                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-t-lg bg-slate-200 -z-10" />
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-b-lg bg-slate-200 -z-10" />
                                </>
                            )}
                        </div>
                    );
                })}

                {tablesInArea.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                        <LayoutDashboard className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-500">No tables in this area</p>
                        <p className="text-sm">Click 'Add Table' to start designing</p>
                    </div>
                )}
            </div>
        </div>
        
        {/* Right Sidebar: Settings */}
        <div className="w-full lg:w-[360px] bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 flex flex-col overflow-y-auto shrink-0">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h2 className="font-bold text-xl text-slate-900">Table Settings</h2>
          </div>

          {!activeTable ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm text-center border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50">
              <Settings2 className="w-12 h-12 mb-4 text-slate-300" />
              <p>Select a table on the floor plan to edit its properties.</p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold text-sm">Table Label</Label>
                <Input 
                  value={activeTable.tableNumber} 
                  onChange={(e) => handleUpdateTable(activeTable.id, { tableNumber: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-lg font-bold"
                  placeholder="e.g. Table 1, Bar1"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-bold text-sm">Shape</Label>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => handleUpdateTable(activeTable.id, { shape: "rect" })}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold transition-all",
                            activeTable.shape === "rect" 
                                ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <Square className="w-5 h-5" /> Rectangle
                    </button>
                    <button 
                        onClick={() => handleUpdateTable(activeTable.id, { shape: "circle" })}
                        className={cn(
                            "flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold transition-all",
                            activeTable.shape === "circle" 
                                ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                    >
                        <Circle className="w-5 h-5" /> Circle
                    </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-600 font-bold text-sm">Assigned Area</Label>
                <div className="relative">
                  <select 
                    value={activeTable.area || "Main Hall"}
                    onChange={(e) => {
                        handleUpdateTable(activeTable.id, { area: e.target.value });
                        setSelectedArea(e.target.value); // Jump to the new area
                    }}
                    className="w-full border border-slate-200 rounded-xl h-12 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 appearance-none font-medium"
                  >
                    {allAreasSet.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="mt-3">
                    <Label className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Or create new area:</Label>
                    <Input 
                    placeholder="Type new area and press Enter..."
                    className="h-10 rounded-lg text-sm bg-white"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            const newArea = e.currentTarget.value.trim();
                            handleUpdateTable(activeTable.id, { area: newArea });
                            setSelectedArea(newArea);
                            e.currentTarget.value = "";
                            e.currentTarget.blur();
                        }
                    }}
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold text-sm">Capacity</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="50"
                    value={activeTable.capacity}
                    onChange={(e) => handleUpdateTable(activeTable.id, { capacity: parseInt(e.target.value) || 2 })}
                    className="h-12 rounded-xl bg-slate-50 font-bold text-lg"
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-3.5 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-amber-400 transition-all h-12">
                    <input 
                      type="checkbox" 
                      checked={activeTable.isVip}
                      onChange={(e) => handleUpdateTable(activeTable.id, { isVip: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-300"
                    />
                    <span className="font-bold text-sm text-slate-700">VIP Table</span>
                  </label>
                </div>
              </div>

              <div className="pt-8 mt-auto">
                <Button 
                  onClick={() => handleDeleteTable(activeTable.id)}
                  variant="destructive" 
                  className="w-full h-12 rounded-xl gap-2 bg-red-50 hover:bg-red-100 text-red-600 border-none font-bold shadow-sm"
                >
                  <Trash2 className="w-4 h-4" /> Delete Table
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
