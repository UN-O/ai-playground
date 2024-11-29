'use client'

import { useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eraser, Pen, Redo, Undo, RotateCcw } from 'lucide-react'
import { CheckButton } from "./_components/check-button"
import { StrokeList } from "./_components/stroke-list"
import { SVGCanvas } from "./_components/svg-canvas"

interface Point {
	x: number;
	y: number;
	pressure: number;
}

interface Stroke {
	id: string;
	points: Point[];
	timestamp: number;
}



export default function SketchApp({ handleSend }) {
	const [strokes, setStrokes] = useState<Stroke[]>([])
	const [currentStroke, setCurrentStroke] = useState<Point[]>([])
	const [isDrawing, setIsDrawing] = useState(false)
	const [eraseMode, setEraseMode] = useState(false)
	const [hasNewDrawing, setHasNewDrawing] = useState(false)
	const svgRef = useRef<SVGSVGElement>(null)

	const handlePointerDown = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
		const point = getPointerPosition(event)
		if (eraseMode) {
			eraseStrokes(point)
		} else {
			setCurrentStroke([point])	
		}
		setIsDrawing(true)
		event.currentTarget.setPointerCapture(event.pointerId)
	}, [eraseMode])

	const handlePointerMove = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
		if (!isDrawing && !eraseMode) return
		const point = getPointerPosition(event)
		if (eraseMode) {
			if (isDrawing) eraseStrokes(point)
		} else {
			setCurrentStroke(prev => [...prev, point])
		}
	}, [isDrawing, eraseMode])

	const handlePointerUp = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
		if (eraseMode) return
		setIsDrawing(false)
		if (currentStroke.length > 1) {
			const newStroke: Stroke = {
				id: Date.now().toString(),
				points: currentStroke,
				timestamp: Date.now()
			}
			setStrokes(prev => [...prev, newStroke])
			setHasNewDrawing(true)
		}
		setCurrentStroke([])
		event.currentTarget.releasePointerCapture(event.pointerId)
	}, [currentStroke, eraseMode])

	const eraseStrokes = useCallback((point: Point) => {
		setStrokes(prevStrokes =>
			prevStrokes.filter(stroke =>
				!stroke.points.some(p =>
					Math.hypot(p.x - point.x, p.y - point.y) < 30
				)
			)
		)
		setHasNewDrawing(true)
	}, [])

	const handleEraserClick = useCallback(() => {
		setEraseMode(true)
	}, [])

	const handlePenClick = useCallback(() => {
		setEraseMode(false)
	}, [])

	const handleUndoClick = useCallback(() => {
		setStrokes(prev => prev.slice(0, -1))
		setHasNewDrawing(true)
	}, [])

	const handleRedoClick = useCallback(() => {
		// Redo functionality would require storing undone strokes
		// This is left as an exercise for further improvement
	}, [])

	const handleClearClick = useCallback(() => {
		setStrokes([])
		setHasNewDrawing(true)
	}, [])

	const handleResetClick = useCallback(() => {
		setStrokes([])
		setHasNewDrawing(true)
	}, [])
	const handleCheckClick = async () => {
		if (svgRef.current) {
			const svgElement = svgRef.current;

			const exportAsImage = (svgElement, format = 'png', scale = 2) => {
				return new Promise((resolve, reject) => {
					if (!['png', 'jpeg', 'gif', 'webp'].includes(format)) {
						reject(new Error(`Unsupported format: ${format}. Use one of ['png', 'jpeg', 'gif', 'webp'].`));
						return;
					}

					const svgData = new XMLSerializer().serializeToString(svgElement);
					const canvas = document.createElement('canvas');
					const context = canvas.getContext('2d');
					const img = new Image();
					const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
					const url = URL.createObjectURL(svgBlob);

					img.onload = () => {
						const width = svgElement.clientWidth || 300;
						const height = svgElement.clientHeight || 150;
						canvas.width = width * scale;
						canvas.height = height * scale;

						// 加入白底
						context.fillStyle = 'white';
						context.fillRect(0, 0, canvas.width, canvas.height);

						context.scale(scale, scale);
						context.drawImage(img, 0, 0);

						canvas.toBlob(
							(blob) => {
								if (blob) {
									resolve(blob);
								} else {
									reject(new Error('Canvas toBlob failed'));
								}
							},
							`image/${format}`,
							1.0 // 高畫質
						);
						URL.revokeObjectURL(url);
					};

					img.onerror = () => {
						URL.revokeObjectURL(url);
						reject(new Error('Failed to load SVG into Image'));
					};

					img.src = url;
				});
			};

			try {
				const blob = await exportAsImage(svgElement, 'png'); // 可調整格式

				// 傳送 Base64 (選擇性)
				const base64Image = await blobToBase64(blob);
				handleSend(base64Image);
				console.log('Base64 Encoded Image:', base64Image);

				setHasNewDrawing(false);
			} catch (error) {
				console.error('Error exporting and downloading image:', error);
			}
		}
	};

	// 工具函式：Blob 轉 Base64
	const blobToBase64 = (blob) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (typeof reader.result === 'string') {
					resolve(reader.result.split(',')[1]);
				} else {
					reject(new Error('Failed to convert blob to Base64'));
				}
			};
			reader.onerror = () => reject(new Error('Failed to convert blob to Base64'));
			reader.readAsDataURL(blob);
		});
	};




	const handleDeleteStroke = useCallback((id: string) => {
		setStrokes(prevStrokes => prevStrokes.filter(stroke => stroke.id !== id))
		setHasNewDrawing(true)
	}, [])

	const getPointerPosition = (event: React.PointerEvent<SVGSVGElement>): Point => {
		const svg = svgRef.current
		if (!svg) return { x: 0, y: 0, pressure: 0.5 }
		const CTM = svg.getScreenCTM()
		if (!CTM) return { x: 0, y: 0, pressure: 0.5 }
		return {
			x: (event.clientX - CTM.e) / CTM.a,
			y: (event.clientY - CTM.f) / CTM.d,
			pressure: 0.5
		}
	}

	return (
		<Card className="w-full h-full max-h-svh max-w-4xl mx-auto overflow-hidden select-none touch-none">
			<CardContent className="p-6 h-full">
				<div className="flex h-full">
					<div className="relative flex-grow h-[calc(100%-5rem)]">
						<div className="absolute left-2 top-2 flex flex-col gap-2 z-10">
							<Button
								variant={eraseMode ? "outline" : "default"}
								size="icon"
								onClick={handlePenClick}
							>
								<Pen className="h-4 w-4" />
							</Button>
							<Button
								variant={eraseMode ? "default" : "outline"}
								size="icon"
								onClick={handleEraserClick}
							>
								<Eraser className="h-4 w-4" />
							</Button>
							<Button onClick={handleUndoClick} size="icon" variant="secondary" >
								<Undo className="h-4 w-4" />
							</Button>
							<Button onClick={handleRedoClick} size="icon" variant="secondary" >
								<Redo className="h-4 w-4" />
							</Button>
							<Button onClick={handleClearClick} size="icon" variant="secondary" >
								<RotateCcw className="h-4 w-4" />
							</Button>
						</div>
						<SVGCanvas
							ref={svgRef}
							strokes={strokes}
							currentStroke={currentStroke}
							onPointerDown={handlePointerDown}
							onPointerMove={handlePointerMove}
							onPointerUp={handlePointerUp}
							eraseMode={eraseMode}
						/>
						<CheckButton onCheck={handleCheckClick} hasNewDrawing={hasNewDrawing} />
					</div>
					{/* <div className="ml-4">
            <StrokeList strokes={strokes} onDeleteStroke={handleDeleteStroke} />
          </div> */}
				</div>
			</CardContent>
		</Card>
	)
}

