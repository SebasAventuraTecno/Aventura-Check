# Aventura Check

Aplicacion responsive que combina turismo y tecnologia para organizar giras, proyectos, tareas, reuniones, universidad y asuntos personales.

## MVP que vamos a construir primero

La primera version debe resolver lo esencial:

1. Agregar una actividad rapido desde celular o computadora.
2. Clasificarla por tipo: proyecto, tarea, gira, reunion, universidad o personal.
3. Guardar fecha, hora, prioridad, estado y notas.
4. Ver lo proximo en una lista clara.
5. Ver las actividades apuntadas en un calendario mensual grande.
6. Registrar giras de varios dias con fecha de inicio y fecha final.
7. Filtrar por tipo o estado.
8. Marcar actividades como pendientes, en proceso o completadas.
9. Guardar datos en el navegador mientras preparamos la base de datos.
10. Consultar, editar o eliminar una actividad desde el calendario.
11. Ingresar con Google y separar la agenda local de cada usuario.

## Arquitectura recomendada para Azure for Students

Para empezar barato:

- Frontend: web responsive/PWA con HTML, CSS y JavaScript.
- Primer almacenamiento: `localStorage` del navegador.
- Acceso inicial: Firebase Authentication con Google en su nivel sin costo.
- Despliegue inicial: Azure Static Web Apps, que tiene plan gratis.
- Segunda etapa: Azure Functions + Azure SQL Database o Azure Cosmos DB, segun lo que necesitemos.

Esta base permite practicar la app real sin gastar credito desde el primer dia.

## Como abrir la app por ahora

Abri `index.html` en el navegador.

Cuando pasemos a despliegue en Azure, la publicaremos con una URL publica.

## Proximos pasos

1. Revisar si el MVP cubre tu forma de trabajar.
2. Mejorar la entrada rapida con repeticion, recordatorios y etiquetas.
3. Agregar una vista semanal y busqueda.
4. Convertirla en PWA instalable.
5. Conectar una base de datos para sincronizar las cuentas entre dispositivos.
6. Subirla a Azure y revisar costos.
