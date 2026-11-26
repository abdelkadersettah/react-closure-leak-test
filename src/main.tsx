import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// No <StrictMode>: in development it renders every component twice,
// which would double the number of big objects and blur the numbers.
createRoot(document.getElementById('root')!).render(<App />);
