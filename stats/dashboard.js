(function () {
  'use strict';
  var token = '', busy = false, current, timer;
  var $ = function(id){return document.getElementById(id);};
  var names = {ah:'Albert Heijn',aldi:'ALDI',dekamarkt:'DekaMarkt',dirk:'Dirk',ekoplaza:'Ekoplaza',etos:'Etos',hoogvliet:'Hoogvliet',jumbo:'Jumbo',kruidvat:'Kruidvat',lidl:'Lidl',nettorama:'Nettorama',picnic:'Picnic',plus:'PLUS',sligro:'Sligro',spar:'SPAR',vomar:'Vomar'};
  var number = function(v){return v == null ? '—' : Number(v).toLocaleString('nl-NL');};
  var money = function(v){return v == null ? '—' : Number(v).toLocaleString('nl-NL',{style:'currency',currency:'EUR'});};
  var when = function(v){return v ? new Date(v).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : 'Onbekend';};
  var el = function(tag,text,cls){var n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
  function card(parent,label,value,note,cls){var n=el('div',null,'card '+(cls||''));n.append(el('div',label,'label'),el('strong',value),el('small',note));parent.append(n);return n;}
  function data(source){return source && source.status==='ok' ? source.data : null;}
  function badge(id,source){$(id).textContent=source.status==='ok'?'Opgehaald '+when(source.fetchedAt):'Bron niet beschikbaar';$(id).className='badge'+(source.status==='ok'?'':' error');}
  function days(period){var a=[],d=new Date(period.start+'T12:00:00Z');while(d.toISOString().slice(0,10)<=period.end){a.push(d.toISOString().slice(0,10));d.setUTCDate(d.getUTCDate()+1);}return a;}
  function storeTotals(rows){var t={view:0,apple_click:0,apple_redirect:0,google_click:0,google_redirect:0};rows.forEach(function(r){var k=r.event==='view'?'view':r.store+'_'+r.event;if(k in t)t[k]+=r.count;});return t;}
  function render(report){
    current=report;var c=data(report.clerk),r=data(report.revenuecat),w=data(report.website),cat=data(report.catalog),ps=data(report.purchases);
    var totals=w?storeTotals(w.rows):null;
    function metric(id){var m=r&&r.connected&&r.metrics.find(function(m){return m.id===id;});return m?m.value:null;}
    $('period').textContent=report.period.start+' t/m '+report.period.end+' · Vandaag is nog niet volledig';
    $('overview').replaceChildren();
    card($('overview'),'Omzet in deze periode',money(r&&r.connected?r.revenue:null),'RevenueCat · bruto, vóór belastingen en storekosten');
    card($('overview'),'Nieuwe accounts',number(c?c.newUsers:null),'Clerk · geselecteerde periode');
    card($('overview'),'Actieve trials',number(metric('active_trials')),'RevenueCat · huidige stand');
    card($('overview'),'Naar de appstores',number(totals?totals.apple_click+totals.apple_redirect+totals.google_click+totals.google_redirect:null),'Klikken + automatische doorverwijzingen');
    badge('rc-state',report.revenuecat);badge('clerk-state',report.clerk);badge('web-state',report.website);badge('catalog-state',report.catalog);
    $('rc-cards').replaceChildren();
    card($('rc-cards'),'MRR',money(metric('mrr')),'Maandelijks terugkerende omzet');
    card($('rc-cards'),'Actieve abonnementen',number(metric('active_subscriptions')),'Huidige stand uit RevenueCat');
    card($('rc-cards'),'Actieve trials',number(metric('active_trials')),'Bevestigd in RevenueCat');
    $('rc-note').textContent=r&&r.connected?'Omzet volgt de gekozen periode; MRR, abonnementen en trials zijn actuele standen. RevenueCat bepaalt de verwerkingstijd en eigen rapportagegrenzen. '+r.metrics.map(function(m){return m.id==='mrr'?(m.updatedAt?'MRR-bron bijgewerkt: '+when(m.updatedAt)+'.':'RevenueCat geeft geen afzonderlijk bronmoment mee.'):'';}).join(''):(r?r.message:report.revenuecat.message);
    if(r&&!r.connected){$('rc-state').textContent='Koppeling ontbreekt';$('rc-state').className='badge warn';}
    $('purchase-note').textContent=ps?number(ps.trials)+' actieve trialaccounts en '+number(ps.paidSubscriptions)+' actieve betaalde accounts afgeleid uit ontvangen productie-aankoopmeldingen. '+number(ps.sandboxEvents)+' testmeldingen uitgesloten. Laatste melding: '+when(ps.lastReceived)+'. Deze controle kan onvolledig zijn en is niet de officiële RevenueCat-stand. Handmatige toegang telt niet mee.':report.purchases.message;
    $('clerk-cards').replaceChildren();card($('clerk-cards'),'Totaal',number(c?c.total:null),'Bestaande accounts');card($('clerk-cards'),'Nieuw',number(c?c.newUsers:null),'In deze periode');card($('clerk-cards'),'Vandaag',number(c?c.today:null),'Sinds 00:00');
    $('user-chart').replaceChildren();if(c){var max=Math.max(1,...Object.values(c.daily));days(report.period).forEach(function(day){var count=c.daily[day]||0,b=el('div',null,'bar');b.style.height=Math.max(2,count/max*90)+'px';b.title=day+': '+count+' nieuwe accounts';b.setAttribute('aria-label',b.title);if(report.period.days<=7)b.append(el('span',String(count)));$('user-chart').append(b);});}
    $('web-cards').replaceChildren();card($('web-cards'),'Paginaweergaven',number(totals?totals.view:null),'Homepage + downloadpagina');['apple','google'].forEach(function(s){card($('web-cards'),s==='apple'?'App Store':'Google Play',number(totals?totals[s+'_click']+totals[s+'_redirect']:null),totals?number(totals[s+'_click'])+' klikken · '+number(totals[s+'_redirect'])+' automatisch':'Niet beschikbaar');});
    $('days-table').replaceChildren();days(report.period).reverse().forEach(function(day){var t=w?storeTotals(w.rows.filter(function(row){return row.date===day;})):null;var tracked=day>='2026-09-16';var tr=el('tr');[day,tracked&&t?number(t.view):'—',tracked&&t?number(t.apple_click)+' / '+number(t.apple_redirect):'—',tracked&&t?number(t.google_click)+' / '+number(t.google_redirect):'—',c?number(c.daily[day]||0):'—'].forEach(function(v){tr.append(el('td',v));});$('days-table').append(tr);});
    renderCatalog(report,cat);
  }
  function renderCatalog(report,cat){
    var pipelines=data(report.pipelines);$('pipeline-cards').replaceChildren();
    (pipelines||[]).forEach(function(p){var stale=p.completedAt && Date.now()-Date.parse(p.completedAt)>36*3600000;var success=p.status==='success';var n=el('div',null,'card pipeline');n.append(el('span',stale?'Verversing te oud':success?'Geslaagd':p.status==='failure'?'Mislukt':p.status==='cancelled'?'Geannuleerd':'Onbekend','badge'+(stale||!success?' warn':'')),el('strong',p.name==='drugstores'?'Kruidvat & Etos':'Supermarkten'),el('p','Dagelijks. '+'Laatste afgeronde poging: '+when(p.completedAt)));if(p.url&&/^https:\/\/github\.com\/MouradLagsir199\/prakkie\/actions\/runs\/\d+$/.test(p.url)){var a=el('a','Bekijk verversing ↗');a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';n.append(a);}$('pipeline-cards').append(n);});
    if(!pipelines)$('pipeline-cards').append(el('p',report.pipelines.message,'empty'));
    $('stores-table').replaceChildren();
    $('catalog-note').textContent=cat?'Gepubliceerde catalogus '+cat.version+' · '+number(cat.stores.reduce(function(n,s){return n+s.products;},0))+' producten · '+(cat.bytes/1000000).toLocaleString('nl-NL',{maximumFractionDigits:1})+' MB. Gecontroleerd bestand uit de live app.':report.catalog.message;
    if(cat)cat.stores.forEach(function(s){var tr=el('tr');[names[s.chain]||s.chain,number(s.products),number(s.offers),s.unknownObservation===s.products?'Niet vastgelegd':number(s.observedToday)+' / '+number(s.products)+(s.unknownObservation?' ('+number(s.unknownObservation)+' onbekend)':''),when(s.lastObservedAt)].forEach(function(v){tr.append(el('td',v));});$('stores-table').append(tr);});
    var old=$('example-store').value;$('example-store').replaceChildren();var all=el('option','Alle winkels');all.value='all';$('example-store').append(all);if(cat)cat.stores.forEach(function(s){var op=el('option',names[s.chain]||s.chain);op.value=s.chain;$('example-store').append(op);});$('example-store').value=old;if(!$('example-store').value)$('example-store').value='all';renderExamples();
  }
  function renderExamples(){
    var cat=current&&data(current.catalog);$('examples').replaceChildren();var selected=$('example-store').value;
    var examples=cat?cat.examples.filter(function(p){return selected==='all'||p.chain===selected;}):[];
    $('examples-note').textContent='Aanbiedingsvoorbeelden met een bronwaarneming van vandaag, '+(cat?cat.day:'')+'. Prijs per product; bundeltotalen staan er apart bij.';
    if(!examples.length){$('examples').append(el('p','Voor deze selectie zijn nog geen aanbiedingen met een bronwaarneming van vandaag beschikbaar.','empty'));return;}
    examples.forEach(function(p){var n=el('article',null,'card product');n.append(el('div',names[p.chain]||p.chain,'shop'),el('h3',p.name),el('small',p.size||'','muted'),el('div',money(p.price),'price'));var offer=p.promo_text||'Aanbieding';if(p.promo_total_cents>0&&p.promo_min_qty>0)offer+=' · '+p.promo_min_qty+' stuks voor '+money(p.promo_total_cents/100);n.append(el('div',offer,'offer'));if(p.promo_conditions)n.append(el('div',p.promo_conditions,'condition'));if(p.promo_end_confirmed&&p.promo_end)n.append(el('small','Geldig t/m '+p.promo_end,'muted'));n.append(el('small','Waargenomen '+when(p.source_observed_at),'muted'));if(p.source_url&&/^https:\/\//.test(p.source_url)){var a=el('a','Bekijk bij de winkel ↗');a.href=p.source_url;a.target='_blank';a.rel='noopener noreferrer';n.append(a);}$('examples').append(n);});
  }
  async function refresh(){
    if(busy||!token)return;busy=true;$('refresh').disabled=true;$('days').disabled=true;$('status').textContent='Cijfers ophalen…';$('status').className='status';
    try{var response=await fetch('https://prakkie-api-prod.azurewebsites.net/v1/analytics?days='+$('days').value,{headers:{Authorization:'Bearer '+token},cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(120000)});if(!response.ok){if(response.status===401){token='';$('report').hidden=true;$('login').hidden=false;}throw new Error(response.status===401?'Ongeldige toegangscode.':'Ophalen mislukt. Eerdere cijfers zijn niet bijgewerkt.');}var report=await response.json();render(report);$('report').hidden=false;$('login').hidden=true;$('token').value='';var errors=['clerk','revenuecat','website','catalog','pipelines','purchases'].filter(function(k){return report[k].status==='error';});$('status').textContent='Bijgewerkt '+when(report.generatedAt)+' · Automatisch elke minuut'+(errors.length?' · '+errors.length+' bron(nen) tijdelijk niet beschikbaar':'');if(errors.length)$('status').className='status failed';}
    catch(err){$('status').textContent=err.name==='TimeoutError'?'Het ophalen duurt te lang. Probeer opnieuw; eerdere cijfers zijn niet bijgewerkt.':err.message;$('status').className='status failed';}
    finally{busy=false;$('refresh').disabled=false;$('days').disabled=false;}
  }
  $('login').addEventListener('submit',function(e){e.preventDefault();token=$('token').value.trim();refresh();});$('refresh').addEventListener('click',refresh);$('days').addEventListener('change',refresh);$('example-store').addEventListener('change',renderExamples);$('logout').addEventListener('click',function(){token='';clearInterval(timer);location.reload();});timer=setInterval(function(){if(!document.hidden)refresh();},60000);document.addEventListener('visibilitychange',function(){if(!document.hidden)refresh();});
}());
