import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GeoChart } from './GeoChart.js';

// Minimal TopoJSON with one polygon feature
const minimalTopology = {
  type: 'Topology' as const,
  objects: {
    countries: {
      type: 'GeometryCollection' as const,
      geometries: [
        {
          type: 'Polygon' as const,
          id: 'GBR',
          properties: { name: 'United Kingdom' },
          arcs: [[0]],
        },
      ],
    },
  },
  arcs: [
    [
      [-5, 50],
      [2, 50],
      [2, 58],
      [-5, 58],
      [-5, 50],
    ],
  ],
};

describe('GeoChart', () => {
  it('renders an SVG with role="img"', () => {
    render(<GeoChart topology={minimalTopology} aria-label="Map" />);
    expect(screen.getByRole('img', { name: 'Map' })).toBeDefined();
  });

  it('renders region paths', () => {
    const { container } = render(<GeoChart topology={minimalTopology} aria-label="Map" />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('renders region with data and aria-label', () => {
    render(
      <GeoChart
        topology={minimalTopology}
        data={[{ id: 'GBR', value: 92, label: 'United Kingdom' }]}
        aria-label="Compliance map"
      />,
    );
    expect(screen.getByRole('img', { name: 'United Kingdom: 92' })).toBeDefined();
  });

  it('renders a hidden data table', () => {
    render(
      <GeoChart
        topology={minimalTopology}
        data={[{ id: 'GBR', value: 92, label: 'UK' }]}
        aria-label="Map"
      />,
    );
    const table = screen.getByRole('table', { name: 'Map' });
    expect(table.textContent).toContain('UK');
    expect(table.textContent).toContain('92');
  });

  it('renders colour scale legend when data is provided', () => {
    render(
      <GeoChart
        topology={minimalTopology}
        data={[
          { id: 'GBR', value: 10 },
          { id: 'USA', value: 90 },
        ]}
        aria-label="Map"
      />,
    );
    // Legend shows min and max
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('90').length).toBeGreaterThanOrEqual(1);
  });

  it('renders markers', () => {
    render(
      <GeoChart
        topology={minimalTopology}
        markers={[{ lat: 51.5, lon: -0.1, label: 'London' }]}
        aria-label="Map"
      />,
    );
    expect(screen.getByRole('img', { name: 'London' })).toBeDefined();
  });

  it('uses equirectangular projection', () => {
    const { container } = render(
      <GeoChart topology={minimalTopology} projection="equirectangular" aria-label="Map" />,
    );
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });

  it('onRegionClick fires with correct region data', () => {
    const onClick = vi.fn();
    render(
      <GeoChart
        topology={minimalTopology}
        data={[{ id: 'GBR', value: 92, label: 'United Kingdom' }]}
        onRegionClick={onClick}
        aria-label="Clickable map"
      />,
    );
    fireEvent.click(screen.getByRole('img', { name: 'United Kingdom: 92' }));
    expect(onClick).toHaveBeenCalledWith({ id: 'GBR', value: 92, label: 'United Kingdom' }, 'GBR');
  });

  it('filter prop limits rendered regions', () => {
    const multiTopology = {
      type: 'Topology' as const,
      objects: {
        countries: {
          type: 'GeometryCollection' as const,
          geometries: [
            {
              type: 'Polygon' as const,
              id: 'GBR',
              properties: { name: 'United Kingdom' },
              arcs: [[0]],
            },
            {
              type: 'Polygon' as const,
              id: 'FRA',
              properties: { name: 'France' },
              arcs: [[1]],
            },
          ],
        },
      },
      arcs: [
        [
          [-5, 50],
          [2, 50],
          [2, 58],
          [-5, 58],
          [-5, 50],
        ],
        [
          [-5, 42],
          [8, 42],
          [8, 51],
          [-5, 51],
          [-5, 42],
        ],
      ],
    };

    const { container } = render(
      <GeoChart topology={multiTopology} filter={['GBR']} aria-label="Filtered map" />,
    );
    // Only GBR should be rendered
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(1);
  });
});
