import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { type Duty } from "@/services/roles.service";

interface DutySelectionListProps {
  allDuties: Duty[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function DutySelectionList({
  allDuties,
  selectedIds,
  onToggle,
}: DutySelectionListProps) {
  const grouped = allDuties.reduce<Record<string, Duty[]>>((acc, d) => {
    const resource = d.privileges[0]?.resource ?? "general";
    const key = resource.charAt(0).toUpperCase() + resource.slice(1);
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(d);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
      {Object.entries(grouped).map(([group, duties]) => (
        <div key={group}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {group}
          </p>
          <div className="space-y-2">
            {duties.map((duty) => (
              <div
                key={duty.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                  selectedIds.has(duty.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
                onClick={() => onToggle(duty.id)}
              >
                <Checkbox
                  checked={selectedIds.has(duty.id)}
                  onCheckedChange={() => onToggle(duty.id)}
                  className="mt-0.5 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{duty.displayName}</p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            size={13}
                            className="text-muted-foreground shrink-0"
                          />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs font-medium mb-1">
                            Included privileges:
                          </p>
                          <ul className="text-xs space-y-0.5">
                            {duty.privileges.map((p) => (
                              <li key={p.id} className="text-muted-foreground">
                                • {p.name}
                              </li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {duty.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {duty.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
