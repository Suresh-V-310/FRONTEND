import { useState, useEffect } from 'react';

export function usePanelResize(containerId = 'compiler-split', initialWidth = 58) {
  const [editorWidth, setEditorWidth] = useState(initialWidth);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging) return;
      const container = document.getElementById(containerId);
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setEditorWidth(Math.min(Math.max(pct, 35), 75));
    };
    const onUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, containerId]);

  return {
    editorWidth,
    isDragging,
    onResizeStart: () => setIsDragging(true),
  };
}
