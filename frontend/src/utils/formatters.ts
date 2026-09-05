import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatString = 'dd/MM/yyyy'): string => {
  try {
    // parseISO (not `new Date(...)`) so a date-only string like "2026-11-20"
    // is read as local midnight instead of UTC midnight, which would render
    // as the previous day in any timezone behind UTC (e.g. America/Sao_Paulo).
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Data inválida';
    return format(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    return 'Data inválida';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatCurrency = (amount: number, currency = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
};

export const formatName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(dateObj)) return '';

  const diffMs = Date.now() - dateObj.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `há ${minutes} minuto${minutes === 1 ? '' : 's'}`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} hora${hours === 1 ? '' : 's'}`;

  const days = Math.round(hours / 24);
  return `há ${days} dia${days === 1 ? '' : 's'}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};