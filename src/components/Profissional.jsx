import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { User, Star, Save, Plus, Trash2 } from 'lucide-react';

export default function Profissional({ playSound, userData }) {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ nome: '', valor: '' });
  const { toast } = useToast();

  useEffect(() => {
    const professionalServices = localStorage.getItem(`services_${userData.name}`);
    if (professionalServices) {
      setServices(JSON.parse(professionalServices));
    }
  }, [userData.name]);

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    updatedServices[index][field] = value;
    setServices(updatedServices);
  };

  const handleAddNewService = () => {
    if (newService.nome && newService.valor) {
      setServices([...services, { ...newService, valor: parseFloat(newService.valor) }]);
      setNewService({ nome: '', valor: '' });
      playSound();
    } else {
      toast({ title: "Campos incompletos", description: "Preencha o nome e o valor do novo serviço.", variant: "destructive" });
    }
  };

  const handleDeleteService = (index) => {
    const updatedServices = services.filter((_, i) => i !== index);
    setServices(updatedServices);
    playSound();
  };

  const handleSaveServices = () => {
    localStorage.setItem(`services_${userData.name}`, JSON.stringify(services));
    toast({ title: "✅ Serviços Salvos!", description: "Sua lista de serviços foi atualizada com sucesso." });
    playSound();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div className="p-4 space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="text-center mb-6">
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
          <User size={48} className="text-white" />
        </div>
        <h2 className="text-4xl font-bold text-foreground mb-2">
          Painel de {userData?.name || 'Profissional'}
        </h2>
        <p className="text-muted-foreground">
          Gerencie seus serviços e informações.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="luxury-card rounded-xl p-4">
        <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center">
          <Star className="text-primary mr-3" size={24} />
          Seus Serviços
        </h3>
        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-background rounded-lg">
              <input
                type="text"
                value={service.nome}
                onChange={(e) => handleServiceChange(index, 'nome', e.target.value)}
                className="flex-grow p-2 bg-input border border-border rounded-md"
                placeholder="Nome do Serviço"
              />
              <input
                type="number"
                value={service.valor}
                onChange={(e) => handleServiceChange(index, 'valor', parseFloat(e.target.value) || 0)}
                className="w-24 p-2 bg-input border border-border rounded-md"
                placeholder="Valor"
              />
              <Button onClick={() => handleDeleteService(index)} variant="ghost" size="icon" className="text-destructive">
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <div className="flex items-center space-x-2 p-2">
            <input
              type="text"
              value={newService.nome}
              onChange={(e) => setNewService({ ...newService, nome: e.target.value })}
              className="flex-grow p-2 bg-input border border-border rounded-md"
              placeholder="Novo Serviço"
            />
            <input
              type="number"
              value={newService.valor}
              onChange={(e) => setNewService({ ...newService, valor: e.target.value })}
              className="w-24 p-2 bg-input border border-border rounded-md"
              placeholder="Valor"
            />
            <Button onClick={handleAddNewService} variant="outline" size="icon" className="text-primary">
              <Plus size={16} />
            </Button>
          </div>
        </div>
        <Button onClick={handleSaveServices} className="w-full mt-6 h-12 bg-primary text-primary-foreground font-semibold rounded-xl btn-sound text-lg">
          <Save className="mr-2" size={20} /> Salvar Serviços
        </Button>
      </motion.div>
    </motion.div>
  );
}