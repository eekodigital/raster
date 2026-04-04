import { Avatar } from "@eekodigital/raster";

export function AvatarInitialsDemo() {
  return (
    <Avatar.Root>
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function AvatarImageDemo() {
  return (
    <Avatar.Root>
      <Avatar.Image src="https://api.dicebear.com/9.x/personas/svg?seed=Felix" alt="Felix" />
      <Avatar.Fallback>FX</Avatar.Fallback>
    </Avatar.Root>
  );
}

export function AvatarSizesDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Avatar.Root size="sm">
        <Avatar.Fallback>SM</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="md">
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="lg">
        <Avatar.Fallback>LG</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}

export function AvatarSquareDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <Avatar.Root square size="md">
        <Avatar.Fallback>OG</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root square size="lg">
        <Avatar.Fallback>CO</Avatar.Fallback>
      </Avatar.Root>
    </div>
  );
}
