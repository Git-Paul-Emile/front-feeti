// Lance le front Store en local contre le back de test des pages événement (port 8010).
// Les variables d'environnement priment sur .env (comportement de Vite) : .env n'est pas modifié.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const env = {
  ...process.env,
  VITE_BACKEND_URL: process.env.VITE_BACKEND_URL || "http://localhost:8010",
  VITE_BACKEND_PROVIDER: process.env.VITE_BACKEND_PROVIDER || "express",
};
const vite = path.join("node_modules", "vite", "bin", "vite.js");
const child = spawn(process.execPath, [vite, "--port", "3005", "--strictPort"], { env, stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 0));
