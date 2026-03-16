import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

/* ─────────────────────────────────────────────────────────────
   Delete Confirm Modal
───────────────────────────────────────────────────────────── */
const DeleteConfirm = ({ tour, onCancel, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("tours").delete().eq("id", tour.id);
    setDeleting(false);
    if (error) {
      alert("Error deleting tour: " + error.message);
    } else {
      onDeleted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="material-icons text-red-500 text-3xl">
            delete_forever
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          Delete Tour?
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          <span className="font-semibold text-gray-800">"{tour.name}"</span>{" "}
          will be permanently deleted from the database. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
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
                Yes, Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default DeleteConfirm;
