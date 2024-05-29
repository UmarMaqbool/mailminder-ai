import React from 'react';
import { createRoot } from 'react-dom/client';
import AuthModel from './AuthModel';
const root = createRoot(document.getElementById('auth') as HTMLElement);
root.render(<AuthModel />);
