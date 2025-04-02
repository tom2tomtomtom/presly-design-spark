import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from './components/ui/sonner'
import { StyleProvider } from './lib/StyleContext'

createRoot(document.getElementById("root")!).render(
  <StyleProvider>
    <App />
    <Toaster position="bottom-right" />
  </StyleProvider>
);
