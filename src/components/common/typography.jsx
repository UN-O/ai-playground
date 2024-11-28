// Components & UI
import Link from "next/link";



export function H1({ className, children }) {
	return (
		<h1 className={`scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl ${className}`}>
			{children}
		</h1>
	);
}

export function H2({ className, children }) {
	return (
		<h2 className={`scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 ${className}`}>
			{children}
		</h2>
	);
}

export function H3({ className, children }) {
	return (
		<h3 className={`scroll-m-20 text-xl font-semibold tracking-tight ${className}`}>
			{children}
		</h3>
	);
}

export function H4({ className, children }) {
	return (
		<h4 className={`scroll-m-20 text-lg font-semibold tracking-tight ${className}`}>
			{children}
		</h4>
	);
}

export function H5({ className, children }) {
	return (
		<h5 className={`scroll-m-20 text-base font-medium tracking-tight ${className}`}>
			{children}
		</h5>
	);
}

export function H6({ className, children }) {
	return (
		<h6 className={`scroll-m-20 text-sm font-medium tracking-tight ${className}`}>
			{children}
		</h6>
	);
}

export function P({ className, children }) {
	return (
		<p className={`leading-7 [&:not(:first-child)]:mt-4 ${className}`}>
			{children}
		</p>
	);
}

export function Muted({ className, children }) {
	return (
		<p className={`text-sm text-muted-foreground ${className}`}>
			{children}
		</p>
	);
}

export function Anchor({ className, children, href }) {
	return (
		<Link href={href} className={`font-medium text-primary hover:underline hover:underline-offset-4 ${className}`}>
			{children}
		</Link>
	);
}