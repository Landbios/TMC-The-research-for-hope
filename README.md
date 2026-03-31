# TMA: The Murder Academy (TMC)

TMA es una plataforma web estilo novela visual / Danganronpa, diseñada bajo la academia de ciencia ficción *Kizoku no Yozai*. Los estudiantes definitivos (Ultimates) exploran salas interactivas en mapas 3D/2D para recolectar evidencia y sobrevivir a dinámicas simuladas de asesinato.

## Arquitectura Modular

El proyecto funciona como un **Monorepo** gestionado con npm workspaces:

* apps/tma-client: Aplicación frontend principal donde los jugadores se conectan, interactúan y exponen pruebas. Construido usando Next.js 15 App Router, Tailwind v4 y Three.js.
* Módulos adicionales enlazados (S.C.I.O.N para interfaz de rol, y TMC Character Vault como fuente de perfiles).

## Instalación y Ejecución Local

Para correr el entorno de desarrollo del cliente localmente:

1. **Instalar dependencias globales del proyecto**:
   npm install

2. **Configurar Entorno de Supabase**:
   Copiar o generar un archivo .env.local dentro de apps/tma-client basándose en el proyecto de Auth primario (necesita NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).

3. **Arrancar el servidor del cliente**:
   npm run dev:client
   Abre http://localhost:3000 con tu navegador web para ver el resultado. Todas las rutas requerirán de autenticación inicialmente.

## Stack Tecnológico

* Framework: React 19 + Next.js 15 (App Router).
* Base de Datos & Auth: Supabase.
* Estilos: Tailwind CSS v4.
* Componentes 3D/Render: Three.js, React Three Fiber, React Drei.
