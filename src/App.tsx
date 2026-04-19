import { useState } from 'react';
import { Degasser } from './pages/Degasser';
import { Placeholder } from './pages/Placeholder';

type PageKey = 'DEGASSER' | 'INDEX';

export function App() {
  const [page, setPage] = useState<PageKey>('DEGASSER');

  return (
    <>
      <main className="workspace-full" style={{ position: 'relative' }}>
        {page === 'DEGASSER' && <Degasser />}
        {page === 'INDEX'    && <Placeholder name="INDEX" />}

        {/* Minimal floating nav — INDEX only */}
        <button
          onClick={() => setPage(page === 'INDEX' ? 'DEGASSER' : 'INDEX')}
          className="index-btn"
        >
          {page === 'INDEX' ? '◀ BACK' : 'INDEX'}
        </button>
      </main>
    </>
  );
}
