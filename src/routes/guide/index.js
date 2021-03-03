import moment from "moment";
import { groupBy } from "lodash";

const CATEGORIES = ["10", "30", "60", "70", "100", "etc", "mastery"];
const ETC_DATA = {
  "Clean Slate Scroll 20%": {
    percent: "etc",
    category: "clean slate",
    stat: "20%",
  },
  "Clean Slate Scroll 1%": {
    percent: "etc",
    category: "clean slate",
    stat: "1%",
  },
  "Chaos Scroll 60%": {
    percent: "etc",
    category: "chaos scroll",
    stat: "",
  },
  "White Scroll": {
    percent: "etc",
    category: "white scroll",
    stat: "",
  },
  "Onyx Apple": {
    percent: "etc",
    category: "onyx apple",
    stat: "",
  },
  "Zombie's Lost Gold Tooth": {
    percent: "etc",
    category: "gold tooth",
    stat: "",
  },
  "Dragon Scale": {
    percent: "etc",
    category: "dragon scale",
    stat: "",
  },
  "Piece of Time": {
    percent: "etc",
    category: "piece of time",
    stat: "",
  },
};

async function getData(route) {
  let resp = await fetch(route);
  let data = await resp.json();
  return data;
}

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
  const colors = [
    `rgba(165, 200, 228, ${opacity})`,
    `rgba(192, 236, 204, ${opacity})`,
    `rgba(242, 221, 192, ${opacity})`,
    `rgba(249, 240, 193, ${opacity})`,
    `rgba(244, 205, 166, ${opacity})`,
    `rgba(246, 168, 166, ${opacity})`,
  ];
  return colors[CATEGORIES.indexOf(percent) % colors.length];
}

function transform(index, category) {
  // only keep scrolls that are categoriezed and exist in the database

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
        ])
    ),
    // other stuff
    ...ETC_DATA,
  };

  let price_data = index
    .filter((row) => row.search_item in category_data)
    .map((row) => ({
      ...category_data[row.search_item],
      ...row,
      days_since_update:
        moment().diff(moment(row.search_item_timestamp), "days") || -1,
    }));

  return groupBy(price_data, (v) => v.percent);
}

export { CATEGORIES, getData, chunkList, getBackgroundColor, transform };
