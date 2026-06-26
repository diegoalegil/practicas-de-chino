import './styles/tokens.css';
import './styles/base.css';
import './styles/ink.css';
import { mountApp } from './app';
import { mostrarSplash } from './ui/animations/splash';

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  void mostrarSplash().then(() => {
    mountApp(root);
  });
}
