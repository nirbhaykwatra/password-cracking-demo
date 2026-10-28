"use client";

import {useMemo, useState} from "react";

const options = [
    "All",
    "Electronics",
    "Books",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Automotive",
    "Health & Personal Care",
    "Other",
];

export function CategorySelect() {
    const [selected, setSelected] = useState(options[0]);

    const width = useMemo(() => {
        return `${selected.length + 5}ch`;
    }, [selected]);

    return (
        <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            style={{ width }}
            className="hidden bg-[#e6e6e6] px-2 text-xs text-[#555] sm:block"
        >
            {options.map((option) => (
                <option key={option}>{option}</option>
            ))}
        </select>
    );
}