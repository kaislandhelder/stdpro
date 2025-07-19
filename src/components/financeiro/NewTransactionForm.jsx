import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Plus, Check } from 'lucide-react';
import { formatCurrency, parseCurrency } from '@/lib/currency';
import { DialogClose } from '@/components/ui/dialog';

export const NewTransactionForm = ({ type, onSave, onCancel, isFuture = false }) => {
  const [newTransaction, setNewTransaction] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    due_date: isFuture ? '' : null,
    is_paid: isFuture ? false : true,
    type: type,
  });
  const { toast } = useToast();
  const isExpense = type === 'despesa';

  const categoriasDespesas = ['Despesa Pessoal', 'Despesa do Salão', 'Produtos', 'Marketing', 'Outras'];
  const categoriasReceitas = ['Venda de Produto', 'Serviço Extra', 'Aluguel de Espaço', 'Outras'];

  const handleSaveClick = () => {
    const valorNum = parseCurrency(newTransaction.valor);
    if (!newTransaction.descricao || !newTransaction.categoria || isNaN(valorNum) || valorNum <= 0) {
      toast({
        title: "Campos inválidos",
        description: "Preencha descrição, categoria e um valor válido.",
        variant: "destructive"
      });
      return false;
    }
     if (isFuture && !newTransaction.due_date) {
      toast({
        title: "Data de Vencimento",
        description: "Para despesas futuras, a data de vencimento é obrigatória.",
        variant: "destructive"
      });
      return false;
    }
    onSave({ 
        id: Date.now(), 
        ...newTransaction, 
        valor: valorNum,
        data: isFuture ? newTransaction.due_date : newTransaction.data, // For future, data is due_date
    });
    return true;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={!isFuture ? "p-4" : ""}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-foreground">
          {isFuture ? "Despesa Futura" : `Adicionar ${isExpense ? 'Despesa' : 'Receita'}`}
        </h2>
        {!isFuture && (
            <Button onClick={onCancel} variant="ghost" size="sm" className="btn-sound">
                <ArrowLeft className="mr-2" size={16} /> Voltar
            </Button>
        )}
      </div>
      <div className={!isFuture ? "luxury-card rounded-xl p-6 space-y-4" : "space-y-4"}>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Descrição *</label>
          <input
            type="text"
            value={newTransaction.descricao}
            onChange={(e) => setNewTransaction(p => ({ ...p, descricao: e.target.value }))}
            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring"
            placeholder={isExpense ? "Ex: Aluguel" : "Ex: Venda de produto"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Categoria *</label>
          <select
            value={newTransaction.categoria}
            onChange={(e) => setNewTransaction(p => ({ ...p, categoria: e.target.value }))}
            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring"
          >
            <option value="">Selecione a categoria</option>
            {(isExpense ? categoriasDespesas : categoriasReceitas).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Valor (R$) *</label>
            <input
              type="text"
              value={newTransaction.valor}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                setNewTransaction(p => ({ ...p, valor: formatCurrency(rawValue) }));
              }}
              className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring"
              placeholder="0,00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">{isFuture ? "Vencimento *" : "Data"}</label>
            <input
              type="date"
              value={isFuture ? newTransaction.due_date : newTransaction.data}
              onChange={(e) => setNewTransaction(p => ({ ...p, [isFuture ? 'due_date' : 'data']: e.target.value }))}
              className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        
        {isFuture && (
            <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="is_paid_checkbox"
                    checked={newTransaction.is_paid}
                    onChange={(e) => setNewTransaction(p => ({...p, is_paid: e.target.checked}))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="is_paid_checkbox" className="text-sm font-medium text-muted-foreground">Marcar como paga</label>
            </div>
        )}
        
        {isFuture ? (
          <DialogClose asChild>
            <Button
              onClick={handleSaveClick}
              className={`w-full h-12 text-white font-semibold rounded-xl btn-sound text-lg ${isExpense ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <Check className="mr-2" size={20} /> Salvar Despesa
            </Button>
          </DialogClose>
        ) : (
          <Button
            onClick={handleSaveClick}
            className={`w-full h-12 text-white font-semibold rounded-xl btn-sound text-lg ${isExpense ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <Plus className="mr-2" size={20} /> Salvar {isExpense ? 'Despesa' : 'Receita'}
          </Button>
        )}
      </div>
    </motion.div>
  );
};