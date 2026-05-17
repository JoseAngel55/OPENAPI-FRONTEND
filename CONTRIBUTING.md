# Guía de Contribución

Gracias por contribuir al proyecto. Lee este documento completo antes de crear tu primera rama o commit.

---

## Estrategia de ramas

Usamos un flujo basado en **GitHub Flow** adaptado con ramas de módulo:

```
main
└── develop
    ├── feature/login
    ├── feature/dashboard
    ├── feature/materias
    ├── feature/grupos
    ├── feature/alumnos
    ├── feature/equipos
    ├── feature/exposiciones
    ├── feature/evaluaciones
    ├── fix/<descripcion-corta>
    └── chore/<descripcion-corta>
```

### Descripción de ramas

| Rama | Propósito | ¿Merge directo a main? |
|---|---|---|
| `main` | Código estable, listo para producción | ❌ Solo vía PR desde `develop` |
| `develop` | Integración continua del equipo | ❌ Solo vía PR desde `feature/*` |
| `feature/<nombre>` | Desarrollo de un módulo o funcionalidad nueva | ❌ PR → `develop` |
| `fix/<nombre>` | Corrección de un bug específico | ❌ PR → `develop` |
| `hotfix/<nombre>` | Corrección urgente en producción | ✅ PR → `main` y `develop` |
| `chore/<nombre>` | Configuración, dependencias, CI/CD | ❌ PR → `develop` |

### Reglas

- **Nunca** hagas push directo a `main` ni a `develop`.
- Toda rama nueva sale de `develop` (excepto `hotfix/*` que sale de `main`).
- Al terminar una feature, abre un **Pull Request** hacia `develop`.
- Al menos **1 reviewer** debe aprobar el PR antes de hacer merge.
- Elimina la rama remota después del merge.

---

## Convención de Commits

Seguimos **Conventional Commits** (v1.0.0): `https://www.conventionalcommits.org`

### Formato

```
<tipo>(<alcance>): <descripción corta>

[cuerpo opcional]

[footer(s) opcional(es)]
```

### Tipos permitidos

| Tipo | Cuándo usarlo | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad visible al usuario | `feat(materias): agregar tabla paginada` |
| `fix` | Corrección de un bug | `fix(auth): corregir redirección post-login` |
| `docs` | Cambios en documentación | `docs(readme): actualizar instrucciones de instalación` |
| `style` | Cambios de formato/estilo sin lógica | `style(alumnos): corregir indentación en formulario` |
| `refactor` | Refactorización sin nueva funcionalidad ni fix | `refactor(api): extraer instancia de axios a servicio` |
| `test` | Agregar o corregir pruebas | `test(evaluaciones): agregar test de rúbrica dinámica` |
| `chore` | Tareas de mantenimiento, configuración | `chore: actualizar dependencias de tailwind` |
| `perf` | Mejoras de rendimiento | `perf(tabla): lazy load de filas en tablas grandes` |
| `ci` | Cambios en pipelines CI/CD | `ci: agregar workflow de lint en PR` |
| `build` | Cambios en sistema de build o dependencias externas | `build: migrar de npm a pnpm` |
| `revert` | Revertir un commit anterior | `revert: feat(grupos): agregar filtro por materia` |

### Alcances recomendados (`scope`)

Usa el nombre del módulo o capa que modificas:

```
auth, dashboard, materias, grupos, alumnos, equipos, exposiciones, evaluaciones,
layout, ui, router, api, store, hooks, utils, types, config
```

### Reglas del mensaje

1. **Descripción corta** en **minúsculas**, sin punto al final, máx. 72 caracteres.
2. Usa el **imperativo** en español: `agregar`, `corregir`, `eliminar`, `actualizar`.
3. El **cuerpo** explica el *por qué*, no el *qué*. Separa con una línea en blanco.
4. El **footer** referencia issues: `Closes #12`, `Refs #8`.

### Ejemplos completos

```bash
# ✅ Correcto — feature simple
feat(login): agregar validación de campos con zod

# ✅ Correcto — con cuerpo y footer
fix(evaluaciones): corregir cálculo de promedio en rúbrica

El promedio se calculaba dividiendo entre el total de criterios
en lugar de los criterios evaluados, causando puntajes incorrectos.

Closes #34

# ✅ Correcto — chore
chore(deps): actualizar react-hook-form a v7.51

# ❌ Incorrecto — tipo inválido
update(materias): cambios varios

# ❌ Incorrecto — descripción vaga
feat: cosas del login

# ❌ Incorrecto — con punto al final
feat(grupos): agregar modal de confirmación.
```

---

## Flujo de trabajo paso a paso

```bash
# 1. Asegúrate de estar en develop y actualizado
git checkout develop
git pull origin develop

# 2. Crea tu rama a partir de develop
git checkout -b feature/materias

# 3. Trabaja en tu feature haciendo commits atómicos
git add src/components/materias/
git commit -m "feat(materias): agregar componente de tabla paginada"

git add src/services/materias.service.ts
git commit -m "feat(materias): conectar servicio con endpoint GET /materias"

# 4. Antes de abrir el PR, sincroniza con develop
git fetch origin
git rebase origin/develop

# 5. Sube tu rama
git push origin feature/materias

# 6. Abre un Pull Request en GitHub hacia develop
# - Título = último commit o resumen de la feature
# - Asigna reviewer (tu compañero de equipo)
# - Enlaza el issue relacionado si existe

# 7. Una vez aprobado y mergeado, elimina la rama local y remota
git branch -d feature/materias
git push origin --delete feature/materias
```

---

## Checklist antes de abrir un PR

- [ ] La rama sale de `develop` (o `main` para hotfix)
- [ ] Todos los commits siguen la convención de esta guía
- [ ] El código compila sin errores (`npm run build`)
- [ ] No hay errores de lint (`npm run lint`)
- [ ] No hay errores de tipos (`npm run type-check`)
- [ ] Las variables de entorno nuevas están en `.env.example`
- [ ] El PR tiene título descriptivo y referencia al issue (si aplica)
- [ ] Se asignó al menos un reviewer

---
