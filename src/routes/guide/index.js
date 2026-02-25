import moment from "moment";

const CATEGORIES = [
  "10",
  "30",
  "60",
  "70",
  "100",
  "coins",
  "etc",
  "ores",
  "mastery",
];
const ETC_DATA = Object.fromEntries(
  Object.entries({
    "Clean Slate Scroll 20%": {
      category: "clean slate",
      stat: "20%",
    },
    "Clean Slate Scroll 1%": {
      category: "clean slate",
      stat: "1%",
    },
    "Chaos Scroll 60%": {
      category: "chaos scroll",
    },
    "White Scroll": {
      category: "white scroll",
    },
    "Onyx Apple": {
      category: "onyx apple",
    },
    "Zombie's Lost Gold Tooth": {
      category: "gold tooth",
    },
    "Dragon Scale": {
      category: "dragon scale",
    },
    "Piece of Time": {
      category: "piece of time",
    },
    "Eye of Fire": {
      category: "eye of fire",
    },
    Sunburst: {
      category: "sunburst",
    },
    "Spirit of Fantasy Theme Park": {
      category: "spirit of fantasy theme park",
    },
    Heartstopper: {
      category: "heartstopper",
    },
  }).map(([key, value]) => [
    key,
    {
      percent: "etc",
      stat: "",
      ...value,
    },
  ]),
);

const ORES = Object.fromEntries(
  [
    "Power Crystal Ore",
    "DEX Crystal Ore",
    "LUK Crystal Ore",
    "Black Crystal Ore",
    "Dark Crystal Ore",
    "Mithril Ore",
    "Steel Ore",
  ].map((row) => [
    row,
    {
      percent: "ores",
      category: row.toLowerCase().replace("ore", "").trim(),
      stat: "",
    },
  ]),
);

function chunkList(list, size) {
  // split it in half
  if (list.length > size) {
    let mid = Math.floor(list.length / 2);
    return [list.slice(0, mid), list.slice(mid, list.length)];
  } else {
    return [list];
  }
}

function getBackgroundColor(percent, opacity = 1.0) {
  // https://www.schemecolor.com/pastel-calm.php
  // https://www.colorhexa.com/b19cd9
  // https://www.colorhexa.com/cfcfc4
  const colors = [
    `rgba(249, 240, 193, ${opacity})`, // yellow
    `rgba(177, 156, 217, ${opacity})`, // purple
    `rgba(244, 205, 166, ${opacity})`, // orange
    `rgba(207, 207, 196, ${opacity})`, // grey
    `rgba(165, 200, 228, ${opacity})`, // blue
    `rgba(192, 236, 204, ${opacity})`, // green
    // `rgba(242, 221, 192, ${opacity})`, // brown
    `rgba(246, 168, 166, ${opacity})`, // red
  ];
  return colors[CATEGORIES.indexOf(percent) % colors.length];
}

function transform(index, category) {
  let category_data = {
    // normal scrolls
    ...Object.fromEntries(category.map((row) => [row.name, row])),
    // mastery books
    ...Object.fromEntries(
      index
        .filter((row) => row.search_item.includes("Mastery Book"))
        .map((row) => [
          row.search_item,
          {
            percent: "mastery",
            category: row.search_item.split("]")[1].trim().toLowerCase(),
            stat: row.search_item.includes("20") ? "20" : "30",
          },
        ]),
    ),
    // other stuff
    ...ETC_DATA,
    ...ORES,
    ...Object.fromEntries(
      index
        .filter(
          (row) =>
            row.search_item.includes("Prestigious Coin") ||
            row.search_item.includes("Mysterious Coin Pouch"),
        )
        .map((row) => [
          row.search_item,
          {
            percent: "coins",
            category: row.search_item
              .replace(/(\d+)$/g, "")
              .trim()
              .toLowerCase(),
            stat: (row.search_item.match(/(\d+)$/g) || [""])[0],
          },
        ]),
    ),
  };

  let price_data = index
    .filter((row) => row.search_item in category_data)
    .map((row) => ({
      ...category_data[row.search_item],
      ...row,
      days_since_update:
        moment().diff(moment(row.search_item_timestamp), "days") || -1,
    }));

  return price_data;
}

export { CATEGORIES, chunkList, getBackgroundColor, transform };
