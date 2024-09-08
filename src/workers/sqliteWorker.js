import initSqlJs from "sql.js/dist/sql-wasm.js";

let db = null;

onmessage = async function (event) {
  const { action, query, params, database } = event.data;
  if (action === "init") {
    const SQL = await initSqlJs({
      locateFile: () =>
        `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/sql-wasm.wasm`,
    });
    if (database) {
      const uinit8Aarray = new Uint8Array(database);
      db = new SQL.Database(uinit8Aarray);
    } else {
      db = new SQL.Database();
    }
    this.postMessage({ status: "initialized" });
  }

  if (action === "exec") {
    try {
      const result = db.exec(query, params);
      postMessage({ status: "success", result });
    } catch (error) {
      postMessage({ status: "error", error: error.message });
    }
  }

  if (action === "export") {
    try {
      const binaryArray = db.export();
      postMessage({ status: "exported", database: binaryArray });
    } catch (error) {
      postMessage({ status: "error", error: error.message });
    }
  }
};
