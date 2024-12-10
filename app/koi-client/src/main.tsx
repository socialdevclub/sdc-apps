import { createRoot } from 'react-dom/client';
import Global from './Global';

const selected = document.getElementById('root');
if (selected) {
  const root = createRoot(selected);
  root.render(<Global />);
}
