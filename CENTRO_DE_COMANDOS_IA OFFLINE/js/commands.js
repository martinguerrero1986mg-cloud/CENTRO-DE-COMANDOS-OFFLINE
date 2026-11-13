(()=>{'use strict';
    const CATEGORY_RULES={
      'Escritura y comunicación':'Trabajá únicamente con el contenido y el objetivo proporcionados. Conservá los datos importantes, evitá inventar información y adaptá la redacción al público indicado.',
      'Análisis y decisiones':'Analizá la información con criterios explícitos. Separá hechos, inferencias y supuestos; señalá datos faltantes y terminá con una conclusión práctica.',
      'Estrategia y negocio':'Construí la recomendación desde el objetivo, los recursos, las restricciones y el público. No inventes cifras de mercado y marcá qué requiere validación externa.',
      'Marketing y contenido':'Creá contenido específico para el canal y la audiencia indicados. Evitá prometer resultados garantizados y priorizá claridad, utilidad, retención y coherencia de marca.',
      'Aprendizaje y educación':'Enseñá con progresión clara, lenguaje acorde al nivel y ejemplos verificables. Comprobá comprensión sin infantilizar al usuario.',
      'Investigación y verificación':'Diferenciá evidencia, interpretación e información no comprobada. No fabriques fuentes, citas, fechas ni resultados; declarás cualquier limitación de acceso.',
      'Creatividad e innovación':'Generá variedad real sin perder el objetivo ni las restricciones. Explicá brevemente por qué cada alternativa puede funcionar.',
      'Desarrollo y tecnología':'Preservá el comportamiento solicitado y no supongas que el código fue ejecutado. Señalá riesgos, proponé pruebas y distinguí diagnóstico de implementación.',
      'Datos y formatos':'Respetá exactamente el formato solicitado, los nombres de campos y los tipos de datos. No agregues texto fuera de la estructura cuando se pida una salida estricta.',
      'Productividad y planificación':'Convertí el objetivo en acciones concretas, ordenadas y realistas. Incluí prioridades, dependencias, responsables o criterios de finalización cuando corresponda.',
      'Seguridad y control de calidad':'Buscá fallas de forma sistemática y basá cada hallazgo en evidencia observable. Priorizá por impacto y no declares seguridad total sin pruebas suficientes.',
      'Audiovisual, video y producción':'Trabajá como especialista audiovisual del rol activado. No generes piezas al activar el modo; prepará criterio profesional para dirigir, revisar, planificar o corregir tareas audiovisuales posteriores.',
      'Imagen, diseño visual y branding':'Trabajá con criterio visual profesional, consistencia de marca, composición, color, tipografía y control de calidad. No inventes assets ni piezas finales durante la activación.',
      'Audio, música y voz':'Trabajá sobre sonido, música, voz, ritmo y mezcla sólo cuando el usuario entregue una tarea posterior compatible. No infieras estilo, duración ni destino si no fueron definidos.',
      'Producto y experiencia de usuario':'Trabajá sobre problemas reales, flujos, fricción, validación y experiencia. No conviertas la activación en una propuesta de producto.',
      'Datos, IA y automatización':'Trabajá sobre flujos de datos, agentes, RAG, guardrails, evaluación y automatización con límites explícitos. No ejecutes ni simules procesos inexistentes.',
      'Legal, compliance y gobernanza':'Trabajá con prevención de riesgos, trazabilidad, privacidad y cumplimiento. No reemplaces asesoramiento profesional ni inventes normativa.'
    };
    const KEYWORD_COMMANDS={
      informe:['report','executive-summary'],auditar:['critic','final-audit','codereview'],auditoria:['critic','final-audit','codereview'],
      error:['critic','debug','rootcause'],errores:['critic','debug','rootcause'],revisar:['critic','consistency','codereview'],
      comparar:['compare','matrix'],decidir:['decision','proscons'],fuentes:['sources','citations'],verificar:['factcheck','verify'],
      carrusel:['carousel','hook','caption'],instagram:['instagram','caption','hashtags'],reel:['reels','hook','caption'],tiktok:['reels','hook','caption'],
      imagen:['art-direction','composition-control','color-system'],video:['video-director','video-editing','video-qc'],audiovisual:['video-director','video-postproduction','sound-design'],
      pelicula:['video-director','visual-storytelling','continuity-video'],comercial:['commercial-video-direction','creative-testing','video-qc'],documental:['documentary-video-direction','research','visual-storytelling'],
      explicar:['teacher','simplify','examples'],aprender:['learn','feynman'],entender:['teacher','simplify','examples'],matematica:['teacher','examples','feynman'],matemática:['teacher','examples','feynman'],resumir:['summarize','tldr'],reescribir:['rewrite','human','polish']
    };
    const builtIns=[];
    function add(category,rows){rows.forEach(row=>builtIns.push({id:'cmd_'+row[0],alias:row[0],title:row[1],category,description:row[2],task:row[3],tags:row[4]||[],need:row[5]||'',custom:false}))}

    add('Escritura y comunicación',[
      ['human','Redacción natural','Hace que el texto suene humano, fluido y auténtico.','Reescribí el material con ritmo natural, variedad sintáctica y vocabulario cotidiano, eliminando frases robóticas sin alterar su sentido.',['redacción','natural']],
      ['expert','Nivel especialista','Responde con profundidad profesional en una disciplina definida.','Asumí el rol de especialista en el área indicada, precisá el alcance de tu experiencia y entregá una respuesta técnicamente rigurosa pero comprensible.',['profesional','especialista']],
      ['brief','Respuesta mínima','Entrega sólo lo indispensable.','Respondé con la menor extensión posible sin omitir la conclusión ni la acción principal.',['breve','directo']],
      ['detailed','Explicación completa','Desarrolla el tema en profundidad organizada.','Entregá una explicación integral con contexto, componentes, relaciones, ejemplos y conclusión, evitando repeticiones.',['detalle','profundidad']],
      ['simplify','Simplificación','Reduce complejidad sin perder precisión.','Simplificá el contenido, reemplazá jerga innecesaria y conservá todos los matices que cambien el significado.',['simple','claridad']],
      ['summarize','Resumen estructurado','Condensa los puntos esenciales.','Resumí el material separando idea central, hallazgos, decisiones, riesgos y próximos pasos.',['resumen','síntesis']],
      ['rewrite','Reescritura','Mejora la redacción conservando el significado.','Reescribí el texto completo con mayor claridad, cohesión y precisión sin agregar hechos nuevos.',['editar','redacción']],
      ['editor','Edición profesional','Mejora estructura, claridad y consistencia.','Editá el contenido como un editor profesional: corregí orden, redundancias, transiciones y ambigüedades, y devolvé la versión final.',['edición','calidad']],
      ['proofread','Corrección ortográfica','Detecta errores de ortografía y gramática.','Corregí ortografía, gramática, puntuación y concordancia. Conservá el estilo y listá sólo los cambios que alteren el sentido.',['ortografía','gramática']],
      ['professional','Tono profesional','Formaliza un texto sin volverlo rígido.','Convertí el material en una comunicación profesional, clara y respetuosa, adecuada para el destinatario indicado.',['formal','trabajo']],
      ['casual','Tono conversacional','Vuelve el texto cercano e informal.','Reescribí en un tono conversacional y espontáneo, manteniendo respeto, precisión y naturalidad.',['informal','conversacional']],
      ['friendly','Tono cálido','Hace el mensaje amable y cercano.','Ajustá el texto para que resulte cálido, empático y fácil de recibir sin exageraciones ni familiaridad forzada.',['amable','empatía']],
      ['persuasive','Persuasión ética','Fortalece argumentos sin manipulación.','Reorganizá el mensaje para aumentar su poder persuasivo mediante beneficios, evidencia y llamado a la acción, sin presión engañosa.',['persuasión','argumento']],
      ['concise','Concisión','Elimina palabras y repeticiones innecesarias.','Reducí el texto al máximo compatible con la comprensión, quitando redundancias, rodeos y frases vacías.',['breve','limpieza']],
      ['polish','Pulido final','Perfecciona una versión antes de publicarla.','Realizá una revisión final de claridad, tono, consistencia, ortografía y presentación; devolvé únicamente la versión lista para usar.',['final','calidad']],
      ['tone','Ajuste de tono','Adapta el registro a una intención concreta.','Identificá el tono actual y reescribí según el tono solicitado, conservando datos, intención y voz de marca.',['tono','adaptación']],
      ['email','Correo eficaz','Redacta correos claros y accionables.','Redactá un correo con asunto, saludo, propósito temprano, información ordenada, acción esperada y cierre adecuado.',['correo','comunicación']],
      ['report','Informe profesional','Organiza información como informe formal.','Convertí el material en un informe con objetivo, alcance, metodología, hallazgos, conclusiones y recomendaciones.',['informe','documento']],
      ['executive-summary','Resumen ejecutivo','Sintetiza para una decisión rápida.','Prepará un resumen ejecutivo que presente situación, impacto, hallazgos decisivos, recomendación y próximos pasos en una lectura breve.',['dirección','síntesis']],
      ['tldr','Resumen en una oración','Condensa la idea central al mínimo.','Expresá en una sola oración la conclusión o idea más importante, sin introducción ni información secundaria.',['resumen','mínimo']]
    ]);

    add('Análisis y decisiones',[
      ['analyst','Análisis estructurado','Examina información con criterios definidos.','Analizá el material por componentes, relaciones, patrones, inconsistencias e implicancias; cerrá con conclusiones sustentadas.',['análisis','patrones']],
      ['compare','Comparación objetiva','Compara alternativas con los mismos criterios.','Compará las opciones bajo criterios comunes, indicá diferencias relevantes y explicá en qué situación conviene cada una.',['comparar','opciones']],
      ['proscons','Ventajas y desventajas','Expone beneficios, costos y compensaciones.','Listá ventajas, desventajas, riesgos y compensaciones de cada opción sin presentar una preferencia prematura.',['decisión','balance']],
      ['decision','Recomendación de decisión','Ayuda a elegir justificadamente.','Definí criterios, ponderalos si hay datos suficientes, compará alternativas y recomendá una opción explicando condiciones y riesgos.',['elegir','criterios']],
      ['prioritize','Priorización','Ordena por impacto, urgencia y esfuerzo.','Priorizá los elementos mediante impacto, urgencia, esfuerzo y dependencias; justificá el orden y marcá qué puede esperar.',['prioridad','impacto']],
      ['assumptions','Supuestos ocultos','Identifica premisas no comprobadas.','Detectá supuestos explícitos e implícitos, indicá cuáles son críticos y proponé cómo verificarlos.',['supuestos','validación']],
      ['risks','Mapa de riesgos','Identifica amenazas y mitigaciones.','Construí un registro de riesgos con probabilidad, impacto, señales tempranas, prevención y respuesta.',['riesgo','mitigación']],
      ['rootcause','Causa raíz','Distingue síntomas de causas.','Separá síntomas, causas contribuyentes y causa raíz usando evidencia disponible; proponé validaciones antes de concluir.',['problema','causa']],
      ['five-whys','Cinco porqués','Profundiza una cadena causal.','Aplicá hasta cinco preguntas causales, deteniéndote cuando falte evidencia; diferenciá cada hipótesis de un hecho confirmado.',['5 porqués','causa']],
      ['logic','Control lógico','Revisa coherencia y validez de argumentos.','Evaluá premisas, inferencias, contradicciones, falacias y saltos lógicos; explicá cómo corregir cada falla.',['lógica','argumentos']],
      ['critic','Crítica rigurosa','Audita debilidades sin modificar el original.','Realizá una crítica constructiva: hallazgo, evidencia, impacto, gravedad y recomendación. No reescribas salvo que se solicite.',['auditoría','fallas','critique']],
      ['objective-dialogue','Objetividad crítica','Evita la aprobación automática y exige observaciones fundadas.','Evaluá cada planteo por su evidencia, coherencia y consecuencias. No asientas por cortesía ni contradigas por sistema: indicá con precisión qué es correcto, qué es débil, qué no está demostrado y por qué. Mantené un diálogo directo, respetuoso y orientado a mejorar la decisión.',['objetividad','desacuerdo','diálogo']],
      ['counterargument','Contraargumentos sólidos','Construye la mejor objeción posible.','Presentá los contraargumentos más fuertes, la evidencia que necesitarían y cómo responderlos honestamente.',['debate','objeciones']],
      ['devils-advocate','Abogado del diablo','Desafía una propuesta desde la oposición.','Adoptá temporalmente la posición contraria para exponer vulnerabilidades, escenarios adversos y preguntas no resueltas.',['crítica','oposición']],
      ['alternative','Alternativas','Propone caminos diferentes.','Generá alternativas realmente distintas, con requisitos, beneficios, limitaciones y criterio para elegir.',['opciones','soluciones']],
      ['first-principles','Primeros principios','Descompone hasta fundamentos comprobables.','Desarmá el problema en hechos fundamentales, descartá convenciones no necesarias y reconstruí soluciones desde esas bases.',['fundamentos','razonamiento']],
      ['pareto','Análisis 80/20','Encuentra las acciones de mayor impacto.','Identificá el pequeño conjunto de causas o acciones que probablemente concentra el mayor impacto y explicá cómo validarlo.',['80/20','impacto']],
      ['swot','Análisis FODA','Organiza factores internos y externos.','Prepará un FODA específico, no genérico, y derivá estrategias que conecten fortalezas, oportunidades, debilidades y amenazas.',['foda','estrategia']],
      ['matrix','Matriz de decisión','Ordena opciones por criterios ponderados.','Construí una matriz con criterios, pesos justificados, puntuaciones transparentes y análisis de sensibilidad.',['tabla','decisión']],
      ['scenario','Escenarios','Evalúa futuros posibles.','Desarrollá escenarios favorable, probable y adverso con supuestos, señales, impactos y respuesta recomendada.',['futuro','riesgo']],
      ['options','Rutas alternativas','Expone opciones sin revelar razonamiento interno.','Presentá de tres a cinco rutas posibles, comparalas de forma visible y recomendá una con justificación breve y verificable.',['alternativas','recomendación']]
    ]);

    add('Estrategia y negocio',[
      ['ceo','Perspectiva ejecutiva','Evalúa impacto, recursos y dirección.','Analizá como responsable ejecutivo: objetivo, valor, costos, riesgos, capacidad operativa, decisión y métrica de éxito.',['dirección','negocio']],
      ['strategy','Estrategia','Conecta objetivo con decisiones coherentes.','Definí diagnóstico, objetivo, ventaja, prioridades, renuncias, iniciativas y métricas en una estrategia consistente.',['plan','dirección']],
      ['planner','Plan accionable','Convierte una meta en ejecución.','Creá un plan por fases con tareas, dependencias, responsables sugeridos, recursos y criterios de finalización.',['planificación','acción']],
      ['roadmap','Hoja de ruta','Organiza evolución por etapas.','Construí una hoja de ruta con hitos, entregables, dependencias, riesgos y condiciones para avanzar de fase.',['hitos','fases']],
      ['business','Idea de negocio','Evalúa una oportunidad comercial.','Desarrollá problema, cliente, propuesta de valor, canal, operación, ingresos, costos, riesgos y experimento inicial.',['empresa','oportunidad']],
      ['startup','Estrategia de startup','Diseña validación rápida y aprendizaje.','Convertí la idea en hipótesis comprobables, MVP, experimento, métricas de aprendizaje y decisión de continuar o ajustar.',['mvp','validación']],
      ['market','Análisis de mercado','Estudia demanda y contexto competitivo.','Analizá mercado, segmentos, necesidades, alternativas, barreras y tendencias; marcá toda cifra que requiera investigación actual.',['mercado','demanda'],'Búsqueda o fuentes'],
      ['competitor','Competencia','Compara competidores y sustitutos.','Definí criterios, compará competidores y sustitutos, detectá espacios de diferenciación y citá fuentes cuando haya navegación.',['competencia','benchmark'],'Búsqueda o fuentes'],
      ['customer','Perspectiva del cliente','Evalúa la experiencia desde el usuario.','Describí objetivos, frustraciones, contexto, objeciones, recorrido y resultado deseado del cliente sin inventar investigación.',['cliente','experiencia']],
      ['audience','Público objetivo','Define segmentos útiles y verificables.','Caracterizá audiencia por necesidad, contexto, comportamiento y barreras; separá datos conocidos de hipótesis.',['audiencia','segmentación']],
      ['pricing','Estrategia de precios','Diseña precio, estructura y prueba.','Proponé modelos de precio basados en valor, costos, alternativas y disposición a pagar; indicá qué datos faltan y cómo probarlos.',['precios','valor']],
      ['offer','Construcción de oferta','Convierte un producto en una propuesta clara.','Diseñá una oferta con problema, resultado, entregables, diferenciadores, prueba, condiciones y llamado a la acción ético.',['oferta','ventas']],
      ['sales','Mensaje de ventas','Prepara una conversación comercial útil.','Redactá un mensaje centrado en necesidad, evidencia, beneficio y siguiente paso, evitando urgencia falsa o promesas garantizadas.',['ventas','conversión']],
      ['funnel','Embudo','Organiza etapas de captación y conversión.','Diseñá etapas, intención del usuario, contenido, acción, métrica y fuga probable desde descubrimiento hasta continuidad.',['marketing','conversión']],
      ['growth','Crecimiento','Encuentra palancas sostenibles.','Identificá palancas de adquisición, activación, retención, recomendación e ingresos; priorizá experimentos medibles.',['crecimiento','experimentos']],
      ['brand','Estrategia de marca','Define identidad y coherencia.','Establecé propósito, público, posicionamiento, personalidad, voz, mensajes centrales, pruebas y reglas de consistencia.',['marca','identidad']],
      ['product','Estrategia de producto','Relaciona problema, solución y uso real.','Definí usuario, problema, trabajo a resolver, propuesta, alcance, experiencia, riesgos y métricas de producto.',['producto','usuario']],
      ['positioning','Posicionamiento','Aclara por qué elegir una propuesta.','Redactá un posicionamiento específico: para quién, qué problema, categoría, beneficio principal, alternativa y prueba diferencial.',['diferenciación','marca']],
      ['business-model','Modelo de negocio','Explica cómo se crea y captura valor.','Mapeá segmentos, propuesta, canales, relaciones, actividades, recursos, socios, ingresos, costos y supuestos críticos.',['canvas','modelo']],
      ['kpi','Indicadores clave','Define métricas ligadas a decisiones.','Proponé pocos KPI con definición, fórmula, fuente, frecuencia, responsable, umbral y decisión asociada.',['métricas','control']],
      ['consultant','Consultoría profesional','Diagnostica y recomienda con alcance claro.','Actuá como consultor del área indicada: aclaración del problema, diagnóstico, opciones, recomendación, plan, riesgos y preguntas pendientes.',['consultoría','recomendación']]
    ]);

    add('Marketing y contenido',[
      ['viral','Potencial de interacción','Optimiza retención sin prometer viralidad.','Mejorá el contenido para captar atención, sostener interés y fomentar guardados, comentarios y compartidos sin garantizar resultados.',['engagement','retención']],
      ['seo','Optimización para búsqueda','Organiza contenido según intención de búsqueda.','Definí intención, tema central, estructura, términos relacionados, título, descripción y preguntas útiles; verificá tendencias si hay búsqueda.',['seo','buscadores'],'Búsqueda o fuentes'],
      ['copywriter','Copy persuasivo','Redacta mensajes orientados a una acción.','Creá copy con gancho, problema, valor, prueba, manejo de objeción y CTA, adaptado al canal y sin afirmaciones engañosas.',['copy','ventas']],
      ['hook','Gancho','Genera aperturas que detienen la atención.','Creá diez ganchos breves y variados basados en curiosidad, problema, contraste o beneficio; evitá clickbait falso.',['inicio','atención']],
      ['headline','Titulares','Produce títulos claros y atractivos.','Generá titulares que comuniquen tema y beneficio con precisión; ofrecé variantes directas, emocionales y educativas.',['título','copy']],
      ['caption','Modo texto de publicación','Activa criterio para textos breves de publicación.','Cuando el usuario entregue una tarea posterior de publicación, controlá apertura, claridad, valor concreto, CTA natural, límites y etiquetas sólo si fueron solicitadas.',['redes','publicación']],
      ['instagram','Contenido para Instagram','Adapta una pieza a Instagram.','Prepará título, texto, CTA y estructura visual pensados para el formato indicado y para lectura móvil.',['instagram','social']],
      ['linkedin','Contenido para LinkedIn','Adapta una idea a una publicación profesional.','Creá una publicación con apertura fuerte, experiencia o argumento, aprendizaje útil, cierre conversacional y formato escaneable.',['linkedin','profesional']],
      ['youtube','Modo YouTube','Activa criterio para piezas y canales de YouTube.','Cuando el usuario trabaje sobre YouTube, analizá promesa, título, miniatura, apertura, segmentos, retención y CTA sin inventar duración ni formato no indicados.',['youtube','video']],
      ['reels','Modo video corto social','Activa criterio para reels, shorts o piezas breves.','Cuando el usuario pida trabajar una pieza corta, evaluá gancho, secuencia visual, voz, texto en pantalla, cambio de ritmo y CTA dentro de los datos que aporte.',['reels','video']],
      ['script','Modo guion','Activa criterio de guion cuando el usuario lo solicite.','Si una tarea posterior requiere guion, trabajá por escenas con objetivo, narración o diálogo, acción visual, duración sólo si fue indicada y transición.',['guion','narrativa']],
      ['content','Estrategia de contenidos','Organiza temas para un objetivo de negocio.','Definí pilares, formatos, audiencia, frecuencia, distribución, reutilización y métricas de contenido.',['estrategia','contenido']],
      ['calendar','Calendario editorial','Programa contenido con propósito.','Creá un calendario por fecha con tema, formato, objetivo, gancho, CTA, responsable y estado.',['calendario','publicación']],
      ['cta','Llamados a la acción','Genera CTA claros y naturales.','Proponé llamados a la acción específicos para distintas etapas, evitando presión artificial y alineando acción con beneficio.',['acción','conversión']],
      ['hashtags','Etiquetas de publicación','Propone hashtags relevantes y no repetitivos.','Organizá hashtags por marca, tema, ubicación e intención; evitá relleno y marcá si requieren comprobación de actualidad.',['hashtags','redes'],'Búsqueda o fuentes'],
      ['carousel','Carrusel','Estructura una secuencia deslizable.','Diseñá portada, progresión de diapositivas, texto breve por slide, sugerencia visual y cierre con CTA, sin repetir información.',['carrusel','slides']],
      ['story','Historia vertical','Crea una pieza 9:16 de consumo rápido.','Diseñá una historia con jerarquía visual, texto mínimo, elemento de interacción y CTA legible en móvil.',['stories','vertical']],
      ['imageprompt','Control de imagen generativa','Activa precisión para instrucciones visuales.','Cuando el usuario pida formular o revisar una instrucción visual, controlá sujeto, entorno, composición, iluminación, cámara, estilo, paleta, formato y exclusiones.',['imagen','prompt'],'Generación de imágenes'],
      ['videoprompt','Control de video generativo','Activa precisión para instrucciones audiovisuales.','Cuando el usuario pida formular o revisar una instrucción audiovisual, controlá escena inicial, sujeto, acción, cámara, movimiento, luz, continuidad, sonido y restricciones.',['video','prompt'],'Generación de imágenes'],
      ['campaign','Campaña integrada','Conecta mensajes y canales en una campaña.','Diseñá objetivo, audiencia, concepto central, piezas, canales, secuencia, calendario, presupuesto orientativo y métricas.',['campaña','marketing']],
      ['performance-creative','Publicidad performance','Activa criterio de anuncios medibles y orientados a aprendizaje.','Cuando el usuario entregue una tarea publicitaria posterior, evaluá hipótesis, mensaje, oferta, creatividad, canal, métrica y criterio de aprendizaje sin prometer resultados.',['performance','publicidad']],
      ['creative-testing','Creative testing','Ordena variantes creativas para aprender qué funciona.','Diseñá o auditá pruebas creativas con hipótesis, variables aisladas, audiencia, indicador principal, lectura de resultados y decisión posterior.',['testing','creatividad']],
      ['ad-brief','Brief publicitario','Estructura criterios antes de crear o evaluar anuncios.','Separá objetivo, público, insight, oferta, promesa, prueba, restricciones, canal, assets disponibles y criterios de aprobación.',['brief','anuncios']],
      ['offer-angle','Ángulos de oferta','Explora enfoques comerciales sin inventar beneficios.','Identificá ángulos posibles desde problema, deseo, objeción, prueba, urgencia legítima y diferenciación real.',['oferta','ángulo']],
      ['landing-message','Mensaje de landing','Activa criterio de claridad para páginas de conversión.','Evaluá promesa, jerarquía, objeciones, prueba, CTA, fricción, coherencia visual y continuidad con la fuente de tráfico.',['landing','conversión']],
      ['funnel-diagnostic','Diagnóstico de funnel','Detecta pérdidas entre etapas comerciales.','Analizá etapas, intención, fuga, mensaje, fricción, métrica, hipótesis y acción de mejora priorizada.',['funnel','diagnóstico']],
      ['content-atomization','Atomización de contenido','Reutiliza una idea sin duplicarla mecánicamente.','Transformá una pieza o idea posterior en usos derivados por canal, intención y profundidad, conservando coherencia y evitando repetición vacía.',['reutilización','contenido']],
      ['ad-compliance','Control publicitario','Revisa promesas, restricciones y riesgos de anuncios.','Auditá afirmaciones, pruebas, lenguaje, imágenes, disclaimers, sector regulado y riesgos de interpretación antes de publicar.',['compliance','anuncios']]
    ]);

    add('Aprendizaje y educación',[
      ['teacher','Explicación docente','Explica con claridad, estructura y comprobación.','Explicá el tema desde sus fundamentos, avanzá de lo simple a lo complejo e incluí una comprobación breve de comprensión.',['enseñanza','claridad']],
      ['learn','Plan de aprendizaje','Diseña una ruta para dominar una habilidad.','Creá un plan por niveles con objetivos, recursos, práctica, revisión, evaluación y criterio de dominio.',['aprender','plan']],
      ['study','Estrategia de estudio','Organiza comprensión y memoria.','Diseñá sesiones con recuperación activa, práctica espaciada, ejercicios y autoevaluación para el tiempo disponible.',['estudio','memoria']],
      ['quiz','Cuestionario','Evalúa conocimientos de manera objetiva.','Creá preguntas de dificultad progresiva con opciones plausibles, respuesta correcta y explicación separada.',['preguntas','evaluación']],
      ['flashcards','Tarjetas de estudio','Genera pares pregunta-respuesta.','Convertí el contenido en tarjetas atómicas, sin pistas involuntarias, con pregunta clara y respuesta breve.',['tarjetas','repaso']],
      ['interview','Preparación de entrevista','Simula preguntas y mejora respuestas.','Prepará preguntas probables, criterios de una buena respuesta, práctica y retroalimentación concreta para el rol indicado.',['entrevista','trabajo']],
      ['resume','Currículum','Mejora un CV sin inventar experiencia.','Reorganizá el currículum por relevancia, logros comprobables y palabras del puesto; no agregues habilidades o resultados no dados.',['cv','empleo']],
      ['career','Orientación profesional','Evalúa caminos laborales posibles.','Relacioná intereses, habilidades, restricciones y mercado; proponé opciones y experimentos pequeños antes de decisiones costosas.',['carrera','decisión']],
      ['mentor','Mentoría','Orienta mediante experiencia y preguntas.','Respondé como mentor: aclaración del objetivo, diagnóstico, opciones, recomendación, desafío práctico y pregunta de seguimiento.',['guía','crecimiento']],
      ['coach','Coaching práctico','Convierte intención en compromiso personal.','Formulá preguntas que ayuden a definir meta, obstáculos, recursos, decisión y próximo paso elegido por la persona.',['acción','acompañamiento']],
      ['socratic','Método socrático','Guía comprensión mediante preguntas.','No des la solución de inmediato: hacé una pregunta por vez para examinar definiciones, evidencia, supuestos y consecuencias.',['preguntas','reflexión']],
      ['feynman','Explicación Feynman','Explica sin jerga y detecta vacíos.','Explicá con palabras simples, ejemplo cotidiano, punto difícil y breve comprobación de qué parte aún requiere aclaración.',['simple','comprensión']],
      ['analogy','Analogías','Relaciona un concepto con algo conocido.','Creá una analogía útil, explicá correspondencias y señalá claramente dónde deja de funcionar.',['comparación','explicación']],
      ['examples','Ejemplos prácticos','Ilustra una regla en diferentes casos.','Proporcioná ejemplos correctos, límite e incorrectos, explicando qué cambia entre ellos.',['casos','práctica']],
      ['few-shot','Ejemplos de entrada y salida','Define un patrón mediante demostraciones.','Generá ejemplos consistentes de entrada y salida que enseñen exactamente el formato y el comportamiento esperado.',['ejemplos','patrón']],
      ['lesson-plan','Plan de clase','Organiza una experiencia educativa.','Diseñá objetivos observables, apertura, explicación, actividad, evaluación, adaptación y cierre para el tiempo indicado.',['clase','docencia']],
      ['roleplay','Simulación de escenario','Practica una interacción con reglas definidas.','Simulá el rol y la situación indicados, mantené coherencia de personaje, respondé por turnos y ofrecé retroalimentación sólo al finalizar.',['simulación','práctica']]
    ]);

    add('Investigación y verificación',[
      ['research','Investigación','Estructura una búsqueda profunda y verificable.','Definí pregunta, alcance, criterios de fuentes, estrategia de búsqueda, síntesis, contradicciones y limitaciones.',['investigar','fuentes'],'Búsqueda o fuentes'],
      ['factcheck','Verificación de afirmaciones','Comprueba datos con evidencia identificable.','Extraé cada afirmación verificable, buscá fuentes confiables si tenés acceso y clasificá: confirmada, falsa, engañosa o no verificable.',['hechos','fuentes'],'Búsqueda o fuentes'],
      ['verify','Qué requiere verificación','Separa datos seguros de puntos pendientes.','Marcá hechos sustentados, inferencias, contradicciones y afirmaciones que necesitan una fuente o prueba adicional.',['validar','evidencia']],
      ['sources','Fuentes confiables','Busca respaldo primario y pertinente.','Priorizá documentos oficiales, investigaciones originales y fuentes primarias; explicá por qué respalda cada afirmación.',['fuentes','primarias'],'Búsqueda o fuentes'],
      ['citations','Citas comprobables','Vincula afirmaciones con sus fuentes.','Incluí una referencia directa junto a cada afirmación importante y no cites una fuente que no hayas consultado.',['citas','referencias'],'Búsqueda o fuentes'],
      ['evidence','Matriz de evidencia','Relaciona afirmación, prueba y calidad.','Construí una matriz con afirmación, evidencia, fuente, calidad, limitaciones y conclusión permitida.',['prueba','matriz']],
      ['uncertainty','Incertidumbre','Expresa límites sin falsa precisión.','Indicá nivel de confianza, causas de incertidumbre, datos faltantes y qué información podría cambiar la conclusión.',['confianza','límites']],
      ['freshness','Actualidad','Controla si la información puede haber cambiado.','Identificá datos sensibles al tiempo, comprobá fecha y vigencia cuando haya acceso, y advertí claramente lo no actualizado.',['fecha','vigencia'],'Búsqueda o fuentes'],
      ['extract','Extracción de datos','Extrae únicamente campos definidos.','Extraé sólo los campos solicitados, conservá el texto exacto cuando corresponda y usá null para datos ausentes.',['datos','entidades']],
      ['timeline','Línea de tiempo','Ordena eventos cronológicamente.','Construí una cronología con fecha, evento, actores, evidencia y relación causal sólo cuando esté sustentada.',['fechas','historia']],
      ['literature-review','Revisión bibliográfica','Sintetiza el estado de conocimiento.','Definí criterios, agrupá estudios por tema, compará métodos y resultados, detectá consenso, contradicciones y vacíos.',['bibliografía','estudios'],'Búsqueda o fuentes'],
      ['source-matrix','Matriz de fuentes','Compara cobertura y confiabilidad.','Organizá cada fuente por autor, fecha, tipo, afirmaciones, metodología, fortalezas, limitaciones y utilidad.',['fuentes','comparar'],'Búsqueda o fuentes'],
      ['gap-analysis','Análisis de brechas','Detecta diferencia entre estado actual y deseado.','Definí situación actual, objetivo, brechas de conocimiento o capacidad, causa, impacto y acción para cerrarlas.',['brechas','mejora']],
      ['claims','Inventario de afirmaciones','Separa opiniones de hechos comprobables.','Listá afirmaciones fácticas, valorativas, predictivas y causales; indicá qué evidencia necesitaría cada una.',['afirmaciones','evidencia']],
      ['methodology','Metodología','Diseña un procedimiento reproducible.','Describí pregunta, muestra o fuentes, procedimiento, criterios, controles, análisis, limitaciones y forma de reproducir el trabajo.',['método','proceso']]
    ]);

    add('Creatividad e innovación',[
      ['brainstorm','Lluvia de ideas','Genera opciones variadas antes de evaluar.','Producí ideas diversas agrupadas por enfoque; posponé la evaluación y evitá variaciones superficiales de la misma idea.',['ideas','divergencia']],
      ['ideas','Ideas nuevas','Propone soluciones originales y aplicables.','Generá alternativas novedosas dentro de las restricciones y explicá valor, dificultad y primer experimento de cada una.',['innovación','opciones']],
      ['creative','Pensamiento creativo','Combina perspectivas poco obvias.','Explorá combinaciones, analogías y cambios de perspectiva que mantengan viabilidad y relación con el objetivo.',['creatividad','concepto']],
      ['unpopular','Perspectiva impopular','Cuestiona consensos sin buscar provocación vacía.','Presentá posiciones minoritarias plausibles, su evidencia necesaria, riesgos y condiciones bajo las que podrían ser válidas.',['perspectiva','debate']],
      ['contrarian','Enfoque contrario','Busca una estrategia opuesta razonable.','Invertí los supuestos principales y examiná si una estrategia contraria podría superar al enfoque habitual.',['alternativa','supuestos']],
      ['scamper','Técnica SCAMPER','Rediseña sistemáticamente una solución.','Aplicá Sustituir, Combinar, Adaptar, Modificar, Proponer otros usos, Eliminar y Reordenar; elegí luego las ideas viables.',['innovación','producto']],
      ['reverse','Ingeniería inversa del objetivo','Trabaja hacia atrás desde el resultado.','Definí el resultado observable y retrocedé por condiciones, hitos, decisiones y acciones hasta el presente.',['objetivo','plan']],
      ['mindmap','Mapa conceptual','Organiza conceptos y relaciones.','Construí un mapa jerárquico textual con tema central, ramas, subramas y vínculos cruzados relevantes.',['mapa','estructura']],
      ['storyteller','Narrativa','Convierte datos en una historia coherente.','Construí contexto, protagonista, tensión, transformación y cierre sin alterar los hechos suministrados.',['historia','narrativa']],
      ['concepts','Conceptos creativos','Desarrolla territorios de comunicación diferentes.','Proponé conceptos centrales distintivos con idea, promesa, tono, recurso visual y posibles aplicaciones.',['concepto','campaña']],
      ['naming','Nombres','Genera nombres con criterios de marca.','Creá nombres variados, explicá significado, pronunciación, asociaciones y riesgos; no afirmes disponibilidad legal sin verificar.',['nombre','marca']],
      ['variations','Variaciones','Produce versiones realmente distintas.','Generá variantes que cambien enfoque, tono, estructura o audiencia; evitá sólo sustituir sinónimos.',['versiones','alternativas']]
    ]);

    add('Desarrollo y tecnología',[
      ['debug','Diagnóstico de errores','Localiza causa antes de corregir.','Reproducí conceptualmente el problema, identificá evidencia, aislá la causa raíz y proponé una corrección mínima con prueba de regresión.',['código','error'],'Herramientas de código'],
      ['solution','Solución técnica','Diseña una respuesta implementable.','Proponé una solución completa con alcance, arquitectura, pasos, riesgos, pruebas y criterio de aceptación.',['solución','implementación']],
      ['optimize','Optimización','Mejora rendimiento o claridad sin romper comportamiento.','Medí o identificá el cuello de botella, proponé mejoras, explicá compensaciones y verificá que el comportamiento se conserve.',['rendimiento','mejora'],'Herramientas de código'],
      ['automate','Automatización','Detecta tareas automatizables.','Mapeá el proceso actual, elegí pasos repetitivos y diseñá automatización con entradas, validaciones, excepciones y control humano.',['automatizar','flujo']],
      ['refactor','Refactorización','Mejora estructura sin cambiar resultados.','Refactorizá preservando comportamiento público; reducí duplicación y complejidad, y acompañá con pruebas que demuestren equivalencia.',['código','limpieza'],'Herramientas de código'],
      ['codereview','Revisión de código','Audita calidad, errores y mantenibilidad.','Revisá por corrección, seguridad, claridad, rendimiento y pruebas; citá archivo o fragmento y priorizá hallazgos.',['código','auditoría'],'Archivos adjuntos'],
      ['unittest','Pruebas unitarias','Diseña pruebas aisladas y útiles.','Creá pruebas para casos normales, límites, errores e invariantes con nombres claros y resultados esperados.',['tests','unidad'],'Herramientas de código'],
      ['regression','Pruebas de regresión','Evita que reaparezca un defecto.','Convertí el fallo en una secuencia reproducible, estado inicial, acción, resultado esperado e invariantes que deben conservarse.',['tests','errores'],'Herramientas de código'],
      ['securityaudit','Auditoría de seguridad','Busca vulnerabilidades con evidencia.','Evaluá entradas, autenticación, permisos, datos, dependencias y superficies de ataque; clasificá severidad y mitigación sin garantizar seguridad absoluta.',['seguridad','riesgos'],'Archivos adjuntos'],
      ['accessibility','Accesibilidad','Revisa uso inclusivo y teclado.','Auditá semántica, etiquetas, teclado, foco, contraste, movimiento, mensajes y tecnologías asistivas; priorizá según impacto.',['a11y','interfaz'],'Archivos adjuntos'],
      ['offline','Arquitectura offline','Elimina dependencias de red.','Verificá que recursos, almacenamiento, inicio, respaldo y recuperación funcionen sin conexión ni servidor; detectá llamadas externas ocultas.',['offline','local'],'Archivos adjuntos'],
      ['migration','Migración de datos','Planifica cambios sin pérdida.','Definí origen, destino, transformación, validación, compatibilidad, respaldo, reversión y pruebas con datos reales anonimizados.',['datos','versión']],
      ['backup','Respaldo y restauración','Diseña copias verificables y recuperables.','Especificá alcance, versión, manifiesto, validación, copia preventiva, restauración transaccional y prueba periódica de recuperación.',['respaldo','datos']],
      ['release-notes','Notas de versión','Documenta cambios de una entrega.','Redactá versión, fecha, novedades, correcciones, compatibilidad, migración, limitaciones y verificaciones realizadas.',['versión','documentación']],
      ['architecture','Arquitectura de software','Define componentes y responsabilidades.','Diseñá componentes mínimos, límites, flujos de datos, almacenamiento, errores, seguridad, pruebas y decisiones con sus compensaciones.',['sistema','diseño']],
      ['api-design','Diseño de API','Crea un contrato consistente.','Definí recursos, operaciones, entradas, salidas, errores, autenticación, idempotencia, versionado y ejemplos.',['api','contrato']],
      ['database','Modelo de datos','Diseña entidades e integridad.','Definí entidades, claves, relaciones, restricciones, índices, migraciones y operaciones transaccionales según los casos de uso.',['base de datos','modelo']],
      ['performance','Rendimiento','Investiga y mejora tiempos o recursos.','Definí métrica, línea base, perfilado, cuello de botella, cambio propuesto y prueba comparativa antes y después.',['velocidad','medición'],'Herramientas de código']
    ]);

    add('Datos y formatos',[
      ['table','Tabla','Convierte información en comparación tabular.','Organizá la información en columnas consistentes, una fila por elemento y valores comparables; no mezcles conceptos en una celda.',['tabla','estructura']],
      ['json','JSON estricto','Entrega únicamente JSON válido.','Devolvé exclusivamente JSON válido, con comillas dobles, sin comentarios, sin bloque Markdown y usando null para datos desconocidos.',['json','datos']],
      ['jsonschema','JSON según esquema','Sigue una estructura y tipos definidos.','Generá únicamente JSON compatible con el esquema suministrado; respetá campos requeridos, tipos, enumeraciones y restricciones. Advertí si la plataforma no puede garantizar validación formal.',['json','schema']],
      ['csv','CSV','Entrega datos tabulares portables.','Devolvé CSV con encabezados, mismo número de columnas por fila, codificación UTF-8 y comillas cuando un valor contenga coma o salto.',['csv','tabla']],
      ['yaml','YAML','Estructura datos en YAML legible.','Devolvé únicamente YAML válido con indentación consistente, tipos claros y cadenas entre comillas cuando puedan interpretarse de forma ambigua.',['yaml','datos']],
      ['markdown','Markdown limpio','Formatea contenido para lectura estructurada.','Usá títulos jerárquicos, listas y tablas sólo cuando aporten claridad; evitá HTML y formato decorativo innecesario.',['markdown','formato']],
      ['outline','Esquema','Organiza una estructura antes de desarrollar.','Creá un esquema jerárquico con secciones, propósito de cada una, puntos clave y orden lógico.',['índice','estructura']],
      ['schema','Diseño de esquema','Define campos y reglas de una estructura.','Diseñá campos, tipos, obligatoriedad, valores permitidos, relaciones, ejemplos válidos y reglas de validación.',['modelo','campos']],
      ['classification','Clasificación','Asigna categorías según reglas explícitas.','Definí categorías mutuamente claras, criterio de decisión, manejo de ambigüedad y salida consistente para cada elemento.',['categorías','datos']],
      ['transform','Transformación','Convierte datos sin perder información.','Mapeá campo de origen a destino, transformaciones, valores faltantes, validaciones y excepciones; conservá trazabilidad.',['convertir','datos']]
    ]);

    add('Productividad y planificación',[
      ['action','Pasos concretos','Convierte una idea en acciones inmediatas.','Transformá el objetivo en pasos específicos y ordenados, empezando por la próxima acción realizable.',['acción','ejecución']],
      ['productivity','Sistema de productividad','Mejora flujo y uso del tiempo.','Analizá carga, prioridades, interrupciones y energía; proponé un sistema simple con revisión y límites.',['organización','tiempo']],
      ['focus','Foco principal','Identifica qué merece atención ahora.','Elegí la tarea de mayor impacto compatible con urgencia y dependencias; explicá qué postergar o eliminar.',['prioridad','concentración']],
      ['time','Gestión del tiempo','Distribuye tareas de forma realista.','Construí bloques de tiempo con estimación, margen, pausas, prioridades y plan ante interrupciones.',['agenda','plan']],
      ['checklist','Lista de verificación','Convierte requisitos en controles observables.','Creá una checklist ordenada, cada punto verificable y con criterio claro de aprobado o pendiente.',['control','lista']],
      ['template','Plantilla reutilizable','Diseña un formato para repetir una tarea.','Creá una plantilla con campos, instrucciones breves, ejemplos y secciones opcionales claramente identificadas.',['plantilla','reuso']],
      ['framework','Marco de trabajo','Organiza un problema con etapas repetibles.','Diseñá un marco simple con propósito, entradas, etapas, decisiones, salidas y condiciones de uso.',['método','estructura']],
      ['workflow','Flujo de trabajo','Define secuencia, estados y responsables.','Mapeá inicio, tareas, decisiones, estados, responsables, excepciones, salida y puntos de control.',['proceso','estados']],
      ['corrective-collaboration','Colaboración correctiva','Sostiene un intercambio fluido con observaciones y correcciones verificables.','Trabajá de forma iterativa con el usuario: comprendé, observá, señalá problemas reales, explicá la corrección propuesta y diferenciá diagnóstico de ejecución. Cuando una acción cambie archivos, datos o decisiones ya tomadas, esperá autorización; después verificá el resultado y retomá el intercambio desde el nuevo estado.',['colaboración','corrección','autorización']],
      ['estimate','Estimación','Calcula esfuerzo con incertidumbre visible.','Descomponé el trabajo, estimá por rango, explicá supuestos, dependencias, margen y factores que pueden cambiar el cálculo.',['tiempo','esfuerzo']],
      ['retrospective','Retrospectiva','Extrae aprendizajes de una ejecución.','Separá qué funcionó, qué no, causas, aprendizajes, acciones concretas y responsable de cada mejora.',['mejora','aprendizaje']],
      ['promptengineer','Ingeniería de instrucciones','Activa criterio para auditar y mejorar instrucciones existentes.','Cuando el usuario entregue una instrucción posterior, detectá ambigüedades, contexto faltante, conflictos, límites débiles y criterios de calidad antes de proponer mejoras.',['prompt','optimización']],
      ['meta-prompt','Diseño de plantillas de instrucción','Activa criterio para estructurar plantillas reutilizables.','Cuando corresponda, ayudá a estructurar rol, objetivo, entradas, contexto, restricciones, formato, criterios de calidad y variables editables sin ejecutar la plantilla.',['prompt','plantilla']],
      ['systemprompt','Conducta estable de asistente','Activa criterio para diseñar comportamiento persistente.','Cuando el usuario pida definir conducta de asistente, controlá misión, alcance, prioridades, flujo, herramientas, incertidumbre, seguridad, errores y criterios de prueba.',['asistente','sistema']]
    ]);

    add('Seguridad y control de calidad',[
      ['guardrails','Reglas y límites','Define lo permitido, obligatorio y prohibido.','Establecé alcance, acciones obligatorias, prohibiciones, manejo de incertidumbre, datos sensibles y condición de detención.',['límites','seguridad']],
      ['benchmark','Comparación con estándar','Evalúa contra una referencia explícita.','Definí estándar o referente, criterios comunes, brechas, evidencia y plan de mejora; no inventes datos del referente.',['estándar','comparación']],
      ['pokayoke','Prevención de errores','Diseña un proceso a prueba de fallas comunes.','Identificá errores previsibles y agregá prevención, detección temprana, mensaje claro y recuperación segura.',['errores','prevención']],
      ['acceptance-criteria','Criterios de aceptación','Define cuándo una entrega está terminada.','Redactá criterios específicos, observables y comprobables, incluyendo casos límite y condiciones de rechazo.',['requisitos','aprobación']],
      ['testcases','Casos de prueba','Cubre comportamiento normal y extremo.','Diseñá estado inicial, datos, pasos, resultado esperado y prioridad para casos normales, límite, error y recuperación.',['pruebas','calidad']],
      ['redteam','Prueba adversarial','Intenta romper supuestos y controles.','Diseñá escenarios adversos autorizados para descubrir fallas, abuso, entradas extremas y recuperaciones insuficientes; priorizá mitigaciones.',['adversarial','riesgo']],
      ['privacy','Revisión de privacidad','Detecta exposición innecesaria de datos.','Identificá datos personales, propósito, minimización, acceso, conservación, respaldo, eliminación y riesgos de divulgación.',['privacidad','datos']],
      ['anonymize','Anonimización','Reduce identificación preservando utilidad.','Detectá identificadores directos e indirectos, proponé sustitución o generalización y advertí riesgo de reidentificación.',['anonimizar','privacidad']],
      ['consistency','Consistencia integral','Encuentra contradicciones entre partes.','Compará nombres, cifras, fechas, estados, reglas y términos a lo largo del material; listá cada inconsistencia con ubicación.',['coherencia','control']],
      ['objective-corrective-review','Revisión objetiva y correctiva','Comando compuesto para analizar, disentir con fundamento y conducir correcciones verificables.','Actuá como revisor independiente durante toda la conversación. Examiná los planteos con criterios explícitos, detectá fallas reales y causas estructurales, formulá desacuerdos sustentados y proponé una corrección completa. Antes de alterar el trabajo, explicá el impacto y esperá autorización cuando corresponda. Después de cada intervención, verificá coherencia, efectos secundarios y cumplimiento del objetivo.',['compuesto','objetividad','causa raíz','verificación']],
      ['final-audit','Auditoría final','Realiza un control completo antes de entregar.','Verificá requisitos, funcionalidad, integridad, seguridad, accesibilidad, documentación, pruebas y limitaciones; separá probado de no probado.',['auditoría','final']]
    ]);

    add('Audiovisual, video y producción',[
      ['video-director','Dirección audiovisual','Activa criterio de dirección para piezas audiovisuales generales.','Cuando el usuario entregue una tarea audiovisual posterior, evaluá intención, estructura, lenguaje visual, continuidad, ritmo, recursos y resultado esperado sin asumir plataforma ni duración.',['video','dirección','audiovisual']],
      ['video-postproduction','Postproducción profesional','Ordena edición, color, sonido, entrega y control final.','Trabajá como supervisor de postproducción: separá montaje, color, sonido, gráficos, exportación y control de calidad antes de cerrar una tarea posterior.',['postproducción','video']],
      ['visual-storytelling','Storytelling visual','Organiza una idea audiovisual por secuencia, tensión y progresión.','Analizá la tarea posterior desde objetivo narrativo, progresión visual, foco de atención, continuidad y cierre, sin escribir guiones si no fueron pedidos.',['narrativa','visual']],
      ['technical-script','Guion técnico','Traduce una intención en estructura técnica verificable.','Si el usuario pide trabajo de guion o planificación audiovisual, distinguí escena, plano, acción, audio, transición, intención y control de continuidad.',['guion','técnico']],
      ['video-editing','Edición y montaje','Activa criterio de corte, ritmo y claridad.','Evaluá material o instrucciones posteriores con foco en ritmo, orden, cortes, transiciones, redundancias, respiración visual y comprensión del mensaje.',['edición','montaje']],
      ['pacing-control','Ritmo y pacing','Controla velocidad, pausas y tensión de una pieza.','Revisá la tarea posterior detectando momentos lentos, cortes precipitados, pérdida de atención y necesidad de pausas, aceleraciones o reordenamiento.',['ritmo','pacing']],
      ['continuity-video','Continuidad audiovisual','Cuida coherencia visual, narrativa y temporal.','Controlá continuidad de personajes, objetos, luz, eje, sonido, tiempo, intención y secuencia; señalá rupturas reales y cómo corregirlas.',['continuidad','video']],
      ['cinematography','Dirección de fotografía','Activa criterio de encuadre, luz, lente y cámara.','Cuando corresponda, analizá composición, movimiento, foco, profundidad, iluminación, textura y coherencia fotográfica con el objetivo de la pieza.',['fotografía','cámara']],
      ['color-grading','Corrección de color','Trabaja color, contraste y consistencia visual.','Revisá color, temperatura, contraste, exposición, continuidad entre planos y coherencia con identidad o intención estética.',['color','grading']],
      ['motion-graphics','Motion graphics','Activa criterio de animación gráfica funcional.','Evaluá títulos, placas, transiciones, jerarquía, timing, legibilidad y coherencia gráfica en piezas con movimiento.',['motion','gráfica']],
      ['vfx-supervision','Supervisión VFX','Controla efectos visuales, integración y verosimilitud.','Revisá efectos, compositing, integración de luz, escala, tracking, bordes, sombras y coherencia física sin inventar recursos no disponibles.',['vfx','efectos']],
      ['sound-design','Diseño sonoro','Activa criterio profesional de sonido y atmósfera.','Trabajá con niveles, ambiente, efectos, silencios, sincronía, inteligibilidad y función narrativa del sonido en tareas posteriores.',['sonido','audio']],
      ['music-editing','Edición musical aplicada','Relaciona música, intención, ritmo y corte.','Evaluá entrada, salida, tempo, energía, loop, golpe musical, cortes y relación entre música, voz, imagen y objetivo.',['música','edición']],
      ['voice-direction','Dirección de voz','Activa criterio de locución, tono y claridad oral.','Si la tarea posterior incluye voz, revisá dicción, intención, velocidad, pausas, énfasis, naturalidad y coherencia con el público indicado.',['voz','locución']],
      ['storyboard','Storyboard y planificación visual','Ordena escenas antes de producir o revisar.','Convertí una tarea posterior compatible en secuencia visual, intención de plano, acción principal, continuidad y puntos de control.',['storyboard','planificación']],
      ['generative-video-pipeline','Pipeline de video generativo','Controla flujos texto-imagen-video con consistencia.','Cuando el usuario trabaje con video generativo, revisá assets, instrucciones, versiones, consistencia de personajes, control de estilo, riesgos y validación final.',['video generativo','pipeline']],
      ['commercial-video-direction','Dirección de video comercial','Activa criterio para piezas audiovisuales comerciales sin limitarse a redes.','Evaluá objetivo, oferta, prueba, atención, claridad, duración definida por el usuario, restricciones de marca y control final sin convertirlo automáticamente en reel.',['comercial','publicidad']],
      ['documentary-video-direction','Dirección documental','Trabaja evidencia, relato y estructura documental.','Ordená material documental por hipótesis, fuente, testimonio, archivo, ritmo, ética, contexto y verificación de afirmaciones.',['documental','relato']],
      ['educational-video-design','Diseño de video educativo','Activa criterio didáctico audiovisual.','Revisá objetivos de aprendizaje, secuencia cognitiva, claridad visual, ejemplos, ritmo, comprobación y carga de información.',['educativo','video']],
      ['video-qc','Auditoría audiovisual final','Controla calidad técnica y narrativa antes de entregar.','Verificá coherencia, continuidad, audio, color, legibilidad, ritmo, requisitos técnicos, riesgos de interpretación y faltantes observables.',['auditoría','video']]
    ]);

    add('Imagen, diseño visual y branding',[
      ['art-direction','Dirección de arte','Activa criterio visual integral para piezas y sistemas gráficos.','Cuando el usuario entregue una tarea visual posterior, evaluá intención, composición, estilo, coherencia, recursos, jerarquía y control de calidad sin inventar assets.',['arte','dirección']],
      ['brand-system','Sistema de marca','Cuida identidad, reglas visuales y consistencia.','Analizá marca, usos, tono visual, colores, tipografías, variantes, restricciones y coherencia entre aplicaciones.',['marca','branding']],
      ['visual-design','Diseño visual profesional','Organiza jerarquía, contraste y lectura.','Revisá jerarquía, alineación, espacios, contraste, densidad, lectura, foco de atención y consistencia de componentes.',['diseño','visual']],
      ['composition-control','Composición visual','Controla equilibrio, foco y estructura de imagen.','Evaluá encuadre, peso visual, zonas de atención, profundidad, recorte, escala y relación entre elementos.',['composición','imagen']],
      ['typography-control','Control tipográfico','Activa criterio de legibilidad, voz y jerarquía tipográfica.','Revisá familias, tamaños, pesos, interlínea, contraste, cortes, consistencia y adecuación al contexto.',['tipografía','legibilidad']],
      ['color-system','Sistema de color','Trabaja paleta, contraste y coherencia cromática.','Analizá paleta, temperatura, contraste, accesibilidad, saturación, asociación de marca y coherencia entre piezas.',['color','paleta']],
      ['image-retouching','Retoque profesional','Activa criterio de corrección visual sin deformar la realidad.','Cuando corresponda, señalá ajustes de limpieza, luz, piel, textura, recorte y naturalidad, evitando alterar rasgos o prometer resultados irreales.',['retoque','imagen']],
      ['image-compositing','Composición avanzada','Integra elementos visuales con coherencia técnica.','Revisá escala, perspectiva, luz, sombras, bordes, profundidad, color y verosimilitud de composiciones.',['compositing','integración']],
      ['visual-prompt-control','Control de prompts visuales','Convierte intención visual en instrucciones controladas.','Ayudá a formular o auditar instrucciones visuales con sujeto, estilo, composición, iluminación, restricciones, continuidad y criterios de rechazo.',['prompt visual','control']],
      ['layout-system','Sistema de layouts','Estandariza plantillas visuales repetibles.','Diseñá o evaluá retículas, zonas, módulos, jerarquías, variantes y reglas para piezas visuales recurrentes.',['layout','retícula']],
      ['packaging-design','Diseño de packaging','Activa criterio de producto físico, lectura y presencia.','Revisá frente, información, jerarquía, materialidad, categoría, góndola, marca, legalidad visible y restricciones de producción.',['packaging','producto']],
      ['accessibility-visual','Accesibilidad visual','Controla contraste, legibilidad y percepción.','Auditá contraste, tamaño, color, foco, lectura, saturación, iconografía y barreras para personas con baja visión o daltonismo.',['accesibilidad','contraste']],
      ['visual-qc','Auditoría visual final','Controla coherencia y terminación gráfica.','Verificá legibilidad, contraste, ortografía visible, alineación, marca, consistencia, exportación y riesgos de interpretación.',['auditoría','visual']],
      ['brand-voice-visual','Voz visual de marca','Une personalidad, tono y decisión estética.','Evaluá si las decisiones visuales comunican la personalidad buscada y si sostienen una identidad reconocible.',['marca','voz visual']],
      ['creative-brief-visual','Brief visual profesional','Ordena criterios antes de diseñar o evaluar.','Cuando el usuario pida preparar una tarea visual, separá objetivo, público, uso final, restricciones, assets, referencias, tono y criterios de aceptación.',['brief','visual']],
      ['design-variants','Variantes de diseño','Explora caminos visuales sin perder identidad.','Proponé o evaluá variantes diferenciadas por composición, jerarquía, tono, paleta o formato, manteniendo coherencia con el objetivo.',['variantes','diseño']]
    ]);

    add('Audio, música y voz',[
      ['audio-production','Producción de audio','Activa criterio integral para piezas sonoras.','Trabajá sobre guion sonoro, voz, música, efectos, mezcla, ritmo, niveles y entrega sólo cuando el usuario aporte una tarea posterior.',['audio','producción']],
      ['audio-mix','Mezcla y niveles','Controla balance, claridad y presencia.','Revisá niveles relativos, inteligibilidad, rango dinámico, saturación, ruido, transiciones y balance entre voz, música y efectos.',['mezcla','niveles']],
      ['loudness-control','Loudness y entrega sonora','Cuida volumen percibido y consistencia.','Evaluá loudness, picos, compresión, normalización, destino y criterios técnicos cuando sean definidos por el usuario.',['loudness','audio']],
      ['voice-casting','Selección de voz','Activa criterio de voz según intención y público.','Ayudá a elegir o auditar voz por tono, edad percibida, autoridad, cercanía, claridad, velocidad y coherencia de marca.',['voz','casting']],
      ['podcast-structure','Estructura de podcast','Organiza conversación, secciones y retención sonora.','Analizá apertura, bloques, transiciones, ritmo, preguntas, cierre, claridad y continuidad editorial.',['podcast','estructura']],
      ['music-supervision','Supervisión musical','Relaciona música con emoción, marca y derechos.','Evaluá intención musical, energía, uso, coherencia, riesgos de licencia, reemplazos y control de encaje con la pieza.',['música','supervisión']],
      ['sound-qc','Auditoría sonora final','Controla fallas audibles antes de publicar o entregar.','Detectá ruido, cortes bruscos, volumen desigual, saturación, ecos, pausas, sincronía y problemas de comprensión.',['auditoría','sonido']]
    ]);

    add('Producto y experiencia de usuario',[
      ['product-discovery','Product discovery','Activa investigación de problema antes de solución.','Cuando el usuario entregue una tarea de producto, identificá usuario, problema, contexto, alternativas, evidencia, riesgos y aprendizaje necesario.',['producto','discovery']],
      ['jtbd','Jobs to be done','Enfoca el trabajo real que el usuario necesita resolver.','Formulá el trabajo, situación, motivación, resultado esperado, barreras y criterios de éxito sin inventar investigación.',['jtbd','usuario']],
      ['ux-audit','Auditoría UX','Detecta fricción, confusión y errores de uso.','Revisá recorrido, carga cognitiva, jerarquía, feedback, estados, errores, accesibilidad y claridad operacional.',['ux','auditoría']],
      ['user-flow','Flujo de usuario','Ordena pasos, decisiones y estados.','Mapeá inicio, objetivo, pasos, bifurcaciones, estados vacíos, errores, recuperación y salida esperada.',['flujo','usuario']],
      ['friction-map','Mapa de fricción','Encuentra puntos donde el usuario se detiene o abandona.','Detectá fricciones visibles, causas probables, impacto, evidencia necesaria y corrección priorizada.',['fricción','ux']],
      ['prototype-spec','Especificación de prototipo','Convierte una intención en comportamiento comprobable.','Definí pantallas, estados, acciones, restricciones, datos, mensajes y criterios de aceptación de un prototipo.',['prototipo','especificación']],
      ['product-metrics','Métricas de producto','Define señales útiles para decidir.','Proponé métricas ligadas a uso real, retención, error, velocidad, satisfacción y decisión posterior.',['métricas','producto']],
      ['product-ops','Product operations','Ordena documentación, decisiones y continuidad de producto.','Estructurá backlog, criterios, decisiones, versiones, responsables, aprendizaje y control de cambios.',['operaciones','producto']],
      ['usability-test','Prueba de usabilidad','Diseña observación real de uso.','Prepará tareas, escenario, métricas, observaciones, sesgos, preguntas y síntesis accionable sin conducir al usuario.',['usabilidad','prueba']],
      ['ux-writing','UX writing','Mejora textos de interfaz y estados.','Revisá etiquetas, botones, mensajes, errores, ayudas, vacíos y confirmaciones para que orienten sin sobreexplicar.',['microcopy','interfaz']]
    ]);

    add('Datos, IA y automatización',[
      ['agent-design','Diseño de agentes IA','Activa criterio para roles, herramientas y límites de agentes.','Diseñá o auditá agentes por objetivo, entradas, herramientas, memoria, límites, autorizaciones, errores y evaluación.',['agentes','ia']],
      ['agent-orchestration','Orquestación de agentes','Coordina múltiples roles sin duplicación ni conflicto.','Definí responsabilidades, traspasos, estado compartido, prioridad, control humano y condiciones de detención.',['orquestación','agentes']],
      ['rag-design','Diseño RAG','Trabaja recuperación, contexto y respuesta verificable.','Evaluá fuentes, chunking, búsqueda, ranking, citación, freshness, trazabilidad, límites y fallas de recuperación.',['rag','conocimiento']],
      ['model-evaluation','Evaluación de modelos','Mide calidad de salida con criterios explícitos.','Definí dataset, rúbrica, casos límite, métricas, comparación, sesgos, fallas y criterio de aceptación.',['evaluación','modelo']],
      ['guardrail-evaluation','Evaluación de guardrails','Controla límites, rechazos y recuperaciones.','Revisá políticas, entradas adversarias, falsos positivos, falsos negativos, mensajes de recuperación y trazabilidad.',['guardrails','evaluación']],
      ['workflow-automation','Automatización de workflows','Convierte procesos repetibles en flujos controlados.','Mapeá entradas, pasos, reglas, excepciones, validaciones, intervención humana y salida auditable.',['workflow','automatización']],
      ['data-pipeline','Pipeline de datos','Activa criterio de flujo, contrato y calidad de datos.','Definí origen, transformación, validación, errores, trazabilidad, actualización, monitoreo y compatibilidad.',['datos','pipeline']],
      ['ai-observability','Observabilidad IA','Detecta comportamiento, degradación y fallos de sistemas IA.','Definí eventos, logs, métricas, trazas, muestras, alertas, auditoría y análisis de causa raíz.',['observabilidad','ia']],
      ['prompt-system-design','Diseño de sistemas de prompts','Organiza instrucciones persistentes, jerarquías y controles.','Separá rol, alcance, reglas, memoria, herramientas, límites, formato, pruebas y mantenimiento de instrucciones.',['prompt','sistema']],
      ['human-in-the-loop','Control humano en IA','Define cuándo la IA debe pedir autorización o detenerse.','Establecé decisiones reversibles, irreversibles, riesgosas, ambiguas, escalamiento, revisión humana y registro de cambios.',['control humano','ia']]
    ]);

    add('Legal, compliance y gobernanza',[
      ['content-compliance','Compliance de contenido','Controla riesgos normativos y promesas sensibles.','Revisá afirmaciones, evidencia, restricciones del sector, promesas, disclaimers, datos personales y riesgos de interpretación.',['compliance','contenido']],
      ['privacy-governance','Gobernanza de privacidad','Activa minimización y protección de datos.','Identificá datos, finalidad, acceso, conservación, eliminación, respaldo, consentimiento y riesgos de exposición.',['privacidad','gobernanza']],
      ['ai-governance','Gobernanza de IA','Ordena uso responsable, trazabilidad y control de sistemas IA.','Definí alcance, roles, datos, riesgos, auditoría, supervisión humana, documentación y criterios de uso aceptable.',['gobernanza','ia']],
      ['policy-drafting','Redacción de políticas operativas','Estructura reglas internas aplicables.','Cuando se pida una política, organizá alcance, responsables, reglas, excepciones, evidencia, revisión y consecuencias operativas.',['políticas','operación']],
      ['risk-disclaimer','Control de disclaimers','Ubica aclaraciones sin tapar la información principal.','Evaluá cuándo una aclaración es necesaria, suficiente, visible y proporcional, sin usarla para cubrir promesas débiles.',['disclaimer','riesgo']],
      ['contract-review-basic','Revisión contractual básica','Activa lectura estructurada de contratos no sustitutiva de asesoría legal.','Identificá partes, obligaciones, plazos, riesgos, ambigüedades, datos faltantes y puntos para revisión profesional.',['contratos','revisión']],
      ['traceability-control','Control de trazabilidad','Asegura que decisiones y cambios puedan reconstruirse.','Registrá origen, criterio, cambio, responsable, evidencia, impacto y fecha cuando una tarea posterior lo requiera.',['trazabilidad','control']],
      ['regulated-claims','Control de afirmaciones reguladas','Evita promesas riesgosas en sectores sensibles.','Revisá afirmaciones médicas, financieras, legales o técnicas separando evidencia, límites, permisos y lenguaje seguro.',['afirmaciones','regulado']]
    ]);

    if(builtIns.length!==258)throw new Error('Catálogo interno incompleto: '+builtIns.length);
    const compositeCommand=builtIns.find(command=>command.alias==='objective-corrective-review');
    if(compositeCommand)compositeCommand.composite=true;

    const CATEGORY_DOMAIN={
      'Escritura y comunicación':'writing',
      'Análisis y decisiones':'analysis',
      'Estrategia y negocio':'business',
      'Marketing y contenido':'social',
      'Aprendizaje y educación':'learning',
      'Investigación y verificación':'research',
      'Creatividad e innovación':'creative',
      'Desarrollo y tecnología':'tech',
      'Datos y formatos':'data',
      'Productividad y planificación':'planning',
      'Seguridad y control de calidad':'quality',
      'Audiovisual, video y producción':'video',
      'Imagen, diseño visual y branding':'image',
      'Audio, música y voz':'audio',
      'Producto y experiencia de usuario':'product',
      'Datos, IA y automatización':'ai',
      'Legal, compliance y gobernanza':'legal'
    };
    const OUTPUT_ALIASES=new Set([
      'report','executive-summary','matrix','timeline','source-matrix','mindmap',
      'table','json','jsonschema','csv','yaml','markdown','outline','schema',
      'classification','transform','checklist','template'
    ]);
    const CONTROL_ALIASES=new Set([
      'factcheck','verify','sources','citations','evidence','uncertainty','freshness',
      'methodology','claims','codereview','unittest','regression','securityaudit','accessibility',
      'guardrails','benchmark','pokayoke','acceptance-criteria','testcases','redteam',
      'privacy','anonymize','consistency','final-audit','video-qc','visual-qc','sound-qc',
      'ux-audit','usability-test','model-evaluation','guardrail-evaluation','ai-observability',
      'content-compliance','privacy-governance','ai-governance','ad-compliance','traceability-control',
      'regulated-claims','funnel-diagnostic','creative-testing','accessibility-visual'
    ]);
    const CONTEXT_ALIASES=new Set([
      'instagram','linkedin','youtube','seo','audience','brand','positioning','kpi',
      'offline','migration','backup','release-notes','api-design','database','performance',
      'video-director','video-postproduction','cinematography','commercial-video-direction','documentary-video-direction',
      'art-direction','brand-system','visual-design','audio-production','product-discovery',
      'agent-design','rag-design','performance-creative','ad-brief','landing-message'
    ]);
    const MODIFIER_ALIASES=new Set([
      'human','expert','teacher','analyst','brief','detailed','simplify','professional','casual',
      'friendly','persuasive','concise','polish','tone','critic','counterargument',
      'devils-advocate','alternative','first-principles','pareto','viral','copywriter',
      'hook','headline','caption','cta','hashtags','story','imageprompt','videoprompt',
      'analogy','examples','few-shot','mentor','coach','socratic','feynman','creative',
      'unpopular','contrarian','reverse','storyteller','variations','promptengineer',
      'meta-prompt','systemprompt','objective-dialogue','corrective-collaboration','objective-corrective-review',
      'visual-storytelling','technical-script','video-editing','pacing-control','continuity-video',
      'color-grading','motion-graphics','vfx-supervision','sound-design','music-editing',
      'voice-direction','storyboard','generative-video-pipeline','educational-video-design',
      'composition-control','typography-control','color-system','image-retouching','image-compositing',
      'visual-prompt-control','layout-system','packaging-design','brand-voice-visual',
      'creative-brief-visual','design-variants','audio-mix','loudness-control','voice-casting',
      'podcast-structure','music-supervision','jtbd','user-flow','friction-map','prototype-spec',
      'product-metrics','product-ops','ux-writing','agent-orchestration','workflow-automation',
      'data-pipeline','prompt-system-design','human-in-the-loop','policy-drafting','risk-disclaimer',
      'contract-review-basic','offer-angle','content-atomization'
    ]);
    const UNIVERSAL_ALIASES=new Set([
      'human','expert','brief','detailed','simplify','professional','concise','polish',
      'tone','critic','counterargument','devils-advocate','alternative','first-principles',
      'pareto','examples','few-shot','contrarian','guardrails','consistency','final-audit',
      'checklist','outline','markdown','report','executive-summary','objective-dialogue',
      'corrective-collaboration','objective-corrective-review'
    ]);
    function commandKind(alias){
      if(OUTPUT_ALIASES.has(alias))return 'output';
      if(CONTROL_ALIASES.has(alias))return 'control';
      if(CONTEXT_ALIASES.has(alias))return 'context';
      if(MODIFIER_ALIASES.has(alias))return 'modifier';
      return 'primary';
    }
    builtIns.forEach(command=>{
      command.kind=commandKind(command.alias);
      command.domain=UNIVERSAL_ALIASES.has(command.alias)?'universal':CATEGORY_DOMAIN[command.category]||'universal';
    });
    if(builtIns.some(command=>!command.kind||!command.domain))throw new Error('Clasificación interna incompleta.');

    window.CentroComandosData={CATEGORY_RULES,CATEGORY_DOMAIN,KEYWORD_COMMANDS,builtIns};
})();
