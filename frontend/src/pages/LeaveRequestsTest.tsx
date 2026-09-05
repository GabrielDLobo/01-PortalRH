import React from 'react';

const LeaveRequestsTest: React.FC = () => {
  return (
    <div style={{
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      background: '#f0f0f0',
      padding: '20px',
      display: 'block'
    }}>
      <h1 style={{
        margin: '0',
        padding: '0',
        textAlign: 'left',
        fontSize: '24px',
        color: '#000'
      }}>
        TESTE - Solicitações de Licença
      </h1>
      <p style={{
        margin: '10px 0',
        padding: '0',
        textAlign: 'left',
        color: '#666'
      }}>
        Este é um teste para verificar o posicionamento
      </p>
      <div style={{
        background: '#fff',
        padding: '20px',
        margin: '20px 0',
        border: '1px solid #ccc',
        textAlign: 'left'
      }}>
        <h2>Conteúdo de teste</h2>
        <p>Se você está vendo este conteúdo no topo da página, o problema não está no CSS global.</p>
      </div>
    </div>
  );
};

export default LeaveRequestsTest;