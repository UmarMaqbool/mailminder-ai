import React from 'react';
import { createRoot } from 'react-dom/client';
import UserProfile from './UserProfile';
const root = createRoot(document.getElementById('infoModel') as HTMLElement);
root.render(<UserProfile />);
