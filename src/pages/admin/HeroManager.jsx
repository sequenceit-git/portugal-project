import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function HeroManager() {
  const [heroImages, setHeroImages] = useState({ main: null, sub: null });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);
  const [uploadType, setUploadType] = useState(null); // 'Hero Main' | 'Hero Sub'

  const fetchHeroImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .in("tour_name", ["Hero Main", "Hero Sub"])
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error(error);
    } else if (data) {
      // Get the latest one for each type
      const main = data.find((img) => img.tour_name === "Hero Main");
      const sub = data.find((img) => img.tour_name === "Hero Sub");
      setHeroImages({ main, sub });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !uploadType) return;
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", message: "File exceeds 5MB limit." });
      return;
    }

    setUploading(true);
    setToast(null);

    // Upload to storage
    const ext = file.name.split(".").pop();
    const fileName = `hero_${Date.now()}.${ext}`;

    const { error: storageErr } = await supabase.storage
      .from("gallery")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (storageErr) {
      setToast({ type: "error", message: "Storage error: " + storageErr.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName);

    // Delete existing old one if present (optional, to keep it clean)
    const oldImage = uploadType === "Hero Main" ? heroImages.main : heroImages.sub;
    if (oldImage) {
      try {
        const url = new URL(oldImage.image_url);
        const parts = url.pathname.split("/");
        const oldFileName = parts[parts.length - 1];
        await supabase.storage.from("gallery").remove([oldFileName]);
      } catch (err) {}
      await supabase.from("gallery").delete().eq("id", oldImage.id);
    }

    // Insert new record
    const { error: dbErr } = await supabase.from("gallery").insert([
      {
        image_url: urlData.publicUrl,
        tour_name: uploadType,
        description: `Hero image for ${uploadType}`,
      },
    ]);

    if (dbErr) {
      setToast({ type: "error", message: "Database err: " + dbErr.message });
    } else {
      setToast({ type: "success", message: `${uploadType} updated successfully!` });
      fetchHeroImages();
    }

    setTimeout(() => setToast(null), 4000);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadType(null);
  };

  const triggerUpload = (type) => {
    setUploadType(type);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div>
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-fade-in ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <span className="material-icons text-xl">
            {toast.type === "success" ? "check_circle" : "error"}
          </span>
          {toast.message}
          <button
            onClick={() => setToast(null)}
            className="ml-2 opacity-70 hover:opacity-100 transition"
          >
            <span className="material-icons text-base">close</span>
          </button>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gray-900">Hero Section Manager</h2>
        <p className="text-sm text-gray-400 mt-0.5">Customize the images on the main landing page.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {/* Main Hero Image */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Main Portrait Image</h3>
          <p className="text-xs text-gray-400 mb-6 text-center">Replaces the large image on the right side of the header.</p>
          
          <div className="w-full max-w-[240px] aspect-[4/5] bg-gray-100 rounded-xl overflow-hidden shadow-inner mb-6 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">Loading...</div>
            ) : heroImages.main ? (
               <img src={heroImages.main.image_url} alt="Hero Main" className="w-full h-full object-cover" />
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                 <span className="material-icons text-5xl opacity-50">image</span>
               </div>
            )}
          </div>
          
          <button
            onClick={() => triggerUpload("Hero Main")}
            disabled={uploading}
            className="w-full max-w-[240px] flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition disabled:opacity-60 shadow-lg shadow-primary/20"
          >
            <span className="material-icons text-sm">{uploading && uploadType === "Hero Main" ? "sync" : "upload"}</span>
            {uploading && uploadType === "Hero Main" ? "Uploading..." : "Change Main Image"}
          </button>
        </div>

        {/* Sub Hero Image */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Secondary/Overlap Image</h3>
          <p className="text-xs text-gray-400 mb-6 text-center">Replaces the small overlapping tilted image.</p>
          
          <div className="w-full max-w-[160px] aspect-[4/5] bg-gray-100 transform -rotate-3 rounded-xl overflow-hidden shadow-inner border-[3px] border-white mb-6 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 transform rotate-3">Loading...</div>
            ) : heroImages.sub ? (
               <img src={heroImages.sub.image_url} alt="Hero Sub" className="w-full h-full object-cover" />
            ) : (
               <div className="absolute inset-0 flex items-center justify-center text-gray-300 transform rotate-3">
                 <span className="material-icons text-4xl opacity-50">image</span>
               </div>
            )}
          </div>
          
          <button
            onClick={() => triggerUpload("Hero Sub")}
            disabled={uploading}
            className="w-full max-w-[240px] flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition disabled:opacity-60 shadow-lg shadow-primary/20 mt-auto"
          >
            <span className="material-icons text-sm">{uploading && uploadType === "Hero Sub" ? "sync" : "upload"}</span>
            {uploading && uploadType === "Hero Sub" ? "Uploading..." : "Change Sub Image"}
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
