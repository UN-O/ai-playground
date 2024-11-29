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
	const scaleRef = useRef(1)
	const qualityRef = useRef(0.8)

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

		const exportAsImage = (svgElement, format = 'webp', scale = 2, quality = 1.0) => {
			return new Promise((resolve, reject) => {
				const rect = svgElement.getBoundingClientRect();
				const width = rect.width * window.devicePixelRatio;
				const height = rect.height * window.devicePixelRatio;
				const canvas = document.createElement('canvas');
				const context = canvas.getContext('2d');
				const img = new Image();

				canvas.width = width * scale;
				canvas.height = height * scale;

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
							quality
						);
					});
				};

				(async () => {
					try {
						const url = serializeSVG();
						await loadImage(url);
						context.drawImage(img, 0, 0);
						URL.revokeObjectURL(url);
						const blob = await exportToBlob();
						resolve(blob);
					} catch (error) {
						reject(error);
					}
				})();
			});
		};

		const compressImageToFit = async (svgElement, targetFileSize = 7.5 * 1024) => {
			let scale = scaleRef.current;
			let quality = qualityRef.current;
			let format = 'webp'; // 使用高壓縮率格式
			let blob;
			let originalSize;

			while (scale > 0.1) {
				try {
					blob = await exportAsImage(svgElement, format, scale, quality);

					// 記錄原始檔案大小
					if (!originalSize) {
						originalSize = blob.size;
						console.log(`Original File Size: ${originalSize / 1024} KB`);
					}

					if (blob.size <= targetFileSize) {
						console.log(`Final File Size: ${blob.size / 1024} KB`);
						console.log(
							`Compression Ratio: ${(1 - blob.size / originalSize) * 100}%`
						);
						return blob;
					}

					// 若檔案過大，降低品質或縮放比例
					quality -= 0.1;
					if (quality < 0.1) {
						quality = 1.0;
						scale -= 0.1;
					}
				} catch (error) {
					console.error('Compression failed:', error);
					break;
				}
			}

			scaleRef.current = scale;
			qualityRef.current = quality;

			throw new Error('Unable to compress image to fit within the specified file size.');
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
			const compressedBlob = await compressImageToFit(svgElement, 7.5 * 1024); // 壓縮至 7.5 KB
			const base64Image = await blobToBase64(compressedBlob);
			handleSend(base64Image); // 傳送壓縮後的 Base64 編碼影像
			console.log('Compressed Base64 Encoded Image:', base64Image);
			setHasNewDrawing(false);
		} catch (error) {
			console.error('Error exporting and compressing image:', error);
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

