import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import App from './App';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';

test('renders login screen by default (public route)', () => {
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );

  expect(screen.getByText(/College Event Portal/i)).toBeInTheDocument();
});
