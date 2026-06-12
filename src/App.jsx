import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './shared/theme/ThemeContext.jsx';
import { EditorProvider } from './features/workspace/context/EditorContext.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <EditorProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compiler" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route path="/profile" element={<Navigate to="/" replace />} />
            <Route path="/saved" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              },
            }}
          />
        </EditorProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
