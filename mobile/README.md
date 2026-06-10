# MedFlow Mobile

Aplicacion movil `React Native + Expo Go` para el MVP de MedFlow.

## Estructura

- `App.tsx`: entrada principal.
- `src/navigation`: navegacion por roles.
- `src/screens`: pantallas del MVP.
- `src/components`: bloques reutilizables.
- `src/services`: capa HTTP para conectar con Laravel.
- `src/state`: estado temporal con datos mock.

## Dependencias esperadas

Instalar con `npm.cmd install` o `npm install` cuando el entorno permita scripts.

## Ejecucion

```powershell
npm.cmd install
npm.cmd run start
```

## Estado actual

- El frontend ya incluye login simulado por rol, paneles, citas, pacientes, historial, documentos, QR y asistente IA mock.
- La fuente de datos actual es local (`src/data/mockData.ts`) y esta preparada para sustituirse por llamadas al backend.
- El primer acceso del paciente ya guarda `cedula + nombres` en almacenamiento local seguro del celular y luego intenta sincronizarlo con nube.
- En Expo Go se usa `SecureStore` como persistencia local actual; `Room` requerira migrar a proyecto nativo Android o prebuild.
- Login inicial ahora separa `Paciente` y `Doctor`; acceso doctor solo con cuenta provista por administracion.
