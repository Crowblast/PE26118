# Tecno Mundo - Plataforma E-commerce Premium (Entrega Final)

@Autor: Roberto Juárez  
@Versión: 3.0 (Entrega Final)  
@Actualización: Julio 2026

Tecno Mundo es una web de comercio electrónico dedicada a la venta de periféricos, audio y wearables. Construida sobre React 19 y Vite, con un diseño moderno responsivo y animaciones fluidas.

---

## Características Clave Implementadas

1. **Gestión del Carrito (Context API)**:
   - Estado del carrito compartido globalmente mediante `CartContext`.
   - Soporte para agregar productos, actualizar cantidades dinámicamente según el stock disponible, remover artículos específicos y vaciar el carrito.
   - **Persistencia local**: El carrito se guarda automáticamente en `localStorage` para no perder la selección al recargar la página.
 
2. **Autenticación (Firebase Auth)**:
   - Inicio de sesión y registro de usuarios gestionados mediante Firebase Authentication en `AuthContext`.
   - Protección de rutas críticas mediante un wrapper `PrivateRoute` (ej. el Panel de Administración `/admin`).
 
3. **CRUD de Productos (Firebase Firestore)**:
   - Integración directa con una base de datos Firebase Firestore para leer y administrar el catálogo.
   - Panel de gestión interactivo exclusivo para administradores, que incluye:
     - Formulario de creación y edición controlado con validaciones en tiempo real (campos requeridos, precio mayor a cero y stock no negativo).
     - Modal de confirmación para evitar eliminaciones accidentales de productos.
     - Indicadores de carga (spinners) y manejo interactivo de errores de red.
 
4. **Búsqueda en Tiempo Real y Paginación**:
   - Barra de búsqueda integrada en el catálogo que filtra productos al instante a medida que el usuario escribe.
   - Paginación fluida (6 artículos por página) para optimizar el rendimiento de renderizado.
 
5. **Diseño Responsivo y SEO**:
   - Sistema de grillas flexible utilizando `React-Bootstrap`.
   - Estilización modular avanzada a través de `styled-components`.
   - Iconografía interactiva robusta con `react-icons`.
   - SEO Dinámico mediante `react-helmet-async` para inyectar títulos y etiquetas meta en cada página de la tienda.
 
---
