// src/main.tsx
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './hooks/useAuth'; // <-- Make sure this import exists

createRoot(document.getElementById("root")!).render(
  // <React.StrictMode> {/* Optional */}
    <AuthProvider> {/* <-- Make sure App is wrapped */}
      <App />
    </AuthProvider>
  // </React.StrictMode>
);