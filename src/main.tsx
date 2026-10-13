import { createRoot } from 'react-dom/client';
import { initPerf } from './lib/perf';
import App from './App';
import './styles/lite.css';

initPerf();
createRoot(document.getElementById('root')!).render(<App />);
