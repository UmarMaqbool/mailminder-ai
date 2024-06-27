import React from 'react';
import { createRoot } from 'react-dom/client';
import MainModel from './MainModel';
const root = createRoot(document.getElementById('iframe') as HTMLElement);
root.render(<MainModel />);
