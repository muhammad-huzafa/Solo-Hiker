"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTrip({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Kya aap sure hain? Yeh trip permanently delete ho jayegi."
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch("/api/admin/delete-trip", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      router.refresh();
      
    } catch (error) {
      alert("Kuch ghalat hua — dobara try karo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
     className="text-red-400 hover:text-red-600 text-sm transition-colors"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}