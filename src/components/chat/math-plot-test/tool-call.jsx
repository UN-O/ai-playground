import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { RenderMarkdown } from "@/utils/rendering"
import { EquaComponent } from "@/components/main/tools/math-plot/equa-component";

export function ToolCall({ toolName, args }) {
    switch (toolName) {
        case 'calculate':
            return (null);
        case 'answer': {
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
                                                <br />
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
        case 'plot': {
            return (
                <>
                    <EquaComponent equation={args.equation}/>
                    {args.steps.map((step, index) => (
                        <div key={index} className="bg-stone-800 font-mono text-sm p-2 rounded text-secondary">
                            <div className="p-2 py-6 text-stone-400">
                                {step.intro}
                            </div>
                            <div className="p-2 py-6 text-stone-400">
                                {step.detail}
                            </div>
                        </div>
                    ))}
                </>
            )
        }
        case 'step_answer': {
            return (null);
        }
        default: {
            return (
                <div className="bg-stone-800 font-mono text-sm p-2 rounded text-secondary">
                    <strong>Tool Call:</strong> {toolName}
                    <br />
                    <strong>Arguments:</strong> {JSON.stringify(args, null, 2)}
                </div>
            );
        }
    }
}

export function ToolResult({ toolName, result, isError }) {
    switch (toolName) {
        case 'step_answer': {
            return (
                <>
                    <p className="font-mono text-xs uppercase text-stone-500 text-right">calculation steps</p>
                    <Accordion type="multiple" collapsible className="bg-stone-800 text-secondary font-mono text-sm p-2 rounded-lg mb-2">
                        <div className="space-y-1">
                            {result.steps.map((step, index) => (
                                <AccordionItem value={`item-${index}`}>
                                    <div className="grid gap-1" key={index}>
                                        <AccordionTrigger className="flex gap-1">

                                            <div className="w-full h-full flex px-3 place-items-center">
                                                {/* {step.concept} */}
                                                <RenderMarkdown>
                                                    {"\\(" + step.latex_formulas + "\\)"}
                                                </RenderMarkdown>
                                            </div>
                                            <div className="font-bold px-2">
                                                ({index + 1})
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="p-2 py-6 text-stone-400">
                                                <RenderMarkdown>
                                                    {step.textual_description}
                                                </RenderMarkdown>
                                            </div>
                                        </AccordionContent>
                                    </div>
                                </AccordionItem>
                            ))}
                        </div>

                    </Accordion>
                    <div className="bg-stone-800 font-mono text-sm p-2 rounded text-secondary">
                        {result.notification}
                    </div>
                </>
            );
        }
        case 'plot': {
            break;
        }
        default: {
            return (
                <div className={`bg-${isError ? 'red' : 'green'}-200 text-sm p-2 rounded`}>
                    <strong>Tool Result:</strong> {toolName}
                    <br />
                    <strong>Result:</strong> {JSON.stringify(result, null, 2)}
                    {isError && <div className="text-red-600">An error occurred</div>}
                </div>
            );
        }
    }
}
