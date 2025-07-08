import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const menuItems = [
    {
        title: "Presupuestos",
        links: [
            { label: "Resumen", to: "/presupuestos" },
            { label: "Materiales", to: "/materiales" },
            { label: "Mano de Obra", to: "/mano-obra" },
            { label: "Equipos", to: "/equipos" },
        ],
    },
    {
        title: "Empresas",
        links: [
            { label: "Listado", to: "/empresas" },
            { label: "Crear", to: "/empresas/nueva" },
        ],
    },
    {
        title: "Usuarios",
        links: [
            { label: "Perfil", to: "/perfil" },
            { label: "Cerrar sesión", to: "/logout" },
        ],
    },
];

export default function MobileAccordionMenu() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="w-full md:hidden">
            {menuItems.map((item, index) => (
                <div key={index} className="border-b border-gray-200">
                    <button
                        onClick={() => toggle(index)}
                        className="w-full flex justify-between items-center px-4 py-3 text-left text-gray-800 font-medium"
                    >
                        <span>{item.title}</span>
                        <ChevronDownIcon
                            className={`h-5 w-5 transform transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                                }`}
                        />
                    </button>
                    <div
                        className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-96" : "max-h-0"
                            }`}
                    >
                        <ul className="flex flex-col px-6 py-2 bg-gray-50">
                            {item.links.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        to={link.to}
                                        className="block py-2 text-sm text-gray-700 hover:text-blue-600"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}
