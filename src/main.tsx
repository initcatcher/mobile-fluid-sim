import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import App from './App';
import './app.css';

// Inject Vercel Analytics
inject();

const container = document.getElementById('root');
if (!container) {
	throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
	<StrictMode>
		<App />
	</StrictMode>
);