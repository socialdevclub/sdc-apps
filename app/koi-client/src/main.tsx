import { createRoot } from 'react-dom/client';
import Global from './Global';

const selected = document.getElementById('root');
if (selected) {
  const root = createRoot(selected);
  // @ts-expect-error 왜 에러나지?
  root.render(<Global />);
}
