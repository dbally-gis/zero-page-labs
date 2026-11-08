import {TRAFALGAR_EVENTS,TRAFALGAR_EVIDENCE} from './trafalgar-events.mjs';
// Replay offsets are teaching positions. Sources establish episodes, not individual rounds.
const ref=(title,url)=>({title,url});
const E=(id,at,title,text,focus,source,detail={})=>({id,at,title,text,focus,source,certainty:'Selected historical episode',...detail});
const F=(shooter)=>({kind:'muzzle',shooter,certainty:'Representative firing · no assigned hit'});
const CONTACT='Representative exchange · not an individual recorded hit';
const DIU=ref('Portuguese Ministry of Defence · Diu, artillery account','https://www.defesa.gov.pt/pt/defesa/organizacao/comissoes/cphm/rphm/edicoes/ano3/n.5/3/');
const GALLEY=ref('Museo Naval · Galley weapons and boarding','https://armada.defensa.gob.es/archivo/museonaval/02museo/08museodigital/Itinerarios/Lepanto/Combatenaval.pdf');
const GRAVELINES=ref('National Museum of the Royal Navy · Armada Map 10','https://armadamaps.nmrn.org.uk/the-maps/map-10/');
const HAMPTON=ref('NOAA · Battle of Hampton Roads','https://monitor.noaa.gov/150th/hampton.html');
const OLYMPIA=ref('NHHC · Dewey and Olympia reports, May 1898','https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/s/selected-documents-of-the-spanish-american-war/olympia-in-battle-of-manila-bay.html');
export const BATTLE_EVENTS={
  trafalgar:TRAFALGAR_EVENTS.map(e=>({...e,source:TRAFALGAR_EVIDENCE[e.evidence],certainty:e.kind==='reported-fire'?'Attributed participant report':e.kind?CONTACT:'Selected historical episode',anchor:e.id==='rake'||e.kind==='reported-fire'?'stern':undefined})),
  diu:[
    E('approach',.24,'Almeida closes on the coalition','The Portuguese account describes the attack at Diu. Replay spacing is not a recovered gunnery range.','flor',DIU),
    E('opening',.4,'Flor de la Mar uses her artillery','The account places the flagship’s artillery in the attack. The muzzle smoke represents a discharge, without inventing an opening hit or a first-shot time.','flor',DIU,F('flor')),
    E('rear-carrack',.56,'The Egyptian rear carrack is engaged','The Portuguese study attributes the sinking of the last Egyptian carrack to Flor de la Mar’s artillery. One projectile represents that barrage; the ship’s name, round count and fatal hit are unknown.','egyptian-rear',DIU,{kind:'timber',shooter:'flor',target:'egyptian-rear',certainty:'Institutional account · barrage represented'}),
    E('channel',.76,'The flagship holds the channel','The account describes Flor de la Mar preventing oared craft from entering the fight. No particular galley hit is assigned.','flor',DIU,F('flor'))
  ],
  lepanto:[
    E('bow-guns',.32,'Bow guns before close combat','The museum describes galley artillery carried at the bow. A discharge on Real represents this weapon phase, not a recorded first shot or confirmed hit on Sultana.','real',GALLEY,F('real')),
    E('flagships',.5,'The two flagships fight','The museum identifies Real and Sultana fighting face to face. The opposing muzzle flash represents the exchange; its order and individual impacts are not documented here.','sultana',1,F('sultana')),
    E('boarding',.68,'From artillery to boarding','The galley account describes soldiers crossing into the enemy vessel under small-arms fire. This episode has no invented cannonball explosion or individual musket casualty.','real',GALLEY),
    E('capture',.75,'Sultana is captured','The museum records Ali Pasha’s death and the capture of his flagship. Capture remains distinct from sinking.','sultana',1)
  ],
  gravelines:[
    E('calais',.2,'Disruption before the main action','The fireship episode off Calais precedes Gravelines. No named Armada warship is made to burn simply because a fireship was sent toward the fleet.','san-martin',0),
    E('drake',.5,'Drake attacks San Martín','The naval museum’s map commentary identifies Drake’s attack and heavy damage to San Martín. Revenge is identified by the linked Greenwich collection record in the ship context. The timber impact stands for the exchange, not a verified individual round.','revenge',GRAVELINES,{kind:'timber',shooter:'revenge',target:'san-martin',certainty:CONTACT}),
    E('recover',.76,'The Armada recovers its formation','The map commentary describes San Martín buying time for the defensive crescent to reform. Damage is not the same as a documented sinking.','san-martin',GRAVELINES)
  ],
  downs:[
    E('anchorage',.24,'An attack on the sheltered fleet','The wreck record places the action in the Downs. Generic tracks do not establish individual gunnery positions.','aemilia',2),
    E('dutch-fire',.45,'Dutch gunfire in the action','Aemilia represents the Dutch force in this selected episode. No source here identifies a particular Aemilia round hitting the anonymous Spanish marker, so no hit is animated.','aemilia',1,F('aemilia')),
    E('fireships',.62,'Fireships are expended','The heritage record identifies Dutch fireships used against Santa Teresa and Santiago. Those named targets and craft are not individually modelled here; a generic marker is not set on fire in their place.','downs-spanish',2),
    E('losses',.83,'The limits of the wreck record','The heritage account warns that many named ships cannot be matched reliably to the wrecks. This replay does not manufacture a fatal shot or a loss for an anonymous marker.','downs-spanish',2)
  ],
  quiberon:[
    E('pursuit',.24,'Hawke follows into the bay','The museum account describes pursuit into dangerous water. This is a combat setting, not a measured firing solution.','royal-george',0),
    E('flagships',.5,'The flagships engage','Greenwich identifies Royal George engaged with Soleil Royal. A timber impact represents their wooden-ship exchange; it does not reconstruct one recorded hit.','royal-george',0,{kind:'timber',shooter:'royal-george',target:'soleil-royal',certainty:CONTACT}),
    E('reply',.54,'The reciprocal exchange','The return shot represents that engagement. The interval is not an asserted reload time or evidence that this side fired second.','soleil-royal',0,{kind:'timber',shooter:'soleil-royal',target:'royal-george',certainty:CONTACT}),
    E('founder',.82,'Superbe founders in the action','The account attributes French sinkings to gunfire combined with weather. No individual projectile is made the proven cause of Superbe’s loss.','superbe',0)
  ],
  chesapeake:[
    E('leading-french',.48,'The leading French ships open fire','The park account describes volleys from the leading ships of both fleets. This command marker represents French fleet fire, not an identified flagship or a verified hit.','de-grasse',0,F('de-grasse')),
    E('leading-british',.51,'The leading British ships engage','The second discharge represents the same opening exchange. Its placement does not establish first shooter; the account says the rear British ships could not close enough to fire.','graves',0,F('graves')),
    E('damage',.7,'Damage without invented individual hits','The park records damage in both fleets. Its overview does not assign those hits to the anonymous ships in this diagram, so no target impact is shown.','graves',0),
    E('disengage',.82,'The lines disengage','The fleets separate as evening comes. The strategic outcome depends on control of the bay rather than a simulated sinking score.','de-grasse',0)
  ],
  nile:[
    E('attack',.32,'The British attack the anchored line','The museum describes Nelson’s immediate attack developing into a night action. Vanguard represents British gunfire; no target hit is assigned from this overview.','vanguard',0,F('vanguard')),
    E('reply',.45,'The anchored fleet fights back','The French line is armed, not defenceless. A muzzle discharge on its flagship represents fleet resistance, not a particular gun or a claimed first reply.','orient',0,F('orient')),
    E('orient-explosion',.79,'Orient’s catastrophic explosion','The Mariners’ Museum describes the French flagship’s destruction during the night action. This is a documented catastrophe, not the standard effect of a round shot. No incoming projectile or ignition cause is invented.','orient',2,{kind:'explosion',target:'orient',certainty:'Documented explosion · schematic onset'}),
    E('aftermath',.84,'The flagship is lost','The loss marker records Orient’s destruction. Nelson’s dispatch describes the broader British victory; its account is a participant’s report.','vanguard',1)
  ],
  'hampton-roads':[
    E('monitor-fire',.32,'Shot meets Virginia’s armour','NOAA describes the ironclads’ shots deflecting from their armour. This representative contact uses sparks and a ricochet, without penetration or hull fire. It is not a separately recorded round.','monitor',HAMPTON,{kind:'armor',shooter:'monitor',target:'virginia',deflect:true,certainty:CONTACT}),
    E('virginia-fire',.4,'The ironclads exchange fire','The reciprocal contact illustrates the same armour-deflection phase. Its replay interval is not a reload rate or established firing order.','virginia',HAMPTON,{kind:'armor',shooter:'virginia',target:'monitor',deflect:true,certainty:CONTACT}),
    E('pilothouse',.73,'Virginia hits Monitor’s pilothouse','NOAA describes a shot against the forward pilothouse that temporarily blinds Worden. The effect is a brief impact near the bow, not a ship fire; the generic model does not resolve the exact damage.','monitor',HAMPTON,{kind:'armor',shooter:'virginia',target:'monitor',anchor:'bow',certainty:'Documented hit · schematic impact point'}),
    E('withdraw',.85,'Disengagement, not destruction','Monitor assesses damage and Virginia later withdraws. Neither ship is sunk in this 9 March encounter.','monitor',HAMPTON)
  ],
  lissa:[
    E('austrian-fire',.32,'The Austrian force closes under gunfire','The Italian naval account describes the fleet action. A muzzle discharge on Ferdinand Max represents Austrian gunfire, not a recorded hit on Re d’Italia.','ferdinand-max',0,F('ferdinand-max')),
    E('italian-fire',.4,'Italian gunfire in the melee','The opposing discharge represents the confused fleet engagement. No exact first-shot order, calibre or hull penetration is assigned.','re-italia',0,F('re-italia')),
    E('ram',.72,'Ferdinand Max rams Re d’Italia','The Italian Navy’s ship record identifies the rammer and the lost ship. Contact debris illustrates the collision without muzzle flash, a cannonball or invented magazine fire. The route is not collision physics.','re-italia',1,{kind:'ram',shooter:'ferdinand-max',target:'re-italia',certainty:'Documented ram · schematic contact'}),
    E('loss',.78,'Re d’Italia sinks','The sourced loss marker follows the ramming episode. No animated gunshot is presented as the cause of this sinking.','re-italia',1)
  ],
  yalu:[
    E('japanese-fire',.28,'The Japanese squadron engages','The contemporary account describes the moving Japanese divisions in action. Yoshino represents the flying squadron’s gunfire; no individual hit is assigned from that overview.','yoshino',0,F('yoshino')),
    E('chinese-fire',.36,'Fire from the Chinese centre','The opposing discharge represents the Chinese armoured centre. It does not establish a first shooter or a precise interval between salvos.','dingyuan',0,F('dingyuan')),
    E('matsushima-hit',.64,'A reported heavy-shell hit on Matsushima','The 1895 account attributes a damaging shell to Chen Yuen (Zhenyuan) and describes ammunition exploding on Matsushima. The article includes conflicting accounts and corrections: this is an attributed episode, not a settled calibre, time or casualty count.','matsushima',0,{kind:'shell',shooter:'zhenyuan',target:'matsushima',certainty:'Near-contemporary attribution · details disputed'}),
    E('matsushima-fire',.67,'Ammunition fire aboard the flagship','The same account reports fire on Matsushima after the damaging shell episode. This separate condition is not the default result of every shell. Its duration and precise deck location are not reconstructed.','matsushima',0,{kind:'reported-fire',target:'matsushima',certainty:'Reported condition · uncertain duration'}),
    E('survival',.94,'Damaged does not mean sunk','Matsushima survives the battle. Neither a shell burst nor a reported fire is automatically converted into a sinking.','matsushima',1)
  ],
  'manila-bay':[
    E('open-fire',.28,'Olympia opens the American fire','The commanding officers’ reports describe Olympia opening with her forward heavy guns. The muzzle is placed forward; its train angle is schematic. The discharge is representative, not one timed historical round.','olympia',OLYMPIA,{...F('olympia'),muzzleAnchor:'bow'}),
    E('cristina-hit',.49,'Olympia’s shell hits Reina Cristina','Olympia’s report describes an 8-inch shell raking Reina Cristina. A brief shell burst represents that reported hit, not every round fired by the American squadron.','reina-cristina',OLYMPIA,{kind:'shell',shooter:'olympia',target:'reina-cristina',certainty:'Participant report · representative shell hit'}),
    E('cristina-fire',.53,'Fire aboard Reina Cristina','The American report describes fires during Reina Cristina’s attempt to close. This reported condition is separate from the brief shell burst; its exact onset and spread are not measured.','reina-cristina',OLYMPIA,{kind:'reported-fire',target:'reina-cristina',certainty:'Participant report · ship fire'}),
    E('castilla-fire',.7,'Castilla burns','Montojo describes Castilla set on fire by shells and later sinking. The fire is shown without inventing the gunner or projectile that ignited it.','castilla',1,{kind:'reported-fire',target:'castilla',certainty:'Participant report · unattributed ignition'}),
    E('abandon',.84,'Scuttling is distinct from a fatal hit','The modern NHHC account says Reina Cristina was scuttled after heavy damage. The sourced X records that outcome; it is not a hit-point calculation.','reina-cristina',0)
  ]
};
export const eventsFor=battle=>BATTLE_EVENTS[battle.id]||[];
export const eventSource=(battle,event)=>typeof event.source==='number'?battle.sources[event.source]:event.source;
