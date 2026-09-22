"use client";
import { useState, useEffect, useCallback } from "react";
import CopyButton from "./CopyButton";

interface TimeSpanConstant {
	key: string;
	label: string;
	value: bigint;
	description: string;
}

const TIMESPAN_CONSTANTS: TimeSpanConstant[] = [
	{
		key: "TicksPerDay",
		label: "TicksPerDay",
		value: 864_000_000_000n,
		description: "Ticks in 1 day (864,000,000,000)",
	},
	{
		key: "TicksPerHour",
		label: "TicksPerHour",
		value: 36_000_000_000n,
		description: "Ticks in 1 hour (36,000,000,000)",
	},
	{
		key: "TicksPerMinute",
		label: "TicksPerMinute",
		value: 600_000_000n,
		description: "Ticks in 1 minute (600,000,000)",
	},
	{
		key: "TicksPerSecond",
		label: "TicksPerSecond",
		value: 10_000_000n,
		description: "Ticks in 1 second (10,000,000)",
	},
	{
		key: "TicksPerMillisecond",
		label: "TicksPerMillisecond",
		value: 10_000n,
		description: "Ticks in 1 millisecond (10,000)",
	},
	{
		key: "Zero",
		label: "Zero",
		value: 0n,
		description: "Zero TimeSpan (0)",
	},
	{
		key: "MaxValue",
		label: "MaxValue",
		value: 9_223_372_036_854_775_807n,
		description: "Maximum TimeSpan (9,223,372,036,854,775,807)",
	},
	{
		key: "MinValue",
		label: "MinValue",
		value: -9_223_372_036_854_775_808n,
		description: "Minimum TimeSpan (-9,223,372,036,854,775,808)",
	},
];

// Safe mathematical expression parser
function evaluateExpression(input: string): number {
	const tokens = input.match(/\d+(\.\d+)?|[\+\-\*\/\(\)]/g)!;
	if (!tokens) return 0;

	let index = 0;

	function peek() {
		return tokens[index];
	}

	function consume(expected?: string) {
		const t = tokens[index];
		if (expected && t !== expected) {
			throw new Error(`Expected "${expected}" but got "${t}"`);
		}
		index++;
		return t;
	}

	function parsePrimary(): number {
		const t = peek();
		if (!t) throw new Error("Unexpected end of expression");
		if (t === "(") {
			consume("(");
			const val = parseExpr();
			consume(")");
			return val;
		}
		if (t === "-") {
			consume("-");
			return -parsePrimary();
		}
		if (t === "+") {
			consume("+");
			return parsePrimary();
		}
		if (/^\d+(\.\d+)?$/.test(t)) {
			return parseFloat(consume());
		}
		throw new Error(`Unexpected token: "${t}"`);
	}

	function parseMultiplicative(): number {
		let val = parsePrimary();
		while (true) {
			const t = peek();
			if (t === "*") {
				consume("*");
				val *= parsePrimary();
			} else if (t === "/") {
				consume("/");
				const divisor = parsePrimary();
				if (divisor === 0) throw new Error("Division by zero");
				val /= divisor;
			} else {
				break;
			}
		}
		return val;
	}

	function parseExpr(): number {
		let val = parseMultiplicative();
		while (true) {
			const t = peek();
			if (t === "+") {
				consume("+");
				val += parseMultiplicative();
			} else if (t === "-") {
				consume("-");
				val -= parseMultiplicative();
			} else {
				break;
			}
		}
		return val;
	}

	const result = parseExpr();
	if (index < tokens.length) {
		throw new Error(`Unexpected trailing characters starting at "${tokens[index]}"`);
	}
	return result;
}

interface TimeSpanParts {
	ticks: bigint;
	days: bigint;
	hours: bigint;
	minutes: bigint;
	seconds: bigint;
	milliseconds: bigint;
	microseconds: bigint;
	nanoseconds: bigint;
	isNegative: boolean;
	friendly: string;
	standard: string;
}

