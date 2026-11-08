// Curated historical outlines. Coordinates and replay thresholds are teaching choices.
const source=(title,url,note)=>({title,url,note});
const ship=(id,name,side,type,role,points,extra={})=>({id,name,side,type,role,points,source:0,representative:false,...extra});
const line=(x,y,h)=>Array.from({length:5},()=>[x,y,h]);
const course=(a,b,c,d,e)=>[a,b,c,d,e];
const chapter=(label,title,text,focus,source=0)=>({label,title,text,focus,source});
const question=(label,title,text,phase,focus,layer='courses',source=0)=>({label,title,text,phase,focus,layer,source});
function encounter(data){
  const focus=data.ships.map(s=>s.id);
  // Only generic formation markers are generated. They never receive individual fates.
  for(let side=0;side<2;side++){
    const lead=data.ships.find(s=>s.side===side);
    for(let i=1;i<=2;i++)data.ships.push(ship(`${data.id}-fleet-${side}-${i}`,`${data.sides[side]} · marker ${i}`,side,lead.type,'Representative formation marker. Not an identified vessel; no individual fate is assigned.',lead.points.map(([x,y,h])=>[Math.max(55,Math.min(945,x-i*48)),Math.max(55,Math.min(545,y+i*62)),h]),{representative:true}));
  }
  return {wind:'Illustrative wind · not a recovered observation',windAngle:110,terrain:'open',...data,defaultShip:focus[0]};
}
const DIU=source('Portuguese Ministry of Defence · Diu 1509','https://www.defesa.gov.pt/pt/defesa/organizacao/comissoes/cphm/rphm/edicoes/ano3/n.5/3/','Military-history study of the coalition, attack and Portuguese victory. Portuguese; a national institutional perspective.');
const DIU2=source('Museu de Marinha · Diu anniversary','https://cultura.marinha.pt/en/museumarinha_web/multimedia_web/Pages/efemeride-batalha-naval-de-diu-03fev21.aspx','Identifies Flor de la Mar as the Portuguese flagship. Portuguese.');
const ARMADA=source('Historic England · The Armada 1588','https://historicengland.org.uk/listing/heritage-gateway/results/record/0d636742-8028-4a8c-8b7c-e1f9aaf2d338/f93f9bb0-105b-4d6a-982b-abbbc331fda2','Campaign and wreck context; distinguishes the Channel actions from the later voyage home. Calendar dates differ between accounts.');
const ARMADA2=source('NASA Earth Observatory · Winds of Change','https://science.nasa.gov/missions/landsat/winds-of-change-defeat-of-the-spanish-armada-1588/','Geographic explanation of the retreat north and later weather losses.');
const DOWNS=source('Rijksmuseum · Battle of the Downs, 1639','https://www.rijksmuseum.nl/en/collection/object/Battle-of-the-Downs--a429b484d049c5a8b85e14eaec041458','Contemporary commemorative medal; evidence of the battle and its Dutch commemoration, not measured ship tracks.');
const DOWNS2=source('Dutch Cultural Heritage Agency · Aemilia','https://mass.cultureelerfgoed.nl/aemilia-2','Ship record and depiction of Aemilia before the Downs.');
const DOWNS3=source('Historic England · Downs wreck record','https://historicengland.org.uk/listing/heritage-gateway/results/record/0d636742-8028-4a8c-8b7c-e1f9aaf2d338/f65d1bab-73ed-4179-9f34-63ee8144ddf1','Warns that named ships cannot reliably be matched to many wrecks. No individual sunk markers are inferred here.');
const QUIBERON=source('Royal Museums Greenwich · Quiberon Bay','https://www.rmg.co.uk/collections/objects/rmgc-object-11888','Museum commentary on Hawke’s pursuit, weather, reefs and the losses of Thésée and Superbe.');
const CAPES=source('National Park Service · Battle of the Capes','https://www.nps.gov/york/learn/historyculture/battle-of-the-capes.htm','French control of the bay and its role in preventing relief of Cornwallis at Yorktown.');
const NILE=source('Royal Museums Greenwich · Nile, beginning of the action','https://www.rmg.co.uk/collections/objects/rmgc-object-12007','Nelson’s attack on the anchored French fleet in Aboukir Bay.');
const NILE2=source('Naval History and Heritage Command · Nelson’s Nile dispatch','https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/b/battle-of-the-nile.html','Contemporary British dispatch and fleet return. A participant’s report rather than a neutral account.');
const NILE3=source('The Mariners’ Museum · Orient’s destruction','https://catalogs.marinersmuseum.org/object/CL20622','Collection commentary describes the French flagship’s explosion during the night action.');
const LISSA=source('Marina Militare · Battle of Lissa','https://www.marina.difesa.it/cosa-facciamo/storia/la-nostra-storia/storianavale/Pagine/lissa.aspx','Italian naval account: Tegetthoff’s approach, command problems and the loss of two Italian ships. Italian.');
const LISSA2=source('Marina Militare · Re d’Italia','https://www.marina.difesa.it/noi-siamo-la-marina/pilastro-operativo/mezzi/mezzi-storici/Pagine/PQRS/re_italia.aspx','Ship record identifies its loss on 20 July 1866 after ramming by Ferdinand Max. Italian.');
const MANILA=source('NHHC · Manila Bay, 1 May 1898','https://www.history.navy.mil/content/history/nhhc/about-us/leadership/director/directors-corner/h-grams/h-gram-018/h-018-5.html','Modern naval history: Dewey’s squadron, repeated firing passes and the destruction of Montojo’s squadron.');
const MANILA2=source('NHHC · Admiral Montojo’s report','https://www.history.navy.mil/research/publications/documentary-histories/united-states-navy-s/the-battle-of-manila/admiral-patricio-mon.html','Spanish commander’s account of abandoning Reina Cristina and the burning and sinking of Castilla. Participant testimony.');
export const EXTRA_BATTLES=[
encounter({id:'diu',name:'Diu',year:1509,date:'3 February 1509',place:'Off Diu · Indian Ocean',era:'Carracks & galleys',takeaway:'Sea power at a trading crossroads.',seaLabel:'ARABIAN SEA',terrain:'gulf',sides:['Portuguese fleet','Mamluk–Gujarati coalition'],sources:[DIU,DIU2],introduction:'A Portuguese fleet attacks the coalition sheltered at Diu. The encounter helps establish a coercive Portuguese naval presence on Indian Ocean trading routes.',ships:[
ship('flor','Flor de la Mar',0,'sail','Francisco de Almeida’s flagship. Generic carrack model, not a measured reconstruction.',course([220,270,90],[350,270,90],[500,260,55],[530,250,20],[530,250,20]),{source:1}),
ship('diu-coalition','Coalition anchorage · marker',1,'galley','Representative Mamluk–Gujarati force at Diu; not an identified individual ship.',line(590,280,270),{representative:true})],chapters:[
chapter('Context','A contest over ocean trade','Portugal’s armed expansion disrupts existing trading networks. The coalition includes Mamluk and Gujarati forces.',['flor','diu-coalition']),
chapter('Approach','Almeida arrives at Diu','The Portuguese close on the sheltered opposing fleet. These paths show the relationship of attacker and anchorage.',['flor']),
chapter('Attack','Artillery and boarding','The fighting combines shipboard guns with close assault. Neither weapon alone explains this early oceanic encounter.',['flor','diu-coalition']),
chapter('Break','The coalition is overcome','Coalition ships are destroyed or taken. No particular fate is assigned to the unnamed markers.',['diu-coalition']),
chapter('Outcome','A Portuguese victory','The victory strengthens Portuguese power in the Indian Ocean; it does not mean peaceful or uncontested control of the whole ocean.',['flor'])],questions:[
question('Why fight here?','A commercial crossroads','This battle belongs to a struggle over ocean trade and armed access, not simply a duel between ship designs.',0,['flor','diu-coalition']),
question('Why show two ship types?','Guns meet oars','Carracks and galleys illustrate the mixed fleets of the period. Models and mounting sectors are generic.',2,['flor','diu-coalition'],'weapons'),
question('Which ships sank?','The names matter','The source describes coalition losses, but the unnamed formation markers cannot responsibly be labelled as particular wrecks.',4,['diu-coalition'])]}),
encounter({id:'gravelines',name:'Gravelines',year:1588,date:'8 August 1588 (New Style)',place:'Off Gravelines · English Channel',era:'Galleons & the Armada',takeaway:'An invasion plan loses its rendezvous.',seaLabel:'ENGLISH CHANNEL',sides:['English fleet','Spanish Armada'],sources:[ARMADA,ARMADA2],introduction:'After the fireship attack at Calais, the fleets fight off Gravelines. The Armada cannot complete its intended link with the army in the Netherlands.',ships:[
ship('ark-royal','Ark Royal',0,'sail','Howard’s flagship in the English fleet.',course([220,330,80],[360,300,80],[540,270,70],[600,250,50],[580,230,40])),
ship('san-martin','San Martín',1,'sail','Medina Sidonia’s flagship; the model is a generic sailing warship.',course([580,260,20],[610,250,20],[650,230,15],[690,190,0],[730,110,0]))],chapters:[
chapter('Calais','The rendezvous has not happened','The Armada’s task is to join with the invasion army. Being at sea with many ships is not the same as completing that link.',['san-martin']),
chapter('Disrupt','Fireships scatter the anchorage','English fireships sent toward the fleet off Calais precede the main battle. This chart does not invent individual fireship collisions.',['ark-royal','san-martin']),
chapter('Action','Gunfire off Gravelines','The English engage the Armada off Gravelines. The selected flagships anchor the story, not a measured ship-to-ship firing log.',['ark-royal','san-martin']),
chapter('North','The fleet cannot return through the Channel','Wind, the English fleet and the failed rendezvous shape the Spanish withdrawal toward the North Sea.',['san-martin'],1),
chapter('Outcome','The invasion attempt fails','The later voyage around Scotland and Ireland brings further losses. Those later wrecks are not sunk markers in this battle.',['san-martin'],1)],questions:[
question('What was the Armada trying to do?','Meet an army','The objective was a combined invasion operation. The failure of the rendezvous matters more than a simple ship-loss score.',0,['san-martin']),
question('Did fireships sink the whole Armada?','Disruption is not annihilation','The fireship episode disrupted the fleet. Much of the fleet’s later destruction occurred during its return voyage.',1,['san-martin']),
question('Why sail north?','Geography closes a route','The fleet’s retreat takes it around the British Isles. The line here stops before that later campaign.',3,['san-martin'],'courses',1)]}),
encounter({id:'downs',name:'The Downs',year:1639,date:'21 October 1639 (New Style)',place:'The Downs · Kent coast',era:'Dutch maritime ascendancy',takeaway:'A convoy trapped in an anchorage.',seaLabel:'THE DOWNS',terrain:'roads',sides:['Dutch fleet','Spanish fleet'],sources:[DOWNS,DOWNS2,DOWNS3],introduction:'Tromp’s Dutch fleet attacks Spanish naval forces sheltered off Kent. The victory is a landmark in the struggle for maritime power during the Eighty Years’ War.',ships:[
ship('aemilia','Aemilia',0,'sail','Tromp’s flagship, identified in the Dutch heritage record.',course([240,300,90],[350,300,90],[510,270,55],[600,260,40],[630,240,30]),{source:1}),
ship('downs-spanish','Spanish anchorage · marker',1,'sail','Representative Spanish force; no individual ship identity or loss is assigned.',course([670,270,350],[670,270,350],[670,270,350],[710,235,30],[790,200,45]),{representative:true})],chapters:[
chapter('Shelter','A fleet off a foreign coast','The Spanish fleet lies in the Downs off England. Anchorage, coastal space and the surrounding fleets shape its options.',['downs-spanish'],2),
chapter('Contain','Tromp closes in','The Dutch force presses the sheltered fleet. Follow Aemilia as the diagram narrows the space between the sides.',['aemilia'],1),
chapter('Attack','The anchorage becomes a battlefield','The Dutch assault breaks the Spanish position. These few markers condense a much larger engagement.',['aemilia','downs-spanish'],2),
chapter('Disperse','The Spanish force is scattered','Ships are lost, taken or escape. The surviving wreck record does not justify assigning a name and sinking to each marker.',['downs-spanish'],2),
chapter('Outcome','A Dutch naval landmark','The victory is commemorated by a contemporary Dutch medal. Commemoration is evidence of contemporary meaning, not a neutral tactical chart.',['aemilia'])],questions:[
question('Why show the coast?','Shelter can become a trap','The anchorage constrains the fleet. Coast shapes remain illustrative rather than navigational.',0,['downs-spanish']),
question('Which ship is Aemilia?','A documented flagship','The Dutch heritage record identifies Tromp’s ship; the generic hull does not reproduce its exact appearance.',1,['aemilia'],'courses',1),
question('Why no X on these markers?','Uncertain wreck identities','Historic England warns that many losses cannot be matched reliably to named ships. The chart leaves those individual fates unassigned.',4,['downs-spanish'],'courses',2)]}),
encounter({id:'quiberon',name:'Quiberon Bay',year:1759,date:'20 November 1759',place:'Quiberon Bay · Brittany',era:'Sail in storm waters',takeaway:'Pursuit into dangerous water.',seaLabel:'QUIBERON BAY',terrain:'gulf',sides:['British fleet','French fleet'],sources:[QUIBERON],introduction:'Hawke pursues Conflans into a reef-strewn bay as weather and darkness worsen. The encounter damages French plans to invade Britain.',ships:[
ship('royal-george','Royal George',0,'sail','Hawke’s flagship in the pursuit.',course([220,350,70],[380,290,60],[550,240,45],[630,190,30],[650,180,30])),
ship('soleil-royal','Soleil Royal',1,'sail','Conflans’ flagship. Grounded and burnt the following day; not shown as a battle sinking.',course([480,270,60],[580,230,55],[680,180,35],[760,140,25],[790,110,20])),
ship('superbe','Superbe',1,'sail','French ship lost during the action in gunfire and heavy weather.',course([440,335,65],[530,310,60],[620,285,50],[650,270,45],[650,270,45]),{fate:{kind:'sunk',at:.82,source:0,text:'Sunk during the battle. The museum attributes the French sinkings to gunfire combined with weather; the marker onset is an authored teaching point.'}})],chapters:[
chapter('Pursuit','Hawke catches the French fleet','The British pursue Conflans toward the Breton coast. These paths communicate pursuit, not recovered tracks.',['royal-george','soleil-royal']),
chapter('Bay','Conflans seeks shelter','The French turn into Quiberon Bay, relying on local knowledge and its dangerous approaches.',['soleil-royal']),
chapter('Follow','Hawke accepts the risk','The British follow despite reefs, weather and approaching darkness. Geography is an active part of the encounter.',['royal-george']),
chapter('Losses','Gunfire and the sea','Superbe and Thésée sink. Only Superbe is individually represented here; this is not a complete loss count.',['superbe']),
chapter('Outcome','A fleet dispersed','The French force is badly disrupted. Soleil Royal’s destruction the following day lies outside this replay’s battle-loss markers.',['soleil-royal','superbe'])],questions:[
question('Why enter such dangerous water?','Pursuit becomes commitment','Hawke follows a fleet that expected the bay itself to deter him.',2,['royal-george','soleil-royal']),
question('Did cannon fire alone sink Superbe?','Weather is part of the evidence','The museum describes gunfire and weather together. The X does not assign one illustrative projectile as the cause.',3,['superbe']),
question('Why is Soleil Royal not crossed out?','Later destruction is separate','Its grounding and burning belong to the following day. This replay does not turn that later loss into a sinking during the battle.',4,['soleil-royal'])]}),
encounter({id:'chesapeake',name:'Chesapeake',year:1781,date:'5 September 1781',place:'Virginia Capes · Atlantic',era:'Sea control & independence',takeaway:'A battle for access, not annihilation.',seaLabel:'VIRGINIA CAPES',sides:['French fleet','British fleet'],sources:[CAPES],introduction:'De Grasse’s fleet contests the sea route to Yorktown. A tactically limited action has consequences far beyond the ships exchanging fire.',ships:[
ship('de-grasse','French command · marker',0,'sail','Representative command marker for de Grasse’s fleet, not an identified vessel or measured flagship track.',course([300,200,100],[450,230,100],[610,270,100],[650,300,110],[480,190,280]),{representative:true}),
ship('graves','British command · marker',1,'sail','Representative command marker for Graves’s fleet, not an identified vessel or measured flagship track.',course([250,370,85],[430,360,85],[600,345,90],[680,370,110],[820,430,130]),{representative:true})],chapters:[
chapter('Block','Yorktown depends on the sea','French naval control threatens British relief and evacuation of Cornwallis’s army. The objective is access to the Chesapeake.',['de-grasse']),
chapter('Sail','The French leave the bay to fight','Graves’s British fleet arrives. De Grasse moves to meet it off the capes.',['de-grasse','graves']),
chapter('Engage','The lines exchange fire','The fleets fight off Virginia. The chart simplifies the line formations and does not claim every ship is equally engaged.',['de-grasse','graves']),
chapter('Separate','Fighting does not destroy either fleet','The fleets disengage. Tactical survival does not automatically secure the strategic objective.',['graves']),
chapter('Outcome','The relief route stays closed','French command of the bay helps make the allied victory at Yorktown possible. No invented sinking is needed to explain the result.',['de-grasse'])],questions:[
question('Why is this battle critical?','Yorktown needs the fleet','The battle helps prevent British relief of Cornwallis. A sea battle can decide a land campaign.',4,['de-grasse']),
question('Why are there no sunk markers?','Control is the measure','The central teaching point is access to the bay. Unnamed markers do not receive invented individual losses.',4,['graves']),
question('Are these exact flagship tracks?','Command markers, not ship logs','The diagram represents the opposing commands and formations. It does not identify these symbols as particular named warships.',0,['de-grasse','graves'])]}),
encounter({id:'nile',name:'The Nile',year:1798,date:'1–2 August 1798',place:'Aboukir Bay · Egypt',era:'An anchored fleet at night',takeaway:'Attack both sides of a line.',seaLabel:'ABOUKIR BAY',terrain:'gulf',sides:['British fleet','French fleet'],sources:[NILE,NILE2,NILE3],introduction:'Nelson finds the French battle fleet anchored in Aboukir Bay. British ships enter a night action that severs the expedition’s naval support.',ships:[
ship('vanguard','HMS Vanguard',0,'sail','Nelson’s flagship during the attack.',course([200,340,70],[360,270,60],[530,220,20],[540,220,0],[540,220,0])),
ship('orient','Orient',1,'sail','French flagship destroyed in the night action.',line(640,240,350),{fate:{kind:'sunk',at:.8,source:2,text:'Destroyed by a major explosion during the night action. The X records the ship’s loss; its replay threshold and location are schematic.'}})],chapters:[
chapter('Find','The French fleet is at anchor','The British find the French battle fleet in Aboukir Bay. Anchoring shapes what the fleet can defend and how quickly it can react.',['orient']),
chapter('Enter','An immediate attack','Nelson attacks late in the day rather than waiting for the next morning. The engagement develops into the night.',['vanguard']),
chapter('Envelop','Pressure on the anchored line','British ships engage the French line from both sides. The diagram compresses the fleet into selected vessels and formation markers.',['vanguard','orient']),
chapter('Explosion','Orient is destroyed','The French flagship explodes during the night. Its loss is documented; the schematic X avoids inventing a particular shell as the trigger.',['orient'],2),
chapter('Outcome','The expedition loses its fleet','The British victory destroys or captures much of the French battle fleet. Nelson’s dispatch is a participant’s account of that victory.',['vanguard'],1)],questions:[
question('Why attack an anchored line?','Look for the unguarded side','A fleet at anchor still has guns, but its arrangement creates opportunities for an attacker to concentrate fire.',2,['orient','vanguard']),
question('Is the explosion an ordinary hit effect?','A documented catastrophe','Orient’s destruction was a major event, not the normal result of every round shot. Its loss marker comes from a source, not a damage calculation.',3,['orient'],'courses',2),
question('What did this change ashore?','Naval support is cut','The French expedition in Egypt loses the fleet that supported its position. A battle at sea changes the campaign on land.',4,['vanguard'],'courses',1)]}),
encounter({id:'lissa',name:'Lissa',year:1866,date:'20 July 1866',place:'Off Lissa (Vis) · Adriatic',era:'Ironclads & the ram',takeaway:'Smoke, confusion and a fatal collision.',introduction:'Austrian and Italian ironclads meet off Lissa. Re d’Italia’s loss makes this a famous ramming battle, but command, visibility and fleet cohesion also matter.',seaLabel:'ADRIATIC SEA',sides:['Austrian fleet','Italian fleet'],sources:[LISSA,LISSA2],wind:'Steam propulsion · wind not plotted',ships:[
ship('ferdinand-max','Ferdinand Max',0,'ironclad','Tegetthoff’s flagship. Rams Re d’Italia during the battle.',course([250,330,70],[390,280,65],[540,250,75],[605,250,90],[580,230,320])),
ship('re-italia','Re d’Italia',1,'ironclad','Italian ironclad sunk after being rammed by Ferdinand Max.',course([680,260,0],[670,250,0],[650,250,0],[640,250,0],[640,250,0]),{fate:{kind:'sunk',at:.78,source:1,text:'Sunk after being rammed by Ferdinand Max on 20 July 1866. The replay marks a documented loss, not a simulated collision or exact sinking minute.'}})],chapters:[
chapter('Island','The Italians operate against Lissa','The Austrian fleet approaches Italian forces engaged around the island. This is an ironclad encounter, not a sailing-line replay.',['re-italia']),
chapter('Approach','Tegetthoff closes the distance','The Austrian force moves toward the Italians. Steam allows movement independent of sailing wind.',['ferdinand-max']),
chapter('Melee','Command and visibility break down','The engagement becomes confused. Generic smoke and compact markers explain the difficulty without claiming exact sight lines.',['ferdinand-max','re-italia']),
chapter('Ram','A close encounter turns fatal','Ferdinand Max rams Re d’Italia, which sinks. The paths illustrate the documented encounter; collision physics are not calculated.',['ferdinand-max','re-italia'],1),
chapter('Outcome','An Austrian victory','Italy loses Re d’Italia and Palestro. Only the former is individually represented; a pair of symbols is not a fleet loss total.',['re-italia'])],questions:[
question('What does the X mean here?','A documented ramming loss','The Italian navy’s ship record identifies both the lost vessel and the ship that rammed it.',3,['re-italia'],'courses',1),
question('Did every ironclad try to ram?','Do not turn one event into a rule','The replay highlights one documented ramming. It does not assume that every track or close pass is a successful ram.',2,['ferdinand-max','re-italia']),
question('Where is Palestro?','A selective diagram','The second Italian loss is explained in the source-linked story, but no unnamed formation marker is silently renamed as that ship.',4,['re-italia'])]}),
encounter({id:'manila-bay',name:'Manila Bay',year:1898,date:'1 May 1898',place:'Cavite · Philippines',era:'Steel cruisers & empire',takeaway:'Repeated passes against a weaker squadron.',seaLabel:'MANILA BAY',terrain:'gulf',sides:['United States squadron','Spanish squadron'],sources:[MANILA,MANILA2],wind:'Steam propulsion · wind not plotted',introduction:'Dewey’s squadron enters Manila Bay and attacks Montojo’s force near Cavite. Naval victory opens a new chapter of colonial conflict rather than settling the Philippines’ future.',ships:[
ship('olympia','USS Olympia',0,'cruiser','Dewey’s flagship. Its curved course stands for repeated firing passes, not a recorded track.',course([210,400,60],[420,280,60],[700,210,100],[420,340,270],[610,240,60])),
ship('reina-cristina','Reina Cristina',1,'cruiser','Montojo’s flagship, badly damaged and abandoned during the action.',course([640,300,270],[600,300,270],[550,290,270],[650,290,90],[650,290,90]),{fate:{kind:'sunk',at:.84,source:0,text:'Scuttled in shallow water after severe battle damage. The NHHC account distinguishes this deliberate sinking from a ship sunk outright by a particular projectile. The replay threshold is schematic.'}}),
ship('castilla','Castilla',1,'cruiser','Spanish wooden cruiser. Generic steam-cruiser model, not a steel-hull claim.',line(700,370,270),{fate:{kind:'sunk',at:.9,source:1,text:'Montojo reports Castilla burning and sinking after shellfire. Its loss is shown at an authored late-replay point; the model is a generic cruiser.'}})],chapters:[
chapter('Enter','The squadron reaches the bay','Dewey brings his squadron into Manila Bay. Coastal batteries and the harbour setting matter alongside the ships.',['olympia']),
chapter('Passes','The American ships keep moving','The squadron makes repeated firing passes near Cavite. The single curved course condenses those movements.',['olympia','reina-cristina']),
chapter('Damage','The Spanish position deteriorates','Montojo’s squadron suffers heavily. Selected reported exchanges are linked in the event guide. The animation represents those episodes rather than reconstructing every individual round.',['reina-cristina','castilla'],1),
chapter('Losses','Burning, abandonment and sinking','Reina Cristina is scuttled after severe damage; Castilla burns and sinks. Their sourced status markers are independent of the illustrative cannon effects.',['reina-cristina','castilla'],1),
chapter('Outcome','A fleet defeated, an unsettled future','The United States wins the naval action. The wider story includes Spanish colonial rule and the later struggle over Philippine independence.',['olympia'])],questions:[
question('Why does Olympia keep passing?','Movement supports the attack','Repeated passes allow the squadron to maintain its attack. The plotted curve is compressed, not a measured turning circle.',1,['olympia']),
question('Are these ordinary round-shot effects?','Different guns, the same evidence limit','This is a late nineteenth-century shellfire battle. Generic animation does not establish a specific calibre, shell type or hit sequence.',2,['olympia','castilla']),
question('What do the two X marks prove?','Losses, not hit attribution','They identify two documented lost ships. They do not prove which American ship fired a particular fatal shot.',4,['reina-cristina','castilla'],'courses',1)]})
];

