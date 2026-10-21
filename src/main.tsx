import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { registerServiceWorker } from './lib/pwa'
import { setupChunkReload } from './lib/chunkReload'
import { setupCopyAttribution } from './lib/copyProtection'

setupChunkReload();
setupCopyAttribution();

createRoot(document.getElementById("root")!).render(<App />);

registerServiceWorker();