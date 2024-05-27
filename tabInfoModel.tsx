import React from 'react';
import { createRoot } from 'react-dom/client';
import TabUserProfile from './TabUserProfile';
const root = createRoot(document.getElementById('tabInfoModel') as HTMLElement);
root.render(<TabUserProfile />);
