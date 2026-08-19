export interface Template {
  id: string;
  name: string;
  description: string;
  language: string;
  icon: string;
  files: Record<string, string>;
}

export const builtInTemplates: Template[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'An empty workspace ready for anything',
    language: 'plaintext',
    icon: 'File',
    files: {
      'README.md': '# New Project\n\nWelcome to your new blank project!'
    }
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    description: 'A basic Node.js environment',
    language: 'javascript',
    icon: 'Terminal',
    files: {
      'index.js': "console.log('Hello from Node.js!');\n\n// Try running 'node index.js'",
      'package.json': "{\n  \"name\": \"node-project\",\n  \"version\": \"1.0.0\",\n  \"main\": \"index.js\",\n  \"scripts\": {\n    \"start\": \"node index.js\"\n  }\n}"
    }
  },
  {
    id: 'python',
    name: 'Python',
    description: 'A simple Python script',
    language: 'python',
    icon: 'Terminal',
    files: {
      'main.py': "print('Hello from Python!')\n\n# Try running 'python main.py'"
    }
  },
  {
    id: 'react-vite',
    name: 'React + Vite',
    description: 'A React application bundled with Vite',
    language: 'typescript',
    icon: 'Layout',
    files: {
      'package.json': "{\n  \"name\": \"react-vite-app\",\n  \"private\": true,\n  \"version\": \"0.0.0\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"tsc && vite build\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\"\n  },\n  \"devDependencies\": {\n    \"@types/react\": \"^18.2.15\",\n    \"@types/react-dom\": \"^18.2.7\",\n    \"@vitejs/plugin-react\": \"^4.0.3\",\n    \"typescript\": \"^5.0.2\",\n    \"vite\": \"^4.4.5\"\n  }\n}",
      'vite.config.ts': "import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    host: '0.0.0.0'\n  }\n})",
      'index.html': "<!doctype html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Vite + React</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>",
      'src/main.tsx': "import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App.tsx'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n)",
      'src/App.tsx': "import React from 'react'\n\nfunction App() {\n  return (\n    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>\n      <h1>Hello React + Vite 🚀</h1>\n      <p>Start editing src/App.tsx to see changes!</p>\n    </div>\n  )\n}\n\nexport default App\n",
      'src/index.css': "body {\n  margin: 0;\n  background: #f0f2f5;\n  color: #333;\n}"
    }
  },
  {
    id: 'java',
    name: 'Java',
    description: 'A basic Java application',
    language: 'java',
    icon: 'Coffee',
    files: {
      'Main.java': "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from Java!\");\n    }\n}"
    }
  },
  {
    id: 'cpp',
    name: 'C++',
    description: 'A simple C++ program',
    language: 'cpp',
    icon: 'Cpu',
    files: {
      'main.cpp': "#include <iostream>\n\nint main() {\n    std::cout << \"Hello from C++!\" << std::endl;\n    return 0;\n}"
    }
  },
  {
    id: 'go',
    name: 'Go',
    description: 'A simple Go program',
    language: 'go',
    icon: 'Terminal',
    files: {
      'main.go': "package main\n\nimport \"fmt\"\n\nfunc main() {\n\tfmt.Println(\"Hello from Go!\")\n}"
    }
  }
];
