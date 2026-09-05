import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LeaveRequestsSimple: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h1 style={{ margin: '0', padding: '20px 0', fontSize: '24px', color: '#000' }}>
        Solicitações de Licença - TESTE
      </h1>
      <div style={{ background: '#fff', padding: '20px', margin: '20px 0', border: '1px solid #ddd' }}>
        <p>Se você está vendo este texto no topo, o problema não está na página.</p>
        <p>Se ainda está centralizado, o problema está no Layout ou CSS global.</p>
        <p>Título: {t('leaves.title')}</p>
      </div>
    </div>
  );
};

export default LeaveRequestsSimple;