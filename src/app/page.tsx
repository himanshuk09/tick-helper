"use client";
import { useState } from "react";
import TickToDateTime from "@/components/TickToDateTime";
import DateTimeToTick from "@/components/DateTimeToTick";
import ReferenceCard from "@/components/ReferenceCard";

type Tab = "tick-to-dt" | "dt-to-tick";

export default function Home() {
	const [activeTab, setActiveTab] = useState<Tab>("tick-to-dt");

	return (
		<main
			style={{
				position: "relative",
				zIndex: 1,
				minHeight: "100vh",
				padding: "0 16px 80px",
			}}
		>
			{/* Header */}
			<header
				style={{
					maxWidth: "1100px",
					margin: "0 auto",
					padding: "40px 0 32px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "16px",
						marginBottom: "12px",
					}}
				>
					{/* Logo mark */}
					<div
						style={{
							width: "48px",
							height: "48px",
							borderRadius: "16px",
							background:
								"linear-gradient(135deg, #6750A4 0%, #0B6BCB 60%, #1B7F4F 100%)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							boxShadow: "0 4px 16px rgba(103,80,164,0.35)",
							flexShrink: 0,
						}}
					>
						<svg
							width="26"
							height="26"
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
					<div>
						<h1
							style={{
								fontFamily: "var(--font-display)",
								fontSize: "26px",
								fontWeight: 700,
								color: "#1C1B1F",
								lineHeight: 1.1,
								letterSpacing: "-0.02em",
							}}
						>
							Tick Helper
						</h1>
						<p
							style={{
								fontSize: "13px",
								color: "var(--secondary)",
								marginTop: "3px",
							}}
						>
							.NET · UTC · Unix ticks with timezone support
						</p>
					</div>

					{/* Live badge */}
					<div
						style={{
							marginLeft: "auto",
							display: "flex",
							alignItems: "center",
							gap: "6px",
							padding: "5px 12px",
							background: "var(--green-container)",
							borderRadius: "100px",
							fontSize: "12px",
							fontWeight: 600,
							color: "var(--green)",
						}}
					>
						<div
							className="pulse-dot"
							style={{
								width: "7px",
								height: "7px",
								borderRadius: "50%",
								background: "var(--green)",
							}}
						/>
						Live
					</div>
				</div>

				{/* Pill row */}
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: "8px",
						marginTop: "16px",
					}}
				>
					{[
						{
							label: ".NET Ticks",
							color: "#6750A4",
							bg: "#F3EFF9",
						},
						{ label: "UTC Ticks", color: "#0B6BCB", bg: "#E3F2FD" },
						{
							label: "Unix Ticks (ms)",
							color: "#1B7F4F",
							bg: "#E6F4EA",
						},
						{
							label: "Unix Timestamp (sec)",
							color: "#FF6D00",
							bg: "#FFF3E0",
						},
						{
							label: "Timezones",
							color: "#B54708",
							bg: "#FFDBC1",
						},
					].map((p) => (
						<span
							key={p.label}
							className="pill"
							style={{ background: p.bg, color: p.color }}
						>
							<span
								style={{
									width: "6px",
									height: "6px",
									borderRadius: "50%",
									background: p.color,
									display: "inline-block",
								}}
							/>
							{p.label}
						</span>
					))}
				</div>
			</header>

			{/* Body */}
			<div
				style={{
					maxWidth: "1100px",
					margin: "0 auto",
					display: "grid",
					gridTemplateColumns: "1fr 360px",
					gap: "24px",
					alignItems: "start",
				}}
			>
				{/* Left: main converter */}
				<div>
					{/* Tab switcher */}
					<div
						className="card"
						style={{
							padding: "6px",
							marginBottom: "24px",
							display: "inline-flex",
							borderRadius: "18px",
						}}
					>
						{[
							{
								id: "tick-to-dt" as Tab,
								label: "Tick → DateTime",
								icon: "→",
							},
							{
								id: "dt-to-tick" as Tab,
								label: "DateTime → Tick",
								icon: "←",
							},
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								style={{
									padding: "10px 24px",
									borderRadius: "14px",
									border: "none",
									fontFamily: "var(--font-body)",
									fontSize: "14px",
									fontWeight: 600,
									cursor: "pointer",
									transition:
										"all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
									background:
										activeTab === tab.id
											? "var(--primary)"
											: "transparent",
									color:
										activeTab === tab.id
											? "white"
											: "var(--secondary)",
									boxShadow:
										activeTab === tab.id
											? "0 2px 10px rgba(103,80,164,0.3)"
											: "none",
								}}
							>
								{tab.label}
							</button>
						))}
					</div>

					{/* Converter panel */}
					<div
						className="card"
						style={{
							padding: "28px",
							borderRadius: "28px",
						}}
					>
						{/* Panel title */}
						<div style={{ marginBottom: "24px" }}>
							<h2
								style={{
									fontFamily: "var(--font-display)",
									fontSize: "20px",
									fontWeight: 700,
									color: "#1C1B1F",
									letterSpacing: "-0.01em",
								}}
							>
								{activeTab === "tick-to-dt"
									? "Convert Tick → DateTime"
									: "Convert DateTime → Tick"}
							</h2>
							<p
								style={{
									fontSize: "13px",
									color: "var(--secondary)",
									marginTop: "4px",
								}}
							>
								{activeTab === "tick-to-dt"
									? "Enter a tick value and select the format to decode it into a human-readable date."
									: "Pick a date and time to get all tick representations instantly."}
							</p>
						</div>

						<div
							className="divider"
							style={{ marginBottom: "24px" }}
						/>

						{activeTab === "tick-to-dt" ? (
							<TickToDateTime />
						) : (
							<DateTimeToTick />
						)}
					</div>
				</div>

				{/* Right: reference sidebar */}
				<div
					style={{
						position: "sticky",
						top: "24px",
					}}
				>
					<ReferenceCard />
				</div>
			</div>

			{/* Mobile responsive override */}
			<style>{`
        @media (max-width: 768px) {
          main > div[style*="grid"] {
            grid-template-columns: 1fr !important;
          }
          main > div[style*="grid"] > div:last-child {
            position: static !important;
          }
        }
        @media (max-width: 480px) {
          header > div:first-child {
            flex-wrap: wrap;
          }
        }
      `}</style>
		</main>
	);
}
