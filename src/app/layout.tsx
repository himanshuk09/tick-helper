import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Tick-Helper — .NET · UTC · Unix",
	description: "Convert between ticks and datetime with timezone support",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
