// Historical sequence is sourced; coordinates are authored teaching diagrams.
// x/y are diagram units, heading is clockwise from north. No combat is adjudicated.
const RMG = { title: 'Royal Museums Greenwich · Beginning of the Action', url: 'https://www.rmg.co.uk/collections/objects/rmgc-object-12040', note: 'Collection commentary on fleet approach, flagships and the breaking of the line.' };
const NMRN = { title: 'National Museum of the Royal Navy · Trafalgar', url: 'https://www.royalnavymuseums.org.uk/news/trafalgar-day-battle-trafalgar', note: 'Battle sequence, two columns, close action and outcome.' };
const PLAN = { title: 'Royal Collection Trust · Nelson’s tactical memorandum', url: 'https://www.rct.uk/collection/1198306/fair-copy-of-memoranda-issued-by-lord-nelson-regarding-tactics-and-sailing', note: 'A contemporary plan, not a record of the exact tracks sailed.' };
const LEPANTO = { title: 'Spanish Ministry of Culture · Lepanto archive', url: 'https://www.cultura.gob.es/cultura/areas/archivos/mc/archivos/nhn/destacados/documentos-destacados/lepanto.html', note: 'Archival context, opposing forces and a contemporary description of close combat. Spanish.' };
const GALLEYS = { title: 'Museo Naval · The two flagships', url: 'https://armada.defensa.gob.es/archivo/museonaval/02museo/08museodigital/Itinerariosinfantiles/Lepanto.pdf', note: 'Museum teaching resource identifying Real and Sultana. Spanish PDF.' };
const LEPANTO2 = { title: 'Museo Casa de Cervantes · The naval battle', url: 'https://www.cultura.gob.es/dam/jcr%3A00026a94-e2e1-4be0-b338-637b7638d82c/battle-of-lepanto.pdf', note: 'Museum overview of the coalition, artillery, infantry and outcome. PDF.' };
const NOAA = { title: 'NOAA · Battle of Hampton Roads', url: 'https://monitor.noaa.gov/150th/hampton.html', note: 'The arrival of Monitor, protection of Minnesota and the inconclusive ironclad duel.' };
const NHHC = { title: 'Naval History and Heritage Command · Hampton Roads', url: 'https://www.history.navy.mil/browse-by-topic/wars-conflicts-and-operations/civil-war/cw-operations-and-engagements/1862-civil-war/hampton-roads.html', note: 'Historical overview and further reading on the two-day battle.' };
const YALU = { title: 'U.S. Naval Institute · The Battle of the Yalu (1895)', url: 'https://www.usni.org/magazines/proceedings/1895/july/battle-yalu', note: 'Near-contemporary accounts and corrections disagree on formations and losses. Read critically; terminology is of its time.' };
const YALU2 = { title: 'U.S. Naval Institute · The War of Jiawu', url: 'https://www.usni.org/magazines/naval-history-magazine/2021/april/enduring-legacy-war-jiawu', note: 'Modern discussion of fleet training, command and the 1894 engagement.' };
const YALU3 = { title: 'Royal Museums Greenwich · An 1894 account', url: 'https://www.rmg.co.uk/collections/archive/rmgc-object-498848', note: 'Catalogue record for a contemporary manuscript. The manuscript itself is not reproduced here.' };

function ship(id, name, side, type, role, points, source = 0, representative = false) {
  return { id, name, side, type, role, points, source, representative };
}
function chapter(label, title, text, focus, source = 0) { return { label, title, text, focus, source }; }
function question(label, title, text, phase, focus, layer, source = 0) { return { label, title, text, phase, focus, layer, source }; }

