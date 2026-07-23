import React, { useState, useCallback, useMemo, useRef } from "react";
import { DateTime, Duration } from "luxon";
import CopyButton from "./CopyButton";
import Switch from "./Switch";
import { TIMEZONES } from "@/lib/ticks";
import { secondsInDay } from "date-fns/constants";

interface GapRange {
    start: DateTime;
    end: DateTime;
    missingCount: number;
    durationMinutes: number;
}

const COMMON_DATE_FORMATS = [
    "yyyy-MM-dd HH:mm:ss",
    "yyyy-MM-dd HH:mm",
    "dd.MM.yyyy HH:mm:ss",
    "dd.MM.yyyy HH:mm",
    "MM/dd/yyyy HH:mm:ss",
    "MM/dd/yyyy hh:mm:ss a",
    "yyyy/MM/dd HH:mm:ss",
    "yyyy/MM/dd HH:mm",
];

const TimeseriesGapDetector = () => {
    const [file, setFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [csvRows, setCsvRows] = useState<string[][]>([]);
    const [delimiter, setDelimiter] = useState<string>(",");
    const [separateDateTime, setSeparateDateTime] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState(false);
    // Column mappings
    const [timestampCol, setTimestampCol] = useState<string>("");
    const [dateCol, setDateCol] = useState<string>("");
    const [timeCol, setTimeCol] = useState<string>("");
    const [followsDST, setFollowsDST] = useState(false);
    const [dstWarning, setDstWarning] = useState("");
    // Custom format override
    const [customDateFormat, setCustomDateFormat] = useState<string>("");
    // Separate date/time columns
    const [customSeparateDateFormat, setCustomSeparateDateFormat] = useState("");
    const [customTimeFormat, setCustomTimeFormat] = useState("");
    // Interval settings
    const [intervalQuantity, setIntervalQuantity] = useState<number>(15);
    const [intervalUnit, setIntervalUnit] = useState<"seconds" | "minutes" | "hours" | "days" | "weeks" | "Months" | "Years">("minutes");
    // const [timeZone, setTimeZone] = useState("Europe/Berlin");
    // Analysis results
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<string>("");
    const [detectedGaps, setDetectedGaps] = useState<GapRange[]>([]);
    const [summary, setSummary] = useState<{
        totalRows: number;
        validRows: number;
        invalidRows: number;
        totalMissing: number;
        timeSpanStart: DateTime;
        timeSpanEnd: DateTime;
    } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleReset = () => {
        // File
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        // CSV Data
        setCsvHeaders([]);
        setCsvRows([]);

        // Analysis
        setSummary(null);
        setDetectedGaps([]);
        setAnalysisError("");
        setDstWarning("");
        setIsAnalyzing(false);

        // Column Selection
        setSeparateDateTime(false);
        setTimestampCol("");
        setDateCol("");
        setTimeCol("");

        // File Settings
        setDelimiter(",");
        setCustomDateFormat("");

        // Interval
        setIntervalQuantity(1);
        setIntervalUnit("hours");

        // Optional: Reset DST option
        setFollowsDST(false);
    };

    // Parse CSV helper
    const parseCSV = (text: string, sep: string): string[][] => {
        const lines: string[][] = [];
        let row: string[] = [];
        let inQuotes = false;
        let currentVal = "";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    currentVal += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === sep && !inQuotes) {
                row.push(currentVal.trim());
                currentVal = "";
            } else if ((char === "\n" || char === "\r") && !inQuotes) {
                if (char === "\r" && nextChar === "\n") {
                    i++;
                }
                row.push(currentVal.trim());
                if (row.length > 1 || row[0] !== "") {
                    lines.push(row);
                }
                row = [];
                currentVal = "";
            } else {
                currentVal += char;
            }
        }
        if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
            row.push(currentVal.trim());
            lines.push(row);
        }
        return lines;
    };
    const detectDateFormat = (value: string): string => {
        const formats = [
            "yyyy-MM-dd HH:mm:ss.SSS",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm",
            "yyyy-MM-dd",

            "dd.MM.yyyy HH:mm:ss",
            "dd.MM.yyyy HH:mm",
            "dd.MM.yyyy",

            "dd/MM/yyyy HH:mm:ss",
            "dd/MM/yyyy HH:mm",
            "dd/MM/yyyy",

            "MM/dd/yyyy HH:mm:ss",
            "MM/dd/yyyy HH:mm",
            "MM/dd/yyyy",

            "yyyyMMddHHmmss",
            "yyyyMMddHHmm",
            "yyyyMMdd",

            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ss.SSS",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        ];

        const text = value.trim();

        for (const format of formats) {
            const dt = DateTime.fromFormat(text, format);

            if (dt.isValid) {
                return format;
            }
        }

        return "";
    };
    const isLastSunday = (dt: DateTime, month: number): boolean => {

        if (dt.month !== month || dt.weekday !== 7)
            return false;

        const lastDay = dt.endOf("month");

        // Luxon: Monday = 1 ... Sunday = 7
        const daysBack = lastDay.weekday % 7;

        const lastSunday = lastDay.minus({ days: daysBack });

        return dt.hasSame(lastSunday, "day");
    };
    const validateDST = (timestamps: DateTime[]) => {

        if (!followsDST)
            return "";

        let marchHas02 = false;
        let octoberHasDuplicate02 = false;

        const seen = new Set<string>();

        for (const dt of timestamps) {

            // Last Sunday of March
            if (
                dt.month === 3 &&
                isLastSunday(dt, 3) &&
                dt.hour === 2
            ) {
                marchHas02 = true;
            }

            // Last Sunday of October
            if (
                dt.month === 10 &&
                isLastSunday(dt, 10) &&
                dt.hour === 2
            ) {
                const key = dt.toFormat("yyyy-MM-dd HH:mm");

                if (seen.has(key))
                    octoberHasDuplicate02 = true;

                seen.add(key);
            }
        }

        const warnings: string[] = [];

        if (marchHas02) {
            warnings.push(
                "DST is enabled, but the uploaded file appears to contain the 02:00 hour on the DST start day. Verify whether the file is UTC or already DST-adjusted."
            );
        }

        if (!octoberHasDuplicate02) {
            warnings.push(
                "DST is enabled, but the repeated 02:00 hour was not found on the DST end day. Verify whether the file is UTC or already DST-adjusted."
            );
        }

        return warnings.join("\n");
    };
    const detectTimeFormat = (value: string): string => {

        const formats = [

            "HH:mm:ss.SSS",
            "HH:mm:ss",
            "HH:mm",

            "HHmmss",
            "HHmm",

            "hh:mm a",
            "hh:mm:ss a"
        ];

        for (const fmt of formats) {

            const dt = DateTime.fromFormat(value.trim(), fmt);

            if (dt.isValid)
                return fmt;
        }

        return "";
    };
    // Auto-detect delimiter and columns
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        processFile(selectedFile);

        // Allow selecting the same file again
        e.target.value = "";
    };
    const processFile = (selectedFile: File) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setAnalysisError("");
        setSummary(null);
        setDetectedGaps([]);
        setDstWarning("");

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            if (!text) return;

            // 1. Detect Delimiter by counting occurrences in the first line
            const firstLine = text.split(/\r?\n/)[0] || "";
            const commas = (firstLine.match(/,/g) || []).length;
            const semicolons = (firstLine.match(/;/g) || []).length;
            const tabs = (firstLine.match(/\t/g) || []).length;

            let detectedSep = ",";
            if (semicolons > commas && semicolons > tabs) detectedSep = ";";
            if (tabs > commas && tabs > semicolons) detectedSep = "\t";
            setDelimiter(detectedSep);

            // 2. Parse CSV rows
            const allRows = parseCSV(text, detectedSep);
            if (allRows.length === 0) {
                setAnalysisError("CSV file appears to be empty.");
                return;
            }

            const headers = allRows[0].map(h => h.replace(/^"|"$/g, "").trim());
            setCsvHeaders(headers);
            setCsvRows(allRows.slice(1));

            /// -----------------------------
            // ----------------------------------------------------
            // 3. Auto-detect Timestamp / Date / Time columns
            // ----------------------------------------------------

            let foundTimestamp = "";
            let foundDate = "";
            let foundTime = "";

            headers.forEach((header) => {
                const lower = header.toLowerCase();

                if (
                    lower.includes("timestamp") ||
                    lower.includes("datetime") ||
                    lower.includes("date_time") ||
                    lower.includes("date-time")
                ) {
                    if (!foundTimestamp) foundTimestamp = header;
                }
                else if (
                    lower.includes("date") ||
                    lower.includes("datum") ||
                    lower.includes("day")
                ) {
                    if (!foundDate) foundDate = header;
                }
                else if (
                    lower.includes("time") ||
                    lower.includes("zeit")
                ) {
                    if (!foundTime) foundTime = header;
                }
            });

            // fallback
            if (!foundTimestamp && !foundDate && headers.length > 0) {
                foundTimestamp = headers[0];
            }

            // update UI
            if (foundDate && foundTime) {
                setSeparateDateTime(true);
                setDateCol(foundDate);
                setTimeCol(foundTime);
            }
            else {
                setSeparateDateTime(false);
                setTimestampCol(foundTimestamp);
            }

            const dateIdx = headers.indexOf(foundDate);
            const timeIdx = headers.indexOf(foundTime);
            const tsIdx = headers.indexOf(foundTimestamp);

            const sampleRows = allRows.slice(1);

            // ----------------------------------------------------
            // 4. Detect Date / Time formats
            // ----------------------------------------------------

            if (foundDate && foundTime) {

                for (const row of sampleRows) {

                    const dateValue = row[dateIdx]?.trim();
                    const timeValue = row[timeIdx]?.trim();

                    if (!dateValue || !timeValue)
                        continue;

                    const detectedDate = detectDateFormat(dateValue);
                    const detectedTime = detectTimeFormat(timeValue);

                    if (detectedDate)
                        setCustomSeparateDateFormat(detectedDate);

                    if (detectedTime)
                        setCustomTimeFormat(detectedTime);

                    break;
                }

            }
            else {

                for (const row of sampleRows) {

                    const value = row[tsIdx]?.trim();

                    if (!value)
                        continue;

                    const detected = detectDateFormat(value);

                    if (detected) {
                        setCustomDateFormat(detected);
                        break;
                    }
                }
            }

            // ----------------------------------------------------
            // 5. Detect interval
            // ----------------------------------------------------

            const sampleDates: DateTime[] = [];

            for (const row of sampleRows) {

                if (sampleDates.length >= 4)
                    break;

                let rawValue = "";

                if (foundDate && foundTime) {

                    const date = row[dateIdx]?.trim();
                    const time = row[timeIdx]?.trim();

                    if (!date || !time)
                        continue;

                    rawValue = `${date} ${time}`;
                }
                else {

                    rawValue = row[tsIdx]?.trim() ?? "";

                    if (!rawValue)
                        continue;
                }

                const dt = parseDateValue(rawValue);

                if (dt?.isValid) {
                    sampleDates.push(dt);
                }
            }

            if (sampleDates.length >= 2) {

                const detectCalendarInterval = () => {

                    const units = [
                        "years",
                        "months",
                        "weeks",
                        "days",
                        "hours",
                        "minutes",
                        "seconds",
                    ] as const;

                    for (const unit of units) {

                        const first = sampleDates[0];
                        const second = sampleDates[1];

                        const quantity = Math.round(
                            second.diff(first, unit).get(unit)
                        );

                        if (quantity <= 0)
                            continue;

                        let matches = true;

                        for (let i = 1; i < sampleDates.length; i++) {

                            const expected = sampleDates[i - 1].plus({
                                [unit]: quantity,
                            });

                            if (Math.abs(expected.toMillis() - sampleDates[i].toMillis()) > 1000) {
                                matches = false;
                                break;
                            }
                        }

                        if (matches) {

                            switch (unit) {

                                case "years":
                                    setIntervalUnit("Years");
                                    break;

                                case "months":
                                    setIntervalUnit("Months");
                                    break;

                                case "weeks":
                                    setIntervalUnit("weeks");
                                    break;

                                case "days":
                                    setIntervalUnit("days");
                                    break;

                                case "hours":
                                    setIntervalUnit("hours");
                                    break;

                                case "minutes":
                                    setIntervalUnit("minutes");
                                    break;

                                default:
                                    setIntervalUnit("seconds");
                                    break;
                            }

                            setIntervalQuantity(quantity);
                            return;
                        }
                    }

                    // Default
                    setIntervalUnit("hours");
                    setIntervalQuantity(1);
                };

                detectCalendarInterval();
            }

        };

        reader.readAsText(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();

        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];
        if (!droppedFile) return;

        fileInputRef.current!.value = ""; // Reset input
        processFile(droppedFile);
    };

    function isDSTStartGap(
        current: DateTime,
        next: DateTime,
        expectedMs: number
    ) {
        if (
            !isLastSunday(current, 3) ||
            current.month !== 3
        ) {
            return false;
        }

        // Number of intervals in one hour
        const skippedIntervals = 60 * 60 * 1000 / expectedMs;

        return (
            next.toMillis() - current.toMillis() ===
            expectedMs * (skippedIntervals + 1)
        );
    }
    function isDSTEndRepeat(
        current: DateTime,
        next: DateTime
    ) {
        return (
            current.month === 10 &&
            current.weekday === 7 &&
            current.day > 24 &&
            next.toMillis() === current.toMillis()
        );
    }
    // Parser function targeting different date formats
    const parseDateValue = (val: string): DateTime | null => {
        if (!val) return null;

        const cleanVal = val.trim();

        // Try supported formats
        for (const fmt of COMMON_DATE_FORMATS) {
            const dt = DateTime.fromFormat(cleanVal, fmt);

            if (dt.isValid) {
                return dt;
            }
        }

        // Try custom format
        if (separateDateTime) {

            if (customSeparateDateFormat && customTimeFormat) {

                const dt = DateTime.fromFormat(
                    cleanVal,
                    `${customSeparateDateFormat} ${customTimeFormat}`
                );

                if (dt.isValid)
                    return dt;
            }

        } else {

            if (customDateFormat) {

                const dt = DateTime.fromFormat(
                    cleanVal,
                    customDateFormat
                );

                if (dt.isValid)
                    return dt;
            }
        }
        // Try ISO
        const isoDt = DateTime.fromISO(cleanVal);

        if (isoDt.isValid) {
            return isoDt;
        }

        // Try SQL
        const sqlDt = DateTime.fromSQL(cleanVal);

        if (sqlDt.isValid) {
            return sqlDt;
        }

        return null;
    };

    // Trigger analysis
    const handleAnalyze = () => {
        if (csvRows.length === 0) {
            setAnalysisError("Please upload a valid CSV file first.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError("");
        setDetectedGaps([]);

        setTimeout(() => {
            try {
                // Get indexes
                const dateIdx = csvHeaders.indexOf(dateCol);
                const timeIdx = csvHeaders.indexOf(timeCol);
                const tsIdx = csvHeaders.indexOf(timestampCol);

                if (separateDateTime && (dateIdx === -1 || timeIdx === -1)) {
                    throw new Error("Date or Time column selection is invalid.");
                }
                if (!separateDateTime && tsIdx === -1) {
                    throw new Error("Timestamp column selection is invalid.");
                }

                // 1. Map rows to timestamps
                let validRows = 0;
                let invalidRows = 0;
                const timestamps: DateTime[] = [];

                csvRows.forEach((row) => {
                    let rawVal = "";

                    if (separateDateTime) {
                        const dateStr = row[dateIdx] || "";
                        const timeStr = row[timeIdx] || "";

                        if (dateStr && timeStr) {
                            rawVal = `${dateStr} ${timeStr}`;
                        }
                    } else {
                        rawVal = row[tsIdx] || "";
                    }

                    if (!rawVal) {
                        invalidRows++;
                        return;
                    }

                    const parsed = parseDateValue(rawVal);

                    if (parsed && parsed.isValid) {
                        timestamps.push(parsed);
                        validRows++;
                    } else {
                        invalidRows++;
                    }
                });

                if (timestamps.length < 2) {
                    throw new Error("Found fewer than 2 valid datetime values. Cannot analyze gaps.");
                }
                // Validate DST
                const warning = validateDST(timestamps);
                setDstWarning(warning);
                // Sort timestamps
                timestamps.sort((a, b) => a.toMillis() - b.toMillis());



                // Scan for gaps
                const gaps: GapRange[] = [];
                let totalMissing = 0;



                // for (let i = 0; i < timestamps.length - 1; i++) {

                //     const current = timestamps[i];
                //     const next = timestamps[i + 1];

                //     const diffMs = next.toMillis() - current.toMillis();

                //     const expectedMs = Duration.fromObject({
                //         [intervalUnit]: intervalQuantity
                //     }).as("milliseconds");

                //     // Normal interval
                //     if (diffMs === expectedMs)
                //         continue;

                //     // Ignore DST transitions when enabled
                //     if (followsDST) {

                //         if (isDSTStartGap(current, next, expectedMs))
                //             continue;

                //         if (isDSTEndRepeat(current, next))
                //             continue;
                //     }

                //     // Report repeated hour when DST is OFF
                //     if (!followsDST && isDSTEndRepeat(current, next)) {

                //         gaps.push({
                //             start: current,
                //             end: current,
                //             missingCount: 1,
                //             durationMinutes: 0
                //         });

                //         totalMissing++;

                //         continue;
                //     }

                //     // Report missing hour
                //     if (diffMs > expectedMs) {

                //         const missing = Math.round(diffMs / expectedMs) - 1;

                //         gaps.push({
                //             start: current.plus({
                //                 [intervalUnit]: intervalQuantity
                //             }),
                //             end: current.plus({
                //                 [intervalUnit]: intervalQuantity * missing
                //             }),
                //             missingCount: missing,
                //             durationMinutes: diffMs / 60000
                //         });

                //         totalMissing += missing;
                //     }
                // }
                for (let i = 0; i < timestamps.length - 1; i++) {

                    const current = timestamps[i];
                    const next = timestamps[i + 1];

                    // Expected timestamp based on selected interval
                    const expected = current.plus({
                        [intervalUnit]: intervalQuantity
                    });

                    // Exact match
                    if (expected.toMillis() === next.toMillis()) {
                        continue;
                    }

                    const expectedMs =
                        expected.toMillis() - current.toMillis();

                    const diffMs =
                        next.toMillis() - current.toMillis();

                    // Ignore DST transitions
                    if (followsDST) {

                        if (isDSTStartGap(current, next, expectedMs))
                            continue;

                        if (isDSTEndRepeat(current, next))
                            continue;
                    }

                    // Duplicate hour
                    if (!followsDST && isDSTEndRepeat(current, next)) {

                        gaps.push({
                            start: current,
                            end: current,
                            missingCount: 1,
                            durationMinutes: 0
                        });

                        totalMissing++;

                        continue;
                    }

                    // Missing values
                    if (next > expected) {

                        let missing = 0;
                        let probe = expected;

                        while (probe < next) {

                            missing++;

                            probe = probe.plus({
                                [intervalUnit]: intervalQuantity
                            });
                        }

                        gaps.push({

                            start: expected,

                            end: expected.plus({
                                [intervalUnit]:
                                    intervalQuantity * (missing - 1)
                            }),

                            missingCount: missing,

                            durationMinutes:
                                diffMs / 60000
                        });

                        totalMissing += missing;
                    }
                }
                setSummary({
                    totalRows: csvRows.length,
                    validRows,
                    invalidRows,
                    totalMissing,
                    timeSpanStart: timestamps[0],
                    timeSpanEnd: timestamps[timestamps.length - 1],
                });

                setDetectedGaps(gaps);

            } catch (err: any) {
                setAnalysisError(err?.message || "An unexpected error occurred during gap analysis.");
            } finally {
                setIsAnalyzing(false);
            }
        }, 50);
    };

    // CSV representation of gaps for downloading
    const gapsCsvContent = useMemo(() => {
        if (detectedGaps.length === 0) return "";
        const header = "Gap Start,Gap End,Duration (Mins),Missing Points Count\n";
        const rows = detectedGaps.map(
            (g) =>
                `"${g.start.toFormat('yyyy-MM-dd HH:mm:ss')}","${g.end.toFormat('yyyy-MM-dd HH:mm:ss')}",${g.durationMinutes},${g.missingCount}`
        );
        return header + rows.join("\n");
    }, [detectedGaps]);

    const handleDownloadGaps = () => {
        if (!gapsCsvContent) return;
        const blob = new Blob([gapsCsvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `detected_gaps_${file?.name || "timeseries.csv"}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "16px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                }}
            >
                <div>
                    <h2
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#1C1B1F",
                            letterSpacing: "-0.01em",
                        }}
                    >
                        Time-Series Gap Detector
                    </h2>

                    <p
                        style={{
                            fontSize: "13px",
                            color: "var(--secondary)",
                            marginTop: "4px",
                        }}
                    >
                        Upload a time-series CSV file to scan for missing timestamps,
                        verify intervals, and identify data gaps.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleReset}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 18px",
                        background: "#FFF3F3",
                        border: "1px solid #E57373",
                        borderRadius: "12px",
                        color: "#C62828",
                        fontWeight: 600,
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all .2s ease",
                        whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#FDECEC";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#FFF3F3";
                    }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="1 4 1 10 7 10" />
                        <polyline points="23 20 23 14 17 14" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10" />
                        <path d="M3.51 15A9 9 0 0 0 18.36 18.36L23 14" />
                    </svg>

                    Reset
                </button>
            </div>

            <div className="divider" />

            {/* Layout Split */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>

                {/* File Upload & Delimiters */}
                <div
                    style={{
                        background: "var(--surface-1)",
                        borderRadius: "20px",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        border: "1px solid var(--outline-variant)",
                    }}
                >
                    {/* File Picker */}
                    <div>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            id="gap-detector-file-input"
                            ref={fileInputRef}
                        />
                        <label
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "24px 16px",
                                border: `2px dashed ${isDragging
                                    ? "var(--primary)"
                                    : "var(--outline-variant)"
                                    }`,
                                borderRadius: "14px",
                                background: isDragging
                                    ? "var(--primary-container)"
                                    : "white",
                                cursor: "pointer",
                                textAlign: "center",
                                gap: "8px",
                                transition: "all 0.2s ease"
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span
                                style={{
                                    fontSize: "20px",
                                    fontWeight: 700,
                                    color: "#1C1B1F",
                                }}
                            >
                                {file ? file.name : "Upload Time-Series CSV"}
                            </span>
                            <span
                                style={{
                                    fontSize: "14px",
                                    color: "var(--secondary)",
                                }}
                            >
                                {isDragging
                                    ? "Drop your CSV file here"
                                    : file
                                        ? `${(file.size / 1024).toFixed(1)} KB`
                                        : "Drag & drop your CSV here or click to browse"}
                            </span>
                        </label>
                    </div>

                    {/* Delimiter & Date format info */}
                    {file && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                    CSV Separator
                                </label>
                                <select
                                    value={delimiter}
                                    onChange={(e) => setDelimiter(e.target.value)}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
                                >
                                    <option value="\t">Tab (\t)</option>
                                    <option value=",">Comma (,)</option>
                                    <option value=";">Semicolon (;)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                    Detected Headers
                                </label>
                                <div style={{ fontSize: "13px", color: "var(--secondary)", padding: "10px 0" }}>
                                    {csvHeaders.length} columns found
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Column Mappings & Expected Frequency */}
                {file && (
                    <div
                        style={{
                            background: "var(--surface-1)",
                            borderRadius: "20px",
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "14px",
                            border: "1px solid var(--outline-variant)",
                        }}
                    >
                        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)", display: "flex", alignItems: "center", gap: "6px" }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Datetime &amp; Frequency Settings
                        </div>


                        <>
                            {/* Column Separation Toggle */}
                            <Switch
                                label="Separate Date & Time Columns"
                                checked={separateDateTime}
                                onChange={(v) => setSeparateDateTime(v)}
                            />

                            {/* Dropdowns to map columns */}
                            {separateDateTime ? (
                                <>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                        <div>
                                            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                                Date Column
                                            </label>
                                            <select
                                                value={dateCol}
                                                onChange={(e) => setDateCol(e.target.value)}
                                                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
                                            >
                                                {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                                Time Column
                                            </label>
                                            <select
                                                value={timeCol}
                                                onChange={(e) => setTimeCol(e.target.value)}
                                                style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
                                            >
                                                {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "10px",
                                            marginTop: "12px",
                                        }}
                                    >
                                        <div>
                                            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                                Date Format (Optional)
                                            </label>

                                            <input
                                                value={customSeparateDateFormat}
                                                onChange={(e) => setCustomSeparateDateFormat(e.target.value)}
                                                placeholder="dd.MM.yyyy"
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}

                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                                Time Format (Optional)
                                            </label>

                                            <input
                                                value={customTimeFormat}
                                                onChange={(e) => setCustomTimeFormat(e.target.value)}
                                                placeholder="HH:mm:ss"
                                                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}

                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                            Timestamp Column
                                        </label>
                                        <select
                                            value={timestampCol}
                                            onChange={(e) => setTimestampCol(e.target.value)}
                                            style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
                                        >
                                            {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                    {/* Optional custom date format parser */}
                                    <div>
                                        <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                            Custom Date-Time Format specifier (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. yyyy-MM-dd HH:mm:ss"
                                            value={customDateFormat}
                                            onChange={(e) => setCustomDateFormat(e.target.value)}
                                            style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}
                                        />
                                    </div>
                                </>
                            )}

                        </>


                        <Switch
                            label="Follows DST"
                            description="Check this if your timestamps follow Daylight Saving Time"
                            checked={followsDST}
                            onChange={(v) => setFollowsDST(v)}
                        />
                        {/* Expected Frequency */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                    Interval Quantity
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={intervalQuantity}
                                    onChange={(e) => setIntervalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
                                    Interval Unit
                                </label>
                                <select
                                    value={intervalUnit}
                                    onChange={(e) => setIntervalUnit(e.target.value as any)}
                                    style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white", cursor: "pointer" }}
                                >
                                    <option value="seconds">Seconds</option>
                                    <option value="minutes">Minutes</option>
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                    <option value="weeks">Weeks</option>
                                    <option value="Months">Months</option>
                                    <option value="Years">Years</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Analysis Action */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !file}
                    style={{
                        padding: "12px 28px",
                        borderRadius: "14px",
                        border: "none",
                        background: "var(--primary)",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: (!file || isAnalyzing) ? "not-allowed" : "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        opacity: (!file || isAnalyzing) ? 0.6 : 1,
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    {isAnalyzing ? "Analyzing..." : "Scan for Gaps"}
                </button>
            </div>

            {/* Errors */}
            {analysisError && (
                <div
                    style={{
                        padding: "12px 16px",
                        background: "#FDF2F2",
                        border: "1px solid #F87171",
                        borderRadius: "12px",
                        color: "#991B1B",
                        fontSize: "13px",
                    }}
                >
                    ⚠️ {analysisError}
                </div>
            )}

            {/* Summary & Gaps List */}
            {summary && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                    {/* Summary Info Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <div style={{ background: "white", border: "1px solid var(--outline-variant)", padding: "16px", borderRadius: "16px", textAlign: "center" }}>
                            <div style={{ fontSize: "11px", color: "var(--secondary)", textTransform: "uppercase", fontWeight: 600 }}>Total Rows Analysed</div>
                            <div style={{ fontSize: "22px", fontWeight: 700, color: "#1C1B1F", marginTop: "4px" }}>{summary.totalRows.toLocaleString()}</div>
                            <div style={{ fontSize: "11px", color: "var(--green)", marginTop: "4px" }}>{summary.validRows.toLocaleString()} valid · {summary.invalidRows.toLocaleString()} invalid</div>
                        </div>

                        <div style={{ background: "white", border: "1px solid var(--outline-variant)", padding: "16px", borderRadius: "16px", textAlign: "center" }}>
                            <div style={{ fontSize: "11px", color: "var(--secondary)", textTransform: "uppercase", fontWeight: 600 }}>Detected Gaps</div>
                            <div style={{ fontSize: "22px", fontWeight: 700, color: detectedGaps.length > 0 ? "var(--red, #C23934)" : "var(--green)", marginTop: "4px" }}>
                                {detectedGaps.length}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--secondary)", marginTop: "4px" }}>separate missing intervals</div>
                        </div>

                        <div style={{ background: "white", border: "1px solid var(--outline-variant)", padding: "16px", borderRadius: "16px", textAlign: "center" }}>
                            <div style={{ fontSize: "11px", color: "var(--secondary)", textTransform: "uppercase", fontWeight: 600 }}>Missing Points</div>
                            <div style={{ fontSize: "22px", fontWeight: 700, color: summary.totalMissing > 0 ? "var(--red, #C23934)" : "var(--green)", marginTop: "4px" }}>
                                {summary.totalMissing.toLocaleString()}
                            </div>
                            <div style={{ fontSize: "11px", color: "var(--secondary)", marginTop: "4px" }}>aggregate missing datasets</div>
                        </div>
                    </div>

                    {/* Timeline boundaries */}
                    {summary.timeSpanStart && summary.timeSpanEnd && (
                        <div style={{ background: "var(--surface-1)", border: "1px solid var(--outline-variant)", padding: "10px 14px", borderRadius: "10px", fontSize: "12px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                            <span><strong>Start Boundary:</strong> {summary.timeSpanStart.toFormat("dd/MM/yyyy HH:mm:ss")}</span>
                            <span><strong>End Boundary:</strong> {summary.timeSpanEnd.toFormat("dd/MM/yyyy HH:mm:ss")}</span>
                        </div>
                    )}
                    {isAnalyzing ? (
                        <div
                            style={{
                                background: "white",
                                borderRadius: "20px",
                                padding: "40px",
                                border: "1.5px solid var(--primary-container)",
                                boxShadow: "var(--shadow-md)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "16px",
                                minHeight: "250px",
                            }}
                        >
                            {/* Spinner */}
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    border: "4px solid #E0E0E0",
                                    borderTop: "4px solid var(--primary)",
                                    borderRadius: "50%",
                                    animation: "spin 1s linear infinite",
                                }}
                            />

                            <div
                                style={{
                                    fontSize: "18px",
                                    fontWeight: 600,
                                    color: "#1C1B1F",
                                }}
                            >
                                Analyzing Timeseries...
                            </div>

                            <div
                                style={{
                                    fontSize: "13px",
                                    color: "var(--secondary)",
                                    textAlign: "center",
                                    maxWidth: "350px",
                                }}
                            >
                                Please wait while we validate timestamps, detect DST transitions,
                                and analyze missing intervals.
                            </div>
                        </div>
                    ) : (
                        <>
                            {dstWarning && (
                                <div
                                    style={{
                                        background: "#FFF8E1",
                                        border: "1px solid #F9A825",
                                        borderRadius: "16px",
                                        padding: "20px",
                                        color: "#8A6D1F",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "12px",
                                    }}
                                >
                                    {/* Warning Icon */}
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 9v4" />
                                        <path d="M12 17h.01" />
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    </svg>

                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                fontSize: "14px",
                                            }}
                                        >
                                            DST Validation Warning
                                        </div>

                                        <div
                                            style={{
                                                fontSize: "12px",
                                                marginTop: "4px",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {dstWarning}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Detailed List */}
                            {detectedGaps.length > 0 ? (
                                <div
                                    style={{
                                        background: "white",
                                        borderRadius: "20px",
                                        padding: "24px",
                                        border: "1.5px solid var(--primary-container)",
                                        boxShadow: "var(--shadow-md)",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                                        <div>
                                            <div style={{ fontSize: "16px", fontWeight: 700, color: "#1C1B1F" }}>
                                                Detected Gap Intervals
                                            </div>
                                            <div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "2px" }}>
                                                Chronological breakdown of missing periods
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "10px" }}>
                                            <CopyButton text={gapsCsvContent} />
                                            <button
                                                type="button"
                                                onClick={handleDownloadGaps}
                                                className="btn-primary"
                                                style={{ padding: "10px 20px", background: "var(--primary)" }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                                Download Gaps CSV
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table */}
                                    <div style={{ overflowX: "auto", border: "1px solid var(--outline-variant)", borderRadius: "14px" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                                            <thead>
                                                <tr style={{ background: "var(--surface-1)", borderBottom: "1px solid var(--outline-variant)", fontWeight: 600 }}>
                                                    <th style={{ padding: "12px 16px" }}>Gap Starts After</th>
                                                    <th style={{ padding: "12px 16px" }}>Gap Ends Before</th>
                                                    <th style={{ padding: "12px 16px" }}>Gap Duration</th>
                                                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Missing Points</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detectedGaps.map((gap, index) => (
                                                    <tr key={index} style={{ borderBottom: index < detectedGaps.length - 1 ? "1px solid var(--outline-variant)" : "none" }}>
                                                        <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)" }}>{gap.start.toFormat('yyyy-MM-dd HH:mm:ss')}</td>
                                                        <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)" }}>{gap.end.toFormat('yyyy-MM-dd HH:mm:ss')}</td>
                                                        <td style={{ padding: "12px 16px" }}>
                                                            {gap.durationMinutes >= 1440
                                                                ? `${(gap.durationMinutes / 1440).toFixed(1)} days`
                                                                : gap.durationMinutes >= 60
                                                                    ? `${(gap.durationMinutes / 60).toFixed(1)} hours`
                                                                    : `${gap.durationMinutes} minutes`
                                                            }
                                                        </td>
                                                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "var(--red, #C23934)" }}>
                                                            {gap.missingCount.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        background: "#E6F4EA",
                                        border: "1px solid #1B7F4F",
                                        borderRadius: "16px",
                                        padding: "20px",
                                        color: "#137333",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "14px" }}>No Gaps Detected!</div>
                                        <div style={{ fontSize: "12px", marginTop: "2px" }}>
                                            Your timeseries dataset is complete. All timestamps align perfectly with the expected interval of {intervalQuantity} {intervalUnit}.
                                        </div>
                                    </div>
                                </div>
                            )}</>
                    )}
                </div>
            )}
        </div>
    );
}

export default TimeseriesGapDetector;
