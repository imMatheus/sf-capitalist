import type { BusinessId, UnlockDefinition, UpgradeTarget } from "./types";

export type EuropeUnlockRow = readonly [
  name: string,
  goal: number,
  target: UpgradeTarget,
  kind: UnlockDefinition["kind"],
  multiplier: number,
];

const europeBusinessTargets = {
  meatball: "ikea-meatball",
  gravityBooth: "gdpr-compliance",
  paydayClone: "parental-leave",
  lovable: "lovable-credits",
  oxygenBar: "berghain-club",
  heliumFarm: "elevenlabs-dj",
  cheeseMine: "tethered-bottle-cap",
  amusementPark: "public-transport",
  werewolfColony: "renewable-energy",
  giantLaser: "cern",
} as const satisfies Record<string, BusinessId>;

const parseEffect = (
  effect: string,
): readonly [kind: UnlockDefinition["kind"], multiplier: number] => [
  /speed|doubled/i.test(effect) && !/profit\s+(?:x|×)/i.test(effect)
    ? "speed"
    : "profit",
  Number(effect.match(/[x×]\s*([\d.]+)/i)?.[1] ?? 2),
];

const parseRows = (target: UpgradeTarget, source: string): EuropeUnlockRow[] =>
  source
    .trim()
    .split("\n")
    .map((line) => {
      const [name, goal, effect] = line.split("|");
      const [kind, multiplier] = parseEffect(effect);

      return [
        name.trim(),
        Number(goal),
        target,
        kind,
        multiplier,
      ];
    });

const parseTargetRows = (source: string): EuropeUnlockRow[] =>
  source
    .trim()
    .split("\n")
    .map((line) => {
      const [name, goal, target, effect] = line.split("|");
      const [kind, multiplier] = parseEffect(effect);

      return [
        name.trim(),
        Number(goal),
        target.trim(),
        kind,
        multiplier,
      ];
    });

