---
"@eekodigital/raster": minor
---

Adopt `asChild` across overlay triggers (Radix-style). Deprecates the render-prop child signature previously used on Dialog, AlertDialog, Tooltip, and DropdownMenu triggers.

**Breaking:** render-prop form is removed from `Dialog.Trigger`, `Dialog.Close`, `AlertDialog.Trigger`, `Tooltip.Trigger`, and `DropdownMenu.Trigger`. Use `asChild` instead.

**New:** `asChild` prop added to:

- `Popover.Trigger`, `Popover.Close` (fixes nested-button bug #20)
- `DropdownMenu.Trigger`
- `Dialog.Trigger`, `Dialog.Close`
- `AlertDialog.Trigger`, `AlertDialog.Action`, `AlertDialog.Cancel`
- `Tooltip.Trigger`

### Migration

```tsx
// Before
<Dialog.Trigger>
  {(props) => <Button {...props}>Open</Button>}
</Dialog.Trigger>

// After
<Dialog.Trigger asChild>
  <Button>Open</Button>
</Dialog.Trigger>
```

Popover consumers who were passing a `<button>` as `children` — previously producing an invalid nested-button DOM — should now pass `asChild`:

```tsx
// Before (rendered <button><button>Open</button></button>)
<Popover.Trigger>
  <button className="my-btn">Open</button>
</Popover.Trigger>

// After
<Popover.Trigger asChild>
  <button className="my-btn">Open</button>
</Popover.Trigger>
```

### Scope

`asChild` is intentionally limited to parts where the consumer owns the interactive element (Trigger / Close / action buttons). Design-owning parts — Content, Item, Label, Arrow, Overlay, Title, Description, Header, and the default Collapsible/Tabs/Accordion triggers — do **not** accept `asChild` and will continue to render raster's built-in design.
