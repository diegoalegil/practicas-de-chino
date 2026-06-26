// Motor FSRS sobre ts-fsrs (FSRS-6). Retención objetivo configurable, sin "ease hell".
import { createEmptyCard, fsrs, generatorParameters, Rating, type Card, type Grade } from 'ts-fsrs';
import type { GradoFsrs } from '../../types';

const PARAMS = generatorParameters({
  request_retention: 0.9, // alto pero no agotador
  maximum_interval: 365,
  enable_fuzz: true, // dispersa vencimientos, evita avalanchas
});

const motor = fsrs(PARAMS);

export type { Card } from 'ts-fsrs';

const GRADO_A_RATING: Record<GradoFsrs, Grade> = {
  1: Rating.Again,
  2: Rating.Hard,
  3: Rating.Good,
  4: Rating.Easy,
};

/** Crea una tarjeta nueva (estado New, estabilidad baja). */
export function nuevaTarjeta(ahora: Date): Card {
  return createEmptyCard(ahora);
}

/** Aplica un repaso y devuelve la tarjeta con su nuevo estado/vencimiento. */
export function repasar(card: Card, grado: GradoFsrs, ahora: Date): Card {
  return motor.next(card, ahora, GRADO_A_RATING[grado]).card;
}

/** ¿La tarjeta está vencida (debe repasarse) en el instante dado? */
export function estaVencida(card: Card, ahora: Date): boolean {
  return new Date(card.due).getTime() <= ahora.getTime();
}
