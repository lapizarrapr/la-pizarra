import { metadatosDeListado, VistaDeListado, type Parametros } from '@/components/vistasDeListado'

type Props = { params: Promise<Parametros> }

// Later pages are generated the first time someone visits them, then cached.
export const generateStaticParams = () => []

export const generateMetadata = ({ params }: Props) => metadatosDeListado('etiqueta', params)

export default function Pagina({ params }: Props) {
  return <VistaDeListado tipo="etiqueta" params={params} />
}
