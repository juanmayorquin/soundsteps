# Resumen Ejecutivo

Este documento detalla el diseño de una aplicación de entrenamiento auditivo **post-implante coclear** básica, dividida en tres módulos secuenciales (detección de sonido, discriminación y reconocimiento de palabras). Cada módulo incluye los estímulos (sonidos y palabras) adecuados para las primeras etapas de rehabilitación auditiva, sus opciones de interfaz de usuario y las reglas de progresión de dificultad. Las elecciones de estímulos y metodología se fundamentan en guías clínicas y literatura especializada【42†L157-L165】【57†L125-L132】【61†L51-L56】. A continuación se ilustra la secuencia de módulos con un diagrama:

```mermaid
flowchart LR
  A[Inicio de la app] --> B[Módulo 1: Detección de sonido]
  B --> C[Módulo 2: Discriminación de sonido]
  C --> D[Módulo 3: Identificación de palabras]
  D --> E[Fin]
```

Cada módulo sigue la jerarquía de habilidades auditivas recomendada【42†L157-L165】【57†L125-L132】. A continuación se describen en detalle el funcionamiento, estímulos y objetivos de cada módulo, seguidos de las opciones de interfaz, progresión de dificultad, esquema de datos y notas de implementación.

## Módulo 1: Detección de Sonido

En esta fase inicial se entrena al paciente para indicar la **presencia o ausencia de un estímulo sonoro**【57†L125-L127】. Se usan sonidos sencillos y ambientales para condicionar la respuesta auditiva. Por ejemplo, la aplicación reproducirá un sonido (o silencio) y el usuario deberá pulsar un botón de “Escuché / No escuché” según perciba o no el sonido. A medida que progresa, se añadirán sonidos cada vez más débiles o en contextos con ruido de fondo bajo.  

**Estímulos sugeridos (sonidos ambientales básicos):**

