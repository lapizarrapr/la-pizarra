import { APIError, type CollectionBeforeOperationHook, type CollectionConfig } from 'payload'

import { actualizarUsuarios, campoSoloAdmin, leerUsuarios, soloAdmin } from '@/access'
import { esPersonal, type UsuarioConRol } from '@/access/roles'
import { validarContrasena } from '@/lib/contrasena'
import { correoRestablecerContrasena } from '@/lib/email/plantillas'

const SITIO = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

/**
 * Enforces the password strength rule everywhere a password can be set:
 * account creation, profile update and the "forgot password" reset.
 */
const exigirContrasenaFuerte: CollectionBeforeOperationHook = ({ args, operation }) => {
  if (operation !== 'create' && operation !== 'update' && operation !== 'resetPassword') {
    return args
  }
  const datos = (args as { data?: { password?: unknown; email?: unknown } }).data
  if (typeof datos?.password === 'string' && datos.password.length > 0) {
    const resultado = validarContrasena(
      datos.password,
      typeof datos.email === 'string' ? datos.email : undefined,
    )
    if (resultado !== true) throw new APIError(resultado, 400)
  }
  return args
}

export const Usuarios: CollectionConfig = {
  slug: 'usuarios',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    useAsTitle: 'nombre',
    defaultColumns: ['nombre', 'email', 'rol'],
    group: 'Redacción',
    description: 'Personas que pueden entrar al panel. Solo la administración puede crear cuentas.',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    tokenExpiration: 60 * 60 * 8,
    useSessions: true,
    forgotPassword: {
      generateEmailSubject: () => correoRestablecerContrasena('').subject,
      generateEmailHTML: (args) =>
        correoRestablecerContrasena(`${SITIO}/admin/reset/${args?.token ?? ''}`).html,
    },
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  access: {
    admin: ({ req }) => esPersonal(req.user as UsuarioConRol),
    create: soloAdmin,
    read: leerUsuarios,
    update: actualizarUsuarios,
    delete: soloAdmin,
    unlock: soloAdmin,
  },
  hooks: {
    beforeOperation: [exigirContrasenaFuerte],
    beforeChange: [
      // The very first account (created on the first visit to /admin) becomes
      // the administrator; `rol` is otherwise writable only by admins.
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'usuarios', req })
          if (totalDocs === 0) data.rol = 'admin'
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'nombre', type: 'text', label: 'Nombre', required: true },
    {
      name: 'rol',
      type: 'select',
      label: 'Rol',
      required: true,
      defaultValue: 'colaborador',
      saveToJWT: true,
      options: [
        { label: 'Administración (todo)', value: 'admin' },
        { label: 'Editor/a (publica y modera)', value: 'editor' },
        { label: 'Colaborador/a (escribe y envía a revisión)', value: 'colaborador' },
      ],
      access: { create: campoSoloAdmin, update: campoSoloAdmin },
      admin: {
        description:
          'Colaborador/a: escribe sus propios borradores. Editor/a: publica y borra artículos. Administración: además maneja usuarios y ajustes.',
      },
    },
  ],
}
