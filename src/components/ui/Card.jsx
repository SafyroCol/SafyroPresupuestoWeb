import React from "react";

export default function Card({ title, description, icon, footer, children }) {
    return (
        <div className="rounded-2xl shadow-md bg-white dark:bg-zinc-900 p-6 space-y-4 transition-colors">
            <div className="flex items-center space-x-4">
                {icon && <div className="text-primary">{icon}</div>}
                <h3 className="text-xl font-semibold text-zinc-800 dark:text-white">{title}</h3>
            </div>

            {description && (
                <p className="text-zinc-600 dark:text-zinc-300 text-sm">{description}</p>
            )}

            {children && <div className="text-zinc-700 dark:text-zinc-200">{children}</div>}

            {footer && (
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    {footer}
                </div>
            )}
        </div>
    );
}
