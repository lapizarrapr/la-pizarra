/**
 * Saves a full copy of the PRODUCTION database to this computer.
 *
 *   pnpm respaldo
 *
 * Reads the connection string from `.env.respaldo` (one line:
 * RESPALDO_DATABASE_URL=postgresql://…) and writes
 * `respaldos/lapizarra-AAAA-MM-DD-HHMM.dump`. Both are ignored by git.
 *
 * It only READS from the database. `pg_dump` runs inside Docker, so nothing
 * else has to be installed. See DEPLOY.md for how to restore a copy.
 */
import { spawn } from 'node:child_process'
import { createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const archivoEnv = path.join(raiz, '.env.respaldo')

const salir = (mensaje) => {
  console.error(`\n✗ ${mensaje}\n`)
  process.exit(1)
}

const leerVariable = (nombre) => {
  if (process.env[nombre]) return process.env[nombre]
  if (!existsSync(archivoEnv)) return undefined
  const linea = readFileSync(archivoEnv, 'utf8')
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith(`${nombre}=`))
  return linea
    ?.slice(linea.indexOf('=') + 1)
    .trim()
    .replace(/^["']|["']$/g, '')
}

const url = leerVariable('RESPALDO_DATABASE_URL')
if (!url) {
  salir(
    'Falta la dirección de la base de datos.\n  Crea el archivo .env.respaldo con una línea:\n  RESPALDO_DATABASE_URL=postgresql://…   (la conexión DIRECTA de Neon, sin "-pooler")',
  )
}

// pg_dump must be the same major version as the server, or newer.
const imagen = leerVariable('RESPALDO_IMAGEN') || 'postgres:17-alpine'

const ahora = new Date()
const dos = (n) => String(n).padStart(2, '0')
const sello = `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}-${dos(ahora.getHours())}${dos(ahora.getMinutes())}`
const carpeta = path.join(raiz, 'respaldos')
mkdirSync(carpeta, { recursive: true })
const destino = path.join(carpeta, `lapizarra-${sello}.dump`)

console.log(`Guardando copia de la base de datos en ${path.relative(raiz, destino)} …`)

// The connection string travels in an environment variable, never on the
// command line, so it does not show up in process lists or shell history.
const proceso = spawn(
  'docker',
  [
    'run',
    '--rm',
    '-e',
    'PGURL',
    imagen,
    'sh',
    '-c',
    'pg_dump --dbname="$PGURL" --format=custom --no-owner --no-privileges',
  ],
  { env: { ...process.env, PGURL: url }, stdio: ['ignore', 'pipe', 'inherit'] },
)

const archivo = createWriteStream(destino)
proceso.stdout.pipe(archivo)

proceso.on('error', () => {
  rmSync(destino, { force: true })
  salir('No se pudo ejecutar Docker. Abre Docker Desktop, espera a que arranque y repite.')
})

proceso.on('close', (codigo) => {
  archivo.close(() => {
    const bytes = existsSync(destino) ? statSync(destino).size : 0
    if (codigo !== 0 || bytes === 0) {
      rmSync(destino, { force: true })
      salir('La copia falló (el mensaje de arriba dice por qué). No se guardó ningún archivo.')
    }
    console.log(`✓ Copia guardada: ${(bytes / 1024 / 1024).toFixed(2)} MB`)
    console.log(
      '  Contiene correos de suscriptores y mensajes privados: guárdala en un lugar seguro.',
    )
  })
})
