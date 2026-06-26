import './styles/tokens.css';
import './styles/base.css';
import './styles/ink.css';
import { mountApp } from './app';

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  mountApp(root);
}
