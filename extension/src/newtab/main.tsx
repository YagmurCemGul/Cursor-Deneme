import React from 'react';
import { createRoot } from 'react-dom/client';
import { NewTab } from './newtab';

const root = createRoot(document.getElementById('root')!);
root.render(<NewTab />);
