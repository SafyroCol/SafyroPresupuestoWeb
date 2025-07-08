import React from "react";

export function Button({ className = "", children, ...props }) {
    return (
        <button
            className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
