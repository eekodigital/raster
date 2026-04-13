import { Tooltip, Popover, DropdownMenu, Button } from "@eekodigital/raster";

export function TooltipDemo() {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button variant="secondary">Hover me</Button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content>Saves the current draft</Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function PopoverDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="secondary">Filters</Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content>
          <p
            style={{
              margin: "0 0 0.75rem",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            Filter by status
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle)",
            }}
          >
            Filter controls go here.
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function DropdownMenuDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">Actions</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Item>Edit</DropdownMenu.Item>
          <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item>Delete</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function DropdownMenuSectionsDemo() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary">More options</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <DropdownMenu.Label>Project</DropdownMenu.Label>
          <DropdownMenu.Item>Settings</DropdownMenu.Item>
          <DropdownMenu.Item>Archive</DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Label>Danger zone</DropdownMenu.Label>
          <DropdownMenu.Item>Delete project</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
