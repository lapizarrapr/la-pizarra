import { obtenerAjustes } from '@/lib/datos'
import { tarjetaSocial } from '@/lib/tarjetaSocial'

export async function GET() {
  const ajustes = await obtenerAjustes()
  return tarjetaSocial({
    titular: ajustes.descripcion ?? 'Noticias de la escuela pública de Puerto Rico',
  })
}
