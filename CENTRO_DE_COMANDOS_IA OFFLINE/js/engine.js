(()=>{'use strict';
  const data=window.CentroComandosData;
  if(!data)throw new Error('El catálogo debe cargarse antes que el motor.');

  const MAX_SELECTION=5;
  const RECOMMENDATION_LIMIT=12;
  const PROFILES=[
    {id:'tech',label:'Software y sistemas',modeName:'DESARROLLO Y AUDITORÍA INTEGRAL',role:'desarrollador senior, arquitecto de software y auditor técnico',scope:'construcción, revisión, diagnóstico, corrección y verificación de sistemas de software',patterns:[/software/,/micro ?app/,/aplicaci[oó]n/,/sistema/,/c[oó]digo/,/program/,/auditor/,/error/,/falla/,/offline/,/html/,/javascript/],recommendations:['architecture','codereview','rootcause','regression','final-audit']},
    {id:'video',label:'Audiovisual, video y producción',modeName:'DIRECCIÓN Y POSTPRODUCCIÓN AUDIOVISUAL',role:'director audiovisual senior y supervisor de postproducción',scope:'dirección, revisión, planificación y control de calidad de trabajos audiovisuales posteriores',patterns:[/video/,/audiovisual/,/pel[ií]cula/,/corto/,/largometraje/,/documental/,/comercial/,/postproducci[oó]n/,/edici[oó]n/,/montaje/,/vfx/,/motion/],recommendations:['video-director','video-postproduction','video-editing','sound-design','video-qc']},
    {id:'image',label:'Imagen, diseño visual y branding',modeName:'DIRECCIÓN DE ARTE Y DISEÑO VISUAL',role:'director de arte senior y especialista en identidad visual',scope:'dirección, revisión y control profesional de trabajos visuales, diseño de marca e imagen',patterns:[/imagen/,/dise[nñ]o/,/marca/,/branding/,/logo/,/paleta/,/tipograf/,/composici[oó]n/,/retoque/,/packaging/,/visual/],recommendations:['art-direction','brand-system','visual-design','composition-control','visual-qc']},
    {id:'audio',label:'Audio, música y voz',modeName:'PRODUCCIÓN DE AUDIO, MÚSICA Y VOZ',role:'productor de audio senior y supervisor de voz, música y mezcla',scope:'dirección, revisión y control de calidad de trabajos sonoros posteriores',patterns:[/audio/,/sonido/,/m[uú]sica/,/voz/,/locuci[oó]n/,/podcast/,/mezcla/,/loudness/],recommendations:['audio-production','sound-design','music-supervision','voice-direction','sound-qc']},
    {id:'product',label:'Producto y experiencia de usuario',modeName:'PRODUCTO Y EXPERIENCIA DE USUARIO',role:'product strategist senior y auditor de experiencia de usuario',scope:'descubrimiento, diseño, revisión y mejora de productos y flujos de usuario',patterns:[/producto/,/ux/,/usuario/,/experiencia/,/flujo/,/prototipo/,/fricci[oó]n/,/usabilidad/,/interfaz/],recommendations:['product-discovery','jtbd','ux-audit','user-flow','friction-map']},
    {id:'ai',label:'Datos, IA y automatización',modeName:'DISEÑO DE IA, AGENTES Y AUTOMATIZACIÓN',role:'arquitecto senior de sistemas IA, agentes y automatización',scope:'diseño, auditoría, evaluación y control de flujos con IA generativa, datos y agentes',patterns:[/agente/,/agentes/,/rag/,/automatiz/,/pipeline/,/modelo/,/guardrail/,/workflow/,/ia generativa/,/datos/],recommendations:['agent-design','rag-design','model-evaluation','guardrail-evaluation','ai-observability']},
    {id:'legal',label:'Legal, compliance y gobernanza',modeName:'COMPLIANCE, GOBERNANZA Y CONTROL DE RIESGOS',role:'especialista senior en compliance operativo, privacidad y gobernanza de IA',scope:'revisión, prevención y control de riesgos normativos, datos, políticas y trazabilidad',patterns:[/legal/,/compliance/,/gobernanza/,/privacidad/,/contrato/,/pol[ií]tica/,/regulado/,/normativa/,/datos personales/],recommendations:['content-compliance','privacy-governance','ai-governance','traceability-control','final-audit']},
    {id:'content',label:'Contenido y comunicación digital',modeName:'ESTRATEGIA DE CONTENIDO PROFESIONAL',role:'estratega senior de contenido y comunicación digital',scope:'planificación, adaptación y control de calidad de contenidos posteriores sin ejecutar piezas durante la activación',patterns:[/instagram/,/redes?/,/contenido/,/reel/,/tiktok/,/shorts/,/carrusel/,/publicaci[oó]n/,/marketing/,/copy/,/campaign/,/campa[nñ]a/],recommendations:['content','hook','audience','pareto','final-audit']},
    {id:'research',label:'Investigación y verificación',modeName:'INVESTIGACIÓN Y VERIFICACIÓN PROFESIONAL',role:'investigador senior orientado a evidencia, trazabilidad y control de incertidumbre',scope:'investigación, contraste de fuentes, validación de afirmaciones y síntesis verificable',patterns:[/investig/,/fuentes?/,/evidencia/,/verific/,/estudio/,/bibliograf/,/datos actuales/],recommendations:['research','sources','factcheck','methodology','uncertainty']},
    {id:'write',label:'Escritura y comunicación',modeName:'REDACCIÓN Y EDICIÓN PROFESIONAL',role:'editor y redactor senior especializado en claridad, estructura y fidelidad',scope:'redacción, edición, reescritura y preparación de comunicaciones profesionales',patterns:[/redact/,/escri/,/texto/,/correo/,/documento/,/informe/,/comunicaci[oó]n/],recommendations:['editor','human','professional','consistency','polish']},
    {id:'analyze',label:'Análisis y decisiones',modeName:'ANÁLISIS Y DECISIÓN ESTRUCTURADA',role:'analista senior de problemas, riesgos y toma de decisiones',scope:'análisis causal, comparación, priorización y formulación de recomendaciones',patterns:[/analiz/,/decid/,/compar/,/riesgo/,/problema/,/estrateg/,/prioriz/],recommendations:['analyst','rootcause','risks','pareto','objective-dialogue']},
    {id:'learn',label:'Aprendizaje y explicación',modeName:'DOCENCIA Y EXPLICACIÓN PROFESIONAL',role:'docente especialista en aprendizaje progresivo y claridad conceptual',scope:'explicación, enseñanza, adaptación de complejidad y comprobación de comprensión',patterns:[/aprend/,/explic/,/ense[nñ]/,/estudi/,/clase/,/comprender/,/entender/,/matem[aá]tic/,/c[aá]lculo/,/regla de tres/],recommendations:['teacher','simplify','examples','feynman','final-audit']},
    {id:'generic',label:'Trabajo profesional general',modeName:'ASISTENCIA PROFESIONAL INTEGRAL',role:'especialista senior en análisis y ejecución estructurada',scope:'resolución profesional de tareas futuras dentro del ámbito que indique el usuario',patterns:[],recommendations:['expert','objective-dialogue','corrective-collaboration','consistency','final-audit']}
  ];


  const PROFILE_CONTEXT_SIGNALS={
    tech:{strong:[/\b(programar|programaci[oó]n|desarrollar|desarrollo|depurar|debug|refactor|arquitectura de software|base de datos|frontend|backend|api|pwa)\b/,/\b(html|css|javascript|typescript|python|java|c#|php|sql)\b/],negative:[/\b(programa de (televisi[oó]n|tv|radio)|programaci[oó]n televisiva)\b/]},
    video:{strong:[/\b(programa de (televisi[oó]n|tv)|rodaje|filmaci[oó]n|c[aá]mara|timeline|colorizaci[oó]n|storyboard)\b/]},
    image:{strong:[/\b(identidad visual|direcci[oó]n de arte|dise[nñ]o gr[aá]fico|sistema de marca|manual de marca|fotograf[ií]a|imagen generativa)\b/]},
    audio:{strong:[/\b(producci[oó]n musical|dise[nñ]o sonoro|edici[oó]n de audio|mastering|masterizaci[oó]n|locuci[oó]n|voice[- ]?over)\b/]},
    product:{strong:[/\b(product discovery|investigaci[oó]n de usuarios?|journey|jobs? to be done|propuesta de valor|m[eé]tricas? de producto)\b/]},
    ai:{strong:[/\b(inteligencia artificial|machine learning|llm|modelo de lenguaje|agente de ia|embeddings?|vectorial|fine[- ]?tuning)\b/]},
    legal:{strong:[/\b(derecho|jur[ií]dico|abogad[oa]|jurisprudencia|expediente judicial|protecci[oó]n de datos|cumplimiento normativo)\b/]},
    content:{strong:[/\b(estrategia de contenido|redes sociales|social media|calendario editorial|creative testing|anuncio|publicidad digital)\b/]},
    research:{strong:[/\b(revisi[oó]n bibliogr[aá]fica|estado del arte|paper|papers|fuentes primarias|evidencia cient[ií]fica|metodolog[ií]a de investigaci[oó]n)\b/]},
    write:{strong:[/\b(redacci[oó]n|reescritura|correcci[oó]n de estilo|edici[oó]n de texto|copywriting|documentaci[oó]n escrita)\b/]},
    analyze:{strong:[/\b(an[aá]lisis causal|toma de decisiones|matriz de riesgos?|escenarios?|trade[- ]?offs?|priorizaci[oó]n)\b/]},
    learn:{strong:[/\b(ense[nñ]anza|aprendizaje|did[aá]ctica|pedagog[ií]a|tutor[ií]a|explicaci[oó]n paso a paso)\b/]}
  };

  const PRESETS=[
    {id:'software',title:'Desarrollo integral de software',description:'Construcción, arquitectura, diagnóstico, regresión y auditoría final.',profile:'tech',modeName:'DESARROLLO Y AUDITORÍA INTEGRAL',aliases:['architecture','codereview','rootcause','regression','final-audit']},
    {id:'repair',title:'Corrección segura de sistemas',description:'Localiza causas, corrige de raíz y protege el comportamiento existente.',profile:'tech',modeName:'DIAGNÓSTICO Y CORRECCIÓN SEGURA',aliases:['debug','rootcause','codereview','regression','consistency']},
    {id:'research',title:'Investigación verificable',description:'Investiga con fuentes, contraste, metodología e incertidumbre visible.',profile:'research',modeName:'INVESTIGACIÓN Y VERIFICACIÓN PROFESIONAL',aliases:['research','sources','factcheck','methodology','uncertainty']},
    {id:'content',title:'Contenido profesional',description:'Estrategia, claridad, atención, priorización y revisión final.',profile:'content',modeName:'ESTRATEGIA DE CONTENIDO PROFESIONAL',aliases:['content','hook','audience','pareto','final-audit']},
    {id:'video-general',title:'Dirección y postproducción de video',description:'Modo audiovisual general para videos, comerciales, documentales o piezas largas sin limitarse a redes.',profile:'video',modeName:'DIRECCIÓN Y POSTPRODUCCIÓN AUDIOVISUAL',aliases:['video-director','video-postproduction','video-editing','sound-design','video-qc']},
    {id:'video-generative',title:'Pipeline de video generativo',description:'Controla procesos texto-imagen-video, consistencia visual y validación final.',profile:'video',modeName:'PIPELINE DE VIDEO GENERATIVO',aliases:['generative-video-pipeline','visual-storytelling','continuity-video','sound-design','video-qc']},
    {id:'visual-brand',title:'Dirección de arte y marca',description:'Activa criterio visual, composición, sistema de marca y auditoría final.',profile:'image',modeName:'DIRECCIÓN DE ARTE Y DISEÑO DE MARCA',aliases:['art-direction','brand-system','composition-control','color-system','visual-qc']},
    {id:'performance-marketing',title:'Publicidad performance y creative testing',description:'Modo para analizar anuncios, hipótesis, variantes y control publicitario.',profile:'content',modeName:'PUBLICIDAD PERFORMANCE Y CREATIVE TESTING',aliases:['performance-creative','creative-testing','ad-brief','offer-angle','ad-compliance']},
    {id:'product-ux',title:'Producto y UX',description:'Detecta problemas reales, fricción, flujos y criterios de mejora.',profile:'product',modeName:'PRODUCTO Y EXPERIENCIA DE USUARIO',aliases:['product-discovery','jtbd','ux-audit','user-flow','friction-map']},
    {id:'agents-ai',title:'IA, agentes y automatización',description:'Diseña agentes, RAG, evaluación, guardrails y observabilidad.',profile:'ai',modeName:'DISEÑO DE IA, AGENTES Y AUTOMATIZACIÓN',aliases:['agent-design','rag-design','model-evaluation','guardrail-evaluation','ai-observability']},
    {id:'compliance-ai',title:'Compliance y gobernanza IA',description:'Controla privacidad, trazabilidad, políticas y riesgos regulados.',profile:'legal',modeName:'COMPLIANCE, GOBERNANZA Y CONTROL DE RIESGOS',aliases:['content-compliance','privacy-governance','ai-governance','traceability-control','regulated-claims']},
    {id:'decisions',title:'Análisis y decisiones',description:'Analiza causas, riesgos y opciones antes de recomendar.',profile:'analyze',modeName:'ANÁLISIS Y DECISIÓN ESTRUCTURADA',aliases:['analyst','rootcause','risks','pareto','critic']},
    {id:'teaching',title:'Explicación y aprendizaje',description:'Explica con claridad, ejemplos, adaptación y comprobación.',profile:'learn',modeName:'DOCENCIA Y EXPLICACIÓN PROFESIONAL',aliases:['teacher','simplify','examples','feynman','final-audit']},
    {id:'objective-work',title:'Trabajo objetivo y correctivo',description:'Analiza sin aprobación automática, señala problemas reales y verifica las correcciones.',profile:'analyze',modeName:'TRABAJO OBJETIVO Y CORRECTIVO',aliases:['objective-dialogue','corrective-collaboration','rootcause','consistency','final-audit']}
  ];

  const PROFILE_OUTPUTS={
    tech:new Set(['report','table','json','jsonschema','csv','yaml','markdown','outline','schema','classification','transform','checklist','template','matrix']),
    video:new Set(['markdown','outline','checklist','table','template','report']),
    image:new Set(['markdown','outline','checklist','table','template','report']),
    audio:new Set(['markdown','outline','checklist','table','template','report']),
    product:new Set(['report','executive-summary','matrix','table','markdown','outline','checklist','template']),
    ai:new Set(['report','table','json','jsonschema','csv','yaml','markdown','outline','schema','classification','transform','checklist','template','matrix']),
    legal:new Set(['report','executive-summary','markdown','outline','checklist','table','template']),
    content:new Set(['markdown','outline','checklist','table','template']),
    research:new Set(['report','executive-summary','matrix','timeline','source-matrix','table','markdown','outline','checklist']),
    write:new Set(['report','executive-summary','markdown','outline','checklist','template']),
    analyze:new Set(['report','executive-summary','matrix','timeline','table','markdown','outline','checklist']),
    learn:new Set(['markdown','outline','table','checklist','template','mindmap']),
    generic:null
  };

  const DOMAIN_SUPPORT={
    tech:new Set(['tech','quality','analysis','data','planning','research','ai','product','universal']),
    video:new Set(['video','audio','image','creative','social','analysis','quality','planning','research','universal']),
    image:new Set(['image','video','audio','creative','social','writing','business','quality','product','universal']),
    audio:new Set(['audio','video','image','creative','social','quality','universal']),
    product:new Set(['product','analysis','business','planning','tech','ai','quality','writing','research','universal']),
    ai:new Set(['ai','tech','data','quality','analysis','planning','research','product','legal','universal']),
    legal:new Set(['legal','quality','analysis','research','business','writing','ai','universal']),
    quality:new Set(['quality','tech','analysis','research','data','planning','video','image','audio','product','ai','legal','universal']),
    social:new Set(['social','creative','writing','analysis','business','quality','video','image','audio','legal','universal']),
    creative:new Set(['creative','social','writing','business','analysis','video','image','audio','universal']),
    writing:new Set(['writing','social','research','analysis','learning','business','quality','creative','image','product','legal','universal']),
    research:new Set(['research','analysis','writing','quality','learning','tech','data','video','product','ai','legal','universal']),
    analysis:new Set(['analysis','business','research','planning','quality','tech','data','writing','video','product','ai','legal','universal']),
    business:new Set(['business','analysis','planning','research','writing','social','quality','image','product','legal','universal']),
    learning:new Set(['learning','writing','research','creative','analysis','quality','video','universal']),
    planning:new Set(['planning','analysis','business','quality','tech','data','video','product','ai','universal']),
    data:new Set(['data','tech','analysis','research','quality','planning','ai','universal']),
    universal:new Set(['tech','quality','social','creative','writing','research','analysis','business','learning','planning','data','video','image','audio','product','ai','legal','universal'])
  };
  const EXCLUSIVE_GROUPS=[
    {aliases:['brief','detailed'],reason:'Respuesta mínima y explicación completa establecen niveles de profundidad opuestos.'},
    {aliases:['professional','casual'],reason:'Tono profesional y tono conversacional definen registros incompatibles.'},
    {aliases:['instagram','linkedin','youtube'],reason:'Para evitar prioridades de canal contradictorias, activá una plataforma por modo.'},
    {aliases:['json','jsonschema','csv','yaml','markdown','table','report','executive-summary','matrix','timeline','source-matrix','mindmap','outline','schema','classification','transform','checklist','template'],reason:'Sólo puede activarse un formato de respuesta por modo.'}
  ];
  const OVERLAP_PAIRS=[
    ['objective-corrective-review','objective-dialogue'],
    ['objective-corrective-review','corrective-collaboration'],
    ['objective-corrective-review','rootcause'],
    ['objective-corrective-review','critic'],
    ['objective-corrective-review','consistency']
  ];
  const GROUP_LABELS={primary:'Capacidad central',context:'Especialización',modifier:'Método complementario',output:'Presentación futura',control:'Control de calidad'};
  const CATEGORY_PROFILE_MAP={
    'Escritura y comunicación':'write',
    'Análisis y decisiones':'analyze',
    'Estrategia y negocio':'analyze',
    'Marketing y contenido':'content',
    'Aprendizaje y educación':'learn',
    'Investigación y verificación':'research',
    'Creatividad e innovación':'content',
    'Desarrollo y tecnología':'tech',
    'Datos y formatos':'ai',
    'Productividad y planificación':'analyze',
    'Seguridad y control de calidad':'tech',
    'Audiovisual, video y producción':'video',
    'Imagen, diseño visual y branding':'image',
    'Audio, música y voz':'audio',
    'Producto y experiencia de usuario':'product',
    'Datos, IA y automatización':'ai',
    'Legal, compliance y gobernanza':'legal'
  };
  const ALIAS_PROFILE_MAP={
    teacher:'learn',
    learn:'learn',
    feynman:'learn',
    examples:'learn',
    'lesson-plan':'learn',
    quiz:'learn',
    mentor:'learn',
    coach:'learn',
    socratic:'learn',
    analogy:'learn',
    'art-direction':'image',
    'brand-system':'image',
    'visual-design':'image',
    'composition-control':'image',
    'typography-control':'image',
    'color-system':'image',
    'visual-qc':'image',
    'video-director':'video',
    'video-postproduction':'video',
    'video-editing':'video',
    'video-qc':'video',
    'sound-design':'video',
    'audio-production':'audio',
    'audio-mix':'audio',
    'voice-casting':'audio',
    'sound-qc':'audio',
    'agent-design':'ai',
    'rag-design':'ai',
    'model-evaluation':'ai',
    'guardrail-evaluation':'ai',
    'privacy-governance':'legal',
    'ai-governance':'legal',
    'content-compliance':'legal'
  };
  const PROFILE_FILL_DOMAINS={
    tech:['tech','quality','data','ai','product','analysis','planning'],
    video:['video','audio','image','creative','quality','planning','research'],
    image:['image','creative','quality','product','writing','video'],
    audio:['audio','video','creative','quality'],
    product:['product','analysis','business','tech','ai','quality','research'],
    ai:['ai','tech','data','quality','analysis','product','legal'],
    legal:['legal','quality','research','analysis','writing','ai'],
    content:['social','business','creative','writing','analysis','quality','video','image'],
    research:['research','analysis','quality','writing','data','tech'],
    write:['writing','quality','research','creative','analysis','business'],
    analyze:['analysis','business','quality','research','planning','tech','product'],
    learn:['learning','writing','research','quality','creative']
  };
  const PROFILE_PRIORITY=['write','content','learn','research','analyze','tech','ai','legal','product','video','image','audio','generic'];
  const PROFILE_RANK=new Map(PROFILE_PRIORITY.map((id,index)=>[id,index]));
  const KIND_RANK={primary:0,context:1,modifier:2,output:3,control:4};

  function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function byProfile(id){return PROFILES.find(profile=>profile.id===id)||PROFILES[PROFILES.length-1];}
  function profileContextScore(profile,text){
    const signals=PROFILE_CONTEXT_SIGNALS[profile.id]||{};
    let score=profile.patterns.reduce((sum,pattern)=>sum+(pattern.test(text)?2:0),0);
    (signals.strong||[]).forEach(pattern=>{if(pattern.test(text))score+=5;});
    (signals.negative||[]).forEach(pattern=>{if(pattern.test(text))score-=6;});
    return Math.max(0,score);
  }
  function analyze(context,forcedProfile){
    if(PROFILES.some(profile=>profile.id===forcedProfile))return byProfile(forcedProfile);
    const text=normalize(context);let best=byProfile('generic'),bestScore=0;
    PROFILES.slice(0,-1).forEach(profile=>{
      const score=profileContextScore(profile,text);
      if(score>bestScore||(score&&score===bestScore&&(PROFILE_RANK.get(profile.id)??999)<(PROFILE_RANK.get(best.id)??999))){
        best=profile;bestScore=score;
      }
    });
    return best;
  }
  function allCommands(){return data.builtIns;}
  function conflictFor(candidate,selected){
    for(const group of EXCLUSIVE_GROUPS){
      if(!group.aliases.includes(candidate.alias))continue;
      const active=selected.find(command=>group.aliases.includes(command.alias));
      if(active)return {active,reason:group.reason};
    }
    return null;
  }
  function domainsCompatible(a,b){
    if(a==='universal'||b==='universal'||a===b)return true;
    return Boolean((DOMAIN_SUPPORT[a]&&DOMAIN_SUPPORT[a].has(b))&&(DOMAIN_SUPPORT[b]&&DOMAIN_SUPPORT[b].has(a)));
  }
  function overlapping(candidate,selected){
    const pair=OVERLAP_PAIRS.find(([a,b])=>(candidate.alias===a&&selected.some(command=>command.alias===b))||(candidate.alias===b&&selected.some(command=>command.alias===a)));
    if(!pair)return null;
    const other=selected.find(command=>pair.includes(command.alias));
    return other&&other.alias!==candidate.alias?other:null;
  }
  function profileFromCommand(command){
    if(!command)return byProfile('generic');
    const explicit=ALIAS_PROFILE_MAP[command.alias];
    if(explicit)return byProfile(explicit);
    const categoryProfile=CATEGORY_PROFILE_MAP[command.category];
    if(categoryProfile)return byProfile(categoryProfile);
    return profileFromDomain(command.domain);
  }
  function effectiveProfile(profile,selected){
    if(profile&&profile.id!=='generic')return profile;
    if(!selected.length)return byProfile('generic');
    if(selected.every(command=>command.kind==='output'))return byProfile('generic');
    const profileItems=selected.filter(command=>command.kind!=='output');
    const scores=new Map();
    profileItems.forEach(command=>{
      const inferred=profileFromCommand(command);
      if(inferred.id==='generic')return;
      const weight=command.kind==='primary'||command.kind==='context'?3:command.kind==='control'?2:1;
      scores.set(inferred.id,(scores.get(inferred.id)||0)+weight);
    });
    if(scores.size){
      const [id]=[...scores.entries()].sort((a,b)=>b[1]-a[1]||(PROFILE_RANK.get(a[0])??999)-(PROFILE_RANK.get(b[0])??999))[0];
      return byProfile(id);
    }
    const anchor=[...selected].sort((a,b)=>String(a.alias).localeCompare(String(b.alias),'es')).find(command=>(command.domain||'universal')!=='universal');
    return anchor?profileFromDomain(anchor.domain):byProfile('generic');
  }
  function validateSelectionSet(selection,profile,options){
    const selected=(selection||[]).filter(Boolean);
    const final=Boolean(options&&options.final);
    if(!selected.length)return {ok:false,reason:'Elegí al menos una capacidad.',profile:effectiveProfile(profile,[])};
    if(selected.length>MAX_SELECTION)return {ok:false,reason:`Podés combinar hasta ${MAX_SELECTION} comandos. Quitá uno antes de agregar otro.`,profile:effectiveProfile(profile,selected)};
    const seen=new Set();
    for(const command of selected){
      if(seen.has(command.id))return {ok:false,reason:`${command.title} ya está seleccionado.`,profile:effectiveProfile(profile,selected)};
      seen.add(command.id);
    }
    const canonical=[...selected].sort((a,b)=>String(a.alias).localeCompare(String(b.alias),'es'));
    for(const command of canonical){
      const before=canonical.filter(item=>item.id!==command.id);
      const conflict=conflictFor(command,before);
      if(conflict)return {ok:false,reason:`${command.title} se superpone con ${conflict.active.title}. ${conflict.reason}`,profile:effectiveProfile(profile,selected)};
      const overlap=overlapping(command,before);
      if(overlap)return {ok:false,reason:`${command.title} y ${overlap.title} repiten funciones internas. Elegí uno de los dos.`,profile:effectiveProfile(profile,selected)};
    }
    for(let i=0;i<canonical.length;i++){
      for(let j=i+1;j<canonical.length;j++){
        const a=canonical[i],b=canonical[j];
        if(!domainsCompatible(a.domain||'universal',b.domain||'universal'))return {ok:false,reason:`${a.title} y ${b.title} pertenecen a modos de trabajo que pueden dar instrucciones contradictorias.`,profile:effectiveProfile(profile,selected)};
      }
    }
    if(profile&&profile.id!=='generic'){
      const domain=profileDomain(profile);
      const mismatch=canonical.find(command=>domain&&!domainsCompatible(command.domain||'universal',domain));
      if(mismatch)return {ok:false,reason:`${mismatch.title} no es compatible con el contexto ${profile.label}.`,profile:effectiveProfile(profile,selected)};
    }
    const activeProfile=effectiveProfile(profile,canonical),allowed=PROFILE_OUTPUTS[activeProfile.id];
    if(final&&allowed){
      const outputIssue=canonical.find(command=>command.kind==='output'&&!allowed.has(command.alias));
      if(outputIssue)return {ok:false,reason:`${outputIssue.title} no es una presentación coherente para el perfil ${activeProfile.label}.`,profile:activeProfile};
    }
    return {ok:true,reason:'',profile:activeProfile};
  }
  function compatibility(candidate,selected,profile){
    if(!candidate)return {ok:false,reason:'El comando no existe.'};
    if(selected.some(command=>command.id===candidate.id))return {ok:true,reason:''};
    return validateSelectionSet([...selected,candidate],profile,{final:false});
  }
  function profileDomain(profile){
    return {tech:'tech',video:'video',image:'image',audio:'audio',product:'product',ai:'ai',legal:'legal',content:'social',research:'research',write:'writing',analyze:'analysis',learn:'learning'}[profile?.id];
  }
  function recommendedCandidateFits(candidate,profile){
    if(!candidate)return false;
    const domain=profileDomain(profile);
    if(domain&&!domainsCompatible(candidate.domain||'universal',domain))return false;
    if(candidate.kind==='output'){
      const allowed=PROFILE_OUTPUTS[profile?.id||'generic'];
      if(allowed&&!allowed.has(candidate.alias))return false;
    }
    return true;
  }
  function recommendations(context,profileId,commands){
    const profile=analyze(context,profileId),chosen=[];
    const domain=profileDomain(profile);
    const add=alias=>{
      const command=commands.find(item=>item.alias===alias);
      if(command&&!chosen.some(item=>item.alias===command.alias)&&recommendedCandidateFits(command,profile))chosen.push(command);
    };
    const text=normalize(context);
    Object.entries(data.KEYWORD_COMMANDS||{}).forEach(([word,aliases])=>{
      if(text.includes(normalize(word)))aliases.forEach(add);
    });
    profile.recommendations.forEach(add);
    const fill=predicate=>commands.forEach(command=>{
      if(chosen.length<RECOMMENDATION_LIMIT&&predicate(command)&&recommendedCandidateFits(command,profile)&&!chosen.some(item=>item.alias===command.alias))chosen.push(command);
    });
    (PROFILE_FILL_DOMAINS[profile.id]||[domain]).filter(Boolean).forEach(itemDomain=>fill(command=>command.domain===itemDomain));
    fill(command=>(command.domain||'universal')!=='universal');
    byProfile('generic').recommendations.forEach(add);
    fill(()=>true);
    return {profile,commands:chosen.slice(0,RECOMMENDATION_LIMIT)};
  }
  function resolvePreset(id,commands){
    const preset=PRESETS.find(item=>item.id===id);if(!preset)return {ok:false,reason:'La combinación preparada no existe.'};
    const profile=byProfile(preset.profile),selected=[];
    for(const alias of preset.aliases){
      const command=commands.find(item=>item.alias===alias);
      if(!command)return {ok:false,reason:`Falta el comando /${alias}.`};
      const check=compatibility(command,selected,profile);
      if(!check.ok)return {ok:false,reason:`La combinación no pudo cargarse: ${check.reason}`};
      selected.push(command);
    }
    return {ok:true,preset,profile,commands:selected};
  }
  function profileMismatch(context,targetProfileId){
    if(!String(context||'').trim())return null;
    const interpreted=analyze(context,''),target=byProfile(targetProfileId);
    if(interpreted.id==='generic'||target.id==='generic'||interpreted.id===target.id)return null;
    return {interpreted,target,message:`El contexto parece corresponder a ${interpreted.label}, pero esta combinación activa ${target.label}.`};
  }
  function commandGroups(selected){
    return ['primary','context','modifier','output','control'].map(kind=>({kind,label:GROUP_LABELS[kind],items:selected.filter(command=>command.kind===kind)})).filter(group=>group.items.length);
  }
  function modeName(draft,selected,profile){
    const custom=String(draft.modeName||'').trim();if(custom)return normalizeHeading(custom);
    const preset=PRESETS.find(item=>item.id===draft.presetId);if(preset)return preset.modeName;
    if(selected.length===1)return normalizeHeading(selected[0].title);
    return profile.modeName;
  }
  function normalizeHeading(value){return String(value||'').trim().replace(/\s+/g,' ').toLocaleUpperCase('es-AR').slice(0,100);}
  function sanitizeText(text){
    return String(text||'')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,' ')
      .replace(/```+/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }
  function cleanDirective(text){return sanitizeText(text).slice(0,900);}
  function activationReply(name,selected){return `“Modo ${titleCase(name)} activado correctamente. Capacidades activas: ${selected.map(command=>command.title).join(', ')}. Quedo listo para recibir la primera tarea.”`;}
  function titleCase(value){
    const acronyms=new Set(['ia','api','ux','ui','rag','vfx','pdf','json','csv','yaml','seo','sre','pwa','bat']);
    const connectors=new Set(['y','e','o','u','de','del','la','las','el','los','para','en']);
    return String(value||'').toLocaleLowerCase('es-AR').split(/\s+/).filter(Boolean).map((word,index)=>{
      if(acronyms.has(word))return word.toLocaleUpperCase('es-AR');
      return index>0&&connectors.has(word)?word:word.charAt(0).toLocaleUpperCase('es-AR')+word.slice(1);
    }).join(' ');
  }
  function compile(draft,selected){
    const baseProfile=analyze(draft.contextDescription||draft.task,draft.profileId||draft.intentId);
    if(!selected.length)return {command:'',profile:baseProfile,name:'',error:'Elegí al menos un comando para crear el modo de activación.'};
    const validation=validateSelectionSet(selected,baseProfile,{final:true});
    const profile=validation.profile||effectiveProfile(baseProfile,selected),name=modeName(draft,selected,profile);
    if(!validation.ok)return {command:'',profile,name,error:validation.reason};
    const ordered=[...selected].sort((a,b)=>(KIND_RANK[a.kind]??9)-(KIND_RANK[b.kind]??9)||String(a.alias).localeCompare(String(b.alias),'es'));
    const sections=[];
    sections.push(`# COMANDO DE ACTIVACIÓN — MODO ${name}`);
    sections.push(`## NATURALEZA DE ESTE COMANDO\nEsta instrucción configura un modo profesional de trabajo persistente. No es una tarea para ejecutar ni un pedido de contenido. Al recibirla, activá el modo, confirmalo y esperá la primera indicación posterior del usuario.`);
    sections.push(`## IDENTIDAD OPERATIVA\nA partir de este momento, actuá como ${profile.role}. Aplicá este perfil en ${profile.scope}. Mantené el modo activo durante toda la conversación hasta que el usuario indique expresamente que debe finalizarse o ser reemplazado.\n\nTu trabajo al recibir este comando es configurar conducta profesional persistente. No transformes este modo en una tarea, entrega, pieza de contenido, estrategia, guion, informe, producto ni desarrollo.`);
    sections.push('## CAPACIDADES ACTIVADAS\n'+ordered.map((command,index)=>`${index+1}. **${cleanDirective(command.title)}:** ${cleanDirective(command.description)}`).join('\n'));
    const hierarchy=commandGroups(ordered).map(group=>`- **${group.label}:** ${group.items.map(command=>command.title).join(', ')}.`);
    sections.push('## JERARQUÍA DE APLICACIÓN\nUsá las capacidades como un sistema integrado, no como instrucciones aisladas. Aplicá primero la capacidad central y la especialización; después los métodos complementarios, la presentación y los controles.\n'+hierarchy.join('\n'));
    sections.push('## DIRECTIVAS PROFESIONALES PERMANENTES\nEstas directivas sólo se aplican después de que el usuario entregue una tarea posterior compatible. No las ejecutes durante la activación del modo:\n'+ordered.map((command,index)=>`${index+1}. **${cleanDirective(command.title)}:** ${cleanDirective(command.task)}`).join('\n'));
    const categoryRules=[...new Set(ordered.map(command=>command.category))]
      .map(category=>data.CATEGORY_RULES[category]?[category,data.CATEGORY_RULES[category]]:null)
      .filter(Boolean);
    if(categoryRules.length){
      sections.push('## REGLAS PROFESIONALES DEL ÁREA\nEstas reglas sólo orientan tareas posteriores compatibles. No las ejecutes durante la activación del modo:\n'+categoryRules.map(([category,rule])=>`- **${cleanDirective(category)}:** ${cleanDirective(rule)}`).join('\n'));
    }
    const protocol=[
      'Comprendé el contexto, el objetivo real y el estado del trabajo antes de actuar.',
      'Mantené un intercambio claro y fluido; pedí únicamente la información que resulte indispensable para la tarea posterior.',
      'Diferenciá hechos comprobados, inferencias, supuestos y datos todavía no verificados.',
      'Detectá contradicciones entre instrucciones y resolvelas priorizando la seguridad, el objetivo del usuario y la preservación del trabajo válido.',
      'No inventes archivos, fuentes, pruebas, resultados, accesos ni acciones que no hayan ocurrido.',
      'No sustituyas un diagnóstico de causa por un parche superficial cuando el problema requiera una solución estructural.',
      'Antes de considerar terminada una tarea posterior, verificá coherencia, completitud, riesgos y posibles regresiones.'
    ];
    sections.push('## PROTOCOLO DE TRABAJO\n'+protocol.map(item=>'- '+item).join('\n'));
    sections.push(`## REGLA ÉTICA Y DE NO EVASIÓN\n- Este modo no autoriza a vulnerar leyes, políticas, filtros, moderación, controles de seguridad ni derechos de terceros.\n- Si una tarea posterior pide evadir bloqueos, facilitar daño, fraude, abuso, explotación sexual o contenido sexual vinculado a menores, rechazá esa parte y redirigí a un uso legal, preventivo, educativo o profesional seguro.\n- Los casos sensibles legítimos, como trabajo legal, médico, forense, educativo, preventivo o de asistencia a víctimas, deben tratarse con cuidado, precisión y sin morbo.`);
    sections.push(`## CONTROL DE PUREZA DEL MODO\n- Este comando configura una conducta profesional persistente, no una tarea inmediata.\n- No conviertas el contexto orientativo en tema, encargo, contenido, estrategia, guion, informe, producto ni desarrollo.\n- Si el usuario todavía no entregó una tarea posterior, respondé sólo con la confirmación obligatoria.\n- Si una tarea posterior no corresponde al modo activo, indicá la incompatibilidad antes de proceder.`);
    sections.push(`## CONFIRMACIÓN PERMANENTE DEL MODO\nMientras este modo esté activo, iniciá cada respuesta posterior con esta línea exacta:\n[MODO ACTIVO: ${titleCase(name)}]\n\nSi una instrucción posterior contradice el modo activado, señalá la contradicción y pedí confirmación antes de cambiar de modo.`);
    sections.push(`## LÍMITE DE ACTIVACIÓN\nAl recibir este comando:\n- No ejecutes ninguna tarea.\n- No generes contenido, guiones, informes, código, tablas, diagnósticos ni propuestas.\n- No elijas ni infieras un tema, producto, formato, duración, audiencia o material.\n- No solicites datos de producción.\n- Limitate a confirmar la activación y quedar a la espera.`);
    sections.push(`## CONFIRMACIÓN OBLIGATORIA\nRespondé únicamente con una confirmación equivalente a la siguiente, conservando el nombre del modo y enumerando sus capacidades activas:\n${activationReply(name,ordered)}\n\nDespués de confirmar, no agregues recomendaciones ni comiences el trabajo. Esperá la primera tarea del usuario.`);
    return {command:sections.join('\n\n'),profile,name,error:''};
  }
  function compileSingle(command){return compile({task:'',profileId:'generic',modeName:command.title},[command]).command;}
  function profileFromDomain(domain){const map={tech:'tech',quality:'tech',social:'content',creative:'content',writing:'write',research:'research',analysis:'analyze',business:'analyze',learning:'learn',planning:'analyze',data:'tech',video:'video',image:'image',audio:'audio',product:'product',ai:'ai',legal:'legal'};return byProfile(map[domain]||'generic');}

  window.CentroEngine={MAX_SELECTION,RECOMMENDATION_LIMIT,PROFILES,PRESETS,normalize,analyze,byProfile,allCommands,validateSelectionSet,compatibility,recommendations,resolvePreset,profileMismatch,compile,compileSingle,commandGroups,profileFromDomain,profileFromCommand};
})();
