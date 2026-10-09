# MediReserva — Panel de reservas médicas

Proyecto académico desarrollado con React, React Router, Axios y una API REST local de prueba usando JSON Server.

## Requisitos
- Node.js LTS y npm.
- Un navegador moderno.

## Cómo ejecutar
1. Descomprime la carpeta y ábrela en Visual Studio Code.
2. Abre una terminal en la carpeta del proyecto y ejecuta `npm install`.
3. En una terminal, ejecuta `npm run server` para iniciar la API en `http://localhost:3001`.
4. En otra terminal, ejecuta `npm run dev` y abre la dirección local que Vite muestre (normalmente `http://localhost:5173`).

## Acceso de demostración
- Correo: `demo@medireserva.com`
- Contraseña: `demo123`

## Funcionalidades
- Inicio de sesión de demostración consultando el endpoint `GET /users`.
- Resumen de citas y conteo por estado.
- Consulta de citas mediante `GET /appointments`.
- Registro con `POST /appointments`.
- Cancelación con `PATCH /appointments/:id`.
- Reprogramación de fecha con `PATCH /appointments/:id`.
- Validaciones básicas en formularios y mensajes ante errores de conexión.
- Diseño adaptable a pantallas pequeñas y grandes.

## Arquitectura y decisiones
- **Componentes:** Login, Layout, Dashboard y Appointments.
- **Rutas:** `/login`, `/` y `/citas`, gestionadas por React Router.
- **Estado:** `useState` y `useEffect` para estado local; Context API para compartir sesión entre componentes.
- **Comunicación:** Axios realiza peticiones HTTP a JSON Server.
- **Persistencia:** JSON Server escribe cambios en `db.json`; la sesión de demostración se conserva en `sessionStorage`.

## Endpoints REST utilizados
| Método | Endpoint | Uso |
|---|---|---|
| GET | `/users?email=...&password=...` | Verificación de acceso demostrativa |
| GET | `/appointments` | Consultar citas |
| POST | `/appointments` | Crear una cita |
| PATCH | `/appointments/:id` | Cancelar o reprogramar |

## Limitaciones importantes
Este proyecto es una **demostración académica**, no un sistema médico real. La autenticación no es segura para producción, porque las credenciales de demostración están en un archivo local. No se almacenan datos médicos sensibles. Para producción se necesitarían backend seguro, contraseñas cifradas, autorización, auditoría y protección de datos.

## Capturas y video para la entrega
Cuando ejecutes el proyecto, toma capturas reales de: (1) inicio de sesión, (2) resumen, (3) formulario y listado de citas, (4) confirmación de cancelación/reprogramación. Graba un video breve recorriendo estas funciones y pega los enlaces reales en el informe. No entregues enlaces inventados.
