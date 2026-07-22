import { dateToDotNetTicks } from "./ticks";
import { DateTime } from "luxon";
export interface TimeseriesOptions {
	// Timestamp formats
	dateTimeFormat: string;
	dateFormat: string;
	timeFormat: string;
	separateDateTimeColumns: boolean;

	// CSV formatting
	csvSeparator: string; // "\t" | "," | ";"
	decimalSeparator: string; // "." | ","

	// Time-series range
	startTimestamp: string; // ISO e.g. "2026-01-01T00:00:00"
	endTimestamp: string; // ISO e.g. "2026-12-31T23:45:00"
	intervalMinutes: number;

	// Time zone
	timeZone: string;

	// Output file settings
	fileName: string;
	outputFolder: string;

	// Switches
	addHeader: boolean;
	addTicks: boolean;

	// Column names
	valueColumnName: string;
	timestampColumnName: string;
	dateColumnName: string;
	timeColumnName: string;
	ticksColumnName: string;

	// Value generation
	generateRandomValues: boolean;
	randomValueMin: number;
	randomValueMax: number;
	fixedValue: number;
	decimalPrecision:number;
}

export const DEFAULT_TIMESERIES_OPTIONS: TimeseriesOptions = {
	dateTimeFormat: "yyyy-MM-dd HH:mm",
	dateFormat: "dd.MM.yyyy",
	timeFormat: "HH:mm:ss",
	separateDateTimeColumns: true,

	csvSeparator: "\t",
	decimalSeparator: ".",

	startTimestamp: "2026-01-01T00:00:00",
	endTimestamp: "2026-12-31T23:45:00",
	intervalMinutes: 60,

	timeZone: "Europe/Berlin",

	fileName: "Initial_prognosis_Co2_16_700_2026.csv",
	outputFolder: "C:\\Sync-Output\\ts",

	addHeader: true,
	addTicks: false,

	valueColumnName: "Value",
	timestampColumnName: "Timestamp",
	dateColumnName: "Date",
	timeColumnName: "Time",
	ticksColumnName: "Ticks",

	generateRandomValues: false,
	randomValueMin: 0.0,
	randomValueMax: 100.0,
	fixedValue: 1.906392,
	decimalPrecision:6
};

/**
 * Format a Date object in a given target timezone using pattern template
 * (yyyy, MM, dd, HH, mm, ss)
 */
export function formatDateInZone(
	date: Date,
	timeZone: string,
	pattern: string,
): string {
	const tz =
		timeZone === "local"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: timeZone;

	try {
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

		const parts = formatter.formatToParts(date);
		const getPart = (t: string) =>
			parts.find((p) => p.type === t)?.value ?? "00";

		const year = getPart("year");
		const month = getPart("month");
		const day = getPart("day");
		let hour = getPart("hour");
		if (hour === "24") hour = "00";
		const minute = getPart("minute");
		const second = getPart("second");

		return pattern
			.replace(/yyyy/g, year)
			.replace(/yy/g, year.slice(-2))
			.replace(/MM/g, month)
			.replace(/dd/g, day)
			.replace(/HH/g, hour)
			.replace(/mm/g, minute)
			.replace(/ss/g, second);
	} catch {
		return date.toISOString();
	}
}

/**
 * Parse an ISO-like string (yyyy-MM-ddTHH:mm:ss) into a UTC Date object
 * taking into account the specified input timezone.
 */
export function parseZonedDatetime(
	datetimeStr: string,
	timeZone: string,
): Date {
	if (!datetimeStr) return new Date();

	const [datePart, timePart] = datetimeStr.split("T");
	if (!datePart) return new Date();

	const [year, month, day] = datePart.split("-").map(Number);
	const [hour = 0, minute = 0, second = 0] = (timePart || "00:00:00")
		.split(":")
		.map(Number);

	const tz =
		timeZone === "local"
			? Intl.DateTimeFormat().resolvedOptions().timeZone
			: timeZone;

	// Create UTC candidate date
	const tempDate = new Date(
		Date.UTC(year, (month || 1) - 1, day || 1, hour, minute, second),
	);

	try {
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
		return new Date(tempDate.getTime() + offsetMs);
	} catch {
		return tempDate;
	}
}

export interface GeneratedTimeseriesResult {
	csvContent: string;
	rowCount: number;
	previewRows: string[];
	fileSizeBytes: number;
}

/**
 * Generate time-series CSV content based on options
 */
