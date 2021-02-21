const uploadColumns = [
  {
    title: "Date",
    field: "timestamp",
    formatter: "datetime",
    formatterParams: {
      outputFormat: "YYYY-MM-DD HH:MM",
    },
  },
  {
    title: "Task ID",
    field: "task_id",
    formatter: "link",
    formatterParams: {
      urlField: "task_id",
      urlPrefix: "/listing/",
    },
  },
];

const curationColumns = [
  {
    title: "Date",
    field: "timestamp",
    formatter: "datetime",
    formatterParams: {
      outputFormat: "YYYY-MM-DD HH:MM",
    },
  },
  {
    title: "Task ID",
    field: "task_id",
    formatter: "link",
    formatterParams: {
      urlField: "task_id",
      urlPrefix: "/listing/",
    },
  },
  {
    title: "Screenshot ID",
    field: "screenshot_sha1",
  },
];

export { uploadColumns, curationColumns };
