/**
 * Sample content for local development. Everything here is FICTIONAL:
 * people, schools, figures and quotes are invented to exercise the design.
 */
import { cita, documento, titulo } from './lexical'

export const AVISO =
  'Contenido de muestra: las personas, escuelas, cifras y citas de este texto son ficticias.'

export const CATEGORIAS = [
  [
    'Educación Pública',
    'Noticias y análisis sobre el sistema público de enseñanza de Puerto Rico.',
  ],
  [
    'Presupuesto y Fondos',
    'A dónde va el dinero de la educación: presupuesto, fondos federales y contratos.',
  ],
  [
    'Cierres de Escuelas',
    'El impacto de los cierres y consolidaciones en estudiantes, familias y comunidades.',
  ],
  ['Infraestructura', 'Planteles, reparaciones, columnas cortas, energía y agua en las escuelas.'],
  ['Educación Especial', 'Servicios, terapias y derechos del estudiantado de educación especial.'],
  [
    'Magisterio y Pensiones',
    'Salario, condiciones de trabajo, retiro y organización del magisterio.',
  ],
  ['Voces Estudiantiles', 'Textos escritos por estudiantes de escuela pública.'],
  ['Opinión', 'Columnas y cartas. Las opiniones son de quien las firma.'],
  ['Internacional', 'Educación pública en el Caribe, América Latina y el mundo.'],
] as const

export const ETIQUETAS = [
  'Presupuesto',
  'Planta física',
  'Terapias',
  'Retiro',
  'Comunidad',
  'Organización magisterial',
  'Comedores escolares',
  'Transportación',
  'Salud mental',
  'América Latina',
] as const

export type AutorClave = 'carmen' | 'rafael' | 'pitirre'

export type ArticuloSemilla = {
  titulo: string
  subtitulo: string
  categoria: (typeof CATEGORIAS)[number][0]
  tipo: 'noticia' | 'reportaje' | 'opinion' | 'entrevista' | 'carta_estudiante'
  region?: 'puerto_rico' | 'internacional'
  municipio?: string
  autores: AutorClave[]
  etiquetas: (typeof ETIQUETAS)[number][]
  /** Days before "now" that it was published. Omit for unpublished states. */
  haceDias?: number
  estado?: 'borrador' | 'en_revision'
  destacado?: boolean
  ultimaHora?: boolean
  feDeErrata?: string
  imagen?: { alt: string; color: string }
  cuerpo: ReturnType<typeof documento>
}

