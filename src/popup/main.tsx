import { createRoot } from 'react-dom/client';
import App from './popup';
import '../styles.css';
import '../styles/global.css';

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
