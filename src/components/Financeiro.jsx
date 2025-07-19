import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Bell, CalendarClock, Copy } from 'lucide-react';
import { NewTransactionForm } from '@/components/financeiro/NewTransactionForm';
import { SummaryCards } from '@/components/financeiro/SummaryCards';
import { RecentTransactions } from '@/components/financeiro/RecentTransactions';
import { FinanceActions } from '@/components/financeiro/FinanceActions';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Financeiro({ playSound }) {
  const [periodo, setPeriodo] = useState('dia');
  const [allTransactions, setAllTransactions] = useState([]);
  const [view, setView] = useState('main'); // 'main' or 'form'
  const [transactionType, setTransactionType] = useState('despesa');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadFinancialData = useCallback(async () => {
    setLoading(true);
    const savedTransactions = JSON.parse(localStorage.getItem('studiogestor_transactions') || '[]');
    setAllTransactions(savedTransactions);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  const financials = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const calculateTotals = (filteredTransactions) => {
        const ganhos = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
        const despesas = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
        return { ganhos, despesas, saldo: ganhos - despesas };
    };

    const diaFiltered = allTransactions.filter(t => new Date(t.transaction_date).getTime() === today.getTime());
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const semanaFiltered = allTransactions.filter(t => new Date(t.transaction_date) >= startOfWeek);

    const startOfFortnight = new Date(today);
    startOfFortnight.setDate(today.getDate() <= 15 ? 1 : 16);
    const quinzenaFiltered = allTransactions.filter(t => new Date(t.transaction_date) >= startOfFortnight);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const mesFiltered = allTransactions.filter(t => new Date(t.transaction_date) >= startOfMonth);

    return {
      ganhos: {
        dia: calculateTotals(diaFiltered).ganhos,
        semana: calculateTotals(semanaFiltered).ganhos,
        quinzena: calculateTotals(quinzenaFiltered).ganhos,
        mes: calculateTotals(mesFiltered).ganhos
      },
      despesas: {
        dia: calculateTotals(diaFiltered).despesas,
        semana: calculateTotals(semanaFiltered).despesas,
        quinzena: calculateTotals(quinzenaFiltered).despesas,
        mes: calculateTotals(mesFiltered).despesas
      },
      saldo: {
        dia: calculateTotals(diaFiltered).saldo,
        semana: calculateTotals(semanaFiltered).saldo,
        quinzena: calculateTotals(quinzenaFiltered).saldo,
        mes: calculateTotals(mesFiltered).saldo
      }
    };
  }, [allTransactions]);

  const handleNewTransaction = (type) => {
    playSound();
    setTransactionType(type);
    setView('form');
  };

  const handleSaveTransaction = async (newEntry) => {
    const transactionData = {
        ...newEntry,
        id: Date.now(),
        value: Number(newEntry.value)
    };
    const updatedTransactions = [...allTransactions, transactionData];
    localStorage.setItem('studiogestor_transactions', JSON.stringify(updatedTransactions));
    setAllTransactions(updatedTransactions);

    toast({
      title: `✅ ${newEntry.type === 'expense' ? 'Despesa' : 'Receita'} adicionada!`,
      description: `${newEntry.description} - R$ ${transactionData.value.toFixed(2)}`
    });

    setView('main');
    playSound();
  };

   const handleDeleteTransaction = async (id) => {
    const updatedTransactions = allTransactions.filter(t => t.id !== id);
    localStorage.setItem('studiogestor_transactions', JSON.stringify(updatedTransactions));
    setAllTransactions(updatedTransactions);
    toast({ title: "🗑️ Transação removida!", description: "O item foi removido do seu financeiro." });
  };

  const handleDuplicateExpenses = async () => {
    playSound();
    toast({ title: "🚧 Funcionalidade em breve!", description: "A duplicação de despesas será implementada." });
  };
  
  if (view === 'form') {
    return (
      <NewTransactionForm 
        type={transactionType} 
        onSave={handleSaveTransaction}
        onCancel={() => setView('main')}
      />
    );
  }
  
  const getTransactionsForPeriod = (transactions) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfFortnight = new Date(today);
    startOfFortnight.setDate(today.getDate() <= 15 ? 1 : 16);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date + 'T00:00:00');
      switch (periodo) {
        case 'dia':
          return transactionDate.getTime() === today.getTime();
        case 'semana':
          return transactionDate >= startOfWeek;
        case 'quinzena':
          return transactionDate >= startOfFortnight;
        case 'mes':
          return transactionDate >= startOfMonth;
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  };
  
  const futureExpenses = allTransactions.filter(t => t.type === 'expense' && t.due_date && new Date(t.due_date) > new Date() && !t.paid);


  if (loading) {
    return <div className="flex justify-center items-center p-8"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Financeiro</h2>
        <div className="flex space-x-2">
          <Button onClick={() => handleNewTransaction('income')} className="bg-green-600 hover:bg-green-700 text-white btn-sound"><Plus className="mr-2" size={16} /> Receita</Button>
          <Button onClick={() => handleNewTransaction('expense')} className="bg-red-600 hover:bg-red-700 text-white btn-sound"><Plus className="mr-2" size={16} /> Despesa</Button>
        </div>
      </div>
      <div className="flex space-x-2 bg-muted p-1 rounded-lg">
        {[{ key: 'dia', label: 'Hoje' }, { key: 'semana', label: 'Semana' }, { key: 'quinzena', label: 'Quinzena' }, { key: 'mes', label: 'Mês' }].map(item => (
          <Button key={item.key} onClick={() => { setPeriodo(item.key); playSound(); }} variant={periodo === item.key ? 'default' : 'ghost'} className={`flex-1 btn-sound ${periodo === item.key ? 'bg-card text-primary shadow' : 'text-muted-foreground'}`}>{item.label}</Button>
        ))}
      </div>
      
      <SummaryCards 
        ganhos={financials.ganhos[periodo]} 
        despesas={financials.despesas[periodo]}
        saldo={financials.saldo[periodo]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl btn-sound w-full">
              <CalendarClock size={16} className="mr-2" /> Lançar Despesa Futura
            </Button>
          </DialogTrigger>
          <DialogContent>
            <NewTransactionForm type="expense" onSave={handleSaveTransaction} onCancel={() => {}} isFuture={true} />
          </DialogContent>
        </Dialog>
        
        <Button onClick={handleDuplicateExpenses} variant="outline" className="h-12 border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl btn-sound w-full">
         <Copy size={16} className="mr-2" /> Copiar Despesas do Mês Anterior
       </Button>
      </div>

      {futureExpenses.length > 0 && (
         <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="luxury-card rounded-xl p-4"
        >
          <h3 className="text-2xl font-semibold text-foreground mb-4 flex items-center"><Bell className="mr-2 text-primary"/> Despesas Futuras</h3>
          <RecentTransactions transactions={futureExpenses} onDelete={handleDeleteTransaction} />
        </motion.div>
      )}

      <RecentTransactions 
        transactions={getTransactionsForPeriod(allTransactions)}
        onDelete={handleDeleteTransaction}
      />
      
      <FinanceActions
        financials={financials}
        playSound={playSound}
      />
    </div>
  );
}
