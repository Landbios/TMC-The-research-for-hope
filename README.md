# TMA: The Murder Academy (TMC)

TMA es una plataforma web estilo novela visual / Danganronpa, diseñada bajo la academia de ciencia ficción *Kizoku no Yozai*. Los estudiantes definitivos (Ultimates) exploran salas interactivas en mapas 3D/2D para recolectar evidencia y sobrevivir a dinámicas simuladas de asesinato.

## Arquitectura

El proyecto es una aplicación **Next.js** unificada que centraliza la experiencia de juego, la gestión de personajes y la interfaz de rol (S.C.I.O.N).

## Instalación y Ejecución Local

Para correr el entorno de desarrollo localmente:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Entorno**:
   Asegúrate de tener un archivo `.env.local` en la raíz con las credenciales de Supabase (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

3. **Arrancar el servidor**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) con tu navegador web para ver el resultado.

Para más detalles técnicos, consulta [DEVELOPMENT.md](DEVELOPMENT.md).

## Stack Tecnológico

* **Framework**: React 19 + Next.js 16 (App Router).
* **Base de Datos & Auth**: Supabase.
* **Estilos**: Tailwind CSS v4.
* **Componentes 3D/Render**: Three.js, React Three Fiber, React Drei.
* **Inteligencia Artificial**: Google Gemini SDK.
