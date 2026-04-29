// Tick conversion constants
// .NET epoch: Jan 1, 0001 00:00:00 UTC
// Unix epoch: Jan 1, 1970 00:00:00 UTC
// UTC tick epoch: same as .NET epoch

// Ticks per millisecond (1 tick = 100 nanoseconds)
export const TICKS_PER_MS = 10_000n;
export const TICKS_PER_SECOND = 10_000_000n;

// .NET epoch to Unix epoch difference in ticks
// From Jan 1, 0001 to Jan 1, 1970 = 621,355,968,000,000,000 ticks
export const DOTNET_EPOCH_OFFSET_TICKS = 621_355_968_000_000_000n;

// Unix epoch in milliseconds = 0, so JS Date is already Unix-based
// .NET DateTime.Ticks: ticks since Jan 1, 0001 00:00:00 UTC
// UTC Tick (same as .NET): ticks since Jan 1, 0001
// Unix Tick: 100-nanosecond intervals since Jan 1, 1970 (Unix epoch)
// Unix Timestamp (seconds): seconds since Jan 1, 1970

export type TickType =
	| "dotnet"
	| "utc"
	| "unix"
	| "unixSeconds"
	| "unixMilliseconds";

/**
 * Convert a JS Date to .NET ticks (100-ns intervals since Jan 1, 0001)
 */
export function dateToDotNetTicks(date: Date): bigint {
	const unixMs = BigInt(date.getTime());
	return unixMs * TICKS_PER_MS + DOTNET_EPOCH_OFFSET_TICKS;
}

/**
 * Convert .NET ticks to JS Date
 */
export function dotNetTicksToDate(ticks: bigint): Date {
	const unixMs = (ticks - DOTNET_EPOCH_OFFSET_TICKS) / TICKS_PER_MS;
	return new Date(Number(unixMs));
}

/**
 * Convert a JS Date to UTC ticks (same as .NET ticks = 100-ns since Jan 1, 0001)
 * UTC ticks are identical to .NET ticks when Kind is UTC
 */
export function dateToUtcTicks(date: Date): bigint {
	return dateToDotNetTicks(date);
}

/**
 * Convert UTC ticks to JS Date
 */
export function utcTicksToDate(ticks: bigint): Date {
	return dotNetTicksToDate(ticks);
}

/**
 * Convert a JS Date to Unix ticks (100-ns intervals since Jan 1, 1970)
 */
export function dateToUnixTicks(date: Date): bigint {
	return BigInt(date.getTime()) * TICKS_PER_MS;
}

/**
 * Convert Unix ticks to JS Date
 */
export function unixTicksToDate(ticks: bigint): Date {
	const ms = ticks / TICKS_PER_MS;
	return new Date(Number(ms));
}

/**
 * Convert Unix ticks to Unix timestamp (seconds)
 */
export function unixTicksToUnixTimestamp(ticks: bigint): bigint {
	return ticks / TICKS_PER_SECOND;
}

/**
 * Convert a Date to any tick type
 */
export function dateToTicks(date: Date, type: TickType): bigint {
	switch (type) {
		case "dotnet":
			return dateToDotNetTicks(date);
		case "utc":
			return dateToUtcTicks(date);
		case "unix":
			return dateToUnixTicks(date);
		case "unixSeconds":
			return BigInt(Math.floor(date.getTime() / 1000)); // seconds
		case "unixMilliseconds":
			return BigInt(Math.floor(date.getTime())); // unixMilliseconds
		default:
			throw new Error(`Unsupported tick type: ${type}`);
	}
}

/**
 * Convert ticks of a given type to a Date
 */
export function ticksToDate(ticks: bigint, type: TickType): Date {
	switch (type) {
		case "dotnet":
			return dotNetTicksToDate(ticks);
		case "utc":
			return utcTicksToDate(ticks);
		case "unix":
			return unixTicksToDate(ticks);
		case "unixSeconds":
			return new Date(Number(ticks) * 1000);
		case "unixMilliseconds":
			return new Date(Number(ticks));
		default:
			throw new Error("Invalid tick type");
	}
}

/**
 * Format a Date in a given timezone using Intl API
 */
export function formatInTimezone(date: Date, timezone: string): string {
	try {
		return new Intl.DateTimeFormat("en-US", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			fractionalSecondDigits: 3,
			hour12: false,
		}).format(date);
	} catch {
		return "Invalid timezone";
	}
}

/**
 * Get ISO string in a given timezone
 */
export function getDatetimeLocalValue(date: Date, timezone: string): string {
	try {
		const parts = new Intl.DateTimeFormat("en-CA", {
			timeZone: timezone,
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		}).formatToParts(date);

		const get = (t: string) =>
			parts.find((p) => p.type === t)?.value ?? "00";
		const year = get("year");
		const month = get("month");
		const day = get("day");
		const hour = get("hour") === "24" ? "00" : get("hour");
		const minute = get("minute");
		const second = get("second");

		return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
	} catch {
		return "";
	}
}

