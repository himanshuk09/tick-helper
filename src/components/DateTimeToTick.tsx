"use client";
import { useState, useCallback } from "react";
import {
	TICK_TYPES,
	TIMEZONES,
	dateToTicks,
	dateToUnixTicks,
	unixTicksToUnixTimestamp,
} from "@/lib/ticks";
import CopyButton from "./CopyButton";

function formatBigInt(n: bigint): string {
	return n.toLocaleString("en-US");
}

export default function DateTimeToTick() {
	const [datetimeInput, setDatetimeInput] = useState("");
	const [timezone, setTimezone] = useState("UTC");
	const [result, setResult] = useState<{
		dotnet: bigint;
		utc: bigint;
		unix: bigint;
		unixSeconds: bigint;
		date: Date;
	} | null>(null);
	const [error, setError] = useState("");

	const setNow = () => {
		const now = new Date();
		// Format for datetime-local input in the selected TZ
		const tz =
			timezone === "local"
				? Intl.DateTimeFormat().resolvedOptions().timeZone
				: timezone;
		try {
			const parts = new Intl.DateTimeFormat("en-CA", {
				timeZone: tz,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			}).formatToParts(now);
			const get = (t: string) =>
				parts.find((p) => p.type === t)?.value ?? "00";
			const h = get("hour") === "24" ? "00" : get("hour");
			setDatetimeInput(
				`${get("year")}-${get("month")}-${get("day")}T${h}:${get("minute")}:${get("second")}`,
			);
		} catch {
			const iso = now.toISOString().slice(0, 19);
			setDatetimeInput(iso);
		}
	};

	const convert = useCallback(() => {
		setError("");
		setResult(null);

		if (!datetimeInput) {
			setError("Please select a date and time.");
			return;
		}

		try {
			const tz =
				timezone === "local"
					? Intl.DateTimeFormat().resolvedOptions().timeZone
					: timezone;

			// Parse the datetime-local value as being in the selected timezone
			// We need to figure out the UTC equivalent
			const [datePart, timePart] = datetimeInput.split("T");
			const [year, month, day] = datePart.split("-").map(Number);
			const [hour, minute, second] = (timePart || "00:00:00")
				.split(":")
				.map(Number);

			// Use Intl to find the UTC offset at this moment in the target timezone
			// Approach: create a UTC date, then adjust based on timezone offset
			// First, try creating date as if it were UTC
			const tempDate = new Date(
				Date.UTC(year, month - 1, day, hour, minute, second || 0),
			);

			// Get what the time would be in the target timezone for this UTC date
			const formatter = new Intl.DateTimeFormat("en-US", {
				timeZone: tz,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			});

			const tzParts = formatter.formatToParts(tempDate);
			const get = (t: string) =>
				parseInt(tzParts.find((p) => p.type === t)?.value ?? "0");
			const tzHour = get("hour") === 24 ? 0 : get("hour");

			const tzDate = new Date(
				Date.UTC(
					get("year"),
					get("month") - 1,
					get("day"),
					tzHour,
					get("minute"),
					get("second"),
				),
			);
			const offsetMs = tempDate.getTime() - tzDate.getTime();

			const utcDate = new Date(tempDate.getTime() + offsetMs);

			if (isNaN(utcDate.getTime())) {
				setError("Invalid date/time value.");
				return;
			}

			const dotnet = dateToTicks(utcDate, "dotnet");
			const utcTicks = dateToTicks(utcDate, "utc");
			const unix = dateToUnixTicks(utcDate);
			const unixSeconds = unixTicksToUnixTimestamp(unix);

			setResult({
				dotnet,
				utc: utcTicks,
				unix,
				unixSeconds,
				date: utcDate,
			});
		} catch (e) {
			setError("Could not parse date/time. Please check the input.");
		}
	}, [datetimeInput, timezone]);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Timezone selector */}
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
					Input Timezone
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

			{/* DateTime input */}
			<div>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: "8px",
					}}
				>
					<div
						style={{
							fontSize: "11px",
							fontWeight: 700,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "var(--secondary)",
						}}
					>
						Date &amp; Time
					</div>
					<button
						className="btn-tonal"
						onClick={setNow}
						style={{ padding: "5px 12px", fontSize: "12px" }}
					>
						<svg
							width="13"
							height="13"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						</svg>
						Now
					</button>
				</div>
				<input
					type="datetime-local"
					value={datetimeInput}
					onChange={(e) => setDatetimeInput(e.target.value)}
					step="1"
					style={{
						width: "100%",
						padding: "14px 16px",
						border: `1.5px solid ${error ? "#B3261E" : "var(--outline-variant)"}`,
						borderRadius: "12px",
						background: "var(--surface-1)",
						fontFamily: "var(--font-body)",
						fontSize: "14px",
						color: "#1C1B1F",
						outline: "none",
						cursor: "pointer",
					}}
					onFocus={(e) => {
						if (e.target.showPicker) {
							e.target.showPicker();
						}
					}}
				/>
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

			{/* Convert button */}
			<button
				className="btn-primary"
				onClick={convert}
				style={{
					width: "100%",
					padding: "14px",
					background: "var(--blue)",
					boxShadow: "0 2px 8px rgba(11,107,203,0.3)",
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
					<polyline points="17 1 21 5 17 9" />
					<path d="M3 11V9a4 4 0 0 1 4-4h14" />
					<polyline points="7 23 3 19 7 15" />
					<path d="M21 13v2a4 4 0 0 1-4 4H3" />
				</svg>
				Convert to Ticks
			</button>

			{/* Results */}
			{result && (
				<div
					style={{
						animation:
							"fadeInUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
					}}
				>
					<div
						style={{
							fontSize: "11px",
							fontWeight: 700,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "var(--secondary)",
							marginBottom: "12px",
						}}
					>
						Tick Values
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "10px",
						}}
					>
						{TICK_TYPES.map((tt) => {
							const value =
								tt.type === "dotnet"
									? result.dotnet
									: tt.type === "utc"
										? result.utc
										: tt.type === "unix"
											? result.unix
											: result.unixSeconds;
							const formatted = formatBigInt(value);
							const raw = value.toString();
							return (
								<div
									key={tt.type}
									style={{
										background: tt.bg,
										border: `1.5px solid ${tt.color}25`,
										borderRadius: "16px",
										padding: "14px 16px",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											marginBottom: "8px",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "8px",
											}}
										>
											<div
												style={{
													padding: "3px 10px",
													borderRadius: "100px",
													background: tt.color,
													fontSize: "11px",
													fontWeight: 700,
													color: "white",
													letterSpacing: "0.04em",
												}}
											>
												{tt.short}
											</div>
											<span
												style={{
													fontSize: "13px",
													fontWeight: 600,
													color: "#1C1B1F",
												}}
											>
												{tt.label}
											</span>
										</div>
										<CopyButton text={raw} />
									</div>
									<div
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: "14px",
											fontWeight: 600,
											color: tt.color,
											wordBreak: "break-all",
											lineHeight: "1.4",
										}}
									>
										{formatted}
									</div>
									<div
										style={{
											fontFamily: "var(--font-mono)",
											fontSize: "11px",
											color: "var(--secondary)",
											marginTop: "3px",
										}}
									>
										Raw: {raw}
									</div>
								</div>
							);
						})}
					</div>

					{/* UTC reference */}
					<div
						style={{
							marginTop: "12px",
							padding: "12px 14px",
							background: "var(--surface-2)",
							borderRadius: "12px",
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="var(--secondary)"
							strokeWidth="2"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
						<span
							style={{
								fontSize: "12px",
								color: "var(--secondary)",
							}}
						>
							UTC equivalent:{" "}
							<strong
								style={{
									fontFamily: "var(--font-mono)",
									color: "#1C1B1F",
								}}
							>
								{result.date.toISOString()}
							</strong>
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