export const ARTICULOS: ArticuloSemilla[] = [
  {
    titulo: 'Tres escuelas de la montaña comienzan el semestre sin maestros de ciencia',
    subtitulo:
      'Familias de la región central denuncian que las plazas llevan vacantes desde agosto y que el estudiantado de duodécimo grado pasa la hora en el comedor.',
    categoria: 'Educación Pública',
    tipo: 'noticia',
    municipio: 'orocovis',
    autores: ['carmen'],
    etiquetas: ['Comunidad'],
    haceDias: 0,
    destacado: true,
    ultimaHora: true,
    imagen: {
      alt: 'Salón de clases vacío con pupitres alineados y una pizarra verde al fondo',
      color: '#1f3d36',
    },
    cuerpo: documento(
      'A tres semanas de comenzar el semestre, tres escuelas superiores de la región central todavía no tienen maestros de ciencia asignados. Según madres y padres consultados, cerca de 240 estudiantes pasan ese periodo en el comedor o en la biblioteca, sin plan de trabajo.',
      '“Mi hija quiere estudiar enfermería y este año le toca química. No es una clase que se pueda regalar”, dijo una madre que pidió no ser identificada para proteger a su hija.',
      titulo('Lo que dice la región educativa'),
      'Un portavoz de la oficina regional indicó por escrito que las plazas “están en proceso de reclutamiento” y que se evalúa ofrecer el curso de forma virtual mientras tanto. No ofreció fecha.',
      cita('No es una clase que se pueda regalar.', 'Madre de una estudiante de duodécimo grado'),
      'El consejo escolar de una de las escuelas convocó una asamblea de familias para el próximo jueves en la cancha del plantel.',
      AVISO,
    ),
  },
  {
    titulo: 'El presupuesto escolar por dentro: cuánto llega de verdad al salón',
    subtitulo:
      'Revisamos las partidas del año fiscal para explicar, en lenguaje sencillo, qué parte del dinero se queda en oficinas centrales y qué parte ven las escuelas.',
    categoria: 'Presupuesto y Fondos',
    tipo: 'reportaje',
    autores: ['rafael', 'carmen'],
    etiquetas: ['Presupuesto'],
    haceDias: 1,
    destacado: true,
    imagen: {
      alt: 'Calculadora, libreta y lápiz sobre un escritorio de maestro',
      color: '#5b4a2f',
    },
    cuerpo: documento(
      'Cada año se anuncia una cifra enorme para educación. Pero entre ese titular y la tiza que una maestra compra de su bolsillo hay un camino largo. Este reportaje sigue ese camino partida por partida.',
      titulo('Tres preguntas para leer cualquier presupuesto'),
      'Primero: ¿cuánto es nómina y cuánto es servicio directo? Segundo: ¿cuánto depende de fondos federales que vencen? Tercero: ¿quién decide las compras, la escuela o la oficina central?',
      'En las escuelas consultadas para este trabajo, las directoras coinciden en que el presupuesto que manejan directamente no alcanza para materiales básicos más allá de octubre.',
      cita(
        'El presupuesto se discute en millones, pero se sufre en resmas de papel.',
        'Directora escolar con 22 años de servicio',
      ),
      'En próximas entregas explicaremos cómo solicitar los documentos públicos de tu escuela y cómo leerlos.',
      AVISO,
    ),
  },
  {
    titulo:
      'A siete años del cierre, la escuela del barrio sigue vacía y la comunidad la quiere de vuelta',
    subtitulo:
      'Vecinos limpian el plantel cada mes y proponen convertirlo en centro comunitario con tutorías. El edificio sigue sin uso oficial.',
    categoria: 'Cierres de Escuelas',
    tipo: 'reportaje',
    municipio: 'las-marias',
    autores: ['rafael'],
    etiquetas: ['Comunidad', 'Planta física'],
    haceDias: 2,
    destacado: true,
    imagen: {
      alt: 'Portón oxidado de una escuela cerrada, con maleza creciendo en la entrada',
      color: '#4a4a44',
    },
    cuerpo: documento(
      'El portón tiene un candado nuevo, pero la llave la guarda la comunidad. Cada primer sábado de mes, una docena de vecinos entra a cortar la grama de la escuela que cerró hace siete años.',
      '“Aquí estudió mi mamá, estudié yo y estudiaron mis hijos. Mis nietos cogen una guagua de cuarenta minutos”, cuenta un líder comunitario mientras señala el salón que fue de kindergarten.',
      titulo('Una propuesta sobre la mesa'),
      'La junta comunitaria presentó un plan para usar el edificio como centro de tutorías, biblioteca y refugio. Solicitan un acuerdo de uso por diez años.',
      'Mientras tanto, el cierre cambió la rutina del barrio: el colmado de enfrente cerró, y la parada de guaguas escolares se llena antes de que salga el sol.',
      AVISO,
    ),
  },
  {
    titulo: 'Columnas cortas: lo que tu escuela debe informarte y cómo pedirlo',
    subtitulo:
      'Una guía práctica para familias y maestros sobre el estado estructural de los planteles y los documentos que puedes solicitar.',
    categoria: 'Infraestructura',
    tipo: 'reportaje',
    autores: ['carmen'],
    etiquetas: ['Planta física'],
    haceDias: 3,
    imagen: {
      alt: 'Pasillo de una escuela con columnas de hormigón y pintura descascarada',
      color: '#3d5a66',
    },
    cuerpo: documento(
      'Después de cada temblor fuerte vuelve la misma pregunta al chat de madres y padres: ¿esta escuela es segura? La respuesta no debería depender de rumores.',
      titulo('Qué puedes pedir'),
      'Tienes derecho a solicitar el informe de inspección estructural más reciente del plantel, el plan de emergencias y el registro de reparaciones. Pídelo por escrito y guarda copia con fecha.',
      'Si la escuela no tiene los documentos, la solicitud puede dirigirse a la oficina regional. En esta guía incluimos un modelo de carta que puedes copiar.',
      AVISO,
    ),
  },
  {
    titulo: 'Sin terapias desde agosto: familias de educación especial llevan la cuenta',
    subtitulo:
      'Un grupo de madres documenta en una libreta compartida cada terapia que no se ofreció. Ya suman más de 300 sesiones.',
    categoria: 'Educación Especial',
    tipo: 'noticia',
    municipio: 'bayamon',
    autores: ['carmen'],
    etiquetas: ['Terapias', 'Comunidad'],
    haceDias: 4,
    destacado: true,
    feDeErrata:
      'Una versión anterior de esta nota indicaba 400 sesiones. La cifra correcta, según el registro de las familias, es 300. Corregido el mismo día de publicación.',
    imagen: {
      alt: 'Manos de una madre anotando fechas en una libreta sobre una mesa',
      color: '#6b3f4a',
    },
    cuerpo: documento(
      'La libreta empezó como un desahogo. Hoy es evidencia. En ella, un grupo de madres anota cada sesión de terapia del habla, ocupacional o psicológica que sus hijos debieron recibir y no recibieron.',
      'Según su registro, desde agosto se han dejado de ofrecer más de 300 sesiones entre 41 estudiantes de cuatro escuelas.',
      cita(
        'Cada terapia que no se da es tiempo que mi hijo no recupera.',
        'Madre de un estudiante de tercer grado',
      ),
      'Las familias entregarán copia del registro en la oficina regional y solicitarán un plan de servicios compensatorios.',
      AVISO,
    ),
  },
  {
    titulo: '“Me jubilo con menos de lo que me prometieron”: una maestra saca cuentas',
    subtitulo:
      'Después de 30 años en el salón, una maestra de escuela elemental explica con sus propios números cómo cambió su retiro.',
    categoria: 'Magisterio y Pensiones',
    tipo: 'entrevista',
    municipio: 'ponce',
    autores: ['rafael'],
    etiquetas: ['Retiro', 'Organización magisterial'],
    haceDias: 5,
    imagen: {
      alt: 'Maestra de espaldas escribiendo operaciones matemáticas en una pizarra',
      color: '#2f4a3f',
    },
    cuerpo: documento(
      'Tiene una carpeta azul con treinta años de talonarios. La abre sobre el escritorio del salón donde ha enseñado a leer a tres generaciones del mismo barrio.',
      titulo('¿Qué esperaba y qué recibirá?'),
      '“Cuando empecé me dijeron: trabaja treinta años y te retiras con dignidad. Hice mi parte”, dice. Según sus cálculos, su pensión será considerablemente menor de lo que proyectaba hace una década.',
      titulo('¿Por qué sigue en el salón?'),
      '“Porque estos nenes no tienen la culpa. Pero una no puede vivir de vocación”.',
      cita('Una no puede vivir de vocación.', 'Maestra de escuela elemental, 30 años de servicio'),
      AVISO,
    ),
  },
  {
    titulo: 'Carta a quien decide el menú del comedor',
    subtitulo:
      'Una estudiante de undécimo grado escribe sobre lo que significa el almuerzo escolar cuando es la comida más completa del día.',
    categoria: 'Voces Estudiantiles',
    tipo: 'carta_estudiante',
    autores: ['pitirre'],
    etiquetas: ['Comedores escolares'],
    haceDias: 1,
    destacado: true,
    imagen: {
      alt: 'Bandeja de comedor escolar con arroz, habichuelas y una fruta',
      color: '#7a5a1f',
    },
    cuerpo: documento(
      'A quien corresponda: le escribo desde la fila del comedor, que es donde una aprende a esperar.',
      'Quiero darle las gracias a las empleadas del comedor, que se saben nuestros nombres y a quién no le gusta la calabaza. Y quiero pedirle a usted, que decide desde lejos, que venga un día a almorzar con nosotros.',
      'Para muchos de mis compañeros esta bandeja es la comida más completa del día. Cuando el menú se achica, no se achica un número: se achica la tarde entera.',
      cita('Venga un día a almorzar con nosotros.'),
      AVISO,
    ),
  },
  {
    titulo: 'Lo que aprendí cuando cerraron mi escuela',
    subtitulo:
      'Un testimonio estudiantil sobre cambiar de plantel, de amistades y de guagua en un mismo verano.',
    categoria: 'Voces Estudiantiles',
    tipo: 'carta_estudiante',
    autores: ['pitirre'],
    etiquetas: ['Transportación', 'Salud mental'],
    haceDias: 6,
    cuerpo: documento(
      'Nos enteramos por la radio. Mi abuela subió el volumen y dijo el nombre de mi escuela en voz alta, como para ver si así sonaba menos cierto.',
      'En la escuela nueva nadie sabía que yo era buena en español. Tuve que volver a demostrarlo todo. Aprendí a levantarme a las cinco y a dormir en la guagua con la mochila de almohada.',
      'También aprendí que una escuela no es el edificio. Pero el edificio ayuda.',
      AVISO,
    ),
  },
  {
    titulo: 'Evaluar al maestro sin mirar el salón es evaluar otra cosa',
    subtitulo:
      'Los instrumentos de evaluación miden papeles entregados a tiempo. Lo que pasa entre una maestra y su grupo no cabe en esa rúbrica.',
    categoria: 'Opinión',
    tipo: 'opinion',
    autores: ['rafael'],
    etiquetas: ['Organización magisterial'],
    haceDias: 2,
    cuerpo: documento(
      'Este semestre me evaluaron tres veces. En ninguna de las tres alguien se sentó a ver una clase completa.',
      'Se revisaron planes, tablones de expresión y evidencias en una carpeta. Todo eso importa. Pero ninguna rúbrica preguntó si mis estudiantes ahora discuten con argumentos, que es lo que enseño.',
      'Propongo algo sencillo: que quien evalúa haya dado clases en la última década y que se quede los cincuenta minutos.',
      AVISO,
    ),
  },
  {
    titulo: 'La escuela pública también se defiende leyendo en voz alta',
    subtitulo:
      'Una columna sobre bibliotecas escolares cerradas y lo que una comunidad puede hacer mientras tanto.',
    categoria: 'Opinión',
    tipo: 'opinion',
    autores: ['carmen'],
    etiquetas: ['Comunidad'],
    haceDias: 7,
    cuerpo: documento(
      'La biblioteca de mi escuela lleva dos años cerrada porque no hay bibliotecaria. Los libros siguen ahí, detrás de una puerta con cristal, como en un museo.',
      'Así que los viernes saco una caja al pasillo. Leemos en voz alta veinte minutos. Empezaron viniendo seis estudiantes; ya no cabemos.',
      'No es la solución. La solución es una plaza. Pero mientras llega, la lectura no puede esperar detrás del cristal.',
      AVISO,
    ),
  },
  {
    titulo: 'Docentes de la región reclaman más inversión educativa en una jornada continental',
    subtitulo:
      'Organizaciones magisteriales de varios países coordinaron actividades simultáneas en defensa de la educación pública.',
    categoria: 'Internacional',
    tipo: 'noticia',
    region: 'internacional',
    autores: ['rafael'],
    etiquetas: ['América Latina', 'Organización magisterial', 'Presupuesto'],
    haceDias: 3,
    imagen: {
      alt: 'Multitud de docentes marchando por una avenida con pancartas',
      color: '#324a6b',
    },
    cuerpo: documento(
      'Con clases públicas en plazas, marchas y asambleas, organizaciones de docentes de distintos países de América Latina y el Caribe realizaron una jornada conjunta para exigir mayor inversión en educación pública.',
      'Entre los reclamos comunes figuran salarios que alcancen el costo de vida, planteles seguros y el fin de la contratación temporal como norma.',
      'Delegadas del magisterio puertorriqueño participaron de forma virtual en el foro de cierre.',
      AVISO,
    ),
  },
  {
    titulo: 'Guaguas escolares: rutas más largas, madrugadas más cortas',
    subtitulo:
      'Un vistazo a cómo la consolidación de escuelas alargó el viaje diario de cientos de estudiantes.',
    categoria: 'Cierres de Escuelas',
    tipo: 'noticia',
    municipio: 'utuado',
    autores: ['carmen'],
    etiquetas: ['Transportación'],
    haceDias: 8,
    cuerpo: documento(
      'La primera parada es a las 5:10 de la mañana. A esa hora sube un niño de segundo grado con su mamá, que espera a que la guagua arranque para irse a trabajar.',
      'Desde la consolidación, la ruta recoge estudiantes de tres barrios y tarda cerca de una hora en llegar al plantel receptor.',
      'Las familias piden una segunda guagua para dividir la ruta.',
      AVISO,
    ),
  },
  // ── Not published: these exercise the newsroom workflow ────────────────────
  {
    titulo: 'Salones sin aire y sin abanicos: el calor como problema de aprendizaje',
    subtitulo: 'Borrador en revisión: falta confirmar temperaturas medidas en dos planteles.',
    categoria: 'Infraestructura',
    tipo: 'reportaje',
    autores: ['carmen'],
    etiquetas: ['Planta física', 'Salud mental'],
    estado: 'en_revision',
    cuerpo: documento(
      'A la una de la tarde el termómetro del salón marca una temperatura que nadie aceptaría en una oficina.',
      'Este reportaje recoge mediciones hechas por estudiantes de ciencia durante dos semanas.',
      AVISO,
    ),
  },
  {
    titulo: 'Ideas para una sección de deportes escolares',
    subtitulo: 'Borrador de trabajo.',
    categoria: 'Voces Estudiantiles',
    tipo: 'carta_estudiante',
    autores: ['pitirre'],
    etiquetas: [],
    estado: 'borrador',
    cuerpo: documento('Notas sueltas: torneo intramural, entrevista al equipo de voleibol.', AVISO),
  },
]

