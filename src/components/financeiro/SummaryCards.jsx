import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Wallet } from 'lucide-react';

export const SummaryCards = ({ ganhos, despesas, saldo }) => {
  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="luxury-card rounded-xl p-6 mb-6"
    >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-green-500 mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                <ArrowUp size={24} />
            </div>
            <h3 className="font-semibold text-muted-foreground text-sm">Ganhos</h3>
            <p className="text-xl font-bold text-green-500">R$ {ganhos.toFixed(2)}</p>
          </div>
          <div>
            <div className="text-red-500 mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <ArrowDown size={24} />
            </div>
            <h3 className="font-semibold text-muted-foreground text-sm">Despesas</h3>
            <p className="text-xl font-bold text-red-500">R$ {despesas.toFixed(2)}</p>
            </div>
          <div>
            <div className="text-blue-500 mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                <Wallet size={24} />
            </div>
            <h3 className="font-semibold text-muted-foreground text-sm">Saldo</h3>
            <p className={`text-xl font-bold ${saldo >= 0 ? 'text-blue-500' : 'text-red-500'}`}>R$ {saldo.toFixed(2)}</p>
          </div>
        </div>
    </motion.div>
  );
};