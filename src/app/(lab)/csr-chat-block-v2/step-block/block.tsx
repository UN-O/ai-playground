'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../_components/ui/tooltip'
import { X, XCircle, MessageCircle } from 'lucide-react'
import { MarkdownText } from '@/components/common/typography'
import HighlightOverlay from '../_components/highlight-overlay'

interface BlockProps {
	onCloseAction: () => void
	setSelectTextAction: (text: string) => void
}

interface FloatingMenuProps {
	x: number
	y: number
	onCancel: () => void
	onReply: () => void
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ x, y, onCancel, onReply }) => (
	<div
		className="absolute z-10 flex gap-2 bg-white border rounded shadow-lg p-2"
		style={{ left: `${x}px`, top: `${y}px` }}
	>
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline" size="icon" onClick={onCancel}>
						<XCircle className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>取消</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline" size="icon" onClick={onReply}>
						<MessageCircle className="h-4 w-4" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>回覆</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	</div>
)

export default function Block({ onCloseAction, setSelectTextAction }: BlockProps) {
	const [content, setContent] = useState('')
	const [_selectedText, _setSelectedText] = useState('')
	const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
	const [highlightRects, setHighlightRects] = useState<DOMRect[]>([])
	const scrollAreaRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		fetch('/mdfile/tai_test.md')
			.then(response => response.text())
			.then(text => setContent(text))
	}, [])

	const handleTextSelection = useCallback(() => {
		const selection = window.getSelection()
		if (selection && !selection.isCollapsed) {
			const range = selection.getRangeAt(0)
			const rects = Array.from(range.getClientRects())
			const scrollArea = scrollAreaRef.current

			if (scrollArea) {
				const scrollAreaRect = scrollArea.getBoundingClientRect()
				const adjustedRects = rects.map(rect => new DOMRect(
					rect.left - scrollAreaRect.left,
					rect.top - scrollAreaRect.top,
					rect.width,
					rect.height
				))

				_setSelectedText(selection.toString())
				setMenuPosition({
					x: rects[rects.length - 1].right - scrollAreaRect.left,
					y: rects[rects.length - 1].bottom - scrollAreaRect.top
				})
				setHighlightRects(adjustedRects)
			}
		} else {
			clearSelection()
		}
	}, [])

	const clearSelection = useCallback(() => {
		_setSelectedText('')
		setMenuPosition(null)
		setHighlightRects([])
	}, [])

	const handleCancelSelection = useCallback(() => {
		clearSelection()
	}, [clearSelection])

	const handleReply = useCallback(() => {
		setSelectTextAction(_selectedText)
		clearSelection()
	}, [_selectedText, setSelectTextAction, clearSelection])

	return (
		<div className="relative h-full bg-white">
			<Button
				variant="ghost"
				size="icon"
				className="bg-black absolute right-2 top-2 z-10"
				onClick={onCloseAction}
			>
				<X className="h-4 w-4" />
			</Button>
			<ScrollArea className="h-full p-4" onMouseUp={handleTextSelection} ref={scrollAreaRef}>
				<MarkdownText className={''}>{content}</MarkdownText>
				<HighlightOverlay rects={highlightRects} />
			</ScrollArea>
			{menuPosition && (
				<FloatingMenu
					x={menuPosition.x}
					y={menuPosition.y}
					onCancel={handleCancelSelection}
					onReply={handleReply}
				/>
			)}
		</div>
	)
}