function formatTimeSpan(ticks: bigint): TimeSpanParts {
	const isNegative = ticks < 0n;
	const absTicks = isNegative ? -ticks : ticks;

	const ticksPerDay = 864_000_000_000n;
	const ticksPerHour = 36_000_000_000n;
	const ticksPerMinute = 600_000_000n;
	const ticksPerSecond = 10_000_000n;
	const ticksPerMillisecond = 10_000n;
	const ticksPerMicrosecond = 10n;

	const days = absTicks / ticksPerDay;
	let rem = absTicks % ticksPerDay;

	const hours = rem / ticksPerHour;
	rem = rem % ticksPerHour;

	const minutes = rem / ticksPerMinute;
	rem = rem % ticksPerMinute;

	const seconds = rem / ticksPerSecond;
	rem = rem % ticksPerSecond;

	const milliseconds = rem / ticksPerMillisecond;
	rem = rem % ticksPerMillisecond;

	const microseconds = rem / ticksPerMicrosecond;
	rem = rem % ticksPerMicrosecond;

	const nanoseconds = rem * 100n; // 1 tick = 100 ns

	const sign = isNegative ? "-" : "";
	const dStr = days > 0n ? `${days}.` : "";
	const hStr = hours.toString().padStart(2, "0");
	const mStr = minutes.toString().padStart(2, "0");
	const sStr = seconds.toString().padStart(2, "0");

	// Standard C# TimeSpan format allows up to 7 decimal digits for fractional seconds (ticks)
	const fracTicks = absTicks % ticksPerSecond;
	const fracStr = fracTicks > 0n ? `.${fracTicks.toString().padStart(7, "0").replace(/0+$/, "")}` : "";
	const standard = `${sign}${dStr}${hStr}:${mStr}:${sStr}${fracStr}`;

	const parts: string[] = [];
	if (days > 0n) parts.push(`${days}d`);
	if (hours > 0n || parts.length > 0) parts.push(`${hours}h`);
	if (minutes > 0n || parts.length > 0) parts.push(`${minutes}m`);
	if (seconds > 0n || parts.length > 0) parts.push(`${seconds}s`);
	if (milliseconds > 0n) parts.push(`${milliseconds}ms`);
	if (microseconds > 0n) parts.push(`${microseconds}µs`);
	if (nanoseconds > 0n) parts.push(`${nanoseconds}ns`);

	const friendly = parts.length > 0 ? `${sign}${parts.join(" ")}` : "0";

	return {
		ticks,
		days,
		hours,
		minutes,
		seconds,
		milliseconds,
		microseconds,
		nanoseconds,
		isNegative,
		friendly,
		standard,
	};
}

