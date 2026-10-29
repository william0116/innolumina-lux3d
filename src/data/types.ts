// EXPORTS: IUser, IOrderDetail, IEarningRecord, IRechargeRecord, ISquareWork, AuditStatus, OrderStatus
import type { IWork, ICreditRecord, IOrder } from './glassmorphism';

export interface IUser {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  role: 'user' | 'creator' | 'admin';
  points: number;
  token: string;
  expireAt: number; // timestamp ms
  createdAt: string;
}

export type OrderStatus =
  | 'pending'      // 待支付
  | 'confirmed'    // 已确认（已支付）
  | 'reviewing'    // 审核中
  | 'producing'    // 生产中
  | 'shipped'      // 已发货
  | 'completed'    // 已完成
  | 'cancelled'    // 已取消
  | 'refunding'    // 退款中
  | 'refunded';    // 已退款

export interface IOrderDetail extends Omit<IOrder, 'status'> {
  orderNo: string;
  status: OrderStatus;
  paidAt?: string;
  reviewedAt?: string;
  producedAt?: string;
  shippedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  trackingNo?: string;
  trackingCompany?: string;
  productionProgress: number; // 0-100
  creatorId?: string;
  creatorEarning?: number;
}

export type AuditStatus = 'pending' | 'approved' | 'rejected';

export interface ISquareWork {
  id: string;
  workId: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  coverImage: string;
  images: string[];
  prompt: string;
  style: string;
  auditStatus: AuditStatus;
  auditReason?: string;
  isPublic: boolean;
  likeCount: number;
  viewCount: number;
  price?: number;
  createdAt: string;
  auditedAt?: string;
}

export interface IEarningRecord {
  id: string;
  creatorId: string;
  orderId: string;
  orderNo: string;
  workTitle: string;
  amount: number;
  status: 'pending' | 'available' | 'withdrawn';
  createdAt: string;
  settledAt?: string;
  withdrawnAt?: string;
}

export interface IRechargeRecord {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;    // 元
  points: number;    // 积分
  bonusPoints: number;
  status: 'pending' | 'success' | 'failed';
  paidAt?: string;
  createdAt: string;
}

// 扩展 ICreditRecord 增加更多字段
export interface IExtendedCreditRecord extends ICreditRecord {
  balance: number;
  bizType?: 'recharge' | 'text_to_image' | 'image_to_image' | 'to_3d' | 'refund' | 'bonus';
  bizId?: string;
}

// 保证 glassmorphism 类型也可访问
export type { IWork, IOrder, ICreditRecord };
