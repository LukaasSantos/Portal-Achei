'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { KeyRound, Mail, User, AlertCircle, CheckCircle2, ArrowRight, Calendar } from 'lucide-react';

export default function LoginPage() {
  const { user, login, register, loading } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (!isLogin && !name) {
      setError('Por favor, preencha seu nome.');
      return;
    }

    try {
      if (isLogin) {
        const ok = await login(email, password);
        if (ok) {
          router.push('/dashboard');
        } else {
          setError('E-mail ou senha incorretos.');
        }
      } else {
        const ok = await register(name, email, password);
        if (ok) {
          setSuccess('Conta criada com sucesso! Redirecionando...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          setError('Este e-mail já está cadastrado.');
        }
      }
    } catch (err) {
      setError('Ocorreu um erro. Tente novamente.');
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLogin(true);
    setError(null);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-[#121214] via-[#1c1c20] to-[#121214] relative overflow-hidden">
      
      {/* Background design elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-800/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-800/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl mb-3 shadow-inner">
            <Calendar className="w-6 h-6 text-zinc-300" />
            <span className="text-2xl font-black tracking-tight text-white">
              Portal<span className="text-zinc-400">.Achei</span>
            </span>
          </div>
          <p className="text-sm text-zinc-400">Agência de Marketing e Conexões</p>
        </div>

        {/* Auth Card */}
        <Card className="border border-zinc-800 bg-zinc-900/60 backdrop-blur-md shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-white text-center">
              {isLogin ? 'Acessar o portal' : 'Criar nova conta'}
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
              {isLogin 
                ? 'Insira suas credenciais abaixo para entrar no sistema' 
                : 'Cadastre-se como colaborador da agência'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              
              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-200 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Alert */}
              {success && (
                <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-lg text-emerald-200 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{success}</span>
                </div>
              )}

              {/* Name Field (Register Only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      type="text"
                      className="pl-10 bg-zinc-950/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700 focus:ring-0"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">E-mail Corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email"
                    placeholder="exemplo@portalachei.com"
                    type="email"
                    className="pl-10 bg-zinc-950/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700 focus:ring-0"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Senha</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    className="pl-10 bg-zinc-950/50 border-zinc-800 text-white placeholder-zinc-500 focus:border-zinc-700 focus:ring-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold"
                disabled={loading}
              >
                {loading ? 'Aguarde...' : isLogin ? 'Entrar no Sistema' : 'Cadastrar'}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-zinc-400 hover:text-white underline transition"
                >
                  {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials Box */}
        <div className="mt-8 p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 text-center">
            Acesso de Demonstração (Clique para preencher)
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleFillDemo('lucas.tas@live.com', 'lucas123')}
              className="flex items-center justify-between p-2.5 bg-zinc-900/50 hover:bg-zinc-800/40 border border-zinc-800 rounded-lg text-left transition group text-xs"
            >
              <div className="overflow-hidden">
                <p className="font-medium text-zinc-300 truncate">Lucas Tas (Admin)</p>
                <p className="text-[10px] text-zinc-500 truncate">lucas.tas@live.com</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