const TimespanTicks = () => {
	const [constantKey, setConstantKey] = useState<string>("TicksPerMinute");
	const [modifier, setModifier] = useState<string>("");
	const [result, setResult] = useState<TimeSpanParts | null>(null);
	const [error, setError] = useState<string>("");

	const selectedConstant = TIMESPAN_CONSTANTS.find((c) => c.key === constantKey) || TIMESPAN_CONSTANTS[2];

	const calculate = useCallback(() => {
		setError("");
		const mod = modifier.trim();

		// If no modifier, return exact constant value (avoids float precision loss on MaxValue/MinValue)
		if (!mod) {
			setResult(formatTimeSpan(selectedConstant.value));
			return;
		}

		// Validation: Allow only safe mathematical symbols and digits
		const validCharsRegex = /^[0-9.+\-*/()\s]*$/;
		if (!validCharsRegex.test(mod)) {
			setError("Invalid characters. Only numbers and operators (+, -, *, /, (, )) are allowed.");
			return;
		}

		try {
			// Auto prepend multiplication if modifier starts with digits or opening parenthesis
			let expressionToParse = mod;
			if (/^[0-9.(]/.test(expressionToParse)) {
				expressionToParse = `* ${expressionToParse}`;
			}

			// Prepend the constant value for evaluation
			const fullExpression = `${selectedConstant.value.toString()} ${expressionToParse}`;

			const numericResult = evaluateExpression(fullExpression);

			if (isNaN(numericResult) || !isFinite(numericResult)) {
				setError("Arithmetic overflow or invalid calculation.");
				return;
			}

			// Convert float evaluation back to bigint ticks
			const ticksValue = BigInt(Math.round(numericResult));
			setResult(formatTimeSpan(ticksValue));
		} catch (err: any) {
			setError(err.message || "Failed to evaluate mathematical expression.");
		}
	}, [constantKey, modifier, selectedConstant]);

	// Recalculate whenever inputs change
	useEffect(() => {
		calculate();
	}, [constantKey, modifier, calculate]);

	const formattedConstantValue = selectedConstant.value.toLocaleString("en-US");

	// Display expression preview
	let previewExpression = selectedConstant.key;
	if (modifier.trim()) {
		const modClean = modifier.trim();
		if (/^[0-9.(]/.test(modClean)) {
			previewExpression += ` * ${modClean}`;
		} else {
			previewExpression += ` ${modClean}`;
		}
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
			{/* Explanation of TimeSpan */}
			<div
				style={{
					background: "var(--surface-2)",
					padding: "16px",
					borderRadius: "16px",
					border: "1px dashed var(--outline-variant)",
				}}
			>
				<p style={{ fontSize: "13px", color: "var(--secondary)", lineHeight: "1.5" }}>
					💡 <strong>C# TimeSpan Ticks</strong> represent durations in 100-nanosecond intervals. Select a standard TimeSpan field below, and enter a math expression (e.g. <code>* 5</code>) to compute your target TimeSpan.
				</p>
			</div>

			{/* Dropdown for C# TimeSpan Constant */}
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
					Select TimeSpan Base Field
				</div>

				<div
					className="select-wrapper"
					style={{
						position: "relative",
						border: "1px solid var(--outline-variant)",
						borderRadius: "12px",
						background: "var(--surface-2)",
					}}
				>
					<select
						value={constantKey}
						onChange={(e) => setConstantKey(e.target.value)}
						style={{
							width: "100%",
							height: "58px",
							padding: "20px 42px 8px 16px",
							border: "none",
							outline: "none",
							background: "transparent",
							cursor: "pointer",
							fontFamily: "var(--font-body)",
							fontSize: "14px",
							color: "var(--on-surface)",
							borderRadius: "12px",
						}}
					>
						{TIMESPAN_CONSTANTS.map((c) => (
							<option key={c.key} value={c.key}>
								{c.key} ({c.value.toLocaleString("en-US")} ticks)
							</option>
						))}
					</select>

					<label
						style={{
							position: "absolute",
							top: "7px",
							left: "14px",
							padding: "0 4px",
							background: "var(--surface-2)",
							fontSize: "10px",
							fontWeight: 700,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "var(--secondary)",
							pointerEvents: "none",
						}}
					>
						C# Field
					</label>
				</div>

				<div
					style={{
						fontSize: "12px",
						color: "var(--secondary)",
						marginTop: "8px",
						fontStyle: "italic",
					}}
				>
					{selectedConstant.description}
				</div>
			</div>
			{/* Modifier Expression Box */}
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
					Arithmetic Modifier (Symbols: +, -, *, /, (, ))
				</div>

				<div
					className="field"
					style={{
						position: "relative",
						border: "1px solid var(--outline-variant)",
						borderRadius: "12px",
						background: "var(--surface-2)",
					}}
				>
					<input
						type="text"
						value={modifier}
						onChange={(e) => setModifier(e.target.value)}
						placeholder="e.g. * 5, + 500000, / 2 + 10"
						className="mono"
						style={{
							width: "100%",
							height: "58px",
							padding: "20px 16px 8px",
							border: "none",
							outline: "none",
							background: "transparent",
							borderRadius: "12px",
							letterSpacing: "0.02em",
							fontWeight: 500,
							fontSize: "14px",
							boxSizing: "border-box",
						}}
					/>

					<label
						style={{
							position: "absolute",
							top: "7px",
							left: "14px",
							padding: "0 4px",
							background: "var(--surface-2)",
							fontSize: "10px",
							fontWeight: 700,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "var(--secondary)",
							pointerEvents: "none",
						}}
					>
						Modifier Expression
					</label>
				</div>
			</div>
			{/* Live Preview of full calculation */}
			<div
				style={{
					background: "var(--surface-1)",
					borderRadius: "12px",
					padding: "12px 16px",
					display: "flex",
					flexDirection: "column",
					gap: "4px",
					border: "1px solid var(--outline-variant)",
				}}
			>
				<span
					style={{
						fontSize: "11px",
						fontWeight: 700,
						letterSpacing: "0.06em",
						textTransform: "uppercase",
						color: "var(--secondary)",
					}}
				>
					Formula Expression
				</span>
				<div
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: "14px",
						color: "var(--primary)",
						wordBreak: "break-all",
					}}
				>
					{previewExpression}
				</div>
				<div
					style={{
						fontFamily: "var(--font-mono)",
						fontSize: "12px",
						color: "var(--secondary)",
						wordBreak: "break-all",
						marginTop: "2px",
					}}
				>
					= {formattedConstantValue} {modifier.trim() ? (modifier.trim().startsWith("+") || modifier.trim().startsWith("-") || modifier.trim().startsWith("*") || modifier.trim().startsWith("/") ? modifier.trim() : `* ${modifier.trim()}`) : ""}
				</div>
			</div>

			{/* Error Box */}
			{error && (
				<div
					style={{
						background: "#FEEBEE",
						color: "#C62828",
						border: "1.5px solid #FFCDD2",
						borderRadius: "12px",
						padding: "12px 16px",
						fontSize: "13px",
						fontWeight: 500,
					}}
				>
					⚠️ {error}
				</div>
			)}

			{/* Calculation results */}
			{result && !error && (
				<div
					className="animate-in"
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "12px",
						marginTop: "10px",
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
						Calculated TimeSpan Ticks
					</div>

					{/* 1. Ticks Output */}
					<div
						style={{
							background: "var(--primary-container)",
							border: "1.5px solid var(--primary)",
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
							<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
								<div
									style={{
										padding: "3px 10px",
										borderRadius: "100px",
										background: "var(--primary)",
										fontSize: "11px",
										fontWeight: 700,
										color: "white",
									}}
								>
									TICKS
								</div>
								<span style={{ fontSize: "13px", fontWeight: 600, color: "#1C1B1F" }}>
									TimeSpan Ticks
								</span>
							</div>
							<CopyButton text={result.ticks.toString()} />
						</div>
						<div
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: "16px",
								fontWeight: 700,
								color: "#6750A4",
								wordBreak: "break-all",
							}}
						>
							{result.ticks.toLocaleString("en-US")}
						</div>
						<div
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: "11px",
								color: "var(--secondary)",
								marginTop: "3px",
							}}
						>
							Raw: {result.ticks.toString()}
						</div>
					</div>

					{/* 2. Standard C# Format Output */}
					<div
						style={{
							background: "#E3F2FD",
							border: "1.5px solid var(--blue)",
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
							<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
								<div
									style={{
										padding: "3px 10px",
										borderRadius: "100px",
										background: "var(--blue)",
										fontSize: "11px",
										fontWeight: 700,
										color: "white",
									}}
								>
									FORMAT
								</div>
								<span style={{ fontSize: "13px", fontWeight: 600, color: "#1C1B1F" }}>
									Standard TimeSpan format
								</span>
							</div>
							<CopyButton text={result.standard} />
						</div>
						<div
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: "16px",
								fontWeight: 700,
								color: "#0B6BCB",
								wordBreak: "break-all",
							}}
						>
							{result.standard}
						</div>
						<div
							style={{
								fontSize: "11px",
								color: "var(--secondary)",
								marginTop: "4px",
							}}
						>
							Format: <code>[days.]hours:minutes:seconds[.fractionalSeconds]</code>
						</div>
					</div>

					{/* 3. Friendly Breakdown Output */}
					<div
						style={{
							background: "#E6F4EA",
							border: "1.5px solid var(--green)",
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
							<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
								<div
									style={{
										padding: "3px 10px",
										borderRadius: "100px",
										background: "var(--green)",
										fontSize: "11px",
										fontWeight: 700,
										color: "white",
									}}
								>
									FRIENDLY
								</div>
								<span style={{ fontSize: "13px", fontWeight: 600, color: "#1C1B1F" }}>
									Readable Duration
								</span>
							</div>
							<CopyButton text={result.friendly} />
						</div>
						<div
							style={{
								fontFamily: "var(--font-body)",
								fontSize: "15px",
								fontWeight: 600,
								color: "var(--green)",
							}}
						>
							{result.friendly}
						</div>
					</div>

					{/* 4. Detailed Table Breakdown */}
					<div
						style={{
							background: "white",
							border: "1px solid var(--outline-variant)",
							borderRadius: "16px",
							padding: "14px 16px",
						}}
					>
						<div
							style={{
								fontSize: "12px",
								fontWeight: 700,
								color: "var(--secondary)",
								marginBottom: "10px",
								textTransform: "uppercase",
								letterSpacing: "0.04em",
							}}
						>
							TimeSpan Parts Breakdown
						</div>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
								gap: "10px",
							}}
						>
							{[
								{ label: "Days", val: result.days.toString() },
								{ label: "Hours", val: result.hours.toString() },
								{ label: "Minutes", val: result.minutes.toString() },
								{ label: "Seconds", val: result.seconds.toString() },
								{ label: "Milliseconds", val: result.milliseconds.toString() },
								{ label: "Microseconds", val: result.microseconds.toString() },
								{ label: "Nanoseconds", val: result.nanoseconds.toString() },
							].map((part) => (
								<div
									key={part.label}
									style={{
										background: "var(--surface-1)",
										borderRadius: "8px",
										padding: "8px 10px",
										textAlign: "center",
										border: "1px solid rgba(0,0,0,0.03)",
									}}
								>
									<div style={{ fontSize: "11px", color: "var(--secondary)", marginBottom: "2px" }}>
										{part.label}
									</div>
									<div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600 }}>
										{part.val}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TimespanTicks;
