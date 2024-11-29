import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { RenderMarkdown } from "@/utils/rendering"
import EquaComponent from "./tool-call/equa-component"

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
                                <AccordionItem key={index} value={`item-${index}`}>
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
        default: {
            return (
                <div className="bg-stone-800 font-mono text-sm p-2 rounded text-secondary max-w-md">
                    <strong>Tool Call:</strong> {toolName}
                    <br />
                    <strong>Arguments:</strong> {JSON.stringify(args, null, 2)}
                </div>
            );
        }
    }
}

export function ToolResult({ toolName, result, isError, toolResultRender }) {

    if (toolResultRender?.length > 0) {
        console.log("i get here");
        const Component = toolResultRender.find(tool => tool.toolName === toolName).component;
        return <Component result={result} />;
    }

    switch (toolName) {

        // case 'step_answer': {
        //     return (
        //         <div className="w-full">
        //             <p className="font-mono text-xs uppercase text-stone-500 text-right">calculation steps</p>
        //             <Accordion type="multiple" collapsible className="bg-stone-800 text-secondary font-mono text-sm p-2 rounded-lg mb-2 w-full">
        //                 <div className="space-y-1 w-full">
        //                     {result.steps.map((step, index) => (
        //                         <AccordionItem value={`item-${index}`} className="w-full">
        //                             <div className="grid gap-1 w-full" key={index}>
        //                                 <AccordionTrigger className="w-full">
        //                                     <div className="w-full max-w-[100%] flex justify-between gap-1">
        //                                         <div className="w-full h-full sm:max-w-[17rem] flex px-3 place-content-center sm:place-content-start  overflow-x-auto snap-x scroll-ml-6">
        //                                             {/* {step.concept} */}
        //                                             <div className="w-fit">
        //                                                 <RenderMarkdown>
        //                                                     {"\\[" + step.latex_formulas + "\\]"}
        //                                                 </RenderMarkdown>
        //                                             </div>

        //                                         </div>
        //                                         <div className="font-bold px-2 w-10 place-content-center">
        //                                             ({index + 1})
        //                                         </div>
        //                                     </div>
        //                                 </AccordionTrigger>
        //                                 <AccordionContent>
        //                                     <div className="p-2 py-6 text-stone-400">
        //                                         <RenderMarkdown>
        //                                             {step.textual_description}
        //                                         </RenderMarkdown>
        //                                     </div>
        //                                 </AccordionContent>
        //                             </div>
        //                         </AccordionItem>
        //                     ))}
        //                 </div>

        //             </Accordion>
        //             <div className="bg-stone-800 font-mono text-sm p-2 rounded text-secondary">
        //                 <RenderMarkdown>
        //                     {result.notification}
        //                 </RenderMarkdown>
        //             </div>
        //         </div>
        //     );
        // }

        default: {
            return (
                <div className={`bg-${isError ? 'red' : 'green'}-200 text-sm p-2 rounded max-w-md`}>
                    <strong>Tool Result:</strong> {toolName}
                    <br />
                    <strong>Result:</strong> {JSON.stringify(result, null, 2)}
                    {isError && <div className="text-red-600">An error occurred</div>}
                </div>
            );
        }
    }
}
