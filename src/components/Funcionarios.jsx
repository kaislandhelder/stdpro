
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Users2, Plus, Trash2, KeyRound, Mail, User } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock data for employees since Supabase admin functions are not available client-side
const initialEmployees = [
  { id: 1, name: 'Ana Silva', email: 'ana.silva@example.com' },
  { id: 2, name: 'Bruno Costa', email: 'bruno.costa@example.com' },
];

export default function Funcionarios({ playSound, addLog }) {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState(initialEmployees);
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '' });
  const [isNewEmployeeDialogOpen, setIsNewEmployeeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) {
      toast({ title: "Campos incompletos", description: "Preencha nome e e-mail do funcionário.", variant: "destructive" });
      return;
    }

    setLoading(true);
    playSound();
    addLog(`Attempting to add employee: ${newEmployee.email}`);

    // This is a simulation. In a real app, this would be a call to a Supabase Edge Function.
    setTimeout(() => {
      const randomPassword = Math.random().toString(36).slice(-8);
      const employeeToAdd = {
        id: Date.now(),
        ...newEmployee,
      };
      setEmployees([...employees, employeeToAdd]);
      
      toast({
        title: "✅ Funcionário Adicionado!",
        description: `${newEmployee.name} foi convidado. A senha temporária é: ${randomPassword}`,
      });
      addLog(`Simulated employee addition for ${newEmployee.email}. Temp password: ${randomPassword}`);
      
      setNewEmployee({ name: '', email: '' });
      setIsNewEmployeeDialogOpen(false);
      setLoading(false);
    }, 1000);
  };

  const handleDeleteEmployee = (employeeId, employeeName) => {
    playSound();
    addLog(`Attempting to delete employee: ${employeeName}`);
    // Simulation
    setEmployees(employees.filter(e => e.id !== employeeId));
    toast({ title: "🗑️ Funcionário Removido", description: `${employeeName} foi removido da equipe.` });
  };

  if (profile?.subscription_plan !== 'team') {
    return (
      <div className="p-4 text-center">
        <Users2 size={64} className="mx-auto text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Gestão de Equipe</h2>
        <p className="text-muted-foreground">Esta funcionalidade está disponível apenas no Plano Equipe.</p>
        <Button className="mt-4">Ver Planos</Button>
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground flex items-center">
          <Users2 className="mr-3 text-primary" size={28} />
          Funcionários
        </h2>
        <Dialog open={isNewEmployeeDialogOpen} onOpenChange={setIsNewEmployeeDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => playSound()} disabled={employees.length >= 5}>
              <Plus className="mr-2" size={16} /> Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
              <DialogDescription>
                Um convite será enviado para o e-mail com uma senha temporária.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input type="text" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} className="w-full p-3 pl-10 bg-input border border-border rounded-lg" placeholder="Nome do funcionário" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} className="w-full p-3 pl-10 bg-input border border-border rounded-lg" placeholder="E-mail do funcionário" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewEmployeeDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddEmployee} disabled={loading}>
                {loading ? 'Adicionando...' : 'Adicionar Funcionário'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="luxury-card rounded-xl p-6">
        <p className="text-muted-foreground mb-4">
          Você pode adicionar até 5 funcionários. ({employees.length}/5)
        </p>
        <div className="space-y-3">
          {employees.map((employee) => (
            <motion.div
              key={employee.id}
              className="flex items-center justify-between p-3 bg-background rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div>
                <p className="font-semibold text-foreground">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <KeyRound size={16} />
                </Button>
                <Button onClick={() => handleDeleteEmployee(employee.id, employee.name)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
