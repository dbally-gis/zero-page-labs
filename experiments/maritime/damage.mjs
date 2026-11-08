// Evidence establishes the damage, not these illustrative replay thresholds or geometry.
const evidence=(title,url)=>({title,url});
const stage=(at,title,text,source,visual)=>({at,title,text,source,...visual});

const DIU=evidence('Portuguese Ministry of Defence · Diu 1509','https://www.defesa.gov.pt/pt/defesa/organizacao/comissoes/cphm/edicoes/ano3/n.5/3/');
const GRAVES=evidence('The Graves Papers · Intrepid damage return, p. 70','https://upload.wikimedia.org/wikipedia/commons/b/ba/The_Graves_papers_and_other_documents_relating_to_the_naval_operations_of_the_Yorktown_campaign%2C_July_to_October%2C_1781_%28IA_gravespapersothe00chad%29.pdf');
const MATSUSHIMA=evidence('Japanese naval surgical report · Matsushima, pp. 5–6','https://upload.wikimedia.org/wikipedia/commons/3/3b/The_Surgical_history_of_the_naval_war_between_Japan_%26amp%2C_China_-_during_1894-95_%3B_translated_from_the_original_Japanese_report_%28IA_surgicalhistoryo00unse%29.pdf');
const MONTOJO=evidence('Naval History and Heritage Command · Admiral Montojo’s report','https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/s/selected-documents-of-the-spanish-american-war/official-spanish-report-on-battle-of-manila-bay.html');

