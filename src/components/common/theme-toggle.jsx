"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// Components & UI
import { Button } from "@/components/ui/button";

// Images & Icons
import { Sun } from "lucide-react";
import { MoonIcon } from "@radix-ui/react-icons";

// Constants & Variables
const BUTTONS = [
	{ title: "切換至淺色模式", icon: <Sun className="!size-3.5" />, theme: "light" },
	{ title: "切換至黑暗模式", icon: <MoonIcon className="!size-3.5" />, theme: "dark" },
];



export function ThemeToggle({ className }) {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => setMounted(true), []);

	return (
		<div className={`flex items-center w-max border border-input rounded-full ${className}`}>
			{BUTTONS.map(button => (
				<Button
					key={button.theme}
					title={button.title}
					variant="ghost"
					className={`size-8 rounded-full ${mounted && button.theme === theme ? "bg-accent" : ""}`}
					onClick={() => setTheme(button.theme)}
				>
					{button.icon}
				</Button>
			))}
		</div>
	);
}