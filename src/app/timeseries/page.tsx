"use client";
import { useState } from "react";
import TimeseriesGenerator from "@/components/TimeseriesGenerator";
import TimeseriesGapDetector from "@/components/TimeseriesGapDetector";
import Clock from "@/components/Clock";
import { useRouter } from "next/navigation";

type Tab = "generator" | "gaps";

const TimeSeriesGenerator = () => {
    const [activeTab, setActiveTab] = useState<Tab>("generator");
    const router = useRouter();
    return (
        <main
            style={{
                position: "relative",
                zIndex: 1,
                minHeight: "100vh",
                padding: "0 16px 80px",
            }}
        >
            <div
                onClick={() => router.back()}
                style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "999px",
                    background: "white",
                    border: "1px solid var(--outline-variant)",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: "14px",
                    zIndex: 1000,
                }}
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M19 12H5" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
            </div>
            {/* Header */}
            <header
                style={{
                    maxWidth: "1500px",
                    margin: "0 auto",
                    padding: "36px 0 28px",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "16px",
                        marginBottom: "16px",
                    }}
                >
                    {/* Brand Title */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
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
                                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                            }}
                        >
                            <Clock
                                style={{
                                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.25))",
                                }}
                            />
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
                                Timeseries Utility Suite
                            </h1>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "var(--secondary)",
                                    marginTop: "3px",
                                }}
                            >
                                .NET · UTC · Unix ticks &amp; Time-Series datasets validation and generation
                            </p>
                        </div>
                    </div>
                    {/* Live badge */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 14px",
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
                        Live Tool
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div style={{ maxWidth: "1500px", margin: "0 auto" }}>
                {/* Tab Switcher */}
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
                            id: "generator" as Tab,
                            label: "CSV Generator",
                            icon: "⚙️",
                        },
                        {
                            id: "gaps" as Tab,
                            label: "Gap Detector",
                            icon: "🔍",
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
                                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                                background: activeTab === tab.id ? "var(--primary)" : "transparent",
                                color: activeTab === tab.id ? "white" : "var(--secondary)",
                                boxShadow: activeTab === tab.id ? "0 2px 10px rgba(103,80,164,0.3)" : "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content Panel */}
                <div
                    className="card"
                    style={{
                        padding: "32px",
                        borderRadius: "28px",
                    }}
                >
                    {activeTab === "generator" ? (
                        <TimeseriesGenerator />
                    ) : (
                        <TimeseriesGapDetector />
                    )}
                </div>

            </div>
        </main>
    );
}
export default TimeSeriesGenerator;