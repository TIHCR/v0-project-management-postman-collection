'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Loader2,
  LayoutGrid,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Por favor, insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const floatingCardVariants = {
  initial: { opacity: 0, y: 16, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 0.61, 0.36, 1],
    },
  },
};

const floatTransition = {
  repeat: Infinity,
  repeatType: 'reverse' as const,
  duration: 4,
  ease: 'easeInOut',
};

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 lg:flex-row">

      {/* LEFT: Auth form */}
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2 lg:px-12 xl:px-20 2xl:px-28">
        <div className="w-full max-w-lg">

          {/* Logo / brand */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-slate-900">
                Flowboard
              </p>
              <p className="text-xs text-slate-500">
                Workspace for modern product teams
              </p>
            </div>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Card className="border border-slate-100 bg-white shadow-2xl shadow-slate-900/8 rounded-2xl overflow-hidden">

              {/* Top accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />

              <CardHeader className="px-8 pt-8 pb-0 space-y-2">
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
                  Bem-vindo de volta 👋
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 leading-relaxed">
                  Faça login no seu Flowboard para manter seus quadros e tarefas sincronizados com o seu time.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <CardContent className="px-8 pt-7 pb-0 space-y-6">

                  {/* Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-100" />
                    <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                      continue com seu e-mail
                    </span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-slate-700"
                    >
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="voce@email.com"
                      autoComplete="email"
                      className="h-12 rounded-xl border-slate-200 bg-slate-50/70 text-sm shadow-sm transition-all duration-200 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 placeholder:text-slate-400"
                      {...register('email')}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="email-error"
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Senha
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pr-12 text-sm shadow-sm transition-all duration-200 hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 placeholder:text-slate-400"
                        {...register('password')}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700 transition-colors focus-visible:outline-none"
                        aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                      >
                        {showPassword
                          ? <EyeOff className="h-4 w-4" />
                          : <Eye className="h-4 w-4" />
                        }
                      </button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="password-error"
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        <span className="inline-block h-1 w-1 rounded-full bg-red-500" />
                        {errors.password.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center gap-2.5">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none">
                      Manter-me conectado
                    </label>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 px-8 pt-6 pb-8">
                  {/* Submit */}
                  <Button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-500 to-cyan-400 h-12 text-sm font-semibold text-white shadow-lg shadow-blue-500/35 transition-all duration-200 hover:brightness-110 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:translate-y-0"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar na minha conta
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {/* Trust badges */}
                  <div className="flex items-center justify-center gap-4 pt-1">
                    {[
                      'SSO seguro',
                      'Criptografia E2E',
                      'Sem anúncios',
                    ].map((item) => (
                      <span key={item} className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Sparkles className="h-2.5 w-2.5 text-blue-400" />
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-slate-100" />

                  <p className="text-center text-sm text-slate-500">
                    Não tem uma conta?{' '}
                    <Link
                      href="/register"
                      className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Criar conta grátis
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </motion.div>

          {/* Small footer text */}
          <p className="mt-6 text-center text-[11px] text-slate-400">
            Ao continuar, você concorda com nossos{' '}
            <Link href="/legal/terms" className="underline underline-offset-2 hover:text-slate-600">
              Termos
            </Link>{' '}
            e{' '}
            <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-slate-600">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>

      {/* RIGHT: Visual area (hidden on mobile) */}
      <div className="relative hidden flex-1 overflow-hidden bg-slate-950 lg:block">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-500 to-cyan-400" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_55%)]" />

        {/* Overlay content */}
        <div className="relative flex h-full items-center justify-center px-10 py-8">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
              className="mb-8 space-y-3 text-slate-50"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/80">
                Workflow OS for teams
              </p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                Transforme tarefas dispersas em um fluxo de trabalho alinhado.
              </h2>
              <p className="max-w-md text-sm text-blue-50/80">
                Crie workspaces, boards e automações que mantêm sua equipe focada no que importa — não em correr atrás de atualizações.
              </p>
            </motion.div>

            {/* Floating board / cards mockup */}
            <div className="relative h-64">
              <motion.div
                variants={floatingCardVariants}
                initial="initial"
                animate="animate"
                className="absolute inset-x-0 top-4 mx-auto w-full max-w-md rounded-2xl border border-white/15 bg-slate-950/40 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-lg"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/90 text-xs font-semibold text-white">
                      FB
                    </span>
                    <div>
                      <p className="text-xs font-medium text-slate-50">
                        Marketing launch board
                      </p>
                      <p className="text-[11px] text-blue-100/70">
                        Workspace · Q2 launch
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
                    Live
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2 text-[11px] font-medium text-blue-100/80">
                    <span className="flex-1 truncate rounded-md bg-slate-950/60 px-2 py-1">Sprint</span>
                    <span className="w-20 rounded-md bg-slate-950/60 px-2 py-1 text-center">Owner</span>
                    <span className="w-20 rounded-md bg-slate-950/60 px-2 py-1 text-center">Status</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { title: 'Launch landing page', owner: 'Design', status: 'In progress', color: 'bg-amber-400/15 text-amber-200 border-amber-300/60' },
                      { title: 'Set up workspace automations', owner: 'Ops', status: 'Planned', color: 'bg-sky-400/15 text-sky-200 border-sky-300/60' },
                      { title: 'Team onboarding sessions', owner: 'People', status: 'Done', color: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/60' },
                    ].map((item) => (
                      <div key={item.title} className="flex items-center gap-2 rounded-xl bg-slate-950/40 px-2.5 py-1.5 text-[11px] text-blue-50/90">
                        <span className="flex-1 truncate">{item.title}</span>
                        <span className="w-20 truncate text-center text-[10px] text-slate-300/90">{item.owner}</span>
                        <span className={`inline-flex w-20 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${item.color}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating insight card 1 */}
              <motion.div initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>
                <motion.div animate={{ y: [-6, 6, -6] }} transition={floatTransition} className="absolute -left-2 bottom-6 w-40 rounded-2xl border border-white/20 bg-white/10 p-3 text-[11px] text-slate-50 shadow-xl shadow-slate-950/40 backdrop-blur-xl">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-blue-100/80">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    Team focus
                  </div>
                  <p className="text-[11px] text-blue-50/90">87% of tasks are aligned with Q2 objectives.</p>
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-200">
                    <CheckCircle2 className="h-3 w-3" />
                    Healthy pipeline
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating insight card 2 */}
              <motion.div initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.5, duration: 0.8 }}>
                <motion.div animate={{ y: [8, -8, 8] }} transition={{ ...floatTransition, duration: 5.5 }} className="absolute -right-1 top-6 w-36 rounded-2xl border border-white/20 bg-white/10 p-3 text-[11px] text-slate-50 shadow-xl shadow-slate-950/40 backdrop-blur-xl">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-blue-100/80">Automation</p>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-lg font-semibold text-white">32</span>
                    <span className="text-[10px] text-blue-100/70">active rules</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-900/60">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-400" />
                  </div>
                  <p className="mt-1 text-[10px] text-blue-50/80">Repetitive updates are handled automatically.</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}