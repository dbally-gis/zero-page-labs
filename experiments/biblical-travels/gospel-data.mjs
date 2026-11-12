export const gospelCoords = {
  "Bethlehem": [
    379.1,
    361.24
  ],
  "Nazareth": [
    391.04,
    235.95
  ],
  "Jerusalem": [
    383.25,
    352.07
  ],
  "Capernaum": [
    425.97,
    213.46
  ],
  "Sea of Galilee": [
    427.48,
    221.75
  ],
  "Caesarea Philippi": [
    440.93,
    167.34
  ],
  "Tyre district": [
    378.6,
    164.45
  ],
  "Sidon district": [
    400.46,
    128.13
  ],
  "Jericho": [
    409.39,
    340.25
  ],
  "Bethphage": [
    386.89,
    352.44
  ],
  "Bethany": [
    386.52,
    352.95
  ],
  "Gethsemane": [
    383.88,
    351.81
  ],
  "Nain": [
    397.45,
    244.87
  ],
  "Judean countryside": [
    367.54,
    366.89
  ],
  "Cana": [
    396.19,
    230.3
  ],
  "Sychar area": [
    388.4,
    297.65
  ],
  "Ephraim": [
    391.29,
    330.2
  ],
  "Jordan baptism area": [
    422.58,
    344.53
  ],
  "Gerasene shore": [
    435.4,
    221.12
  ]
};
export const gospelCoastline = "M104.026,0L103.26,1.255L95.117,0.382L94.931,0L104.026,0ZM0,435.648L2.829,434.942L12.329,424.689L7.353,418.799L3.734,412.909L8.258,412.691L17.305,417.708L43.544,437.124L52.592,441.269L62.545,440.614L84.26,434.942L90.141,435.815L118.642,428.616L122.261,434.069L126.785,439.305L149.857,433.415L186.048,433.415L215.906,427.089L250.288,411.6L253.003,409.2L276.527,389.13L287.837,376.259L288.742,375.386L313.171,337.21L329.005,299.469L343.934,246.895L354.339,220.28L363.387,202.61L367.458,187.993L373.339,178.395L379.221,165.96L385.102,149.162L395.959,135.2L418.126,87.861L430.793,68.882L435.317,41.613L454.77,17.834L469.699,10.853L476.485,4.091L476.485,0L720,0L720,490L0,490Z";

