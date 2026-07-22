import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ==========================================
// 1. NAVIGATION CARD COMPONENT
// ==========================================

interface NavCardProps {
    title: string;
    tag: string;
    tagBg: string;
    tagColor: string;
    description: string;
    features: string[];
    buttonText: string;
    icon: React.ReactNode;
    href: string;
}

const NavCard = ({ title, tag, tagBg, tagColor, description, features, buttonText, icon, href, }: NavCardProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    return (
        <div
            className="card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => router.push(href)}
            style={{
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "24px",
                cursor: "pointer",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
            }}
        >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Card Header: Icon & Badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            background: "var(--surface-1)",
                            border: "1px solid var(--outline-variant)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--primary)",
                        }}
                    >
                        {icon}
                    </div>
                    <span
                        className="pill"
                        style={{
                            background: tagBg,
                            color: tagColor,
                        }}
                    >
                        {tag}
                    </span>
                </div>

                {/* Title & Description */}
                <div>
                    <h3
                        style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#1C1B1F",
                            margin: "0 0 8px 0",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        {title}
                    </h3>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "var(--secondary)",
                            lineHeight: "1.55",
                            margin: 0,
                        }}
                    >
                        {description}
                    </p>
                </div>

                {/* Features Checklist */}
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        margin: "4px 0 0 0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    {features.map((feature, idx) => (
                        <li
                            key={idx}
                            style={{
                                fontSize: "13px",
                                color: "#1C1B1F",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: 500,
                            }}
                        >
                            <span
                                style={{
                                    color: "var(--primary)",
                                    fontWeight: "bold",
                                    fontSize: "14px",
                                }}
                            >
                                ✓
                            </span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Action Button */}
            <Link
                href={href}
                onClick={(e) => e.stopPropagation()} // Prevent double navigation trigger
                className={isHovered ? "btn-primary" : "btn-outlined"}
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    textDecoration: "none",
                }}
            >
                {buttonText}
                <span
                    style={{
                        transition: "transform 0.2s ease",
                        transform: isHovered ? "translateX(4px)" : "none",
                    }}
                >
                    →
                </span>
            </Link>
        </div>
    );
}

export default NavCard