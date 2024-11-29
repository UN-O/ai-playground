'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Check, ArrowUp, Loader2 } from 'lucide-react'
import { set } from 'zod'

interface CheckButtonProps {
	onCheck: () => Promise<void>
	hasNewDrawing: boolean
}

export function CheckButton({ onCheck, hasNewDrawing }: CheckButtonProps) {
	const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')

	useEffect(() => {
		if (hasNewDrawing && status === 'sent') {
			setStatus('idle')
		}
	}, [hasNewDrawing, status])

	const handleClick = async () => {
		setStatus('loading')
		await onCheck()
		setStatus('sent')
		setTimeout(() => {
			setStatus('idle')
		}, 2000)
	}

	return (
		<Button
			variant="secondary"
			size="icon"
			className="absolute top-2 right-2 z-10"
			onClick={handleClick}
			disabled={status === 'loading'}
		>
			{status === 'loading' ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : status === 'sent' ? (
				<Check className="h-4 w-4" />
			) : (
				<ArrowUp className="h-4 w-4" />
			)}
		</Button>
	)
}

