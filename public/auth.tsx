import React from 'react';
import { createRoot } from 'react-dom/client';
import AuthModel from '../models/AuthModel';
const root = createRoot(document.getElementById('auth') as HTMLElement);
root.render(<AuthModel />);
