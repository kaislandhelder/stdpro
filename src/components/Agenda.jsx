import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { DragDropContext } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import AppointmentForm from './agenda/AppointmentForm';
import AgendaView from './agenda/AgendaView';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

export default function Agenda({ playSound, profile }) {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const dateString = currentDate.toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .eq('appointment_date', dateString)
        .order('appointment_time', { ascending: true });

    if (error) {
        toast({ title: "Erro ao buscar agendamentos", description: error.message, variant: 'destructive' });
        setAgendamentos([]);
    } else {
        setAgendamentos(data || []);
    }
    setLoading(false);
  }, [currentDate, user, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSaveAppointment = async (appointmentData) => {
    const isEditing = !!appointmentToEdit && !appointmentToEdit.isRescheduling;
    const isRescheduling = appointmentToEdit?.isRescheduling;

    const dataToSave = {
        ...appointmentData,
        user_id: user.id
    };

    if (isEditing) {
        const { error } = await supabase.from('appointments').update(dataToSave).eq('id', appointmentToEdit.id);
        if (error) {
            toast({ title: "Erro ao atualizar", description: error.message, variant: 'destructive' });
            return;
        }
    } else {
        const { error } = await supabase.from('appointments').insert(dataToSave);
        if (error) {
            toast({ title: "Erro ao criar", description: error.message, variant: 'destructive' });
            return;
        }
    }
    
    toast({ title: `✅ Agendamento ${isEditing ? 'atualizado' : 'criado'}!`, description: `${appointmentData.client_name} agendado para ${appointmentData.appointment_time}` });
    setView('list');
    setAppointmentToEdit(null);
    playSound();
    fetchAppointments();
  };

  const changeDate = (direction) => {
    playSound();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const sendReminder = async (agendamento) => {
    playSound();
    const [year, month, day] = agendamento.appointment_date.split('-');
    const formattedDate = `${day}/${month}`;
    const message = `Oi, ${agendamento.client_name}! Tudo pronto para te receber no salão 💇‍♀️\n📍 Seu horário é: ${formattedDate}, às ${agendamento.appointment_time}\nPosso confirmar sua presença?`;
    
    const success = await sendWhatsAppMessage(agendamento.client_phone, message);
    if (success) {
      toast({ title: "📱 Lembrete enviado!", description: `WhatsApp enviado para ${agendamento.client_name}` });
    }
  };
  
  const handleEdit = (agendamento) => {
    playSound();
    setAppointmentToEdit(agendamento);
    setView('form');
  };

  const handleNew = () => {
    playSound();
    setAppointmentToEdit(null);
    setView('form');
  };

  const handleCancelForm = () => {
    setView('list');
    setAppointmentToEdit(null);
  };

  const onDragEnd = async (result) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const items = Array.from(agendamentos);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setAgendamentos(items);
    toast({ title: "✨ Agenda Reorganizada!", description: "A ordem dos agendamentos foi atualizada." });
  };

  const handleStatusChange = async (id, newStatus) => {
    playSound();
    const { data, error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id).select().single();
    if(error) {
        toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive"});
        return;
    }

    setAgendamentos(agendamentos.map(a => a.id === id ? data : a));
    
    toast({
        title: "Status atualizado!",
        description: `${data.client_name} foi marcado como ${newStatus === 'present' ? 'presente' : 'ausente'}.`
    });
  };
  
  const handleReschedule = (agendamento) => {
      playSound();
      setAppointmentToEdit({ ...agendamento, isRescheduling: true });
      setView('form');
      toast({
          title: "Reagendamento",
          description: `Selecione a nova data e horário para ${agendamento.client_name}.`
      });
  };

  if (view === 'form') {
    return <AppointmentForm onSave={handleSaveAppointment} onCancel={handleCancelForm} currentDate={currentDate} playSound={playSound} appointmentToEdit={appointmentToEdit} />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Agenda</h2>
        <Button onClick={handleNew} className="bg-primary text-primary-foreground btn-sound">
          <Plus className="mr-2" size={16} /> Novo
        </Button>
      </div>
      <div className="flex items-center justify-between mb-6 luxury-card rounded-xl p-3">
        <Button onClick={() => changeDate(-1)} variant="ghost" size="icon" className="btn-sound text-muted-foreground"><ArrowLeft size={20} /></Button>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">
            {currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
          </h3>
          <p className="text-sm text-muted-foreground">{currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <Button onClick={() => changeDate(1)} variant="ghost" size="icon" className="btn-sound text-muted-foreground"><ArrowRight size={20} /></Button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
            <AgendaView 
              agendamentos={agendamentos} 
              onNew={handleNew} 
              onSendReminder={sendReminder} 
              onEdit={handleEdit} 
              onStatusChange={handleStatusChange}
              onReschedule={handleReschedule}
            />
        </DragDropContext>
      )}
    </div>
  );
}