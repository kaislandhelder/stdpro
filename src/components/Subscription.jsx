import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, CheckCircle, Star, CreditCard, ShieldCheck, Lock, Users, PartyPopper } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const PlanCard = ({ title, description, price, features, buttonText, buttonIcon: ButtonIcon, onClick, popular = false }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className={`luxury-card rounded-2xl p-8 text-center flex flex-col ${popular ? 'border-2 border-primary/50' : ''}`}
  >
    <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${popular ? 'from-green-500 to-emerald-600' : 'from-primary to-secondary'} rounded-full flex items-center justify-center`}>
      {ButtonIcon && <ButtonIcon className="text-white" size={40} />}
    </div>
    <h3 className="text-4xl font-bold text-foreground mb-2">{title}</h3>
    <p className="text-lg text-muted-foreground mb-6 flex-grow">{description}</p>

    <div className="text-left space-y-3 mb-8">
      {features.map((feature, i) => (
        <div key={i} className="flex items-center"><CheckCircle className="text-green-500 mr-3" size={20} /><span>{feature}</span></div>
      ))}
    </div>

    <div className="bg-background/50 rounded-xl p-4 mb-8 mt-auto">
      <p className="text-5xl font-bold text-foreground my-2">{price.main}<span className="text-3xl align-top">{price.cents}</span></p>
      <p className="text-muted-foreground">/mês</p>
    </div>

    <Button onClick={onClick} className={`w-full h-14 ${popular ? 'bg-green-600 hover:bg-green-700' : 'bg-primary'} text-white font-semibold rounded-xl btn-sound text-lg`}>
      {ButtonIcon && <ButtonIcon className="mr-2" size={20} />} {buttonText}
    </Button>
  </motion.div>
);

export default function Subscription({ setCurrentView, playSound, isBlocked = false, daysLeft, trialEndDate }) {
  const { toast } = useToast();
  const { profile, user, refreshProfile } = useAuth();

  const handleSubscribe = async (plan) => {
    playSound();
    
    // Auto change subscription plan for testing
    const planMapping = {
      'Individual': 'individual',
      'Equipe': 'team'
    };
    
    const subscriptionPlan = planMapping[plan];
    
    if (user && subscriptionPlan) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_plan: subscriptionPlan,
          trial_ends_at: null // Remove trial end date when subscribing
        })
        .eq('id', user.id);
      
      if (error) {
        toast({
          title: "Erro ao atualizar plano",
          description: error.message,
          variant: "destructive"
        });
      } else {
        await refreshProfile(user.id);
        toast({
          title: "✅ Plano atualizado!",
          description: `Você agora está no ${plan === 'Individual' ? 'Plano Individual' : 'Plano Equipe'}.`,
        });
      }
    }
  };

  const plans = [
    {
      title: "Plano Individual",
      description: "Ideal para profissionais autônomos.",
      price: { main: "R$37", cents: ",90" },
      features: ["1 Login", "Agenda Inteligente", "Controle Financeiro", "Gestão de Clientes"],
      buttonText: "Assinar Plano",
      buttonIcon: CreditCard,
      onClick: () => handleSubscribe('Individual'),
    },
    {
      title: "Plano Equipe",
      description: "Perfeito para salões com múltiplos profissionais.",
      price: { main: "R$57", cents: ",90" },
      features: ["1 Login Principal", "Até 5 logins para funcionários", "Todos os benefícios do Plano Individual", "Controle de permissões"],
      buttonText: "Assinar Plano Equipe",
      buttonIcon: Users,
      onClick: () => handleSubscribe('Equipe'),
      popular: true,
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Nossos Planos</h2>
        {!isBlocked && (
          <Button onClick={() => setCurrentView('dashboard')} variant="ghost" size="sm" className="btn-sound">
            <ArrowLeft className="mr-2" size={16} /> Voltar
          </Button>
        )}
      </div>

      {isBlocked && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 mb-6 text-center">
            <Lock size={24} className="mx-auto mb-2" />
            <h3 className="font-bold">Seu período de testes expirou!</h3>
            <p className="text-sm">Para continuar a gerenciar seu negócio com o StudioGestor Pro, por favor, escolha um dos nossos planos. Estamos aqui para ajudar seu sucesso a continuar! ✨</p>
        </div>
      )}

      {profile?.subscription_plan === 'trial' && (
        <div className="luxury-card rounded-xl p-6 mb-8">
          <h3 className="text-2xl font-semibold text-foreground mb-3 flex items-center">
            <PartyPopper className="text-primary mr-3" size={24} />
            Plano Trial Ativo
          </h3>
          <p className="text-muted-foreground mb-4">
            Este é um plano cortesia para você conhecer todas as funcionalidades incríveis do nosso app. Explore tudo sem compromisso!
          </p>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <p className="text-sm text-muted-foreground">Sua assinatura de teste se encerra em:</p>
            <p className="font-bold text-lg text-primary">{trialEndDate || 'Calculando...'}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <PlanCard {...plans[0]} />
        <PlanCard {...plans[1]} />
      </div>
    </motion.div>
  );
}