import { useState } from 'react';
import { SteamGeneration } from './pages/SteamGeneration';
import { Placeholder } from './pages/Placeholder';

type PageKey = '16_04' | 'INDEX' | 'UTILITY' | 'MOS' | 'C&E' | 'PAGE ACK';

const TABS: { key: PageKey; label: string }[] = [
  { key: '16_04',     label: '16_04'    },
  { key: 'INDEX',     label: 'INDEX'    },
  { key: 'UTILITY',   label: 'UTILITY'  },
  { key: 'MOS',       label: 'MOS'      },
  { key: 'C&E',       label: 'C&E'      },
  { key: 'PAGE ACK',  label: 'PAGE ACK' },
];

export function App() {
  const [page, setPage] = useState<PageKey>('16_04');

  return (
    <>
      <header className="titlebar">
        <div className="title">STEAM GENERATION</div>
        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`tab ${t.key === '16_04' ? 'page-id' : ''} ${page === t.key ? 'active' : ''}`}
              onClick={() => setPage(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="alarm-summary">
          <div className="alarm-cell"><span className="k">TIME</span><span className="v">{new Date().toLocaleString()}</span></div>
          <div className="alarm-cell"><span className="k">UNIT</span><span className="v">S21_IO</span></div>
          <div className="alarm-cell"><span className="k">STATUS</span><span className="v">VENT STM TO REF TUNNEL TERMINAL</span></div>
          <div className="alarm-badge">SYS_02</div>
          <div className="alarm-cell"><span className="k">OFFRNM / PVHIGH</span><span className="v">16 / 16</span></div>
          <div className="alarm-cell"><span className="k">ALARM U/L</span><span className="v">00 / 00</span></div>
          <div className="alarm-badge" style={{ background: '#c9a100', color: '#000' }}>ALARM STOP</div>
        </div>
      </header>

      <main className="workspace" style={{ position: 'relative' }}>
        {page === '16_04' && <SteamGeneration />}
        {page === 'INDEX'    && <Placeholder name="INDEX" />}
        {page === 'UTILITY'  && <Placeholder name="UTILITY" />}
        {page === 'MOS'      && <Placeholder name="MOS" />}
        {page === 'C&E'      && <Placeholder name="C&E" />}
        {page === 'PAGE ACK' && <Placeholder name="PAGE ACK" />}
      </main>

      <footer className="statusbar">
        <span>Sim: LIVE</span>
        <span>Tag: 16LIC0011A</span>
        <span>Click the cyan-outlined faceplate to change SP</span>
      </footer>
    </>
  );
}
