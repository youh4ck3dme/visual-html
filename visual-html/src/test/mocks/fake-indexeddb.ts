import { vi } from "vitest";

import { PROJECTS_IDB_NAME } from "@/lib/projects-indexeddb";

type StoreData = Map<IDBValidKey, unknown>;

class FakeEventTarget<T> {
  result: T | undefined;
  error: DOMException | null = null;
  onsuccess: ((ev: Event) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;

  _dispatchSuccess(result?: T) {
    this.result = result as T;
    this.onsuccess?.({ target: this } as unknown as Event);
  }

  _dispatchError(message: string) {
    this.error = new DOMException(message, message);
    this.onerror?.({ target: this } as unknown as Event);
  }
}

class FakeIDBObjectStore {
  constructor(
    private data: StoreData,
    private tx: FakeIDBTransaction,
  ) {}

  get(key: IDBValidKey) {
    const req = new FakeEventTarget<unknown>();
    queueMicrotask(() => {
      req._dispatchSuccess(this.data.get(key));
      this.tx._complete();
    });
    return req as unknown as IDBRequest;
  }

  put(value: unknown, key?: IDBValidKey) {
    const req = new FakeEventTarget<IDBValidKey>();
    const recordKey = (key ?? value) as IDBValidKey;
    queueMicrotask(() => {
      if (this.tx.shouldFail) {
        req._dispatchError("IndexedDB write failed");
        this.tx._fail();
        return;
      }
      this.data.set(recordKey, value);
      req._dispatchSuccess(recordKey);
      this.tx._complete();
    });
    return req as unknown as IDBRequest;
  }

  clear() {
    const req = new FakeEventTarget<undefined>();
    queueMicrotask(() => {
      this.data.clear();
      req._dispatchSuccess(undefined);
      this.tx._complete();
    });
    return req as unknown as IDBRequest;
  }
}

class FakeIDBTransaction {
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;
  error: DOMException | null = null;
  private completed = false;

  constructor(
    private db: FakeIDBDatabase,
    private storeName: string,
    public shouldFail = false,
  ) {}

  objectStore(_name: string) {
    return this.db.getStore(this.storeName, this) as unknown as IDBObjectStore;
  }

  _complete() {
    if (this.completed) return;
    this.completed = true;
    queueMicrotask(() => this.oncomplete?.());
  }

  _fail() {
    if (this.completed) return;
    this.completed = true;
    this.error = new DOMException("Transaction failed", "TransactionFailed");
    queueMicrotask(() => this.onerror?.());
  }
}

class FakeIDBDatabase {
  objectStoreNames = {
    contains: (name: string) => this.stores.has(name),
  } as DOMStringList;

  private stores = new Map<string, StoreData>();

  constructor(public name: string) {}

  getStore(name: string, tx: FakeIDBTransaction) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
    return new FakeIDBObjectStore(this.stores.get(name)!, tx);
  }

  createObjectStore(name: string) {
    this.stores.set(name, new Map());
    return new FakeIDBObjectStore(this.stores.get(name)!, {
      _complete: () => {},
      _fail: () => {},
    } as FakeIDBTransaction);
  }

  close() {}

  transaction(storeNames: string | string[], _mode: IDBTransactionMode = "readonly") {
    const name = Array.isArray(storeNames) ? storeNames[0] : storeNames;
    const shouldFail =
      Boolean(globalThis.__PNGTO_IDB_WRITE_FAIL__) && this.name === PROJECTS_IDB_NAME;
    const tx = new FakeIDBTransaction(this, name, shouldFail);
    return tx as unknown as IDBTransaction;
  }
}

const databases = new Map<string, FakeIDBDatabase>();

declare global {
  var __PNGTO_IDB_WRITE_FAIL__: boolean | undefined;
}

export function resetFakeIndexedDb() {
  databases.clear();
  globalThis.__PNGTO_IDB_WRITE_FAIL__ = false;
}

export function setFakeIndexedDbWriteFailure(fail: boolean) {
  globalThis.__PNGTO_IDB_WRITE_FAIL__ = fail;
}

export function installFakeIndexedDb() {
  const fake = {
    open(name: string, version = 1) {
      const req = new FakeEventTarget<IDBDatabase>() as FakeEventTarget<IDBDatabase> & {
        onupgradeneeded: ((ev: IDBVersionChangeEvent) => void) | null;
      };

      queueMicrotask(() => {
        if (globalThis.__PNGTO_IDB_WRITE_FAIL__ && name === PROJECTS_IDB_NAME) {
          req._dispatchError("IndexedDB blocked");
          return;
        }

        let db = databases.get(name);
        const created = !db;
        if (!db) {
          db = new FakeIDBDatabase(name);
          databases.set(name, db);
        }

        req.result = db as unknown as IDBDatabase;

        if (created || version > 1) {
          const event = {
            target: req,
            oldVersion: created ? 0 : 1,
            newVersion: version,
          } as unknown as IDBVersionChangeEvent;
          req.onupgradeneeded?.(event);
        }

        req._dispatchSuccess(db as unknown as IDBDatabase);
      });

      return req as unknown as IDBOpenDBRequest;
    },
    deleteDatabase(name: string) {
      const req = new FakeEventTarget<undefined>();
      queueMicrotask(() => {
        databases.delete(name);
        req._dispatchSuccess(undefined);
      });
      return req as unknown as IDBOpenDBRequest;
    },
  };

  vi.stubGlobal("indexedDB", fake);
}
