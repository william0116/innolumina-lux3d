import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import type { ISquareWork } from '@/data/square';
import { MOCK_SQUARE_WORKS } from '@/data/square';

// 审核状态类型
export type AuditStatus = 'pending' | 'approved' | 'rejected';

const KEY_SQUARE = 'innolumina_square_works';
const KEY_MY_WORKS = 'innolumina_my_square_works';
const KEY_EARNINGS = 'innolumina_creator_earnings';

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

// 广场作品（所有公开作品）
// 广场公开作品（仅审核通过的）
export function getSquareWorks(): ISquareWork[] {
  const all = safeGet<ISquareWork[]>(KEY_SQUARE, MOCK_SQUARE_WORKS);
  return all.filter((w) => w.auditStatus === 'approved' && w.isPublic);
}

// 获取全部广场作品（含待审核，用于后台）
export function getAllSquareWorks(): ISquareWork[] {
  return safeGet<ISquareWork[]>(KEY_SQUARE, MOCK_SQUARE_WORKS);
}

// 保存全部广场作品
export function saveAllSquareWorks(works: ISquareWork[]) {
  safeSet(KEY_SQUARE, works);
}

export function getSquareWorkById(id: string): ISquareWork | undefined {
  return getSquareWorks().find((w) => w.id === id);
}

// 我的作品（用户上传的）
export function getMySquareWorks(): ISquareWork[] {
  return safeGet<ISquareWork[]>(KEY_MY_WORKS, []);
}

export function addMySquareWork(work: ISquareWork) {
  const list = getMySquareWorks();
  list.unshift(work);
  safeSet(KEY_MY_WORKS, list);
  // 如果是公开、已发布且审核通过，也加入广场公开列表
  if (work.isPublic && work.status === 'published' && work.auditStatus === 'approved') {
    const all = getAllSquareWorks();
    all.unshift(work);
    safeSet(KEY_SQUARE, all);
  }
}

// 发布作品到广场（进入待审核状态）
export function publishWorkToSquare(work: ISquareWork): ISquareWork {
  const pendingWork: ISquareWork = {
    ...work,
    status: 'published',
    isPublic: true,
    auditStatus: 'pending',
    auditReason: undefined,
    auditedAt: undefined,
  };
  // 保存到我的作品
  const myList = getMySquareWorks();
  const existingIdx = myList.findIndex((w) => w.id === work.id);
  if (existingIdx >= 0) {
    myList[existingIdx] = pendingWork;
  } else {
    myList.unshift(pendingWork);
  }
  safeSet(KEY_MY_WORKS, myList);
  // 加入广场总表（待审核状态，广场列表过滤掉）
  const all = getAllSquareWorks();
  const sqIdx = all.findIndex((w) => w.id === work.id);
  if (sqIdx >= 0) {
    all[sqIdx] = pendingWork;
  } else {
    all.unshift(pendingWork);
  }
  safeSet(KEY_SQUARE, all);
  return pendingWork;
}

// 审核通过
export function approveWork(workId: string): ISquareWork | null {
  const all = getAllSquareWorks();
  const idx = all.findIndex((w) => w.id === workId);
  if (idx < 0) return null;
  all[idx] = {
    ...all[idx],
    auditStatus: 'approved',
    auditReason: undefined,
    auditedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
  safeSet(KEY_SQUARE, all);
  // 同步我的作品
  const myList = getMySquareWorks();
  const myIdx = myList.findIndex((w) => w.id === workId);
  if (myIdx >= 0) {
    myList[myIdx] = all[idx];
    safeSet(KEY_MY_WORKS, myList);
  }
  return all[idx];
}

// 审核拒绝
export function rejectWork(workId: string, reason: string): ISquareWork | null {
  const all = getAllSquareWorks();
  const idx = all.findIndex((w) => w.id === workId);
  if (idx < 0) return null;
  all[idx] = {
    ...all[idx],
    auditStatus: 'rejected',
    auditReason: reason,
    auditedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  };
  safeSet(KEY_SQUARE, all);
  // 同步我的作品
  const myList = getMySquareWorks();
  const myIdx = myList.findIndex((w) => w.id === workId);
  if (myIdx >= 0) {
    myList[myIdx] = all[idx];
    safeSet(KEY_MY_WORKS, myList);
  }
  return all[idx];
}

export function updateMySquareWork(work: ISquareWork) {
  const list = getMySquareWorks();
  const idx = list.findIndex((w) => w.id === work.id);
  if (idx >= 0) list[idx] = work;
  safeSet(KEY_MY_WORKS, list);
}

// 创作者收益
export interface EarningRecord {
  id: string;
  orderId: string;
  buyerName: string;
  workTitle: string;
  orderAmount: number;
  royaltyRate: number;
  earning: number;
  status: 'pending' | 'available' | 'withdrawn';
  createdAt: string;
}

export interface CreatorEarnings {
  totalRevenue: number;
  pendingRevenue: number;
  settledRevenue: number;
  availableRevenue: number;
  records: EarningRecord[];
}

const MOCK_EARNING_RECORDS: EarningRecord[] = [
  {
    id: 'er-1',
    orderId: '20260910001',
    buyerName: '琉璃收藏家',
    workTitle: '四时物候·竹叶八角匣',
    orderAmount: 580,
    royaltyRate: 0.15,
    earning: 87.0,
    status: 'available',
    createdAt: '2026-09-10 14:32',
  },
  {
    id: 'er-2',
    orderId: '20260908003',
    buyerName: '禅意生活',
    workTitle: '海棠形琉璃香插',
    orderAmount: 98,
    royaltyRate: 0.15,
    earning: 14.7,
    status: 'pending',
    createdAt: '2026-09-08 09:15',
  },
  {
    id: 'er-3',
    orderId: '20260905002',
    buyerName: '东方美学馆',
    workTitle: '淡蓝椭圆琉璃匣',
    orderAmount: 320,
    royaltyRate: 0.20,
    earning: 64.0,
    status: 'withdrawn',
    createdAt: '2026-09-05 16:48',
  },
  {
    id: 'er-4',
    orderId: '20260901001',
    buyerName: '雅集文房',
    workTitle: '琥珀色长形琉璃匣',
    orderAmount: 460,
    royaltyRate: 0.10,
    earning: 46.0,
    status: 'withdrawn',
    createdAt: '2026-09-01 11:20',
  },
  {
    id: 'er-5',
    orderId: '20260828005',
    buyerName: '青竹书院',
    workTitle: '竹叶青琉璃笔架',
    orderAmount: 180,
    royaltyRate: 0.15,
    earning: 27.0,
    status: 'available',
    createdAt: '2026-08-28 10:05',
  },
  {
    id: 'er-6',
    orderId: '20260825004',
    buyerName: '云栖茶舍',
    workTitle: '山水琉璃茶则',
    orderAmount: 120,
    royaltyRate: 0.10,
    earning: 12.0,
    status: 'available',
    createdAt: '2026-08-25 15:33',
  },
];

export function getCreatorEarnings(): CreatorEarnings {
  return safeGet<CreatorEarnings>(KEY_EARNINGS, {
    totalRevenue: 3847.5,
    pendingRevenue: 328.5,
    availableRevenue: 1256.0,
    settledRevenue: 2435.5,
    records: MOCK_EARNING_RECORDS,
  });
}

export function addEarnings(amount: number) {
  const e = getCreatorEarnings();
  e.totalRevenue += amount;
  e.pendingRevenue += amount;
  safeSet(KEY_EARNINGS, e);
}
