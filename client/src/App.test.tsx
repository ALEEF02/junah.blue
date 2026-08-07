import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

jest.mock('color-name-list', () => ({
  colornames: [{ name: 'Black', hex: '#000000' }]
}));

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn(async (input) => {
    const url = String(input);
    if (url.includes('/api/public/apparel/products')) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          products: [
            {
              id: 'poster-blue',
              title: 'AM I REAL ENOUGH YET? Poster - Blue',
              description: '',
              imageUrl: '',
              hasColorOption: false,
              hasSizeOption: true,
              variants: [
                {
                  id: 101,
                  title: '12″ x 18″ / Matte',
                  color: '',
                  size: '12″ x 18″',
                  priceCents: 2000,
                  sku: 'poster-blue',
                  isAvailable: true
                }
              ]
            }
          ]
        })
      } as Response;
    }

    return {
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Unauthorized' })
    } as Response;
  }) as jest.MockedFunction<typeof fetch>;
});

test('renders the public Events route', () => {
  window.history.replaceState({}, '', '/events');
  render(<App />);

  expect(screen.getByRole('heading', { name: 'EVENTS' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /upcoming events/i })).toHaveAttribute(
    'href',
    'https://linktr.ee/junahblue'
  );
});

test('redirects the legacy About route to Music', async () => {
  window.history.replaceState({}, '', '/about');
  render(<App />);

  expect(screen.getByRole('heading', { name: 'MUSIC' })).toBeInTheDocument();
  await waitFor(() => expect(window.location.pathname).toBe('/music'));
});

test('renders the activation registration fields', () => {
  window.history.replaceState({}, '', '/activate');
  render(<App />);

  expect(screen.getByLabelText('Full name')).toBeRequired();
  expect(screen.getByLabelText('Email address')).toBeRequired();
  expect(screen.getByLabelText('Phone number')).toBeRequired();
});

test('hides color controls when Printify has no true color option', async () => {
  window.history.replaceState({}, '', '/apparel');
  render(<App />);

  expect(await screen.findByText('AM I REAL ENOUGH YET? Poster - Blue')).toBeInTheDocument();
  expect(screen.queryByLabelText('Color')).not.toBeInTheDocument();
  expect(screen.getByText('12″ x 18″')).toBeInTheDocument();
});
