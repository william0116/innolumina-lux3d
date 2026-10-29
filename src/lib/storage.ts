import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import type { IWork, ICreditRecord, IOrder } from '@/data/glassmorphism';
import { MOCK_WORKS, MOCK_CREDIT_RECORDS, MOCK_ORDERS } from '@/data/glassmorphism';

const KEY_CREDIT = 'innolumina_credit_balance';
const KEY_RECORDS = 'innolumina_credit_records';
const KEY_WORKS = 'innolumina_works';
const KEY_ORDERS = 'innolumina_orders';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = scopedStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    scopedStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function getCreditBalance(): number {
  const raw = scopedStorage.getItem(KEY_CREDIT);
  if (raw === null || raw === undefined) {
    safeSet(KEY_CREDIT, 500);
    return 500;
  }
  const num = Number(raw);
  return Number.isFinite(num) ? num : 500;
}

export function setCreditBalance(v: number) {
  safeSet(KEY_CREDIT, v);
}

export function getCreditRecords(): ICreditRecord[] {
  return safeGet<ICreditRecord[]>(KEY_RECORDS, MOCK_CREDIT_RECORDS);
}

export function addCreditRecord(r: ICreditRecord) {
  const list = getCreditRecords();
  safeSet(KEY_RECORDS, [r, ...list]);
}

export function getWorks(): IWork[] {
  return safeGet<IWork[]>(KEY_WORKS, MOCK_WORKS);
}

export function setWorks(list: IWork[]) {
  safeSet(KEY_WORKS, list);
}

export function getWorkById(id: string): IWork | undefined {
  return getWorks().find((w) => w.id === id);
}

export function upsertWork(work: IWork) {
  const list = getWorks();
  const idx = list.findIndex((w) => w.id === work.id);
  if (idx >= 0) list[idx] = work;
  else list.unshift(work);
  setWorks(list);
}

export function getOrders(): IOrder[] {
  return safeGet<IOrder[]>(KEY_ORDERS, MOCK_ORDERS);
}

export function addOrder(order: IOrder) {
  const list = getOrders();
  safeSet(KEY_ORDERS, [order, ...list]);
}