const trafalgarShips = [
  ship('victory', 'HMS Victory', 0, 'sail', 'Nelson’s flagship. Leads the weather column into the allied centre.', [[280,260,90],[400,260,90],[680,260,85],[680,270,15],[685,260,15]]),
  ship('sovereign', 'HMS Royal Sovereign', 0, 'sail', 'Collingwood’s flagship. Leads the leeward column toward the allied rear.', [[300,470,90],[440,470,90],[740,470,80],[740,470,5],[745,455,5]]),
  ship('bucentaure', 'Bucentaure', 1, 'sail', 'Villeneuve’s flagship. Victory passes across her stern when breaking the line.', [[620,225,350],[630,210,350],[640,200,350],[650,210,335],[650,210,335]]),
  ship('redoutable', 'Redoutable', 1, 'sail', 'French ship that fights Victory at close quarters after the line is broken.', [[638,305,350],[650,290,350],[660,280,350],[685,285,15],[700,285,15]],1),
];
// Representative markers communicate formation without pretending to be a complete order of battle.
for (let i=1;i<=4;i++) for (let column=0;column<2;column++) {
  const lead = column ? trafalgarShips[1] : trafalgarShips[0];
  trafalgarShips.push(ship(`british-${column}-${i}`, `British ${column?'leeward':'weather'} column · marker ${i}`, 0, 'sail', 'Representative ship marker. Shows the shape of this division; no individual vessel or fate is assigned.', lead.points.map(([x,y,h],n)=>[x-i*55, y+(n>2 ? i*12 : 0),h]),0,true));
}
for (let i=0;i<8;i++) {
  const y=80+i*69; if (i===2||i===3) continue;
  trafalgarShips.push(ship(`allied-${i}`, `Allied line · marker ${i+1}`, 1, 'sail', 'Representative French or Spanish ship marker. The full allied fleet is larger than this diagram.', [[600+i*14,y,350],[610+i*14,y-12,350],[620+i*14,y-22,350],[640+i*14,y-22,i<3?320:20],[650+i*14,y-22,i<3?320:20]],0,true));
}

const lepantoShips = [
  ship('real','Real',0,'galley','Don Juan of Austria’s flagship. Meets the Ottoman flagship in close combat.',[[260,305,90],[370,305,90],[465,305,90],[495,305,90],[495,305,90]],1),
  ship('sultana','Sultana',1,'galley','Ali Pasha’s flagship. Captured after the struggle with Real.',[[750,305,270],[650,305,270],[555,305,270],[530,305,270],[530,305,270]],1),
];
for(let side=0;side<2;side++) for(let i=0;i<7;i++) {
  if(i===3) continue;
  const y=115+i*64, x=side?780:230;
  lepantoShips.push(ship(`galley-${side}-${i}`,`${side?'Ottoman':'Holy League'} formation · marker ${i+1}`,side,'galley','Representative galley marker. Oars are shown to distinguish this fleet from later sailing formations.',[[x,y,side?270:90],[side?670:350,y,side?270:90],[side?570:455,y,side?270:90],[side?550:480,y+8,side?260:100],[side?680:500,y+15,side?90:100]],0,true));
}

const hamptonShips = [
  ship('monitor','USS Monitor',0,'monitor','Union turreted ironclad. Its task on 9 March is to protect the grounded Minnesota.',[[280,280,120],[400,350,120],[560,350,25],[480,250,300],[300,280,270]]),
  ship('virginia','CSS Virginia',1,'ironclad','Confederate casemate ironclad. Returns to Hampton Roads after attacking wooden warships the previous day.',[[770,450,300],[650,380,300],[610,305,320],[670,370,130],[805,470,130]]),
  ship('minnesota','USS Minnesota',0,'sail','Grounded Union steam frigate. Remains stationary in this diagram because it is aground.',[[260,170,50],[260,170,50],[260,170,50],[260,170,50],[260,170,50]]),
];

const yaluShips = [
  ship('dingyuan','Dingyuan',1,'ironclad','Chinese battleship, recorded as Ting Yuen in the 1895 source. One of the two armoured ships in the centre.',[[510,295,180],[510,340,180],[490,365,190],[510,370,180],[520,355,160]]),
  ship('zhenyuan','Zhenyuan',1,'ironclad','Chinese battleship, recorded as Chen Yuen in the 1895 source. Fights alongside Dingyuan.',[[580,295,180],[580,340,180],[560,365,170],[580,370,170],[590,355,160]]),
  ship('yoshino','Yoshino',0,'cruiser','Fast Japanese cruiser leading the flying squadron.',[[180,500,60],[430,510,85],[770,415,20],[735,185,280],[400,170,270]]),
  ship('matsushima','Matsushima',0,'cruiser','Japanese flagship. Its damage is a reminder that the winning fleet also suffered.',[[110,530,60],[330,535,85],[665,480,40],[810,270,345],[575,150,270]]),
];
for(let side=0;side<2;side++) for(let i=0;i<4;i++) {
  const lead=yaluShips[side?0:2];
  yaluShips.push(ship(`steam-${side}-${i}`,`${side?'Chinese':'Japanese'} formation · marker ${i+1}`,side,'cruiser','Representative fleet marker. Exact tracks and relative spacing are interpretive.',lead.points.map(([x,y,h],n)=>side?[x+(i-1.5)*90,y-70+Math.abs(i-1.5)*30,h]:[x-(i+1)*34,y+(n>1?(i+1)*17:0),h]),side?0:1,true));
}

