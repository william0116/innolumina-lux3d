import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import type { IUser, IOrderDetail, ISquareWork, IEarningRecord, IRechargeRecord, IExtendedCreditRecord } from '@/data/types';
import type { IWork } from '@/data/glassmorphism';

// ===== Storage Keys =====
const KEY_USER = 'innolumina_user';
const KEY_POINT_RECORDS = 'innolumina_point_records';
const KEY_ORDERS = 'innolumina_orders_detail';
const KEY_WORKS = 'innolumina_works';
const KEY_SQUARE_WORKS = 'innolumina_square_works';
const KEY_EARNINGS = 'innolumina_earnings';
const KEY_RECHARGE_RECORDS = 'innolumina_recharge_records';
const KEY_INIT_FLAG = 'innolumina_initialized';

// ===== Utils =====
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

function genId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function genOrderNo(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `IL${ymd}${rand}`;
}

function genTrackingNo(): string {
  const rand = Math.floor(Math.random() * 900000000000 + 100000000000);
  return `SF${rand}`;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

// ===== User =====
export function getUser(): IUser | null {
  const u = safeGet<IUser | null>(KEY_USER, null);
  if (!u) return null;
  // 检查 token 过期
  if (u.expireAt && u.expireAt < Date.now()) {
    safeSet(KEY_USER, null);
    return null;
  }
  return u;
}

export function setUser(user: IUser | null) {
  safeSet(KEY_USER, user);
}

export function updateUserPoints(points: number) {
  const u = getUser();
  if (!u) return;
  u.points = points;
  setUser(u);
}

// ===== Point Records =====
export function getPointRecords(): IExtendedCreditRecord[] {
  return safeGet<IExtendedCreditRecord[]>(KEY_POINT_RECORDS, []);
}

export function addPointRecord(r: Omit<IExtendedCreditRecord, 'id'>) {
  const list = getPointRecords();
  const record: IExtendedCreditRecord = {
    ...r,
    id: genId('pr_'),
  };
  safeSet(KEY_POINT_RECORDS, [record, ...list]);
  return record;
}

// ===== Works =====
export function getWorks(): IWork[] {
  return safeGet<IWork[]>(KEY_WORKS, []);
}

export function setWorks(list: IWork[]) {
  safeSet(KEY_WORKS, list);
}

export function getWorkById(id: string): IWork | undefined {
  return getWorks().find(w => w.id === id);
}

export function upsertWork(work: IWork) {
  const list = getWorks();
  const idx = list.findIndex(w => w.id === work.id);
  if (idx >= 0) list[idx] = work;
  else list.unshift(work);
  setWorks(list);
}

// ===== Orders =====
export function getOrders(): IOrderDetail[] {
  return safeGet<IOrderDetail[]>(KEY_ORDERS, []);
}

export function setOrders(list: IOrderDetail[]) {
  safeSet(KEY_ORDERS, list);
}

export function getOrderById(id: string): IOrderDetail | undefined {
  return getOrders().find(o => o.id === id);
}

export function getOrderByOrderNo(orderNo: string): IOrderDetail | undefined {
  return getOrders().find(o => o.orderNo === orderNo);
}

export function addOrder(order: IOrderDetail) {
  const list = getOrders();
  safeSet(KEY_ORDERS, [order, ...list]);
}

export function updateOrder(id: string, patch: Partial<IOrderDetail>) {
  const list = getOrders();
  const idx = list.findIndex(o => o.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...patch };
    setOrders(list);
    return list[idx];
  }
  return null;
}

// ===== Square Works =====
export function getSquareWorks(): ISquareWork[] {
  return safeGet<ISquareWork[]>(KEY_SQUARE_WORKS, []);
}

export function setSquareWorks(list: ISquareWork[]) {
  safeSet(KEY_SQUARE_WORKS, list);
}

export function getSquareWorkById(id: string): ISquareWork | undefined {
  return getSquareWorks().find(w => w.id === id);
}

export function upsertSquareWork(work: ISquareWork) {
  const list = getSquareWorks();
  const idx = list.findIndex(w => w.id === work.id);
  if (idx >= 0) list[idx] = work;
  else list.unshift(work);
  setSquareWorks(list);
}

// ===== Earnings =====
export function getEarnings(): IEarningRecord[] {
  return safeGet<IEarningRecord[]>(KEY_EARNINGS, []);
}

export function setEarnings(list: IEarningRecord[]) {
  safeSet(KEY_EARNINGS, list);
}

export function addEarning(e: IEarningRecord) {
  const list = getEarnings();
  safeSet(KEY_EARNINGS, [e, ...list]);
}

// ===== Recharge Records =====
export function getRechargeRecords(): IRechargeRecord[] {
  return safeGet<IRechargeRecord[]>(KEY_RECHARGE_RECORDS, []);
}

export function addRechargeRecord(r: IRechargeRecord) {
  const list = getRechargeRecords();
  safeSet(KEY_RECHARGE_RECORDS, [r, ...list]);
}

// ===== Init Flag =====
export function isInitialized(): boolean {
  return scopedStorage.getItem(KEY_INIT_FLAG) === '1';
}

export function markInitialized() {
  safeSet(KEY_INIT_FLAG, '1');
}

// ===== Export helpers =====
export { genId, genOrderNo, genTrackingNo, formatDate, safeGet, safeSet };
