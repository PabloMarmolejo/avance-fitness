# Avance Fitness

PWA para registro de entrenamientos, rutinas y progreso en el gimnasio.

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## Stack Tecnológico

- **Vite** - Build tool
- **Vanilla JavaScript** - Sin frameworks
- **IndexedDB** - Almacenamiento local
- **Chart.js** - Gráficas y visualizaciones
- **PWA** - Progressive Web App con service worker

## Estructura del Proyecto

```
avance-fitness/
├── public/
│   └── icons/          # Iconos de la PWA
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── views/         # Vistas principales
│   ├── db/            # IndexedDB y modelos
│   ├── utils/         # Utilidades y helpers
│   ├── router/        # Sistema de routing
│   ├── styles/        # CSS y estilos
│   └── main.js        # Punto de entrada
├── index.html
├── vite.config.js
└── package.json
```

## Features

- ✅ Registro de entrenamientos (fuerza, cardio, funcional)
- ✅ Sistema de rutinas personalizadas
- ✅ Tracking de progreso (peso, IMC, mediciones)
- ✅ Fotos de progreso
- ✅ Records personales automáticos
- ✅ Gráficas de evolución
- ✅ Funciona offline
- ✅ Instalable como app