// Selected events in each Gospel's own narrative order.
export const gospelRecords = {
  Matthew: [
    ['Bethlehem', '2:1–12', 'Jesus is born in Bethlehem'],
    ['Nazareth', '2:13–23', 'The family settles in Nazareth', 'Matthew describes the flight to Egypt before the family settles in Nazareth. Egypt is outside this map, and Matthew gives no town there.'],
    ['Jordan baptism area', '3:13–17', 'John baptizes Jesus in the Jordan', 'Matthew names the river. The marker represents an approximate area.'],
    ['Capernaum', '4:12–17', 'Jesus settles in Capernaum'],
    ['Sea of Galilee', '4:18–22', 'Jesus calls fishermen by the Sea of Galilee'],
    ['Tyre district', '15:21–28', 'Jesus withdraws to the district of Tyre and Sidon', 'The passage names the district without specifying a town for the encounter.'],
    ['Caesarea Philippi', '16:13–20', 'Peter answers Jesus near Caesarea Philippi'],
    ['Jericho', '20:29–34', 'Jesus meets two blind men on leaving Jericho'],
    ['Bethphage', '21:1–7', 'The party approaches Jerusalem by Bethphage'],
    ['Jerusalem', '21:8–17', 'Jesus enters Jerusalem'],
    ['Bethany', '26:6–13', 'A woman anoints Jesus in Bethany'],
    ['Gethsemane', '26:36–56', 'Jesus prays and is arrested in Gethsemane'],
    ['Jerusalem', '27:27–61', 'Jesus is crucified and buried near Jerusalem']
  ],
  Mark: [
    ['Jordan baptism area', '1:9–11', 'Jesus comes from Nazareth and is baptized in the Jordan', 'Mark names the river. The marker represents an approximate area.'],
    ['Sea of Galilee', '1:16–20', 'Jesus calls Simon, Andrew, James, and John by the sea'],
    ['Capernaum', '1:21–34', 'Jesus teaches and heals in Capernaum'],
    ['Gerasene shore', '5:1–20', 'Jesus crosses to the country of the Gerasenes', 'The shore marker is approximate. The place-name varies across manuscripts.'],
    ['Tyre district', '7:24–30', 'Jesus travels to the district of Tyre'],
    ['Sidon district', '7:31', 'Jesus passes through Sidon on the way back toward Galilee'],
    ['Sea of Galilee', '7:31', 'Jesus reaches the Sea of Galilee by way of the Decapolis'],
    ['Caesarea Philippi', '8:27–30', 'Jesus and the disciples go to villages near Caesarea Philippi'],
    ['Jericho', '10:46–52', 'Jesus heals Bartimaeus on leaving Jericho'],
    ['Jerusalem', '11:1–11', 'Jesus enters Jerusalem and visits the temple'],
    ['Bethany', '14:3–9', 'A woman anoints Jesus in Bethany'],
    ['Gethsemane', '14:32–52', 'Jesus prays and is arrested in Gethsemane'],
    ['Jerusalem', '15:16–47', 'Jesus is crucified and buried near Jerusalem']
  ],
  Luke: [
    ['Bethlehem', '2:1–20', 'Jesus is born in Bethlehem'],
    ['Jerusalem', '2:22–38', 'Jesus is presented at the temple'],
    ['Nazareth', '2:39–40', 'The family returns to Nazareth'],
    ['Jerusalem', '2:41–52', 'At twelve, Jesus visits the temple'],
    ['Nazareth', '4:16–30', 'Jesus reads in the synagogue at Nazareth'],
    ['Capernaum', '4:31–44', 'Jesus teaches and heals in Capernaum'],
    ['Sea of Galilee', '5:1–11', 'Jesus calls fishermen by the Lake of Gennesaret'],
    ['Nain', '7:11–17', 'Jesus goes to Nain and raises a widow’s son'],
    ['Jericho', '18:35–43', 'Jesus heals a blind man as he approaches Jericho'],
    ['Jericho', '19:1–10', 'Jesus visits Zacchaeus in Jericho'],
    ['Jerusalem', '19:28–48', 'Jesus approaches Jerusalem and teaches at the temple'],
    ['Jerusalem', '23:26–56', 'Jesus is crucified and buried near Jerusalem'],
    ['Bethany', '24:50–53', 'Jesus leads the disciples out as far as Bethany']
  ],
  John: [
    ['Cana', '2:1–11', 'Jesus attends a wedding at Cana', 'The marker uses Kafr Kanna. Other identifications have been proposed.'],
    ['Capernaum', '2:12', 'Jesus goes down to Capernaum with his family and disciples'],
    ['Jerusalem', '2:13–22', 'Jesus goes up to Jerusalem for Passover'],
    ['Sychar area', '4:4–42', 'Jesus speaks with a Samaritan woman near Sychar', 'The marker indicates the area near Jacob’s well.'],
    ['Cana', '4:46–54', 'Jesus returns to Cana'],
    ['Jerusalem', '5:1–15', 'Jesus heals a man at the pool in Jerusalem'],
    ['Sea of Galilee', '6:1–21', 'Jesus crosses the Sea of Galilee'],
    ['Capernaum', '6:22–59', 'Jesus teaches in Capernaum'],
    ['Jerusalem', '7:10–18', 'Jesus goes to Jerusalem for the Feast of Booths'],
    ['Jerusalem', '10:22–39', 'Jesus is in Jerusalem at the Feast of Dedication'],
    ['Bethany', '11:17–44', 'Jesus reaches Bethany and calls Lazarus out of the tomb'],
    ['Ephraim', '11:54', 'Jesus withdraws to Ephraim', 'The marker uses Taybeh, a proposed identification.'],
    ['Bethany', '12:1–11', 'Jesus returns to Bethany before Passover'],
    ['Jerusalem', '12:12–19', 'Jesus enters Jerusalem'],
    ['Jerusalem', '19:16–42', 'Jesus is crucified and buried near Jerusalem'],
    ['Sea of Galilee', '21:1–14', 'Jesus appears to the disciples at the Sea of Tiberias']
  ]
};
