"use client";
import { FORMULAS, REFERENCE } from "@/lib/ticks";
import { useState } from "react";

export default function ReferenceCard() {
	const [tab, setTab] = useState<"ref" | "formula">("ref");
	return (
		<>
			<div
				style={{
					display: "inline-flex",
					background: "white",
					padding: "6px",
					borderRadius: "16px",
					marginBottom: "24px",
				}}
				className="card"
			>
				{[
					{ id: "ref", label: "Reference" },
					{ id: "formula", label: "Formulas" },
				].map((t) => (
					<button
						key={t.id}
						onClick={() => setTab(t.id as any)}
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
								tab === t.id ? "var(--primary)" : "transparent",
							color: tab === t.id ? "white" : "var(--secondary)",
							boxShadow:
								tab === t.id
									? "0 2px 10px rgba(103,80,164,0.3)"
									: "none",
						}}
					>
						{t.label}
					</button>
				))}
			</div>
			{tab == "ref" && (
				<>
					{" "}
					<div
						style={{
							fontSize: "18px",
							fontWeight: 700,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "var(--secondary)",
							marginBottom: "8px",
						}}
					>
						Format Reference
					</div>
					<div
						style={{
							display: "grid",
							gridTemplateColumns:
								"repeat(auto-fit, minmax(280px, 1fr))",
							gap: "16px",
						}}
					>
						{REFERENCE.map((ref) => (
							<div
								key={ref.title}
								style={{
									background: ref.bg,
									borderRadius: "20px",
									padding: "18px",
									border: `1px solid ${ref.color}20`,
									// marginBottom: "16px",
								}}
								className="card"
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
											marginTop: "auto",
											paddingTop: "12px",
										}}
									>
										<div
											style={{
												padding: "8px 12px",
												background:
													"rgba(255,255,255,0.7)",
												borderRadius: "10px",
												display: "flex",
												gap: "8px",
												alignItems: "center",
												overflow: "hidden", // prevents layout break
											}}
										>
											<span
												style={{
													fontSize: "11px",
													fontWeight: 600,
													color: "var(--secondary)",
													textTransform: "uppercase",
													letterSpacing: "0.06em",
													flexShrink: 0, // prevents shrinking
												}}
											>
												C#
											</span>

											<div
												style={{
													overflowX: "auto",
													whiteSpace: "nowrap",
													flex: 1,
												}}
											>
												<code
													style={{
														fontFamily:
															"var(--font-mono)",
														fontSize: "12px",
														color: ref.color,
														fontWeight: 600,
													}}
												>
													{ref.dotnet}
												</code>
											</div>
										</div>
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
				</>
			)}

			{/* Conversion formulas */}
			{tab === "formula" && (
				<div
					style={{
						background: "white",
						borderRadius: "20px",
						padding: "18px",
						border: "1px solid var(--outline-variant)",
						paddingRight: "24px",
					}}
					className="card"
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
					{FORMULAS.map((f) => (
						<div
							key={f.label}
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "8px 0",
								borderBottom:
									"1px solid var(--outline-variant)",
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
			)}
		</>
	);
}
