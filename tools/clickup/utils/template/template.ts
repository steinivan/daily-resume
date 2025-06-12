const TASK_TEMPLATES = {
    development: {
      name: "Tarea de Desarrollo",
      description: "Implementar funcionalidad: {feature}",
      priority: "medium",
      estimatedHours: 8,
      tags: ["desarrollo", "código"],
      subtasks: [
        "Análisis de requerimientos",
        "Diseño de la solución",
        "Implementación",
        "Testing",
        "Documentación"
      ],
      acceptanceCriteria: [
        "La funcionalidad cumple con los requerimientos",
        "El código pasa todas las pruebas",
        "La documentación está actualizada"
      ]
    },
    
    bug_fix: {
      name: "Corrección de Bug",
      description: "Resolver bug: {issue}",
      priority: "high",
      estimatedHours: 4,
      tags: ["bug", "corrección"],
      subtasks: [
        "Reproducir el bug",
        "Identificar la causa raíz",
        "Implementar solución",
        "Verificar corrección",
        "Actualizar tests"
      ],
      acceptanceCriteria: [
        "El bug ya no se reproduce",
        "No se introducen regresiones",
        "Los tests cubren el escenario"
      ]
    },
    
    research: {
      name: "Investigación",
      description: "Investigar: {topic}",
      priority: "low",
      estimatedHours: 16,
      tags: ["investigación", "análisis"],
      subtasks: [
        "Definir alcance de la investigación",
        "Recopilar información",
        "Analizar datos",
        "Documentar hallazgos",
        "Presentar conclusiones"
      ],
      acceptanceCriteria: [
        "La investigación está completa",
        "Los hallazgos están documentados",
        "Se proporcionan recomendaciones"
      ]
    },
    
    meeting: {
      name: "Reunión",
      description: "Reunión: {subject}",
      priority: "medium",
      estimatedHours: 2,
      tags: ["reunión", "comunicación"],
      subtasks: [
        "Preparar agenda",
        "Enviar invitaciones",
        "Conducir reunión",
        "Documentar acuerdos",
        "Enviar resumen"
      ],
      acceptanceCriteria: [
        "Todos los puntos de agenda fueron cubiertos",
        "Los acuerdos están documentados",
        "Se asignaron acciones de seguimiento"
      ]
    }
  };