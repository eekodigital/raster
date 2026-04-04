import { GeoChart } from "@eekodigital/raster";
// @ts-ignore — world-atlas JSON doesn't match Topology type exactly
import world from "world-atlas/countries-110m.json";

// Renewable energy as % of total energy (IEA / World Bank, approx. 2022)
const sampleData = [
  { id: "352", value: 86, label: "Iceland" },
  { id: "578", value: 73, label: "Norway" },
  { id: "076", value: 47, label: "Brazil" },
  { id: "752", value: 56, label: "Sweden" },
  { id: "554", value: 41, label: "New Zealand" },
  { id: "124", value: 27, label: "Canada" },
  { id: "276", value: 20, label: "Germany" },
  { id: "826", value: 15, label: "United Kingdom" },
  { id: "840", value: 13, label: "United States" },
  { id: "392", value: 11, label: "Japan" },
  { id: "356", value: 24, label: "India" },
  { id: "156", value: 16, label: "China" },
  { id: "250", value: 14, label: "France" },
  { id: "724", value: 22, label: "Spain" },
  { id: "380", value: 19, label: "Italy" },
  { id: "036", value: 17, label: "Australia" },
  { id: "643", value: 4, label: "Russia" },
  { id: "710", value: 11, label: "South Africa" },
  { id: "566", value: 15, label: "Nigeria" },
  { id: "404", value: 72, label: "Kenya" },
  { id: "818", value: 6, label: "Egypt" },
  { id: "032", value: 13, label: "Argentina" },
  { id: "484", value: 9, label: "Mexico" },
  { id: "360", value: 17, label: "Indonesia" },
  { id: "764", value: 19, label: "Thailand" },
  { id: "704", value: 32, label: "Vietnam" },
  { id: "586", value: 34, label: "Pakistan" },
  { id: "050", value: 3, label: "Bangladesh" },
  { id: "170", value: 74, label: "Colombia" },
  { id: "604", value: 52, label: "Peru" },
];

export function GeoChartBasicDemo() {
  return (
    <GeoChart
      topology={world as any}
      data={sampleData}
      colorScale={["var(--color-danger)", "var(--color-warning)", "var(--color-success)"]}
      legendLabel="Renewable energy %"
      formatValue={(v) => `${v}%`}
      aria-label="Renewable energy as a share of total energy consumption by country"
    />
  );
}

export function GeoChartMarkersDemo() {
  return (
    <GeoChart
      topology={world as any}
      colorScale={["var(--color-border)"]}
      markers={[
        { lat: 51.5, lon: -0.1, size: 8, label: "London", color: "var(--color-danger)" },
        { lat: 48.9, lon: 2.3, size: 6, label: "Paris", color: "var(--color-danger)" },
        { lat: 40.7, lon: -74.0, size: 7, label: "New York", color: "var(--color-danger)" },
        { lat: 35.7, lon: 139.7, size: 5, label: "Tokyo", color: "var(--color-danger)" },
      ]}
      aria-label="Office locations"
    />
  );
}
