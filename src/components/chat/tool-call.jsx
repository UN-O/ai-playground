import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";


export function ToolCall({ toolName, args }) {
    if (toolName === 'calculate') {
        return (null);
        // return (
        //     <div className="bg-stone-800 font-mono text-sm p-2 rounded">
        //         <strong>Tool Call:</strong> {toolName}
        //         <br />
        //         <strong>Expression:</strong> {args.expression}
        //     </div>
        // );
    }

    if (toolName === 'answer') {
        return (
            <>
                <p className="font-mono text-xs uppercase text-stone-500 text-right">calculation steps</p>
                <Accordion type="multiple" collapsible className="bg-stone-800 text-secondary font-mono text-sm p-2 rounded-lg mb-2">
                    <div className="space-y-1">
                        {args.steps.map((step, index) => (
                            <AccordionItem value={`item-${index}`}>
                                <div className="grid gap-1" key={index}>
                                    <AccordionTrigger className="flex gap-1">
                                            <div className="font-bold px-2">
                                                step
                                                <br/>
                                                {index + 1}
                                            </div>
                                            <div className="w-full h-full flex px-3 place-items-center">
                                                {step.calculation}
                                            </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="p-2 py-6 text-stone-400">{step.reasoning}</div>
                                    </AccordionContent>
                                </div>
                            </AccordionItem>
                        ))}
                    </div>


                </Accordion>
            </>

        );
    }

    return (
        <div className="bg-stone-800 font-mono text-sm p-2 rounded">
            <strong>Tool Call:</strong> {toolName}
            <br />
            <strong>Arguments:</strong> {JSON.stringify(args, null, 2)}
        </div>
    );
}

export function ToolResult({ toolName, result, isError }) {
    return (
        <div className={`bg-${isError ? 'red' : 'green'}-200 text-sm p-2 rounded`}>
            <strong>Tool Result:</strong> {toolName}
            <br />
            <strong>Result:</strong> {JSON.stringify(result, null, 2)}
            {isError && <div className="text-red-600">An error occurred</div>}
        </div>
    );
}
