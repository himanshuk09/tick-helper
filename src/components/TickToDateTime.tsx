"use client";
import { useState, useCallback } from "react";
import {
	TickType,
	TICK_TYPES,
	TIMEZONES,
	ticksToDate,
	formatInTimezone,
} from "@/lib/ticks";
import CopyButton from "./CopyButton";

const TickToDateTime = () => {
	const [tickInput, setTickInput] = useState("");
	const [tickType, setTickType] = useState<TickType>("dotnet");
	const [timezone, setTimezone] = useState("UTC");
	const [result, setResult] = useState<{
		date: Date;
		formatted: string;
		iso: string;
		unixTs: number;
	} | null>(null);
	const [error, setError] = useState("");

	const convert = useCallback(() => {
		setError("");
		setResult(null);

		const raw = tickInput.trim().replace(/[,_\s]/g, "");
		if (!raw) {
			setError("Please enter a tick value.");
			return;
		}

		try {
			const ticks = BigInt(raw);
			const tz =
				timezone === "local"
					? Intl.DateTimeFormat().resolvedOptions().timeZone
					: timezone;
			const date = ticksToDate(ticks, tickType);

			if (isNaN(date.getTime())) {
				setError("Resulting date is out of valid range.");
				return;
			}

			setResult({
				date,
				formatted: formatInTimezone(date, tz),
				iso: date.toISOString(),
				unixTs: Math.floor(date.getTime() / 1000),
			});
		} catch (e) {
			setError("Invalid tick value. Please enter a valid integer.");
		}
	}, [tickInput, tickType, timezone]);

	const currentType = TICK_TYPES.find((t) => t.type === tickType)!;

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Tick type selector */}
			<div>
				<div
					style={{
						fontSize: "11px",
						fontWeight: 700,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "var(--secondary)",
						marginBottom: "10px",
					}}
				>
					Tick Format
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "8px",
					}}
				>
					{TICK_TYPES.map((tt) => (
						<button
							key={tt.type}
							onClick={() => setTickType(tt.type)}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "12px",
								padding: "12px 16px",
								border: `2px solid ${tickType === tt.type ? tt.color : "var(--outline-variant)"}`,
								borderRadius: "16px",
								background:
									tickType === tt.type ? tt.bg : "white",
								cursor: "pointer",
								textAlign: "left",
								transition: "all 0.2s",
							}}
						>
							<div
								style={{
									width: "36px",
									height: "36px",
									borderRadius: "10px",
									background:
										tickType === tt.type
											? tt.color
											: "var(--surface-2)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: "11px",
									fontWeight: 800,
									color:
										tickType === tt.type
											? "white"
											: "var(--secondary)",
									letterSpacing: "-0.02em",
									flexShrink: 0,
								}}
							>
								{tt.short}
							</div>
							<div>
								<div
									style={{
										fontSize: "14px",
										fontWeight: 600,
										color: "#1C1B1F",
									}}
								>
									{tt.label}
								</div>
								<div
									style={{
										fontSize: "12px",
										color: "var(--secondary)",
										marginTop: "1px",
									}}
								>
									{tt.description}
								</div>
							</div>
							{tickType === tt.type && (
								<div style={{ marginLeft: "auto" }}>
									<svg
										width="18"
										height="18"
										viewBox="0 0 24 24"
										fill="none"
										stroke={tt.color}
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<polyline points="20 6 9 17 4 12" />
									</svg>
								</div>
							)}
						</button>
					))}
				</div>
			</div>

			{/* Tick input */}
			<div>
				<div
					style={{
						fontSize: "11px",
						fontWeight: 700,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "var(--secondary)",
						marginBottom: "8px",
					}}
				>
					Tick Value
				</div>
				<div style={{ position: "relative" }}>
					<input
						type="text"
						value={tickInput}
						onChange={(e) => {
							const value = e.target.value;

							// allow empty OR only digits
							if (value === "" || /^\d+$/.test(value)) {
								setTickInput(value);
								setError("");
							} else {
								setError("Only numeric values are allowed");
							}
						}}
						onPaste={(e) => {
							e.preventDefault();

							const pasted = e.clipboardData
								.getData("text")
								.trim();
							const cleaned = pasted.replace(/[,_\s]/g, "");

							if (!/^\d+$/.test(cleaned)) {
								setError("Only numeric values are allowed");
								return;
							}

							setError("");
							setTickInput(cleaned);
						}}
						onKeyDown={(e) => e.key === "Enter" && convert()}
						placeholder={`e.g. ${currentType.example.replace(/,/g, "")}`}
						style={{
							width: "100%",
							padding: "14px 60px 14px 16px",
							border: `1.5px solid ${error ? "#B3261E" : "var(--outline-variant)"}`,
							borderRadius: "12px",
							background: "var(--surface-1)",
							fontFamily: "var(--font-mono)",
							fontSize: "14px",
							color: "#1C1B1F",
							outline: "none",
						}}
					/>

					<button
						onClick={async () => {
							try {
								const text =
									await navigator.clipboard.readText();
								const cleaned = text.replace(/[,_\s]/g, "");

								if (!/^\d+$/.test(cleaned)) {
									setError("Clipboard contains invalid data");
									return;
								}

								setError("");
								setTickInput(cleaned);
							} catch {
								alert("Clipboard access denied");
							}
						}}
						style={{
							position: "absolute",
							right: "10px",
							top: "50%",
							transform: "translateY(-50%)",
							padding: "6px 10px",
							fontSize: "12px",
							borderRadius: "8px",
							border: "none",
							background: "var(--primary)",
							color: "white",
							cursor: "pointer",
						}}
					>
						Paste
					</button>
				</div>
				{error && (
					<div
						style={{
							color: "#B3261E",
							fontSize: "12px",
							marginTop: "6px",
							display: "flex",
							alignItems: "center",
							gap: "4px",
						}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
						{error}
					</div>
				)}
			</div>

			{/* Timezone */}
			<div>
				<div
					style={{
						fontSize: "11px",
						fontWeight: 700,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						color: "var(--secondary)",
						marginBottom: "8px",
					}}
				>
					Output Timezone
				</div>
				<div className="select-wrapper">
					<select
						value={timezone}
						onChange={(e) => setTimezone(e.target.value)}
						style={{
							width: "100%",
							padding: "12px 40px 12px 16px",
							border: "1.5px solid var(--outline-variant)",
							borderRadius: "12px",
							background: "var(--surface-1)",
							fontFamily: "var(--font-body)",
							fontSize: "14px",
							color: "#1C1B1F",
							outline: "none",
							appearance: "none",
							cursor: "pointer",
						}}
					>
						{TIMEZONES.map((tz) => (
							<option key={tz.value} value={tz.value}>
								{tz.label}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Convert button */}
			<button
				className="btn-primary"
				onClick={convert}
				style={{ width: "100%", padding: "14px" }}
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
					<polyline points="17 1 21 5 17 9" />
					<path d="M3 11V9a4 4 0 0 1 4-4h14" />
					<polyline points="7 23 3 19 7 15" />
					<path d="M21 13v2a4 4 0 0 1-4 4H3" />
				</svg>
				Convert to DateTime
			</button>

			{/* Result */}
			{result && (
				<div
					style={{
						background: currentType.bg,
						border: `1.5px solid ${currentType.color}30`,
						borderRadius: "20px",
						padding: "20px",
						animation:
							"fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							marginBottom: "16px",
						}}
					>
						<div
							style={{
								width: "8px",
								height: "8px",
								borderRadius: "50%",
								background: currentType.color,
							}}
						/>
						<span
							style={{
								fontSize: "13px",
								fontWeight: 700,
								color: currentType.color,
								letterSpacing: "0.04em",
								textTransform: "uppercase",
							}}
						>
							Result
						</span>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "10px",
						}}
					>
						{[
							// { label: "Local Time", value: result.formatted },
							{
								label: `Time (${timezone === "local"
									? Intl.DateTimeFormat().resolvedOptions()
										.timeZone
									: timezone
									})`,
								value: result.formatted,
							},
							{ label: "ISO 8601", value: result.iso },
							{
								label: "Unix Timestamp",
								value: String(result.unixTs),
							},
						].map((item) => (
							<div
								key={item.label}
								style={{
									background: "white",
									borderRadius: "12px",
									padding: "12px 14px",
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									gap: "10px",
									border: "1px solid rgba(202, 196, 208, 0.4)",
								}}
							>
								<div>
									<div
										style={{
											fontSize: "11px",
											fontWeight: 600,
											color: "var(--secondary)",
											textTransform: "uppercase",
											letterSpacing: "0.06em",
											marginBottom: "3px",
										}}
									>
										{item.label}
									</div>
									<div
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: "13px",
											fontWeight: 500,
											color: "#1C1B1F",
											wordBreak: "break-all",
										}}
									>
										{item.value}
									</div>
								</div>
								<CopyButton text={item.value} />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
export default TickToDateTime;