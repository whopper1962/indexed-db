const IDX_DATABASE_VERSION = 1;
const IDX_DATABASE_NAME = "data_caches";

export const Store = {
  VEHICLE_DATA: "vehicleData",
} as const;
export type Store = (typeof Store)[keyof typeof Store];

export class IdxDatabaseService {
  private _database!: IDBDatabase;
  private _transaction!: IDBTransaction;
  private _objectStores: Record<Store, IDBObjectStore> = {} as Record<
    Store,
    IDBObjectStore
  >;

  protected openIdxDatabase(
    initializeTable: (event: IDBVersionChangeEvent) => void,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open(
        IDX_DATABASE_NAME,
        IDX_DATABASE_VERSION,
      );

      request.onerror = (event: Event) => {
        const error = (event.target as HTMLInputElement).value;
        reject(error);
      };

      request.onsuccess = (event: Event) => {
        this._database = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) =>
        initializeTable(event);
    });
  }

  protected closeIdxDatabase(): void {
    if (!this._database) throw new Error("Database does not exit.");
    this._database.close();
  }

  protected getIndex(store: Store, indexName: string): IDBIndex {
    return this._objectStores[store].index(indexName);
  }

  protected putRecord<T>(store: Store, record: T): IDBRequest {
    return this._objectStores[store].put(record);
  }

  protected startTransaction(stores: Store[], type: IDBTransactionMode): void {
    this._transaction = this._database.transaction(stores, type);
  }

  protected commitTransaction(): void {
    if (!this._transaction) throw new Error("Transaction does not exit.");
    this._transaction.commit();
  }

  protected abortTransaction(): void {
    if (!this._transaction) throw new Error("Transaction does not exit.");
    this._transaction.abort();
  }

  protected setObjectStore(store: Store) {
    this._objectStores[store] = this._transaction.objectStore(store);
  }

  protected getObjectStore(store: Store) {
    if (!this._objectStores[store]) throw new Error("Object does not exit.");
    return this._objectStores[store];
  }
}
