import React from 'react';
import { createRoot } from 'react-dom/client';
import SubscriptionModel from './SubscriptionModel';
const root = createRoot(document.getElementById('infoModel') as HTMLElement);
root.render(<SubscriptionModel />);
