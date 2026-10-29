import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Sparkles, Phone, MessageSquare, Lock, ArrowRight, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getUser, setUser, genId, formatDate, addPointRecord } from '@/lib/app-storage';
import { avatarImages, logger } from '@lark-apaas/client-toolkit-lite';
import type { IUser } from '@/data/types';

const DEMO_CODE = '123456';
const TEST_PHONE = '13800138000';
const TEST_PASSWORD = '123456';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as { from?: string })?.from || '/';

  const [mode, setMode] = useState<'code' | 'password'>('code');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(true);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (codeCountdown <= 0) return;
    const timer = setTimeout(() => setCodeCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [codeCountdown]);

  const phoneValid = /^1[3-9]\d{9}$/.test(phone);

  const handleSendCode = () => {
    if (!phoneValid) {
      toast.error('请输入正确的手机号');
      return;
    }
    setCodeCountdown(60);
    // 模拟打印验证码
    logger.info(`[演示] 验证码已发送至 ${phone}，演示验证码：${DEMO_CODE}`);
    toast.info(`验证码已发送，演示验证码：${DEMO_CODE}`);
  };

  const handleLogin = async (loginPhone: string, loginType: 'code' | 'password', value: string) => {
    if (!agree) {
      toast.error('请先同意用户协议和隐私政策');
      return;
    }
    if (!phoneValid) {
      toast.error('请输入正确的手机号');
      return;
    }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));

    try {
      let success = false;
      let existingUser: IUser | null = null;

      // 先检查本地是否已有该用户
      const storedUser = getUser();
      if (storedUser && storedUser.phone === loginPhone) {
        existingUser = storedUser;
      }

      if (loginType === 'code') {
        success = value === DEMO_CODE;
        if (!success) {
          toast.error('验证码错误');
          return;
        }
      } else {
        // 密码登录：测试账号 or 本地用户
        if (loginPhone === TEST_PHONE && value === TEST_PASSWORD) {
          success = true;
        } else if (existingUser && (existingUser as IUser & { passwordHash?: string }).passwordHash) {
          // 简单模拟密码校验
          success = value === (existingUser as IUser & { passwordHash?: string }).passwordHash;
        } else {
          toast.error('手机号或密码错误');
          return;
        }
      }

      let user: IUser;
      if (existingUser) {
        user = {
          ...existingUser,
          token: genId('tk_'),
          expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        };
      } else {
        // 新用户（首次验证码登录）
        user = {
          id: genId('user_'),
          phone: loginPhone,
          nickname: `琉衍用户${Math.floor(Math.random() * 9000 + 1000)}`,
          avatar: avatarImages.avatarImg1,
          role: 'user',
          points: 50, // 新用户欢迎礼包 50 积分
          token: genId('tk_'),
          expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          createdAt: formatDate(new Date()),
        };
      }

      setUser(user);
      login(user);
      toast.success('登录成功');

      // 如果是新用户，增加一条欢迎礼包积分记录
      if (!existingUser) {
        addPointRecord({
          type: 'recharge',
          amount: 50,
          balance: 50,
          bizType: 'bonus',
          description: '新用户欢迎礼包',
          createdAt: formatDate(new Date()),
        });
      }

      // 跳转回来源页或首页
      setTimeout(() => navigate(from, { replace: true }), 300);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(phone, 'code', code);
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(phone, 'password', password);
  };

  const handleWechatLogin = () => {
    toast.info('微信登录开发中');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 glass-bg-glow">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg mb-4">
            <Sparkles className="size-7 text-primary-foreground" />
          </div>
          <h1 className="font-['Noto_Serif_SC'] text-2xl font-bold text-foreground tracking-wider">
            InnoLumina<span className="text-primary/60 mx-2">｜</span>琉衍工坊
          </h1>
          <p className="text-sm text-muted-foreground mt-2">光自数字来，万象衍为琉</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-8 glass-card">
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'code' | 'password')} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-6 h-10">
              <TabsTrigger value="code" className="text-sm">验证码登录</TabsTrigger>
              <TabsTrigger value="password" className="text-sm">密码登录</TabsTrigger>
            </TabsList>

            {/* 验证码登录 */}
            <TabsContent value="code">
              <form onSubmit={handleCodeLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">手机号</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      maxLength={11}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="请输入手机号"
                      className="h-11 pl-9 rounded-lg bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">验证码</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        type="text"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="6位验证码"
                        className="h-11 pl-9 rounded-lg bg-background/50"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSendCode}
                      disabled={codeCountdown > 0 || !phoneValid}
                      className="h-11 px-4 rounded-lg whitespace-nowrap"
                    >
                      {codeCountdown > 0 ? `重新获取(${codeCountdown}s)` : '获取验证码'}
                    </Button>
                  </div>
                  {mode === 'code' && (
                    <p className="text-[11px] text-muted-foreground">
                      演示验证码：<span className="text-warning font-medium">{DEMO_CODE}</span>
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {submitting ? '登录中...' : '登 录'}
                </Button>
              </form>
            </TabsContent>

            {/* 密码登录 */}
            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">手机号</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      maxLength={11}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="请输入手机号"
                      className="h-11 pl-9 rounded-lg bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">密码</Label>
                    <button type="button" className="text-xs text-primary hover:underline">忘记密码？</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="h-11 pl-9 pr-9 rounded-lg bg-background/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    测试账号：<span className="tabular-nums text-warning">{TEST_PHONE}</span> / 密码：
                    <span className="tabular-nums text-warning">{TEST_PASSWORD}</span>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {submitting ? '登录中...' : '登 录'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* 协议勾选 */}
          <div className="mt-4 flex items-start gap-2">
            <Checkbox id="agree" checked={agree} onCheckedChange={(c) => setAgree(c as boolean)} className="mt-0.5 size-4" />
            <label htmlFor="agree" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
              我已阅读并同意
              <a className="text-primary hover:underline mx-0.5">《用户协议》</a>
              和
              <a className="text-primary hover:underline mx-0.5">《隐私政策》</a>
            </label>
          </div>

          {/* 第三方登录 */}
          <div className="mt-6">
            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <span className="relative bg-card px-3 text-[11px] text-muted-foreground">其他登录方式</span>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleWechatLogin}
                className="flex items-center justify-center size-10 rounded-full bg-success/10 text-success hover:bg-success/20 transition-colors"
                aria-label="微信登录"
              >
                <MessageCircle className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 底部注册链接 */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          还没有账号？
          <Link to="/register" className="text-primary hover:underline font-medium ml-1 inline-flex items-center gap-1">
            立即注册
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
