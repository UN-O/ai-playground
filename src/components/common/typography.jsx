"use client";
import Link from "next/link";
import React from 'react';
import dynamic from "next/dynamic";
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Markdown
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
const Twemoji = dynamic(() => import("react-twemoji"), { ssr: false });

// Images & Icons
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";

// Constants & Variables
const inlineMessageVariants = cva(
    "inline-flex items-center gap-3 px-2 py-0.5 rounded-xs",
    {
        variants: {
            variant: {
                default: "text-zinc-600 bg-zinc-200/25 dark:text-zinc-300",
                info: "text-zinc-600 bg-zinc-200/25 dark:text-zinc-300",
                success: "text-green-500 bg-green-200/25",
                warning: "text-amber-600 bg-amber-200/25 dark:text-amber-500",
                error: "text-destructive bg-red-200/25 dark:text-red-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);


export function MarkdownText({ children, className }) {

    return (
        <Markdown
            className={className}
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ node, ...props }) => (
                    <Twemoji options={{ className: 'twemoji' }}>
                        <p className="mb-4" {...props} />
                    </Twemoji>
                ),
                h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-extrabold mb-6" {...props} />
                ),
                h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-bold mb-5" {...props} />
                ),
                h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-semibold mb-4" {...props} />
                ),
                ul: ({ node, ...props }) => (
                    <ul className="list-disc list-inside space-y-2 m-3" {...props} />
                ),
                ol: ({ node, ...props }) => (
                    <ol className="list-decimal list-inside space-y-2 m-3" {...props} />
                ),
                li: ({ node, children, ...props }) => (
                    <li className="mb-2" {...props}>
                        {React.Children.map(children, (child) => {
                            if (React.isValidElement(child) && child.type === "input") {
                                const { type, checked, disabled, ...inputProps } = child.props;
                                return (
                                    <input
                                        type={type}
                                        disabled={false}
                                        {...(checked ? { defaultChecked: checked } : {})}
                                        {...inputProps}
                                    />
                                );
                            }
                            return child;
                        })}
                    </li>
                ),
                hr: ({ node, ...props }) => (
                    <>
                        <div className="p-2 w-full"></div>
                        <hr className="border-gray-600" {...props} />
                        <div className="p-3 w-full"></div>
                    </>

                ),
                code: ({ node, inline, className, children, ...props }) => {
                    const isJavaScript = /javascript/.test(className || '');
                    return inline ? (
                        <code className="bg-gray-800 text-yellow-300 px-1 py-0.5 rounded" {...props}>
                            {children}
                        </code>
                    ) : (
                        <pre className="bg-gray-800 text-yellow-300 p-4 rounded-lg overflow-auto my-4">
                            <code className={`language-${isJavaScript ? 'javascript' : 'plaintext'}`} {...props}>
                                {children}
                            </code>
                        </pre>
                    );
                },
                blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400 bg-gray-900 p-2 rounded mb-4" {...props} />
                ),
                a: ({ node, ...props }) => (
                    <a className="text-blue-400 hover:underline transition-colors duration-200" {...props} />
                ),
                img: ({ node, ...props }) => (
                    <img className="max-w-full h-auto rounded shadow-lg my-4" {...props} alt={props.alt || 'Image'} />
                ),
                table: ({ node, ...props }) => (
                    <table className="min-w-full bg-gray-800 text-gray-300 mb-4" {...props} />
                ),
                th: ({ node, ...props }) => (
                    <th className="border-b border-gray-700 px-4 py-2 text-left text-gray-100" {...props} />
                ),
                td: ({ node, ...props }) => (
                    <td className="border-b border-gray-700 px-4 py-2" {...props} />
                ),
            }}
        >
            {children}
        </Markdown>
    );
};

export function InlineMessage({ className, variant = "default", message, useIcon = true }) {
    function getIconByVariant() {
        switch (variant) {
            case "error":
                return <CircleX className="size-4" />;
            case "warning":
                return <CircleAlert className="size-4" />;
            case "success":
                return <CircleCheck className="size-4" />;
            case "info":
                return <Info className="size-4" />;
            default:
                return null;
        }
    }
    return (
        <span className={cn(inlineMessageVariants({ variant, className }))}>
            {useIcon && getIconByVariant()}
            {message}
        </span>
    );
}

export function H1({ className, children }) {
	return (
		<h1 className={cn("scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl", className)}>
			{children}
		</h1>
	);
}

export function H2({ className, children }) {
	return (
		<h2 className={cn("scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0", className)}>
			{children}
		</h2>
	);
}

export function H3({ className, children }) {
	return (
		<h3 className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}>
			{children}
		</h3>
	);
}

export function H4({ className, children }) {
	return (
		<h4 className={cn("scroll-m-20 text-lg font-semibold tracking-tight", className)}>
			{children}
		</h4>
	);
}

export function H5({ className, children }) {
	return (
		<h5 className={cn("scroll-m-20 text-base font-medium tracking-tight", className)}>
			{children}
		</h5>
	);
}

export function H6({ className, children }) {
	return (
		<h6 className={cn("scroll-m-20 text-sm font-medium tracking-tight", className)}>
			{children}
		</h6>
	);
}

export function P({ className, children }) {
	return (
		<p className={cn("leading-7 [&:not(:first-child)]:mt-4", className)}>
			{children}
		</p>
	);
}

export function Muted({ className, as: Component = "p", children }) {
	return (
		<Component className={cn("text-sm text-muted-foreground", className)}>
			{children}
		</Component>
	);
}

export function Anchor({ className, children, href }) {
	return (
		<Link href={href} className={cn("font-medium text-primary hover:underline hover:underline-offset-4", className)}>
			{children}
		</Link>
	);
}