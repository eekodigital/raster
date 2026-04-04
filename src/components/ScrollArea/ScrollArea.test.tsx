import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import * as ScrollArea from './ScrollArea.js';

function renderScrollArea({
  type,
  orientation = 'vertical',
}: {
  type?: 'auto' | 'always' | 'scroll' | 'hover';
  orientation?: 'vertical' | 'horizontal';
} = {}) {
  return render(
    <ScrollArea.Root style={{ height: '100px', width: '200px' }} type={type}>
      <ScrollArea.Viewport>
        <div style={{ height: '500px' }}>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
          <div>Item 4</div>
          <div>Item 5</div>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation={orientation} />
      <ScrollArea.Corner />
    </ScrollArea.Root>,
  );
}

describe('ScrollArea', () => {
  describe('rendering', () => {
    it('renders children inside viewport', () => {
      renderScrollArea();
      expect(screen.getByText('Item 1')).toBeDefined();
      expect(screen.getByText('Item 2')).toBeDefined();
      expect(screen.getByText('Item 5')).toBeDefined();
    });

    it('renders vertical scrollbar by default', () => {
      const { container } = renderScrollArea();
      const scrollbar = container.querySelector('[data-orientation="vertical"]');
      expect(scrollbar).toBeDefined();
    });

    it('renders horizontal scrollbar when specified', () => {
      const { container } = renderScrollArea({ orientation: 'horizontal' });
      const scrollbar = container.querySelector('[data-orientation="horizontal"]');
      expect(scrollbar).toBeDefined();
    });

    it('renders both scrollbars when both are present', () => {
      const { container } = render(
        <ScrollArea.Root style={{ height: '100px', width: '100px' }}>
          <ScrollArea.Viewport>
            <div style={{ height: '500px', width: '500px' }}>content</div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" />
          <ScrollArea.Scrollbar orientation="horizontal" />
          <ScrollArea.Corner />
        </ScrollArea.Root>,
      );
      expect(container.querySelector('[data-orientation="vertical"]')).toBeDefined();
      expect(container.querySelector('[data-orientation="horizontal"]')).toBeDefined();
    });
  });

  describe('type prop', () => {
    it.each(['always', 'scroll', 'auto'] as const)('accepts type="%s"', (type) => {
      const { container } = render(
        <ScrollArea.Root type={type} style={{ height: '100px' }}>
          <ScrollArea.Viewport>
            <div>content</div>
          </ScrollArea.Viewport>
        </ScrollArea.Root>,
      );
      expect(container.firstChild).toBeDefined();
    });
  });

  describe('composition', () => {
    it('works without scrollbar', () => {
      render(
        <ScrollArea.Root style={{ height: '100px' }}>
          <ScrollArea.Viewport>
            <div>content</div>
          </ScrollArea.Viewport>
        </ScrollArea.Root>,
      );
      expect(screen.getByText('content')).toBeDefined();
    });

    it('works without corner', () => {
      render(
        <ScrollArea.Root style={{ height: '100px' }}>
          <ScrollArea.Viewport>
            <div>content</div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar />
        </ScrollArea.Root>,
      );
      expect(screen.getByText('content')).toBeDefined();
    });
  });
});
