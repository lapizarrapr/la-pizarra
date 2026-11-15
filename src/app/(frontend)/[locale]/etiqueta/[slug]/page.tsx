import { metadatosDeListado, VistaDeListado, type Parametros } from '@/components/vistasDeListado'
import { slugsDe } from '@/lib/datos'
import { LOCALES } from '@/lib/i18n'

type Props = { params: Promise<Parametros> }

export async function generateStaticParams() {
  const slugs = await slugsDe('etiquetas')
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export const generateMetadata = ({ params }: Props) => metadatosDeListado('etiqueta', params)

export default function Pagina({ params }: Props) {
  return <VistaDeListado tipo="etiqueta" params={params} />
}
