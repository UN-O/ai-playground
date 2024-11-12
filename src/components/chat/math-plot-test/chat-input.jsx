import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react"

export default function ChatInput({ input, setInput, handleSubmit }) {
    return (
        <div className="flex justify-between items-center w-full gap-2">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleSubmit();
                    }
                }}
            />
            <Button onClick={handleSubmit} >
                <Send className="w-4 h-4" />
            </Button>
        </div>
    );
}