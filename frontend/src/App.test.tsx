import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renderiza a tela de login quando não há sessão ativa', async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Entrar no sistema' })).toBeInTheDocument();
  });
});
