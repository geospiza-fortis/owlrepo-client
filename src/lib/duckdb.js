let db = null;
let initPromise = null;

/**
 * Lazy singleton — only initializes DuckDB-Wasm when first called.
 * Uses dynamic import so the ~150KB DuckDB JS bundle isn't in the initial chunk,
 * allowing the page spinner to render while DuckDB downloads.
 */
export async function getDB() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const duckdb = await import("@duckdb/duckdb-wasm");
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

    // Workers must be same-origin. Create a blob worker that imports the CDN script.
    const workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      }),
    );
    const worker = new Worker(workerUrl);
    const logger = new duckdb.ConsoleLogger();
    db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    URL.revokeObjectURL(workerUrl);
    return db;
  })();

  return initPromise;
}

/**
 * Fetch item index and listing data from existing API endpoints,
 * register as tables in DuckDB.
 */
export async function loadData(conn) {
  const [indexResp, listingResp] = await Promise.all([
    fetch("/api/v2/query/search_item_index"),
    fetch("/api/v2/query/search_item_listing"),
  ]);

  const indexData = await indexResp.json();
  const listingData = await listingResp.json();

  // Register JSON data as tables
  await db.registerFileText("item_index.json", JSON.stringify(indexData));
  await db.registerFileText("item_listing.json", JSON.stringify(listingData));

  await conn.query(`
    CREATE OR REPLACE TABLE item_index AS
    SELECT * FROM read_json_auto('item_index.json')
  `);

  await conn.query(`
    CREATE OR REPLACE TABLE item_listing AS
    SELECT * FROM read_json_auto('item_listing.json')
  `);

  // Convenience views (short aliases)
  await conn.query(
    `CREATE OR REPLACE VIEW items AS SELECT * FROM item_index`,
  );
  await conn.query(
    `CREATE OR REPLACE VIEW listing AS SELECT * FROM item_listing`,
  );
}

/**
 * Returns schema info: { tableName: [{name, type}] }
 */
export async function getSchema(conn) {
  const schema = {};
  const tables = await conn.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'`,
  );
  const tableNames = tables.toArray().map((r) => r.table_name);

  for (const table of tableNames) {
    const desc = await conn.query(`DESCRIBE "${table}"`);
    schema[table] = desc.toArray().map((r) => ({
      name: r.column_name,
      type: r.column_type,
    }));
  }
  return schema;
}

/**
 * Execute a SQL query and return {columns, rows} for display.
 */
export async function executeQuery(conn, sql) {
  const result = await conn.query(sql);
  const columns = result.schema.fields.map((f) => f.name);
  const rows = result.toArray().map((row) => {
    // Convert Arrow proxy row to plain array of values
    return columns.map((col) => {
      const val = row[col];
      // Handle BigInt values that can't be JSON serialized
      if (typeof val === "bigint") return Number(val);
      return val;
    });
  });
  return { columns, rows };
}
