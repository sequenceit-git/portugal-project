import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

/* ─────────────────────────────────────────────────────────────
   Gallery Manager  (upload / delete gallery images)
───────────────────────────────────────────────────────────── */
const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const [form, setForm] = useState({ tour_name: "", description: "" });
  const [customTag, setCustomTag] = useState("");
  const [files, setFiles] = useState([]); // array of File objects
  const [tourOptions, setTourOptions] = useState([]);
  const [tourDropdownOpen, setTourDropdownOpen] = useState(false);
  const tourDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!tourDropdownOpen) return;

    const handler = (e) => {
      if (
        tourDropdownRef.current &&
        !tourDropdownRef.current.contains(e.target)
      ) {
        setTourDropdownOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [tourDropdownOpen]);

  const fetchTourOptions = async () => {
    const { data } = await supabase.from("tours").select("name").order("name");
    if (data && data.length > 0) {
      setTourOptions([...data.map((t) => t.name), "Other"]);
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setImages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
    fetchTourOptions();
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const oversized = selected.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length) {
      setUploadError(
        `${oversized.length} file(s) exceed 5 MB and were skipped.`,
      );
    } else {
      setUploadError("");
    }
    const valid = selected.filter((f) => f.size <= 5 * 1024 * 1024);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !existingNames.has(f.name))];
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length) {
      setUploadError("Please select at least one image.");
      return;
    }
    let finalTourName = form.tour_name.trim();
    if (finalTourName === "Other") {
      finalTourName = customTag.trim();
    }
    if (!finalTourName) {
      setUploadError("Tour / tag name is required.");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadProgress({ done: 0, total: files.length });

    const errors = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = f.name.split(".").pop();
      const fileName = `gallery_${Date.now()}_${i}.${ext}`;

      const { error: storageErr } = await supabase.storage
        .from("gallery")
        .upload(fileName, f, { cacheControl: "3600", upsert: false });

      if (storageErr) {
        errors.push(`${f.name}: ${storageErr.message}`);
        setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
        continue;
      }

      const { data: urlData } = supabase.storage
        .from("gallery")
        .getPublicUrl(fileName);

      const { error: dbErr } = await supabase.from("gallery").insert([
        {
          image_url: urlData.publicUrl,
          tour_name: finalTourName,
          description: form.description.trim() || null,
        },
      ]);

      if (dbErr) errors.push(`${f.name}: ${dbErr.message}`);
      setUploadProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    if (errors.length)
      setUploadError("Some uploads failed: " + errors.join(" | "));

    const succeeded = files.length - errors.length;
    if (succeeded > 0 && errors.length === 0) {
      setToast({
        type: "success",
        message: `${succeeded} photo${succeeded !== 1 ? "s" : ""} uploaded successfully!`,
      });
    } else if (succeeded > 0 && errors.length > 0) {
      setToast({
        type: "error",
        message: `${succeeded} uploaded, ${errors.length} failed.`,
      });
    } else {
      setToast({ type: "error", message: "Upload failed. Please try again." });
    }
    setTimeout(() => setToast(null), 4000);

    // Reset
    setFiles([]);
    setForm({ tour_name: "", description: "" });
    setCustomTag("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });
    fetchImages();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    // Extract filename from URL to delete from storage
    try {
      const url = new URL(deleteTarget.image_url);
      const parts = url.pathname.split("/");
      const fileName = parts[parts.length - 1];
      await supabase.storage.from("gallery").remove([fileName]);
    } catch (_) {
      /* storage delete is best-effort */
    }

    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", deleteTarget.id);

    setDeleting(false);
    setDeleteTarget(null);
    if (!error) fetchImages();
    else alert("Delete failed: " + error.message);
  };

  return (
    <div>
      {/* Toast notification */}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {images.length} photo{images.length !== 1 ? "s" : ""} in gallery
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-icons text-primary text-base">
            add_photo_alternate
          </span>
          Upload Photos
        </h3>
        <form onSubmit={handleUpload} className="space-y-4">
          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-primary/40 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-primary/5"
          >
            {files.length > 0 ? (
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-wrap justify-center gap-2">
                  {files.map((f, idx) => (
                    <div key={idx} className="relative group/thumb">
                      <img
                        src={URL.createObjectURL(f)}
                        alt={f.name}
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFiles((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition shadow"
                      >
                        <span className="material-icons text-[11px]">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {files.length} photo{files.length !== 1 ? "s" : ""} selected
                </p>
                <p className="text-xs text-primary font-semibold">
                  Click to add more
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <span className="material-icons text-4xl">cloud_upload</span>
                <p className="text-sm font-semibold">Click to select images</p>
                <p className="text-xs">
                  JPG, PNG, WEBP · Max 5 MB each · Multiple allowed
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div ref={tourDropdownRef} className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Tour / Tag Name <span className="text-red-400">*</span>
              </label>
              {/* Trigger button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTourDropdownOpen((o) => !o);
                }}
                className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition bg-white text-left"
              >
                <span
                  className={form.tour_name ? "text-gray-900" : "text-gray-400"}
                >
                  {form.tour_name || "— Select a tour —"}
                </span>
                <span
                  className={`material-icons text-base text-gray-400 transition-transform ${tourDropdownOpen ? "rotate-180" : ""}`}
                >
                  expand_more
                </span>
              </button>
              {/* Scrollable list panel */}
              {tourDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto max-h-48">
                  {tourOptions.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm((f) => ({ ...f, tour_name: name }));
                        setTourDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition ${
                        form.tour_name === name
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Caption{" "}
                <span className="text-gray-300 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Short description for this photo"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          </div>

          {form.tour_name === "Other" && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Custom Tag Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="e.g. Hero Section, About Us"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          )}

          {uploadError && (
            <p className="text-red-500 text-sm flex items-center gap-1.5">
              <span className="material-icons text-base">error</span>
              {uploadError}
            </p>
          )}

          {uploading && uploadProgress.total > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  Uploading {uploadProgress.done} of {uploadProgress.total}…
                </span>
                <span>
                  {Math.round(
                    (uploadProgress.done / uploadProgress.total) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${(uploadProgress.done / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-primary/20"
          >
            {uploading ? (
              <>
                <span className="material-icons animate-spin text-base">
                  refresh
                </span>
                Uploading {uploadProgress.done}/{uploadProgress.total}…
              </>
            ) : (
              <>
                <span className="material-icons text-base">upload</span>
                Upload {files.length > 1 ? `${files.length} Photos` : "Photo"}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : images.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-icons text-5xl text-gray-200 block mb-3">
            image_not_supported
          </span>
          <p className="text-gray-400">
            No gallery images yet. Upload the first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100 shadow-sm"
            >
              <img
                src={img.image_url}
                alt={img.description || img.tour_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex flex-col items-start justify-end p-2 gap-1">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide truncate max-w-full">
                  {img.tour_name}
                </span>
                {img.description && (
                  <p className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] leading-tight line-clamp-2">
                    {img.description}
                  </p>
                )}
              </div>
              {/* Delete Button */}
              <button
                onClick={() => setDeleteTarget(img)}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                title="Delete image"
              >
                <span className="material-icons text-sm">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden mb-1">
                <img
                  src={deleteTarget.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-icons text-red-500 text-xl">
                  delete_forever
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Delete Photo?
              </h3>
              <p className="text-sm text-gray-500">
                This will permanently remove the photo from the gallery and
                storage. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <span className="material-icons animate-spin text-base">
                      sync
                    </span>
                    Deleting…
                  </>
                ) : (
                  <>
                    <span className="material-icons text-base">delete</span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
