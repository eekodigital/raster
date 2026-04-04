import { Progress } from "@eekodigital/raster";

export function ProgressBasicDemo() {
  return <Progress value={60} label="Upload progress" />;
}

export function ProgressLowDemo() {
  return <Progress value={15} label="Loading" />;
}

export function ProgressCompleteDemo() {
  return <Progress value={100} label="Complete" />;
}

export function ProgressIndeterminateDemo() {
  return <Progress value={null} label="Loading" />;
}
