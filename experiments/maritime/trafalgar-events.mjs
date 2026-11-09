// Selected historical episodes, not a log of individual rounds. Replay seconds are authored.
export const TRAFALGAR_EVIDENCE = {
  rake:{title:'Royal Museums Greenwich · BHC0548',url:'https://www.rmg.co.uk/collections/objects/rmgc-object-12040'},
  lucas:{title:'Captain Lucas · eyewitness report (Fondation Napoléon)',url:'https://www.napoleon.org/en/history-of-the-two-empires/articles/captain-lucass-report-concerning-the-loss-of-the-vessel-redoutable-at-the-battle-of-trafalgar'},
  timber:{title:'Royal Museums Greenwich · Victory embedded shot, KTP1138',url:'https://www.rmg.co.uk/collections/objects/rmgc-object-36990'}
};
export const TRAFALGAR_EVENTS = [
  {id:'approach',at:.24,title:'The columns approach',text:'The British columns approach the allied line. This overview does not identify or animate an unverified first shot.',evidence:'rake',focus:'victory'},
  {id:'rake',at:.5,title:'Victory rakes Bucentaure',text:'Victory fires across Bucentaure’s stern while breaking the line. One animated shot stands for this documented rake; it is not an individually recorded hit.',evidence:'rake',focus:'victory',shooter:'victory',target:'bucentaure',kind:'timber'},
  {id:'exchange',at:.66,title:'Victory and Redoutable exchange broadsides',text:'Lucas describes both ships giving and receiving broadsides before close combat with small arms and grenades. The two representative shots here do not establish a first shooter or reload rate.',evidence:'lucas',focus:'redoutable',shooter:'victory',target:'redoutable',kind:'timber'},
  {id:'return',at:.69,title:'The reciprocal broadside',text:'The return shot represents the same exchange described by Lucas. Its placement after Victory’s shot is a teaching device, not a claimed historical firing order.',evidence:'lucas',focus:'victory',shooter:'redoutable',target:'victory',kind:'timber'},
  {id:'stern-fire',at:.84,title:'Redoutable: a reported fire astern',text:'Lucas lists a fire astern among the reasons for surrender. The fire shown here represents that reported condition; its ignition time and cause are not established by this account. It is not a cannonball explosion. Lucas was a participant; this is an attributed report, not independent confirmation.',evidence:'lucas',focus:'redoutable',target:'redoutable',kind:'reported-fire'}
];
