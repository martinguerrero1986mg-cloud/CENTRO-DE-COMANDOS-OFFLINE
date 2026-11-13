(()=>{'use strict';
  const APP_ID='com.microaplicacionesoffline.centro-comandos-ia';
  const VERSION='1.1-estable';
  const SCHEMA_VERSION=12;
  const STORAGE_KEY='mao.centro-comandos-ia.v2';
  const LEGACY_STORAGE_KEYS=['mao.centro-comandos-ia.v1','mao.centro-comandos-ia'];
  const DEFAULT_DRAFT={selected:[],contextDescription:'',acceptedContext:'',contextValidated:false,modeName:'',profileId:'',profileSource:'',presetId:''};
  const DEFAULT_STATE={schemaVersion:SCHEMA_VERSION,favorites:[],draft:DEFAULT_DRAFT};
  const clone=value=>JSON.parse(JSON.stringify(value));

  function normalizeFavorites(raw){
    const source=raw&&typeof raw==='object'&&raw.data&&typeof raw.data==='object'?raw.data:raw;
    return [...new Set(Array.isArray(source&&source.favorites)?source.favorites.filter(value=>typeof value==='string'):[])].slice(0,500);
  }
  function migrate(raw){return {schemaVersion:SCHEMA_VERSION,favorites:normalizeFavorites(raw),draft:clone(DEFAULT_DRAFT)};}
  function load(){
    try{
      const current=localStorage.getItem(STORAGE_KEY);
      if(current!==null)return migrate(JSON.parse(current));
      for(const key of LEGACY_STORAGE_KEYS){
        const legacy=localStorage.getItem(key);
        if(legacy===null)continue;
        const migrated=migrate(JSON.parse(legacy));
        localStorage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:SCHEMA_VERSION,favorites:migrated.favorites}));
        return migrated;
      }
      return clone(DEFAULT_STATE);
    }catch(_){return clone(DEFAULT_STATE);}
  }
  function save(state){
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:SCHEMA_VERSION,favorites:normalizeFavorites(state)}));return true;}
    catch(_){return false;}
  }
  function fresh(){return clone(DEFAULT_STATE);}
  window.CentroStorage={APP_ID,VERSION,SCHEMA_VERSION,STORAGE_KEY,LEGACY_STORAGE_KEYS,DEFAULT_DRAFT,load,save,fresh,migrate};
})();
