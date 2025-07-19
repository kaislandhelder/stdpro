import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Mail, Eye, EyeOff, User, Building } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function LoginScreen({ playSound }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp, signIn } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Campos incompletos",
        description: "Por favor, preencha e-mail e senha.",
        variant: "destructive"
      });
      return;
    }
    if (isRegistering && (!displayName || !establishmentName)) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, informe seu nome e o nome do estabelecimento.",
        variant: "destructive"
      });
      return;
    }
    if (isRegistering && password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "Sua senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    playSound();

    if (isRegistering) {
      const { error } = await signUp(email, password, { 
        data: { 
          display_name: displayName,
          establishment_name: establishmentName,
        } 
      });
      if (!error) {
        toast({
          title: "🎉 Conta criada com sucesso!",
          description: "Verifique seu e-mail para confirmar sua conta.",
        });
        setIsRegistering(false);
      }
    } else {
      await signIn(email, password);
    }
    setIsLoading(false);
  };

  const handleForgotPin = () => {
    playSound();
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada",
      description: "Mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  return (
    <div className="min-h-screen gradient-bg-light flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <motion.div
            className="w-28 h-28 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center floating-animation shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-white font-serif font-bold text-6xl italic">S</span>
          </motion.div>
          
          <h1 className="text-5xl font-bold text-foreground mb-2">StudioGestor Pro</h1>
          <p className="text-lg text-primary font-medium">sua central de comando profissional</p>
        </div>

        <motion.div
          className="luxury-card rounded-2xl p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-semibold text-foreground mb-2">
              {isRegistering ? 'Crie sua Conta' : 'Acesse sua Conta'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isRegistering 
                ? 'Preencha seus dados para começar' 
                : 'Use seu e-mail e senha para entrar'
              }
            </p>
          </div>

          <div className="space-y-4 mb-6">
             {isRegistering && (
                <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full p-3 pl-10 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Seu nome profissional"
                  />
                </div>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                      type="text"
                      value={establishmentName}
                      onChange={(e) => setEstablishmentName(e.target.value)}
                      className="w-full p-3 pl-10 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Nome do seu estabelecimento"
                  />
                </div>
                </>
             )}
             <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="seu@email.com"
                />
            </div>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pl-10 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Sua senha (mínimo 6 caracteres)"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleAuth}
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 text-white font-semibold rounded-xl btn-sound text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isRegistering ? 'Criando...' : 'Entrando...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>{isRegistering ? 'Criar Conta' : 'Entrar'}</span>
                </div>
              )}
            </Button>

             <div className="text-center pt-2">
                <button
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        playSound();
                    }}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors btn-sound"
                >
                    {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Crie agora'}
                </button>
                {!isRegistering && (
                     <button
                        onClick={handleForgotPin}
                        className="w-full text-sm text-muted-foreground hover:text-primary transition-colors btn-sound pt-2"
                    >
                        Esqueci minha senha
                    </button>
                )}
            </div>

          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
