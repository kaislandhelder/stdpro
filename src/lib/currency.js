export function formatCurrency(value) {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return 'R$ 0,00';
  }
  
  let numericValue = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;
  
  if (isNaN(numericValue)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue);
}

export function parseCurrency(value) {
  if (typeof value !== 'string') {
    return 0;
  }
  const numberString = value.replace(/[R$\s.]/g, '').replace(',', '.');
  return parseFloat(numberString) || 0;
}