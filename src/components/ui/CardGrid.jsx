// src/components/ui/CardGrid.jsx
import React from "react";

export default function CardGrid({ children }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
        </div>
    );
}
