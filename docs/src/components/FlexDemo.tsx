import { Button, Flex, Tag } from "@eekodigital/raster";

export function FlexRowDemo() {
  return (
    <Flex gap="2" wrap>
      <Tag>Design</Tag>
      <Tag variant="info">Accessibility</Tag>
      <Tag variant="success">Components</Tag>
    </Flex>
  );
}

export function FlexJustifyDemo() {
  return (
    <Flex justify="between" style={{ width: "100%" }}>
      <Button variant="secondary">Cancel</Button>
      <Button>Save</Button>
    </Flex>
  );
}

export function FlexNoWrapDemo() {
  return (
    <Flex gap="3">
      <Tag>One</Tag>
      <Tag>Two</Tag>
      <Tag>Three</Tag>
      <Tag>Four</Tag>
      <Tag>Five</Tag>
    </Flex>
  );
}

export function FlexColumnDemo() {
  return (
    <Flex direction="column" gap="4" style={{ width: "100%" }}>
      <Tag>Item one</Tag>
      <Tag>Item two</Tag>
      <Tag>Item three</Tag>
    </Flex>
  );
}

export function FlexColumnGapDemo() {
  return (
    <Flex direction="column" gap="8" style={{ width: "100%" }}>
      <Tag>Wider gap</Tag>
      <Tag>Between items</Tag>
    </Flex>
  );
}

export function FlexColumnAlignDemo() {
  return (
    <Flex direction="column" align="center" gap="3" style={{ width: "100%" }}>
      <Button>Short</Button>
      <Button>A longer button label</Button>
    </Flex>
  );
}
