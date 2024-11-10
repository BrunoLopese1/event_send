/// <reference types="vite/client" />

// src/global.d.ts
export {};

declare global {
  interface Window {
    loadPyodide: () => Promise<Pyodide>;
  }

interface Pyodide {
  runPythonAsync: (code: string) => Promise<any>;
  globals: any;
  loadPackage: (packageName: string) => Promise<void>; // Adicionando a função loadPackage
}
}
