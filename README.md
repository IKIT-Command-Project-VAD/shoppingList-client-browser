# React-PWA v3 🚀🎉⚡️

[![Analyses](https://github.com/suren-atoyan/react-pwa/actions/workflows/analyses.yml/badge.svg)](https://github.com/suren-atoyan/react-pwa/actions/workflows/analyses.yml)
[![E2E Tests](https://github.com/suren-atoyan/react-pwa/actions/workflows/tests:e2e.yml/badge.svg)](https://github.com/suren-atoyan/react-pwa/actions/workflows/tests:e2e.yml)

<a href="http://react-pwa.surenatoyan.com/" target="_blank" rel="noreferrer">
 <img src="./public/cover.png" title="React-PWA Starter Kit" alt="React-PWA cover image">
</a>

## 🌟 Overview

**React-PWA** is an opinionated starter kit for building Progressive Web Applications with React. Designed to streamline development, it combines essential libraries, components, utilities, and developer tools to accelerate your workflow.

## 💡 Motivation

Building a modern web application requires a robust setup, including routing, UI components, theming, error handling, a structured file system, testing tools, and performance optimizations. **React-PWA** provides a production-ready, minimal, and efficient environment for developers to focus on creating great applications.

## ✨ Tech Stack & Features

### Core Technologies
| Technology | Version | Description |
|------------|---------|-------------|
| [Vite](https://vitejs.dev/) | v6 | Fast build tool based on ES modules, Rollup, and esbuild |
| [React](https://react.dev/) | v19 | Latest version with all modern features |
| [TypeScript](https://www.typescriptlang.org/) | Latest | Type-safe JavaScript for better development |
| [MUI](https://mui.com/) | v6 | Comprehensive UI framework with MUI |

### Key Features
- **Routing**: [React Router v7](https://reactrouter.com/) for flexible client-side routing
- **State Management**: [Jotai](https://jotai.org/) for simple, efficient state handling
- **Theming**: Customizable dark/light mode with MUI [theme system](https://mui.com/material-ui/customization/theming/)
- **Notifications**: Alert system with MUI Toolpad integration
- **PWA Support**: Works offline and installs on any device
- **Hotkeys**: Built-in keyboard shortcuts for common actions
- **Error Handling**: Graceful error boundaries with custom fallbacks
- **Performance**: All green Lighthouse scores with optimized bundle size

### Developer Tools
- **Testing**: Vitest for unit tests, Playwright for e2e tests
- **CI/CD**: GitHub Actions workflows for quality checks and testing
- **Code Quality**: ESLint, Prettier, TypeScript integration
- **Git Hooks**: Husky with lint-staged for pre-commit quality enforcement
- **Local HTTPS**: Built-in support for local HTTPS development

## 🚀 Getting Started

### Quick Start

```bash
# Clone the repository
git clone https://github.com/suren-atoyan/react-pwa.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Optional, to fix vulnerabilities:
```bash
# Fix vulnerabilities
npm audit fix
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run prettier:check` | Check formatting |
| `npm run lint:check` | Check linting |
| `npm run ts:check` | Check TypeScript |
| `npm run test:unit` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run test:e2e:ui` | Run e2e tests in UI mode |
| `npm run preview` | Preview production build locally |
| `npm run https-preview` | Preview with HTTPS |

## 📁 Project Structure

```
react-pwa/
├── ...
├── src/
│   ├── components/     # Reusable UI components
│   ├── config/         # Application configuration
│   ├── error-handling/ # Error management
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Application pages/routes
│   ├── routes/         # Routing configuration
│   ├── sections/       # Self-contained application sections
│   ├── theme/          # Theme configuration
│   └── utils/          # Utility functions
└── ...
```

### Component Organization

Each component follows this structure:
```
ComponentName/
├── index.ts          # Default exports the component
├── ComponentName.tsx # Pure component implementation
├── types.ts          # Component-related types (optional)
├── styled.ts         # Styled components (optional)
└── utils.ts          # Component-specific utilities (optional)
```

## 🔍 Key Features Explained

### UI Framework
MUI ensures consistency, accessibility, and performance while remaining highly customizable to match your brand's design language.

```jsx
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

// styled components
const NewButton = styled(Button)(({ theme }) => ({
  marginRight: theme.spacing(1),
  color: theme.palette.text.disabled,
}));

// sx prop
function MyComponent() {
  return <Box sx={{ borderRadius: theme.shape.borderRadius }}>...</Box>;
}
```

### 🎨 Theming
The theme system is based on MUI Theme, supporting dark/light modes and customization.

```jsx
import { useThemeMode } from '@/theme';

function MyComponent() {
  const { themeMode, toggle } = useThemeMode();
  
  return <Button onClick={toggle}>Toggle Theme</Button>;
}
```

### State Management
Jotai provides simple atoms-based state management for cross-application state, complementing React's useState and data fetching libraries.

### Notifications
Utilizes MUI Toolpad’s `useNotification` for handling alerts in an elegant, customizable way:

```jsx
function MyComponent() {
  const notifications = useNotifications();

  function showNotification() {
    notifications.show('Operation successful!', {
      autoHideDuration: 5000,
    });
  }
}
```

### 🔑 Hotkeys
- `Alt+s`: Toggle theme mode
- `Alt+t`: Toggle sidebar
- `Alt+/`: Open hotkeys dialog

### PWA Features
- Works offline with service worker caching
- Installable on mobile and desktop devices
- Automatic updates (configurable in `vite.config.ts`)

### 📱 Performance
- Bundle size: ~65KB for largest chunk
- Initial load: ~0.6s
- Cached loads: ~0.01s

<img src="./public/bundle.png" title="bundle">
<img src="./public/audit.png" alt="Performance audit" title="Performance audit">

### Error Handling
The `withErrorHandler` HOC catches errors and displays friendly fallback UIs:

```jsx
// In your component:
export default withErrorHandler(MyComponent);

// Or for the entire app:
export default withErrorHandler(App);
```

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### E2E Tests
```bash
npm run test:e2e
# or with UI
npm run test:e2e:ui
```

## 🌐 Environment Variables

Place your environment variables in a `.env` file (prefixed with `VITE_`):
- Templates available in the `env/` directory
- Access via `import.meta.env.VITE_VARIABLE_NAME`

## ❓ FAQ

### Why use a UI library?
A UI library ensures consistency, accessibility, and development efficiency. Without one, teams would need to create and maintain basic components from scratch, leading to inconsistencies and wasted time.

### Why Jotai for state management?
React applications have different state management needs:
- **Component-level state**: `useState` for local UI interactions
- **Data-layer state**: `useQuery` or `Apollo` for remote data
- **Cross-application state**: Jotai provides a minimal, elegant approach

### What's the difference between components, sections, and pages?
- **Components**: Reusable UI elements (`Button`, `List`, etc.)
- **Sections**: Self-contained UI parts with their own logic (`Navigation`, `Sidebar`, etc.)
- **Pages**: Root route components representing application views

### Why TypeScript?
TypeScript reduces runtime errors, improves code maintainability, and enhances developer experience with static typing and better IDE support.

### Why use Prettier?
Prettier enforces consistent style across all contributors, reducing discussions in PR reviews and ensuring code quality.

## 🔗 Demo

Check out the [live demo](https://react-pwa.surenatoyan.com/)

<div>
 <img src="./public/demo-dark.png" width="280" alt="Dark theme demo"> 
 <img src="./public/demo-light.png" width="280" alt="Light theme demo">
</div>

## 📄 License

[MIT](./LICENSE)

## Инструкция по работе

### Работа с Git

В репозитории 2 ветки: `master` и `dev`. Работаем преимущественно в `dev`. В master только делаем `git merge`.
Соответственно когда склонировали репозиторий, не забываем перейти в ветку `dev`.

### Работа с проектом

Выше есть инструкция из самого шаблона, советую почитать.

Важно сейчас понимать, что здесь используется Typescript, React, React-router, MaterialUI.

Typescript - это javascript с типизацией. Как в Python добавляешь через `:` типы.

React - понятно.

React-router - фреймворк, который улучшает работу со SPA (Single Page Application)

MaterialUI - фреймворк с готовыми компонентам (кнопочки, ссылочки, header, footer и т.д) с возможностью для создания своих тем и много чего ещё.

Наконец, если что-то не понятно (а оно скорее всего так и будет):
1. Можно написать в чат, мы постараемся помочь.
2. Берёшь ссылку на шаблон, с которого я это всё копировал. И скармливаешь ИИшке с просьбой объяснить шаблон или какую-то деталь
