import { useEffect, useRef } from "react"
import { useTools } from '../_hooks/tools-provider';
import { useMessageStore } from './message-store';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

import { toolsConfig } from './tools-config';



const ToolRenderer = ({ executeConversation }) => {
    const { activeToolId, toolResult, activeResult, setOpenBlock } = useTools();
    const setInput = useMessageStore((state) => state.setInput);
    const scrollAreaRef = useRef(null)

    const scrollToButton = () => {
        scrollAreaRef.current.scrollIntoView(false);
    }

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollToButton();
        }
    }, [activeResult])


    if (!activeToolId) {
        return null;
    }

    const ToolComponent = toolsConfig[activeResult.toolName]?.component;

    if (!ToolComponent) {
        return <div>Unknown tool: {activeResult}</div>;
    }

    // TODO: become tabs
    return (
        <Card className="w-full mx-auto h-full flex flex-col bg-stone-900">
            <CardHeader>
                <div className="flex justify-between items-center w-full">
                    <CardTitle className="text-2xl font-bold text-center"></CardTitle>
                    <div className="flex gap-2">
                        <Button variant="destructive" onClick={()=> setOpenBlock(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden px-3 pl-5">
                <ScrollArea className="h-full w-full">
                    <div ref={scrollAreaRef} className="h-full w-full">
                        <ToolComponent result={activeResult.result} executeConversation={executeConversation}/>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default ToolRenderer;
