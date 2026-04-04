import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as Avatar from './Avatar.js';

// Mock the global Image constructor so we can control onload/onerror
function mockImageLoad() {
  let onload: (() => void) | null = null;
  let onerror: (() => void) | null = null;
  const OrigImage = globalThis.Image;
  globalThis.Image = class MockImage {
    src = '';
    set onload(fn: (() => void) | null) {
      onload = fn;
    }
    get onload() {
      return onload;
    }
    set onerror(fn: (() => void) | null) {
      onerror = fn;
    }
    get onerror() {
      return onerror;
    }
  } as unknown as typeof Image;
  return {
    triggerLoad: () =>
      act(() => {
        onload?.();
      }),
    triggerError: () =>
      act(() => {
        onerror?.();
      }),
    restore: () => {
      globalThis.Image = OrigImage;
    },
  };
}

describe('Avatar', () => {
  it('shows fallback initials when no image is provided', async () => {
    render(
      <Avatar.Root>
        <Avatar.Fallback delayMs={0}>JD</Avatar.Fallback>
      </Avatar.Root>,
    );
    await waitFor(() => expect(screen.getByText('JD')).toBeDefined());
  });

  it('shows image after it loads and hides fallback', async () => {
    const { triggerLoad } = mockImageLoad();
    render(
      <Avatar.Root>
        <Avatar.Image src="https://example.com/avatar.jpg" alt="Jane Doe" />
        <Avatar.Fallback delayMs={0}>JD</Avatar.Fallback>
      </Avatar.Root>,
    );
    // Before load: fallback visible, image not rendered
    expect(screen.getByText('JD')).toBeDefined();
    expect(screen.queryByAltText('Jane Doe')).toBeNull();

    // Trigger load
    await triggerLoad();

    // After load: image visible, fallback gone
    expect(screen.getByAltText('Jane Doe')).toBeDefined();
    expect(screen.queryByText('JD')).toBeNull();
  });

  it('shows fallback when image fails to load', async () => {
    const { triggerError } = mockImageLoad();
    render(
      <Avatar.Root>
        <Avatar.Image src="https://example.com/broken.jpg" alt="Jane Doe" />
        <Avatar.Fallback delayMs={0}>JD</Avatar.Fallback>
      </Avatar.Root>,
    );

    await triggerError();

    expect(screen.queryByAltText('Jane Doe')).toBeNull();
    expect(screen.getByText('JD')).toBeDefined();
  });

  it('shows fallback after delayMs elapses', async () => {
    vi.useFakeTimers();
    render(
      <Avatar.Root>
        <Avatar.Fallback delayMs={600}>AB</Avatar.Fallback>
      </Avatar.Root>,
    );
    expect(screen.queryByText('AB')).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText('AB')).toBeDefined();
    vi.useRealTimers();
  });

  it('does not render fallback when delayMs has not elapsed and image is loading', () => {
    mockImageLoad();
    render(
      <Avatar.Root>
        <Avatar.Image src="https://example.com/avatar.jpg" alt="Jane Doe" />
        <Avatar.Fallback delayMs={600}>JD</Avatar.Fallback>
      </Avatar.Root>,
    );
    // Neither visible while loading and delay hasn't elapsed
    expect(screen.queryByAltText('Jane Doe')).toBeNull();
    expect(screen.queryByText('JD')).toBeNull();
  });
});
