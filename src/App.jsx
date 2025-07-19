import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';
import Agenda from '@/components/Agenda';
import Clientes from '@/components/Clientes';
import Financeiro from '@/components/Financeiro';
import Subscription from '@/components/Subscription';
import Settings from '@/components/Settings';
import Funcionarios from '@/components/Funcionarios';
import Debug from '@/components/Debug';
import { useToast } from '@/components/ui/use-toast';
import { Home, Calendar, Users, DollarSign, LogOut, CreditCard, Settings as SettingsIcon, AlertTriangle, Moon, Sun, Users2, Bug } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import Cookies from 'js-cookie';

function App() {
  const { session, user, signOut, loading, profile, refreshProfile } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { toast } = useToast();
  const [daysLeft, setDaysLeft] = useState(null);
  const [trialEndDate, setTrialEndDate] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs]);
  };

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    if (newIsDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('studiogestor_theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('studiogestor_theme_mode', 'light');
    }
    playSound();
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('studiogestor_theme_mode');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      setIsDarkMode(true);
    }

    const savedColorScheme = localStorage.getItem('studiogestor_color_scheme');
    if (savedColorScheme) {
      document.documentElement.setAttribute('data-theme', savedColorScheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'default');
    }
  }, []);

  useEffect(() => {
    if (loading || !session || !profile) return;
    
    if (profile.subscription_plan === 'trial' && profile.trial_ends_at) {
        const endDate = new Date(profile.trial_ends_at);
        setTrialEndDate(endDate.toLocaleDateString('pt-BR'));
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysLeft(diffDays > 0 ? diffDays : 0);
        if (diffDays <= 0) {
            if (currentView !== 'subscription' && currentView !== 'settings') {
                setCurrentView('subscription');
            }
        }
    } else {
        setDaysLeft(null);
        setTrialEndDate(null);
    }

    if (profile.first_login) {
        const updateFirstLogin = async () => {
            await supabase
              .from('profiles')
              .update({ first_login: false })
              .eq('id', user.id);
            addLog('First login flag set to false.');
        };
        updateFirstLogin();
    }

    const updateLastSignIn = async () => {
        await supabase
          .from('profiles')
          .update({ last_sign_in_at: new Date().toISOString() })
          .eq('id', user.id);
    };
    updateLastSignIn();

  }, [session, profile, loading, currentView, user]);


  const handleLogout = async () => {
    await signOut();
    const allCookies = Cookies.get();
    for (let cookie in allCookies) {
      if (cookie.startsWith('sb-')) {
        Cookies.remove(cookie, { path: '/' });
      }
    }
    setCurrentView('dashboard');
    toast({
      title: "Até logo! 👋",
      description: "Sua sessão foi encerrada com segurança.",
    });
  };

  const handleColorSchemeChange = (scheme) => {
    document.documentElement.setAttribute('data-theme', scheme);
    localStorage.setItem('studiogestor_color_scheme', scheme);
    playSound();
  };

  const playSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Fallback
    }
  };

  const renderCurrentView = () => {
    const props = { playSound, setCurrentView, profile, refreshProfile, addLog };
    
    if (daysLeft !== null && daysLeft <= 0 && !['subscription', 'settings', 'debug'].includes(currentView)) {
        return <Subscription {...props} isBlocked={true} />;
    }

    switch (currentView) {
      case 'agenda':
        return <Agenda {...props} />;
      case 'clientes':
        return <Clientes {...props} />;
      case 'financeiro':
        return <Financeiro {...props} />;
      case 'subscription':
        return <Subscription {...props} daysLeft={daysLeft} trialEndDate={trialEndDate} />;
      case 'settings':
        return <Settings {...props} onColorSchemeChange={handleColorSchemeChange} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
      case 'funcionarios':
        return <Funcionarios {...props} />;
      case 'debug':
        return <Debug profile={profile} logs={logs} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <Helmet>
          <title>StudioGestor Pro - Sua central de comando profissional</title>
          <meta name="description" content="Gerencie seu estúdio ou salão com a ferramenta definitiva para profissionais da beleza." />
        </Helmet>
        <LoginScreen playSound={playSound} />
      </>
    );
  }

  const navItems = [
    { key: 'dashboard', icon: Home, label: 'Início' },
    { key: 'agenda', icon: Calendar, label: 'Agenda' },
    { key: 'clientes', icon: Users, label: 'Clientes' },
    { key: 'financeiro', icon: DollarSign, label: 'Financeiro' },
    { key: 'settings', icon: SettingsIcon, label: 'Ajustes' },
    { key: 'subscription', icon: CreditCard, label: 'Assinatura'}
  ];

  if (profile?.subscription_plan === 'team') {
    const settingsIndex = navItems.findIndex(item => item.key === 'settings');
    navItems.splice(settingsIndex + 1, 0, { key: 'funcionarios', icon: Users2, label: 'Equipe' });
  }
  
  navItems.push({ key: 'debug', icon: Bug, label: 'Debug' });

  return (
    <>
      <Helmet>
        <title>StudioGestor Pro - {profile?.establishment_name || 'Dashboard'}</title>
        <meta name="description" content="Dashboard do StudioGestor Pro - Gerencie seu negócio de forma intuitiva e eficiente." />
      </Helmet>
      
      <div className={`min-h-screen text-foreground bg-background`}>
        <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{profile?.establishment_name || 'Carregando...'}</h1>
                <p className="text-xs text-muted-foreground">Bem-vindo(a), {profile?.display_name || 'Usuário'}!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
               <button onClick={toggleTheme} className="p-2 rounded-full bg-muted hover:bg-border transition-colors btn-sound">
                  {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-foreground" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-muted hover:bg-border transition-colors btn-sound"
              >
                <LogOut className="w-5 h-5 text-destructive" />
              </button>
            </div>
          </div>
          {daysLeft !== null && daysLeft > 0 && (
            <div className="bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 text-center p-2 text-sm font-semibold flex items-center justify-center">
              <AlertTriangle size={16} className="mr-2" />
              Você tem {daysLeft} {daysLeft === 1 ? 'dia restante' : 'dias restantes'} de teste (expira em {trialEndDate}).
              <Button onClick={() => setCurrentView('subscription')} variant="link" className="text-yellow-700 dark:text-yellow-300 h-auto p-0 ml-2 font-bold">Ver planos</Button>
            </div>
          )}
        </header>

        <main className="pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border z-50">
            <div className="flex justify-around items-center py-2">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setCurrentView(item.key);
                    playSound();
                  }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all btn-sound w-16 ${
                    currentView === item.key 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <item.icon className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
      </div>
    </>
  );
}

export default App;