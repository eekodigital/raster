import { Accordion } from "@eekodigital/raster";

export function AccordionSingleDemo() {
  return (
    <Accordion.Root type="single" collapsible style={{ width: "100%", maxWidth: "36rem" }}>
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>What is a WCAG criterion?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <p
            style={{
              margin: "0",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle)",
            }}
          >
            A testable statement in the Web Content Accessibility Guidelines that describes a
            specific accessibility requirement.
          </p>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>
          <Accordion.Trigger>What conformance levels exist?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <p
            style={{
              margin: "0",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle)",
            }}
          >
            WCAG defines three conformance levels: A (minimum), AA (standard), and AAA (enhanced).
            Most organisations target AA.
          </p>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="c">
        <Accordion.Header>
          <Accordion.Trigger>How is an audit scored?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <p
            style={{
              margin: "0",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle)",
            }}
          >
            Each criterion is evaluated as pass, fail, not applicable, or not tested against the
            selected standard.
          </p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

export function AccordionMultipleDemo() {
  return (
    <Accordion.Root type="multiple" style={{ width: "100%", maxWidth: "36rem" }}>
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>Section one</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <p
            style={{
              margin: "0",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle)",
            }}
          >
            Content for section one.
          </p>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>
          <Accordion.Trigger>Section two</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <p
            style={{
              margin: "0",
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle)",
            }}
          >
            Content for section two.
          </p>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
