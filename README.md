# MedFlow Workspace

Este workspace contiene dos proyectos:

- [mobile/README.md](C:/Users/pasanteti/Desktop/RegistroMedico/mobile/README.md)
- [backend/README.md](C:/Users/pasanteti/Desktop/RegistroMedico/backend/README.md)

## Estado actual

- `mobile/`: base Expo Go con navegacion por roles, pantallas del MVP y datos mock.
- `backend/`: base de API Laravel con rutas, modelos, controladores y migraciones para PostgreSQL en Supabase.

## Limitaciones del entorno actual

- `npm` existe, pero PowerShell bloquea `npm.ps1`; usar `npm.cmd`.
- `php` y `composer` no estan disponibles en PATH, por eso no fue posible instalar ni ejecutar Laravel aqui.

## Comandos previstos

Frontend:

```powershell
cd C:\Users\pasanteti\Desktop\RegistroMedico\mobile
npm.cmd install
npm.cmd run start
```

Backend:

```powershell
cd C:\Users\pasanteti\Desktop\RegistroMedico\backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
