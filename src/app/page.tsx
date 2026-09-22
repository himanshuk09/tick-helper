"use client";
import { useEffect, useState } from "react";
import Clock from "@/components/Clock";
import NavCard from "@/components/NavCard";

const Home = () => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

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
								width: "48px",
								height: "48px",
								borderRadius: "16px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
								background: "#fff",
								boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
							}}
						>
							<Clock
								style={{
									filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))",
								}}
							/>
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
						// gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
						gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
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
						href="/tick-helper"
						icon={
							<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						}
					/>
					<NavCard
						title="Product Price"
						tag="Market Price Lookup"
						tagBg="var(--primary-container)"
						tagColor="var(--on-primary-container)"
						description="Retrieve and explore product prices from the market price service with configurable energy types, product types, trading facilities, price types, and quality options."
						features={[
							"Select energy type, product type, trading facility, and price type",
							"Retrieve settlement and other available product prices directly from the service",
							"View product price data with clear values, dates, and product details",
						]}
						buttonText="Open Product Price"
						href="https://web-services-fetcher.vercel.app/"
						icon={
							<svg
								width="24"
								height="24"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 8c-2.21 0-4 1.12-4 2.5S9.79 13 12 13s4 1.12 4 2.5S14.21 18 12 18m0-12v12m0-14v2m0 12v2m7-8a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						}
					/>
				</main>
			</div>
		</div>
	);
}
export default Home