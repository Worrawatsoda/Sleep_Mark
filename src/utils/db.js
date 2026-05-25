const DB_NAME = 'sleepmark-db'
const DB_VERSION = 1
const STORE = 'readings'

let _db = null

function openDB() {
  return new Promise((resolve, reject) => {
    if (_db) return resolve(_db)
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
        store.createIndex('timestamp', 'timestamp')
      }
    }
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db) }
    req.onerror = (e) => reject(e.target.error)
  })
}

export async function saveReading(data) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({ ...data, timestamp: Date.now() })
    tx.oncomplete = resolve
    tx.onerror = (e) => reject(e.target.error)
  })
}

export async function getLastReading() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).index('timestamp').openCursor(null, 'prev')
    req.onsuccess = (e) => resolve(e.target.result?.value ?? null)
    req.onerror = (e) => reject(e.target.error)
  })
}

// Keep only the last N readings
export async function pruneReadings(maxCount = 200) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const countReq = store.count()
    countReq.onsuccess = () => {
      const excess = countReq.result - maxCount
      if (excess <= 0) return resolve()
      const curReq = store.index('timestamp').openCursor()
      let deleted = 0
      curReq.onsuccess = (e) => {
        const cursor = e.target.result
        if (!cursor || deleted >= excess) return
        cursor.delete()
        deleted++
        cursor.continue()
      }
    }
    tx.oncomplete = resolve
    tx.onerror = (e) => reject(e.target.error)
  })
}
