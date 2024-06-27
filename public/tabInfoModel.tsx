import React from 'react';
import { createRoot } from 'react-dom/client';
import TabUserModel from '../models/TabUserModel';
const root = createRoot(document.getElementById('tabInfoModel') as HTMLElement);
root.render(<TabUserModel />);
