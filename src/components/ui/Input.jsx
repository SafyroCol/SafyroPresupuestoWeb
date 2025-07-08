import React from "react";

export function Input({ type = "text", ...props }) {
    return (
        <input
            type={type}
            {...props}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    );
}