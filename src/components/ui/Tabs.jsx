// src/components/ui/Tabs.jsx

import { useState } from "react";

export default function Tabs({ value, onValueChange, children }) {
  const tabs = children.filter(Boolean);
  return (
    <div>
      <div className="flex border-b border-gray-300 dark:border-gray-600 mb-3">
        {tabs.map(tab => (
          <button
            key={tab.props.value}
            className={`px-4 py-2 transition ${
              value === tab.props.value
                ? "border-b-2 border-blue-600 dark:border-blue-400 font-bold text-blue-700 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
            onClick={() => onValueChange(tab.props.value)}
            type="button"
          >
            {tab.props.title}
          </button>
        ))}
      </div>
      <div className="py-2">
        {tabs.find(tab => tab.props.value === value)}
      </div>
    </div>
  );
}

export function Tab({ children }) {
  return children;
}
