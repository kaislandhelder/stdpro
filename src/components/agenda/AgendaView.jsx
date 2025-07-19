import React from 'react';
import { motion } from 'framer-motion';
import { Droppable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';

const AgendaView = ({ agendamentos, onNew, onSendReminder, onEdit, onStatusChange, onReschedule }) => {
  return (
    <Droppable droppableId="agenda-dia">
      {(provided) => (
        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
          {agendamentos.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <Calendar size={64} className="mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-2">Nenhum agendamento</h3>
              <p className="text-muted-foreground mb-4">Que tal criar o primeiro agendamento do dia?</p>
              <Button onClick={onNew} className="bg-primary text-primary-foreground btn-sound">
                <Plus className="mr-2" size={16} /> Novo Agendamento
              </Button>
            </motion.div>
          ) : (
            agendamentos.map((agendamento, index) => (
              <AppointmentCard
                key={agendamento.id}
                agendamento={agendamento}
                index={index}
                onSendReminder={onSendReminder}
                onEdit={onEdit}
                onStatusChange={onStatusChange}
                onReschedule={onReschedule}
              />
            ))
          )}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default AgendaView;