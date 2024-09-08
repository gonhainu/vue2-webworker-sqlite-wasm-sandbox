<template>
  <div>
    <h1>WASM SQLite in WebWorker with Persistence</h1>
    <button @click="initializeDb">データベースを初期化</button>
    <button @click="runQuery">クエリを実行</button>
    <button @click="savedDatabase">データベースを保存</button>
    <div v-if="error" style="color: red;">{{ error }}</div>
    <div v-if="result">
      <h3>結果:</h3>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      worker: null,
      result: null,
      error: null
    }
  },
  methods: {
    initializeDb() {
      const savedDatabase = localStorage.getItem('sqliteDatabase');
      const database = savedDatabase ? JSON.parse(savedDatabase) : null;

      this.worker.postMessage({
        action: 'init',
        database: database
      });
    },
    runQuery() {
      const query = `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER);
                     INSERT INTO users (name, age) VALUES ('Alice', 30);
                     INSERT INTO users (name, age) VALUES ('Bob', 25);
                     SELECT * FROM users;`;
      this.worker.postMessage({ action: 'exec', query: query });
    },
    savedDatabase() {
      this.worker.postMessage({ action: 'export' });
    }
  },
  mounted() {
    this.worker = new Worker(new URL('../workers/sqliteWorker.js', import.meta.url)), { type: 'module' };

    this.worker.onmessage = (event) => {
      const { status, result, error, database } = event.data;
      if (status === 'initiated') {
        console.log('データベースを初期化しました');
      } else if (status === 'success') {
        this.result = result;
        this.error = null;
      } else if (status === 'exported') {
        localStorage.setItem('sqliteDatabase', JSON.stringify(database));
        alert('データベースを保存しました');
      } else if (status === 'error') {
        this.error = error;
        this.result = null;
      }
    };

    this.worker.onerror = (error) => {
      console.error('WebWorker エラー:', error.meesage);
      this.error = 'WebWorker エラー';
    }
  },
  beforeDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
}
</script>