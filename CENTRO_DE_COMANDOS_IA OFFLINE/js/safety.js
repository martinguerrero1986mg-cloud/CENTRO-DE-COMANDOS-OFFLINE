(()=>{
  'use strict';

  const MAX_CONTEXT_CHARS=600;

  const normalizeInput=value=>String(value||'')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[\u0000-\u001F\u007F]+/g,' ')
    .replace(/\s+/g,' ')
    .trim();
  const has=(text,patterns)=>patterns.some(pattern=>pattern.test(text));
  const count=(text,patterns)=>patterns.reduce((total,pattern)=>total+(pattern.test(text)?1:0),0);

  const evasionIntent=[
    /\b(evadi[rr]?|eludi[rr]?|burlar|saltar|sortear|rodear|esquivar|vulnerar|romper|pasar\s+por\s+alto|bypass|override)\b/,
    /\b(no|sin)\s+(?:me\s+|lo\s+|la\s+|que\s+)?bloque/i,
    /\bque\s+(?:la\s+)?ia\s+no\s+(?:me\s+)?(?:bloquee|detecte|frene|filtre|modere)/,
    /\bpalabras?\b.{0,80}\b(?:plataforma|ia|sistema|filtro|moderacion|bloqueo)\b.{0,80}\b(?:no\s+)?(?:detecte|bloquee|marque|filtre|modere)/,
    /\bsin\s+que\s+(?:lo|me|la|el)?\s*(?:detecte|modere|filtre|bloquee)/,
    /\bavoid\s+(?:filters?|moderation|detection)\b/
  ];
  const moderationTarget=[
    /\bfiltros?\b/,/\bmoderacion\b/,/\bpoliticas?\b/,/\brestricciones?\b/,/\bcensura\b/,
    /\bbloqueos?\b/,/\bia\b/,/\bplataforma\b/,/\bdetect/i,/\bcontrol(?:es)?\b/,
    /\bprompt\s+sistema\b/,/\bmodo\s+desarrollador\b/
  ];

  const minorTerms=[/\bmenor(?:es)?\b/,/\bnin[oa]s?\b/,/\bchic[oa]s?\b/,/\badolescente(?:s)?\b/,/\binfantil(?:es)?\b/];
  const sexualTerms=[/\bsexual(?:es)?\b/,/\bsexo\b/,/\berotic[oa]s?\b/,/\bporn\w*\b/,/\bdesnud\w*\b/,/\bcontenido\s+adulto\b/,/\bmaterial\s+adulto\b/];
  const strongSexualMinorTerms=[/\bporn\w*\b/,/\berotic[oa]s?\b/,/\bdesnud\w*\b/,/\bcontenido\s+sexual\b/,/\bmaterial\s+sexual\b/];
  const adultAmbiguousTerms=[/\bcontenido\s+adulto\b/,/\bmaterial\s+adulto\b/,/\berotic[oa]s?\b/,/\bporn\w*\b/,/\bdesnud\w*\b/];

  const sexualHealthFrame=[
    /\b(salud|educacion|educativo|prevencion|prevenir|medic[oa]|clinico|sanitario|riesgo|infecciones?|ets|its)\b.{0,120}\b(sexual|adolescente|menor|infantil|nin[oa])\b/,
    /\b(sexual|adolescente|menor|infantil|nin[oa])\b.{0,120}\b(salud|educacion|educativo|prevencion|prevenir|medic[oa]|clinico|sanitario|riesgo|infecciones?|ets|its)\b/
  ];
  const sexualLegalForensicFrame=[
    /\b(caso|causa|denuncia|demanda|defensa|expediente|victima|acusad[oa]|ley|articulo|jurisprudencia|forense|investigacion|auditoria)\b.{0,140}\b(abuso|delito|violencia|explotacion|porn\w*|material|fotos?|sexual|infantil|menor(?:es)?|nin[oa]s?|adolescente(?:s)?)\b/,
    /\b(abuso|delito|violencia|explotacion|porn\w*|material|fotos?|sexual|infantil|menor(?:es)?|nin[oa]s?|adolescente(?:s)?)\b.{0,140}\b(caso|causa|denuncia|demanda|defensa|expediente|victima|acusad[oa]|ley|articulo|jurisprudencia|forense|investigacion|auditoria)\b/
  ];
  const sexualPreventionFrame=[
    /\b(prevenir|prevencion|educar|asistencia\s+a\s+victimas?|proteccion|proteger|denunciar|detectar)\b.{0,140}\b(abuso|explotacion|porn\w*|sexual|menor(?:es)?|nin[oa]s?|adolescente(?:s)?|infantil)\b/
  ];
  const sexualMinorOperational=[
    /\b(hacer|generar|crear|producir|redactar|escribir|disenar|mostrar|dibujar|renderizar|fabricar)\b.{0,100}\b(contenido|imagen|video|guion|fantasia|material|fotos?|relato|escena)\b.{0,100}\b(sexual|porn\w*|erotic\w*|desnud\w*)\b.{0,100}\b(menor(?:es)?|nin[oa]s?|adolescente(?:s)?|infantil)\b/,
    /\b(hacer|generar|crear|producir|redactar|escribir|disenar|mostrar|dibujar|renderizar|fabricar)\b.{0,100}\b(menor(?:es)?|nin[oa]s?|adolescente(?:s)?|infantil)\b.{0,100}\b(contenido|imagen|video|guion|fantasia|material|fotos?|relato|escena)\b.{0,100}\b(sexual|porn\w*|erotic\w*|desnud\w*)\b/
  ];
  const exploitativeSexualMinorOperational=[
    /\b(hacer|generar|crear|producir|redactar|escribir|disenar|mostrar|dibujar|renderizar)\b.{0,90}\b(contenido\s+sexual|imagen(?:es)?\s+porn\w*|video(?:s)?\s+porn\w*|fotos?\s+porn\w*|porn\w*|desnud\w*|erotic\w*)\b.{0,90}\b(menor(?:es)?|nin[oa]s?|adolescente(?:s)?|infantil)\b/,
    /\b(hacer|generar|crear|producir|redactar|escribir|disenar|mostrar|dibujar|renderizar)\b.{0,90}\b(menor(?:es)?|nin[oa]s?|adolescente(?:s)?|infantil)\b.{0,90}\b(contenido\s+sexual|imagen(?:es)?\s+porn\w*|video(?:s)?\s+porn\w*|fotos?\s+porn\w*|porn\w*|desnud\w*|erotic\w*)\b/
  ];

  const benignHarmFrame=[
    /\bbomba\s+de\s+agua\b/,/\bsistema\s+de\s+riego\b/,/\bvideojuego\b/,/\bfantastic[ao]\b/,/\bficcion\b/,
    /\bprotocolo\s+de\s+evacuacion\b/,/\bevacuacion\b.{0,80}\b(explosion|incendio|emergencia)\b/,
    /\b(explosion|incendio|emergencia)\b.{0,80}\bevacuacion\b/
  ];
  const harmfulOperationalIntent=[
    /\b(como|cómo)\b.{0,50}\b(fabricar|crear|armar|construir|producir|hacer|disenar)\b.{0,90}\b(bomba|explosivo|arma|veneno)\b/,
    /\b(fabricar|crear|armar|construir|producir|hacer|disenar)\b.{0,90}\b(bomba|explosivo|arma|veneno)\b/,
    /\bexplosivo\b.{0,60}\bcasero\b/,
    /\b(matar|asesinar|herir|danar|incendiar|envenenar)\b.{0,90}\b(persona|alguien|grupo|escuela|colegio|edificio|sistema)\b/,
    /\b(quiero|necesito|busco|ayudame|ayuda)\b.{0,80}\b(asesinar|matar|envenenar|herir)\b/,
    /\b(asesinar|matar|envenenar|herir)\b.{0,100}\b(sin\s+dejar\s+(?:evidencia|rastros?)|ocultar\s+rastros?|no\s+me\s+encuentren)\b/,
    /\bdesactivar\b.{0,80}\b(camaras?|alarmas?|seguridad)\b.{0,80}\b(entrar|robar|ingresar|asaltar)\b/
  ];

  const safeCyberFrame=[
    /\b(ciberseguridad|seguridad\s+defensiva|defensiv[oa]|prevencion|prevenir|evitar|impedir|revisar|analizar|auditar|detectar|proteger|forense|incidente|respuesta\s+a\s+incidentes?)\b.{0,130}\b(hackeo|malware|ransomware|phishing|vulnerabilidad|cuentas?|claves?|sistemas?|servidores?)\b/,
    /\b(hackeo|malware|ransomware|phishing|vulnerabilidad|cuentas?|claves?|sistemas?|servidores?)\b.{0,130}\b(defensiv[oa]|prevencion|prevenir|evitar|impedir|revisar|analizar|auditar|detectar|proteger|forense|incidente|respuesta\s+a\s+incidentes?)\b/
  ];
  const cyberOperationalIntent=[
    /\b(hackear|vulnerar|tomar\s+control|entrar\s+sin\s+permiso|tumbar|ddos|dos)\b.{0,90}\b(cuentas?|correos?|sistemas?|servidores?|perfiles?|redes?|plataformas?)\b/,
    /\brobar\b.{0,90}\b(claves?|contrasenas?|cuentas?|datos|credenciales?)\b/,
    /\b(crear|generar|programar|disenar|fabricar|instalar)\b.{0,90}\b(malware|virus|ransomware|keylogger|phishing|exploit|botnet)\b/,
    /\b(explotar|aprovechar)\b.{0,70}\b(vulnerabilidad|brecha|fallo)\b/
  ];
  const cyberAbuseTerms=[/\bmalware\b/,/\bvirus\s+informatico\b/,/\bransomware\b/,/\bkeylogger\b/,/\bphishing\b/,/\bddos\b/,/\bbotnet\b/,/\bexploit\b/];

  const legalSafeIntent=[
    /\b(denuncia|demanda|defensa|causa|caso|expediente|articulo|ley|jurisprudencia|contrato|acusad[oa]|victima)\b.{0,100}\b(por|de|sobre|contra)\b/,
    /\b(necesito|quiero|busco|modo|comando)\b.{0,100}\b(denuncia|demanda|defensa|causa|caso|expediente|articulo|ley|jurisprudencia|contrato)\b/
  ];
  const safePurpose=[
    /\b(analizar|explicar|estudiar|revisar|prevenir|prevencion|evitar|impedir|detectar|denunciar|defender|documentar|educar|informar|auditar\s+riesgos|seguridad\s+defensiva|proteger|asistencia\s+a\s+victimas?)\b/,
    /\b(protocolo\s+de\s+evacuacion|protocolo\s+preventivo|auditoria\s+de\s+riesgos|investigacion\s+sobre|investigar\s+un\s+caso)\b/
  ];
  const crimeOperationalIntent=[
    /\b(como|cómo)\b.{0,70}\b(robar|hurtar|estafar|hacer\s+fraude|cometer\s+fraude|lavar\s+dinero|traficar|evadir\s+impuestos|falsificar|clonar\s+tarjetas?|ocultar\s+rastros)\b/,
    /\b(planear|organizar|preparar|cometer|ejecutar|facilitar)\b.{0,90}\b(robo|hurto|fraude|estafa|secuestro|extorsion|soborno|lavado|lavar\s+dinero|trafico|traficar|evasion\s+fiscal|evadir\s+impuestos)\b/,
    /\b(hacer|crear|generar|armar|disenar|fabricar|clonar)\b.{0,90}\b(robo|hurto|fraude|estafa|secuestro|extorsion|soborno|lavado|documentos?\s+falsos?|identidades?\s+falsas?|tarjetas?\s+bancarias?)\b/,
    /\b(robar|hurtar|estafar|secuestrar|extorsionar|sobornar|falsificar|lavar\s+dinero|traficar\s+drogas?|evadir\s+impuestos|clonar\s+tarjetas?)\b/,
    /\b(fabricar|producir|cocinar|vender)\b.{0,90}\b(metanfetamina|cocaina|drogas?|narcoticos?)\b/,
    /\b(metanfetamina|cocaina|drogas?|narcoticos?)\b.{0,90}\b(vender|traficar|distribuir|fabricar|producir)\b/,
    /\b(cometer|necesito\s+cometer|quiero\s+cometer)\b.{0,60}\b(evasion\s+fiscal|fraude|delito)\b/,
    /\bocultar\s+(?:mis\s+)?rastros\b/
  ];
  const illegalAfterSafeWord=[
    /\b(denuncia|demanda|defensa|causa|caso|seguridad|auditoria|analisis|modo)\b.{0,90}\bpara\s+(?:poder\s+)?(cometer|hacer|ejecutar|facilitar|ocultar|robar|estafar|hackear|traficar|evadir|falsificar)\b/
  ];

  const generalModeOnly=[/\bmodo\b/,/\bescritor\b/,/\bredactor\b/,/\bauditor\b/,/\babogado\b/,/\bdocente\b/,/\bmarketing\b/,/\bdirector\b/,/\bdisenador\b/,/\bprogramador\b/,/\beditor\b/];

  function isProfessionalSexualContext(text){
    return has(text,sexualHealthFrame)||has(text,sexualLegalForensicFrame)||has(text,sexualPreventionFrame);
  }
  function isSafeCyberContext(text){
    return has(text,safeCyberFrame)&&!has(text,cyberOperationalIntent);
  }
  function isSafeCrimeContext(text){
    return (has(text,legalSafeIntent)||has(text,safePurpose))&&!has(text,illegalAfterSafeWord)&&!has(text,crimeOperationalIntent);
  }
  function isBenignHarmContext(text){
    return has(text,benignHarmFrame)&&!has(text,[/\b(matar|asesinar|herir|danar|envenenar|incendiar|robar|asaltar)\b/]);
  }

  function summarizeReason(reason){
    const map={
      evasion:'intención explícita de evadir bloqueos, filtros o moderación',
      sexualMinors:'intención sexual explícita vinculada a menores',
      crime:'intención explícita de delito o ayuda para cometerlo',
      fraud:'intención explícita de fraude, engaño o robo de datos',
      harm:'intención explícita de daño operativo',
      cyberAbuse:'intención explícita de abuso informático',
      ambiguousAdult:'pedido sexual/adulto ambiguo sin encuadre profesional seguro'
    };
    return map[reason]||'intención no permitida';
  }

  function analyzeModeRequest(input){
    const text=normalizeInput(String(input||'').trim());
    const minors=has(text,minorTerms);
    const sexual=has(text,sexualTerms);
    const strongSexualMinor=sexual&&minors&&has(text,strongSexualMinorTerms);

    if(count(text,evasionIntent)>0&&count(text,moderationTarget)>0)return block('evasion');

    if(has(text,exploitativeSexualMinorOperational))return block('sexualMinors');
    if(has(text,sexualMinorOperational)&&!isProfessionalSexualContext(text))return block('sexualMinors');
    if(strongSexualMinor&&!isProfessionalSexualContext(text))return block('sexualMinors');
    if(sexual&&minors&&has(text,evasionIntent))return block('sexualMinors');

    if(has(text,harmfulOperationalIntent)&&!isBenignHarmContext(text))return block('harm');

    if(has(text,cyberOperationalIntent)&&!isSafeCyberContext(text))return block('cyberAbuse');
    if(has(text,cyberAbuseTerms)&&has(text,[/\b(quiero|necesito|crear|generar|programar|disenar|facilitar|instalar|tumbar)\b/])&&!isSafeCyberContext(text))return block('cyberAbuse');

    if(has(text,illegalAfterSafeWord))return block('crime');
    if(has(text,crimeOperationalIntent)&&!isSafeCrimeContext(text))return block('crime');

    if(has(text,adultAmbiguousTerms)&&!isProfessionalSexualContext(text)&&has(text,generalModeOnly)){
      return clarify('ambiguousAdult');
    }

    return {status:'allow',reason:'',label:'Permitido'};
  }

  function block(reason){
    return {
      status:'block',
      reason,
      label:'Bloqueado',
      message:'No se puede generar un modo orientado a '+summarizeReason(reason)+'. Reformulá el pedido como un modo profesional seguro, legal, preventivo o educativo.'
    };
  }

  function clarify(reason){
    return {
      status:'clarify',
      reason,
      label:'Reformular',
      message:'El pedido de modo quedó ambiguo. Reformulalo como un modo profesional seguro, sin evasión de controles ni contenido sexual riesgoso.'
    };
  }

  function auditDetails(result,input){
    return {
      status:result.status,
      reason:result.reason||'',
      contextCharacters:String(input||'').length
    };
  }

  window.CentroSafety={MAX_CONTEXT_CHARS,analyzeModeRequest,auditDetails};
})();
