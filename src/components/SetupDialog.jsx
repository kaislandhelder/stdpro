
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Check, Sparkles, Plus, Building, User } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

const serviceData = {
  "Cabeleireiro(a)": ["Corte feminino", "Escova", "Hidratação", "Coloração", "Penteado para eventos"],
  "Barbeiro(a)": ["Corte masculino degradê (fade)", "Camuflagem de fios brancos", "Corte na máquina", "Barboterapia"],
  "Nail Designer": ["Alongamento de unhas em fibra", "Esmaltação em gel", "Nail art personalizada", "Blindagem", "Manutenção de alongamento"],
  "Depiladora": ["Depilação com cera pernas", "Depilação com cera axilas", "Depilação com cera buço", "Depilação íntima feminina", "Depilação facial com linha"],
  "Maquiador(a)": ["Maquiagem social", "Maquiagem noivas", "Maquiagem artística", "Maquiagem para fotos e vídeos", "Curso de automaquiagem"],
  "Designer de Sobrancelhas": ["Design com pinça", "Design com henna", "Sobrancelha egípcia com linha"],
  "Lash Designer (cílios)": ["Extensão de cílios fio a fio", "Volume russo", "Híbrido", "Lifting de cílios", "Remoção de extensão"],
  "Esteticista": ["Limpeza de pele profunda", "Peeling químico", "Revitalização facial", "Tratamento para acne", "Microagulhamento"],
  "Massoterapeuta": ["Massagem relaxante", "Massagem modeladora", "Drenagem linfática", "Reflexologia podal", "Shiatsu"],
  "Terapeuta Capilar": ["Detox capilar", "Terapia para queda de cabelo", "Terapia para oleosidade", "Terapia para caspa e dermatite", "Terapia de fortalecimento capilar com led ou ozônio"],
  "Visagista": ["Consultoria de imagem pessoal", "Recomendação personalizada de corte e cor", "Harmonização visual (cabelo + sobrancelha + estilo)"]
};

