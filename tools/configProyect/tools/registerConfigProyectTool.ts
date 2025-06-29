// Tools entry for configProyect
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "fs";
import path from "path";
import os from "os";
import { z } from "zod";

export function registerConfigProyectTool(server: McpServer) {
  server.tool(
    "configuration-proyect",
    "Herramienta para la configuración inicial del proyecto: genera la carpeta .cursor/rules y un archivo de plantilla contextTaskManager.mdc con reglas contextuales. REQUIERE especificar la ruta del proyecto.",
    {
      projectPath: z.string().describe("Ruta del directorio del proyecto donde crear .cursor/rules"),
    },
    async (args) => {
      try {
        const debugInfo = [];
        
        let targetDir;
        let inputPath = args.projectPath;

        // Decodificar si la ruta viene URL-encoded (ej: /c%3A/Users/ivanu...)
        if (/^\/([a-zA-Z]%3A)/.test(inputPath)) {
          const decoded = decodeURIComponent(inputPath);
          // Normalizar letra de unidad a mayúscula y quitar barra inicial extra
          const match = decoded.match(/^\/([a-zA-Z]):/);
          if (match) {
            targetDir = decoded.replace(/^\/([a-zA-Z]):/, (m, p1) => `${p1.toUpperCase()}:`);
            debugInfo.push(`Ruta decodificada y normalizada: ${targetDir}`);
          } else {
            targetDir = decoded;
            debugInfo.push(`Ruta decodificada: ${targetDir}`);
          }
        } else if (inputPath === "." || inputPath === "./") {
          targetDir = findCursorWorkspace() || process.cwd();
          debugInfo.push(`Detectando workspace de Cursor: ${targetDir}`);
        } else if (path.isAbsolute(inputPath)) {
          targetDir = inputPath;
          debugInfo.push(`Usando ruta absoluta: ${targetDir}`);
        } else {
          targetDir = path.resolve(inputPath);
          debugInfo.push(`Resolviendo ruta relativa: ${targetDir}`);
        }
        
        // Verificar que el directorio existe
        if (!fs.existsSync(targetDir)) {
          throw new Error(`El directorio del proyecto no existe: ${targetDir}`);
        }
        
        debugInfo.push(`Directorio del proyecto: ${targetDir}`);
        debugInfo.push(`Directorio del MCP: ${process.cwd()}`);
        
        const rulesDir = path.join(targetDir, ".cursor", "rules");
        debugInfo.push(`Ruta objetivo: ${rulesDir}`);
        
        // Verificar permisos del directorio del proyecto
        try {
          fs.accessSync(targetDir, fs.constants.W_OK);
          debugInfo.push(`Permisos de escritura: ✓ OK`);
        } catch (permError) {
          throw new Error(`Sin permisos de escritura en: ${targetDir}`);
        }
        
        // Crear directorio paso a paso
        const cursorDir = path.join(targetDir, ".cursor");
        
        // Crear .cursor primero
        if (!fs.existsSync(cursorDir)) {
          fs.mkdirSync(cursorDir, { recursive: true });
          debugInfo.push(`Directorio .cursor: ✓ Creado`);
        } else {
          debugInfo.push(`Directorio .cursor: ✓ Ya existe`);
        }
        
        // Crear rules dentro de .cursor
        if (!fs.existsSync(rulesDir)) {
          fs.mkdirSync(rulesDir, { recursive: true });
          debugInfo.push(`Directorio rules: ✓ Creado`);
        } else {
          debugInfo.push(`Directorio rules: ✓ Ya existe`);
        }
        
        const contextTaskManagerPath = path.join(rulesDir, "contextTaskManager.mdc");
        const fileExists = fs.existsSync(contextTaskManagerPath);
        debugInfo.push(`Archivo existía previamente: ${fileExists ? 'Sí' : 'No'}`);
        
        // Contenido del archivo .mdc
        const mdcContent = `---
rule_type: always
---

# Context Task Manager

## Información del Proyecto
**Generado:** ${new Date().toISOString()}
**Proyecto:** ${targetDir}
**MCP ejecutado desde:** ${process.cwd()}
**Ubicación:** .cursor/rules/contextTaskManager.mdc

## Reglas de Desarrollo
- Usar TypeScript con configuración estricta
- Seguir principios SOLID
- Implementar manejo de errores consistente
- Mantener código autodocumentado
- Escribir tests para funcionalidades críticas

## Convenciones de Código
- **Archivos:** kebab-case
- **Variables/Funciones:** camelCase  
- **Clases/Interfaces:** PascalCase
- **Constantes:** UPPER_SNAKE_CASE

## Estructura Recomendada
\`\`\`
src/
├── components/
├── utils/
├── types/
├── services/
└── tests/
\`\`\`

## Instrucciones para IA
1. **SIEMPRE** revisar estas reglas antes de generar código
2. **MANTENER** consistencia con patrones existentes
3. **SUGERIR** mejoras cuando sea apropiado
4. **DOCUMENTAR** decisiones de diseño importantes
5. **VALIDAR** que el código sigue las convenciones establecidas

## Herramientas y Configuración
- Usar ESLint y Prettier para formateo
- Configurar pre-commit hooks
- Implementar CI/CD básico
- Mantener dependencias actualizadas

---
*Contexto activo permanentemente en Cursor*
*Proyecto: ${path.basename(targetDir)}*
`;
        
        fs.writeFileSync(contextTaskManagerPath, mdcContent, { encoding: "utf-8" });
        debugInfo.push(`Archivo escrito: ✓ Completado`);
        
        // Verificar que el archivo se escribió
        const finalCheck = fs.existsSync(contextTaskManagerPath);
        if (!finalCheck) {
          throw new Error('El archivo no se pudo escribir correctamente');
        }
        
        const stats = fs.statSync(contextTaskManagerPath);
        debugInfo.push(`Tamaño final: ${stats.size} bytes`);
        
        return {
          content: [{
            type: "text",
            text: `🎉 **CONFIGURACIÓN COMPLETADA EXITOSAMENTE**

📋 **Resumen:**
• Proyecto: ${path.basename(targetDir)}
• Carpeta .cursor/rules/ ✓ Creada
• Archivo contextTaskManager.mdc ${fileExists ? 'actualizado' : 'creado'} ✓
• Tamaño: ${stats.size} bytes
• Rule type: always (contexto permanente)

📍 **Ubicación:**
\`${contextTaskManagerPath}\`

🔍 **Información de proceso:**
${debugInfo.map(info => `• ${info}`).join('\n')}

⚡ **El archivo está listo y activo en Cursor!**`
          }]
        };
        
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ **ERROR EN LA CONFIGURACIÓN**

🚨 **Problema:** ${error instanceof Error ? error.message : 'Error desconocido'}

📍 **Contexto:**
• Directorio del MCP: ${process.cwd()}
• Directorio solicitado: ${args?.projectPath || 'No especificado'}

🔧 **Cómo usar correctamente:**
1. \`projectPath: "."\` - Para el directorio actual de Cursor
2. \`projectPath: "/ruta/completa/proyecto"\` - Ruta absoluta
3. \`projectPath: "../mi-proyecto"\` - Ruta relativa

💡 **Ejemplo de uso:**
Especifica la ruta del proyecto donde quieres crear .cursor/rules/`
          }],
          isError: true
        };
      }
    }
  );
}

// Función auxiliar para intentar detectar el workspace de Cursor
function findCursorWorkspace(): string | null {
  try {
    // Buscar variables de entorno que Cursor podría establecer
    if (process.env.CURSOR_WORKSPACE_FOLDER) {
      return process.env.CURSOR_WORKSPACE_FOLDER;
    }
    
    // Intentar encontrar el directorio padre con package.json, .git, etc.
    let current = process.cwd();
    const root = path.parse(current).root;
    
    while (current !== root) {
      // Buscar indicadores de proyecto
      const indicators = ['package.json', '.git', 'tsconfig.json', 'pyproject.toml', 'Cargo.toml'];
      const hasIndicator = indicators.some(indicator => 
        fs.existsSync(path.join(current, indicator))
      );
      
      if (hasIndicator) {
        return current;
      }
      
      current = path.dirname(current);
    }
    
    return null;
  } catch {
    return null;
  }
}