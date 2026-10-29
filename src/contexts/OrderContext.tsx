import { createContext, useContext, useEffect, useReducer, useCallback, type ReactNode } from 'react';
import {
  getOrders,
  setOrders,
  addOrder as addOrderToStorage,
  updateOrder as updateOrderInStorage,
  genOrderNo,
  genTrackingNo,
  formatDate,
  getEarnings,
  setEarnings,
  addEarning,
  genId,
  getSquareWorks,
  setSquareWorks,
} from '@/lib/app-storage';
import type { IOrderDetail, OrderStatus, IEarningRecord, ISquareWork } from '@/data/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface OrderState {
  orders: IOrderDetail[];
  earnings: IEarningRecord[];
  squareWorks: ISquareWork[];
}

type OrderAction =
  | { type: 'INIT'; orders: IOrderDetail[]; earnings: IEarningRecord[]; squareWorks: ISquareWork[] }
  | { type: 'ADD_ORDER'; order: IOrderDetail }
  | { type: 'UPDATE_ORDER'; id: string; patch: Partial<IOrderDetail> }
  | { type: 'ADD_EARNING'; earning: IEarningRecord }
  | { type: 'UPDATE_EARNING'; id: string; patch: Partial<IEarningRecord> }
  | { type: 'ADD_SQUARE_WORK'; work: ISquareWork }
  | { type: 'UPDATE_SQUARE_WORK'; id: string; patch: Partial<ISquareWork> };

const OrderContext = createContext<{
  state: OrderState;
  createOrder: (data: Omit<IOrderDetail, 'id' | 'orderNo' | 'status' | 'productionProgress' | 'createdAt'>) => IOrderDetail;
  payOrder: (id: string) => Promise<boolean>;
  cancelOrder: (id: string) => void;
  confirmReceive: (id: string) => void;
  applyRefund: (id: string) => void;
  refreshOrders: () => void;
} | null>(null);

function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case 'INIT':
      return { orders: action.orders, earnings: action.earnings, squareWorks: action.squareWorks };
    case 'ADD_ORDER':
      return { ...state, orders: [action.order, ...state.orders] };
    case 'UPDATE_ORDER': {
      const idx = state.orders.findIndex(o => o.id === action.id);
      if (idx < 0) return state;
      const updated = { ...state.orders[idx], ...action.patch };
      const newOrders = [...state.orders];
      newOrders[idx] = updated;
      return { ...state, orders: newOrders };
    }
    case 'ADD_EARNING':
      return { ...state, earnings: [action.earning, ...state.earnings] };
    case 'UPDATE_EARNING': {
      const idx = state.earnings.findIndex(e => e.id === action.id);
      if (idx < 0) return state;
      const updated = { ...state.earnings[idx], ...action.patch };
      const newEarnings = [...state.earnings];
      newEarnings[idx] = updated;
      return { ...state, earnings: newEarnings };
    }
    case 'ADD_SQUARE_WORK':
      return { ...state, squareWorks: [action.work, ...state.squareWorks] };
    case 'UPDATE_SQUARE_WORK': {
      const idx = state.squareWorks.findIndex(w => w.id === action.id);
      if (idx < 0) return state;
      const updated = { ...state.squareWorks[idx], ...action.patch };
      const newWorks = [...state.squareWorks];
      newWorks[idx] = updated;
      return { ...state, squareWorks: newWorks };
    }
    default:
      return state;
  }
}

const CREATOR_EARNING_RATE = 0.2; // 创作者分成 20%

