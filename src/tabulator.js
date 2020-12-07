import numeral from "numeral";

function formatPrice(value) {
  // http://numeraljs.com/
  if (value < 1e6) {
    return numeral(value).format("0a");
  } else {
    return numeral(value).format("0.0a");
  }
}

function shortFormatter(cell) {
  return formatPrice(cell.getValue());
}

export { formatPrice, shortFormatter };
