"use client";
import TimeseriesGenerator from "@/components/TimeseriesGenerator";
import Clock from "@/components/Clock";
const TimeSeriesGenerator = () => {
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
                                Timeseries Generator
                            </h1>
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "var(--secondary)",
                                    marginTop: "3px",
                                }}
                            >
                                .NET · UTC · Unix ticks &amp; Time-Series CSV generation
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

                <div
                    className="card"
                    style={{
                        padding: "32px",
                        borderRadius: "28px",
                    }}
                >
                    <TimeseriesGenerator />
                </div>

            </div>
        </main>
    );
}
export default TimeSeriesGenerator