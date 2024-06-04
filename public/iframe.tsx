import React from 'react';
import { createRoot } from 'react-dom/client';
import MainModel from '../models/MainModel';
const root = createRoot(document.getElementById('iframe') as HTMLElement);
root.render(<MainModel />);
