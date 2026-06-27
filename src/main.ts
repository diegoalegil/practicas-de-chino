import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ink.css';
import './core/errors.css';
import { mountApp } from './app';
import { mostrarSplash } from './ui/animations/splash';
import { instalarErrorBoundary } from './core/errors';
import { aplicarTemaGuardado } from './core/theme';
import { aplicarEscalaGuardada, aplicarReduceMotionGuardado } from './modules/settings/prefs';
import { debeMostrarOnboarding, mostrarOnboarding } from './modules/onboarding';

instalarErrorBoundary();
aplicarTemaGuardado();
aplicarEscalaGuardada();
aplicarReduceMotionGuardado();

const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  void mostrarSplash().then(() => {
    mountApp(root);
    if (debeMostrarOnboarding()) {
      void mostrarOnboarding();
    }
  });
}
