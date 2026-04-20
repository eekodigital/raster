---
"@eekodigital/raster": patch
---

`LineChart`: the leftmost visible x-axis label now anchors to `start` and the
rightmost to `end`, so wide labels (e.g. full ISO dates) no longer extend
past the plot area and overlap the chart's container border. Middle labels
stay centered as before.