// Additional participants selected to anchor documented firing episodes.
const diu=EXTRA_BATTLES.find(b=>b.id==='diu');
diu.ships.push(ship('egyptian-rear','Egyptian rear carrack (unnamed)',1,'sail','Selected rear carrack described in the Portuguese account, not a recovered vessel name. Distinct from the generic coalition markers.',line(610,335,270),{fate:{kind:'sunk',at:.7,source:0,text:'The Portuguese Ministry of Defence account describes Flor de la Mar’s artillery sinking the last carrack in the Egyptian line. Its name, exact hit sequence and sinking minute are not assigned.'}}));
const gravelines=EXTRA_BATTLES.find(b=>b.id==='gravelines');
gravelines.sources.push(source('National Museum of the Royal Navy · Armada Map 10','https://armadamaps.nmrn.org.uk/the-maps/map-10/','Explains Drake’s attack on San Martín and the Spanish recovery of formation; calendar conventions differ across the collection.'));
gravelines.ships.push(ship('revenge','Revenge',0,'sail','Drake’s ship in the attack on San Martín. The hull and continuous route remain generic.',course([250,360,70],[400,320,65],[590,290,60],[650,260,35],[640,230,20]),{source:2}));

gravelines.sources.push(source('Royal Museums Greenwich · Drake in Revenge attacks San Martín','https://www.rmg.co.uk/collections/objects/rmgc-object-155962','Collection record identifies the ships; the artwork title uses a different calendar date.'));
gravelines.ships.find(s=>s.id==='revenge').source=3;