// export const TIMEZONES = [
//   { label: 'UTC', value: 'UTC' },
//   { label: 'Local Time', value: 'local' },
//   { label: 'US/Eastern (EST/EDT)', value: 'America/New_York' },
//   { label: 'US/Central (CST/CDT)', value: 'America/Chicago' },
//   { label: 'US/Mountain (MST/MDT)', value: 'America/Denver' },
//   { label: 'US/Pacific (PST/PDT)', value: 'America/Los_Angeles' },
//   { label: 'London (GMT/BST)', value: 'Europe/London' },
//   { label: 'Paris/Berlin (CET/CEST)', value: 'Europe/Paris' },
//   { label: 'Moscow (MSK)', value: 'Europe/Moscow' },
//   { label: 'Dubai (GST)', value: 'Asia/Dubai' },
//   { label: 'India (IST)', value: 'Asia/Kolkata' },
//   { label: 'China (CST)', value: 'Asia/Shanghai' },
//   { label: 'Japan (JST)', value: 'Asia/Tokyo' },
//   { label: 'Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
//   { label: 'Auckland (NZST/NZDT)', value: 'Pacific/Auckland' },
//   { label: 'São Paulo (BRT/BRST)', value: 'America/Sao_Paulo' },
//   { label: 'Buenos Aires (ART)', value: 'America/Argentina/Buenos_Aires' },
// ];
export const TIMEZONES = [
	{ label: "UTC", value: "UTC" },
	{ label: "Local Time", value: "local" },
	// 🌐 Windows Timezone (for backend compatibility)
	{
		label: "W. Europe Standard Time",
		value: "Europe/Berlin",
	},
	// 🇺🇸 USA
	{ label: "US/Eastern (EST/EDT)", value: "America/New_York" },
	{ label: "US/Central (CST/CDT)", value: "America/Chicago" },
	{ label: "US/Mountain (MST/MDT)", value: "America/Denver" },
	{ label: "US/Pacific (PST/PDT)", value: "America/Los_Angeles" },
	{ label: "Alaska (AKST/AKDT)", value: "America/Anchorage" },
	{ label: "Hawaii (HST)", value: "Pacific/Honolulu" },

	// 🇪🇺 Europe
	{ label: "London (GMT/BST)", value: "Europe/London" },
	{ label: "Paris/Berlin (CET/CEST)", value: "Europe/Paris" },
	{ label: "Rome (CET/CEST)", value: "Europe/Rome" },
	{ label: "Madrid (CET/CEST)", value: "Europe/Madrid" },
	{ label: "Amsterdam (CET/CEST)", value: "Europe/Amsterdam" },
	{ label: "Moscow (MSK)", value: "Europe/Moscow" },

	// 🌍 Middle East & Africa
	{ label: "Dubai (GST)", value: "Asia/Dubai" },
	{ label: "Riyadh (AST)", value: "Asia/Riyadh" },
	{ label: "South Africa (SAST)", value: "Africa/Johannesburg" },
	{ label: "Egypt (EET)", value: "Africa/Cairo" },

	// 🌏 Asia
	{ label: "India (IST)", value: "Asia/Kolkata" },
	{ label: "Pakistan (PKT)", value: "Asia/Karachi" },
	{ label: "Bangladesh (BST)", value: "Asia/Dhaka" },
	{ label: "China (CST)", value: "Asia/Shanghai" },
	{ label: "Singapore (SGT)", value: "Asia/Singapore" },
	{ label: "Japan (JST)", value: "Asia/Tokyo" },
	{ label: "South Korea (KST)", value: "Asia/Seoul" },
	{ label: "Thailand (ICT)", value: "Asia/Bangkok" },

	// 🇦🇺 Oceania
	{ label: "Sydney (AEST/AEDT)", value: "Australia/Sydney" },
	{ label: "Melbourne (AEST/AEDT)", value: "Australia/Melbourne" },
	{ label: "Perth (AWST)", value: "Australia/Perth" },
	{ label: "Auckland (NZST/NZDT)", value: "Pacific/Auckland" },

	// 🌎 South America
	{ label: "São Paulo (BRT/BRST)", value: "America/Sao_Paulo" },
	{ label: "Buenos Aires (ART)", value: "America/Argentina/Buenos_Aires" },
	{ label: "Santiago (CLT/CLST)", value: "America/Santiago" },
	{ label: "Lima (PET)", value: "America/Lima" },

	// 🌎 Canada
	{ label: "Toronto (EST/EDT)", value: "America/Toronto" },
	{ label: "Vancouver (PST/PDT)", value: "America/Vancouver" },
];
export const TICK_TYPES = [
	{
		type: "dotnet" as TickType,
		label: ".NET Ticks",
		short: ".NET",
		description: "100-nanosecond intervals since Jan 1, 0001 (CE)",
		color: "#6750A4",
		bg: "#F3EFF9",
		example: "638,500,000,000,000,000",
	},
	{
		type: "utc" as TickType,
		label: "UTC Ticks",
		short: "UTC",
		description:
			"100-nanosecond intervals since Jan 1, 0001 (same as .NET)",
		color: "#0B6BCB",
		bg: "#E3F2FD",
		example: "638,500,000,000,000,000",
	},
	{
		type: "unix" as TickType,
		label: "Unix High Precision (Ticks)",
		short: "UTK", // Unix Ticks
		description:
			"Time in 100-nanosecond units since Jan 1, 1970 (very large number)",
		color: "#1B7F4F",
		bg: "#E6F4EA",
		example: "17774359200000000",
	},
	{
		type: "unixSeconds" as TickType,
		label: "Unix Timestamp (Seconds)",
		short: "UTS", // Unix Timestamp Seconds
		description:
			"Time in seconds since Jan 1, 1970 (standard format, smaller number)",
		color: "#FF6D00",
		bg: "#FFF3E0",
		example: "1777435920",
	},
	{
		type: "unixMilliseconds" as TickType,
		label: "Unix Timestamp (Milliseconds)",
		short: "UTM",
		description:
			"Time in milliseconds since Jan 1, 1970 (common in JS & APIs)",
		color: "#009688",
		bg: "#E0F2F1",
		example: "1777435920000",
	},
];