export const europeBusinessUnlockRowsById: Partial<Record<BusinessId, EuropeUnlockRow[]>> = {
  [europeBusinessTargets.meatball]: parseRows(europeBusinessTargets.meatball, `
Start A Trend|10|Profit x3.5
One Small Step|20|Profit x4
Low-G Catwalks|40|Profit x4.5
Bounce-Friendly|80|Profit x5
Hipster Approved|160|Profit x5.5
Made For Walking|320|Profit x6
Walking On Moonshine|640|Profit x6.5
Moon Over My-ami|1280|Profit x7
Shoe-t To Thrill|2560|Profit x7.5
Moon Walker|5120|Profit x999999999
Fly Me To The Boots|10000|Profit x3.5
`),
  [europeBusinessTargets.gravityBooth]: parseRows(europeBusinessTargets.gravityBooth, `
Dime Operated|30|Profit x1.5
Earth Nostalgia|60|Profit x1.75
Popular With Kids|90|Profit x2
Demonstrably Addictive|120|Profit x2.25
Booth Babes|160|Profit x2.50
By Appointment|200|Profit x2.75
Cosplayers?|240|Profit x3
Experience Jupiter|280|Profit x3.25
Which Weigh|330|Profit x3.50
I'm Just Saiyan...|380|Profit x3.75
Let Go Your Earthly Teather|430|Profit x4
Gravity Exports|480|Profit x4.25
Black Hole-istic Healing|540|Profit x4.50
Shiatsu Packages|600|Profit x4.75
Nostalgic Purchase|660|Profit x5
Dial 1 For Gravity|720|Profit x5.5
Don't Bring Me Down|790|Profit x5.75
Good To The Last Drop|860|Profit x6
What Goes Up...|940|Profit x6.25
...Must Come Down|1020|Profit x6.5
Subsonic Screwdrivers|1110|Profit x6.75
Unusual Phenomena|1200|Profit x7
Mystery Box|1400|Profit x7.25
Newton Simulator|1600|Profit x7.5
Moon Hipster Approved|1800|Profit x7.75
Double Wide Edition|2000|Profit x999999999
William Code|2400|Profit x8.5
`),
  [europeBusinessTargets.paydayClone]: parseTargetRows(`
Two For One|10|parental-leave|Profit x3
Deja Vous|20|parental-leave|Profit x3
Friendly Faces|40|parental-leave|Profit x3
Faux You|60|parental-leave|Profit x3
Double Down|80|parental-leave|Profit x3
George Clone-y|100|parental-leave|Profit x3
Recursion Incursion|120|parental-leave|Profit x3
Betrayal Free Guarantee|240|parental-leave|Profit x3
Fresh Shipment of Sam|360|elevenlabs-dj|Profit x3
Home A Clone|480|parental-leave|Profit x3
Send In The Clones|600|parental-leave|Profit x3
What's Mine Is Mine|840|tethered-bottle-cap|Profit x3
Double Your Fun|1080|parental-leave|Profit x3
Ice Cream Clones|1320|parental-leave|Profit x3
1 Eighth Mini-Yous|1560|cern|Profit x3
Give Your Dog A Clone|1800|parental-leave|Profit x3
Clone-y The Scourge|2160|parental-leave|Profit x3
Clone Hai!|2520|parental-leave|Profit x3
Meet My Twin|2880|parental-leave|Profit x3
The Clone Skirmishes|3240|parental-leave|Profit x33
Sheep Attack|3600|parental-leave|Profit x33
Don't Step On Mitosis|4000|parental-leave|Profit x33
Repeat Business|4400|parental-leave|Profit x33
Double Your Fun|4800|parental-leave|Profit x33
Mixed Doubles|5200|parental-leave|Profit x3333
Two's Company|5600|parental-leave|Profit x3333
Three's A Crowd|6000|parental-leave|Profit x3333
So Is Four|6666|parental-leave|Profit x3333
`),
  [europeBusinessTargets.lovable]: parseRows(europeBusinessTargets.lovable, `
Good News!|25|Profit x3
Why Not Moon Express?|50|Profit x3
Shut Up And Take Money|75|Profit x3
Not Sure If Profitable...|100|Profit x3
Optimist Prime Directive|150|Profit x6
Zany Adventures|200|Profit x6
Inform The Men|250|Profit x6
Gravity Wins Again|300|Profit x6
Checkmate|350|Profit x6
Same Day Delivery|400|Profit x6
Stop Exploding|450|Profit x6
You Cowards|500|Profit x12
Handles Like A Bistro|700|Profit x24
Captiain's Itch Powder|900|Profit x36
Easy On The Eyes|1100|Profit x48
Double Yes|1300|Profit x60
Achievement Without Name|1500|Profit x72
Velour Uniforms|1700|Profit x84
Why Not Moon Express?|1900|Profit x96
Happy Hour|2100|Profit x108
Questionable Quality|2300|Profit x120
Singed/Sealed/Delivered|2500|Profit x144
`),
  [europeBusinessTargets.oxygenBar]: parseRows(europeBusinessTargets.oxygenBar, `
Everyone Knows Your Name|20|Profit x12
Always Glad You Came|50|Profit x12
Witty Comebacks|90|Profit x12
Happy Hour|180|Profit x22
Shiny Moon Shine|360|Profit x333
Charge By The Breath|720|Profit x4444
Free Nitrogen|1440|Profit x55555
The Bubbly|2880|Profit x666666
No Smoking Please|5720|Profit x7777777
`),
  [europeBusinessTargets.heliumFarm]: parseRows(europeBusinessTargets.heliumFarm, `
Employee Retention|50|Profit x7
Chores To Do|100|Profit x7
Simple Moon Folk|200|Profit x7
Little House On The Crater|300|Profit x7
Funny Voices|400|Profit x7
Balloon Boom|500|Profit x7
Jeans|600|Profit x7
County Air Fair|700|Profit x7
Rustic Charm|800|Profit x7
Hey Diddle Diddle|900|Profit x7
Harvest Moon|1000|Profit x7
Balloonatics|1200|Profit x7
5th LMNT - 3|1400|Profit x7
He He He|1600|Profit x7
He I He I O|1800|Profit x7
Funny Voices|2000|Profit x7
Lev Tractors|2200|Profit x777
Pitchfork Repairs|2400|Profit x777
Farmer In The Moon|2600|Profit x777
Aerial Cow Sightings|2800|Profit x777
I Tell You Hwhat|3000|Profit x777
`),
  [europeBusinessTargets.cheeseMine]: parseRows(europeBusinessTargets.cheeseMine, `
Delicious Endeavor|8|Profit x5
Brie Extractors|16|Profit x5
Making Cheddar|32|Profit x5
Moon Mozzarella|64|Profit x5
Havarti Harvest|128|Profit x5
Good'a Gouda|256|Profit x5
Parmesan Veins|512|Profit x5
Jacked Monterey|1024|Profit x5
Whiz Wizard|2048|Profit x88888888
You Cheddar Believe It|4096|Profit x88888888
`),
  [europeBusinessTargets.amusementPark]: parseRows(europeBusinessTargets.amusementPark, `
Dizzy Land!|80|Profit x8
Kids Get In Free|160|Profit x8
Happiest Place Not On Earth|240|Profit x8
Skip The Lines|320|Profit x8
A Small Moon Afterall|480|Profit x8
Pirates Of The Daedalus|640|Profit x8
Tomorrow Kingdom|800|Profit x8
Crater Rides|960|Profit x8
It's A Small Celestial Body|1200|Profit x8
Princess Imports|1440|Profit x888
Star Sweepers|1680|Profit x888
The Ferris Of Them All|1920|Profit x888
Sweet Dreams|2160|Profit x888
$90 Water Bottles|2300|Profit x888
Loop-de-Loompas|2540|Profit x888
A Puzzle For You|2780|Profit x888
Oh Boy!|3000|Profit x888
`),
  [europeBusinessTargets.werewolfColony]: parseRows(europeBusinessTargets.werewolfColony, `
Howling Good Time|25|Profit x3
Round The Clock Barbers|50|Profit x3
No Silver Zone|75|Profit x3
Furry Fandom|100|Profit x3
Dentistry Boom|150|Profit x3
Vampires Suck|200|Profit x3
Lycan Lounges|250|Profit x3
Team Jake|300|Profit x3
Ripped T-Shirts|350|Profit x3
Dramatic Lighting|400|Profit x3
Who Wolf?|450|Profit x3
What-wolves|500|Profit x3
A Hairy Situation|600|Profit x3
Otherkin From Another Mother|700|Profit x3
Wash And Wear-Wolf|800|Profit x3
Sheep's Clothing Boutique|900|Profit x3
Hardware-wolves|1000|Profit x3
Fangs For Everything|1200|Profit x3
Werewolf Of Walstreet|1400|Profit x3
Eclipse Warning System|1600|Profit x3
Howl's It Going?|1800|Profit x3
No Red Hood Zone|2000|Profit x3
Aware Wolf|2300|Profit x3
Eclipse Proof Condos|2600|Profit x3
Bad Moon Rising|2900|Profit x33
Howl Rude|3200|Profit x33
Vampire Tourists|3500|Profit x9876543210
Don't Bite The Bullet|3800|Profit x33
Blood Moon|4100|Profit x33
`),
  [europeBusinessTargets.giantLaser]: parseRows(europeBusinessTargets.giantLaser, `
MWA HA HA HA|50|Profit x75
Shark Tank Installation|100|Profit x75
Laser Sight|200|Profit x75
Orbital Obliteration|300|Profit x75
Head Attachments|400|Profit x75
ZAP!|500|Profit x75
Fluffy Cat Auditions|600|Profit x75
Laser Disc Decor|700|Profit x75
Laser Vision|800|Profit x75
All The Photons|900|Profit x75
Judo Chop|1000|Profit x75
Preparation I|1111|Profit x75
`),
};

export const europeAllBusinessUnlockRows = parseRows("all", `
Finally|1|Profit speed of all investments doubled
Now You're Cooking With N204|5|Profit speed of all investments doubled
Special Relativity|25|Profit speed of all investments doubled
Just A Phase|50|Profit speed of all investments doubled
Dark Side Of The Moon|75|Profit speed of all investments doubled
Miami Over Moon|100|Profit speed of all investments doubled
Luny Luna|150|Profit speed of all investments doubled
Apollo-getic|200|Profit speed of all investments doubled
Case Of The Moondays|250|Profit speed of all investments doubled
The Moon-arch|300|Profit speed of all investments doubled
Shiny Moonocle|350|Profit speed of all investments doubled
Moonotheism|400|Profit speed of all investments doubled
Gany-mead|450|Profit speed of all investments doubled
Titan-ic Achievement|500|Profit speed of all investments doubled
Callisto-riffic|600|Profit speed of all investments doubled
I/O|700|Profit speed of all investments doubled
Europa Opa|800|Profit speed of all investments doubled
Tri-tons Of Fun|900|Profit speed of all investments doubled
Charon Is Caring|1000|Profit speed of all investments doubled
Moonumental Achievement|1111|Profit speed of all investments doubled
`);
