import { useState } from "react";

// 1. Define common format presets outside the component
export const DATE_FORMAT_PRESETS = [
    { label: "ISO (yyyy-MM-dd)", value: "yyyy-MM-dd" },
    { label: "German / EU (dd.MM.yyyy)", value: "dd.MM.yyyy" },
    { label: "US Standard (MM/dd/yyyy)", value: "MM/dd/yyyy" },
    { label: "Short (dd/MM/yy)", value: "dd/MM/yy" },
];

export const TIME_FORMAT_PRESETS = [
    { label: "24-Hour (HH:mm:ss)", value: "HH:mm:ss" },
    { label: "24-Hour No Seconds (HH:mm)", value: "HH:mm" },
    { label: "12-Hour AM/PM (hh:mm:ss tt)", value: "hh:mm:ss tt" },
    { label: "12-Hour No Seconds (hh:mm tt)", value: "hh:mm tt" },
];

export const DATETIME_FORMAT_PRESETS = [
    { label: "ISO 8601 (yyyy-MM-dd HH:mm:ss)", value: "yyyy-MM-dd HH:mm:ss" },
    { label: "German / EU (dd.MM.yyyy HH:mm:ss)", value: "dd.MM.yyyy HH:mm:ss" },
    { label: "US Standard (MM/dd/yyyy hh:mm:ss tt)", value: "MM/dd/yyyy hh:mm:ss tt" },
    { label: "ISO T-Format (yyyy-MM-ddTHH:mm:ss)", value: "yyyy-MM-ddTHH:mm:ss" },
];

// Helper component to render Dropdown + Custom Input seamlessly
interface FormatSelectorProps {
    label: string;
    value: string;
    presets: { label: string; value: string }[];
    onChange: (val: string) => void;
    customDefault?: string;
}

const FormatSelector = ({
    label,
    value,
    presets,
    customDefault = "yyyy-MM-dd HH:mm:ss",
    onChange,
}: FormatSelectorProps) => {
    const isValueInPresets = presets.some((p) => p.value === value);

    // Initialize custom mode if value is not in presets
    const [isCustomSelected, setIsCustomSelected] = useState<boolean>(!isValueInPresets);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;

        if (selected === "custom") {
            setIsCustomSelected(true);
            // Trigger onChange with custom default if switching from a preset
            if (isValueInPresets) {
                onChange(customDefault);
            }
        } else {
            setIsCustomSelected(false);
            onChange(selected);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
            <label
                style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--secondary)",
                    display: "block",
                }}
            >
                {label}
            </label>

            <select
                value={isCustomSelected ? "custom" : value}
                onChange={handleSelectChange}
                style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: "1px solid var(--outline-variant)",
                    fontSize: "13px",
                    background: "white",
                    cursor: "pointer",
                    textOverflow: "ellipsis",
                }}
            >
                {presets.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                        {preset.label}
                    </option>
                ))}
                <option value="custom">-- Custom Format --</option>
            </select>

            {/* Display input box whenever custom mode is explicitly selected OR value is not in presets */}
            {(isCustomSelected || !isValueInPresets) && (
                <input
                    type="text"
                    placeholder="Enter format specifier..."
                    value={value}
                    onChange={(e) => {
                        setIsCustomSelected(true);
                        onChange(e.target.value);
                    }}
                    style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--primary)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        background: "white",
                        boxSizing: "border-box",
                    }}
                />
            )}
        </div>
    );
}
export default FormatSelector