const schema = {
  type: "object",
  properties: {
    diff: {
      type: "object",
      properties: {
        distance: {
          type: "integer",
          minimum: 1,
        },
        characters: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              count: { type: "integer", minimum: 1 },
              value: { type: "string" },
            },
            required: ["type", "count", "value"],
          },
        },
      },
    },
    payload: {
      type: "object",
      properties: {
        entries: {
          type: "array",
          minItems: 1,
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              store_name: { type: "string" },
              bundle: { type: "integer", minimum: 0 },
              price: { type: "integer", minimum: 0 },
              quantity: { type: "integer", minimum: 0 },
            },
            required: ["id", "store_name", "bundle", "price", "quantity"],
          },
          is_missing_rows: { type: "boolean" },
        },
      },
      required: ["entries"],
    },
  },
  required: ["diff", "payload"],
};

export { schema };
