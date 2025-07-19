import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Clock, User, MessageSquare, Send, Edit, GripVertical, CheckCircle2, XCircle, RefreshCcw, Smile } from 'lucide-react';

const isPast = (horario, data) => {
    const hoje = new Date().toISOString().split('T')[0];
    if (!horario || data !== hoje) return false;
    const [hours, minutes] = horario.split(':');
    const appointmentTime = new Date();
    appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return new Date() >= appointmentTime;
};

const StatusControls = ({ agendamento, onStatusChange, onReschedule }) => {
    if (agendamento.status === 'absent') {
        return (
            <div className="flex items-center space-x-2">
                <span className="text-sm text-red-500 font-semibold">Cliente ausente</span>
                <Button onClick={() => onReschedule(agendamento)} size="sm" variant="outline" className="btn-sound border-primary text-primary hover:bg-primary/10">
                    <RefreshCcw size={14} className="mr-2" /> Reagendar
                </Button>
            </div>
        );
    }
    
    if (agendamento.status === 'rescheduled') {
        return (
            <div className="flex items-center space-x-2 text-sm text-amber-600 font-semibold">
                <Smile size={16} />
                <span>Reagendado</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2">
             <p className="text-sm text-muted-foreground mr-2">Cliente compareceu?</p>
            <button onClick={() => onStatusChange(agendamento.id, 'present')} title="Marcar como presente">
                <CheckCircle2 className={`w-6 h-6 transition-transform hover:scale-125 ${agendamento.status === 'present' ? 'text-green-500' : 'text-muted-foreground/50 hover:text-green-500'}`} />
            </button>
            <button onClick={() => onStatusChange(agendamento.id, 'absent')} title="Marcar como ausente">
                <XCircle className={`w-6 h-6 transition-transform hover:scale-125 ${agendamento.status === 'absent' ? 'text-red-500' : 'text-muted-foreground/50 hover:text-red-500'}`} />
            </button>
        </div>
    );
};


export const AppointmentCard = ({ agendamento, index, onSendReminder, onEdit, onStatusChange, onReschedule }) => {
  const isActionable = agendamento.status !== 'rescheduled';
  const totalValue = typeof agendamento.total_value === 'number' ? agendamento.total_value : 0;

  return (
    <Draggable key={agendamento.id} draggableId={String(agendamento.id)} index={index} isDragDisabled={!isActionable}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`rounded-xl p-4 luxury-card flex flex-col ${snapshot.isDragging ? 'shadow-lg scale-105' : ''} ${!isActionable ? 'opacity-60' : ''}`}
        >
          <div className="flex items-start space-x-3">
            <div {...provided.dragHandleProps} className={`drag-handle text-muted-foreground pt-1 ${isActionable ? 'cursor-grab' : 'cursor-not-allowed'}`}>
              <GripVertical />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-foreground text-lg flex items-center">
                    <User size={16} className="mr-2 text-primary" />{agendamento.client_name}
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(agendamento.services || []).map((s, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{s.name}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-lg text-foreground flex items-center justify-end">
                    <Clock size={16} className="mr-2 text-primary" />{agendamento.appointment_time}
                  </p>
                  <p className="text-green-600 font-semibold">R$ {totalValue.toFixed(2)}</p>
                </div>
              </div>
              {agendamento.observations && (
                <p className="text-sm text-muted-foreground mb-3 italic flex items-start">
                  <MessageSquare size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                  {agendamento.observations}
                </p>
              )}
              {isActionable && (
                <div className="flex items-center space-x-2">
                  {agendamento.client_phone && (
                    <Button onClick={() => onSendReminder(agendamento)} size="sm" variant="outline" className="btn-sound">
                      <Send size={14} className="mr-2" /> Lembrete
                    </Button>
                  )}
                  <Button onClick={() => onEdit(agendamento)} size="sm" variant="ghost" className="btn-sound text-muted-foreground">
                    <Edit size={14} className="mr-2" /> Editar
                  </Button>
                </div>
              )}
            </div>
          </div>
          {(isPast(agendamento.appointment_time, agendamento.appointment_date) || agendamento.status === 'rescheduled' || agendamento.status === 'present' || agendamento.status === 'absent') && (
            <div className="mt-4 pt-3 border-t border-border/50 flex justify-end items-center">
              <StatusControls agendamento={agendamento} onStatusChange={onStatusChange} onReschedule={onReschedule} />
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};