export default function SetupDialog({ isOpen, onOpenChange, onSetupComplete, playSound, profile, addLog }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [establishmentName, setEstablishmentName] = useState('');
  const [professionalName, setProfessionalName] = useState('');
  const [categories, setCategories] = useState(Object.keys(serviceData));
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [servicesByCat, setServicesByCat] = useState(serviceData);
  const [selectedServices, setSelectedServices] = useState([]);

  const [customCategory, setCustomCategory] = useState('');
  const [customService, setCustomService] = useState('');
  const [categoryForCustomService, setCategoryForCustomService] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && profile) {
      addLog('SetupDialog: Opened. Loading profile data.');
      setEstablishmentName(profile.establishment_name || '');
      setProfessionalName(profile.display_name || '');
      setSelectedCategories(profile.professional_categories || []);
    }
  }, [profile, isOpen, addLog]);

  const handleNextStep = () => {
    playSound();
    if(step === 1 && (!establishmentName || !professionalName)) {
      toast({ title: "Informações Incompletas", description: "Por favor, preencha o nome do salão e seu nome.", variant: "destructive" });
      return;
    }
    if (step === 2 && selectedCategories.length === 0) {
      toast({ title: "Selecione sua área", description: "Escolha pelo menos uma categoria para continuar.", variant: "destructive" });
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    playSound();
    setStep(step - 1);
  }

  const handleAddCustomCategory = () => {
    if (customCategory && !categories.includes(customCategory)) {
      setCategories([...categories, customCategory]);
      setSelectedCategories([...selectedCategories, customCategory]);
      setServicesByCat({...servicesByCat, [customCategory]: []});
      setCustomCategory('');
      playSound();
      toast({ title: "Categoria Adicionada!", description: `"${customCategory}" foi adicionada à sua lista.` });
    }
  };
  
  const handleAddCustomService = () => {
    if (customService && categoryForCustomService && !servicesByCat[categoryForCustomService].includes(customService)) {
      const updatedServices = {
        ...servicesByCat,
        [categoryForCustomService]: [...servicesByCat[categoryForCustomService], customService]
      };
      setServicesByCat(updatedServices);
      setSelectedServices([...selectedServices, customService]);
      setCustomService('');
      playSound();
      toast({ title: "Serviço Adicionado!", description: `"${customService}" foi adicionado a ${categoryForCustomService}.` });
    }
  };

  const toggleCategory = (category) => {
    playSound();
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };
  
  const toggleService = (serviceName) => {
    playSound();
    setSelectedServices(prev =>
      prev.includes(serviceName) ? prev.filter(s => s !== serviceName) : [...prev, serviceName]
    );
  };

  const handleCompleteSetup = async () => {
    if (selectedServices.length === 0 && step === 3) {
      toast({ title: "Selecione seus serviços", description: "Escolha pelo menos um serviço para finalizar.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    addLog('SetupDialog: Starting setup completion.');

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        establishment_name: establishmentName,
        display_name: professionalName,
        professional_categories: selectedCategories,
      })
      .eq('id', user.id);

    if (profileError) {
      addLog(`SetupDialog: Profile save error - ${profileError.message}`);
      toast({ title: "Erro ao salvar perfil", description: profileError.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }
    addLog('SetupDialog: Profile saved successfully.');

    if (step === 3) {
        const { error: deleteError } = await supabase.from('services').delete().eq('user_id', user.id);
        if (deleteError) {
            addLog(`SetupDialog: Could not clear old services - ${deleteError.message}`);
            toast({ title: "Aviso", description: "Não foi possível limpar serviços antigos, mas continuaremos.", variant: "default" });
        }

        const servicesToSave = selectedServices.map(name => ({
          user_id: user.id,
          name: name,
          value: 0, 
          category: Object.keys(servicesByCat).find(cat => servicesByCat[cat].includes(name)) || 'Personalizado'
        }));

        if (servicesToSave.length > 0) {
            const { error: servicesError } = await supabase.from('services').insert(servicesToSave);
            if (servicesError) {
              addLog(`SetupDialog: Services save error - ${servicesError.message}`);
              toast({ title: "Erro ao salvar serviços", description: servicesError.message, variant: "destructive" });
              setIsLoading(false);
              return;
            }
            addLog('SetupDialog: Services saved successfully.');
        }
    }
    
    playSound();
    onSetupComplete();
    setStep(1);
    setIsLoading(false);
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <>
            <DialogHeader>
                <DialogTitle className="flex items-center"><Sparkles className="mr-2 text-primary"/>Personalize sua área de trabalho</DialogTitle>
                <DialogDescription>Vamos começar pelo básico. Qual o nome do seu estabelecimento e seu nome profissional?</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input type="text" value={establishmentName} onChange={(e) => setEstablishmentName(e.target.value)} className="w-full p-3 pl-10 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="Nome do seu Salão/Estúdio" />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input type="text" value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} className="w-full p-3 pl-10 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="Seu nome profissional" />
              </div>
            </div>
            <DialogFooter>
                <Button onClick={handleNextStep}>Próximo</Button>
            </DialogFooter>
          </>
        );
      case 2:
        return (
            <>
            <DialogHeader>
                <DialogTitle>Com o que você trabalha?</DialogTitle>
                <DialogDescription>Selecione suas áreas de atuação. Isso ajudará a personalizar os serviços.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {categories.map(category => (
                  <motion.button key={category} onClick={() => toggleCategory(category)}
                    className={`relative p-3 rounded-lg text-left transition-all duration-300 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${selectedCategories.includes(category) ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80'}`}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {selectedCategories.includes(category) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5"><Check size={12} className="text-white" /></motion.div>}
                    <div className="text-sm font-bold">{category}</div>
                  </motion.button>
                ))}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4"><Plus className="mr-2" /> Adicionar Categoria</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Categoria</DialogTitle>
                  </DialogHeader>
                  <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full p-3 bg-input border border-border rounded-lg" placeholder="Ex: Tatuagem" />
                  <DialogFooter>
                    <DialogClose asChild><Button onClick={handleAddCustomCategory}>Adicionar</Button></DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={handlePrevStep}>Voltar</Button>
                <Button onClick={handleNextStep}>Próximo</Button>
            </DialogFooter>
          </>
        );
      case 3:
        return (
            <>
            <DialogHeader>
                <DialogTitle>Quais serviços você oferece?</DialogTitle>
                <DialogDescription>Selecione os serviços para um acesso rápido na agenda. Você poderá editar os valores depois.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
              {selectedCategories.map(category => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{category}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(servicesByCat[category] || []).map(serviceName => (
                      <motion.button key={serviceName} onClick={() => toggleService(serviceName)}
                        className={`relative p-3 rounded-lg text-left transition-all duration-300 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${selectedServices.includes(serviceName) ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted hover:bg-muted/80'}`}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        {selectedServices.includes(serviceName) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5"><Check size={12} className="text-white" /></motion.div>}
                        <div className="text-sm font-bold">{serviceName}</div>
                      </motion.button>
                    ))}
                     <Dialog>
                      <DialogTrigger asChild>
                        <motion.button onClick={() => setCategoryForCustomService(category)} className="p-3 rounded-lg bg-muted/50 border-2 border-dashed border-muted-foreground/30 hover:bg-muted text-muted-foreground flex items-center justify-center" whileHover={{ scale: 1.05 }}>
                          <Plus size={16} />
                        </motion.button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Novo Serviço para {categoryForCustomService}</DialogTitle>
                        </DialogHeader>
                        <input type="text" value={customService} onChange={(e) => setCustomService(e.target.value)} className="w-full p-3 bg-input border border-border rounded-lg" placeholder="Ex: Corte Bordado"/>
                        <DialogFooter>
                           <DialogClose asChild><Button onClick={handleAddCustomService}>Adicionar</Button></DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={handlePrevStep}>Voltar</Button>
                <Button onClick={handleCompleteSetup} disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Concluir e Salvar'}
                </Button>
            </DialogFooter>
          </>
        );
      default: return null;
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
            <motion.div key={step} initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} transition={{ duration: 0.3, ease: 'easeInOut' }}>
                {renderStepContent()}
            </motion.div>
        </DialogContent>
    </Dialog>
  );
}
