import React, { forwardRef } from 'react'

interface Point {
  x: number
  y: number
  pressure: number
}

interface Stroke {
  id: string
  points: Point[]
  timestamp: number
}

interface SVGCanvasProps {
  strokes: Stroke[]
  currentStroke: Point[]
  onPointerDown: (event: React.PointerEvent<SVGSVGElement>) => void
  onPointerMove: (event: React.PointerEvent<SVGSVGElement>) => void
  onPointerUp: (event: React.PointerEvent<SVGSVGElement>) => void
  eraseMode: boolean
}

export const SVGCanvas = forwardRef<SVGSVGElement, SVGCanvasProps>(
  ({ strokes, currentStroke, onPointerDown, onPointerMove, onPointerUp, eraseMode }, ref) => {
    const getPathFromStroke = (points: Point[]) => {
      const d = points.reduce(
        (acc, point, i, arr) => {
          if (i === 0) return `M ${point.x},${point.y}`
          const xc = (point.x + arr[i - 1].x) / 2
          const yc = (point.y + arr[i - 1].y) / 2
          return `${acc} Q ${arr[i - 1].x},${arr[i - 1].y} ${xc},${yc}`
        },
        ''
      )
      return d
    }

    return (
      <svg
        ref={ref}
        className="w-full h-full aspect-video bg-stone-100 touch-none rounded-md"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ touchAction: 'none' }}
      >
        {strokes.map((stroke) => (
          <path
            key={stroke.id}
            d={getPathFromStroke(stroke.points)}
            fill="none"
            stroke="black"
            strokeWidth={stroke.points[0].pressure * 8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        <path
          d={getPathFromStroke(currentStroke)}
          fill="none"
          stroke="black"
          strokeWidth={currentStroke[0]?.pressure * 8 || 4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
)

SVGCanvas.displayName = 'SVGCanvas'