| Sonido / Estímulo                  | Descripción                                              |
|:----------------------------------|:---------------------------------------------------------|
| Timbre de puerta                  | Sonido de timbre o portero eléctrico de entrada          |
| Golpe leve en mesa o pared        | Golpe sordo con la mano (por ejemplo golpear la mesa)    |
| Teléfono sonando                  | Sonido de llamada telefónica estándar                    |
| Aplausos                          | Una o varias palmas manuales                            |
| Agua corriendo                    | Sonido de grifo o ducha abierto                          |
| Voz humana – vocal sostenida **/a/** | Voz humana pronunciando la vocal “a” sostenida         |
| Voz humana – vocal sostenida **/u/** | Voz humana pronunciando la vocal “u” sostenida         |
| Click suave                       | Sonido de chasquido discreto (por ejemplo, pulsador)      |

Estos sonidos cubren diferentes frecuencias y contextos ambientales. El **objetivo terapéutico** del módulo 1 es asegurar la conciencia auditiva básica: el paciente aprende a **detectar cualquier sonido** y a distinguirlo del silencio【57†L125-L127】. Esto sienta las bases para la posterior codificación de sonidos reales【42†L142-L149】. Se espera que, al terminar este módulo, el usuario responda correctamente la mayoría de las veces ante sonidos sencillos y note ausencia de sonido cuando corresponda. 

## Módulo 2: Discriminación de Sonidos

En este módulo el paciente practica distinguir entre **dos sonidos distintos**. Siguiendo el protocolo de rehabilitación, se entrena si dos estímulos “son iguales o diferentes”【57†L127-L132】. La aplicación puede presentar **pares mínimos** de sonidos o sílabas. Por ejemplo, tras reproducir dos sonidos seguidos, el usuario responde “mismos / distintos”. Gradualmente se usan contrastes más finos (en frecuencia e intensidad) para aumentar la dificultad. 

**Ejemplos de contrastes fonéticos:**

| Par de sonidos                 | Descripción                                |
|:------------------------------|:-------------------------------------------|
| **/pa/ – /ba/**               | Consonantes oclusivas bilabiales sordas vs sonoras (labios)  |
| **/ta/ – /da/**               | Oclusivas dentales sordas vs sonoras       |
| **/ka/ – /ga/**               | Oclusivas velares sordas vs sonoras        |
| **/sa/ – /za/**               | Fricativas alveolares sordas vs sonoras    |
| **/ma/ – /na/**               | Nasales bilabial vs alveolar               |
| **/pa/ – /ta/**               | Cambio de punto de articulación (bilabial vs dental) |
| **/a/ – /i/**                 | Vocales cerrada (/i/) vs abierta (/a/)     |
| **/o/ – /u/**                 | Vocales media (/o/) vs cerrada (/u/)       |
| **Grave – Agudo**             | Tonos puros de baja frecuencia vs alta frecuencia |

Estos pares incluyen tanto **consonantes** como **vocales**. También se pueden incluir sonidos de similar timbre (ej. “mmm” vs “sss” para practicar contraste de ruido vs voz). El **objetivo** de la discriminación es mejorar la resolución auditiva: el paciente aprende a distinguir fonemas y sonidos próximos (p.ej. consonantes sordas vs sonoras), sin necesidad de comprender la palabra【57†L127-L132】. Al final del módulo 2 se espera que el usuario identifique correctamente pares fonéticos básicos la mayoría de las veces. Esto prepara al oído para diferenciar sílabas y fonemas durante la conversación.

## Módulo 3: Identificación de Palabras

Este módulo se enfoca en **reconocer palabras reales simples**. Se comienza con **vocabulario cotidiano de alta frecuencia**, preferiblemente palabras cortas (1–2 sílabas) y concretas【61†L51-L56】【57†L130-L132】. Cada ejercicio reproduce una palabra y muestra varias imágenes (o botones con texto); el usuario debe pulsar la imagen que corresponde a la palabra escuchada. Al inicio se usan pocas opciones (2-3 imágenes) y palabras muy familiares; luego se agregan más distractores y vocablos menos frecuentes para aumentar la complejidad. 

**Lista de palabras propuestas (20–25):**

| Palabra    | Categoría/Ejemplo                           |
|:-----------|:--------------------------------------------|
| **Casa**   | Objeto cotidiano (hogar)                    |
| **Perro**  | Animal (mascota)                            |
| **Carro**  | Objeto (vehículo)                           |
| **Teléfono**| Objeto (teléfono móvil o fijo)             |
| **Puerta** | Objeto (entrada/casa)                       |
| **Agua**   | Sustancia (líquido potable)                 |
| **Luz**    | Objeto/Concepto (iluminación)               |
| **Gato**   | Animal (mascota)                            |
| **Mamá**   | Persona (femenino)                          |
| **Papá**   | Persona (masculino)                         |
| **Bebé**   | Persona (infante)                           |
| **Hola**   | Saludo (frase simple)                       |
| **Sí**     | Afirmación (respuesta)                      |
| **No**     | Negación (respuesta)                        |
| **Comer**  | Verbo (acción cotidiana)                    |
| **Ir**     | Verbo (acción cotidiana)                    |
| **Sentar** | Verbo (acción de sentarse)                  |
| **Ven**    | Verbo (acción, venir)                       |
| **Pelota** | Objeto (juguete)                            |
| **Vaso**   | Objeto (cocina)                             |
| **Libro**  | Objeto (lectura/educación)                  |
| **Zapato** | Objeto (ropa)                               |
| **Sol**    | Concepto natural (cielo/día)                |
| **Mesa**   | Objeto (mueble)                             |
| **Leche**  | Sustancia (bebida)                          |

Estas palabras han sido elegidas por su uso frecuente y por representar conceptos visuales claros, facilitando su reconocimiento. En los primeros ejercicios se mostrarían sólo dos o tres imágenes (p.ej. “mamá” vs “papá”); luego se incluirían más opciones. El **objetivo** es que el paciente empareje cada palabra oída con su significado visual, consolidando la conexión sonido-grama【61†L51-L56】【57†L130-L132】. Al completar el módulo 3, el usuario debe entender e identificar correctamente un vocabulario básico al escucharlo. Estas actividades apoyan el **desarrollo del lenguaje oral**, tal como señalan las guías【57†L130-L132】【42†L157-L165】.

## Progresión de Dificultad

La aplicación incluirá reglas para ir **incrementando la dificultad** conforme el paciente mejora. Algunas estrategias posibles son: 

- **Relación señal-ruido (SNR):** Inicialmente sin ruido de fondo; después añadir ruido ambiental o competencia lingüística de manera progresiva (p.ej. presentar ejercicios en entornos más ruidosos)【61†L63-L71】.  
- **Contraste de frecuencia y tono:** En discriminación, comenzar con diferencias de tono muy marcadas (grave vs agudo) y luego reducir la distancia tonal entre los estímulos.  
- **Similitud fonémica:** Iniciar con pares claramente distintos (/pa/ vs /ba/), y luego usar pares más parecidos fonéticamente (/pa/ vs /ta/).  
- **Longitud de palabras:** Para identificación, iniciar con palabras monosílabas (p.ej. “sí”, “no”), luego bi- y trisílabas («teléfono», «zapato»).  
- **Número de distractores:** Empezar con 2-3 opciones de respuesta; aumentar gradualmente a 4–6 imágenes o palabras en pantalla.  
- **Velocidad de reproducción:** Ofrecer la opción de repetir el sonido lentamente o varias veces; progresivamente reducir repeticiones para simular condiciones reales.  

Cada aspecto puede controlarse mediante niveles o sliders en la interfaz (p.ej. control de volumen de fondo, velocidad de reproducción). Esto asegura una rehabilitación progresiva y adaptativa, de modo que el usuario mantenga éxito inicial y obtenga un desafío creciente.

## Interfaz de Usuario (UI) y Controles

Para cada ejercicio se incluirán botones y ayudas visuales que guíen la interacción del paciente. A modo de ejemplo:

- **Módulo 1 (Detección):** Botón central grande “▶” para reproducir el sonido. Tras la reproducción, botones **“Sí” / “No”** (o iconos auditivos) para indicar detección. Se puede incluir un indicador visual (luz verde/roja) como retroalimentación inmediata (“correcto”/“incorrecto”). Un botón de **Repetir** permite escuchar de nuevo el sonido. También podrían usarse imágenes referentes al sonido (ej. ícono de teléfono) para refuerzo visual.  
- **Módulo 2 (Discriminación):** Interfaz con dos botones o áreas, cada uno reproduce un sonido distinto (o un solo botón reproduce dos sonidos sucesivos). Luego aparece la pregunta “¿Son iguales?” con opciones **“Iguales” / “Diferentes”**. Cada sonido puede tener un ícono asociado (p.ej. una figura que comience con ese fonema). Se añadirá feedback inmediato (sonido de campana por acierto, cruz roja por error). Opciones de control: repetir cada sonido individualmente, o escuchar ambos de nuevo. Se pueden ajustar separación en el tiempo entre sonidos, o agregar ruido de fondo para mayores niveles.  
- **Módulo 3 (Identificación de palabras):** Se muestran varias imágenes (2–6) en pantalla, cada una etiquetada con la palabra en texto (opcional). Al pulsar ▶ se reproduce la palabra hablada. El usuario selecciona la imagen correcta. Feedback: resaltar en verde la imagen correcta si acierta, o señalar error si equivoca. Un contador de aciertos o puntuación por ejercicio ayuda a motivar. Opciones: botón “Repetir” para escuchar la palabra de nuevo (lento/rápido), y ajuste de volumen o inserción de ruido progresivo.  

En todos los ejercicios se puede incluir un **contador de aciertos** o estrellas como recompensa. También es útil una **barra de progreso** que muestre el nivel actual. Detalles gráficos (colores, tamaño de botones) se adaptarían a la plataforma (móvil/tablet) y preferencia del usuario.

## Justificación Clínica y Objetivos Terapéuticos

Cada módulo responde a objetivos clínicos concretos y se alinea con las etapas de rehabilitación auditiva reconocidas【57†L125-L132】【42†L157-L165】: 

- **Módulo 1:** *Objetivo:* recuperar la **conciencia auditiva básica**. Aprender a detectar sonido permite al paciente “entrar” al mundo sonoro post-implante【57†L125-L127】【42†L142-L149】. Un progreso aquí indica que el implante está percibiendo sonidos ambientales.  
- **Módulo 2:** *Objetivo:* reforzar la **discriminación fonémica** y auditiva. Distinguir fonemas es clave para percibir el habla. Entrenamientos de contraste (sonidos iguales/diferentes) facilitan el reconocimiento fonológico inicial【57†L127-L132】【61†L51-L56】. El paciente entrena la atención auditiva a diferencias pequeñas, paso necesario antes de entender palabras completas.  
- **Módulo 3:** *Objetivo:* **asociar sonidos con significado**. Identificar palabras familiares (frecuentes, visuales) refuerza la correspondencia sonido–lenguaje. Este paso promueve el desarrollo del vocabulario oral y la comunicación funcional【61†L51-L56】【42†L157-L165】. Se persigue que el paciente entienda e integre palabras aisladas en situaciones reales, lo cual es esencial para conversaciones simples.

En conjunto, estos módulos permiten al usuario “reaprender a escuchar” de forma estructurada, tal como recomiendan los especialistas: primero detección de sonido, luego discriminación y finalmente comprensión de palabras【57†L125-L132】【61†L51-L56】. Estudios y guías señalan que el entrenamiento auditivo (aural rehabilitation) **mejora la comprensión del habla** tras el implante【48†L52-L61】【47†L1394-L1401】. Por ello, la selección de sonidos ambientales y vocabulario cotidiano busca maximizar la motivación y eficacia de la terapia【61†L51-L56】【48†L52-L61】.

## Esquema de archivos de estímulos y Base de Datos

Cada estímulo (audio e imagen) se almacenará con nombres claros. Por ejemplo:
- **Audios:** `m1_deteccion_timbre.mp3`, `m2_pa_ba_01.wav`, `m3_palabra_casa.mp3`, etc.  
- **Imágenes:** `img_casa.png`, `img_perro.jpg`, `img_silla.png` (correspondientes a palabras).  

Los archivos seguirán convenciones coherentes (módulo, tipo de ejercicio, índice). A continuación se propone un esquema de base de datos simple (puede ser SQLite o JSON):

| Campo         | Ejemplo          | Descripción                                               |
|:--------------|:-----------------|:----------------------------------------------------------|
| `id`          | 101              | Identificador único del estímulo                           |
| `texto`       | `"Casa"`         | Palabra o etiqueta asociada al audio (solo Mód.3)         |
| `audio_path`  | `"/audios/101.wav"` | Ruta al archivo de audio                                   |
| `image_path`  | `"/imagenes/101.png"` | Ruta a la imagen asociada (si aplica)                     |
| `pitch_tag`   | `"media"`        | Etiqueta de tono (ej. *grave*, *media*, *aguda*) (opcional)|
| `intensity`   | `"-6 dB"`        | Intensidad de reproducción (nivel relativo o etiqueta)    |
| `phoneme_tags`| `"p, b"`         | Fonemas claves presentes (e.g. /pa/, /ba/) (opcional)     |
| `freq_band`   | `"3 kHz alta"`   | Banda de frecuencia dominante del sonido (opcional)       |

Este esquema permite listar fácilmente los estímulos por módulo. Los campos `pitch_tag`, `intensity` o `phoneme_tags` son metadata opcional para facilitar filtros o variaciones en la app. 

## Notas de Implementación

- **Grabación de audio:** Usar un entorno silencioso con un micrófono de buena calidad. Frecuencia de muestreo ≥44.1 kHz y profundidad ≥16 bits para garantizar claridad. Normalizar niveles para que todos los audios tengan volumen similar.  
- **Formatos:** Archivos WAV o MP3 sin alta compresión (evitar artefactos). Las imágenes en formato PNG/JPEG.  
- **Plataforma:** El diseño específico de UI (colores, tipografía) no se ha especificado; se puede adaptar a Android/iOS según disponibilidad.  
- **Almacenamiento:** En un proyecto de semestre se puede usar almacenamiento local en la app (SQLite, archivos JSON) o recursos internos de la aplicación. Para mayor escalabilidad se puede considerar Firebase o backend, pero esto es **no especificado** por requisitos.  
- **Reproducción:** Incluir controles para repetir y reproducir en cámara lenta es muy útil para esta etapa. Permitir ajustar volumen general (y SNR en futuras versiones) puede ser implementado con sliders.  
- **Calidad:** Dado que es etapa inicial post-implante, es preferible enfocarse en sonidos limpios sin ruido excesivo. Conforme se avance, se puede introducir ruido de fondo como barrera de progreso (modificar reglas de progresión mencionadas).  

En resumen, este diseño modular y escalable servirá como base para una aplicación de rehabilitación auditiva centrada en el usuario con implante coclear, siguiendo prácticas clínicas recomendadas【57†L125-L132】【61†L51-L56】.

