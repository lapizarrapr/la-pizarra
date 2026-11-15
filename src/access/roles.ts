/**
 * Role helpers. Pure functions with no Payload imports so they are trivial to
 * unit-test and safe to reuse on the server and in hooks.
 */
export const ROLES = ['admin', 'editor', 'colaborador'] as const
export type Rol = (typeof ROLES)[number]

export type UsuarioConRol = { id: number | string; rol?: Rol | null } | null | undefined

export const esAdmin = (usuario: UsuarioConRol): boolean => usuario?.rol === 'admin'

export const esEditorOAdmin = (usuario: UsuarioConRol): boolean =>
  usuario?.rol === 'admin' || usuario?.rol === 'editor'

export const esColaborador = (usuario: UsuarioConRol): boolean => usuario?.rol === 'colaborador'

/** Any logged-in member of the newsroom, whatever the role. */
export const esPersonal = (usuario: UsuarioConRol): boolean =>
  Boolean(usuario) && ROLES.includes(usuario!.rol as Rol)