export const REFERENCE = [
	{
		title: ".NET Ticks",
		color: "#6750A4",
		bg: "#F3EFF9",
		epoch: "January 1, 0001 (CE), 00:00:00 UTC",
		unit: "100 nanoseconds (0.1 microseconds)",
		example: "638,500,000,000,000,000",
		note: "Used by DateTime.Ticks in C#/.NET. Max value: 3,155,378,975,999,999,999",
		dotnet: "DateTime.UtcNow.Ticks",
		csharp: true,
	},
	{
		title: "UTC Ticks",
		color: "#0B6BCB",
		bg: "#E3F2FD",
		epoch: "January 1, 0001 (CE), 00:00:00 UTC",
		unit: "100 nanoseconds (0.1 microseconds)",
		example: "638,500,000,000,000,000",
		note: "Identical to .NET Ticks when Kind is UTC. Common in distributed systems.",
		dotnet: "DateTime.UtcNow.Ticks",
		csharp: false,
	},
	{
		title: "Unix Ticks",
		color: "#1B7F4F",
		bg: "#E6F4EA",
		epoch: "January 1, 1970, 00:00:00 UTC (Unix Epoch)",
		unit: "100 nanoseconds (0.1 microseconds)",
		example: "17,250,000,000,000,000",
		note: "High-resolution Unix time. 1 Unix tick = 100ns. Divide by 10,000,000 for seconds.",
		dotnet: null,
		csharp: false,
	},
	{
		title: "Unix Timestamp",
		color: "#FF6D00",
		bg: "#FFF3E0",
		epoch: "January 1, 1970, 00:00:00 UTC (Unix Epoch)",
		unit: "Seconds",
		example: "1777435920",
		note: "Standard Unix time used in APIs and databases. 1 unit = 1 second. Multiply by 1000 for milliseconds.",
		dotnet: "DateTimeOffset.UtcNow.ToUnixTimeSeconds()",
		csharp: true,
	},
	{
		title: "Unix Milliseconds",
		color: "#009688",
		bg: "#E0F2F1",
		epoch: "January 1, 1970, 00:00:00 UTC (Unix Epoch)",
		unit: "Milliseconds",
		example: "1777435920000",
		note: "Common in JavaScript (Date.now()). 1 unit = 1 millisecond.",
		dotnet: "DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()",
		csharp: true,
	},
];
export const FORMULAS = [
	{
		label: ".NET → Unix Ticks",
		formula: "dotnetTicks - 621,355,968,000,000,000",
	},
	{
		label: "Unix Ticks → .NET",
		formula: "unixTicks + 621,355,968,000,000,000",
	},
	{
		label: "Unix Ticks → Seconds",
		formula: "unixTicks ÷ 10,000,000",
	},
	{
		label: "Unix Seconds → Ticks",
		formula: "seconds × 10,000,000",
	},
	{
		label: "Unix Ticks → Milliseconds",
		formula: "unixTicks ÷ 10,000",
	},
	{
		label: "Unix ms → Ticks",
		formula: "ms × 10,000",
	},
	{
		label: "Unix Seconds → Milliseconds",
		formula: "seconds × 1,000",
	},
	{
		label: "Unix ms → Seconds",
		formula: "ms ÷ 1,000",
	},
	{
		label: "Unix Seconds → .NET Ticks",
		formula: "seconds × 10,000,000 + 621,355,968,000,000,000",
	},
	{
		label: ".NET Ticks → Unix Seconds",
		formula: "(dotnetTicks - 621,355,968,000,000,000) ÷ 10,000,000",
	},
	{
		label: "Unix ms → .NET Ticks",
		formula: "ms × 10,000 + 621,355,968,000,000,000",
	},
	{
		label: ".NET Ticks → Unix ms",
		formula: "(dotnetTicks - 621,355,968,000,000,000) ÷ 10,000",
	},
	{
		label: "Unix ms → Date",
		formula: "DateTimeOffset.FromUnixTimeMilliseconds(ms)",
	},
	{
		label: "Date → Unix ms",
		formula: "DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()",
	},
];
