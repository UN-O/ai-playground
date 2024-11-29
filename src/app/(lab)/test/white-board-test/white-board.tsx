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
		if (!svgRef.current) return;

		const svgElement = svgRef.current;

		const exportAsImage = (svgElement, format = 'png', scale = 2) => {
			return new Promise((resolve, reject) => {
				if (!['png', 'jpeg', 'gif', 'webp'].includes(format)) {
					reject(new Error(`Unsupported format: ${format}. Use one of ['png', 'jpeg', 'gif', 'webp'].`));
					return;
				}

				const rect = svgElement.getBoundingClientRect();
				const width = rect.width * window.devicePixelRatio; // 適配高分辨率螢幕
				const height = rect.height * window.devicePixelRatio;
				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d');
				const img = new Image();

				canvas.width = width * scale;
				canvas.height = height * scale;

				// 確保畫布初始化為白底
				context.fillStyle = 'white';
				context.fillRect(0, 0, canvas.width, canvas.height);
				context.scale(scale * window.devicePixelRatio, scale * window.devicePixelRatio);

				const serializeSVG = () => {
					const svgData = new XMLSerializer().serializeToString(svgElement);
					const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
					return URL.createObjectURL(svgBlob);
				};

				const loadImage = (src) => {
					return new Promise((resolve, reject) => {
						img.onload = () => resolve(img);
						img.onerror = () => reject(new Error('Failed to load SVG into Image'));
						img.src = src;
					});
				};

				const exportToBlob = () => {
					return new Promise((resolve, reject) => {
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
					});
				};

				(async () => {
					try {
						const url = serializeSVG();
						await loadImage(url);
						context.drawImage(img, 0, 0); // 畫布繪製圖像
						URL.revokeObjectURL(url); // 清除 URL
						const blob = await exportToBlob();
						resolve(blob);
					} catch (error) {
						reject(error);
					}
				})();
			});
		};

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

		try {
			const blob = await exportAsImage(svgElement, 'png', 2); // 可調整格式與縮放比例
			const base64Image = await blobToBase64(blob); // 將 Blob 轉換為 Base64
			handleSend(base64Image); // 傳送 Base64 編碼影像
			console.log('Base64 Encoded Image:', base64Image);
			setHasNewDrawing(false);
		} catch (error) {
			console.error('Error exporting and downloading image:', error);
		}
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

