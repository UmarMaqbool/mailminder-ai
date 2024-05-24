import React from 'react';
import { createRoot } from 'react-dom/client';
import EmailSuggestions from './EmailSuggestions';
const root = createRoot(document.getElementById('iframe') as HTMLElement);
root.render(<EmailSuggestions />);
