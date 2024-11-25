import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { RenderMarkdown } from "@/utils/rendering"

export default function StepAnswer({ result }) {
    return (
        <div className="w-full">
            <p className="font-mono text-xs uppercase text-stone-500 text-right">calculation steps</p>
            <Accordion type="multiple" collapsible className="bg-stone-800 text-secondary font-mono text-sm p-2 rounded-lg mb-2 w-full">
                <div className="space-y-1 w-full">
                    {result.steps.map((step, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="w-full">
                            <div className="grid gap-1 w-full" key={index}>
                                <AccordionTrigger className="w-full">
                                    <div className="w-full max-w-[100%] flex justify-between gap-1">
                                        <div className="w-full h-full sm:max-w-[17rem] flex px-3 place-content-center sm:place-content-start  overflow-x-auto snap-x scroll-ml-6">
                                            {/* {step.concept} */}
                                            <div className="w-fit">
                                                <RenderMarkdown>
                                                    {"\\[" + step.latex_formulas + "\\]"}
                                                </RenderMarkdown>
                                            </div>

                                        </div>
                                        <div className="font-bold px-2 w-10 place-content-center">
                                            ({index + 1})
                                        </div>
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
                <RenderMarkdown>
                    {result.notification}
                </RenderMarkdown>
            </div>
        </div>
    )
}