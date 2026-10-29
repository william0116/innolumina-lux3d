import { NavLink, useNavigate } from 'react-router-dom';
import { Sparkles, Home, Package, User, Coins, Grid3X3, Plus, HelpCircle, Menu, X, LogOut, Settings, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/', label: '首页', icon: Home, end: true },
  { path: '/create', label: 'AI创作', icon: Sparkles },
  { path: '/square', label: '作品广场', icon: Grid3X3 },
  { path: '/profile?tab=works', label: '我的作品', icon: User },
  { path: '/profile?tab=orders', label: '订单中心', icon: Package },
  { path: '/help', label: '帮助', icon: HelpCircle },
];

export default function Header() {
  const navigate = useNavigate();
  const { state, logout } = useAuth();
  const { user, isInitialized } = state;
  const [scrolled, setScrolled] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const credit = user?.points ?? 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-500',
        scrolled ? 'glass-nav-scrolled' : 'glass-nav'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex h-14 md:h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
          >
            <div className="size-8 md:size-9 rounded-lg bg-gradient-to-br from-primary to-accent/70 flex items-center justify-center text-primary-foreground font-bold text-sm md:text-base relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/25" />
              <span className="relative font-['Noto_Serif_SC']">琉</span>
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
               <span className="text-foreground font-semibold text-base font-['Noto_Serif_SC'] tracking-wide">
                 琉衍工坊
               </span>
               <span className="text-muted-foreground text-[11px] tracking-[0.2em] glass-brand-en">
                 InnoLumina
               </span>
             </div>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isRoot = item.end;
              const basePath = item.path.split('?')[0];
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={isRoot}
                  className={({ isActive }) =>
                    cn(
                       'relative flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm transition-all duration-300 tracking-wide',
                      isActive
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className="size-4" />
                      {item.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-gradient-to-r from-primary to-accent"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* 积分余额 */}
          {user && (
            <button
              onClick={() => navigate('/profile?tab=points')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-sm hover:border-accent/50 hover:bg-accent/5 transition-all group"
            >
              <Coins className="size-4 text-warning" />
              <span className="text-foreground font-medium tabular-nums glass-num-glow">{credit}</span>
              <span className="text-muted-foreground text-xs">积分</span>
              <Plus className="size-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
            </button>
          )}

          {/* 未登录：显示登录按钮 */}
          {!user && isInitialized && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoginClick}
              className="hidden lg:inline-flex glass-card hover:border-accent/50"
            >
              登录 / 注册
            </Button>
          )}

          {/* 已登录：显示头像下拉 */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-2 pl-1 pr-2 py-1 rounded-full glass-card hover:border-accent/50 transition-all">
                  <Avatar className="size-7 border border-white">
                    <AvatarImage src={user.avatar} alt={user.nickname} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {user.nickname?.slice(0, 1) || '琉'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground font-medium max-w-[80px] truncate">
                    {user.nickname}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2 cursor-pointer">
                  <User className="size-4" /> 个人中心
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile?tab=orders')} className="gap-2 cursor-pointer">
                  <Package className="size-4" /> 我的订单
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile?tab=points')} className="gap-2 cursor-pointer">
                  <Coins className="size-4" /> 积分账户
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/profile?tab=settings')} className="gap-2 cursor-pointer">
                  <Settings className="size-4" /> 账户设置
                </DropdownMenuItem>
                {state.user?.role === 'admin' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="gap-2 cursor-pointer text-primary">
                      <Shield className="size-4" /> 管理后台
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogoutClick} className="gap-2 text-destructive cursor-pointer">
                  <LogOut className="size-4" /> 退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            size="sm"
            onClick={() => navigate('/create')}
            className="glass-btn-primary hidden sm:inline-flex"
          >
            开始创作
          </Button>

          {/* 移动端汉堡菜单 */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden !size-10 rounded-lg"
                aria-label="打开菜单"
              >
                <Menu className="size-5 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[85vw] max-w-sm bg-background border-l border-border p-0"
            >
              <SheetHeader className="p-5 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-accent/70 flex items-center justify-center text-primary-foreground font-bold">
                    <span className="font-['Noto_Serif_SC']">琉</span>
                  </div>
                  <div>
                    <div className="text-foreground font-semibold font-['Noto_Serif_SC']">
                      琉衍工坊
                    </div>
                    <div className="text-muted-foreground text-[10px] tracking-[0.2em] glass-brand-en">
                      InnoLumina
                    </div>
                  </div>
                </div>
              </SheetHeader>

              {/* 用户信息 / 积分余额卡片 */}
              <div className="px-5 py-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12 border-2 border-white shadow">
                        <AvatarImage src={user.avatar} alt={user.nickname} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                          {user.nickname?.slice(0, 1) || '琉'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{user.nickname}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSheetOpen(false);
                        navigate('/profile?tab=points');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl glass-card hover:border-accent/40 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                          <Coins className="size-4 text-warning" />
                        </div>
                        <div className="text-left">
                          <div className="text-xs text-muted-foreground">当前积分</div>
                          <div className="text-lg font-bold text-foreground tabular-nums glass-num-glow">
                            {credit}
                          </div>
                        </div>
                      </div>
                      <Plus className="size-4 text-primary" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSheetOpen(false);
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl glass-card hover:border-accent/40 transition-all"
                  >
                    <div className="size-10 rounded-full bg-gradient-to-br from-primary to-accent/70 flex items-center justify-center text-primary-foreground">
                      <User className="size-5" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium text-foreground">点击登录</div>
                      <div className="text-xs text-muted-foreground">登录后解锁全部功能</div>
                    </div>
                    <Plus className="size-4 text-primary" />
                  </button>
                )}
              </div>

              {/* 导航列表 */}
              <nav className="px-3 pb-6 space-y-1">
                {NAV_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setSheetOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all min-h-[48px]',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-muted'
                        )
                      }
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              {/* 底部按钮 */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/60 bg-background/95 backdrop-blur-md">
                {user ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 rounded-lg"
                      onClick={handleLogoutClick}
                    >
                      <LogOut className="size-4 mr-1.5" />
                      退出
                    </Button>
                    <Button
                      className="flex-1 glass-btn-primary h-11"
                      onClick={() => {
                        setSheetOpen(false);
                        navigate('/create');
                      }}
                    >
                      <Sparkles className="size-4 mr-1.5" />
                      创作
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full glass-btn-primary h-12"
                    onClick={() => {
                      setSheetOpen(false);
                      navigate('/login');
                    }}
                  >
                    <User className="size-4 mr-2" />
                    登录 / 注册
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
