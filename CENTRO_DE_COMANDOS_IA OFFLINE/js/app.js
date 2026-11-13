(()=>{
  'use strict';

  const engine=window.CentroEngine;
  const safety=window.CentroSafety;
  const storage=window.CentroStorage;
  const data=window.CentroComandosData;
  if(!engine||!safety||!storage||!data)throw new Error('No se pudieron cargar todos los componentes.');

  const KIND_LABELS={
    primary:'Capacidad central',
    context:'Especialización',
    modifier:'Método',
    output:'Presentación futura',
    control:'Control de calidad'
  };
  const PAGE_SIZE={presets:4,library:6,favorites:6};
  const clone=value=>JSON.parse(JSON.stringify(value));

  let state=storage.load();
  let activeExperience='';
  let detailId=null;
  let flashId=null;
  let search='';
  let libraryPage=1;
  let presetPage=1;
  let favoritePage=1;
  let lastResult=null;

  const $=id=>document.getElementById(id);
  const make=(tag,className,text)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  };
  const button=(text,className,handler)=>{
    const node=make('button',className,text);
    node.type='button';
    node.addEventListener('click',handler);
    return node;
  };
  const commands=()=>engine.allCommands();
  const commandById=id=>commands().find(command=>command.id===id);
  const selectedCommands=()=>state.draft.selected.map(commandById).filter(Boolean);
  const currentProfile=()=>engine.analyze(state.draft.contextDescription,state.draft.profileId);
  const hasCreateInput=()=>Boolean(state.draft.contextDescription.trim()||state.draft.profileId);
  const acceptedContextIsCurrent=()=>state.draft.contextValidated&&state.draft.acceptedContext===state.draft.contextDescription;

  function updateContextHint(){
    const length=String(state.draft.contextDescription||'').length;
    const hint=$('contextHint');
    if(hint)hint.textContent=`No agregues duración, audiencia ni formato de entrega. ${length}/${safety.MAX_CONTEXT_CHARS}`;
  }

  function resetRecommendationsScroll(){
    const grid=$('recommendationGrid');
    if(grid)grid.scrollTop=0;
  }

  function showSafetyDialog(result){
    const normalized=typeof result==='string'?{status:'block',message:result,label:'Bloqueado'}:result;
    const isClarify=normalized?.status==='clarify';
    const title=$('safetyTitle');
    const body=$('safetyMessage');
    const dialog=$('safetyDialog');
    if(title)title.textContent=isClarify?'Necesita reformulación':'Comando no generado';
    if(body)body.textContent=normalized?.message||'No se puede generar este comando.';
    if(dialog){
      dialog.classList.toggle('clarify-dialog',isClarify);
      dialog.classList.toggle('blocked-dialog',!isClarify);
    }
    if(dialog&&typeof dialog.showModal==='function')dialog.showModal();
    else toast(normalized?.message||'No se puede generar este comando.',isClarify?'':'error');
  }

  function persistFavorites(){
    if(!storage.save(state))toast('No se pudieron guardar los favoritos.','error');
  }

  function cleanReferences(){
    const ids=new Set(commands().map(command=>command.id));
    state.favorites=state.favorites.filter(id=>ids.has(id));
    state.draft.selected=state.draft.selected.filter(id=>ids.has(id)).slice(0,engine.MAX_SELECTION);
  }

  function resetOperation(){
    state.draft=clone(storage.DEFAULT_DRAFT);
    search='';
    libraryPage=presetPage=favoritePage=1;
    lastResult=null;
    flashId=null;
    if($('searchInput'))$('searchInput').value='';
    if($('categoryInput'))$('categoryInput').value='Todos';
    if($('compatibleOnlyInput'))$('compatibleOnlyInput').checked=true;
    $('copyResultBtn')?.classList.remove('copied');
    if($('copyResultBtn'))$('copyResultBtn').textContent='COPIAR COMANDO';
    if($('resultCommand'))$('resultCommand').value='';
    if($('resultModeName'))$('resultModeName').textContent='';
    if($('resultCapabilities'))$('resultCapabilities').textContent='';
  }

  function setView(view){
    document.body.className=view==='workspace'?'work-view':view==='result'?'result-view':'home-view';
    $('homeScreen').classList.toggle('active',view==='home');
    $('workspaceScreen').classList.toggle('active',view==='workspace');
    $('resultScreen').classList.toggle('active',view==='result');
    setTimeout(()=>{
      const target=view==='home'?'homeTitle':view==='result'?'resultTitle':activeExperience+'Title';
      const title=$(target);
      if(title){title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}
    },0);
  }

  function goHome(){
    resetOperation();
    activeExperience='';
    document.querySelectorAll('.work-panel').forEach(panel=>panel.classList.remove('active'));
    renderHome();
    renderAllExperiences();
    updateSelection();
    setView('home');
  }

  function openExperience(name){
    activeExperience=name;
    document.querySelectorAll('.work-panel').forEach(panel=>panel.classList.toggle('active',panel.id===name+'Panel'));
    renderExperience();
    updateSelection();
    setView('workspace');
  }

  function renderHome(){
    const count=state.favorites.length;
    $('favoriteHomeCount').textContent=count?`${count} ${count===1?'favorito guardado':'favoritos guardados'}.`:'Ningún favorito guardado.';
  }

  function profileBanner(){
    const hasContext=hasCreateInput();
    const label=state.draft.profileSource==='manual'?'Área elegida':'Contexto interpretado';
    if(!hasContext){
      $('createProfileBanner').textContent='Todavía no hay un filtro activo. Escribí un contexto para que el sistema interprete un área, o elegí un área manualmente.';
      return;
    }
    if(!acceptedContextIsCurrent()){
      $('createProfileBanner').textContent='Entrada pendiente de validación. Al validar, se mostrarán recomendaciones filtradas según el contexto y el área activa.';
      return;
    }
    $('createProfileBanner').textContent=`${label}: ${currentProfile().label}. Se muestran recomendaciones filtradas para esta área; elegí hasta cinco o cambiá de área y se actualizarán automáticamente.`;
  }

  function updateSelection(){
    const selected=selectedCommands();
    const count=selected.length;
    const finalCheck=count?engine.validateSelectionSet(selected,currentProfile(),{final:true}):null;
    const createPending=activeExperience==='create'&&hasCreateInput()&&!acceptedContextIsCurrent();
    $('selectedCount').textContent=count;
    $('selectionTitle').textContent=count?`${count} ${count===1?'capacidad seleccionada':'capacidades seleccionadas'}`:'Sin capacidades seleccionadas';
    $('selectedNames').textContent=count
      ? selected.map(command=>command.title).join(' · ')+(finalCheck&&!finalCheck.ok?' · Pendiente: '+finalCheck.reason:'')
      :createPending?'Validá la entrada antes de seleccionar capacidades guiadas.':'Podés seleccionar entre una y cinco.';
    $('generateCommandBtn').disabled=!count||createPending||(finalCheck&&!finalCheck.ok);
    $('generateCommandBtn').setAttribute('aria-describedby','selectedNames');
    $('clearSelectionBtn').disabled=!count;
  }

  function pulseGenerate(){
    $('generateCommandBtn').classList.remove('attention');
    void $('generateCommandBtn').offsetWidth;
    $('generateCommandBtn').classList.add('attention');
    setTimeout(()=>$('generateCommandBtn').classList.remove('attention'),2600);
  }

  function reconcileSelection(notify){
    const kept=[];
    const removed=[];
    const profile=currentProfile();
    state.draft.selected.forEach(id=>{
      const command=commandById(id);
      const check=engine.compatibility(command,kept,profile);
      if(command&&check.ok)kept.push(command);
      else if(command)removed.push(command.title);
    });
    state.draft.selected=kept.map(command=>command.id);
    if(removed.length&&notify)toast('Se quitaron capacidades incompatibles: '+removed.join(', ')+'.','error');
    return removed;
  }

  function setProfile(profileId){
    const validated=acceptedContextIsCurrent();
    state.draft.profileId=profileId;
    state.draft.profileSource='manual';
    state.draft.presetId='';
    if(validated){
      reconcileSelection(true);
    }else{
      state.draft.contextValidated=false;
      state.draft.acceptedContext='';
      state.draft.selected=[];
    }
    renderCreate();
    resetRecommendationsScroll();
    renderLibrary();
    updateSelection();
  }

  function renderCreate(){
    $('contextInput').value=state.draft.contextDescription;
    updateContextHint();
    document.querySelectorAll('[data-profile]').forEach(node=>{
      const active=node.dataset.profile===state.draft.profileId;
      node.classList.toggle('active',active);
      node.setAttribute('aria-pressed',active?'true':'false');
    });
    profileBanner();
    const grid=$('recommendationGrid');
    grid.textContent='';
    const hasInput=hasCreateInput();
    if(!hasInput){
      grid.append(make('div','empty','Primero describí tu contexto o elegí un área. Después de validar aparecerá una selección de capacidades recomendadas. Para ver las 258 capacidades, usá la Biblioteca oficial.'));
      return;
    }
    if(!acceptedContextIsCurrent()){
      grid.append(make('div','empty','Escribí la descripción, revisá que sea correcta y presioná VALIDAR Y VER RECOMENDACIONES. Las tarjetas aparecerán sólo después de validar la entrada.'));
      return;
    }
    const result=engine.recommendations(state.draft.contextDescription,state.draft.profileId,commands());
    result.commands.forEach(command=>grid.append(capabilityCard(command,'recommend')));
  }

  function validateCreateInput(){
    if(!hasCreateInput()){
      toast('Describí brevemente el ámbito o elegí un área.','error');
      $('contextInput').focus();
      return;
    }
    const safetyResult=safety.analyzeModeRequest(state.draft.contextDescription);
    if(safetyResult.status!=='allow'){
      state.draft.contextValidated=false;
      state.draft.acceptedContext='';
      state.draft.selected=[];
      renderCreate();
      resetRecommendationsScroll();
      updateSelection();
      showSafetyDialog(safetyResult);
      $('contextInput')?.focus();
      return;
    }
    state.draft.contextValidated=true;
    state.draft.acceptedContext=state.draft.contextDescription;
    reconcileSelection(true);
    renderCreate();
    resetRecommendationsScroll();
    updateSelection();
    toast('Entrada validada. Ya podés elegir capacidades compatibles.','success');
  }

  function applyPreset(id){
    const result=engine.resolvePreset(id,commands());
    if(!result.ok){toast(result.reason,'error');return;}
    const mismatch=engine.profileMismatch(state.draft.contextDescription,result.profile.id);
    if(mismatch&&!confirm(mismatch.message+' ¿Querés continuar con este modo preparado?')){
      return;
    }
    state.draft.selected=result.commands.map(command=>command.id);
    state.draft.profileId=result.profile.id;
    state.draft.profileSource='preset';
    state.draft.presetId=result.preset.id;
    flashId='preset:'+id;
    renderPresets();
    updateSelection();
    pulseGenerate();
    toast('Combinación seleccionada. Presioná GENERAR COMANDO.','success');
    setTimeout(()=>{flashId=null;renderPresets();},1300);
  }

  function renderPresets(){
    const total=Math.max(1,Math.ceil(engine.PRESETS.length/PAGE_SIZE.presets));
    presetPage=Math.min(Math.max(1,presetPage),total);
    $('presetPageText').textContent=`Página ${presetPage} de ${total}`;
    $('presetPrevBtn').disabled=presetPage===1;
    $('presetNextBtn').disabled=presetPage===total;
    const grid=$('presetGrid');
    grid.textContent='';
    engine.PRESETS.slice((presetPage-1)*PAGE_SIZE.presets,presetPage*PAGE_SIZE.presets).forEach(preset=>{
      const result=engine.resolvePreset(preset.id,commands());
      const selected=state.draft.presetId===preset.id;
      const card=make('article','preset-card'+(selected?' selected':'')+(flashId==='preset:'+preset.id?' just-added':''));
      card.append(make('h3','',preset.title),make('p','',preset.description));
      const chips=make('div','preset-chips');
      if(result.ok)result.commands.forEach(command=>chips.append(make('span','badge',command.title)));
      card.append(chips);
      const use=button(selected?'✓ SELECCIONADO':'ELEGIR ESTE MODO','btn '+(selected?'success':'primary')+' small',()=>applyPreset(preset.id));
      use.disabled=!result.ok;
      use.setAttribute('aria-pressed',selected?'true':'false');
      card.append(use);
      grid.append(card);
    });
  }

  function categories(){return Object.keys(data.CATEGORY_RULES);}

  function renderCategoryOptions(){
    const select=$('categoryInput');
    select.innerHTML='<option value="Todos">Todas las categorías</option>';
    categories().forEach(category=>{
      const option=make('option','',category);
      option.value=category;
      select.append(option);
    });
  }

  function filteredCommands(){
    const category=$('categoryInput').value;
    const tokens=engine.normalize(search).split(' ').filter(Boolean);
    const selected=selectedCommands();
    const profile=currentProfile();
    const compatibleOnly=$('compatibleOnlyInput').checked;
    return commands().filter(command=>{
      if(category!=='Todos'&&command.category!==category)return false;
      const haystack=engine.normalize([command.alias,command.title,command.category,command.description,command.task,(command.tags||[]).join(' '),command.need,KIND_LABELS[command.kind]].join(' '));
      if(!tokens.every(token=>haystack.includes(token)))return false;
      const already=state.draft.selected.includes(command.id);
      const check=engine.compatibility(command,selected,profile);
      return !compatibleOnly||already||check.ok;
    });
  }

  function renderLibrary(){
    const items=filteredCommands();
    const total=Math.max(1,Math.ceil(items.length/PAGE_SIZE.library));
    libraryPage=Math.min(Math.max(1,libraryPage),total);
    $('libraryPageText').textContent=`Página ${libraryPage} de ${total}`;
    $('libraryPrevBtn').disabled=libraryPage===1;
    $('libraryNextBtn').disabled=libraryPage===total;
    $('libraryStatus').textContent=`Mostrando ${items.length?((libraryPage-1)*PAGE_SIZE.library+1):0}–${Math.min(libraryPage*PAGE_SIZE.library,items.length)} de ${items.length} resultados · ${commands().length} capacidades oficiales`;
    const grid=$('libraryGrid');
    grid.textContent='';
    if(!items.length){
      grid.append(make('div','empty','No hay capacidades que coincidan con estos filtros.'));
      return;
    }
    items.slice((libraryPage-1)*PAGE_SIZE.library,libraryPage*PAGE_SIZE.library).forEach(command=>grid.append(capabilityCard(command,'library')));
  }

  function renderFavorites(){
    const items=state.favorites.map(commandById).filter(Boolean);
    const total=Math.max(1,Math.ceil(items.length/PAGE_SIZE.favorites));
    favoritePage=Math.min(Math.max(1,favoritePage),total);
    $('favoritePageText').textContent=`Página ${favoritePage} de ${total}`;
    $('favoritePrevBtn').disabled=favoritePage===1;
    $('favoriteNextBtn').disabled=favoritePage===total;
    const grid=$('favoritesGrid');
    grid.textContent='';
    if(!items.length){
      const empty=make('div','empty');
      const copy=make('div');
      copy.append(make('strong','','Todavía no guardaste favoritos.'),make('span','','Abrí la Biblioteca oficial y marcá la estrella de una capacidad.'));
      empty.append(copy);
      grid.append(empty);
      return;
    }
    items.slice((favoritePage-1)*PAGE_SIZE.favorites,favoritePage*PAGE_SIZE.favorites).forEach(command=>grid.append(capabilityCard(command,'favorites')));
  }

  function capabilityCard(command){
    const selected=state.draft.selected.includes(command.id);
    const check=engine.compatibility(command,selectedCommands(),currentProfile());
    const blocked=!selected&&!check.ok;
    const card=make('article','capability-card'+(selected?' selected':'')+(blocked?' incompatible':'')+(flashId===command.id?' just-added':''));
    const top=make('div','card-top');
    top.append(make('span','kind-badge',KIND_LABELS[command.kind]||'Capacidad'));
    if(command.composite)top.append(make('span','badge accent','Función integrada'));
    const fav=button(state.favorites.includes(command.id)?'★':'☆','icon-btn favorite'+(state.favorites.includes(command.id)?' active':''),()=>toggleFavorite(command.id));
    fav.title=state.favorites.includes(command.id)?'Quitar de favoritos':'Guardar como favorito';
    fav.setAttribute('aria-label',fav.title);
    fav.setAttribute('aria-pressed',state.favorites.includes(command.id)?'true':'false');
    top.append(fav);
    card.append(top,make('h3','',command.title),make('p','',command.description));
    const meta=make('div','card-meta');
    meta.append(make('span','card-category',command.category));
    card.append(meta);
    if(blocked)card.append(make('div','compatibility-lock',check.reason));
    const actions=make('div','card-actions');
    let actionText=selected?'QUITAR':'AGREGAR';
    if(selected&&flashId===command.id)actionText='✓ AGREGADO';
    const use=button(actionText,'btn small '+(selected?'success':'primary'),()=>toggleSelected(command.id));
    use.disabled=blocked;
    use.setAttribute('aria-pressed',selected?'true':'false');
    use.setAttribute('aria-label',`${actionText} ${command.title}`);
    const detail=button('DETALLE','btn small ghost',()=>openDetail(command.id));
    detail.setAttribute('aria-label','Ver detalle de '+command.title);
    actions.append(use,detail);
    card.append(actions);
    return card;
  }

  function toggleSelected(id){
    if(state.draft.selected.includes(id)){
      state.draft.selected=state.draft.selected.filter(item=>item!==id);
      flashId=null;
    }else{
      const command=commandById(id);
      const check=engine.compatibility(command,selectedCommands(),currentProfile());
      if(!check.ok){toast(check.reason,'error');return;}
      state.draft.selected.push(id);
      state.draft.presetId='';
      flashId=id;
      pulseGenerate();
      setTimeout(()=>{if(flashId===id){flashId=null;renderExperience();}},1300);
    }
    renderExperience();
    updateSelection();
  }

  function toggleFavorite(id){
    const adding=!state.favorites.includes(id);
    state.favorites=adding?[...state.favorites,id]:state.favorites.filter(item=>item!==id);
    persistFavorites();
    renderHome();
    if(activeExperience==='create')renderCreate();
    renderLibrary();
    renderFavorites();
    if(detailId===id&&$('detailDialog').open)updateDetailButtons();
    toast(adding?'Guardado en Favoritos.':'Eliminado de Favoritos.',adding?'success':'');
  }

  function clearSelection(){
    state.draft.selected=[];
    state.draft.presetId='';
    flashId=null;
    renderExperience();
    updateSelection();
  }

  function renderExperience(){
    if(activeExperience==='create')renderCreate();
    if(activeExperience==='presets')renderPresets();
    if(activeExperience==='library')renderLibrary();
    if(activeExperience==='favorites')renderFavorites();
  }

  function renderAllExperiences(){
    renderCreate();
    renderPresets();
    renderLibrary();
    renderFavorites();
  }

  function generateCommand(){
    const selected=selectedCommands();
    if(!selected.length){toast('Elegí al menos una capacidad.','error');return;}
    if(activeExperience==='create'&&hasCreateInput()&&!acceptedContextIsCurrent()){
      toast('Validá la entrada con VALIDAR Y VER RECOMENDACIONES antes de generar.','error');
      return;
    }
    const safetyResult=safety.analyzeModeRequest(state.draft.contextDescription);
    if(safetyResult.status!=='allow'){
      showSafetyDialog(safetyResult);
      $('contextInput')?.focus();
      return;
    }
    const finalCheck=engine.validateSelectionSet(selected,currentProfile(),{final:true});
    if(!finalCheck.ok){toast(finalCheck.reason,'error');return;}
    const result=engine.compile(state.draft,selected);
    if(!result.command){toast(result.error||'No se pudo generar el comando.','error');return;}
    lastResult=result;
    $('resultModeName').textContent=result.name;
    $('resultCapabilities').textContent='';
    selected.forEach(command=>$('resultCapabilities').append(make('div','result-capability','✓ '+command.title)));
    $('resultCommand').value=result.command;
    $('copyResultBtn').classList.remove('copied');
    $('copyResultBtn').textContent='COPIAR COMANDO';
    setView('result');
  }

  async function copyResult(){
    if(!lastResult||!lastResult.command)return;
    if(await copyText(lastResult.command)){
      const node=$('copyResultBtn');
      node.classList.remove('copied');
      void node.offsetWidth;
      node.classList.add('copied');
      node.textContent='✓ COPIADO — PODÉS COPIAR DE NUEVO';
      toast('✓ Comando copiado correctamente. Ya podés pegarlo en la IA externa.','copy');
      setTimeout(()=>{
        if(node.isConnected){
          node.classList.remove('copied');
          node.textContent='COPIAR COMANDO';
        }
      },2400);
    }
  }

  async function copyText(value){
    try{
      if(navigator.clipboard&&window.isSecureContext){
        await navigator.clipboard.writeText(value);
        return true;
      }
      const area=make('textarea');
      area.value=value;
      area.readOnly=true;
      area.style.cssText='position:fixed;opacity:0';
      document.body.append(area);
      area.select();
      const ok=document.execCommand('copy');
      area.remove();
      if(!ok)throw new Error();
      return true;
    }catch(_){
      $('resultCommand').focus();
      $('resultCommand').select();
      toast('No se pudo copiar automáticamente. El texto quedó seleccionado para copiarlo manualmente.','error');
      return false;
    }
  }

  function openDetail(id){
    const command=commandById(id);
    if(!command)return;
    detailId=id;
    $('detailTitle').textContent=command.title;
    $('detailDescription').textContent=command.description;
    $('detailInstruction').textContent='Cuando el modo esté activo y el usuario entregue una tarea posterior compatible:\n\n'+command.task+'\n\nLa activación por sí sola no ejecuta esta directiva.';
    const meta=$('detailMeta');
    meta.textContent='';
    meta.append(make('span','kind-badge',KIND_LABELS[command.kind]||'Capacidad'),make('span','badge',command.category));
    if(command.composite)meta.append(make('span','badge accent','Función integrada'));
    updateDetailButtons();
    $('detailDialog').showModal();
  }

  function updateDetailButtons(){
    const command=commandById(detailId);
    if(!command)return;
    const selected=state.draft.selected.includes(detailId);
    const check=engine.compatibility(command,selectedCommands(),currentProfile());
    const favorite=state.favorites.includes(detailId);
    $('detailToggleBtn').textContent=selected?'QUITAR':'AGREGAR';
    $('detailToggleBtn').disabled=!selected&&!check.ok;
    $('detailToggleBtn').setAttribute('aria-pressed',selected?'true':'false');
    $('detailToggleBtn').setAttribute('aria-label',(selected?'Quitar ':'Agregar ')+command.title);
    $('detailFavoriteBtn').textContent=favorite?'★ GUARDADO EN FAVORITOS':'☆ GUARDAR FAVORITO';
    $('detailFavoriteBtn').setAttribute('aria-pressed',favorite?'true':'false');
    $('detailFavoriteBtn').setAttribute('aria-label',(favorite?'Quitar de favoritos ':'Guardar como favorito ')+command.title);
  }

  function toast(message,type){
    const node=make('div','toast '+(type||''),message);
    $('toastRegion').append(node);
    setTimeout(()=>node.remove(),type==='copy'?2400:4200);
  }

  function bind(){
    document.querySelectorAll('[data-experience]').forEach(card=>card.addEventListener('click',()=>openExperience(card.dataset.experience)));
    document.querySelectorAll('[data-home]').forEach(node=>node.addEventListener('click',goHome));
    document.querySelectorAll('[data-profile]').forEach(node=>node.addEventListener('click',()=>setProfile(node.dataset.profile)));
    $('openLibraryFromCreate')?.addEventListener('click',()=>openExperience('library'));
    $('contextInput').addEventListener('input',event=>{
      state.draft.contextDescription=event.target.value;
      updateContextHint();
      if(state.draft.profileSource!=='manual'){
        state.draft.profileId=state.draft.contextDescription.trim()?engine.analyze(state.draft.contextDescription,'').id:'';
        state.draft.profileSource=state.draft.profileId?'auto':'';
      }
      state.draft.presetId='';
      state.draft.contextValidated=false;
      state.draft.acceptedContext='';
      if(activeExperience==='create')state.draft.selected=[];
      renderCreate();
      resetRecommendationsScroll();
      renderLibrary();
      updateSelection();
    });
    $('recommendBtn').addEventListener('click',validateCreateInput);
    $('clearCreateBtn').addEventListener('click',()=>{
      state.draft=clone(storage.DEFAULT_DRAFT);
      renderCreate();
      resetRecommendationsScroll();
      updateSelection();
      toast('Campos y selección limpios.','success');
    });
    $('presetPrevBtn').addEventListener('click',()=>{presetPage--;renderPresets();});
    $('presetNextBtn').addEventListener('click',()=>{presetPage++;renderPresets();});
    $('searchInput').addEventListener('input',event=>{search=event.target.value;libraryPage=1;renderLibrary();});
    $('categoryInput').addEventListener('change',()=>{libraryPage=1;renderLibrary();});
    $('compatibleOnlyInput').addEventListener('change',()=>{libraryPage=1;renderLibrary();});
    $('libraryPrevBtn').addEventListener('click',()=>{libraryPage--;renderLibrary();});
    $('libraryNextBtn').addEventListener('click',()=>{libraryPage++;renderLibrary();});
    $('favoritePrevBtn').addEventListener('click',()=>{favoritePage--;renderFavorites();});
    $('favoriteNextBtn').addEventListener('click',()=>{favoritePage++;renderFavorites();});
    $('clearSelectionBtn').addEventListener('click',clearSelection);
    $('generateCommandBtn').addEventListener('click',generateCommand);
    $('copyResultBtn').addEventListener('click',copyResult);
    $('detailToggleBtn').addEventListener('click',()=>{if(detailId)toggleSelected(detailId);updateDetailButtons();});
    $('detailFavoriteBtn').addEventListener('click',()=>{if(detailId)toggleFavorite(detailId);});
    $('helpBtn').addEventListener('click',()=>$('helpDialog').showModal());
    document.querySelectorAll('[data-close]').forEach(node=>node.addEventListener('click',()=>$(node.dataset.close).close()));
    document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();}));
  }

  cleanReferences();
  storage.save(state);
  renderCategoryOptions();
  bind();
  renderHome();
  renderAllExperiences();
  updateSelection();
  setView('home');
})();
