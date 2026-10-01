import { MarkdownText } from "@/components/ui/MarkdownText";
import { parseMarkdown } from "@/lib/markdown";
import { readConfig, textConfigSchema } from "@/lib/widgetConfig";
import type { WidgetProps } from "@/types/dashboard";
import { WidgetEmpty } from "./WidgetState";

export function TextWidget({ widget }: WidgetProps) {
  const { markdown } = readConfig(textConfigSchema, widget);

  if (parseMarkdown(markdown).length === 0) return <WidgetEmpty>Add some notes in the widget settings.</WidgetEmpty>;

  return <MarkdownText source={markdown} className="size-full overflow-y-auto text-muted" />;
}
