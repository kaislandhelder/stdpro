import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowRight, Gift, User, Wallet, Eye, EyeOff, Wand2, PartyPopper } from 'lucide-react';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SetupDialog from '@/components/SetupDialog';
import { supabase } from '@/lib/customSupabaseClient';

export default function Dashboard({ setCurrentView, playSound, profile, refreshProfile, addLog }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState({
    ganhosHoje: 0,
    clientesAtendidos: 0,
    aniversariantes: []
  });
  const [showValues, setShowValues] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showFirstLoginWelcome, setShowFirstLoginWelcome] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user || !profile) {
        setLoading(false);
        return;
    };
    setLoading(true);
    if (addLog) addLog('Dashboard: Loading data...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString().split('T')[0];
    
    const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('total_value, status')
      .eq('user_id', user.id)
      .eq('appointment_date', todayISO);

    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('name, phone, birth_date')
      .eq('user_id', user.id);

    if (appointmentsError || clientsError) {
      if (addLog) addLog(`Dashboard Error: ${appointmentsError?.message || clientsError?.message}`);
      toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar as informações do dashboard.", variant: "destructive" });
    } else {
      const ganhosHoje = appointments
        .filter(a => a.status === 'present')
        .reduce((acc, curr) => acc + (curr.total_value || 0), 0);
      
      const clientesAtendidos = appointments.filter(a => a.status === 'present').length;
      
      const aniversariantes = clients.filter(c => c.birth_date && c.birth_date.substring(5) === todayMonthDay);

      setDashboardData({ ganhosHoje, clientesAtendidos, aniversariantes });
      if (addLog) addLog('Dashboard: Data loaded successfully.');
    }

    setLoading(false);
  }, [user, profile, toast, addLog]);

  useEffect(() => {
    loadDashboardData();
    if (profile?.first_login) {
      setShowFirstLoginWelcome(true);
    }
  }, [loadDashboardData, profile]);

  const sendBirthdayMessage = async (cliente) => {
    playSound();
    const establishmentName = profile?.establishment_name || "nosso estúdio";
    const message = `🎉 Feliz Aniversário, ${cliente.name}!\nQue seu novo ciclo venha com muita saúde, conquistas e bons momentos! ✨\n\nCom carinho,\n${establishmentName}`;
    
    const success = await sendWhatsAppMessage(cliente.phone, message);
    if (success) {
      toast({
        title: `🎂 Mensagem enviada para ${cliente.name}!`,
        description: "Parabéns enviado via WhatsApp!",
      });
    }
  };

  const toggleShowValues = () => {
    setShowValues(!showValues);
    playSound();
  };
  
  const handleSetupComplete = async () => {
    setShowSetupDialog(false);
    await refreshProfile();
    toast({
        title: "🎉 Tudo pronto!",
        description: "Suas configurações foram salvas com sucesso!",
    });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading && !profile) {
    return <div className="flex justify-center items-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  const formatLastSignIn = (dateString) => {
    if (!dateString) return "data indisponível";
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
    <motion.div 
      className="p-4 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="text-center mb-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Bem-vindo(a), {profile?.display_name || 'Usuário'}!
        </h2>
        {showFirstLoginWelcome ? (
            <div className="bg-primary/10 text-primary p-3 rounded-lg max-w-2xl mx-auto">
                <p className="font-semibold flex items-center justify-center"><PartyPopper className="mr-2"/>Seja muito bem-vindo(a), este é seu primeiro acesso!</p>
                <p className="text-sm mt-1">Vamos configurar seu perfil para começar com tudo?</p>
                <Button onClick={() => setShowSetupDialog(true)} size="sm" className="mt-2">
                    <Wand2 className="mr-2" size={16} /> Iniciar Configuração
                </Button>
            </div>
        ) : (
            <p className="text-muted-foreground text-sm md:text-base">
                Seu último login foi em: {formatLastSignIn(profile?.last_sign_in_at)}
            </p>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
        <div className="luxury-card rounded-xl p-4 text-center flex flex-col justify-center items-center">
          <Wallet size={32} className="text-green-500 mb-2" />
          <h3 className="font-semibold text-muted-foreground text-sm">Ganhos do Dia</h3>
          <p className="text-3xl font-bold text-green-500">
            {showValues ? `R$ ${dashboardData.ganhosHoje.toFixed(2)}` : '••••'}
          </p>
        </div>

        <div className="luxury-card rounded-xl p-4 text-center flex flex-col justify-center items-center">
          <User size={32} className="text-blue-500 mb-2" />
          <h3 className="font-semibold text-muted-foreground text-sm">Clientes Atendidos</h3>
          <p className="text-3xl font-bold text-blue-500">
            {showValues ? dashboardData.clientesAtendidos : '•'}
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-center">
        <Button onClick={toggleShowValues} variant="outline" className="btn-sound">
          {showValues ? <EyeOff className="mr-2" size={16} /> : <Eye className="mr-2" size={16} />}
          {showValues ? 'Ocultar' : 'Mostrar'}
        </Button>
      </motion.div>

      {dashboardData.aniversariantes.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="luxury-card rounded-xl p-4"
        >
          <h3 className="text-2xl font-semibold text-foreground mb-3 flex items-center">
            <Gift className="text-primary mr-3" size={24} />
            Aniversariantes do Dia
          </h3>
          <div className="space-y-3">
            {dashboardData.aniversariantes.map((cliente, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-background rounded-lg">
                <div>
                  <p className="font-medium text-foreground">{cliente.name}</p>
                  <p className="text-sm text-muted-foreground">Faz aniversário hoje!</p>
                </div>
                <Button
                  onClick={() => sendBirthdayMessage(cliente)}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white btn-sound"
                >
                  Enviar Parabéns <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
    
    <SetupDialog 
        isOpen={showSetupDialog} 
        onOpenChange={setShowSetupDialog} 
        onSetupComplete={handleSetupComplete}
        playSound={playSound}
        profile={profile}
        addLog={addLog}
    />
    </>
  );
}