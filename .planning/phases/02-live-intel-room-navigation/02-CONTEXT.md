# Phase 2: Live-Intel Room Navigation
Domain: Reemplazar el mapa 3D con una lista de navegación dinámica en terminal, con presencia de estudiantes en tiempo real y bloqueo/interacción por estados de privacidad en las salas.

<decisions>
- **Diseño Visual de la Lista**: Formato tabla de terminal (para mantener el feeling hacker). Mostrará estadísticas del volumen de estudiantes (un contador).
- **Tooltip de Presencia**: Al hacer hover (pasar el mouse) sobre una sala de la lista, debe desplegarse un tooltip emergente mostrando los avatares (sprite/imagen) de los estudiantes que están actualmente en ella.
- **Señalización de "Sala Actual"**: La sala en la que el usuario ya está posicionado debe estar explícitamente marcada e iluminada con un brillo azul.
- **Salas Privadas (Private)**: Tienen habilitado el evento onClick, y al presionarse detonarán la mecánica de "espiar" a través del tiro de dados (Dice Roll mechanic) en el futuro, pero la acción es posible, no está bloqueada.
- **Salas en Mantenimiento (Maintenance)**: Totalmente deshabilitadas para clic. Si se aprietan o se pasa sobre ellas, pueden dar un feedback de 'glitch'. No admiten acceso.
- **Salas Escondidas (Hidden)**: No deben siquiera renderizarse en la lista de terminal para los estudiantes; están reservadas como pasajes visibles solamente por los Staff/NPCs.
</decisions>
