import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders dispersed text', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/dispersed/i);
  expect(linkElement).toBeInTheDocument();
});
