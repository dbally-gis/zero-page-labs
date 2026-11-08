import {DEFAULT_ARTICLE_TEXT} from './articleCorpus.js';
// Original demonstration passages written for Zero Page Labs; no remote text requests.
const echoes = `
The signal returns to the station. Each morning, the station receives a signal from a different traveler. Some travelers send a story, some send a question, and some send only a word. The keeper writes every signal in a notebook. Between one signal and the next, the station is quiet. The keeper listens to the quiet, then returns to the notebook.

A traveler crosses the valley carrying a blue lantern. The lantern marks a safe path through the rain. Along the path, stone bridges cross narrow streams, and low trees lean above the water. The traveler stops beside each bridge to look back. From every bridge the station is smaller, but the lantern remains bright. A small word appears in the notebook: return.

The signal returns to the station. At noon, the station receives a signal from the valley. The keeper hears the traveler describing a bridge, a lantern, and a path through the rain. The story is different, but the signal has a familiar rhythm. The keeper opens the notebook and writes the word return beneath the earlier word. Between one signal and the next, the station is quiet.

In a workshop beyond the valley, another traveler repairs a brass compass. The compass needle sticks whenever the workshop door opens. Dust moves through a square of sunlight. A kettle whistles. The traveler closes the door, cleans the compass, and places it beside a photograph of the station. Beneath the photograph someone has written a message: follow the signal when you are ready to return.

The signal returns to the station. In the evening, the station receives a signal from the workshop. The keeper hears about a compass, a kettle, and a photograph. The traveler promises to return before winter. The keeper writes the promise in the notebook. The station has become a place where different stories meet the same word. Between one signal and the next, the station is quiet.

The rain stops. A bicycle moves along the empty road, its wheels drawing circles through the last shallow puddles. Windows open across the village. Somewhere a child builds a tower from wooden blocks. The keeper walks outside, carrying the notebook but leaving the receiver behind. For a little while, the world needs no signal to be heard.

The signal returns to the station. At night, the station receives one final signal. The message says that a traveler has reached the bridge with the blue lantern. The keeper answers, then closes the notebook. The word return appears on several pages, separated by weather, work, roads, and waiting. The station is quiet. Tomorrow the signal will return.
`;
const changingSubjects = `
The garden begins beside the kitchen window. In spring, the garden fills with beans, mint, tomatoes, and patient rows of lettuce. Each morning the gardener checks the soil with a fingertip before reaching for the watering can. The soil near the wall stays cool. The soil beside the path dries quickly. A robin watches from the fence while the gardener turns a leaf to inspect the pale underside. There are small discoveries everywhere in the garden: a broken seed shell, a new root, a flower opening where yesterday there was only a tight green bud.

The gardener keeps a notebook for the garden. Rain goes in the notebook, along with planting dates and the first ripe tomato. The notebook also contains drawings of roots, leaves, and a curious beetle. Some pages are crowded with measurements. Other pages hold a single question. The garden never follows the notebook exactly. Weather changes a plan, a vine climbs the wrong support, and a seed arrives with a bird. The notebook records what happened, rather than insisting that the garden behave.

Beyond the fence, a railway crosses the valley. The railway station opens before sunrise. A porter rolls a cart across the platform, and the station clock marks the departure of the first train. Every train has a timetable, but every journey includes details the timetable cannot describe. Steam rises from paper cups. A passenger checks a ticket. A child counts the yellow lamps along the platform. When the train arrives, the station fills with the sound of doors and footsteps.

The station keeps its own notebook. An engineer records the condition of a signal, a loose bolt, and a troublesome switch. The notebook follows the railway from the first station to the last bridge. A clear signal means that the train can continue. A dark signal makes the engineer stop and check. The railway depends on these repeated checks: a wheel, a rail, a switch, a bridge. Each small part belongs to a much larger journey.

Across the tracks is a print workshop. Inside the workshop, wooden drawers hold metal letters. The printer chooses a letter, sets a line, and checks the spacing before making a proof. Paper passes beneath the press. Ink catches the raised face of every letter, turning an arrangement of metal into a readable page. The workshop smells of paper and ink. A crooked letter can alter the rhythm of a whole line, so the printer reads the proof slowly.

The printer's notebook contains sketches of signs for the railway station and labels for the garden. A sign must be read from the far end of the platform. A garden label must survive rain. A page for a book has a different task: it must invite the reader to continue. The workshop connects these tasks through paper, ink, letters, and attention. The garden, the railway, and the workshop return together on the final page of the notebook.
`;
const letters = `
Star stone storm story. Star stone storm story. All four words begin with the same two letters, yet their lengths differ. In Throughline, spelling gives each word a position. Repeated words return to their coordinates.

Map maple mapping. Map maple mapping. A short word grows while its first letters stay familiar. Lantern landscape laboratory. Lantern landscape laboratory. Longer words climb along the word-length axis.

Bright bridge breeze. Bright bridge breeze. Cloud clock clover. Cloud clock clover. The opening letters keep one part of each little family together while the changing lengths move another part.

Star returns to stone. Stone returns to storm. Storm returns to story. Map returns to maple, and maple returns to mapping. These are paths through spelling, rather than a measure of what the words mean.
`;
export const TEXT_EXAMPLES = [
 {id:'workshop',title:'The workshop',description:'A short story with recurring objects. Follow map, signal, and question across its pages.',mode:'matrix',focusWords:['map','signal','question'],text:DEFAULT_ARTICLE_TEXT},
 {id:'echoes',title:'The returning signal',description:'A repeated refrain interrupted by different scenes. Trace signal, station, and return to see the rhythm.',mode:'matrix',focusWords:['signal','station','return'],text:echoes},
 {id:'subjects',title:'Three neighborhoods',description:'Garden, railway, then print workshop. Their words occupy different stretches before meeting near the end.',mode:'matrix',focusWords:['garden','railway','workshop'],text:changingSubjects},
 {id:'letters',title:'Letters & lengths',description:'Repeated word families reveal how spelling and word length shape the Throughline view.',mode:'sequence',focusWords:[],text:letters}
];
