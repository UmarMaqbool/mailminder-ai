import React from 'react';
import { createRoot } from 'react-dom/client';
import UserModel from '../models/UserModel';
const root = createRoot(document.getElementById('infoModel') as HTMLElement);
root.render(<UserModel />);
