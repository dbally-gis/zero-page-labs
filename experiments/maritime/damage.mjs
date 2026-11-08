// Evidence establishes the damage, not these illustrative replay thresholds or geometry.
export const DAMAGE = {
  trafalgar: {
    victory: [{at:.62,torn:true,title:'Shot-damaged fore-topsail',text:'The surviving fore-topsail bears about 90 shot holes. Hole placement and onset here are illustrative; this is not a reconstruction of each strike.',source:{title:'Royal Navy Museums: caring for Victory’s fore-topsail',url:'https://www.royalnavymuseums.org.uk/news/caring-hms-victorys-fore-topsail'}}],
    redoutable: [{at:.73,lost:['main','mizzen'],title:'Main and mizzen masts lost',text:'Captain Lucas reports both masts gone before surrender. Their simultaneous appearance here is a teaching stage, not a timed record. Redoutable’s later sinking is outside this battle replay.',source:{title:'Captain Lucas’s report (Fondation Napoléon)',url:'https://www.napoleon.org/en/history-of-the-two-empires/articles/captain-lucass-report-concerning-the-loss-of-the-vessel-redoutable-at-the-battle-of-trafalgar'}}]
  }
};
export function damageStages(battle,ship){return DAMAGE[battle.id]?.[ship.id]??[];}
export function damageAt(battle,ship,progress){return damageStages(battle,ship).filter(d=>progress>=d.at).at(-1)??null;}
export function sinkingAt(battle,ship,progress,reduced=false){
  if(ship.fate?.kind!=='sunk'||!Number.isFinite(progress)||progress<ship.fate.at)return {amount:0,started:false,complete:false,shallow:false};
  const amount=reduced?1:Math.min(1,Math.max(0,(progress-ship.fate.at)/.035));
  return {amount,started:true,complete:amount>=1,shallow:battle.id==='manila-bay'};
}
