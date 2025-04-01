import React from 'react';
import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => <h1>Hello, React with Webpack!!!</h1>;

const root = createRoot(document.getElementById('root'));
root.render(<App />);