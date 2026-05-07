"use client"; // 👈 zaroor likhna — yeh browser mein chalega

import { useState } from "react";
import { useRouter } from "next/navigation";

// userId prop ke zariye parent se user ka id milta hai
export default function DeleteUser({ userId }: { userId: string }) {
  const router = useRouter();
  
  // Loading state — button click ke baad "Deleting..." dikhane ke liye
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    // Pehle confirm karo — galti se delete na ho jaye
    const confirmed = window.confirm(
      "Kya aap sure hain? Yeh action undo nahi ho sakta."
    );
    if (!confirmed) return;

    setLoading(true);

    try {
      // Admin delete API ko call karo
      const response = await fetch("/api/admin/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      // Page refresh karo taake updated list dikhe
      // router.refresh() sirf data re-fetch karta hai — full page reload nahi
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
     className="text-xs border border-red-200 text-red-500 rounded-lg px-2 py-1 hover:bg-red-50 transition-colors"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}