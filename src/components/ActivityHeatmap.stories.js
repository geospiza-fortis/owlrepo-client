import ActivityHeatmap from "./ActivityHeatmap.svelte";

export default {
  title: "ActivityHeatmap",
};

export const Default = () => ({
  Component: ActivityHeatmap,
  props: {
    data: [
      { ts: 1588464000, value: 14 },
      { ts: 1588377600, value: 11 },
      { ts: 1588118400, value: 4 },
      { ts: 1587513600, value: 4 },
    ],
  },
});
