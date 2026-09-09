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
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **New Blueprint**
3. Conecta tu repositorio de GitHub
4. Selecciona el archivo `render.yaml`
5. Render creará automáticamente:
   - Base de datos PostgreSQL
   - Backend API
   - Frontend Web

### Opción B: Manual
1. **Base de datos PostgreSQL:**
   - New → PostgreSQL
   - Plan: Free
   - Database Name: royal_crm
   - User: royal_crm_user

2. **Backend API:**
   - New → Web Service
   - Runtime: Node
   - Build Command: `cd apps/api && npm install && npm run build`
   - Start Command: `cd apps/api && node dist/main`
   - Variables de entorno:
     - `DB_HOST` → (del PostgreSQL)
     - `DB_PORT` → (del PostgreSQL)
     - `DB_USERNAME` → (del PostgreSQL)
     - `DB_PASSWORD` → (del PostgreSQL)
     - `DB_DATABASE` → royal_crm
     - `JWT_SECRET` → (generar uno aleatorio)
     - `FRONTEND_URL` → URL del frontend
     - `NODE_ENV` → production

3. **Frontend Web:**
   - New → Web Service
   - Runtime: Node
   - Build Command: `cd apps/web && npm install && npm run build`
   - Start Command: `cd apps/web && npm start`
   - Variables de entorno:
     - `NEXT_PUBLIC_API_URL` → URL del backend + `/api`
     - `NODE_ENV` → production

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
| `NEXT_PUBLIC_API_URL` | URL pública del backend | `https://royal-crm-api.onrender.com/api` |
| `JWT_SECRET` | Secreto para tokens JWT | `tu-secreto-super-seguro` |
| `DB_HOST` | Host de PostgreSQL | `dpg-xxx.oregon-postgres.render.com` |

## Notas Importantes

- El tier **free** de Render apaga los servicios después de 15 min de inactividad
- La primera carga puede tardar 30-60 segundos en despertar
- Para producción, considera el plan **Starter** ($7/mes por servicio)
- Los logs están disponibles en el dashboard de Render

## URLs de Producción

- Frontend: `https://royal-crm-web.onrender.com`
- Backend API: `https://royal-crm-api.onrender.com/api`
- Swagger Docs: `https://royal-crm-api.onrender.com/api/docs`
