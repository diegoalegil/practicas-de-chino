// Declaración mínima de hanzi-writer con sólo la superficie de API que usamos.
// El paquete no está instalado en el entorno de tipado; esta declaración cubre
// exactamente lo que consume index.ts para no romper el typecheck estricto.

declare module 'hanzi-writer' {
  export interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    showCharacter?: boolean;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    strokeColor?: string;
    radicalColor?: string;
    outlineColor?: string;
    drawingColor?: string;
    highlightColor?: string;
    onLoadCharDataError?: (reason: unknown) => void;
    onLoadCharDataSuccess?: (data: unknown) => void;
  }

  export interface QuizSummary {
    character: string;
    totalMistakes: number;
  }

  export interface QuizOptions {
    onComplete?: (summary: QuizSummary) => void;
    onCorrectStroke?: (data: { strokeNum: number; mistakesOnStroke: number }) => void;
    onMistake?: (data: { strokeNum: number; mistakesOnStroke: number }) => void;
    showHintAfterMisses?: number | false;
    leniency?: number;
  }

  export interface HanziWriterInstance {
    animateCharacter(options?: { onComplete?: () => void }): Promise<void>;
    quiz(options?: QuizOptions): void;
    cancelQuiz(): void;
    hideCharacter(): Promise<void>;
    showCharacter(): Promise<void>;
    setCharacter(character: string): Promise<void>;
  }

  export default class HanziWriter {
    static create(
      element: HTMLElement | string,
      character: string,
      options?: HanziWriterOptions,
    ): HanziWriterInstance;
  }
}
