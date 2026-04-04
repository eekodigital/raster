# @eekodigital/raster

Design system by [Eeko Digital](https://eeko.digital).

## Install

```sh
pnpm add @eekodigital/raster
```

## Usage

Import the CSS tokens once at the root of your app, then import components as needed:

```tsx
import "@eekodigital/raster/tokens.css";
import { Button, TextInput } from "@eekodigital/raster";
```

DataTable is a separate export to avoid bundling `@tanstack/react-table` for consumers who don't need it:

```tsx
import { DataTable } from "@eekodigital/raster/data-table";
```

## Theming

Raster uses CSS custom properties for theming. Override semantic tokens after importing `tokens.css`:

```css
@import "@eekodigital/raster/tokens.css";

:root,
[data-theme="light"] {
  --color-interactive: #e63946;
  --color-bg: #f1faee;
}
```

Components reference semantic tokens only — override those to theme your product.

## Development

```sh
pnpm install
pnpm build        # build tokens + components
pnpm test         # run tests
pnpm dev          # watch mode
```

## License

MIT
