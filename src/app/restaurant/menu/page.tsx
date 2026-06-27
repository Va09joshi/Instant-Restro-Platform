"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { MenuCategory, MenuItem } from "@/types/firestore";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, Image as ImageIcon, UploadCloud, Folder, Save, Smartphone, Loader2, Download } from "lucide-react";

export default function RestaurantMenuPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Real CRUD Tracking
  const [deletedCategoryIds, setDeletedCategoryIds] = useState<string[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);

  // MOCK RESTAURANT DATA FOR PREVIEW
  const restaurantName = "The Artisan Kitchen";

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const catQ = query(collection(db, "menuCategories"), where("restaurantId", "==", user.uid));
        const itemQ = query(collection(db, "menuItems"), where("restaurantId", "==", user.uid));
        
        const [catSnap, itemSnap] = await Promise.all([getDocs(catQ), getDocs(itemQ)]);
        
        const catData = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MenuCategory).sort((a, b) => a.order - b.order);
        const itemData = itemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MenuItem);
        
        setCategories(catData);
        setItems(itemData);
        if (catData.length > 0) setActiveCategoryId(catData[0].id);
      } catch (err) {
        console.error("Failed to fetch menu", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAddCategory = () => {
    const newId = `CAT-${Date.now()}`;
    const newCat: MenuCategory = {
      id: newId,
      restaurantId: user!.uid,
      name: `New Category`,
      order: categories.length,
    };
    setCategories([...categories, newCat]);
    setActiveCategoryId(newId);
  };

  const handleUpdateCategory = (id: string, name: string) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleDeleteCategory = (id: string) => {
    // Track for Firebase deletion
    setDeletedCategoryIds([...deletedCategoryIds, id]);
    
    // Also track all items inside this category as deleted
    const itemsToDelete = items.filter(i => i.categoryId === id);
    if (itemsToDelete.length > 0) {
      setDeletedItemIds([...deletedItemIds, ...itemsToDelete.map(i => i.id)]);
    }

    setCategories(categories.filter(c => c.id !== id));
    setItems(items.filter(i => i.categoryId !== id));
    if (activeCategoryId === id) {
      setActiveCategoryId(categories.length > 1 ? categories.find(c => c.id !== id)?.id || null : null);
    }
  };

  const handleAddItem = () => {
    if (!activeCategoryId) return;
    const newId = `ITEM-${Date.now()}`;
    const newItem: MenuItem = {
      id: newId,
      restaurantId: user!.uid,
      categoryId: activeCategoryId,
      name: "New Dish",
      description: "",
      price: 0,
      isAvailable: true,
      image: "",
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, updates: Partial<MenuItem>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const handleDeleteItem = (id: string) => {
    setDeletedItemIds([...deletedItemIds, id]);
    setItems(items.filter(i => i.id !== id));
  };

  // Cloudinary Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImageId(itemId);

    // Read Cloudinary details from environment variables
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""; 
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      // Mock upload for demonstration since credentials aren't provided yet
      setTimeout(() => {
        const fakeUrl = URL.createObjectURL(file);
        handleUpdateItem(itemId, { image: fakeUrl });
        setUploadingImageId(null);
      }, 1500);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        handleUpdateItem(itemId, { image: data.secure_url });
      } else {
        throw new Error("Failed to upload");
      }
    } catch (err) {
      console.error(err);
      alert("Image upload failed.");
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      // Upsert current categories and items
      categories.forEach(cat => batch.set(doc(db, "menuCategories", cat.id), cat));
      items.forEach(item => batch.set(doc(db, "menuItems", item.id), item));
      
      // Delete removed categories and items
      deletedCategoryIds.forEach(id => batch.delete(doc(db, "menuCategories", id)));
      deletedItemIds.forEach(id => batch.delete(doc(db, "menuItems", id)));

      await batch.commit();
      
      // Clear deletion tracking
      setDeletedCategoryIds([]);
      setDeletedItemIds([]);
      
      alert("Menu saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save menu.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setGeneratingPDF(true);
    try {
      // html-to-image bypasses the "lab color" CSS parsing issue present in html2canvas
      const imgData = await htmlToImage.toJpeg(pdfRef.current, { 
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // We need to calculate height based on the generated image
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => { img.onload = resolve; });
      
      const pdfHeight = (img.height * pdfWidth) / img.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      const fileName = `${restaurantName.replace(/\s+/g, '_')}_Menu.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF generation failed", error);
      alert("Failed to generate PDF. Make sure all images have loaded.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <div className="w-64 h-8 bg-slate-200 rounded-lg"></div>
            <div className="w-96 h-4 bg-slate-200 rounded-md"></div>
          </div>
          <div className="w-36 h-10 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex-1 flex gap-6 min-h-0">
          <div className="w-64 bg-slate-100 border border-slate-200 rounded-2xl"></div>
          <div className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const activeCategory = categories.find(c => c.id === activeCategoryId);
  const activeItems = items.filter(i => i.categoryId === activeCategoryId);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Menu Management 2.0</h1>
          <p className="text-slate-500 text-sm mt-1">Upload mouth-watering images and see exactly what your customers see.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleDownloadPDF} disabled={generatingPDF} variant="outline" className="gap-2 px-6">
            {generatingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
            {generatingPDF ? "Generating..." : "Download PDF"}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-[#1A3636] hover:bg-[#1A3636]/90 text-white gap-2 px-8">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish Menu
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* Column 1: Categories (Left) */}
        <div className="w-64 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-[#1A3636]" />
              <span className="font-bold text-sm text-[#1A3636]">Categories</span>
            </div>
            <Button onClick={handleAddCategory} variant="ghost" size="icon" className="w-8 h-8 hover:bg-emerald-50 hover:text-emerald-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {categories.length === 0 ? (
              <div className="text-center p-6 text-sm text-slate-400">Create a category to begin.</div>
            ) : (
              categories.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`group flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all border border-transparent
                    ${activeCategoryId === cat.id ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm' : 'hover:bg-slate-50 hover:border-slate-200 text-slate-600'}
                  `}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
                    <input 
                      className={`bg-transparent outline-none font-semibold text-sm w-full cursor-pointer focus:cursor-text
                        ${activeCategoryId === cat.id ? 'text-emerald-900' : 'text-slate-700'}
                      `}
                      value={cat.name}
                      onChange={(e) => handleUpdateCategory(cat.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  {activeCategoryId === cat.id && (
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }} className="p-1 hover:bg-red-100 text-red-500 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Items Editing & Image Upload (Middle) */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
          {!activeCategory ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-slate-300" />
              </div>
              <p>Select or create a category to add dishes.</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{activeCategory.name}</h2>
                  <p className="text-sm text-slate-500">{activeItems.length} items currently in this category</p>
                </div>
                <Button onClick={handleAddItem} className="gap-2 bg-[#1A3636] text-white hover:bg-[#1A3636]/90 shadow-md">
                  <Plus className="w-4 h-4" /> Add Dish
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
                  <AnimatePresence>
                    {activeItems.length === 0 && (
                      <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                        No dishes in this category yet. Click Add Dish to start!
                      </div>
                    )}
                    {activeItems.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-5 rounded-[1.25rem] border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col gap-5 group relative overflow-hidden"
                      >
                        <div className="flex gap-5">
                          {/* Image Upload Box */}
                          <div className="relative w-32 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex-shrink-0 group/img">
                            {item.image ? (
                              <>
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                  <Label htmlFor={`upload-${item.id}`} className="cursor-pointer text-white font-semibold text-xs hover:underline flex items-center gap-1">
                                    <UploadCloud className="w-4 h-4" /> Replace
                                  </Label>
                                </div>
                              </>
                            ) : (
                              <Label htmlFor={`upload-${item.id}`} className="flex flex-col items-center justify-center h-full w-full cursor-pointer hover:bg-slate-200/50 transition-colors">
                                {uploadingImageId === item.id ? (
                                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                ) : (
                                  <>
                                    <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Add Photo</span>
                                  </>
                                )}
                              </Label>
                            )}
                            <input 
                              type="file" 
                              id={`upload-${item.id}`} 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleImageUpload(e, item.id)}
                              disabled={uploadingImageId === item.id}
                            />
                          </div>
                          
                          {/* Item Details Form */}
                          <div className="flex-1 space-y-4 pt-1">
                            <div className="flex justify-between gap-4">
                              <div className="flex-1 space-y-1.5">
                                <Label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dish Name</Label>
                                <Input 
                                  value={item.name}
                                  onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                                  className="font-bold text-base bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all h-10 px-3 rounded-xl"
                                />
                              </div>
                              <div className="w-28 space-y-1.5">
                                <Label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Price ($)</Label>
                                <Input 
                                  type="number"
                                  value={item.price || ""}
                                  onChange={(e) => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                                  className="font-bold text-base bg-emerald-50/50 border-emerald-100 text-emerald-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all h-10 px-3 rounded-xl text-right"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <Label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Description</Label>
                              <Input 
                                value={item.description}
                                onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                                placeholder="Describe ingredients, preparation, allergies..."
                                className="bg-slate-50 border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm text-slate-600 h-10 px-3 rounded-xl"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <div className="flex items-center gap-3 pl-2">
                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Availability</Label>
                            <button
                              onClick={() => handleUpdateItem(item.id, { isAvailable: !item.isAvailable })}
                              className={`w-11 h-6 rounded-full transition-colors relative
                                ${item.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}
                              `}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm
                                ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}
                              `} />
                            </button>
                            <span className="text-xs font-medium text-slate-400">{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                          </div>

                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-xs font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </>
          )}
        </div>


      </div>

      {/* Hidden PDF Template (A4 Proportions: 794px width x 1123px height roughly) */}
      <div className="absolute -left-[9999px] top-0 opacity-0 pointer-events-none z-[-1]">
        <div ref={pdfRef} className="w-[794px] bg-[#fdfbf7] text-slate-800 font-serif relative" style={{ minHeight: "1123px" }}>
          
          {/* Elegant Top Border */}
          <div className="h-4 w-full bg-[#1A3636]"></div>

          <div className="p-14">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-6xl font-black tracking-tighter text-[#1A3636] mb-3">{restaurantName}</h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-12 bg-emerald-600/30"></div>
                <p className="text-emerald-700 font-semibold uppercase tracking-[0.3em] text-sm">Finest Selection</p>
                <div className="h-[1px] w-12 bg-emerald-600/30"></div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="space-y-14">
              {categories.filter(cat => items.some(i => i.categoryId === cat.id)).map(cat => {
                const catItems = items.filter(i => i.categoryId === cat.id);
                return (
                  <div key={cat.id}>
                    {/* Category Header */}
                    <div className="flex items-center justify-center mb-8 relative">
                      <div className="absolute left-0 right-0 h-[1px] bg-[#1A3636]/10 z-0"></div>
                      <h2 className="text-3xl font-bold text-[#1A3636] uppercase tracking-widest text-center px-6 bg-[#fdfbf7] relative z-10">{cat.name}</h2>
                    </div>

                    {/* Items Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                      {catItems.map(item => (
                        <div key={item.id} className="flex gap-5 items-start">
                          {item.image && (
                            <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-md">
                              <img src={item.image} className="w-full h-full object-cover" crossOrigin="anonymous" alt="" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 pt-1">
                            <div className="flex justify-between items-baseline mb-2 gap-2">
                              <h3 className="font-bold text-xl text-[#1A3636] leading-tight truncate">{item.name || "Unnamed Dish"}</h3>
                              <div className="flex-1 border-b-[2px] border-dotted border-slate-300 mx-2 relative top-[-6px]"></div>
                              <span className="font-bold text-emerald-700 text-lg whitespace-nowrap">${item.price}</span>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed italic">{item.description}</p>
                            {!item.isAvailable && (
                              <span className="inline-block mt-2 text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full uppercase tracking-wider">Sold Out</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-[#1A3636]/10 text-center bg-[#fdfbf7]">
            <p className="text-xs text-slate-400 font-medium tracking-widest uppercase">Prepared Exclusively for Our Guests</p>
          </div>
          
        </div>
      </div>

    </div>
  );
}
