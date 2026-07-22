"use client";
import NavCard from "@/components/NavCard";

const Home = () => {
	return (
		<div
			suppressHydrationWarning
			// className="animate-in"
			style={{
				minHeight: "100vh",
				padding: "32px 20px",
				position: "relative",
				zIndex: 1,
			}}
		>
			<div
				style={{
					maxWidth: "1080px",
					margin: "0 auto",
					display: "flex",
					flexDirection: "column",
					gap: "32px",
				}}
			>
				{/* Top Branding Navbar */}
				<header
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						borderBottom: "1px solid var(--outline-variant)",
						paddingBottom: "20px",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
						<div
							style={{
								width: "38px",
								height: "38px",
								borderRadius: "10px",
								background: "var(--primary)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "var(--on-primary)",
								boxShadow: "var(--shadow)",
							}}
						>
							{/* Pulse / Time-Series Wave Icon */}
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2.2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M22 12h-4l-3 9L9 3l-3 9H2" />
							</svg>
						</div>
						<span
							style={{
								fontSize: "20px",
								fontWeight: 700,
								color: "#1C1B1F",
								fontFamily: "var(--font-display)",
								letterSpacing: "-0.02em",
							}}
						>
							SyncTicks
						</span>
					</div>

					<span
						className="pill"
						style={{
							background: "var(--surface-1)",
							color: "var(--secondary)",
							border: "1px solid var(--outline-variant)",
						}}
					>
						v2.0 Developer Tools
					</span>
				</header>

				{/* Descriptive Hero Header */}
				<section
					style={{
						textAlign: "center",
						maxWidth: "680px",
						margin: "0 auto",
						padding: "12px 0",
					}}
				>
					<h1
						style={{
							fontSize: "36px",
							fontWeight: 700,
							color: "#1C1B1F",
							margin: "0 0 12px 0",
							fontFamily: "var(--font-display)",
							letterSpacing: "-0.025em",
						}}
					>
						High-Precision Time-Series &amp; Tick Hub
					</h1>
					<p
						style={{
							fontSize: "15px",
							color: "var(--secondary)",
							lineHeight: "1.6",
							margin: 0,
						}}
					>
						Generate customizable time-series CSV for integration testing, and decode high-precision 100-nanosecond ticks between standard timezones on the fly.
					</p>
				</section>

				{/* Navigation Cards Grid */}
				<main
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
						gap: "24px",
					}}
				>
					{/* Card 1: Time-Series Generator */}
					<NavCard
						title="Time-Series CSV Generator"
						tag="Data Seeding & Mocking"
						tagBg="var(--primary-container)"
						tagColor="var(--on-primary-container)"
						description="Configure ranges, custom delimiters, intervals, and DST rules to export structured time-series datasets for system integration."
						features={[
							"Custom interval options (1m, 15m, 60m, Daily)",
							"European (comma) & US (dot) localized formats",
							"Random value range or static telemetry generation",
						]}
						buttonText="Open CSV Generator"
						href="/timeseries"
						icon={
							<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
							</svg>
						}
					/>

					{/* Card 2: .NET Ticks Helper */}
					<NavCard
						title=".NET Ticks Helper"
						tag="Precision Conversion"
						tagBg="var(--green-container)"
						tagColor="var(--green)"
						description="Convert high-precision 100-nanosecond 64-bit .NET ticks to UTC standard date formats and back without precision loss."
						features={[
							"Bidirectional 64-bit BigInt conversion (Ticks ↔ DateTime)",
							"Preserves exact 100-ns tick precision for SQL & .NET",
							"Instant copyable output with full ISO date strings",
						]}
						buttonText="Open Ticks Helper"
						href="/ticks-helper"
						icon={
							<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						}
					/>
				</main>
			</div>
		</div>
	);
}
export default Home