import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from 'lucide-react'

interface Stroke {
  id: string;
  timestamp: number;
}

interface StrokeListProps {
  strokes: Stroke[];
  onDeleteStroke: (id: string) => void;
}

export function StrokeList({ strokes, onDeleteStroke }: StrokeListProps) {
  return (
    <ScrollArea className="h-[300px] w-[200px] rounded-md border p-4">
      <h3 className="mb-4 text-lg font-semibold">Stroke List</h3>
      {strokes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No strokes yet</p>
      ) : (
        strokes.map((stroke) => (
          <div key={stroke.id} className="flex items-center justify-between mb-2">
            <span className="text-sm">Stroke {stroke.id.slice(0, 4)}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteStroke(stroke.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </ScrollArea>
  )
}

