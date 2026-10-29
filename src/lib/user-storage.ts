import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import type { IUser } from '@/data/types';
import { avatarImages } from '@lark-apaas/client-toolkit-lite';

const KEY_USERS = 'innolumina_all_users';
const KEY_CURRENT_USER = 'innolumina_user';

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

// 预置用户（首次加载时写入）
const DEFAULT_USERS: IUser[] = [
  { id: 'u1', phone: '138****8000', nickname: '琉衍体验官', avatar: avatarImages.avatarImg1, role: 'creator', points: 1250, token: '', expireAt: 0, createdAt: '2024-10-15' },
  { id: 'u2', phone: '139****1234', nickname: '青山设计', avatar: avatarImages.avatarImg2, role: 'creator', points: 860, token: '', expireAt: 0, createdAt: '2024-11-02' },
  { id: 'u3', phone: '137****5678', nickname: '琉璃收藏家', avatar: avatarImages.avatarImg3, role: 'user', points: 320, token: '', expireAt: 0, createdAt: '2024-11-20' },
  { id: 'u4', phone: '136****9012', nickname: '莫小七', avatar: avatarImages.avatarImg4, role: 'creator', points: 2100, token: '', expireAt: 0, createdAt: '2024-12-01' },
  { id: 'u5', phone: '135****3456', nickname: '禅意生活', avatar: avatarImages.avatarImg5, role: 'user', points: 150, token: '', expireAt: 0, createdAt: '2024-12-10' },
  { id: 'u6', phone: '134****7890', nickname: '几何研究所', avatar: avatarImages.avatarImg6, role: 'creator', points: 580, token: '', expireAt: 0, createdAt: '2024-12-18' },
  { id: 'u7', phone: '133****2345', nickname: '东方美学馆', avatar: avatarImages.avatarImg7, role: 'user', points: 2000, token: '', expireAt: 0, createdAt: '2025-01-03' },
  { id: 'u8', phone: '132****6789', nickname: '云栖茶舍', avatar: avatarImages.avatarImg8, role: 'user', points: 430, token: '', expireAt: 0, createdAt: '2025-01-08' },
  { id: 'u9', phone: '131****0123', nickname: '雅集文房', avatar: avatarImages.avatarImg9, role: 'creator', points: 1750, token: '', expireAt: 0, createdAt: '2025-01-12' },
  { id: 'u10', phone: '130****4567', nickname: '青竹书院', avatar: avatarImages.avatarImg10, role: 'user', points: 80, token: '', expireAt: 0, createdAt: '2025-01-14' },
];

// 初始化用户列表（懒加载）
function ensureUsers(): IUser[] {
  const existing = safeGet<IUser[]>(KEY_USERS, []);
  if (existing.length === 0) {
    safeSet(KEY_USERS, DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  return existing;
}

// 获取所有用户
export function getAllUsers(): IUser[] {
  return ensureUsers();
}

// 兼容旧调用名
export function getUsers(): IUser[] {
  return getAllUsers();
}

// 按ID获取用户
export function getUserById(userId: string): IUser | undefined {
  const users = getAllUsers();
  return users.find((u) => u.id === userId);
}

// 更新用户角色
export function updateUserRole(userId: string, role: IUser['role']): IUser | null {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], role };
  safeSet(KEY_USERS, users);
  // 如果当前登录用户被改角色，同步更新当前会话
  const current = safeGet<IUser | null>(KEY_CURRENT_USER, null);
  if (current && current.id === userId) {
    current.role = role;
    safeSet(KEY_CURRENT_USER, current);
  }
  return users[idx];
}

// 切换用户禁用状态（用 status 字段扩展，不在 IUser 中则用 role 切换表示）
export function toggleUserStatus(userId: string): IUser | null {
  // 简化：用角色切换代替禁用/启用
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx < 0) return null;
  const newRole: IUser['role'] = users[idx].role === 'user' ? 'creator' : 'user';
  users[idx] = { ...users[idx], role: newRole };
  safeSet(KEY_USERS, users);
  return users[idx];
}

// 添加新注册用户
export function addUser(user: IUser) {
  const users = getAllUsers();
  const exists = users.find((u) => u.id === user.id || u.phone === user.phone);
  if (exists) return;
  users.unshift(user);
  safeSet(KEY_USERS, users);
}
