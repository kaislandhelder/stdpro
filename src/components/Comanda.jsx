import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, Printer, MessageSquare, CreditCard, User, Scissors, Wind, Hand, Footprints, FlaskConical, Palette, Droplets, Eye, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const formasPagamento = [
  { nome: 'Dinheiro' },
  { nome: 'Débito' },
  { nome: 'Crédito' },
  { nome: 'PIX' },
];

const ComandaForm = ({ comandaAtual, setComandaAtual, fecharComanda, setShowNewComanda, playSound }) => {
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);

  const fetchServices = useCallback(async () => {
    const savedServices = JSON.parse(localStorage.getItem('studiogestor_services') || '[]');
    const servicesWithIcons = savedServices.map(s => {
        const iconMap = {
            'Corte': Scissors, 'Escova': Wind, 'Manicure': Hand, 'Pedicure': Footprints,
            'Progressiva': FlaskConical, 'Coloração': Palette, 'Hidratação': Droplets, 'Sobrancelha': Eye
        };
        const matchedIcon = Object.keys(iconMap).find(key => s.name.toLowerCase().includes(key.toLowerCase()));
        return { ...s, icon: matchedIcon ? iconMap[matchedIcon] : Droplets };
      });
    setServicosDisponiveis(servicesWithIcons);
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addServico = (servico) => {
    playSound();
    const novosServicos = [...comandaAtual.servicos, { ...servico, id: Date.now() }];
    setComandaAtual({ ...comandaAtual, servicos: novosServicos });
  };

  const removeServico = (servicoId) => {
    playSound();
    const novosServicos = comandaAtual.servicos.filter(s => s.id !== servicoId);
    setComandaAtual({ ...comandaAtual, servicos: novosServicos });
  };

  const calcularTotal = () => {
    const subtotal = comandaAtual.servicos.reduce((total, servico) => total + Number(servico.value), 0);
    return subtotal - comandaAtual.desconto;
  };

  const handleDescontoChange = (amount) => {
    const novoDesconto = Math.max(0, comandaAtual.desconto + amount);
    setComandaAtual({ ...comandaAtual, desconto: novoDesconto });
    playSound();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Nova Comanda</h2>
        <Button onClick={() => setShowNewComanda(false)} variant="ghost" size="sm" className="btn-sound">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="luxury-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Dados do Cliente</h3>
          <div className="space-y-3">
            <input type="text" value={comandaAtual.cliente} onChange={(e) => setComandaAtual({...comandaAtual, cliente: e.target.value})} className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Nome do cliente" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="luxury-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Serviços</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {servicosDisponiveis.map(servico => (
              <Button key={servico.id} onClick={() => addServico(servico)} variant="outline" size="sm" className="text-left justify-start btn-sound h-auto" aria-label={`Adicionar serviço de ${servico.name}`}>
                <servico.icon className="w-4 h-4 mr-2 text-primary" />
                <div>
                  <div className="font-medium">{servico.name}</div>
                  <div className="text-xs text-muted-foreground">R$ {servico.value}</div>
                </div>
              </Button>
            ))}
          </div>
          {comandaAtual.servicos.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="font-medium text-foreground mb-2">Serviços Selecionados:</h4>
              <div className="space-y-2">
                {comandaAtual.servicos.map(servico => (
                  <div key={servico.id} className="flex justify-between items-center p-2 bg-background rounded-lg">
                    <span>{servico.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-primary">R$ {servico.value}</span>
                      <Button onClick={() => removeServico(servico.id)} size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 btn-sound w-6 h-6 p-0"><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="luxury-card rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Pagamento</h3>
          <div className="space-y-4">
            <select value={comandaAtual.formaPagamento} onChange={(e) => setComandaAtual({...comandaAtual, formaPagamento: e.target.value})} className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
              <option value="">Forma de pagamento</option>
              {formasPagamento.map(forma => <option key={forma.nome} value={forma.nome}>{forma.nome}</option>)}
            </select>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Desconto (R$)</label>
              <div className="flex items-center space-x-2">
                <Button onClick={() => handleDescontoChange(-1)} variant="outline" size="icon" className="h-10 w-10 btn-sound"><Minus size={16} /></Button>
                <input
                  type="number"
                  value={comandaAtual.desconto}
                  onChange={(e) => setComandaAtual({ ...comandaAtual, desconto: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 text-center bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0.00"
                />
                <Button onClick={() => handleDescontoChange(1)} variant="outline" size="icon" className="h-10 w-10 btn-sound"><Plus size={16} /></Button>
              </div>
            </div>

            <textarea value={comandaAtual.observacao} onChange={(e) => setComandaAtual({...comandaAtual, observacao: e.target.value})} className="w-full p-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" rows={2} placeholder="Observações..." />
          </div>
        </motion.div>

        {comandaAtual.servicos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="luxury-card rounded-xl p-4 bg-primary/10">
            <h3 className="font-semibold text-foreground mb-4">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>R$ {comandaAtual.servicos.reduce((total, s) => total + Number(s.value), 0).toFixed(2)}</span></div>
              {comandaAtual.desconto > 0 && <div className="flex justify-between text-destructive"><span>Desconto:</span><span>- R$ {comandaAtual.desconto.toFixed(2)}</span></div>}
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2"><span>Total:</span><span className="text-primary">R$ {calcularTotal().toFixed(2)}</span></div>
            </div>
          </motion.div>
        )}

        <Button onClick={fecharComanda} className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl btn-sound hover:bg-primary/90">Fechar Comanda</Button>
      </div>
    </div>
  );
};

const ComandaList = ({ comandas, handleNewComanda, imprimirComanda, enviarWhatsApp }) => (
  <div className="p-4">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-foreground">Comandas</h2>
      <Button onClick={handleNewComanda} className="bg-primary text-primary-foreground btn-sound hover:bg-primary/90">
        <Plus className="w-4 h-4 mr-2" /> Nova Comanda
      </Button>
    </div>

    <div className="space-y-4">
      {comandas.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma comanda</h3>
          <p className="text-muted-foreground mb-4">Crie sua primeira comanda do dia!</p>
          <Button onClick={handleNewComanda} className="bg-primary text-primary-foreground btn-sound hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Nova Comanda
          </Button>
        </motion.div>
      ) : (
        comandas.slice().reverse().map((comanda, index) => (
          <motion.div key={comanda.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="luxury-card rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-foreground text-lg flex items-center"><User className="w-4 h-4 mr-2 text-primary" />{comanda.cliente}</h4>
                <p className="text-xs text-muted-foreground">{new Date(comanda.data).toLocaleString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">R$ {comanda.total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{comanda.formaPagamento}</p>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground mb-1">Serviços:</p>
              <div className="flex flex-wrap gap-1">
                {comanda.servicos.map((servico, idx) => <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{servico.name}</span>)}
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => imprimirComanda(comanda)} size="sm" variant="outline" className="btn-sound"><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
              <Button onClick={() => enviarWhatsApp(comanda)} size="sm" variant="outline" className="btn-sound"><MessageSquare className="w-4 h-4 mr-2" /> WhatsApp</Button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  </div>
);

export default function Comanda({ playSound }) {
  const [comandas, setComandas] = useState([]);
  const [comandaAtual, setComandaAtual] = useState({ cliente: '', servicos: [], formaPagamento: '', desconto: 0, observacao: '' });
  const [showNewComanda, setShowNewComanda] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedComandas = JSON.parse(localStorage.getItem('studiogestor_comandas') || '[]');
    setComandas(savedComandas);
  }, []);

  const handleNewComanda = () => {
    playSound();
    setShowNewComanda(true);
    setComandaAtual({ cliente: '', servicos: [], formaPagamento: '', desconto: 0, observacao: '' });
  };

  const fecharComanda = () => {
    if (!comandaAtual.cliente || comandaAtual.servicos.length === 0 || !comandaAtual.formaPagamento) {
      toast({ title: "Campos obrigatórios", description: "Preencha cliente, serviços e forma de pagamento.", variant: "destructive" });
      return;
    }
    
    const subtotal = comandaAtual.servicos.reduce((total, servico) => total + Number(servico.value), 0);
    const total = subtotal - comandaAtual.desconto;

    const novaComanda = { id: Date.now(), ...comandaAtual, total, data: new Date().toISOString(), status: 'fechada' };
    const updatedComandas = [...comandas, novaComanda];
    setComandas(updatedComandas);
    localStorage.setItem('studiogestor_comandas', JSON.stringify(updatedComandas));

    toast({ title: "✅ Comanda fechada!", description: `Total: R$ ${novaComanda.total.toFixed(2)}` });
    setShowNewComanda(false);
    playSound();
  };

  const imprimirComanda = (comanda) => {
    playSound();
    toast({ title: "🚧 Funcionalidade em breve!", description: "A impressão de comandas será implementada." });
  };

  const enviarWhatsApp = (comanda) => {
    playSound();
    toast({ title: "🚧 Funcionalidade em breve!", description: "O envio por WhatsApp será implementado." });
  };

  if (showNewComanda) {
    return <ComandaForm comandaAtual={comandaAtual} setComandaAtual={setComandaAtual} fecharComanda={fecharComanda} setShowNewComanda={setShowNewComanda} playSound={playSound} />;
  }

  return <ComandaList comandas={comandas} handleNewComanda={handleNewComanda} imprimirComanda={imprimirComanda} enviarWhatsApp={enviarWhatsApp} />;
}
