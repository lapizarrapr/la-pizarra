/**
 * Newsletter subscriptions behind a small interface. Today subscribers live
 * in Payload; to move to Buttondown, Mailchimp or similar later, write
 * another `ProveedorDeBoletin` and return it from `proveedorDeBoletin()`.
 * The forms and pages don't change.
 */
import { proveedorPayload } from './payload'

export type ResultadoDeEnlace = 'ok' | 'invalido'

export interface ProveedorDeBoletin {
  /**
   * Starts a subscription and sends the confirmation email (double opt-in).
   * Never reveals whether the address was already subscribed.
   */
  suscribir(email: string): Promise<void>
  /** Completes the subscription from the emailed link. */
  confirmar(token: string): Promise<ResultadoDeEnlace>
  /** Unsubscribes from the signed link included in every newsletter. */
  darDeBaja(id: string, firma: string): Promise<ResultadoDeEnlace>
}

export const proveedorDeBoletin = (): ProveedorDeBoletin => proveedorPayload

export { enlaceDeBaja } from './payload'
