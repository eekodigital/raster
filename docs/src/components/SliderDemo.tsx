import { useState } from "react";
import { Slider } from "@eekodigital/raster";

export function SliderBasicDemo() {
  const [value, setValue] = useState([50]);
  return (
    <div style={{ width: "16rem" }}>
      <Slider.Root value={value} onValueChange={setValue} aria-label="Volume">
        <Slider.Track />
        <Slider.Thumb aria-label="Volume" />
      </Slider.Root>
    </div>
  );
}

export function SliderRangeDemo() {
  const [value, setValue] = useState([20, 80]);
  return (
    <div style={{ width: "16rem" }}>
      <Slider.Root value={value} onValueChange={setValue} aria-label="Price range">
        <Slider.Track />
        <Slider.Thumb aria-label="Minimum price" />
        <Slider.Thumb aria-label="Maximum price" />
      </Slider.Root>
    </div>
  );
}

export function SliderDisabledDemo() {
  return (
    <div style={{ width: "16rem" }}>
      <Slider.Root value={[40]} disabled aria-label="Volume">
        <Slider.Track />
        <Slider.Thumb aria-label="Volume" />
      </Slider.Root>
    </div>
  );
}

export function SliderStepDemo() {
  const [value, setValue] = useState([0]);
  return (
    <div style={{ width: "16rem" }}>
      <Slider.Root
        value={value}
        onValueChange={setValue}
        min={0}
        max={100}
        step={10}
        aria-label="Steps"
      >
        <Slider.Track />
        <Slider.Thumb aria-label="Steps" />
      </Slider.Root>
    </div>
  );
}
