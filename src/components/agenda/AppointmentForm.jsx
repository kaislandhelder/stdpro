import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Save, Search, UserPlus } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { formatCurrency } from '@/lib/currency';

const AppointmentForm = ({ onSave, onCancel, currentDate, playSound, appointmentToEdit }) => {
  const { user } = useAuth();
  
  const getInitialDate = () => {
    if (appointmentToEdit?.appointment_date) return appointmentToEdit.appointment_date;
    return currentDate.toISOString().split('T')[0];
  };

  const [appointment, setAppointment] = useState({
    client_name: appointmentToEdit?.client_name || '',
    client_phone: appointmentToEdit?.client_phone || '',
    services: appointmentToEdit?.services || [],
    total_value: appointmentToEdit?.total_value || 0,
    appointment_time: appointmentToEdit?.appointment_time || '',
    observations: appointmentToEdit?.observations || '',
    appointment_date: getInitialDate(),
    id: appointmentToEdit?.id || null,
  });

  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const { toast } = useToast();
  
  const fetchServices = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('services')
      .select('id, name, value')
      .eq('user_id', user.id);
    if (error) {
        toast({ title: "Erro ao buscar serviços", description: error.message, variant: "destructive" });
    } else {
        setServicosDisponiveis(data);
    }
  }, [user, toast]);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone')
        .eq('user_id', user.id);
    if (error) {
        toast({ title: "Erro ao buscar clientes", description: error.message, variant: "destructive" });
    } else {
        setClientes(data);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchServices();
      fetchClients();
    }
  }, [user, fetchServices, fetchClients]);

  useEffect(() => {
    if (appointment.services) {
      const total = appointment.services.reduce((acc, curr) => acc + (curr.value || 0), 0);
      setAppointment(a => ({ ...a, total_value: total }));
    }
  }, [appointment.services]);

  const handleSave = () => {
    if (!appointment.client_name || appointment.services.length === 0 || !appointment.appointment_time || !appointment.appointment_date) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha cliente, serviço(s), data e horário.",
        variant: "destructive"
      });
      return;
    }
    
    const finalServices = appointment.services.map(s => ({
        id: s.id,
        name: s.name,
        value: s.value
    }));

    const agendamentoFinal = {
      client_name: appointment.client_name,
      client_phone: appointment.client_phone,
      services: finalServices,
      total_value: appointment.total_value,
      appointment_time: appointment.appointment_time,
      appointment_date: appointment.appointment_date,
      observations: appointment.observations,
      id: appointment.id,
    };
    onSave(agendamentoFinal);
  };

  const handleClientChange = (selectedOption) => {
    if (selectedOption) {
      const client = clientes.find(c => c.name === selectedOption.value);
      if (client) {
        setAppointment(a => ({
          ...a,
          client_name: client.name,
          client_phone: client.phone
        }));
      }
    } else {
      setAppointment(a => ({
        ...a,
        client_name: '',
        client_phone: ''
      }));
    }
  };

  const handleWhatsAppChange = (e) => {
    let value = e.target.value;
    const digits = value.replace(/\D/g, '');
    
    let formatted = '';
    if (digits.length > 0) formatted = `(${digits.substring(0, 2)}`;
    if (digits.length > 2) formatted += `) ${digits.substring(2, 7)}`;
    if (digits.length > 7) formatted += `-${digits.substring(7, 11)}`;
    
    setAppointment({ ...appointment, client_phone: formatted });
    const foundClient = clientes.find(c => c.phone && c.phone.replace(/\D/g, '') === digits);
    if(foundClient){
        setAppointment(a => ({ ...a, client_name: foundClient.name}));
    } else if (digits.length === 11) {
        setShowNewClientDialog(true);
    }
  };

  const serviceOptions = servicosDisponiveis.map(s => ({
    value: s.id,
    label: `${s.name} - ${formatCurrency(s.value)}`,
    ...s
  }));

  const clientOptions = clientes.map(c => ({
    value: c.name,
    label: `${c.name} - ${c.phone || 'Sem telefone'}`,
  }));

  const handleCreateClient = (inputValue) => {
    setNewClientName(inputValue);
    setShowNewClientDialog(true);
  };

  const confirmNewClient = async () => {
    const clientNameToAdd = newClientName || `Cliente ${appointment.client_phone}`;
    const newClient = { user_id: user.id, name: clientNameToAdd, phone: appointment.client_phone };
    
    const { data, error } = await supabase.from('clients').insert(newClient).select().single();

    if(error){
        toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" });
        return;
    }
    
    fetchClients();
    setAppointment(a => ({ ...a, client_name: data.name }));
    toast({
      title: "Cliente Adicionado!",
      description: `"${data.name}" foi adicionado. Preencha o resto dos detalhes na aba Clientes mais tarde.`
    });
    setShowNewClientDialog(false);
    setNewClientName('');
  };
  
  return (
    <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">{appointmentToEdit ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
        <Button onClick={onCancel} variant="ghost" size="sm" className="btn-sound">
          <ArrowLeft className="mr-2" size={16} /> Voltar
        </Button>
      </div>
      <div className="luxury-card rounded-xl p-6 space-y-4">
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Buscar Cliente por WhatsApp</label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input 
                    type="tel" 
                    value={appointment.client_phone} 
                    onChange={handleWhatsAppChange} 
                    className="w-full p-3 pl-10 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring" 
                    placeholder="(11) 99999-9999" 
                    maxLength="15"
                />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Nome do Cliente *</label>
            <CreatableSelect
              isClearable
              options={clientOptions}
              value={appointment.client_name ? { value: appointment.client_name, label: `${appointment.client_name} - ${appointment.client_phone}` } : null}
              onChange={handleClientChange}
              onCreateOption={handleCreateClient}
              formatCreateLabel={(inputValue) => `Cadastrar novo cliente: "${inputValue}"`}
              placeholder="Digite para buscar ou cadastrar..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Serviço(s) *</label>
            <Select
                isMulti
                options={serviceOptions}
                value={(appointment.services || []).map(s => ({ value: s.id, label: `${s.name} - ${formatCurrency(s.value)}`, ...s }))}
                onChange={(selectedOptions) => setAppointment({ ...appointment, services: selectedOptions ? selectedOptions.map(opt => ({ id: opt.id, name: opt.name, value: opt.value })) : [] })}
                placeholder="Selecione um ou mais serviços"
                className="react-select-container"
                classNamePrefix="react-select"
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Data *</label>
                <input type="date" value={appointment.appointment_date} onChange={(e) => setAppointment({...appointment, appointment_date: e.target.value})} className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring" />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Horário *</label>
                <input type="time" value={appointment.appointment_time} onChange={(e) => setAppointment({...appointment, appointment_time: e.target.value})} className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring" />
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Observação</label>
            <textarea value={appointment.observations} onChange={(e) => setAppointment({...appointment, observations: e.target.value})} className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring" rows={3} placeholder="Observações sobre o atendimento..." />
        </div>
        <Button onClick={handleSave} className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl btn-sound text-lg">
            {appointmentToEdit ? <Save className="mr-2" size={20} /> : <Plus className="mr-2" size={20} />}
            {appointmentToEdit ? 'Salvar Alterações' : 'Salvar Agendamento'}
        </Button>
      </div>
    </motion.div>

    <AlertDialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center">
                    <UserPlus className="mr-2 text-primary" />
                    Cadastrar Novo Cliente?
                </AlertDialogTitle>
                <AlertDialogDescription>
                    O número {appointment.client_phone} não foi encontrado. Deseja cadastrar um novo cliente? Você pode adicionar um nome agora ou depois.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Nome do Cliente (Opcional)</label>
                <input
                    type="text"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                    placeholder="Ex: Maria Silva"
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setNewClientName('')}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmNewClient}>Cadastrar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
};

export default AppointmentForm;