export const BATTLES = [
  {
    id:'lepanto', name:'Lepanto', year:1571, date:'7 October 1571', place:'Gulf of Patras · Mediterranean', era:'Oars & boarding', takeaway:'A battle fought at arm’s length.',
    introduction:'Opposing galley fleets close across the gulf. Artillery opens the fight; soldiers decide much of it on crowded decks.',
    sides:['Holy League','Ottoman fleet'], ships:lepantoShips, sources:[LEPANTO,GALLEYS,LEPANTO2], defaultShip:'real', wind:'Oar-powered approach', windAngle:90,
    terrain:'gulf', seaLabel:'GULF OF PATRAS',
    chapters:[
      chapter('Approach','Two fleets, one gulf','The Holy League approaches from the west; the Ottoman fleet faces it from the east. These markers condense much larger forces.',['real','sultana']),
      chapter('Close in','The distance disappears','The long, narrow galleys bring opposing formations together. The museum account describes stronger Holy League artillery and well-armed infantry.',['real','sultana'],2),
      chapter('Contact','From gunfire to boarding','Close combat brings vessels together. The archive preserves a description of galleys entangled in a confused struggle.',['real','sultana']),
      chapter('Flagships','A fight at the centre','Real and Sultana fight directly. Ali Pasha is killed and his flagship is captured. The paths illustrate this encounter, not recorded tracks.',['real','sultana'],1),
      chapter('Outcome','A Holy League victory','The Ottoman fleet is defeated. The simplified withdrawal here communicates the outcome without assigning a fate to each marker.',['sultana'],2),
    ],
    questions:[
      question('Why are the ships so narrow?','Built around the rowing benches','These are galley symbols: long hulls, oars and bow-facing weapons. The diagram contrasts their close approach with the broadside formations of Trafalgar.',1,['real','sultana'],'weapons',1),
      question('What happened to the flagships?','Follow the centre','Select the highlighted Real and Sultana. Their encounter ends in the capture of the Ottoman flagship.',3,['real','sultana'],'courses',1),
      question('How certain are these routes?','A teaching diagram','The sources establish the encounter and outcome. Continuous tracks, distances and marker spacing are authored illustrations, not recovered navigation records.',0,['real','sultana'],'courses',0),
    ],
  },
  {
    id:'trafalgar', name:'Trafalgar', year:1805, date:'21 October 1805', place:'Off Cape Trafalgar · Atlantic', era:'The age of sail', takeaway:'Two columns. A broken line.',
    introduction:'Watch the British columns approach a longer French and Spanish line. Explore the risk of closing head-on before turning to fight.',
    sides:['British fleet','French & Spanish fleet'], ships:trafalgarShips, sources:[RMG,NMRN,PLAN], defaultShip:'victory', wind:'Light wind · illustrative direction', windAngle:115,
    terrain:'open', seaLabel:'ATLANTIC OCEAN',
    chapters:[
      chapter('Approach','Two columns, one long line','Victory and Royal Sovereign lead separate British columns toward the allied line. The approach is slow in the light wind.',['victory','sovereign']),
      chapter('Under fire','The price of the approach','The leading British ships face allied broadsides while closing. Their bows cannot bring the same weight of guns to bear.',['victory','sovereign'],1),
      chapter('Break through','Cut the line in two places','Collingwood attacks toward the rear; Nelson enters around the centre. Victory crosses the stern of Bucentaure.',['victory','sovereign','bucentaure']),
      chapter('Close action','The formation becomes a melee','Victory fights Redoutable at close quarters. Following British ships enter the gaps, turning a fleet formation into smaller engagements.',['victory','redoutable'],1),
      chapter('Outcome','Victory at a human cost','The British defeat the allied fleet. Nelson is mortally wounded during the fighting. The war itself continues for nearly another decade.',['victory'],1),
    ],
    questions:[
      question('Why approach in two columns?','Concentrate the attack','The plan divides the enemy line into sections. The two highlighted flagships show where the British columns converge on it.',2,['victory','sovereign'],'courses',2),
      question('Why not fire straight ahead?','The broadside trade-off','Sailing battleships carry their main batteries along the sides. The translucent sectors explain this geometry; they are not measured gun ranges.',1,['victory','sovereign'],'weapons',1),
      question('What does the wind change?','A slow, exposed approach','Light wind slows the British advance. Switch on courses to follow the leading ships toward the allied line.',0,['victory','sovereign'],'wind',1),
    ],
  },
  {
    id:'hampton-roads', name:'Hampton Roads', year:1862, date:'9 March 1862', place:'Hampton Roads · Virginia', era:'Iron & steam', takeaway:'Armour changes the question.',
    introduction:'On the second day of the battle, two ironclads meet beside a grounded wooden frigate. The objective is protection, not annihilation.',
    sides:['Union navy','Confederate navy'], ships:hamptonShips, sources:[NOAA,NHHC], defaultShip:'monitor', wind:'Steam propulsion · wind not plotted', windAngle:0,
    terrain:'roads', seaLabel:'HAMPTON ROADS',
    chapters:[
      chapter('Protect','Minnesota cannot manoeuvre','After the previous day’s attack, Minnesota lies aground. Monitor has arrived to protect the stranded Union frigate.',['minnesota','monitor']),
      chapter('Intercept','A new opponent','Virginia returns on 9 March. Monitor moves out to meet her, away from Minnesota.',['monitor','virginia']),
      chapter('Duel','Iron meets iron','The armoured ships exchange fire for hours without either sinking the other. This is a compressed sequence, not a minute-by-minute replay.',['monitor','virginia']),
      chapter('Disengage','Different readings of the fight','A hit injures Monitor’s commander, Worden. Monitor pulls away to assess damage; Virginia later withdraws as well.',['monitor','virginia']),
      chapter('Outcome','A draw, a protected ship','Neither ironclad wins a decisive tactical victory. Monitor returns to Minnesota: protecting the frigate remains its task.',['monitor','minnesota']),
    ],
    questions:[
      question('Why is one ship not moving?','The mission is beside it','Minnesota is aground. Its stationary marker explains why Monitor cannot simply pursue an opponent indefinitely.',0,['minnesota','monitor'],'courses'),
      question('What is different about Monitor?','A rotating turret','Monitor’s turret lets its guns turn independently of the hull. The circular overlay shows the principle, not unrestricted real-world firing clearance.',2,['monitor'],'weapons'),
      question('Who won this encounter?','Look at the objective','The duel is inconclusive. Monitor protects Minnesota while Virginia survives and withdraws. There is more to the outcome than a sinking.',4,['minnesota','virginia'],'courses'),
    ],
  },
  {
    id:'yalu', name:'The Yalu', year:1894, date:'17 September 1894', place:'Yellow Sea · off the Yalu', era:'Steam fleet action', takeaway:'Speed, formation, concentrated fire.',
    introduction:'Japanese and Chinese fleets meet in the Yellow Sea. Fast cruisers and heavy armoured ships present very different tactical possibilities.',
    sides:['Japanese fleet','Chinese Beiyang Fleet'], ships:yaluShips, sources:[YALU,YALU2,YALU3], defaultShip:'yoshino', wind:'Steam propulsion · wind not plotted', windAngle:0,
    terrain:'open', seaLabel:'YELLOW SEA',
    chapters:[
      chapter('Encounter','Two fleets converge','The battle takes place at sea on 17 September 1894. Dingyuan and Zhenyuan form the Chinese armoured centre.',['dingyuan','zhenyuan']),
      chapter('Pass','A moving column','The Japanese column includes a fast flying squadron led by Yoshino. Its movement contrasts with the Chinese central battleships.',['yoshino','matsushima']),
      chapter('Turn','Formation matters','Japanese training in following signals and maintaining tactical order is an important part of the modern account.',['yoshino','matsushima'],1),
      chapter('Concentrate','Ships fight different battles','Accounts describe Japanese divisions engaging the Chinese centre and scattered ships. The curved tracks illustrate that relationship, not exact turning circles.',['dingyuan','zhenyuan','matsushima']),
      chapter('Outcome','A Japanese victory','The Japanese win the encounter, but some ships, including Matsushima, sustain damage. A fleet’s result is not the same as every ship’s experience.',['matsushima']),
    ],
    questions:[
      question('Why follow the faster ships?','Watch the flying squadron','The cruiser column can change the geometry of the engagement. Follow Yoshino’s schematic course around the opposing centre.',2,['yoshino'],'courses',1),
      question('Did armour guarantee victory?','Two different strengths','The Chinese battleships remain central to the fight; Japanese movement and gunfire shape the encounter. Armour alone does not explain the result.',3,['dingyuan','zhenyuan','yoshino'],'weapons',0),
      question('Do the accounts agree?','The record has disagreements','The 1895 article includes conflicting descriptions and later corrections. These routes deliberately avoid claiming exact formation or spacing.',0,['dingyuan','zhenyuan'],'courses',0),
    ],
  },
];
