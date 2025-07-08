import React from "react";

export function Sheet({ children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {children}
      </div>
    </div>
  );
}