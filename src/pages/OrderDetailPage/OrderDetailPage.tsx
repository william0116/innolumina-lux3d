import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Truck,
  Factory,
  Eye,
  FileText,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useOrder } from '@/contexts/OrderContext';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  pending: { label: '待支付', className: 'bg-warning/10 text-warning border-warning/30' },
  confirmed: { label: '已确认', className: 'bg-info/10 text-info border-info/30' },
  reviewing: { label: '审核中', className: 'bg-info/10 text-info border-info/30' },
  producing: { label: '生产中', className: 'bg-primary/10 text-primary border-primary/30' },
  shipped: { label: '已发货', className: 'bg-accent/15 text-accent-foreground border-accent/30' },
  completed: { label: '已完成', className: 'bg-success/10 text-success border-success/30' },
  cancelled: { label: '已取消', className: 'bg-muted text-muted-foreground border-border' },
  refunding: { label: '退款中', className: 'bg-warning/10 text-warning border-warning/30' },
  refunded: { label: '已退款', className: 'bg-muted text-muted-foreground border-border' },
};

const PRODUCT_TYPE_MAP: Record<string, string> = {
  stl: 'STL 数字模型',
  resin: '3D 打印树脂母模',
  glass: '脱蜡铸造琉璃成品',
};

const TIMELINE_STEPS = [
  { key: 'confirmed', label: '已确认', icon: CheckCircle2 },
  { key: 'reviewing', label: '审核中', icon: Eye },
  { key: 'producing', label: '生产中', icon: Factory },
  { key: 'shipped', label: '已发货', icon: Truck },
  { key: 'completed', label: '已完成', icon: CheckCircle2 },
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, payOrder, cancelOrder, confirmReceive, applyRefund } = useOrder();
  const [paying, setPaying] = useState(false);
  const [showLogistics, setShowLogistics] = useState(false);

  const order = state.orders.find(o => o.id === id);

  useEffect(() => {
    // 如果没有订单（直接刷新等），什么都不做，显示空态
  }, [id, state.orders]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 glass-bg-glow">
        <Package className="size-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">订单不存在</h2>
        <p className="text-sm text-muted-foreground mb-6">该订单可能已被取消或不存在</p>
        <Button onClick={() => navigate('/profile?tab=orders')} variant="outline">
          <ArrowLeft className="size-4 mr-1" />
          返回订单列表
        </Button>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.pending;

  // 计算当前时间线索引
  const statusOrder = ['confirmed', 'reviewing', 'producing', 'shipped', 'completed'];
  const currentIdx = statusOrder.indexOf(order.status);

  const handlePay = async () => {
    setPaying(true);
    try {
      await payOrder(order.id);
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = () => {
    cancelOrder(order.id);
  };

  const handleConfirmReceive = () => {
    confirmReceive(order.id);
  };

  const handleRefund = () => {
    applyRefund(order.id);
  };

  return (
    <div className="min-h-screen bg-background glass-bg-glow">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        {/* 顶部导航 */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回
        </button>

        {/* 状态卡片 */}
        <Card className="bg-gradient-to-br from-primary/5 via-card to-accent/5 border-border mb-6">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn('text-xs px-2.5 py-0.5', statusInfo.className)}>
                    {statusInfo.label}
                  </Badge>
                  {order.status === 'producing' && (
                    <span className="text-xs text-primary font-medium">
                      生产进度 {order.productionProgress}%
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold font-['Noto_Serif_SC'] text-foreground tracking-wider">
                  {getStatusTitle(order.status)}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{getStatusDesc(order.status)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">订单金额</p>
                <p className="text-2xl font-bold text-primary font-['Noto_Serif_SC'] mt-0.5">
                  ¥{order.totalPrice}
                </p>
              </div>
            </div>

            {/* 进度条 - 仅主流程状态显示 */}
            {['confirmed', 'reviewing', 'producing', 'shipped', 'completed'].includes(order.status) && (
              <div className="mt-6">
                <div className="relative">
                  {/* 背景线 */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
                  {/* 进度线 */}
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
                    style={{
                      width: `${Math.max(0, currentIdx / (TIMELINE_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                  <div className="relative flex justify-between">
                    {TIMELINE_STEPS.map((step, i) => {
                      const Icon = step.icon;
                      const isDone = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      return (
                        <div key={step.key} className="flex flex-col items-center">
                          <div
                            className={cn(
                              'size-8 rounded-full flex items-center justify-center z-10 transition-all duration-300',
                              isDone
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border text-muted-foreground'
                            )}
                          >
                            <Icon className="size-4" />
                          </div>
                          <span
                            className={cn(
                              'text-[10px] mt-1.5 whitespace-nowrap',
                              isDone ? 'text-foreground font-medium' : 'text-muted-foreground'
                            )}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 生产进度条 */}
                {order.status === 'producing' && (
                  <div className="mt-5">
                    <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
                      <span>生产进度</span>
                      <span className="text-primary font-medium tabular-nums">{order.productionProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-700 ease-out"
                        style={{ width: `${order.productionProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 商品信息 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Package className="size-4 text-primary" />
              商品信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="size-20 md:size-24 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                <Image src={order.workImage} alt={order.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm line-clamp-2">{order.productName}</h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    {PRODUCT_TYPE_MAP[order.productType]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">数量：×{order.quantity}</span>
                  <span className="text-primary font-semibold">¥{order.totalPrice}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 收货信息 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              收货信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground text-sm">{order.receiver.name}</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="size-3.5" />
                {order.receiver.phone}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{order.receiver.address}</p>
            {order.remark && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  备注：<span className="text-foreground">{order.remark}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 物流信息 */}
        {(order.status === 'shipped' || order.status === 'completed') && order.trackingNo && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                物流信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{order.trackingCompany}</p>
                  <p className="text-xs text-muted-foreground mt-1 tabular-nums">{order.trackingNo}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowLogistics(!showLogistics)}
                  className="gap-1 rounded-md"
                >
                  {showLogistics ? '收起' : '查看物流'}
                </Button>
              </div>
              {showLogistics && (
                <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-2 rounded-full bg-success mt-1.5" />
                      <div className="w-px flex-1 bg-border mt-1" />
                    </div>
                    <div className="pb-3">
                      <p className="text-sm text-foreground">【深圳市】快递已签收</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.completedAt || order.shippedAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-2 rounded-full bg-muted-foreground/40 mt-1.5" />
                      <div className="w-px flex-1 bg-border mt-1" />
                    </div>
                    <div className="pb-3">
                      <p className="text-sm text-foreground">【上海市】快件已发出，下一站 上海转运中心</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.shippedAt}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-2 rounded-full bg-muted-foreground/40 mt-1.5" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">【深圳市】快件已揽收</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.shippedAt}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 订单详情 */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              订单信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <DetailRow label="订单编号" value={order.orderNo} />
            <DetailRow label="下单时间" value={order.createdAt} />
            {order.paidAt && <DetailRow label="支付时间" value={order.paidAt} />}
            {order.shippedAt && <DetailRow label="发货时间" value={order.shippedAt} />}
            {order.completedAt && <DetailRow label="完成时间" value={order.completedAt} />}
            <div className="pt-2 mt-2 border-t border-border/50 space-y-2">
              <DetailRow label="商品金额" value={`¥${order.price} × ${order.quantity}`} />
              <DetailRow label="运费" value="¥0" />
              <DetailRow
                label="实付金额"
                value={<span className="text-primary font-bold text-base">¥{order.totalPrice}</span>}
              />
            </div>
          </CardContent>
        </Card>

        {/* 底部操作按钮 */}
        <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-md border-t border-border/50 md:sticky md:mx-0 md:px-0">
          <div className="flex gap-2 justify-end">
            {order.status === 'pending' && (
              <>
                <Button variant="outline" onClick={handleCancel} className="rounded-lg">
                  取消订单
                </Button>
                <Button onClick={handlePay} disabled={paying} className="rounded-lg bg-primary">
                  {paying ? '支付中...' : '立即支付'}
                </Button>
              </>
            )}
            {order.status === 'shipped' && (
              <>
                <Button variant="outline" onClick={() => setShowLogistics(!showLogistics)} className="rounded-lg">
                  查看物流
                </Button>
                <Button onClick={handleConfirmReceive} className="rounded-lg bg-primary">
                  确认收货
                </Button>
              </>
            )}
            {order.status === 'completed' && (
              <Button variant="outline" onClick={handleRefund} className="rounded-lg gap-1">
                <RotateCcw className="size-3.5" />
                申请退款
              </Button>
            )}
            {(order.status === 'confirmed' || order.status === 'reviewing' || order.status === 'producing') && (
              <p className="text-xs text-muted-foreground">订单处理中，预计 7-10 天发货</p>
            )}
            {(order.status === 'cancelled' || order.status === 'refunded') && (
              <p className="text-xs text-muted-foreground">
                {order.status === 'cancelled' ? '订单已取消' : '退款已完成'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function getStatusTitle(status: string): string {
  const map: Record<string, string> = {
    pending: '等待支付',
    confirmed: '订单已确认',
    reviewing: '设计师审核中',
    producing: '正在生产制作',
    shipped: '商品已发货',
    completed: '交易已完成',
    cancelled: '订单已取消',
    refunding: '退款处理中',
    refunded: '退款已完成',
  };
  return map[status] || status;
}

function getStatusDesc(status: string): string {
  const map: Record<string, string> = {
    pending: '请尽快完成支付，超时订单将自动取消',
    confirmed: '支付成功，等待设计师审核',
    reviewing: '工艺工程师正在审核模型可行性',
    producing: '工厂正在制作中，请耐心等待',
    shipped: '商品已发出，请注意查收',
    completed: '感谢您的信任，期待再次合作',
    cancelled: '订单已取消',
    refunding: '退款申请处理中，预计 1-3 个工作日到账',
    refunded: '退款已完成',
  };
  return map[status] || '';
}
