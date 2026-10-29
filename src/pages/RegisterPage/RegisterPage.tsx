import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Sparkles, Phone, MessageSquare, Lock, ArrowLeft, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { setUser, genId, formatDate, addPointRecord, getUser } from '@/lib/app-storage';
import { avatarImages, logger } from '@lark-apaas/client-toolkit-lite';
import type { IUser } from '@/data/types';

const DEMO_CODE = '123456';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    // 检查是否已注册
    const existing = getUser();
    if (existing && existing.phone === phone) {
      toast.error('该手机号已注册，请直接登录');
      return;
    }
    setCodeCountdown(60);
    logger.info(`[演示] 注册验证码：${DEMO_CODE}`);
    toast.info(`注册验证码已发送，演示验证码：${DEMO_CODE}`);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!phoneValid) errs.phone = '请输入正确的手机号';
    if (code.length !== 6) errs.code = '请输入6位验证码';
    if (password.length < 6 || password.length > 20) errs.password = '密码长度为6-20位';
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) errs.password = '密码需包含字母和数字';
    if (confirmPassword !== password) errs.confirmPassword = '两次密码不一致';
    if (!agree) errs.agree = '请同意用户协议和隐私政策';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));

    try {
      // 验证码校验
      if (code !== DEMO_CODE) {
        toast.error('验证码错误');
        return;
      }

      const defaultNickname = nickname.trim() || `琉衍用户${Math.floor(Math.random() * 9000 + 1000)}`;

      const user: IUser & { passwordHash?: string } = {
        id: genId('user_'),
        phone,
        nickname: defaultNickname,
        avatar: avatarImages.avatarImg1,
        role: 'user',
        points: 500,
        token: genId('tk_'),
        expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: formatDate(new Date()),
        passwordHash: password,
      };

      setUser(user);
      login(user);

      // 写入欢迎礼包积分记录
      addPointRecord({
        type: 'recharge',
        amount: 500,
        balance: 500,
        bizType: 'bonus',
        description: '新用户注册欢迎礼包',
        createdAt: formatDate(new Date()),
      });

      toast.success('注册成功，赠送 500 积分');
      setTimeout(() => navigate('/', { replace: true }), 500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 glass-bg-glow">
      <div className="w-full max-w-[420px]">
        {/* 返回 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          返回
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg mb-3">
            <Sparkles className="size-6 text-primary-foreground" />
          </div>
          <h1 className="font-['Noto_Serif_SC'] text-xl font-bold text-foreground tracking-wider">
            注册琉衍工坊账号
          </h1>
          <p className="text-xs text-muted-foreground mt-1.5">开启你的 AI 琉璃创作之旅</p>
        </div>

        {/* 注册卡片 */}
        <div className="bg-card rounded-2xl border border-border shadow-lg p-6 md:p-7 glass-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">手机号 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="tel"
                  maxLength={11}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, phone: '' })); }}
                  placeholder="请输入手机号"
                  className={`h-10 pl-9 rounded-lg bg-background/50 ${errors.phone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">验证码 <span className="text-destructive">*</span></Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setErrors(p => ({ ...p, code: '' })); }}
                    placeholder="6位验证码"
                    className={`h-10 pl-9 rounded-lg bg-background/50 ${errors.code ? 'border-destructive' : ''}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSendCode}
                  disabled={codeCountdown > 0 || !phoneValid}
                  className="h-10 px-3 rounded-lg whitespace-nowrap text-xs"
                >
                  {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                </Button>
              </div>
              {errors.code && <p className="text-[11px] text-destructive">{errors.code}</p>}
              <p className="text-[11px] text-muted-foreground">
                演示验证码：<span className="text-warning font-medium">{DEMO_CODE}</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">设置密码 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                  placeholder="6-20位，包含字母和数字"
                  className={`h-10 pl-9 pr-9 rounded-lg bg-background/50 ${errors.password ? 'border-destructive' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">确认密码 <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })); }}
                  placeholder="请再次输入密码"
                  className={`h-10 pl-9 rounded-lg bg-background/50 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-[11px] text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">昵称（可选）</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  maxLength={12}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="默认：琉衍用户+随机4位数字"
                  className="h-10 pl-9 rounded-lg bg-background/50"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="agree"
                checked={agree}
                onCheckedChange={(c) => { setAgree(c as boolean); setErrors(p => ({ ...p, agree: '' })); }}
                className="mt-0.5 size-4"
              />
              <label htmlFor="agree" className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer">
                我已阅读并同意
                <a className="text-primary hover:underline mx-0.5">《用户协议》</a>
                和
                <a className="text-primary hover:underline mx-0.5">《隐私政策》</a>
              </label>
            </div>
            {errors.agree && <p className="text-[11px] text-destructive -mt-2">{errors.agree}</p>}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-2"
            >
              {submitting ? '注册中...' : '注 册'}
            </Button>
          </form>
        </div>

        {/* 底部登录链接 */}
        <div className="mt-5 text-center text-sm text-muted-foreground">
          已有账号？
          <Link to="/login" className="text-primary hover:underline font-medium ml-1 inline-flex items-center gap-1">
            去登录
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
