"use client";

const references = [
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
];

export default function ReferenceCard() {
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gap: "16px",
			}}
			className="responsive-grid"
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "8px",
				}}
			>
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
					Format Reference
				</div>

				{references.map((ref) => (
					<div
						key={ref.title}
						style={{
							background: ref.bg,
							borderRadius: "20px",
							padding: "18px",
							border: `1px solid ${ref.color}20`,
							// marginBottom: "16px",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "10px",
								marginBottom: "12px",
							}}
						>
							<div
								style={{
									width: "32px",
									height: "32px",
									borderRadius: "10px",
									background: ref.color,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="12" cy="12" r="10" />
									<polyline points="12 6 12 12 16 14" />
								</svg>
							</div>
							<span
								style={{
									fontSize: "15px",
									fontWeight: 700,
									color: ref.color,
								}}
							>
								{ref.title}
							</span>
						</div>

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "8px",
							}}
						>
							{[
								{ label: "Epoch", value: ref.epoch },
								{ label: "Unit", value: ref.unit },
								{
									label: "Example",
									value: ref.example,
									mono: true,
								},
							].map((item) => (
								<div
									key={item.label}
									style={{
										display: "flex",
										gap: "10px",
										fontSize: "13px",
									}}
								>
									<span
										style={{
											color: "var(--secondary)",
											fontWeight: 600,
											minWidth: "56px",
											flexShrink: 0,
										}}
									>
										{item.label}
									</span>
									<span
										style={{
											color: "#1C1B1F",
											fontFamily: item.mono
												? "var(--font-mono)"
												: "inherit",
											fontSize: item.mono
												? "12px"
												: "13px",
										}}
									>
										{item.value}
									</span>
								</div>
							))}
						</div>

						{ref.dotnet && (
							<div
								style={{
									marginTop: "12px",
									padding: "8px 12px",
									background: "rgba(255,255,255,0.7)",
									borderRadius: "10px",
									display: "flex",
									gap: "8px",
									alignItems: "center",
								}}
							>
								<span
									style={{
										fontSize: "11px",
										fontWeight: 600,
										color: "var(--secondary)",
										textTransform: "uppercase",
										letterSpacing: "0.06em",
									}}
								>
									C#
								</span>
								<code
									style={{
										fontFamily: "var(--font-mono)",
										fontSize: "12px",
										color: ref.color,
										fontWeight: 600,
									}}
								>
									{ref.dotnet}
								</code>
							</div>
						)}

						<p
							style={{
								marginTop: "10px",
								fontSize: "12px",
								color: "var(--secondary)",
								lineHeight: "1.5",
							}}
						>
							{ref.note}
						</p>
					</div>
				))}
			</div>

			{/* Conversion formulas */}
			<div
				style={{
					background: "white",
					borderRadius: "20px",
					padding: "18px",
					border: "1px solid var(--outline-variant)",
					paddingRight: "24px",
				}}
			>
				<div
					style={{
						fontSize: "13px",
						fontWeight: 700,
						color: "#1C1B1F",
						marginBottom: "12px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="var(--primary)"
						strokeWidth="2"
					>
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						<polyline points="14 2 14 8 20 8" />
					</svg>
					Conversion Formulas
				</div>
				{[
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
						formula:
							"seconds × 10,000,000 + 621,355,968,000,000,000",
					},
					{
						label: ".NET Ticks → Unix Seconds",
						formula:
							"(dotnetTicks - 621,355,968,000,000,000) ÷ 10,000,000",
					},
					{
						label: "Unix ms → .NET Ticks",
						formula: "ms × 10,000 + 621,355,968,000,000,000",
					},
					{
						label: ".NET Ticks → Unix ms",
						formula:
							"(dotnetTicks - 621,355,968,000,000,000) ÷ 10,000",
					},
				].map((f) => (
					<div
						key={f.label}
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: "8px 0",
							borderBottom: "1px solid var(--outline-variant)",
							fontSize: "13px",
						}}
					>
						<span
							style={{
								color: "var(--secondary)",
								fontWeight: 500,
							}}
						>
							{f.label}
						</span>
						<code
							style={{
								fontFamily: "var(--font-mono)",
								fontSize: "12px",
								color: "var(--primary)",
								fontWeight: 600,
							}}
						>
							{f.formula}
						</code>
					</div>
				))}
			</div>
		</div>
	);
}