export function generateTimeseriesCsv(
	options: TimeseriesOptions,
): GeneratedTimeseriesResult {
	const startDate = parseZonedDatetime(
		options.startTimestamp,
		options.timeZone,
	);
	const endDate = parseZonedDatetime(options.endTimestamp, options.timeZone);

	if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
		throw new Error("Invalid start or end timestamp.");
	}

	if (options.intervalMinutes <= 0) {
		throw new Error("Interval minutes must be greater than 0.");
	}

	const intervalMs = options.intervalMinutes * 60 * 1000;
	const lines: string[] = [];
	const sep = options.csvSeparator === "\\t" ? "\t" : options.csvSeparator;

	// Build header
	if (options.addHeader) {
		const headerCols: string[] = [];
		if (options.separateDateTimeColumns) {
			headerCols.push(options.dateColumnName || "Date");
			headerCols.push(options.timeColumnName || "Time");
		} else {
			headerCols.push(options.timestampColumnName || "Timestamp");
		}

		if (options.addTicks) {
			headerCols.push(options.ticksColumnName || "Ticks");
		}

		headerCols.push(options.valueColumnName || "Value");
		lines.push(headerCols.join(sep));
	}

	let currentMs = startDate.getTime();
	const endMs = endDate.getTime();
	let previousFormattedTs = "";
	let rowCount = 0;

	// Safeguard against infinite loops (max 100,000 rows)
	const maxRows = 100_000;

	while (currentMs <= endMs && rowCount < maxRows) {
		const dateObj = new Date(currentMs);

		let formattedTs = "";
		if (options.separateDateTimeColumns) {
			const formattedDate = formatDateInZone(
				dateObj,
				options.timeZone,
				options.dateFormat,
			);
			const formattedTime = formatDateInZone(
				dateObj,
				options.timeZone,
				options.timeFormat,
			);
			formattedTs = `${formattedDate} ${formattedTime}`;
		} else {
			formattedTs = formatDateInZone(
				dateObj,
				options.timeZone,
				options.dateTimeFormat,
			);
		}

		previousFormattedTs = formattedTs;

		const rowCols: string[] = [];

		if (options.separateDateTimeColumns) {
			rowCols.push(
				formatDateInZone(
					dateObj,
					options.timeZone,
					options.dateFormat,
				),
			);
			rowCols.push(
				formatDateInZone(
					dateObj,
					options.timeZone,
					options.timeFormat,
				),
			);
		} else {
			rowCols.push(formattedTs);
		}

		if (options.addTicks) {
			const dotnetTicks = dateToDotNetTicks(dateObj);
			rowCols.push(dotnetTicks.toString());
		}

		// Value calculation
		let numericVal = options.fixedValue;
		if (options.generateRandomValues) {
			const min = Math.min(
				options.randomValueMin,
				options.randomValueMax,
			);
			const max = Math.max(
				options.randomValueMin,
				options.randomValueMax,
			);
			numericVal = Math.random() * (max - min) + min;
		}
		const precision = Math.max(
			0,
			Math.min(10, options.decimalPrecision ?? 6)
		);

		// Format value with selected decimal precision
		let valStr = numericVal.toFixed(precision);
		// let valStr = numericVal.toFixed(6);
		if (options.decimalSeparator === ",") {
			valStr = valStr.replace(".", ",");
		}
		rowCols.push(valStr);

		lines.push(rowCols.join(sep));
		rowCount++;
		currentMs += intervalMs;
	}

	const csvContent = lines.join("\n");
	const previewRows = lines.slice(0, 15);
	const fileSizeBytes =
		typeof TextEncoder !== "undefined"
			? new TextEncoder().encode(csvContent).length
			: csvContent.length;

	return {
		csvContent,
		rowCount,
		previewRows,
		fileSizeBytes,
	};
}


export interface TimeSeriesRow {
  timestamp: Date;
  tick: number;
  value: number;
  isDSTAmbiguous: boolean;
  isDSTSkipped: boolean;
}

export function generateTimeseriesCsv2(options: TimeseriesOptions): TimeSeriesRow[] {
  const rows: TimeSeriesRow[] = [];

  const intervalMs = options.intervalMinutes * 60 * 1000;

  let currentUtc = DateTime.fromISO(options.startTimestamp, {
    zone: options.timeZone,
  }).toUTC();

  const endUtc = DateTime.fromISO(options.endTimestamp, {
    zone: options.timeZone,
  }).toUTC();

  const seenLocalTimes = new Set<string>();

  while (currentUtc <= endUtc) {
    const local = currentUtc.setZone(options.timeZone);

    // .NET ticks
    const ticks =
      BigInt(currentUtc.toMillis()) * 10000n + 621355968000000000n;

    const localKey = local.toFormat("yyyy-MM-dd HH:mm:ss");

    // Luxon cannot directly detect ambiguous/invalid times
    const isAmbiguous = seenLocalTimes.has(localKey);
    const isInvalid = !local.isValid;

  

    seenLocalTimes.add(localKey);

    rows.push({
      timestamp: local.toJSDate(),
      tick: Number(ticks),
      value: options.generateRandomValues
        ? Math.random() *
            (options.randomValueMax - options.randomValueMin) +
          options.randomValueMin
        : options.fixedValue,
      isDSTAmbiguous: isAmbiguous,
      isDSTSkipped: isInvalid,
    });

    currentUtc = currentUtc.plus({
      minutes: options.intervalMinutes,
    });
  }

  return rows;
}