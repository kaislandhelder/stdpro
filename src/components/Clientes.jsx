import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, User, Users, ArrowLeft, Save, Trash2, Search, DollarSign, CheckSquare } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ClientForm = ({ onSave, onCancel, clientToEdit }) => {
  const [client, setClient] = useState(
    clientToEdit || {
      name: '',
      phone: '',
      email: '',
      birth_date: '',
      observations: ''
    }
  );
  const { toast } = useToast();

  const handleSave = () => {
    if (!client.name || !client.phone) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome e telefone.", variant: "destructive" });
      return;
    }
    
    let birthDateToSave = client.birth_date;
    if (/^\d{2}\/\d{2}$/.test(client.birth_date)) {
        const [day, month] = client.birth_date.split('/');
        birthDateToSave = `2000-${month}-${day}`;
    }

    onSave({ ...client, birth_date: birthDateToSave });
  };
  
  const handleWhatsAppChange = (e) => {
    let value = e.target.value;
    const digits = value.replace(/\D/g, '');
    
    let formatted = '';
    if (digits.length > 0) formatted = `(${digits.substring(0, 2)}`;
    if (digits.length > 2) formatted += `) ${digits.substring(2, 7)}`;
    if (digits.length > 7) formatted += `-${digits.substring(7, 11)}`;
    
    setClient({ ...client, phone: formatted });
  };

  const handleAniversarioChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setClient({ ...client, birth_date: value });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">{clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        <Button onClick={onCancel} variant="ghost" size="sm" className="btn-sound"><ArrowLeft className="mr-2" size={16} /> Voltar</Button>
      </div>
      <div className="luxury-card rounded-xl p-6 space-y-4">
        <div><label className="block text-sm font-medium text-muted-foreground mb-2">Nome Completo *</label><input type="text" value={client.name} onChange={(e) => setClient(c => ({ ...c, name: e.target.value }))} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring" /></div>
        <div><label className="block text-sm font-medium text-muted-foreground mb-2">Telefone *</label><input type="tel" value={client.phone} onChange={handleWhatsAppChange} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring" placeholder="(11) 99999-9999" maxLength="15" /></div>
        <div><label className="block text-sm font-medium text-muted-foreground mb-2">E-mail</label><input type="email" value={client.email} onChange={(e) => setClient(c => ({ ...c, email: e.target.value }))} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring" /></div>
        <div><label className="block text-sm font-medium text-muted-foreground mb-2">Aniversário (DD/MM)</label><input type="text" value={client.birth_date} onChange={handleAniversarioChange} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring" placeholder="Ex: 25/09" maxLength="5" /></div>
        <div><label className="block text-sm font-medium text-muted-foreground mb-2">Observações</label><textarea value={client.observations} onChange={(e) => setClient(c => ({ ...c, observations: e.target.value }))} className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring" rows={3} placeholder="Preferências, alergias, etc." /></div>
        <Button onClick={handleSave} className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl btn-sound text-lg"><Save className="mr-2" size={20} /> Salvar Cliente</Button>
      </div>
    </motion.div>
  );
};

export default function Clientes({ playSound }) {
  const [clientes, setClientes] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [clientToEdit, setClientToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientData, setClientData] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    const savedClients = JSON.parse(localStorage.getItem('studiogestor_clients') || '[]');
    setClientes(savedClients);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  useEffect(() => {
    // Mock client data calculation
    const stats = {};
    clientes.forEach(cliente => {
      stats[cliente.id] = { ticketMedio: Math.random() * 100, visitas: Math.floor(Math.random() * 10) };
    });
    setClientData(stats);
  }, [clientes]);

  const handleSaveClient = async (clientData) => {
    const isEditing = !!clientToEdit;
    let updatedClients;
    if (isEditing) {
      updatedClients = clientes.map(c => c.id === clientToEdit.id ? { ...c, ...clientData } : c);
    } else {
      updatedClients = [...clientes, { ...clientData, id: Date.now() }];
    }
    localStorage.setItem('studiogestor_clients', JSON.stringify(updatedClients));
    setClientes(updatedClients);

    toast({ title: `✅ Cliente ${isEditing ? 'atualizado' : 'adicionado'}!`, description: `${clientData.name} está na sua lista.` });
    setView('list');
    setClientToEdit(null);
    playSound();
  };

  const handleNew = () => {
    playSound();
    setClientToEdit(null);
    setView('form');
  };

  const handleEdit = (client) => {
    playSound();
    let birthDateFormatted = client.birth_date;
    if (birthDateFormatted && /^\d{4}-\d{2}-\d{2}$/.test(birthDateFormatted)) {
        const [, month, day] = birthDateFormatted.split('-');
        birthDateFormatted = `${day}/${month}`;
    }
    setClientToEdit({...client, birth_date: birthDateFormatted});
    setView('form');
  };

  const handleDelete = async (clientId) => {
    playSound();
    const updatedClients = clientes.filter(c => c.id !== clientId);
    localStorage.setItem('studiogestor_clients', JSON.stringify(updatedClients));
    setClientes(updatedClients);
    toast({ title: "🗑️ Cliente excluído!", description: "O cliente foi removido da sua lista." });
  };

  const sortedAndFilteredClientes = useMemo(() => {
    return clientes
      .filter(c =>
        (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.phone && c.phone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, '')))
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clientes, searchTerm]);

  if (loading) {
    return <div className="flex justify-center items-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (view === 'form') {
    return <ClientForm onSave={handleSaveClient} onCancel={() => setView('list')} clientToEdit={clientToEdit} />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">Meus Clientes</h2>
        <Button onClick={handleNew} className="bg-primary text-primary-foreground btn-sound"><Plus className="mr-2" size={16} /> Novo</Button>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring"
        />
      </div>
      {clientes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <Users size={64} className="mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold text-foreground mb-2">Nenhum cliente cadastrado</h3>
          <p className="text-muted-foreground mb-4">Comece cadastrando seu primeiro cliente!</p>
          <Button onClick={handleNew} className="bg-primary text-primary-foreground btn-sound"><Plus className="mr-2" size={16} /> Primeiro Cliente</Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {sortedAndFilteredClientes.map(cliente => (
            <motion.div key={cliente.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="luxury-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {cliente.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{cliente.name}</h4>
                    <p className="text-sm text-muted-foreground">{cliente.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button onClick={() => handleEdit(cliente)} size="icon" variant="ghost" className="text-muted-foreground"><User size={16} /></Button>
                  <Button onClick={() => handleDelete(cliente.id)} size="icon" variant="ghost" className="text-destructive"><Trash2 size={16} /></Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm border-t border-border pt-3">
                <div className="flex items-center text-muted-foreground"><CheckSquare size={14} className="mr-2 text-primary" /> Visitas: <span className="font-semibold text-foreground ml-1">{clientData[cliente.id]?.visitas || 0}</span></div>
                <div className="flex items-center text-muted-foreground"><DollarSign size={14} className="mr-2 text-primary" /> Ticket Médio: <span className="font-semibold text-foreground ml-1">R$ {clientData[cliente.id]?.ticketMedio?.toFixed(2) || '0.00'}</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