export function OrderProvider({ children }: { children: ReactNode }) {
  const { state: authState, addPoints } = useAuth();
  const [state, dispatch] = useReducer(orderReducer, {
    orders: [],
    earnings: [],
    squareWorks: [],
  });

  // 初始化
  useEffect(() => {
    dispatch({
      type: 'INIT',
      orders: getOrders(),
      earnings: getEarnings(),
      squareWorks: getSquareWorks(),
    });
  }, []);

  // 创建订单
  const createOrder = useCallback((data: Omit<IOrderDetail, 'id' | 'orderNo' | 'status' | 'productionProgress' | 'createdAt'>): IOrderDetail => {
    const order: IOrderDetail = {
      ...data,
      id: genId('ord_'),
      orderNo: genOrderNo(),
      status: 'pending',
      productionProgress: 0,
      createdAt: formatDate(new Date()),
    };
    addOrderToStorage(order);
    dispatch({ type: 'ADD_ORDER', order });
    return order;
  }, []);

  // 支付订单
  const payOrder = useCallback(async (id: string): Promise<boolean> => {
    const order = state.orders.find(o => o.id === id);
    if (!order) return false;

    await new Promise(r => setTimeout(r, 1500));

    const now = formatDate(new Date());
    const patch: Partial<IOrderDetail> = {
      status: 'confirmed',
      paidAt: now,
    };
    updateOrderInStorage(id, patch);
    dispatch({ type: 'UPDATE_ORDER', id, patch });
    toast.success('支付成功，订单已确认');

    // 自动流转到审核中
    setTimeout(() => {
      const reviewPatch: Partial<IOrderDetail> = {
        status: 'reviewing',
        reviewedAt: formatDate(new Date()),
      };
      updateOrderInStorage(id, reviewPatch);
      dispatch({ type: 'UPDATE_ORDER', id, patch: reviewPatch });

      // 审核 2 秒后通过，进入生产
      setTimeout(() => {
        const prodPatch: Partial<IOrderDetail> = {
          status: 'producing',
          productionProgress: 0,
        };
        updateOrderInStorage(id, prodPatch);
        dispatch({ type: 'UPDATE_ORDER', id, patch: prodPatch });

        // 模拟生产进度：每 2 秒 +10%
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress >= 100) {
            clearInterval(interval);
            const trackingNo = genTrackingNo();
            const shipPatch: Partial<IOrderDetail> = {
              status: 'shipped',
              shippedAt: formatDate(new Date()),
              productionProgress: 100,
              trackingNo,
              trackingCompany: '顺丰速运',
            };
            updateOrderInStorage(id, shipPatch);
            dispatch({ type: 'UPDATE_ORDER', id, patch: shipPatch });

            // 如果是广场作品且有创作者，产生收益记录
            const currentOrder = getOrderByIdLocal(id);
            if (currentOrder && currentOrder.creatorId && currentOrder.productType !== 'stl') {
              const earningAmount = Math.round(currentOrder.totalPrice * CREATOR_EARNING_RATE);
              const earning: IEarningRecord = {
                id: genId('earn_'),
                creatorId: currentOrder.creatorId,
                orderId: id,
                orderNo: currentOrder.orderNo,
                workTitle: currentOrder.productName,
                amount: earningAmount,
                status: 'pending',
                createdAt: formatDate(new Date()),
              };
              addEarning(earning);
              dispatch({ type: 'ADD_EARNING', earning });
            }
          } else {
            const progressPatch: Partial<IOrderDetail> = { productionProgress: progress };
            updateOrderInStorage(id, progressPatch);
            dispatch({ type: 'UPDATE_ORDER', id, patch: progressPatch });
          }
        }, 2000);
      }, 2000);
    }, 500);

    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.orders]);

  // 取消订单
  const cancelOrder = useCallback((id: string) => {
    const patch: Partial<IOrderDetail> = {
      status: 'cancelled',
      cancelledAt: formatDate(new Date()),
    };
    updateOrderInStorage(id, patch);
    dispatch({ type: 'UPDATE_ORDER', id, patch });
    toast.info('订单已取消');
  }, []);

  // 确认收货
  const confirmReceive = useCallback((id: string) => {
    const patch: Partial<IOrderDetail> = {
      status: 'completed',
      completedAt: formatDate(new Date()),
    };
    updateOrderInStorage(id, patch);
    dispatch({ type: 'UPDATE_ORDER', id, patch });
    toast.success('已确认收货，订单完成');

    // 订单完成后，7天后收益可提现（模拟立即可提现）
    const order = state.orders.find(o => o.id === id);
    if (order?.creatorId) {
      setTimeout(() => {
        const earnings = getEarnings();
        const e = earnings.find(er => er.orderId === id);
        if (e && e.status === 'pending') {
          const updated = { ...e, status: 'available' as const, settledAt: formatDate(new Date()) };
          const newEarnings = earnings.map(er => er.id === e.id ? updated : er);
          setEarnings(newEarnings);
          dispatch({ type: 'UPDATE_EARNING', id: e.id, patch: updated });
        }
      }, 1000);
    }
  }, [state.orders]);

  // 申请退款
  const applyRefund = useCallback((id: string) => {
    const patch: Partial<IOrderDetail> = { status: 'refunding' as OrderStatus };
    updateOrderInStorage(id, patch);
    dispatch({ type: 'UPDATE_ORDER', id, patch });
    toast.info('退款申请已提交，处理中...');

    setTimeout(() => {
      const refundPatch: Partial<IOrderDetail> = {
        status: 'refunded' as OrderStatus,
        refundedAt: formatDate(new Date()),
      };
      updateOrderInStorage(id, refundPatch);
      dispatch({ type: 'UPDATE_ORDER', id, patch: refundPatch });
      toast.success('退款已完成');
    }, 3000);
  }, []);

  const refreshOrders = useCallback(() => {
    dispatch({
      type: 'INIT',
      orders: getOrders(),
      earnings: getEarnings(),
      squareWorks: getSquareWorks(),
    });
  }, []);

  return (
    <OrderContext.Provider value={{ state, createOrder, payOrder, cancelOrder, confirmReceive, applyRefund, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

function getOrderByIdLocal(id: string): IOrderDetail | undefined {
  return getOrders().find(o => o.id === id);
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
}
