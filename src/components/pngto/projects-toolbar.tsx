import { Search } from "lucide-react";

import type { ProjectSort } from "@/types/project";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProjectsToolbar({
  query,
  sort,
  onQueryChange,
  onSortChange,
}: {
  query: string;
  sort: ProjectSort;
  onQueryChange: (value: string) => void;
  onSortChange: (value: ProjectSort) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-shell-muted"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search projects…"
          className="bg-shell-elevated pl-9"
          aria-label="Search projects"
        />
      </div>
      <Select value={sort} onValueChange={(v) => onSortChange(v as ProjectSort)}>
        <SelectTrigger className="w-full sm:w-44" aria-label="Sort projects">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated">Recently updated</SelectItem>
          <SelectItem value="created">Recently created</SelectItem>
          <SelectItem value="name">Name A–Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
