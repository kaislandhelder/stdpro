import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Plus, Trash2, Wrench } from 'lucide-react';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

export default function SeusServicos({ playSound, isEditingMode = false, addLog }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', value: '', category: '' });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // fetchServices depende s� de user agora
  const fetchServices = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', user.id)
      .order('category')
      .order('name');

    if (error) {
      toast?.({ title: "Erro ao buscar servi�os", description: error.message, variant: "destructive" });
      addLog?.(`SeusServicos: Fetch error - ${error.message}`);
      setLoading(false);
      return;
    }

    setServices(data.map(s => ({ ...s, value: formatCurrency(s.value) })));
    addLog?.(`SeusServicos: Fetched ${data.length} services.`);
    setLoading(false);
  }, [user]); // s� user na depend�ncia

  // useEffect depende s� de user para evitar loop infinito
  useEffect(() => {
    if (user) {
      fetchServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // restante do seu c�digo permanece igual...
  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services];
    if (field === 'value') {
      const rawValue = value.replace(/\D/g, '');
      updatedServices[index][field] = formatCurrency(rawValue);
    } else {
      updatedServices[index][field] = value;
    }
    setServices(updatedServices);
  };

  const handleAddNewService = async () => {
    if (newService.name && newService.value) {
      const serviceToAdd = {
        user_id: user.id,
        name: newService.name,
        value: parseCurrency(newService.value),
        category: newService.category || 'Personalizado'
      };
      
      const { data, error } = await supabase.from('services').insert(serviceToAdd).select();

      if (error) {
        addLog?.(`SeusServicos: Add service error - ${error.message}`);
        toast?.({ title: "Erro ao adicionar servi�o", description: error.message, variant: "destructive" });
      } else {
        addLog?.(`SeusServicos: Service "${data[0].name}" added.`);
        fetchServices();
        setNewService({ name: '', value: '', category: '' });
        toast?.({ title: "\u2705 Servi�o adicionado!", description: `${serviceToAdd.name} foi adicionado � sua lista.` });
        playSound();
      }
    } else {
      toast?.({ title: "Campos incompletos", description: "Preencha o nome e o valor do novo servi�o.", variant: "destructive" });
    }
  };

  const handleDeleteService = async (serviceId) => {
    const { error } = await supabase.from('services').delete().eq('id', serviceId);
    if (error) {
      addLog?.(`SeusServicos: Delete service error - ${error.message}`);
      toast?.({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      addLog?.(`SeusServicos: Service ID ${serviceId} deleted.`);
      fetchServices();
      toast?.({ title: "\U0001f5d1\ufe0f Servi�o exclu�do!", description: "O servi�o foi removido da sua lista." });
      playSound();
    }
  };

  const handleSaveServices = async () => {
    const updates = services.map(s => ({
      id: s.id,
      user_id: user.id,
      name: s.name,
      value: parseCurrency(s.value),
      category: s.category
    }));
    
    const { error } = await supabase.from('services').upsert(updates);

    if (error) {
      addLog?.(`SeusServicos: Save services error - ${error.message}`);
      toast?.({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      addLog?.(`SeusServicos: ${updates.length} services saved.`);
      toast?.({ title: "\u2705 Servi�os Salvos!", description: "Sua lista de servi�os foi atualizada com sucesso." });
      fetchServices();
      playSound();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      className={isEditingMode ? "" : "p-4"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center">
          <Wrench className="mr-3 text-primary" size={24} />
          Seus Servi�os
        </h2>
      </div>

      <div className={isEditingMode ? "" : "luxury-card rounded-xl p-6"}>
        <p className="text-muted-foreground mb-6">
          Edite, adicione ou remova os servi�os que voc� oferece. Essas informa��es ser�o usadas na Agenda e na Comanda.
        </p>
        <div className="space-y-3 mb-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="flex items-center space-x-2 p-2 bg-background rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <input
                type="text"
                value={service.name}
                onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                className="flex-grow p-2 bg-input border border-border rounded-md"
                placeholder="Nome do Servi�o"
              />
              <input
                type="text"
                value={service.value}
                onChange={(e) => handleServiceChange(index, 'value', e.target.value)}
                className="w-28 p-2 bg-input border border-border rounded-md"
                placeholder="R$ 0,00"
              />
              <Button
                onClick={() => handleDeleteService(service.id)}
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="font-semibold text-lg mb-2">Adicionar Novo Servi�o</h3>
          <div className="flex items-center space-x-2 p-2">
            <input
              type="text"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="flex-grow p-2 bg-input border border-border rounded-md"
              placeholder="Nome do novo servi�o"
            />
            <input
              type="text"
              value={newService.value}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                setNewService({ ...newService, value: formatCurrency(rawValue) });
              }}
              className="w-28 p-2 bg-input border border-border rounded-md"
              placeholder="R$ 0,00"
            />
            <Button
              onClick={handleAddNewService}
              variant="outline"
              size="icon"
              className="text-primary border-primary hover:bg-primary/10"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSaveServices}
          className="w-full mt-8 h-12 bg-primary text-primary-foreground font-semibold rounded-xl btn-sound text-lg"
        >
          <Save className="mr-2" size={20} /> Salvar Altera��es
        </Button>
      </div>
    </motion.div>
  );
}
