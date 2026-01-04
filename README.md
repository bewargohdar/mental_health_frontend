# Mental Health Platform Frontend

A comprehensive, responsive frontend for a mental health platform, built with React and Vite. This application provides a user-friendly interface for tracking mood, accessing educational resources, connecting with a community, and finding professional help.

## Features

- **Responsive Design**: Built with Tailwind CSS for a seamless experience across all devices (mobile, tablet, desktop).
- **Internationalization (i18n)**: Full support for English, Arabic, and Kurdish languages.
- **Theme Support**: Light and Dark mode toggle.
- **Mood Tracking**: Visualize mood trends using Recharts.
- **Educational Resources**: Access a library of articles and videos.
- **Community Forum**: Connect with others.
- **Doctor Directory**: Find and connect with mental health professionals.
- **Authentication**: User registration and login flows.

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **State Management**: React Context API
- **Internationalization**: [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd mental-health-frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

Build the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```
mental-health-frontend/
├── public/              # Static assets
├── src/
│   ├── api/             # API services and configuration
│   ├── assets/          # Images, fonts, and global styles
│   ├── components/      # Reusable UI components (Layout, Footer, etc.)
│   ├── context/         # React Context providers (ThemeContext, etc.)
│   ├── locales/         # i18n translation files
│   ├── pages/           # Application route pages (Home, Dashboard, etc.)
│   ├── App.jsx          # Main application component with routing
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global CSS and Tailwind directives
├── .gitignore           # Git ignore rules
├── eslint.config.js     # ESLint configuration
├── index.html           # HTML entry point
├── package.json         # Project dependencies and scripts
└── vite.config.js       # Vite configuration
```

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to check for code quality issues.
- `npm run preview`: Previews the production build locally.

---

Built with ❤️ for better mental health.
