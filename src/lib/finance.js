import { parseCurrency } from './currency';

export const calculateFinancials = (agendamentos) => {
    const savedExpenses = localStorage.getItem('studiogestor_despesas');
    const savedRevenues = localStorage.getItem('studiogestor_receitas');
    const despesas = savedExpenses ? JSON.parse(savedExpenses) : [];
    const receitas = savedRevenues ? JSON.parse(savedRevenues) : [];
    
    const hoje = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    const inicioQuinzena = new Date(hoje);
    inicioQuinzena.setDate(hoje.getDate() < 15 ? 1 : 15);
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const filterAndSum = (items, dateKey, startDate, statusFilter = false) => {
        return items
            .filter(item => {
                const itemDate = new Date(item[dateKey] + 'T00:00:00'); // Ensure correct date parsing
                const condition = itemDate >= startDate;
                return statusFilter ? condition && item.status === 'present' : condition;
            })
            .reduce((total, item) => total + (item.valor || 0), 0);
    };

    const ganhosAgendamentos = {
      dia: filterAndSum(agendamentos, 'data', inicioDia, true),
      semana: filterAndSum(agendamentos, 'data', inicioSemana, true),
      quinzena: filterAndSum(agendamentos, 'data', inicioQuinzena, true),
      mes: filterAndSum(agendamentos, 'data', inicioMes, true),
    };

    const ganhosReceitas = {
      dia: filterAndSum(receitas, 'data', inicioDia),
      semana: filterAndSum(receitas, 'data', inicioSemana),
      quinzena: filterAndSum(receitas, 'data', inicioQuinzena),
      mes: filterAndSum(receitas, 'data', inicioMes),
    };
    
    const ganhosTotais = {
      dia: ganhosAgendamentos.dia + ganhosReceitas.dia,
      semana: ganhosAgendamentos.semana + ganhosReceitas.semana,
      quinzena: ganhosAgendamentos.quinzena + ganhosReceitas.quinzena,
      mes: ganhosAgendamentos.mes + ganhosReceitas.mes,
    };

    const despesasTotais = {
      dia: filterAndSum(despesas, 'data', inicioDia),
      semana: filterAndSum(despesas, 'data', inicioSemana),
      quinzena: filterAndSum(despesas, 'data', inicioQuinzena),
      mes: filterAndSum(despesas, 'data', inicioMes),
    };

    const saldoTotal = {
        dia: ganhosTotais.dia - despesasTotais.dia,
        semana: ganhosTotais.semana - despesasTotais.semana,
        quinzena: ganhosTotais.quinzena - despesasTotais.quinzena,
        mes: ganhosTotais.mes - despesasTotais.mes,
    };
    
    const allTransactions = [
        ...despesas.map(d => ({ ...d, type: 'despesa', valor: typeof d.valor === 'string' ? parseCurrency(d.valor) : d.valor })), 
        ...receitas.map(r => ({ ...r, type: 'receita', valor: typeof r.valor === 'string' ? parseCurrency(r.valor) : r.valor }))
    ].sort((a, b) => new Date(b.data) - new Date(a.data));
    
    return {
        ganhos: ganhosTotais,
        despesas: despesasTotais,
        saldo: saldoTotal,
        allTransactions
    };
};