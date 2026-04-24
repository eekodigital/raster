---
"@eekodigital/raster": patch
---

`Fieldset` now stacks its legend and child fields as a flex column with a consistent gap. Previously the component only reset `border`/`margin`/`padding`, so stacked `TextInputField` / `PasswordToggleField` children inside a `<Fieldset>` rendered flush against each other and consumers had to add their own layout wrapper to get sensible vertical rhythm.

The legend's dedicated `marginBottom` has been removed — gap handles that spacing now.

Visual impact: fieldsets with multiple children now have `var(--spacing-4)` between them (matching what forms already do). Single-child fieldsets are unchanged since there's nothing to space.
