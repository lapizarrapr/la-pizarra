import { metadatosDeMes, VistaDeMes, type ParametrosDeMes } from '@/components/VistaDeMes'

type Props = { params: Promise<ParametrosDeMes> }

// Generated the first time someone visits, then cached until content changes.
export const generateStaticParams = () => []

export const generateMetadata = ({ params }: Props) => metadatosDeMes(params)

export default function Pagina({ params }: Props) {
  return <VistaDeMes params={params} />
}
