"use client";

import { useState, useCallback } from "react";
import { TIMEZONES } from "@/lib/ticks";
import {
	TimeseriesOptions,
	DEFAULT_TIMESERIES_OPTIONS,
	generateTimeseriesCsv,
	INTERVAL_OPTIONS,
} from "@/lib/timeseries";
import CopyButton from "./CopyButton";
import Switch from "./Switch";
import FormatSelector, { DATE_FORMAT_PRESETS, DATETIME_FORMAT_PRESETS, TIME_FORMAT_PRESETS } from "./FormatSelector";

const TimeseriesGenerator = () => {
	const [options, setOptions] = useState<TimeseriesOptions>(DEFAULT_TIMESERIES_OPTIONS);
	const [error, setError] = useState<string>("");
	const [isGenerating, setIsGenerating] = useState<boolean>(false);

	// Stores the generated result on-demand
	const [result, setResult] = useState<ReturnType<typeof generateTimeseriesCsv> | null>(null);

	const updateOption = useCallback(
		<K extends keyof TimeseriesOptions>(key: K, val: TimeseriesOptions[K]) => {
			setOptions((prev) => ({ ...prev, [key]: val }));
			setError("");
		},
		[],
	);

	// On-demand CSV generation trigger
	const handleGeneratePreview = useCallback(() => {
		setError("");
		setIsGenerating(true);

		// Use setTimeout to allow UI thread to paint the loading state if set
		setTimeout(() => {
			try {
				const generated = generateTimeseriesCsv(options);
				setResult(generated);
			} catch (err: any) {
				setError(err?.message || "Failed to generate CSV data.");
				setResult(null);
			} finally {
				setIsGenerating(false);
			}
		}, 10);
	}, [options]);

	const handleDownload = () => {
		if (!result) return;
		const blob = new Blob([result.csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", options.fileName || "timeseries.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleExportConfig = () => {
		const jsonStr = JSON.stringify(options, null, 2);
		const blob = new Blob([jsonStr], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", "timeseries_config.json");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const formatSize = (bytes: number) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
			{/* Panel Header */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: "12px",
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
						Time-Series CSV Generator
					</h2>
					<p style={{ fontSize: "13px", color: "var(--secondary)", marginTop: "4px" }}>
						Configure range, formatting, delimiters, and DST settings to export structured time-series data.
					</p>
				</div>

				<div style={{ display: "flex", gap: "8px" }}>
					<button
						type="button"
						onClick={() => {
							setOptions(DEFAULT_TIMESERIES_OPTIONS);
							setResult(null);
							setError("");
						}}
						className="btn-outlined"
						style={{ padding: "6px 14px", fontSize: "12px" }}
					>
						Reset Defaults
					</button>
					<button
						type="button"
						onClick={handleExportConfig}
						className="btn-tonal"
						style={{ padding: "6px 14px", fontSize: "12px" }}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
							<polyline points="7 10 12 15 17 10" />
							<line x1="12" y1="15" x2="12" y2="3" />
						</svg>
						Export JSON
					</button>
				</div>
			</div>

			<div className="divider" />

			{/* Form Options Grid */}
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
				{/* 1. Time-Series Range & Zone */}
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
					<div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--primary)", display: "flex", alignItems: "center", gap: "6px" }}>
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
						</svg>
						Time Range &amp; Zone
					</div>

					<div>
						<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
							Start Timestamp
						</label>
						<input
							type="datetime-local"
							step="1"
							value={options.startTimestamp}
							onChange={(e) => updateOption("startTimestamp", e.target.value)}
							style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}
						/>
					</div>

					<div>
						<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
							End Timestamp
						</label>
						<input
							type="datetime-local"
							step="1"
							value={options.endTimestamp}
							onChange={(e) => updateOption("endTimestamp", e.target.value)}
							style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}
						/>
					</div>

					<div>
						<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "6px" }}>
							Interval (Minutes)
						</label>
						<div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
							{/* <input
								type="number"
								min="1"
								value={options.intervalMinutes}
								onChange={(e) => updateOption("intervalMinutes", parseInt(e.target.value) || 1)}
								style={{ width: "140px", flex: "0 0 140px", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}
							/> */}
							{/* {[15, 30, 60, 1440].map((m) => (
								<button
									key={m}
									type="button"
									onClick={() => updateOption("intervalMinutes", m)}
									style={{
										width: "50px",
										height: "40px",
										flexShrink: 0,
										borderRadius: "10px",
										border: `1px solid ${options.intervalMinutes === m ? "var(--primary)" : "var(--outline-variant)"}`,
										background: options.intervalMinutes === m ? "var(--primary-container)" : "white",
										color: options.intervalMinutes === m ? "var(--on-primary-container)" : "var(--secondary)",
										fontSize: "12px",
										fontWeight: 600,
										cursor: "pointer",
									}}
								>
									{m >= 1440 ? `${m / 1440}d` : `${m}m`}
								</button>
							))} */}
							<div style={{ position: "relative", width: "180px" }}>
								<input
									type="number"
									min="1"
									value={options.intervalMinutes}
									onChange={(e) =>
										updateOption(
											"intervalMinutes",
											parseInt(e.target.value) || 1
										)
									}
									style={{
										width: "100%",
										padding: "10px 65px 10px 12px",
										borderRadius: "10px",
										border: "1px solid var(--outline-variant)",
										fontFamily: "var(--font-mono)",
										fontSize: "13px",
										background: "white",
									}}
								/>

								<span
									style={{
										position: "absolute",
										right: "12px",
										top: "50%",
										transform: "translateY(-50%)",
										color: "var(--secondary)",
										fontSize: "12px",
										pointerEvents: "none",
										fontWeight: 500,
									}}
								>
									minutes
								</span>
							</div>
							{INTERVAL_OPTIONS.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => updateOption("intervalMinutes", option.value)}
									style={{
										minWidth: "55px",
										height: "40px",
										padding: "0 10px",
										flexShrink: 0,
										borderRadius: "10px",
										border: `1px solid ${options.intervalMinutes === option.value
											? "var(--primary)"
											: "var(--outline-variant)"
											}`,
										background:
											options.intervalMinutes === option.value
												? "var(--primary-container)"
												: "white",
										color:
											options.intervalMinutes === option.value
												? "var(--on-primary-container)"
												: "var(--secondary)",
										fontSize: "12px",
										fontWeight: 600,
										cursor: "pointer",
									}}
								>
									{option.label}
								</button>
							))}
						</div>
					</div>

					<div>
						<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
							Time Zone
						</label>
						<div className="select-wrapper">
							<select
								value={options.timeZone}
								onChange={(e) => updateOption("timeZone", e.target.value)}
								style={{ width: "100%", padding: "10px 36px 10px 14px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white", appearance: "none" }}
							>
								{TIMEZONES.map((tz) => (
									<option key={tz.value} value={tz.value}>
										{tz.label}
									</option>
								))}
							</select>
						</div>
					</div>

				</div>

				{/* 2. Timestamp & Formatting */}
				<div style={{ background: "var(--surface-1)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px", border: "1px solid var(--outline-variant)" }}>
					<div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)", display: "flex", alignItems: "center", gap: "6px" }}>
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line x1="16" y1="13" x2="8" y2="13" />
							<line x1="16" y1="17" x2="8" y2="17" />
						</svg>
						Timestamp &amp; Delimiters
					</div>

					<Switch
						label="Separate Date & Time Columns"
						description="Output distinct columns for Date and Time instead of single Timestamp"
						checked={options.separateDateTimeColumns}
						onChange={(v) => updateOption("separateDateTimeColumns", v)}
					/>
					{options.separateDateTimeColumns ? (
						<>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
									gap: "12px",
									alignItems: "start",
								}}
							>
								<FormatSelector
									label="Date Format"
									value={options.dateFormat}
									presets={DATE_FORMAT_PRESETS}
									customDefault="yyyy/MM/dd"
									onChange={(val) => updateOption("dateFormat", val)}
								/>
								<FormatSelector
									label="Time Format"
									value={options.timeFormat}
									presets={TIME_FORMAT_PRESETS}
									customDefault="HH:mm:ss.fff"
									onChange={(val) => updateOption("timeFormat", val)}
								/>
							</div>
						</>
					) : (
						<FormatSelector
							label="DateTime Format"
							value={options.dateTimeFormat}
							presets={DATETIME_FORMAT_PRESETS}
							customDefault="yyyy-MM-dd HH:mm:ss"
							onChange={(val) => updateOption("dateTimeFormat", val)}
						/>
					)}
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
						<div>
							<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
								CSV Delimiter
							</label>
							<select
								value={options.csvSeparator}
								onChange={(e) => updateOption("csvSeparator", e.target.value)}
								style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
							>
								<option value="\t">Tab (\t)</option>
								<option value=",">Comma (,)</option>
								<option value=";">Semicolon (;)</option>
							</select>
						</div>

						<div>
							<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
								Decimal Mark
							</label>
							<select
								value={options.decimalSeparator}
								onChange={(e) => updateOption("decimalSeparator", e.target.value)}
								style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
							>
								<option value=".">Dot (.)</option>
								<option value=",">Comma (,)</option>
							</select>
						</div>
					</div>

					<Switch label="Include Header Row" checked={options.addHeader} onChange={(v) => updateOption("addHeader", v)} />
					<Switch label="Include .NET Ticks Column" description="Add high-precision 100-ns tick timestamp column" checked={options.addTicks} onChange={(v) => updateOption("addTicks", v)} />

				</div>

				{/* 3. Columns & Output Settings */}
				<div style={{ background: "var(--surface-1)", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "14px", border: "1px solid var(--outline-variant)" }}>
					<div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--green)", display: "flex", alignItems: "center", gap: "6px" }}>
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<line x1="12" y1="20" x2="12" y2="10" />
							<line x1="18" y1="20" x2="18" y2="4" />
							<line x1="6" y1="20" x2="6" y2="16" />
						</svg>
						Columns &amp; Values
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
						{options.separateDateTimeColumns ? (
							<>
								<div>
									<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
										Date Col Name
									</label>
									<input
										type="text"
										value={options.dateColumnName}
										onChange={(e) => updateOption("dateColumnName", e.target.value)}
										style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
									/>
								</div>
								<div>
									<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
										Time Col Name
									</label>
									<input
										type="text"
										value={options.timeColumnName}
										onChange={(e) => updateOption("timeColumnName", e.target.value)}
										style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
									/>
								</div>
							</>
						) : (
							<div style={{ gridColumn: "span 2" }}>
								<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
									Timestamp Col Name
								</label>
								<input
									type="text"
									value={options.timestampColumnName}
									onChange={(e) => updateOption("timestampColumnName", e.target.value)}
									style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
								/>
							</div>
						)}

						<div>
							<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
								Value Col Name
							</label>
							<input
								type="text"
								value={options.valueColumnName}
								onChange={(e) => updateOption("valueColumnName", e.target.value)}
								style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
							/>
						</div>

						{options.addTicks && (
							<div>
								<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
									Ticks Col Name
								</label>
								<input
									type="text"
									value={options.ticksColumnName}
									onChange={(e) => updateOption("ticksColumnName", e.target.value)}
									style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontSize: "13px", background: "white" }}
								/>
							</div>
						)}
					</div>
					<div>
						<label
							style={{
								fontSize: "11px",
								fontWeight: 600,
								color: "var(--secondary)",
								display: "block",
								marginBottom: "4px",
							}}
						>
							Decimal Precision
						</label>

						<input
							type="number"
							min="0"
							max="10"
							value={options.decimalPrecision}
							onChange={(e) =>
								updateOption(
									"decimalPrecision",
									Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
								)
							}
							style={{
								width: "100%",
								padding: "10px 14px",
								borderRadius: "10px",
								border: "1px solid var(--outline-variant)",
								fontFamily: "var(--font-mono)",
								fontSize: "13px",
								background: "white",
							}}
						/>

						<div
							style={{
								fontSize: "11px",
								color: "var(--secondary)",
								marginTop: "4px",
							}}
						>
							Number of digits to display after the decimal point (0–10).
						</div>
					</div>
					<Switch
						label="Generate Random Values"
						description="Generate values within min-max range instead of fixed value"
						checked={options.generateRandomValues}
						onChange={(v) => updateOption("generateRandomValues", v)}
					/>

					{options.generateRandomValues ? (
						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
							<div>
								<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
									Random Min
								</label>
								<input
									type="number"
									step="any"
									value={options.randomValueMin}
									onChange={(e) => updateOption("randomValueMin", parseFloat(e.target.value) || 0)}
									style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}
								/>
							</div>
							<div>
								<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
									Random Max
								</label>
								<input
									type="number"
									step="any"
									value={options.randomValueMax}
									onChange={(e) => updateOption("randomValueMax", parseFloat(e.target.value) || 0)}
									style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}
								/>
							</div>
						</div>
					) : (
						<div>
							<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
								Fixed Constant Value
							</label>
							<input
								type="number"
								step="any"
								value={options.fixedValue}
								onChange={(e) => updateOption("fixedValue", parseFloat(e.target.value) || 0)}
								style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}
							/>
						</div>
					)}
					<div style={{ marginTop: "4px" }}>
						<label style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary)", display: "block", marginBottom: "4px" }}>
							Output File Name
						</label>
						<input
							type="text"
							value={options.fileName}
							onChange={(e) => updateOption("fileName", e.target.value)}
							style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--outline-variant)", fontFamily: "var(--font-mono)", fontSize: "13px", background: "white" }}
						/>
					</div>


				</div>
			</div>

			{/* Action Trigger Button */}
			<div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
				<button
					type="button"
					onClick={handleGeneratePreview}
					disabled={isGenerating}
					style={{
						padding: "12px 28px",
						borderRadius: "14px",
						border: "none",
						background: "var(--primary)",
						color: "white",
						fontSize: "14px",
						fontWeight: 600,
						cursor: isGenerating ? "not-allowed" : "pointer",
						boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
						display: "inline-flex",
						alignItems: "center",
						gap: "8px",
						opacity: isGenerating ? 0.7 : 1,
					}}
				>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<polygon points="5 3 19 12 5 21 5 3" />
					</svg>
					{isGenerating ? "Generating..." : "Generate Preview"}
				</button>
			</div>

			{error && (
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
					⚠️ {error}
				</div>
			)}

			{/* Result Preview Section */}
			{result && (
				<div
					style={{
						background: "white",
						borderRadius: "20px",
						padding: "24px",
						border: "1.5px solid var(--primary-container)",
						boxShadow: "var(--shadow-md)",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: "12px",
							marginBottom: "16px",
						}}
					>
						<div>
							<div
								style={{
									fontSize: "16px",
									fontWeight: 700,
									color: "#1C1B1F",
									display: "flex",
									alignItems: "center",
									gap: "8px",
								}}
							>
								<span>Generated Output Preview</span>
								<span
									style={{
										fontSize: "12px",
										fontWeight: 600,
										padding: "2px 8px",
										borderRadius: "100px",
										background: "var(--green-container)",
										color: "var(--green)",
									}}
								>
									{result.rowCount.toLocaleString()} Rows
								</span>
								<span style={{ fontSize: "12px", fontWeight: 500, color: "var(--secondary)" }}>
									({formatSize(result.fileSizeBytes)})
								</span>
							</div>
							<div style={{ fontSize: "12px", color: "var(--secondary)", marginTop: "2px" }}>
								Showing first {result.previewRows.length} lines preview
							</div>
						</div>

						<div style={{ display: "flex", gap: "10px" }}>
							<CopyButton text={result.csvContent} />
							<button
								type="button"
								onClick={handleDownload}
								className="btn-primary"
								style={{ padding: "10px 20px", background: "var(--primary)" }}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="7 10 12 15 17 10" />
									<line x1="12" y1="15" x2="12" y2="3" />
								</svg>
								Download CSV
							</button>
						</div>
					</div>

					<pre
						style={{
							background: "var(--surface-1)",
							border: "1px solid var(--outline-variant)",
							borderRadius: "14px",
							padding: "16px",
							fontFamily: "var(--font-mono)",
							fontSize: "12.5px",
							lineHeight: "1.6",
							color: "#1C1B1F",
							overflowX: "auto",
							maxHeight: "280px",
							whiteSpace: "pre",
						}}
					>
						{result.previewRows.join("\n")}
						{result.rowCount > result.previewRows.length && (
							<span style={{ color: "var(--secondary)", fontStyle: "italic" }}>
								{"\n"}... ({result.rowCount - result.previewRows.length} more rows hidden in preview)
							</span>
						)}
					</pre>
				</div>
			)}
		</div>
	);
}

export default TimeseriesGenerator;
