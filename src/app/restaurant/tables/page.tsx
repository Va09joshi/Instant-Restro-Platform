"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { Table, TableShape } from "@/types/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Save, Trash2, Star, GripVertical, Settings2, Users } from "lucide-react";

const DEFAULT_AREAS = ["Main Hall", "A/C", "Non A/C", "Bar", "Outdoor"];

export default function RestaurantTablesPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTableId, setActiveTableId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchTables = async () => {
      try {
        const q = query(collection(db, "tables"), where("restaurantId", "==", user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Table);
        setTables(data);
      } catch (err) {
        console.error("Failed to fetch tables", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, [user]);

  const handleAddTable = (areaName: string = "Main Hall") => {
    const newId = `T${tables.length + 1}-${Math.floor(Math.random() * 1000)}`;
    const newTable: Table = {
      id: newId,
      restaurantId: user!.uid,
      tableNumber: `Table ${tables.length + 1}`,
      capacity: 2,
      shape: "rect",
      isVip: false,
      area: areaName,
      positionX: 0,
      positionY: 0,
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

  // Group tables by area
  const groupedTables = useMemo(() => {
    const groups: Record<string, Table[]> = {};
    // Ensure default areas exist even if empty initially, so they can add to them
    DEFAULT_AREAS.forEach(a => groups[a] = []);
    
    tables.forEach(table => {
      const area = table.area || "Main Hall";
      if (!groups[area]) groups[area] = [];
      groups[area].push(table);
    });
    
    // Remove empty groups unless it's the "Main Hall"
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0 && key !== "Main Hall" && !DEFAULT_AREAS.includes(key)) {
        delete groups[key];
      }
    });

    return groups;
  }, [tables]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const activeTable = tables.find(t => t.id === activeTableId);

  return (
    <div className="fixed inset-0 md:left-64 p-4 lg:p-6 bg-slate-50 flex flex-col z-40">
      <div className="flex justify-between items-center mb-6 shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Table Management</h1>
          <p className="text-slate-500 text-sm mt-1">Organize tables by area for easy booking.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => handleAddTable("Main Hall")} variant="outline" className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            <Plus className="w-4 h-4" /> Add Table
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#0A1616] hover:bg-[#0A1616]/90 text-white gap-2 px-6">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Main Area: Categorized Grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-2">
          {Object.entries(groupedTables).map(([area, areaTables]) => {
            // Only show area if it has tables or is a default area
            if (areaTables.length === 0 && !DEFAULT_AREAS.includes(area)) return null;

            return (
              <div key={area} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                    {area}
                  </h2>
                  <Button onClick={() => handleAddTable(area)} variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                    <Plus className="w-4 h-4 mr-1" /> Add to {area}
                  </Button>
                </div>
                
                <div className="p-6">
                  {areaTables.length === 0 ? (
                    <div className="text-center py-8 text-sm text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                      No tables in {area}. Click 'Add' to create one.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-x-10 gap-y-6 pt-4 px-2">
                      {areaTables.map(table => {
                        const isSelected = activeTableId === table.id;
                        
                        return (
                          <button
                            key={table.id}
                            onClick={() => setActiveTableId(table.id)}
                            className="relative outline-none group"
                            style={{ width: '100px', height: '64px' }}
                          >
                            {/* Main Table Body */}
                            <div 
                              className={`absolute inset-0 flex flex-col items-center justify-center rounded-[14px] border transition-colors duration-200 z-10
                                ${isSelected 
                                  ? 'bg-gradient-to-b from-blue-50/50 to-slate-100 border-[#3b82f6]' 
                                  : 'bg-gradient-to-b from-white to-slate-50 border-slate-200 group-hover:border-slate-300'
                                }
                              `}
                            >
                              <span className="font-bold text-slate-800 text-sm tracking-tight relative z-20">
                                {table.tableNumber}
                              </span>
                              <div className="flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-slate-500 relative z-20">
                                <Users className="w-3 h-3" /> {table.capacity}
                              </div>
                            </div>
                            
                            {/* Left Semi-circle */}
                            <div className={`absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-5 rounded-full border bg-white transition-colors duration-200 z-0
                                ${isSelected ? 'border-[#3b82f6]' : 'border-slate-200 group-hover:border-slate-300'}
                              `}
                            />
                            
                            {/* Right Semi-circle */}
                            <div className={`absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-5 rounded-full border bg-white transition-colors duration-200 z-0
                                ${isSelected ? 'border-[#3b82f6]' : 'border-slate-200 group-hover:border-slate-300'}
                              `}
                            />

                            {/* Admin specific action buttons / VIP tags */}
                            {table.isVip && (
                              <div className="absolute -top-2.5 -right-2.5 z-30 bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 border border-amber-300">
                                <Star className="w-2 h-2 fill-current" />
                              </div>
                            )}

                            {/* Hover settings indicator */}
                            {!isSelected && (
                              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                <div className="bg-white text-slate-600 shadow border border-slate-200 rounded-full p-1"><Settings2 className="w-3 h-3" /></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Right Column: Sidebar Controls */}
        <div className="w-[340px] bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 flex flex-col overflow-y-auto scrollbar-hide shrink-0">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h2 className="font-bold text-lg text-slate-900">Table Settings</h2>
          </div>

          {!activeTable ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm text-center border-2 border-dashed border-slate-100 rounded-2xl p-6">
              Select a table from the grid to edit its properties.
            </div>
          ) : (
            <div className="space-y-6 flex-1 overflow-y-auto">
              <div className="space-y-1.5">
                <Label className="text-slate-500 font-bold uppercase tracking-wider text-xs">Table Label</Label>
                <Input 
                  value={activeTable.tableNumber} 
                  onChange={(e) => handleUpdateTable(activeTable.id, { tableNumber: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50"
                  placeholder="e.g. T1, Bar1"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-500 font-bold uppercase tracking-wider text-xs">Assigned Area</Label>
                <div className="relative">
                  <select 
                    value={activeTable.area || "Main Hall"}
                    onChange={(e) => handleUpdateTable(activeTable.id, { area: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl h-11 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 appearance-none"
                  >
                    {DEFAULT_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    {/* If the table has a custom area not in defaults, show it */}
                    {activeTable.area && !DEFAULT_AREAS.includes(activeTable.area) && (
                      <option value={activeTable.area}>{activeTable.area}</option>
                    )}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">To create a new area, type it below:</p>
                <Input 
                  placeholder="Custom area name..."
                  className="h-9 rounded-lg text-sm mt-1"
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      handleUpdateTable(activeTable.id, { area: e.target.value.trim() });
                      e.target.value = "";
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur();
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-500 font-bold uppercase tracking-wider text-xs">Capacity</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="50"
                    value={activeTable.capacity}
                    onChange={(e) => handleUpdateTable(activeTable.id, { capacity: parseInt(e.target.value) || 2 })}
                    className="h-11 rounded-xl bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:border-emerald-400 transition-all h-11">
                    <input 
                      type="checkbox" 
                      checked={activeTable.isVip}
                      onChange={(e) => handleUpdateTable(activeTable.id, { isVip: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-sm text-slate-700">VIP Table</span>
                  </label>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 mt-auto">
                <Button 
                  onClick={() => handleDeleteTable(activeTable.id)}
                  variant="destructive" 
                  className="w-full h-12 rounded-xl gap-2 bg-red-50 hover:bg-red-100 text-red-600 border-none font-bold"
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
