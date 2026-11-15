import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('es');
  CREATE TYPE "public"."enum_articulos_tipo" AS ENUM('noticia', 'reportaje', 'opinion', 'entrevista', 'carta_estudiante');
  CREATE TYPE "public"."enum_articulos_region" AS ENUM('puerto_rico', 'internacional');
  CREATE TYPE "public"."enum_articulos_municipio" AS ENUM('adjuntas', 'aguada', 'aguadilla', 'aguas-buenas', 'aibonito', 'anasco', 'arecibo', 'arroyo', 'barceloneta', 'barranquitas', 'bayamon', 'cabo-rojo', 'caguas', 'camuy', 'canovanas', 'carolina', 'catano', 'cayey', 'ceiba', 'ciales', 'cidra', 'coamo', 'comerio', 'corozal', 'culebra', 'dorado', 'fajardo', 'florida', 'guanica', 'guayama', 'guayanilla', 'guaynabo', 'gurabo', 'hatillo', 'hormigueros', 'humacao', 'isabela', 'jayuya', 'juana-diaz', 'juncos', 'lajas', 'lares', 'las-marias', 'las-piedras', 'loiza', 'luquillo', 'manati', 'maricao', 'maunabo', 'mayaguez', 'moca', 'morovis', 'naguabo', 'naranjito', 'orocovis', 'patillas', 'penuelas', 'ponce', 'quebradillas', 'rincon', 'rio-grande', 'sabana-grande', 'salinas', 'san-german', 'san-juan', 'san-lorenzo', 'san-sebastian', 'santa-isabel', 'toa-alta', 'toa-baja', 'trujillo-alto', 'utuado', 'vega-alta', 'vega-baja', 'vieques', 'villalba', 'yabucoa', 'yauco');
  CREATE TYPE "public"."enum_articulos_estado_editorial" AS ENUM('borrador', 'en_revision', 'publicado', 'archivado');
  CREATE TYPE "public"."enum_articulos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articulos_v_version_tipo" AS ENUM('noticia', 'reportaje', 'opinion', 'entrevista', 'carta_estudiante');
  CREATE TYPE "public"."enum__articulos_v_version_region" AS ENUM('puerto_rico', 'internacional');
  CREATE TYPE "public"."enum__articulos_v_version_municipio" AS ENUM('adjuntas', 'aguada', 'aguadilla', 'aguas-buenas', 'aibonito', 'anasco', 'arecibo', 'arroyo', 'barceloneta', 'barranquitas', 'bayamon', 'cabo-rojo', 'caguas', 'camuy', 'canovanas', 'carolina', 'catano', 'cayey', 'ceiba', 'ciales', 'cidra', 'coamo', 'comerio', 'corozal', 'culebra', 'dorado', 'fajardo', 'florida', 'guanica', 'guayama', 'guayanilla', 'guaynabo', 'gurabo', 'hatillo', 'hormigueros', 'humacao', 'isabela', 'jayuya', 'juana-diaz', 'juncos', 'lajas', 'lares', 'las-marias', 'las-piedras', 'loiza', 'luquillo', 'manati', 'maricao', 'maunabo', 'mayaguez', 'moca', 'morovis', 'naguabo', 'naranjito', 'orocovis', 'patillas', 'penuelas', 'ponce', 'quebradillas', 'rincon', 'rio-grande', 'sabana-grande', 'salinas', 'san-german', 'san-juan', 'san-lorenzo', 'san-sebastian', 'santa-isabel', 'toa-alta', 'toa-baja', 'trujillo-alto', 'utuado', 'vega-alta', 'vega-baja', 'vieques', 'villalba', 'yabucoa', 'yauco');
  CREATE TYPE "public"."enum__articulos_v_version_estado_editorial" AS ENUM('borrador', 'en_revision', 'publicado', 'archivado');
  CREATE TYPE "public"."enum__articulos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articulos_v_published_locale" AS ENUM('es');
  CREATE TYPE "public"."enum_paginas_blocks_formulario_tipo" AS ENUM('contacto', 'historia', 'boletin');
  CREATE TYPE "public"."enum_paginas_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__paginas_v_blocks_formulario_tipo" AS ENUM('contacto', 'historia', 'boletin');
  CREATE TYPE "public"."enum__paginas_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__paginas_v_published_locale" AS ENUM('es');
  CREATE TYPE "public"."enum_autores_redes_plataforma" AS ENUM('x', 'facebook', 'instagram', 'tiktok', 'threads', 'bluesky', 'linkedin', 'web');
  CREATE TYPE "public"."enum_usuarios_rol" AS ENUM('admin', 'editor', 'colaborador');
  CREATE TYPE "public"."enum_mensajes_tipo" AS ENUM('contacto', 'historia');
  CREATE TYPE "public"."enum_mensajes_estado" AS ENUM('nuevo', 'leido', 'atendido');
  CREATE TYPE "public"."enum_suscriptores_estado" AS ENUM('pendiente', 'confirmado', 'baja');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_ajustes_redes_plataforma" AS ENUM('whatsapp', 'facebook', 'instagram', 'x', 'tiktok', 'youtube', 'threads', 'bluesky');
  CREATE TABLE "articulos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"imagen_destacada_id" integer,
  	"tipo" "enum_articulos_tipo" DEFAULT 'noticia',
  	"region" "enum_articulos_region" DEFAULT 'puerto_rico',
  	"municipio" "enum_articulos_municipio",
  	"estado_editorial" "enum_articulos_estado_editorial" DEFAULT 'borrador',
  	"slug" varchar,
  	"categoria_id" integer,
  	"destacado" boolean DEFAULT false,
  	"ultima_hora" boolean DEFAULT false,
  	"fecha_publicacion" timestamp(3) with time zone,
  	"fecha_actualizacion" timestamp(3) with time zone,
  	"tiempo_de_lectura" numeric,
  	"creado_por_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articulos_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articulos_locales" (
  	"titulo" varchar,
  	"subtitulo" varchar,
  	"leyenda_imagen" varchar,
  	"cuerpo" jsonb,
  	"fe_de_errata" varchar,
  	"texto_plano" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articulos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"etiquetas_id" integer,
  	"autores_id" integer
  );
  
  CREATE TABLE "_articulos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_imagen_destacada_id" integer,
  	"version_tipo" "enum__articulos_v_version_tipo" DEFAULT 'noticia',
  	"version_region" "enum__articulos_v_version_region" DEFAULT 'puerto_rico',
  	"version_municipio" "enum__articulos_v_version_municipio",
  	"version_estado_editorial" "enum__articulos_v_version_estado_editorial" DEFAULT 'borrador',
  	"version_slug" varchar,
  	"version_categoria_id" integer,
  	"version_destacado" boolean DEFAULT false,
  	"version_ultima_hora" boolean DEFAULT false,
  	"version_fecha_publicacion" timestamp(3) with time zone,
  	"version_fecha_actualizacion" timestamp(3) with time zone,
  	"version_tiempo_de_lectura" numeric,
  	"version_creado_por_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articulos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__articulos_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_articulos_v_locales" (
  	"version_titulo" varchar,
  	"version_subtitulo" varchar,
  	"version_leyenda_imagen" varchar,
  	"version_cuerpo" jsonb,
  	"version_fe_de_errata" varchar,
  	"version_texto_plano" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_articulos_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"etiquetas_id" integer,
  	"autores_id" integer
  );
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"orden" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias_locales" (
  	"nombre" varchar NOT NULL,
  	"descripcion" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "etiquetas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "etiquetas_locales" (
  	"nombre" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credito" varchar,
  	"subido_por_id" integer,
  	"_objectkey" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_pequena_url" varchar,
  	"sizes_pequena_width" numeric,
  	"sizes_pequena_height" numeric,
  	"sizes_pequena_mime_type" varchar,
  	"sizes_pequena_filesize" numeric,
  	"sizes_pequena_filename" varchar,
  	"sizes_mediana_url" varchar,
  	"sizes_mediana_width" numeric,
  	"sizes_mediana_height" numeric,
  	"sizes_mediana_mime_type" varchar,
  	"sizes_mediana_filesize" numeric,
  	"sizes_mediana_filename" varchar,
  	"sizes_grande_url" varchar,
  	"sizes_grande_width" numeric,
  	"sizes_grande_height" numeric,
  	"sizes_grande_mime_type" varchar,
  	"sizes_grande_filesize" numeric,
  	"sizes_grande_filename" varchar,
  	"sizes_enorme_url" varchar,
  	"sizes_enorme_width" numeric,
  	"sizes_enorme_height" numeric,
  	"sizes_enorme_mime_type" varchar,
  	"sizes_enorme_filesize" numeric,
  	"sizes_enorme_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"leyenda" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "paginas_blocks_texto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_texto_locales" (
  	"contenido" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "paginas_blocks_llamada" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enlace" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_llamada_locales" (
  	"titulo" varchar,
  	"texto" varchar,
  	"etiqueta_boton" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "paginas_blocks_imagen" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"imagen_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_imagen_locales" (
  	"leyenda" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "paginas_blocks_formulario" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tipo" "enum_paginas_blocks_formulario_tipo" DEFAULT 'contacto',
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_formulario_locales" (
  	"titulo" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "paginas_blocks_preguntas_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "paginas_blocks_preguntas_items_locales" (
  	"pregunta" varchar,
  	"respuesta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "paginas_blocks_preguntas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "paginas_blocks_preguntas_locales" (
  	"titulo" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "paginas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_paginas_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "paginas_locales" (
  	"titulo" varchar,
  	"introduccion" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_paginas_v_blocks_texto" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_paginas_v_blocks_texto_locales" (
  	"contenido" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_paginas_v_blocks_llamada" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enlace" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_paginas_v_blocks_llamada_locales" (
  	"titulo" varchar,
  	"texto" varchar,
  	"etiqueta_boton" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_paginas_v_blocks_imagen" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"imagen_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_paginas_v_blocks_imagen_locales" (
  	"leyenda" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_paginas_v_blocks_formulario" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo" "enum__paginas_v_blocks_formulario_tipo" DEFAULT 'contacto',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_paginas_v_blocks_formulario_locales" (
  	"titulo" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_paginas_v_blocks_preguntas_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_paginas_v_blocks_preguntas_items_locales" (
  	"pregunta" varchar,
  	"respuesta" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_paginas_v_blocks_preguntas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_paginas_v_blocks_preguntas_locales" (
  	"titulo" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_paginas_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__paginas_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__paginas_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_paginas_v_locales" (
  	"version_titulo" varchar,
  	"version_introduccion" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "autores_redes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"plataforma" "enum_autores_redes_plataforma",
  	"url" varchar
  );
  
  CREATE TABLE "autores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre_publico" varchar,
  	"nombre" varchar NOT NULL,
  	"apellido" varchar,
  	"es_menor_de_edad" boolean DEFAULT false,
  	"usar_seudonimo" boolean DEFAULT false,
  	"seudonimo" varchar,
  	"foto_id" integer,
  	"usuario_id" integer,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "autores_locales" (
  	"etiqueta_de_rol" varchar,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "usuarios_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "usuarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar NOT NULL,
  	"rol" "enum_usuarios_rol" DEFAULT 'colaborador' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "mensajes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tipo" "enum_mensajes_tipo" DEFAULT 'contacto' NOT NULL,
  	"asunto" varchar NOT NULL,
  	"nombre" varchar,
  	"email" varchar,
  	"mensaje" varchar NOT NULL,
  	"anonimo" boolean DEFAULT false,
  	"estado" "enum_mensajes_estado" DEFAULT 'nuevo' NOT NULL,
  	"notas" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "suscriptores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"estado" "enum_suscriptores_estado" DEFAULT 'pendiente' NOT NULL,
  	"confirmado_en" timestamp(3) with time zone,
  	"baja_en" timestamp(3) with time zone,
  	"token_hash" varchar,
  	"token_expira" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vistas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"articulo_id" integer NOT NULL,
  	"dia" varchar NOT NULL,
  	"conteo" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "limites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"clave" varchar NOT NULL,
  	"ventana" varchar NOT NULL,
  	"conteo" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articulos_id" integer,
  	"categorias_id" integer,
  	"etiquetas_id" integer,
  	"media_id" integer,
  	"paginas_id" integer,
  	"autores_id" integer,
  	"usuarios_id" integer,
  	"mensajes_id" integer,
  	"suscriptores_id" integer,
  	"vistas_id" integer,
  	"limites_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "portada" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"principal_id" integer,
  	"mostrar_opinion" boolean DEFAULT true,
  	"mostrar_voces_estudiantiles" boolean DEFAULT true,
  	"mostrar_mas_leidas" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "portada_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articulos_id" integer,
  	"categorias_id" integer
  );
  
  CREATE TABLE "ajustes_redes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"plataforma" "enum_ajustes_redes_plataforma" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "ajustes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nombre" varchar DEFAULT 'La Pizarra' NOT NULL,
  	"logo_id" integer,
  	"cintillo_activo" boolean DEFAULT false,
  	"cintillo_articulo_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ajustes_locales" (
  	"lema" varchar DEFAULT 'Periodismo desde el salón de clases',
  	"descripcion" varchar,
  	"cintillo_texto" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navegacion_principal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enlace" varchar NOT NULL
  );
  
  CREATE TABLE "navegacion_principal_locales" (
  	"etiqueta" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navegacion_pie_enlaces" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enlace" varchar NOT NULL
  );
  
  CREATE TABLE "navegacion_pie_enlaces_locales" (
  	"etiqueta" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navegacion_pie" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "navegacion_pie_locales" (
  	"titulo" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navegacion" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navegacion_locales" (
  	"texto_legal" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "articulos" ADD CONSTRAINT "articulos_imagen_destacada_id_media_id_fk" FOREIGN KEY ("imagen_destacada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos" ADD CONSTRAINT "articulos_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos" ADD CONSTRAINT "articulos_creado_por_id_usuarios_id_fk" FOREIGN KEY ("creado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos_locales" ADD CONSTRAINT "articulos_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articulos_locales" ADD CONSTRAINT "articulos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_rels" ADD CONSTRAINT "articulos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_rels" ADD CONSTRAINT "articulos_rels_etiquetas_fk" FOREIGN KEY ("etiquetas_id") REFERENCES "public"."etiquetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articulos_rels" ADD CONSTRAINT "articulos_rels_autores_fk" FOREIGN KEY ("autores_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articulos_v" ADD CONSTRAINT "_articulos_v_parent_id_articulos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articulos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articulos_v" ADD CONSTRAINT "_articulos_v_version_imagen_destacada_id_media_id_fk" FOREIGN KEY ("version_imagen_destacada_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articulos_v" ADD CONSTRAINT "_articulos_v_version_categoria_id_categorias_id_fk" FOREIGN KEY ("version_categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articulos_v" ADD CONSTRAINT "_articulos_v_version_creado_por_id_usuarios_id_fk" FOREIGN KEY ("version_creado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articulos_v_locales" ADD CONSTRAINT "_articulos_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articulos_v_locales" ADD CONSTRAINT "_articulos_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articulos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articulos_v_rels" ADD CONSTRAINT "_articulos_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articulos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articulos_v_rels" ADD CONSTRAINT "_articulos_v_rels_etiquetas_fk" FOREIGN KEY ("etiquetas_id") REFERENCES "public"."etiquetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articulos_v_rels" ADD CONSTRAINT "_articulos_v_rels_autores_fk" FOREIGN KEY ("autores_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categorias_locales" ADD CONSTRAINT "categorias_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "etiquetas_locales" ADD CONSTRAINT "etiquetas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."etiquetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_subido_por_id_usuarios_id_fk" FOREIGN KEY ("subido_por_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_texto" ADD CONSTRAINT "paginas_blocks_texto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_texto_locales" ADD CONSTRAINT "paginas_blocks_texto_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_texto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_llamada" ADD CONSTRAINT "paginas_blocks_llamada_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_llamada_locales" ADD CONSTRAINT "paginas_blocks_llamada_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_llamada"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_imagen" ADD CONSTRAINT "paginas_blocks_imagen_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paginas_blocks_imagen" ADD CONSTRAINT "paginas_blocks_imagen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_imagen_locales" ADD CONSTRAINT "paginas_blocks_imagen_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_imagen"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_formulario" ADD CONSTRAINT "paginas_blocks_formulario_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_formulario_locales" ADD CONSTRAINT "paginas_blocks_formulario_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_formulario"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_preguntas_items" ADD CONSTRAINT "paginas_blocks_preguntas_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_preguntas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_preguntas_items_locales" ADD CONSTRAINT "paginas_blocks_preguntas_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_preguntas_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_preguntas" ADD CONSTRAINT "paginas_blocks_preguntas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_blocks_preguntas_locales" ADD CONSTRAINT "paginas_blocks_preguntas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas_blocks_preguntas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "paginas_locales" ADD CONSTRAINT "paginas_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "paginas_locales" ADD CONSTRAINT "paginas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_texto" ADD CONSTRAINT "_paginas_v_blocks_texto_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_texto_locales" ADD CONSTRAINT "_paginas_v_blocks_texto_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v_blocks_texto"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_llamada" ADD CONSTRAINT "_paginas_v_blocks_llamada_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_llamada_locales" ADD CONSTRAINT "_paginas_v_blocks_llamada_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v_blocks_llamada"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_imagen" ADD CONSTRAINT "_paginas_v_blocks_imagen_imagen_id_media_id_fk" FOREIGN KEY ("imagen_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_imagen" ADD CONSTRAINT "_paginas_v_blocks_imagen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_imagen_locales" ADD CONSTRAINT "_paginas_v_blocks_imagen_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v_blocks_imagen"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_formulario" ADD CONSTRAINT "_paginas_v_blocks_formulario_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_formulario_locales" ADD CONSTRAINT "_paginas_v_blocks_formulario_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v_blocks_formulario"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_preguntas_items" ADD CONSTRAINT "_paginas_v_blocks_preguntas_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v_blocks_preguntas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_preguntas_items_locales" ADD CONSTRAINT "_paginas_v_blocks_preguntas_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v_blocks_preguntas_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_preguntas" ADD CONSTRAINT "_paginas_v_blocks_preguntas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v_blocks_preguntas_locales" ADD CONSTRAINT "_paginas_v_blocks_preguntas_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v_blocks_preguntas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_paginas_v" ADD CONSTRAINT "_paginas_v_parent_id_paginas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."paginas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_paginas_v_locales" ADD CONSTRAINT "_paginas_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_paginas_v_locales" ADD CONSTRAINT "_paginas_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_paginas_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "autores_redes" ADD CONSTRAINT "autores_redes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "autores" ADD CONSTRAINT "autores_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "autores" ADD CONSTRAINT "autores_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "autores_locales" ADD CONSTRAINT "autores_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "usuarios_sessions" ADD CONSTRAINT "usuarios_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vistas" ADD CONSTRAINT "vistas_articulo_id_articulos_id_fk" FOREIGN KEY ("articulo_id") REFERENCES "public"."articulos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articulos_fk" FOREIGN KEY ("articulos_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_etiquetas_fk" FOREIGN KEY ("etiquetas_id") REFERENCES "public"."etiquetas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_paginas_fk" FOREIGN KEY ("paginas_id") REFERENCES "public"."paginas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_autores_fk" FOREIGN KEY ("autores_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mensajes_fk" FOREIGN KEY ("mensajes_id") REFERENCES "public"."mensajes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_suscriptores_fk" FOREIGN KEY ("suscriptores_id") REFERENCES "public"."suscriptores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vistas_fk" FOREIGN KEY ("vistas_id") REFERENCES "public"."vistas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_limites_fk" FOREIGN KEY ("limites_id") REFERENCES "public"."limites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portada" ADD CONSTRAINT "portada_principal_id_articulos_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."articulos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "portada_rels" ADD CONSTRAINT "portada_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."portada"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portada_rels" ADD CONSTRAINT "portada_rels_articulos_fk" FOREIGN KEY ("articulos_id") REFERENCES "public"."articulos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "portada_rels" ADD CONSTRAINT "portada_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ajustes_redes" ADD CONSTRAINT "ajustes_redes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ajustes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ajustes" ADD CONSTRAINT "ajustes_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ajustes" ADD CONSTRAINT "ajustes_cintillo_articulo_id_articulos_id_fk" FOREIGN KEY ("cintillo_articulo_id") REFERENCES "public"."articulos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "ajustes_locales" ADD CONSTRAINT "ajustes_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ajustes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navegacion_principal" ADD CONSTRAINT "navegacion_principal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navegacion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navegacion_principal_locales" ADD CONSTRAINT "navegacion_principal_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navegacion_principal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navegacion_pie_enlaces" ADD CONSTRAINT "navegacion_pie_enlaces_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navegacion_pie"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navegacion_pie_enlaces_locales" ADD CONSTRAINT "navegacion_pie_enlaces_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navegacion_pie_enlaces"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navegacion_pie" ADD CONSTRAINT "navegacion_pie_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navegacion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navegacion_pie_locales" ADD CONSTRAINT "navegacion_pie_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navegacion_pie"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navegacion_locales" ADD CONSTRAINT "navegacion_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navegacion"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articulos_imagen_destacada_idx" ON "articulos" USING btree ("imagen_destacada_id");
  CREATE INDEX "articulos_estado_editorial_idx" ON "articulos" USING btree ("estado_editorial");
  CREATE UNIQUE INDEX "articulos_slug_idx" ON "articulos" USING btree ("slug");
  CREATE INDEX "articulos_categoria_idx" ON "articulos" USING btree ("categoria_id");
  CREATE INDEX "articulos_destacado_idx" ON "articulos" USING btree ("destacado");
  CREATE INDEX "articulos_fecha_publicacion_idx" ON "articulos" USING btree ("fecha_publicacion");
  CREATE INDEX "articulos_creado_por_idx" ON "articulos" USING btree ("creado_por_id");
  CREATE INDEX "articulos_updated_at_idx" ON "articulos" USING btree ("updated_at");
  CREATE INDEX "articulos_created_at_idx" ON "articulos" USING btree ("created_at");
  CREATE INDEX "articulos__status_idx" ON "articulos" USING btree ("_status");
  CREATE INDEX "articulos_meta_meta_image_idx" ON "articulos_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "articulos_locales_locale_parent_id_unique" ON "articulos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articulos_locales_parent_id_idx" ON "articulos_locales" USING btree ("_parent_id");
  CREATE INDEX "articulos_rels_order_idx" ON "articulos_rels" USING btree ("order");
  CREATE INDEX "articulos_rels_parent_idx" ON "articulos_rels" USING btree ("parent_id");
  CREATE INDEX "articulos_rels_path_idx" ON "articulos_rels" USING btree ("path");
  CREATE INDEX "articulos_rels_etiquetas_id_idx" ON "articulos_rels" USING btree ("etiquetas_id");
  CREATE INDEX "articulos_rels_autores_id_idx" ON "articulos_rels" USING btree ("autores_id");
  CREATE INDEX "_articulos_v_parent_idx" ON "_articulos_v" USING btree ("parent_id");
  CREATE INDEX "_articulos_v_version_version_imagen_destacada_idx" ON "_articulos_v" USING btree ("version_imagen_destacada_id");
  CREATE INDEX "_articulos_v_version_version_estado_editorial_idx" ON "_articulos_v" USING btree ("version_estado_editorial");
  CREATE INDEX "_articulos_v_version_version_slug_idx" ON "_articulos_v" USING btree ("version_slug");
  CREATE INDEX "_articulos_v_version_version_categoria_idx" ON "_articulos_v" USING btree ("version_categoria_id");
  CREATE INDEX "_articulos_v_version_version_destacado_idx" ON "_articulos_v" USING btree ("version_destacado");
  CREATE INDEX "_articulos_v_version_version_fecha_publicacion_idx" ON "_articulos_v" USING btree ("version_fecha_publicacion");
  CREATE INDEX "_articulos_v_version_version_creado_por_idx" ON "_articulos_v" USING btree ("version_creado_por_id");
  CREATE INDEX "_articulos_v_version_version_updated_at_idx" ON "_articulos_v" USING btree ("version_updated_at");
  CREATE INDEX "_articulos_v_version_version_created_at_idx" ON "_articulos_v" USING btree ("version_created_at");
  CREATE INDEX "_articulos_v_version_version__status_idx" ON "_articulos_v" USING btree ("version__status");
  CREATE INDEX "_articulos_v_created_at_idx" ON "_articulos_v" USING btree ("created_at");
  CREATE INDEX "_articulos_v_updated_at_idx" ON "_articulos_v" USING btree ("updated_at");
  CREATE INDEX "_articulos_v_snapshot_idx" ON "_articulos_v" USING btree ("snapshot");
  CREATE INDEX "_articulos_v_published_locale_idx" ON "_articulos_v" USING btree ("published_locale");
  CREATE INDEX "_articulos_v_latest_idx" ON "_articulos_v" USING btree ("latest");
  CREATE INDEX "_articulos_v_autosave_idx" ON "_articulos_v" USING btree ("autosave");
  CREATE INDEX "_articulos_v_version_meta_version_meta_image_idx" ON "_articulos_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_articulos_v_locales_locale_parent_id_unique" ON "_articulos_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_articulos_v_locales_parent_id_idx" ON "_articulos_v_locales" USING btree ("_parent_id");
  CREATE INDEX "_articulos_v_rels_order_idx" ON "_articulos_v_rels" USING btree ("order");
  CREATE INDEX "_articulos_v_rels_parent_idx" ON "_articulos_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articulos_v_rels_path_idx" ON "_articulos_v_rels" USING btree ("path");
  CREATE INDEX "_articulos_v_rels_etiquetas_id_idx" ON "_articulos_v_rels" USING btree ("etiquetas_id");
  CREATE INDEX "_articulos_v_rels_autores_id_idx" ON "_articulos_v_rels" USING btree ("autores_id");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE UNIQUE INDEX "categorias_locales_locale_parent_id_unique" ON "categorias_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categorias_locales_parent_id_idx" ON "categorias_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "etiquetas_slug_idx" ON "etiquetas" USING btree ("slug");
  CREATE INDEX "etiquetas_updated_at_idx" ON "etiquetas" USING btree ("updated_at");
  CREATE INDEX "etiquetas_created_at_idx" ON "etiquetas" USING btree ("created_at");
  CREATE UNIQUE INDEX "etiquetas_locales_locale_parent_id_unique" ON "etiquetas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "etiquetas_locales_parent_id_idx" ON "etiquetas_locales" USING btree ("_parent_id");
  CREATE INDEX "media_subido_por_idx" ON "media" USING btree ("subido_por_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_pequena_sizes_pequena_filename_idx" ON "media" USING btree ("sizes_pequena_filename");
  CREATE INDEX "media_sizes_mediana_sizes_mediana_filename_idx" ON "media" USING btree ("sizes_mediana_filename");
  CREATE INDEX "media_sizes_grande_sizes_grande_filename_idx" ON "media" USING btree ("sizes_grande_filename");
  CREATE INDEX "media_sizes_enorme_sizes_enorme_filename_idx" ON "media" USING btree ("sizes_enorme_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_texto_order_idx" ON "paginas_blocks_texto" USING btree ("_order");
  CREATE INDEX "paginas_blocks_texto_parent_id_idx" ON "paginas_blocks_texto" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_texto_path_idx" ON "paginas_blocks_texto" USING btree ("_path");
  CREATE UNIQUE INDEX "paginas_blocks_texto_locales_locale_parent_id_unique" ON "paginas_blocks_texto_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "paginas_blocks_texto_locales_parent_id_idx" ON "paginas_blocks_texto_locales" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_llamada_order_idx" ON "paginas_blocks_llamada" USING btree ("_order");
  CREATE INDEX "paginas_blocks_llamada_parent_id_idx" ON "paginas_blocks_llamada" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_llamada_path_idx" ON "paginas_blocks_llamada" USING btree ("_path");
  CREATE UNIQUE INDEX "paginas_blocks_llamada_locales_locale_parent_id_unique" ON "paginas_blocks_llamada_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "paginas_blocks_llamada_locales_parent_id_idx" ON "paginas_blocks_llamada_locales" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_imagen_order_idx" ON "paginas_blocks_imagen" USING btree ("_order");
  CREATE INDEX "paginas_blocks_imagen_parent_id_idx" ON "paginas_blocks_imagen" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_imagen_path_idx" ON "paginas_blocks_imagen" USING btree ("_path");
  CREATE INDEX "paginas_blocks_imagen_imagen_idx" ON "paginas_blocks_imagen" USING btree ("imagen_id");
  CREATE UNIQUE INDEX "paginas_blocks_imagen_locales_locale_parent_id_unique" ON "paginas_blocks_imagen_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "paginas_blocks_imagen_locales_parent_id_idx" ON "paginas_blocks_imagen_locales" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_formulario_order_idx" ON "paginas_blocks_formulario" USING btree ("_order");
  CREATE INDEX "paginas_blocks_formulario_parent_id_idx" ON "paginas_blocks_formulario" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_formulario_path_idx" ON "paginas_blocks_formulario" USING btree ("_path");
  CREATE UNIQUE INDEX "paginas_blocks_formulario_locales_locale_parent_id_unique" ON "paginas_blocks_formulario_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "paginas_blocks_formulario_locales_parent_id_idx" ON "paginas_blocks_formulario_locales" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_preguntas_items_order_idx" ON "paginas_blocks_preguntas_items" USING btree ("_order");
  CREATE INDEX "paginas_blocks_preguntas_items_parent_id_idx" ON "paginas_blocks_preguntas_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "paginas_blocks_preguntas_items_locales_locale_parent_id_uniq" ON "paginas_blocks_preguntas_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "paginas_blocks_preguntas_items_locales_parent_id_idx" ON "paginas_blocks_preguntas_items_locales" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_preguntas_order_idx" ON "paginas_blocks_preguntas" USING btree ("_order");
  CREATE INDEX "paginas_blocks_preguntas_parent_id_idx" ON "paginas_blocks_preguntas" USING btree ("_parent_id");
  CREATE INDEX "paginas_blocks_preguntas_path_idx" ON "paginas_blocks_preguntas" USING btree ("_path");
  CREATE UNIQUE INDEX "paginas_blocks_preguntas_locales_locale_parent_id_unique" ON "paginas_blocks_preguntas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "paginas_blocks_preguntas_locales_parent_id_idx" ON "paginas_blocks_preguntas_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "paginas_slug_idx" ON "paginas" USING btree ("slug");
  CREATE INDEX "paginas_updated_at_idx" ON "paginas" USING btree ("updated_at");
  CREATE INDEX "paginas_created_at_idx" ON "paginas" USING btree ("created_at");
  CREATE INDEX "paginas__status_idx" ON "paginas" USING btree ("_status");
  CREATE INDEX "paginas_meta_meta_image_idx" ON "paginas_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "paginas_locales_locale_parent_id_unique" ON "paginas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "paginas_locales_parent_id_idx" ON "paginas_locales" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_texto_order_idx" ON "_paginas_v_blocks_texto" USING btree ("_order");
  CREATE INDEX "_paginas_v_blocks_texto_parent_id_idx" ON "_paginas_v_blocks_texto" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_texto_path_idx" ON "_paginas_v_blocks_texto" USING btree ("_path");
  CREATE UNIQUE INDEX "_paginas_v_blocks_texto_locales_locale_parent_id_unique" ON "_paginas_v_blocks_texto_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_paginas_v_blocks_texto_locales_parent_id_idx" ON "_paginas_v_blocks_texto_locales" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_llamada_order_idx" ON "_paginas_v_blocks_llamada" USING btree ("_order");
  CREATE INDEX "_paginas_v_blocks_llamada_parent_id_idx" ON "_paginas_v_blocks_llamada" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_llamada_path_idx" ON "_paginas_v_blocks_llamada" USING btree ("_path");
  CREATE UNIQUE INDEX "_paginas_v_blocks_llamada_locales_locale_parent_id_unique" ON "_paginas_v_blocks_llamada_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_paginas_v_blocks_llamada_locales_parent_id_idx" ON "_paginas_v_blocks_llamada_locales" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_imagen_order_idx" ON "_paginas_v_blocks_imagen" USING btree ("_order");
  CREATE INDEX "_paginas_v_blocks_imagen_parent_id_idx" ON "_paginas_v_blocks_imagen" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_imagen_path_idx" ON "_paginas_v_blocks_imagen" USING btree ("_path");
  CREATE INDEX "_paginas_v_blocks_imagen_imagen_idx" ON "_paginas_v_blocks_imagen" USING btree ("imagen_id");
  CREATE UNIQUE INDEX "_paginas_v_blocks_imagen_locales_locale_parent_id_unique" ON "_paginas_v_blocks_imagen_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_paginas_v_blocks_imagen_locales_parent_id_idx" ON "_paginas_v_blocks_imagen_locales" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_formulario_order_idx" ON "_paginas_v_blocks_formulario" USING btree ("_order");
  CREATE INDEX "_paginas_v_blocks_formulario_parent_id_idx" ON "_paginas_v_blocks_formulario" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_formulario_path_idx" ON "_paginas_v_blocks_formulario" USING btree ("_path");
  CREATE UNIQUE INDEX "_paginas_v_blocks_formulario_locales_locale_parent_id_unique" ON "_paginas_v_blocks_formulario_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_paginas_v_blocks_formulario_locales_parent_id_idx" ON "_paginas_v_blocks_formulario_locales" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_preguntas_items_order_idx" ON "_paginas_v_blocks_preguntas_items" USING btree ("_order");
  CREATE INDEX "_paginas_v_blocks_preguntas_items_parent_id_idx" ON "_paginas_v_blocks_preguntas_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_paginas_v_blocks_preguntas_items_locales_locale_parent_id_u" ON "_paginas_v_blocks_preguntas_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_paginas_v_blocks_preguntas_items_locales_parent_id_idx" ON "_paginas_v_blocks_preguntas_items_locales" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_preguntas_order_idx" ON "_paginas_v_blocks_preguntas" USING btree ("_order");
  CREATE INDEX "_paginas_v_blocks_preguntas_parent_id_idx" ON "_paginas_v_blocks_preguntas" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_blocks_preguntas_path_idx" ON "_paginas_v_blocks_preguntas" USING btree ("_path");
  CREATE UNIQUE INDEX "_paginas_v_blocks_preguntas_locales_locale_parent_id_unique" ON "_paginas_v_blocks_preguntas_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_paginas_v_blocks_preguntas_locales_parent_id_idx" ON "_paginas_v_blocks_preguntas_locales" USING btree ("_parent_id");
  CREATE INDEX "_paginas_v_parent_idx" ON "_paginas_v" USING btree ("parent_id");
  CREATE INDEX "_paginas_v_version_version_slug_idx" ON "_paginas_v" USING btree ("version_slug");
  CREATE INDEX "_paginas_v_version_version_updated_at_idx" ON "_paginas_v" USING btree ("version_updated_at");
  CREATE INDEX "_paginas_v_version_version_created_at_idx" ON "_paginas_v" USING btree ("version_created_at");
  CREATE INDEX "_paginas_v_version_version__status_idx" ON "_paginas_v" USING btree ("version__status");
  CREATE INDEX "_paginas_v_created_at_idx" ON "_paginas_v" USING btree ("created_at");
  CREATE INDEX "_paginas_v_updated_at_idx" ON "_paginas_v" USING btree ("updated_at");
  CREATE INDEX "_paginas_v_snapshot_idx" ON "_paginas_v" USING btree ("snapshot");
  CREATE INDEX "_paginas_v_published_locale_idx" ON "_paginas_v" USING btree ("published_locale");
  CREATE INDEX "_paginas_v_latest_idx" ON "_paginas_v" USING btree ("latest");
  CREATE INDEX "_paginas_v_autosave_idx" ON "_paginas_v" USING btree ("autosave");
  CREATE INDEX "_paginas_v_version_meta_version_meta_image_idx" ON "_paginas_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_paginas_v_locales_locale_parent_id_unique" ON "_paginas_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_paginas_v_locales_parent_id_idx" ON "_paginas_v_locales" USING btree ("_parent_id");
  CREATE INDEX "autores_redes_order_idx" ON "autores_redes" USING btree ("_order");
  CREATE INDEX "autores_redes_parent_id_idx" ON "autores_redes" USING btree ("_parent_id");
  CREATE INDEX "autores_nombre_publico_idx" ON "autores" USING btree ("nombre_publico");
  CREATE INDEX "autores_foto_idx" ON "autores" USING btree ("foto_id");
  CREATE UNIQUE INDEX "autores_usuario_idx" ON "autores" USING btree ("usuario_id");
  CREATE UNIQUE INDEX "autores_slug_idx" ON "autores" USING btree ("slug");
  CREATE INDEX "autores_updated_at_idx" ON "autores" USING btree ("updated_at");
  CREATE INDEX "autores_created_at_idx" ON "autores" USING btree ("created_at");
  CREATE UNIQUE INDEX "autores_locales_locale_parent_id_unique" ON "autores_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "autores_locales_parent_id_idx" ON "autores_locales" USING btree ("_parent_id");
  CREATE INDEX "usuarios_sessions_order_idx" ON "usuarios_sessions" USING btree ("_order");
  CREATE INDEX "usuarios_sessions_parent_id_idx" ON "usuarios_sessions" USING btree ("_parent_id");
  CREATE INDEX "usuarios_updated_at_idx" ON "usuarios" USING btree ("updated_at");
  CREATE INDEX "usuarios_created_at_idx" ON "usuarios" USING btree ("created_at");
  CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");
  CREATE INDEX "mensajes_updated_at_idx" ON "mensajes" USING btree ("updated_at");
  CREATE INDEX "mensajes_created_at_idx" ON "mensajes" USING btree ("created_at");
  CREATE UNIQUE INDEX "suscriptores_email_idx" ON "suscriptores" USING btree ("email");
  CREATE INDEX "suscriptores_estado_idx" ON "suscriptores" USING btree ("estado");
  CREATE INDEX "suscriptores_token_hash_idx" ON "suscriptores" USING btree ("token_hash");
  CREATE INDEX "suscriptores_updated_at_idx" ON "suscriptores" USING btree ("updated_at");
  CREATE INDEX "suscriptores_created_at_idx" ON "suscriptores" USING btree ("created_at");
  CREATE INDEX "vistas_articulo_idx" ON "vistas" USING btree ("articulo_id");
  CREATE INDEX "vistas_dia_idx" ON "vistas" USING btree ("dia");
  CREATE INDEX "vistas_updated_at_idx" ON "vistas" USING btree ("updated_at");
  CREATE INDEX "vistas_created_at_idx" ON "vistas" USING btree ("created_at");
  CREATE UNIQUE INDEX "articulo_dia_idx" ON "vistas" USING btree ("articulo_id","dia");
  CREATE INDEX "limites_updated_at_idx" ON "limites" USING btree ("updated_at");
  CREATE INDEX "limites_created_at_idx" ON "limites" USING btree ("created_at");
  CREATE UNIQUE INDEX "clave_ventana_idx" ON "limites" USING btree ("clave","ventana");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_articulos_id_idx" ON "payload_locked_documents_rels" USING btree ("articulos_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_etiquetas_id_idx" ON "payload_locked_documents_rels" USING btree ("etiquetas_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_paginas_id_idx" ON "payload_locked_documents_rels" USING btree ("paginas_id");
  CREATE INDEX "payload_locked_documents_rels_autores_id_idx" ON "payload_locked_documents_rels" USING btree ("autores_id");
  CREATE INDEX "payload_locked_documents_rels_usuarios_id_idx" ON "payload_locked_documents_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_locked_documents_rels_mensajes_id_idx" ON "payload_locked_documents_rels" USING btree ("mensajes_id");
  CREATE INDEX "payload_locked_documents_rels_suscriptores_id_idx" ON "payload_locked_documents_rels" USING btree ("suscriptores_id");
  CREATE INDEX "payload_locked_documents_rels_vistas_id_idx" ON "payload_locked_documents_rels" USING btree ("vistas_id");
  CREATE INDEX "payload_locked_documents_rels_limites_id_idx" ON "payload_locked_documents_rels" USING btree ("limites_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_usuarios_id_idx" ON "payload_preferences_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "portada_principal_idx" ON "portada" USING btree ("principal_id");
  CREATE INDEX "portada_rels_order_idx" ON "portada_rels" USING btree ("order");
  CREATE INDEX "portada_rels_parent_idx" ON "portada_rels" USING btree ("parent_id");
  CREATE INDEX "portada_rels_path_idx" ON "portada_rels" USING btree ("path");
  CREATE INDEX "portada_rels_articulos_id_idx" ON "portada_rels" USING btree ("articulos_id");
  CREATE INDEX "portada_rels_categorias_id_idx" ON "portada_rels" USING btree ("categorias_id");
  CREATE INDEX "ajustes_redes_order_idx" ON "ajustes_redes" USING btree ("_order");
  CREATE INDEX "ajustes_redes_parent_id_idx" ON "ajustes_redes" USING btree ("_parent_id");
  CREATE INDEX "ajustes_logo_idx" ON "ajustes" USING btree ("logo_id");
  CREATE INDEX "ajustes_cintillo_cintillo_articulo_idx" ON "ajustes" USING btree ("cintillo_articulo_id");
  CREATE UNIQUE INDEX "ajustes_locales_locale_parent_id_unique" ON "ajustes_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "ajustes_locales_parent_id_idx" ON "ajustes_locales" USING btree ("_parent_id");
  CREATE INDEX "navegacion_principal_order_idx" ON "navegacion_principal" USING btree ("_order");
  CREATE INDEX "navegacion_principal_parent_id_idx" ON "navegacion_principal" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navegacion_principal_locales_locale_parent_id_unique" ON "navegacion_principal_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navegacion_principal_locales_parent_id_idx" ON "navegacion_principal_locales" USING btree ("_parent_id");
  CREATE INDEX "navegacion_pie_enlaces_order_idx" ON "navegacion_pie_enlaces" USING btree ("_order");
  CREATE INDEX "navegacion_pie_enlaces_parent_id_idx" ON "navegacion_pie_enlaces" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navegacion_pie_enlaces_locales_locale_parent_id_unique" ON "navegacion_pie_enlaces_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navegacion_pie_enlaces_locales_parent_id_idx" ON "navegacion_pie_enlaces_locales" USING btree ("_parent_id");
  CREATE INDEX "navegacion_pie_order_idx" ON "navegacion_pie" USING btree ("_order");
  CREATE INDEX "navegacion_pie_parent_id_idx" ON "navegacion_pie" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navegacion_pie_locales_locale_parent_id_unique" ON "navegacion_pie_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navegacion_pie_locales_parent_id_idx" ON "navegacion_pie_locales" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navegacion_locales_locale_parent_id_unique" ON "navegacion_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navegacion_locales_parent_id_idx" ON "navegacion_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "articulos" CASCADE;
  DROP TABLE "articulos_locales" CASCADE;
  DROP TABLE "articulos_rels" CASCADE;
  DROP TABLE "_articulos_v" CASCADE;
  DROP TABLE "_articulos_v_locales" CASCADE;
  DROP TABLE "_articulos_v_rels" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "categorias_locales" CASCADE;
  DROP TABLE "etiquetas" CASCADE;
  DROP TABLE "etiquetas_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "paginas_blocks_texto" CASCADE;
  DROP TABLE "paginas_blocks_texto_locales" CASCADE;
  DROP TABLE "paginas_blocks_llamada" CASCADE;
  DROP TABLE "paginas_blocks_llamada_locales" CASCADE;
  DROP TABLE "paginas_blocks_imagen" CASCADE;
  DROP TABLE "paginas_blocks_imagen_locales" CASCADE;
  DROP TABLE "paginas_blocks_formulario" CASCADE;
  DROP TABLE "paginas_blocks_formulario_locales" CASCADE;
  DROP TABLE "paginas_blocks_preguntas_items" CASCADE;
  DROP TABLE "paginas_blocks_preguntas_items_locales" CASCADE;
  DROP TABLE "paginas_blocks_preguntas" CASCADE;
  DROP TABLE "paginas_blocks_preguntas_locales" CASCADE;
  DROP TABLE "paginas" CASCADE;
  DROP TABLE "paginas_locales" CASCADE;
  DROP TABLE "_paginas_v_blocks_texto" CASCADE;
  DROP TABLE "_paginas_v_blocks_texto_locales" CASCADE;
  DROP TABLE "_paginas_v_blocks_llamada" CASCADE;
  DROP TABLE "_paginas_v_blocks_llamada_locales" CASCADE;
  DROP TABLE "_paginas_v_blocks_imagen" CASCADE;
  DROP TABLE "_paginas_v_blocks_imagen_locales" CASCADE;
  DROP TABLE "_paginas_v_blocks_formulario" CASCADE;
  DROP TABLE "_paginas_v_blocks_formulario_locales" CASCADE;
  DROP TABLE "_paginas_v_blocks_preguntas_items" CASCADE;
  DROP TABLE "_paginas_v_blocks_preguntas_items_locales" CASCADE;
  DROP TABLE "_paginas_v_blocks_preguntas" CASCADE;
  DROP TABLE "_paginas_v_blocks_preguntas_locales" CASCADE;
  DROP TABLE "_paginas_v" CASCADE;
  DROP TABLE "_paginas_v_locales" CASCADE;
  DROP TABLE "autores_redes" CASCADE;
  DROP TABLE "autores" CASCADE;
  DROP TABLE "autores_locales" CASCADE;
  DROP TABLE "usuarios_sessions" CASCADE;
  DROP TABLE "usuarios" CASCADE;
  DROP TABLE "mensajes" CASCADE;
  DROP TABLE "suscriptores" CASCADE;
  DROP TABLE "vistas" CASCADE;
  DROP TABLE "limites" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "portada" CASCADE;
  DROP TABLE "portada_rels" CASCADE;
  DROP TABLE "ajustes_redes" CASCADE;
  DROP TABLE "ajustes" CASCADE;
  DROP TABLE "ajustes_locales" CASCADE;
  DROP TABLE "navegacion_principal" CASCADE;
  DROP TABLE "navegacion_principal_locales" CASCADE;
  DROP TABLE "navegacion_pie_enlaces" CASCADE;
  DROP TABLE "navegacion_pie_enlaces_locales" CASCADE;
  DROP TABLE "navegacion_pie" CASCADE;
  DROP TABLE "navegacion_pie_locales" CASCADE;
  DROP TABLE "navegacion" CASCADE;
  DROP TABLE "navegacion_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_articulos_tipo";
  DROP TYPE "public"."enum_articulos_region";
  DROP TYPE "public"."enum_articulos_municipio";
  DROP TYPE "public"."enum_articulos_estado_editorial";
  DROP TYPE "public"."enum_articulos_status";
  DROP TYPE "public"."enum__articulos_v_version_tipo";
  DROP TYPE "public"."enum__articulos_v_version_region";
  DROP TYPE "public"."enum__articulos_v_version_municipio";
  DROP TYPE "public"."enum__articulos_v_version_estado_editorial";
  DROP TYPE "public"."enum__articulos_v_version_status";
  DROP TYPE "public"."enum__articulos_v_published_locale";
  DROP TYPE "public"."enum_paginas_blocks_formulario_tipo";
  DROP TYPE "public"."enum_paginas_status";
  DROP TYPE "public"."enum__paginas_v_blocks_formulario_tipo";
  DROP TYPE "public"."enum__paginas_v_version_status";
  DROP TYPE "public"."enum__paginas_v_published_locale";
  DROP TYPE "public"."enum_autores_redes_plataforma";
  DROP TYPE "public"."enum_usuarios_rol";
  DROP TYPE "public"."enum_mensajes_tipo";
  DROP TYPE "public"."enum_mensajes_estado";
  DROP TYPE "public"."enum_suscriptores_estado";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_ajustes_redes_plataforma";`)
}
