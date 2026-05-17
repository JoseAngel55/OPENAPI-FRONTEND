# Sistema de Evaluaciones — Frontend

Aplicación web para la gestión de materias, grupos, alumnos, equipos, exposiciones y evaluaciones con rúbrica dinámica. Desarrollada en **React + Vite + TypeScript**.

---

## Tabla de Contenidos

- [Tecnologías](#-tecnologías)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Scripts disponibles](#-scripts-disponibles)
- [Módulos de la aplicación](#-módulos-de-la-aplicación)
- [Roles y permisos](#-roles-y-permisos)
- [Contribuir](#-contribuir)

---

## Tecnologías

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 18.x | Librería UI |
| Vite | 5.x | Bundler / Dev server |
| TypeScript | 5.x | Tipado estático |
| React Router DOM | 6.x | Enrutamiento |
| Axios | 1.x | Peticiones HTTP |
| React Hook Form | 7.x | Manejo de formularios |
| Zod | 3.x | Validación de esquemas |
| Zustand | 4.x | Manejo de estado global |
| TanStack Query | 5.x | Server state / caché |
| Tailwind CSS | 3.x | Estilos utilitarios |
| shadcn/ui | latest | Componentes base accesibles |
| React Hot Toast | 2.x | Notificaciones / Toasts |

---

## Requisitos previos

- **Node.js** >= 18.x
- **npm** >= 9.x (o `pnpm` >= 8.x)
- Backend corriendo en `http://localhost:3000` (ver repositorio del backend)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/<org>/evaluaciones-frontend.git
cd evaluaciones-frontend

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Editar .env con tus valores (ver sección siguiente)

# 5. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de entorno

Copia `.env.example` como `.env` y ajusta los valores:

```env
# URL base del backend (OpenAPI)
VITE_API_BASE_URL=http://localhost:3000/api

# Nombre de la app (aparece en el título del navegador)
VITE_APP_NAME=Sistema de Evaluaciones
```

> **Nunca** subas tu archivo `.env` al repositorio. Ya está incluido en `.gitignore` Te observo Jose Angel.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── ui/            # Componentes atómicos reutilizables (Button, Input, Modal…)
│   ├── layout/        # Sidebar, Navbar, Layout principal
│   ├── auth/          # Login, ProtectedRoute
│   ├── materias/      # Tabla, formulario y modales de Materias
│   ├── grupos/        # Tabla, formulario y modales de Grupos
│   ├── alumnos/       # Tabla, formulario y modales de Alumnos
│   ├── equipos/       # Tabla, formulario y modales de Equipos
│   ├── exposiciones/  # Tabla, formulario y modales de Exposiciones
│   └── evaluaciones/  # Rúbrica dinámica y vista de evaluación
├── pages/             # Páginas enrutadas (una por módulo)
├── hooks/             # Custom hooks (useAuth, usePagination, useToast…)
├── services/          # Llamadas a la API (axios instances por módulo)
├── store/             # Zustand stores (auth, ui)
├── utils/             # Helpers, formateadores, constantes
└── types/             # Interfaces y tipos TypeScript
```

---

## Scripts disponibles

```bash
npm run dev        # Servidor de desarrollo con HMR
npm run build      # Build de producción en /dist
npm run preview    # Vista previa del build de producción
npm run lint       # ESLint sobre todo el proyecto
npm run type-check # Verificación de tipos sin emitir archivos
```

---

## Módulos de la aplicación

| Módulo | Ruta | Descripción |
|---|---|---|
| Login | `/login` | Inicio de sesión con JWT |
| Dashboard | `/` | Resumen general y métricas |
| Materias | `/materias` | CRUD de materias |
| Grupos | `/grupos` | CRUD de grupos por materia |
| Alumnos | `/alumnos` | CRUD de alumnos |
| Equipos | `/equipos` | CRUD de equipos por grupo |
| Exposiciones | `/exposiciones` | Programación de exposiciones |
| Evaluaciones | `/evaluaciones` | Evaluación con rúbrica dinámica |

---

## Roles y permisos

| Acción | Admin | Docente | Alumno |
|---|:---:|:---:|:---:|
| CRUD Materias | ✅ | ❌ | ❌ |
| CRUD Grupos | ✅ | ✅ | ❌ |
| CRUD Alumnos | ✅ | ✅ | ❌ |
| Ver Equipos | ✅ | ✅ | ✅ |
| Evaluar | ✅ | ✅ | ❌ |
| Ver Evaluaciones | ✅ | ✅ | ✅ |

---

## Contribuir

Lee el archivo [CONTRIBUTING.md](./CONTRIBUTING.md) para conocer la convención de commits, estrategia de ramas y flujo de trabajo del equipo.

---

## Licencia

TecnmCelaya © Equipo de TAP — Yo mero jeje