// Individually described ships used by the damage replay. Paths remain schematic.
function addParticipant(battleId,vessel){
  EXTRA_BATTLES.find(battle=>battle.id===battleId).ships.push(vessel);
}
addParticipant('diu',ship('great-diu-ship','Great ship of Diu (unnamed)',1,'sail',
  'The large Gujarati ship whose breached hull ended the battle. A separate vessel from the Egyptian rear carrack.',
  line(750,408,260),{fate:{kind:'sunk',at:.95,source:0,text:'The Portuguese account describes the large ship’s hull taking water after sustained artillery fire. Its sinking closed the battle.'}}));
addParticipant('downs',ship('santa-teresa','Santa Teresa',1,'sail',
  'Portuguese flagship in the Spanish fleet. Set alight by Dutch fireships and destroyed in the action.',
  course([708,330,350],[708,330,350],[730,320,25],[760,297,40],[762,298,40]),{source:2}));
addParticipant('quiberon',ship('magnanime','HMS Magnanime',0,'sail',
  'Howe’s ship in the British van. Lost the foreyard in the action with Formidable.',
  course([266,272,70],[455,252,75],[625,211,45],[675,155,30],[695,135,20])));
addParticipant('chesapeake',ship('intrepid','HMS Intrepid',1,'sail',
  'Ship in the British van. The Graves Papers preserve her battle damage return.',
  course([363,353,82],[480,349,83],[667,316,86],[732,340,106],[800,380,120])));
addParticipant('nile',ship('bellerophon','HMS Bellerophon',0,'sail',
  'Engaged Orient and drifted away after being dismasted.',
  course([236,421,70],[391,367,60],[608,307,31],[660,324,50],[733,387,74]),{source:1}));