export const PAGINAS = [
  {
    titulo: 'Sobre Nosotros',
    slug: 'sobre-nosotros',
    introduccion:
      'La Pizarra es un espacio hecho por maestras, maestros y estudiantes de la escuela pública de Puerto Rico.',
    bloques: [
      'La Pizarra nace en el salón de clases. Publicamos noticias, reportajes y opinión sobre la educación pública desde la mirada de quienes la viven todos los días.',
      'Somos independientes. No recibimos dinero de partidos, agencias de gobierno ni contratistas del sistema educativo.',
    ],
  },
  {
    titulo: 'Política Editorial',
    slug: 'politica-editorial',
    introduccion:
      'Cómo decidimos qué publicar, cómo corregimos y cómo protegemos a nuestras fuentes y estudiantes.',
    bloques: [
      'Verificamos los datos antes de publicar y distinguimos con claridad entre noticia y opinión.',
      'Cuando nos equivocamos, lo corregimos y lo decimos: cada corrección aparece como “Fe de errata” al final del artículo.',
      'Las y los estudiantes menores de edad firman con seudónimo o iniciales. Nunca publicamos su apellido ni su foto.',
    ],
  },
  {
    titulo: 'Contacto',
    slug: 'contacto',
    introduccion: 'Escríbenos. Leemos todos los mensajes.',
    bloques: ['¿Tienes una pregunta, una corrección o una idea? Usa el formulario de esta página.'],
    formulario: 'contacto' as const,
  },
  {
    titulo: 'Cómo Colaborar',
    slug: 'como-colaborar',
    introduccion:
      'Si eres maestra, maestro o estudiante de escuela pública, este espacio también es tuyo.',
    bloques: [
      'Puedes enviarnos una historia, una pista o un texto de opinión. La redacción te acompaña en la edición.',
      'Si eres estudiante menor de edad, necesitaremos la autorización de tu madre, padre o encargado antes de publicar.',
    ],
    formulario: 'historia' as const,
  },
  {
    titulo: 'Privacidad',
    slug: 'privacidad',
    introduccion: 'Qué datos recogemos (muy pocos) y para qué.',
    bloques: [
      'No usamos cookies de publicidad ni rastreadores. Nuestras estadísticas de visitas son anónimas y no identifican a nadie.',
      'Si te suscribes al boletín guardamos solo tu correo electrónico, y puedes darte de baja en cualquier momento.',
      'Los mensajes que nos envías por los formularios se guardan de forma privada y solo los lee la redacción.',
    ],
  },
]
