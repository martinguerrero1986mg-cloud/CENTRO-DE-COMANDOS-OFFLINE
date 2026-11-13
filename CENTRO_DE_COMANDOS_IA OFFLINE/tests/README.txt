BATERÍA DE REGRESIÓN — CENTRO DE COMANDOS IA OFFLINE 1.1

Esta batería pertenece al entorno de validación del paquete. No forma parte del funcionamiento de la aplicación.

REQUISITO DE DESARROLLO
- Node.js disponible en el equipo de validación.

EJECUCIÓN
Desde la carpeta raíz:
  node tests/regression.test.js

ALCANCE
- Integridad del catálogo de 258 capacidades.
- Unicidad de IDs y alias.
- Compilación individual de las capacidades.
- Presets y límites de selección.
- Simetría de compatibilidad en una muestra amplia.
- Preservación del modo de Desarrollo y Auditoría Integral.
- Casos representativos de la compuerta preventiva.
- Persistencia exclusiva de favoritos y migración legacy.
- CSP offline y ausencia de conexiones externas.
- Hardening de los iniciadores Windows.
- Ausencia de eval, new Function, fetch, XMLHttpRequest y WebSocket.

NOTA
Esta suite no reemplaza una prueba E2E visual en Windows ni una prueba de interpretación en proveedores de IA externos. Esas validaciones requieren su entorno correspondiente.
