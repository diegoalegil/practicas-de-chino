// Entorno de pruebas: IndexedDB falso + mocks de Web Speech (no existen en jsdom).
import 'fake-indexeddb/auto';

class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text = '') {
    this.text = text;
  }
}

const speechSynthesisMock: Pick<
  SpeechSynthesis,
  'speaking' | 'paused' | 'pending' | 'cancel' | 'pause' | 'resume' | 'speak' | 'getVoices'
> = {
  speaking: false,
  paused: false,
  pending: false,
  cancel: () => undefined,
  pause: () => undefined,
  resume: () => undefined,
  speak: () => undefined,
  getVoices: () => [],
};

Object.defineProperty(globalThis, 'speechSynthesis', {
  value: speechSynthesisMock,
  writable: true,
  configurable: true,
});

Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
  value: MockSpeechSynthesisUtterance,
  writable: true,
  configurable: true,
});
