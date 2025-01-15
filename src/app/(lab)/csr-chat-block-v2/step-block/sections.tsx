'use client'

import { useEffect, useState, useCallback } from 'react'
import Chat from './chat'
import Block from './block'
import ResizerBar from '../_components/resizer-bar'
import { Button } from '@/components/ui/button'

export default function Home() {
	const [isBlockOpen, setIsBlockOpen] = useState(false)
	const [selectedText, setSelectedText] = useState('')
	const [chatSize, setChatSize] = useState(50)

	const handleSelectedText = (text: string) => {
		setSelectedText(text)
	}

	const handleResize = useCallback((newSize: number) => {
		setChatSize(Math.max(20, Math.min(80, newSize)))
	}, [])

	useEffect(() => {
		const handleResize = () => {
			// 重新調整 Chat 區塊大小
			setChatSize(prevSize => prevSize)
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return (
		<div className="flex h-screen">
			{isBlockOpen && (
				<>
					<div style={{width: `${chatSize}%`}} className="transition-all duration-75 ease-out">
						<Chat selectedText={selectedText}/>
					</div>
					<ResizerBar onResize={handleResize}/>
					<div style={{width: `${100 - chatSize}%`}} className="transition-all duration-75 ease-out">
						<Block onCloseAction={() => setIsBlockOpen(false)} setSelectTextAction={handleSelectedText}/>
					</div>
				</>
			)}
			{!isBlockOpen && (
				<>
					<div style={{width: `${chatSize*2}%`}} className="transition-all duration-75 ease-out">
						<Chat selectedText={selectedText}/>
					</div>					<Button
						className="fixed right-4 top-4"
						onClick={() => setIsBlockOpen(true)}
					>
						打開 Block
					</Button>
				</>
			)}
			</div>
	)
}