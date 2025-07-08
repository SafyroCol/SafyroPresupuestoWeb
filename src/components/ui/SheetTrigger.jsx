import React from "react";

export function SheetTrigger({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
    >
      {children}
    </button>
  );
}