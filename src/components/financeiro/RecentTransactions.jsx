import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Wallet, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const RecentTransactions = ({ transactions, onDelete }) => {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="luxury-card rounded-xl p-4 mb-6"
    >
      <h3 className="text-2xl font-semibold text-foreground mb-4">Transações Recentes</h3>
      {transactions.length === 0 ? (
        <div className="text-center py-8">
            <Wallet size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Nenhuma transação cadastrada</p>
        </div>
      ) : (
        <div className="space-y-3">
            {transactions.map((transacao) => (
            <div key={transacao.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                <div className="flex-grow">
                    <p className="font-medium text-foreground">{transacao.descricao}</p>
                    <p className="text-sm text-muted-foreground">{transacao.categoria} • {new Date(transacao.data + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <p className={`font-bold ${transacao.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                    {transacao.type === 'receita' ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="text-destructive w-8 h-8"><Trash2 size={16} /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Transação?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a transação "{transacao.descricao}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(transacao.id, transacao.type)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};