export const DAMAGE = {
  diu: {
    'great-diu-ship': [
      stage(.87,'Hull breached and taking water','The Portuguese military history describes sustained artillery breaking open the great Gujarati ship’s hull. The breach mark is schematic.',DIU,{marks:['hull']})
    ]
  },
  lepanto: {
    real: [
      stage(.63,'Forward rail splintered','Fernández Duro’s history describes Sultana’s spur breaking Real’s rail during the bow-to-bow encounter.',evidence('Spanish Naval History Institute · Fernández Duro, p. 157','https://armada.defensa.gob.es/html/historiaarmada/tomo2/tomo_02_10.pdf'),{marks:['bow']})
    ]
  },
  gravelines: {
    'san-martin': [
      stage(.61,'Shot holes and flooding','A Spanish naval history quotes an account of shot penetrating San Martín’s planking. The crew pumped out water and plugged the holes with lead plates.',evidence('Revista de Historia Naval · Gravelines, p. 20','https://armada.defensa.gob.es/archivo/mardigitalrevistas/rhn/2012/201216.pdf'),{marks:['hull']})
    ]
  },
  downs: {
    'santa-teresa': [
      stage(.62,'Fire aboard Santa Teresa','Historic England’s record links the Portuguese flagship to the fireships and reproduces a contemporary report of it burning. The replay shows the fire phase of her documented destruction. The scorched area is illustrative.',evidence('Historic England · contemporary Downs accounts','https://historicengland.org.uk/listing/heritage-gateway/results/record/0d636742-8028-4a8c-8b7c-e1f9aaf2d338/f65d1bab-73ed-4179-9f34-63ee8144ddf1'),{marks:['burn']})
    ]
  },
  quiberon: {
    magnanime: [
      stage(.42,'Foreyard carried away','The Naval Institute account describes Magnanime losing its foreyard while passing Formidable. The lower forward sail drops from the illustration.',evidence('U.S. Naval Institute · Lessons from Quiberon Bay','https://www.usni.org/magazines/proceedings/2018/february/chaos-under-control-lessons-quiberon-bay'),{yardLost:'fore-course'})
    ]
  },
  chesapeake: {
    intrepid: [
      stage(.66,'Topsails cut and fore topsail yard broken','Intrepid’s damage return records cut sails and a fore topsail yard shot in two. The return describes the accumulated damage, so the display shows these together.',GRAVES,{torn:['main','mizzen'],yardLost:'fore-topsail',marks:['starboard']})
    ]
  },
  nile: {
    bellerophon: [
      stage(.70,'Dismasted and drifting out of the line','The British account records that Bellerophon’s masts and cables were shot away before Orient exploded. The drift path is illustrative.',evidence('Naval History and Heritage Command · Battle of the Nile','https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/b/battle-of-the-nile.html'),{lost:['fore','main','mizzen']})
    ]
  },
  'hampton-roads': {
    monitor: [
      stage(.75,'Pilothouse cracked and hatch displaced','Executive officer Samuel Dana Greene describes a split iron log on the forward face and a hatch knocked partly off. The turret remains in place.',evidence('Samuel Dana Greene’s letter, 14 March 1862','https://www.usni.org/magazines/naval-history-magazine/2007/april/voyage-destiny'),{marks:['pilot']})
    ]
  },
  lissa: {
    're-italia': [
      stage(.73,'Port side breached by the ram','The 1901 naval study places the ram amidships on the port side, over the engine room. The model shows the location schematically before the documented sinking.',evidence('U.S. Naval Institute · Naval Campaign of Lissa, §§124–125','https://www.usni.org/magazines/proceedings/1901/april/naval-campaign-lissa-its-history-strategy-and-tactics'),{marks:['port']})
    ]
  },
  yalu: {
    matsushima: [
      stage(.45,'Flying deck torn by shell fragments','The translated Japanese naval report describes damage to the starboard gun position and flying deck. This precedes the later reported ammunition fire.',MATSUSHIMA,{marks:['deck']}),
      stage(.57,'Funnel pierced','The same report records a later shell through the right side of the funnel. The deck damage remains visible.',MATSUSHIMA,{marks:['deck','funnel']})
    ]
  },
  'manila-bay': {
    'reina-cristina': [
      stage(.55,'Shell damage and fire','Montojo describes shell damage to the hull and fires aboard his flagship. The replay places the damage during the firing passes.',MONTOJO,{marks:['hull','burn']}),
      stage(.77,'Smoke pipe damaged before abandonment','Montojo reports a riddled hull, smoke pipe and mast before giving the order to sink and abandon the ship. The marked funnel and deck illustrate that accumulated damage.',MONTOJO,{marks:['hull','burn','funnel']})
    ],
    castilla: [
      stage(.72,'Fire damage aboard Castilla','Montojo reports that shellfire set Castilla alight before it sank. The darkened deck indicates the documented fire damage.',MONTOJO,{marks:['burn']})
    ]
  },
  trafalgar: {
    victory: [{at:.62,torn:true,title:'Shot-damaged fore-topsail',text:'The surviving fore-topsail bears about 90 shot holes. Hole placement and onset here are illustrative; this is not a reconstruction of each strike.',source:{title:'Royal Navy Museums: caring for Victory’s fore-topsail',url:'https://www.royalnavymuseums.org.uk/news/caring-hms-victorys-fore-topsail'}}],
    redoutable: [{at:.73,lost:['main','mizzen'],title:'Main and mizzen masts lost',text:'Captain Lucas reports both masts gone before surrender. Their simultaneous appearance here is a teaching stage, not a timed record. Redoutable’s later sinking is outside this battle replay.',source:{title:'Captain Lucas’s report (Fondation Napoléon)',url:'https://www.napoleon.org/en/history-of-the-two-empires/articles/captain-lucass-report-concerning-the-loss-of-the-vessel-redoutable-at-the-battle-of-trafalgar'}}]
  }
};
export function damageStages(battle,ship){return DAMAGE[battle.id]?.[ship.id]??[];}
export function tornAtMast(damage,mast){
  return damage?.torn===true?mast==='fore':Boolean(damage?.torn?.includes(mast));
}

export function damageAt(battle,ship,progress){return damageStages(battle,ship).filter(d=>progress>=d.at).at(-1)??null;}
export function sinkingAt(battle,ship,progress,reduced=false){
  if(ship.fate?.kind!=='sunk'||!Number.isFinite(progress)||progress<ship.fate.at)return {amount:0,started:false,complete:false,shallow:false};
  const amount=reduced?1:Math.min(1,Math.max(0,(progress-ship.fate.at)/.035));
  return {amount,started:true,complete:amount>=1,shallow:battle.id==='manila-bay'};
}
