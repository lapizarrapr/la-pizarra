/**
 * Password strength rule. Returns `true` when acceptable, or a Spanish message
 * explaining what is missing.
 */
export const LONGITUD_MINIMA = 12

export const validarContrasena = (contrasena: string, email?: string | null): string | true => {
  if (contrasena.length < LONGITUD_MINIMA) {
    return `La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres.`
  }

  const clases = [/[a-zñáéíóúü]/, /[A-ZÑÁÉÍÓÚÜ]/, /\d/, /[^A-Za-z0-9ñÑáéíóúüÁÉÍÓÚÜ]/]
  const cumplidas = clases.filter((clase) => clase.test(contrasena)).length
  if (cumplidas < 3) {
    return 'La contraseña debe combinar al menos tres de estos: minúsculas, mayúsculas, números y símbolos.'
  }

  const usuarioEmail = email?.split('@')[0]?.toLowerCase()
  if (usuarioEmail && usuarioEmail.length >= 4 && contrasena.toLowerCase().includes(usuarioEmail)) {
    return 'La contraseña no puede contener tu correo electrónico.'
  }

  if (/^(.)\1+$/.test(contrasena) || /^(0123456789|1234567890|abcdefghijkl)/i.test(contrasena)) {
    return 'La contraseña es demasiado fácil de adivinar.'
  }

  return true
}
