# Royal CRM 2026

Sistema de gestión de relaciones con clientes para PyMEs.

## Stack Tecnológico

- **Frontend**: Next.js + TailwindCSS
- **Backend**: NestJS + TypeORM
- **Base de datos**: PostgreSQL
- **Cache/Colas**: Redis + BullMQ
- **Autenticación**: OAuth2 (Google/Microsoft) + JWT

## Requisitos Previos

- Node.js 18+
- Docker Desktop (para PostgreSQL y Redis)
- npm o yarn

## Inicio Rápido

1. Clonar el repositorio e instalar dependencias:
   ```bash
   cd "C:\proyectos\CRM ROYAL 2026"
   npm install
   ```

2. Levantar servicios base:
   ```bash
   docker-compose up -d
   ```

3. Copiar archivo de entorno:
   ```bash
   copy .env.example .env
   ```

4. Ejecutar seed inicial:
   ```bash
   npm run db:seed
   ```

5. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```

## Credenciales por Defecto

- **Email**: admin@royalcrm.com
- **Password**: admin123

## Estructura del Proyecto

```
CRM ROYAL 2026/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Next.js
├── packages/
│   └── shared/       # Tipos y constantes compartidas
├── docker-compose.yml
└── package.json
```

## Módulos

- Autenticación federada (Google/Microsoft) + email/password
- Gestión de clientes con campos personalizables
- Pipeline de estados tipo Kanban (arrastrar y soltar)
- Importación masiva de clientes vía CSV
- Mensajería WhatsApp y Email integrada
- Panel de configuración completo
- Dashboard con métricas de ventas
