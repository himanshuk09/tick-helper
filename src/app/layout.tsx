import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Tick-Helper — .NET · UTC · Unix",
	description: "Convert between ticks and datetime with timezone support",
};

const RootLayout = ({ children }: {
	children: React.ReactNode;
}) => {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon-32x32.png" sizes="32x32" />
				<link rel="icon" href="/favicon-16x16.png" sizes="16x16" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
			</head>
			<body suppressHydrationWarning>{children}</body>
		</html>
	);
}
export default RootLayout