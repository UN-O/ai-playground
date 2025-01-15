import React, { useState, useCallback, useEffect } from 'react'

interface ResizerProps {
	onResize: (newSize: number) => void
}

const ResizerBar: React.FC<ResizerProps> = ({ onResize }) => {
	const [isResizing, setIsResizing] = useState(false)

	const startResizing = useCallback((e: React.MouseEvent) => {
		e.preventDefault()
		setIsResizing(true)
	}, [])

	const stopResizing = useCallback(() => {
		setIsResizing(false)
	}, [])

	const resize = useCallback(
		(mouseMoveEvent: MouseEvent) => {
			if (isResizing) {
				const newSize = (mouseMoveEvent.clientX / window.innerWidth) * 100
				onResize(newSize)
			}
		},
		[isResizing, onResize]
	)

	useEffect(() => {
		window.addEventListener('mousemove', resize)
		window.addEventListener('mouseup', stopResizing)
		return () => {
			window.removeEventListener('mousemove', resize)
			window.removeEventListener('mouseup', stopResizing)
		}
	}, [resize, stopResizing])

	return (
		<div
			className="w-1 cursor-col-resize bg-transparent hover:bg-gray-300 transition-colors"
			onMouseDown={startResizing}
		/>
	)
}

export default ResizerBar

