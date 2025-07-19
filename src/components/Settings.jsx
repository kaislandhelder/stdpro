import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Palette, Wrench, User, Tag, Moon, Sun, Edit } from 'lucide-react';
import SeusServicos from './SeusServicos';
import SetupDialog from './SetupDialog';

const ColorOption = ({ color, scheme, currentScheme, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full p-2 rounded-lg border-2 transition-all ${
      currentScheme === scheme ? 'border-primary scale-105' : 'border-transparent'
    }`}
  >
    <div className={`h-10 w-full rounded-md ${color}`}></div>
  </button>
);

const ProfileSettings = ({ profile, setShowSetupDialog }) => {
  return (
    <div className="luxury-card rounded-xl p-6 space-y-6">
      <h3 className="text-2xl font-semibold text-foreground mb-3 flex items-center">
        <User className="mr-3 text-primary" size={24} />
        Perfil
      </h3>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Seu Nome Profissional</label>
        <p className="text-lg font-semibold text-foreground p-3 bg-input border border-border rounded-lg">
          {profile?.display_name || 'Não definido'}
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1">Nome do Estabelecimento</label>
        <p className="text-lg font-semibold text-foreground p-3 bg-input border border-border rounded-lg">
          {profile?.establishment_name || 'Não definido'}
        </p>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="text-lg font-semibold text-foreground mb-2">Suas Categorias</h4>
        <div className="p-3 bg-input border border-border rounded-lg min-h-[40px]">
          {(profile?.professional_categories && profile.professional_categories.length > 0) ? (
            <div className="flex flex-wrap gap-2">
              {profile.professional_categories.map(cat => (
                  <div key={cat} className="bg-muted text-muted-foreground font-medium px-3 py-1 rounded-full text-sm">{cat}</div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Você ainda não completou seu perfil. Clique abaixo para começar.</p>
          )}
        </div>
         <Button onClick={() => setShowSetupDialog(true)} className="w-full mt-4" variant="outline">
            <Edit className="mr-2" size={16} /> Alterar Perfil e Serviços
        </Button>
      </div>
    </div>
  );
};


const AppearanceSettings = ({ onColorSchemeChange, toggleTheme, isDarkMode }) => {
    const [currentScheme, setCurrentScheme] = useState('default');

    useEffect(() => {
        const savedScheme = localStorage.getItem('studiogestor_color_scheme') || 'default';
        setCurrentScheme(savedScheme);
    }, []);

    const handleSchemeChange = (scheme) => {
        setCurrentScheme(scheme);
        onColorSchemeChange(scheme);
    };
    
    return (
        <div className="luxury-card rounded-xl p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Palette className="mr-2 text-primary" /> Paleta de Cores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorOption color="bg-gradient-to-br from-violet-500 to-purple-600" scheme="default" currentScheme={currentScheme} onClick={() => handleSchemeChange('default')} />
                <ColorOption color="bg-gradient-to-br from-pink-400 to-fuchsia-500" scheme="pink" currentScheme={currentScheme} onClick={() => handleSchemeChange('pink')} />
                <ColorOption color="bg-gradient-to-br from-blue-400 to-indigo-500" scheme="blue" currentScheme={currentScheme} onClick={() => handleSchemeChange('blue')} />
                <ColorOption color="bg-gradient-to-br from-green-400 to-emerald-500" scheme="green" currentScheme={currentScheme} onClick={() => handleSchemeChange('green')} />
              </div>
            </div>

            <div className="border-t border-border pt-6">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                    <Sun className="mr-2 text-primary" /><Moon className="mr-3 text-primary" /> Tema da Interface
                </h3>
                <div className="flex gap-4">
                    <Button onClick={() => !isDarkMode && toggleTheme()} variant={isDarkMode ? 'default' : 'outline'} className="w-full">
                        <Moon className="mr-2" /> Escuro
                    </Button>
                    <Button onClick={() => isDarkMode && toggleTheme()} variant={!isDarkMode ? 'default' : 'outline'} className="w-full">
                        <Sun className="mr-2" /> Claro
                    </Button>
                </div>
            </div>
      </div>
    )
}

export default function Settings({ playSound, onColorSchemeChange, profile, refreshProfile, toggleTheme, isDarkMode, addLog }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const { toast } = useToast();

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'services', label: 'Serviços', icon: Tag },
    { id: 'appearance', label: 'Aparência', icon: Palette },
  ];

  const handleSetupComplete = async () => {
    setShowSetupDialog(false);
    await refreshProfile();
    toast({
        title: "🎉 Perfil Atualizado!",
        description: "Suas configurações foram salvas com sucesso!",
    });
  }

  const renderContent = () => {
    switch(activeTab) {
        case 'profile':
            return <ProfileSettings profile={profile} setShowSetupDialog={setShowSetupDialog} />;
        case 'services':
            return (
                <div className="luxury-card rounded-xl p-6">
                    <SeusServicos playSound={playSound} isEditingMode={true} addLog={addLog} />
                </div>
            );
        case 'appearance':
            return <AppearanceSettings onColorSchemeChange={onColorSchemeChange} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
        default:
            return null;
    }
  }

  return (
    <>
    <motion.div
      className="p-4 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground flex items-center">
          <Wrench className="mr-3 text-primary" size={28} />
          Ajustes
        </h2>
      </div>

      <div className="border-b border-border overflow-x-auto">
        <div className="flex space-x-2">
          {tabs.map(tab => (
            <Button 
                key={tab.id}
                variant="ghost" 
                onClick={() => setActiveTab(tab.id)} 
                className={`flex-shrink-0 font-semibold px-4 py-2 rounded-t-lg border-b-2 ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            >
                <tab.icon className="mr-2" size={16} />
                {tab.label}
            </Button>
          ))}
        </div>
      </div>
      
      {renderContent()}

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