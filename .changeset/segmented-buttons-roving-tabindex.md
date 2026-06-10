---
"@eekodigital/raster": patch
---

SegmentedButtons: keep the group keyboard-reachable when no option is selected. With an unset `value`, every option had `tabIndex={-1}`, so the radiogroup was skipped entirely when tabbing. The first option now takes the tab stop until a selection is made, per the WAI-ARIA radio group pattern.
