import React from 'react';
import { motion } from 'framer-motion';
import { Bug, User, Building } from 'lucide-react';

export default function Debug({ profile, logs }) {
  const safeLogs = logs || [];

  return (
    <motion.div
      className="p-4 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground flex items-center">
          <Bug className="mr-3 text-primary" size={28} />
          Debug
        </h2>
      </div>

      <div className="luxury-card rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Profile State</h3>
        <div className="p-3 bg-input border border-border rounded-lg space-y-2">
          <p className="flex items-center">
            <User size={16} className="mr-2 text-muted-foreground" />
            <strong>Display Name:</strong>
            <span className="ml-2 font-mono text-primary">{profile?.display_name || 'null'}</span>
          </p>
          <p className="flex items-center">
            <Building size={16} className="mr-2 text-muted-foreground" />
            <strong>Establishment Name:</strong>
            <span className="ml-2 font-mono text-primary">{profile?.establishment_name || 'null'}</span>
          </p>
          <p>
            <strong>Full Profile:</strong>
            <pre className="mt-2 p-2 bg-background rounded-md text-xs overflow-x-auto">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </p>
        </div>
      </div>

      <div className="luxury-card rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Action Logs</h3>
        <div className="p-3 bg-input border border-border rounded-lg h-96 overflow-y-auto flex flex-col-reverse">
          {safeLogs.length > 0 ? (
            safeLogs.map((log, index) => (
              <p key={index} className="font-mono text-sm text-muted-foreground border-b border-border/50 py-1">
                {log}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground">Nenhum log registrado ainda.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}