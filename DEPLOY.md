# Royal CRM 2026 - Guía de Despliegue en Render

## Requisitos previos
- Cuenta en [Render.com](https://render.com)
- Repositorio en GitHub con el código del proyecto

## Paso 1: Subir código a GitHub

```bash
cd "C:\proyectos\CRM ROYAL 2026"
git init
git add .
git commit -m "Royal CRM 2026 - Initial commit"
git remote add origin https://github.com/TU_USUARIO/royal-crm-2026.git
git push -u origin main
```

## Paso 2: Desplegar en Render

### Opción A: Blueprints (Recomendado)
> Nota: el repo no incluye `render.yaml`. Si quieres usar Blueprints, primero créalo o usa la Opción B.

### Opción B: Manual
1. **Base de datos PostgreSQL:**
   - New → PostgreSQL
   - Plan: Free
   - Database Name: royal_crm
   - User: royal_crm_user
   - Region: misma región que los servicios web (por defecto Oregon)

2. **Backend API (NestJS):**
   - New → Web Service
   - Conecta el repositorio `ingjcesarmojica/royal-2026`
   - Runtime: Node
   - Build Command: `npm install && npm run build --workspace=apps/api`
   - Start Command: `cd apps/api && node dist/main`
   - Variables de entorno:
     - `NODE_ENV` → production
     - `DATABASE_URL` → (Internal Database URL del PostgreSQL de Render; SSL se activa solo en producción)
     - `JWT_SECRET` → (generar uno aleatorio de 32+ caracteres)
     - `JWT_EXPIRATION` → 15m
     - `JWT_REFRESH_EXPIRATION` → 7d
     - `FRONTEND_URL` → `https://royal-crm-2026.onrender.com`
     - `DB_SSL` → true (opcional; en producción ya se activa solo)
   - Nota: `PORT` lo inyecta Render automáticamente (el código lo usa con `process.env.PORT`)
   - Al arrancar, TypeORM sincroniza el esquema (`synchronize: true`) y ejecuta el seed
     (usuario admin, estados y clientes de prueba) automáticamente.

3. **Frontend Web:**
   - New → Web Service
   - Runtime: Node
   - Build Command: `npm install && npm run build --workspace=apps/web`
   - Start Command: `cd apps/web && npm start`
   - Variables de entorno:
     - `NEXT_PUBLIC_API_URL` → URL del backend + `/api` (ej: `https://royal-crm-2026-api.onrender.com/api`)
     - `NODE_ENV` → production
   - Importante: después de cambiar variables `NEXT_PUBLIC_*`, haz
     **Trigger Deploy → Clear build cache & deploy** (se inyectan en tiempo de build).

## Paso 3: Ejecutar Seed

Una vez desplegado el backend, ejecuta el seed para crear el usuario admin:

```bash
# En la consola de Render (Shell)
cd apps/api
node -e "
const { execSync } = require('child_process');
execSync('npx ts-node src/database/seeds/seed.ts');
"
```

O crea el usuario admin manualmente desde la API.

## Paso 4: Verificar

1. Abre la URL del frontend
2. Login con:
   - Email: admin@royalcrm.com
   - Password: admin123

## Variables de Entorno Importantes

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL pública del backend (+ `/api`) | `https://royal-crm-2026-api.onrender.com/api` |
| `DATABASE_URL` | URL de conexión a PostgreSQL (Render) | `postgresql://user:pass@host:5432/db` |
| `FRONTEND_URL` | Origen permitido en CORS | `https://royal-crm-2026.onrender.com` |
| `JWT_SECRET` | Secreto para tokens JWT | `tu-secreto-super-seguro` |
| `DB_HOST` | Host de PostgreSQL (solo si no usas `DATABASE_URL`) | `dpg-xxx.oregon-postgres.render.com` |

## Notas Importantes

- El tier **free** de Render apaga los servicios después de 15 min de inactividad
- La primera carga puede tardar 30-60 segundos en despertar
- Para producción, considera el plan **Starter** ($7/mes por servicio)
- Los logs están disponibles en el dashboard de Render

## URLs de Producción

- Frontend: `https://royal-crm-2026.onrender.com`
- Backend API: `https://royal-crm-2026-api.onrender.com/api`
- Swagger Docs: `https://royal-crm-2026-api.onrender.com/api/docs`
