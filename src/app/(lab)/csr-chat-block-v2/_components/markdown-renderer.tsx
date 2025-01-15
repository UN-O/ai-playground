import React from 'react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
	content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
	return (
		<ReactMarkdown
			components={{
				h1: ({ children }) => <h1 className="text-black text-2xl font-bold mb-4">{children}</h1>,
				h2: ({ children }) => <h2 className="text-black text-xl font-semibold mb-3">{children}</h2>,
				h3: ({ children }) => <h3 className="text-black text-base font-medium mb-2">{children}</h3>,
				h4: ({ children }) => <h4 className="text-black text-sm font-medium mb-2">{children}</h4>,
				p: ({ children }) => <p className="text-black text-xs mb-4">{children}</p>,
				ul: ({ children }) => <ul className="text-black list-disc list-inside mb-4">{children}</ul>,
				ol: ({ children }) => <ol className="text-black list-decimal list-inside mb-4">{children}</ol>,
				li: ({ children, ordered, depth }) => {
					const listItemClass = cn(
						"mb-1",
						depth > 0 && "ml-4",
						ordered ? "list-decimal" : "list-disc"
					)
					return <li className={listItemClass}>{children}</li>
				},
				code: ({ node, inline, className, children, ...props }) => {
					const match = /language-(\w+)/.exec(className || '')
					return !inline && match ? (
						<pre className="text-black bg-gray-300 p-2 rounded mb-4 overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
					) : (
						<code className="text-black bg-gray-300 rounded px-1" {...props}>
							{children}
						</code>
					)
				},
			}}
		>
			{content}
		</ReactMarkdown>
	)
}

