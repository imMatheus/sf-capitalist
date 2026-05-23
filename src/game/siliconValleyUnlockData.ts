import type { BusinessId, UnlockDefinition, UpgradeTarget } from "./types";

export type SiliconValleyUnlockRow = readonly [
  name: string,
  goal: number,
  target: UpgradeTarget,
  kind: UnlockDefinition["kind"],
  multiplier: number,
  reward?: string,
];

type EffectParts = readonly [
  kind: UnlockDefinition["kind"],
  multiplier: number,
  reward?: string,
];

const siliconValleyBusinessTargets = {
  lemonade: "bitcoin-miner",
  newspaper: "yc",
  carWash: "waymo",
  pizza: "stanford-dropout",
  donut: "h100-gpu-cluster",
  shrimp: "cursor-tab",
  hockey: "polymarket",
  movie: "chatgpt-3-5",
  bank: "nvidia",
  oil: "agi",
} as const satisfies Record<string, BusinessId>;

const parseEffect = (effect: string): EffectParts => {
  const reward = effect.match(/(?:free gold|slot machine)/i);

  if (reward) {
    return ["reward", 0, effect.trim()];
  }

  const multiplier = Number(effect.match(/x\s*([\d.]+)/i)?.[1] ?? 2);
  const kind = /speed|doubled/i.test(effect) && !/profit\s+(?:x|doubled)/i.test(effect)
    ? "speed"
    : "profit";

  return [kind, multiplier];
};

const parseRows = (
  target: UpgradeTarget,
  source: string,
): SiliconValleyUnlockRow[] =>
  source
    .trim()
    .split("\n")
    .map((line) => {
      const [name, goal, effect] = line.split("|");
      const [kind, multiplier, reward] = parseEffect(effect);

      return [
        name.trim(),
        Number(goal.replace(/,/g, "")),
        target,
        kind,
        multiplier,
        reward,
      ];
    });

const parseTargetRows = (source: string): SiliconValleyUnlockRow[] =>
  source
    .trim()
    .split("\n")
    .map((line) => {
      const [name, goal, target, effect] = line.split("|");
      const [kind, multiplier, reward] = parseEffect(effect);

      return [
        name.trim(),
        Number(goal.replace(/,/g, "")),
        target.trim(),
        kind,
        multiplier,
        reward,
      ];
    });

export const siliconValleyBusinessUnlockRowsById: Partial<
  Record<BusinessId, SiliconValleyUnlockRow[]>
> = {
  [siliconValleyBusinessTargets.lemonade]: parseRows(siliconValleyBusinessTargets.lemonade, `
Easy Squeezy|25|Profit Speed Doubled
Thirst Quencher|50|Profit Speed Doubled
Lemon Lord|100|Profit Speed Doubled
Citrus Emperor|200|Profit Speed Doubled
The Zestiest|300|Profit Speed Doubled
Lemontopia|400|Profit Speed Doubled
Acceptable!|500|Profit x4
Lemon Based Economy|600|Profit x4
Lemon Religion|700|Profit x4
Lemondammerung|800|Profit x4
LemoNirvana|900|Profit x4
Operating Lemon VIII|1000|Profit x5
Lemogeddon|1100|Profit x4
Lemonarok|1200|Profit x4
Citrus Of The 7 Suns|1300|Profit x4
Lemonokereti|1400|Profit x4
The 2nd Squeezing|1500|Profit x4
Lemonlightenment|1600|Profit x4
The Lemonhead|1700|Profit x4
Lemons All The Way|1800|Profit x4
End Of Thirst|1900|Profit x4
IMPOSSIBREW|2000|Profit x5
Aromatherapy|2250|Profit x2
iLemon Launch|2500|Profit x2
Vitamin Sea|2750|Profit x2
Green Lemons|3000|Profit x5
Rind-alot|3250|Profit x2
Seed Money|3500|Profit x2
Case of the Lemondays|3750|Profit x2
Scurvy Savior|4000|Profit x5
Lemon Batteries|4250|Profit x2
Free Tequila|4500|Profit x2
Beverage of Champions|4750|Profit x2
Drink Up|5000|Profit x5
Not a Problemon|5250|Profit x3
Deficitrus|5500|Profit x3
Long Live the Lemonarch|5750|Profit x3
Shining Emblemon|6000|Profit x5
The Lemonolith|6250|Profit x3
Lemonocle|6500|Profit x3
Very A-peeling|6750|Profit x3
King SoLemon|7000|Profit x5
Seedless Wonder|7000|Profit x3
Lifts Stains|7250|Profit x3
Lemonopoly|7500|Profit x3
Lucky Lemons|7777|Profit x3
Lemonstrous Heights|8000|Profit x3
You're Lemongst Friends|8200|Profit x3
Lemonotony|8400|Profit x3
Metaxylemonic Research|8600|Profit x3
Parabolemon Equations|8800|Profit x3
Precious...|9000|Profit x3
Once More To The Juicer|9100|Profit x3
Main Squeeze|9200|Profit x3
Endless Demand|9300|Profit x3
Luck Be A Lemon|9400|Profit x3
The Lemoning|9500|Profit x3
Lemonlemonlemonlemonlemon|9600|Profit x3
Lemonocolor Reality|9700|Profit x3
Lemoney|9800|Profit x3
The Penultimate Moment|9999|Profit x1.9999
Life's Manager|10000|Profit x5
`),
  [siliconValleyBusinessTargets.newspaper]: parseTargetRows(`
Extra Extra!|25|yc|Profit Speed Doubled
Read All About It|50|yc|Profit Speed Doubled
Daily Deliveries|100|yc|Profit Speed Doubled
Lemonade Ads|125|bitcoin-miner|Profit x2
Car Wash Ads|150|waymo|Profit x2
Pizza Ads|175|stanford-dropout|Profit x2
Digital Digest|200|yc|Profit Speed Doubled
Donut Ads|225|h100-gpu-cluster|Profit x2
Lemonade Coupons|250|bitcoin-miner|Profit x3
Car Wash Coupons|275|waymo|Profit x3
Telepathic News|300|yc|Profit Speed Doubled
Pizza Coupons|325|stanford-dropout|Profit x3
Donut Coupons|350|h100-gpu-cluster|Profit x3
Lemon Scented|375|bitcoin-miner|Profit x4
News FROM THE FUTURE|400|yc|Profit Speed Doubled
New Car Scented|425|waymo|Profit x4
Pizza Scented|450|stanford-dropout|Profit x4
Donut Scented|475|h100-gpu-cluster|Profit x4
Subliminal Shrimp|500|cursor-tab|Profit x11
Lemonade Samples|525|bitcoin-miner|Profit x5
Soap Samples|550|waymo|Profit x5
Pizza Samples|575|stanford-dropout|Profit x5
Such Hockey|600|polymarket|Profit x11
Donut Samples|625|h100-gpu-cluster|Profit x5
Lemon Sudoku|650|bitcoin-miner|Profit x6
Car Word Search|675|waymo|Profit x6
Mandatory Viewing|700|chatgpt-3-5|Profit x11
Pizza Crossword|725|stanford-dropout|Profit x6
Donut Horoscope|750|h100-gpu-cluster|Profit x6
Lemon Propaganda|775|bitcoin-miner|Profit x3
Newspeak Stocks|800|nvidia|Profit x11
Car Wash Propaganda|825|waymo|Profit x7
Pizza Propaganda|850|stanford-dropout|Profit x7
Donut Propaganda|875|h100-gpu-cluster|Profit x7
READ BUY GAS OBEY|900|agi|Profit x11
Shrimp Reminder|925|cursor-tab|Profit x7
Origami Puck|950|polymarket|Profit x7
Spoiler Free World|975|chatgpt-3-5|Profit x7
Media Rebirth|1000|yc|Profit x7777777
Pre-Approved Applications|1025|nvidia|Profit x7
Oil Coup-on|1050|agi|Profit x7
Page 3 Ads|1075|waymo|Profit x8
Edible Ads|1100|stanford-dropout|Profit x8
Honey Glazed Ads|1125|h100-gpu-cluster|Profit x8
Cocktail Sauced Ads|1150|cursor-tab|Profit x8
Beer Soaked Ads|1175|polymarket|Profit x8
Talkie Ads|1200|chatgpt-3-5|Profit x8
Ads On Money|1225|nvidia|Profit x8
Oily Ads|1250|agi|Profit x8
Internet Integration|1300|yc|Profit x7777
Lemon Bribes|1350|bitcoin-miner|Profit x9
Car Wash Bribes|1400|waymo|Profit x9
Pizza Bribes|1450|stanford-dropout|Profit x9
Donut Bribes|1500|h100-gpu-cluster|Profit x9
Shrimp Bribes|1550|cursor-tab|Profit x9
Hockey Bribes|1600|polymarket|Profit x9
Movie Bribes|1650|chatgpt-3-5|Profit x9
Money Bribes|1700|nvidia|Profit x9
Gas Bribes|1750|agi|Profit x9
Eat Shrimp Or Else|1800|cursor-tab|Profit x10
Watch Hockey Or Pay|1850|polymarket|Profit x10
Go To Movies or Perish|1900|chatgpt-3-5|Profit x10
Bank With Us Forever|1950|nvidia|Profit x10
Printer Ink Discount|2000|yc|Profit x7777
Car Wash Applications|2100|waymo|Profit x15
Pizza Poetry|2200|stanford-dropout|Profit x15
Donutopia|2300|h100-gpu-cluster|Profit x15
Paper Pirate Hats|2400|cursor-tab|Profit x15
New Gnu Knews News|2500|yc|Profit x777
Embedded Movies|2600|chatgpt-3-5|Profit x15
Top 10 Bank List|2700|nvidia|Profit x15
Hilarious Oil Ads|2800|agi|Profit x15
Pulitzer Lemon Article|2900|bitcoin-miner|Profit x15
Recursion|3000|yc|Profit x777
24 Hour Car News|3100|waymo|Profit x20
Insightful Commentary|3200|polymarket|Profit x20
Bank Shaped Pages|3300|nvidia|Profit x20
Click Baits|3400|agi|Profit x20
That Old Chestnut|3500|yc|Profit x777
Puck Scandal|3600|polymarket|Profit x25
Adorable Newsies|3700|chatgpt-3-5|Profit x25
Panic Driven Headlines|3800|nvidia|Profit x25
Laminated Ads|3900|agi|Profit x25
Do You Remember...|4000|yc|Profit x30
...So Long Ago...|4100|bitcoin-miner|Profit x30
...When Newspapers...|4200|waymo|Profit x30
...Were Worthless?|4300|stanford-dropout|Profit x30
Those Days Are Long Past...|4400|h100-gpu-cluster|Profit x30
...And Though It Is Strange...|4500|cursor-tab|Profit x30
...I'm Sure You'd Agree...|4600|polymarket|Profit x30
...Newspapers Proved Themselves...|4700|chatgpt-3-5|Profit x30
...And It Was Shrimp Boats...|4800|nvidia|Profit x30
...That Sucked All Along.|4900|agi|Profit x30
x50|5000|yc|Profit x50
x50 Again|5100|yc|Profit x50
x50 Yet Again|5200|yc|Profit x50
x50 For Good Measure|5300|yc|Profit x50
The Rest Is Silence|5400|yc|Profit x50
`),
  [siliconValleyBusinessTargets.carWash]: parseRows(siliconValleyBusinessTargets.carWash, `
Working At The Carwash|25|Profit Speed Doubled
Wash And Wax|50|Profit Speed Doubled
Supreme Service|100|Profit Speed Doubled
Diamond Sealed|200|Profit Speed Doubled
Infinite Clean|300|Profit Speed Doubled
Artificially Intelligent Suds|400|Profit Speed Doubled
Grey Goo Detergent|500|Profit x2
Downloadable Wash|600|Profit x2
Stronger Than Dirt|700|Profit x2
Free Car With Purchase|800|Profit x2
When You Wash Upon A Star|900|Profit x2
On Every Corner|1000|Profit x3
Planet Saturation|1100|Profit x2
Horses Too|1200|Profit x2
Home Installations|1300|Profit x2
Car Mounted Washers|1400|Profit x2
Bubbles!|1500|Profit x2
Are You Reading These?|1600|Profit x2
Self Washing Cars|1700|Profit x2
Temporal Pre-Wash|1800|Profit x2
Wax On Wax Off|1900|Profit x2
Everything Is Clean|2000|Profit x5
Free Gold Plating|2100|Profit x3
Rim Shiners|2200|Profit x3
Cash Launder-ing|2300|Profit x3
Hamster Powered|2400|Profit x3
Self Service|2500|Profit x3
The Bogdan Effect|2600|Profit x3
Malamine Foam!|2700|Profit x3
No Bug Guts|2800|Profit x3
Garden Hose Discount|2900|Profit x3
Probably Too Many|3000|Profit x3
The Car-tel|3100|Profit x3
SCRUB|3200|Profit x3
Supplies!|3300|Profit x3
George Wash-ington Sale|3400|Profit x3
Nearly Done|3500|Profit x3
Car Wash Washers|3600|Profit x3
Car Wash Washer Washers|3700|Profit x3
Dance Parties|3800|Profit x3
Carpool Discounts|3900|Profit x3
Convertible Friendly|4000|Profit x5
Scrub Harder|4100|Profit x3
Shares Are Up|4200|Profit x3
Clean Capitalism|4300|Profit x3
Demand Continues|4400|Profit x3
The Freshest|4500|Profit x3
Lean, Mean, Clean|4600|Profit x3
7 Second Suds|4700|Profit x3
But Wait There's More|4800|Profit x3
Really? More?|4900|Profit x3
All The Suds|5000|Profit x5
Probably Overkill|5250|Profit x3
Pristine|5500|Profit x3
`),
  [siliconValleyBusinessTargets.pizza]: parseRows(siliconValleyBusinessTargets.pizza, `
30 Min or Less|25|Profit Speed Doubled
Fancy Toppings|50|Profit Speed Doubled
Gourmet Crust|100|Profit Speed Doubled
Free Cheese Bread|200|Profit Speed Doubled
Home Rehydrator|300|Profit Speed Doubled
Intravenous Cheese|400|Profit Speed Doubled
Everlasting Pepperoni|500|Profit x2
Pizza Stuffed Pizza|600|Profit x2
Calzone Breakthrough|700|Profit x2
Self Microwaving|800|Profit x2
One With Everything|900|Profit x2
It Smells Like Pizza|1000|Profit x3
That's Amore|1100|Profit x2
Over 1 Decillion Served|1200|Profit x2
Wibbly Wobbly Deliveries|1300|Profit x2
Deep Dish Discovery|1400|Profit x2
Pizza Cluster Bombs|1500|Profit x2
Pizza Putt!|1600|Profit x2
New Cheese Sources|1700|Profit x2
Pizza Roll Call Centers|1800|Profit x2
Unobtanium Crust|1900|Profit x2
The Pie In The Sky|2000|Profit x5
Pizza Saline Dip|2100|Profit x3
Pizza Squared|2200|Profit x3
Chow-abunga|2300|Profit x3
Counts As Vegetable|2400|Profit x3
More Like Pizza-What|2500|Profit x3
Cold Pizza|2600|Profit x3
Chain of Chains|2700|Profit x3
Pizza Holiday Declared|2800|Profit x3
Pizza Planescape|2900|Profit x3
I Am Pizza|3000|Profit x3
Entangled Two For 1|3100|Profit x3
Hand Tossed Employees|3200|Profit x3
Romantic Dinner|3300|Profit x3
Vegan Options|3400|Profit x3
Cake Flavored Pizza|3500|Profit x3
Pizza Flavored Cake|3600|Profit x3
Witty Achievement Text|3700|Profit x3
Deliver Us|3800|Profit x5
Free Wings|3900|Profit x3
Unlimited Toppings|4000|Profit x5
Causality Crust|4100|Profit x3
Stand And Deliver|4200|Profit x3
It IS Delivery|4300|Profit x3
Pizzanity|4400|Profit x3
By The Slice|4500|Profit x3
Large Hadron Crust-ollider|4600|Profit x3
Cold|4700|Profit x3
Origami Boxes|4800|Profit x3
Free Croutons|4900|Profit x3
Fancy Napkins|5000|Profit x5
Always Room|5250|Profit x3
Hamburgers, Anyone?|5500|Profit x3
Thus Spoke Pizzarathustra|5750|Profit x3
`),
  [siliconValleyBusinessTargets.donut]: parseRows(siliconValleyBusinessTargets.donut, `
Lots of Dough|25|Profit Speed Doubled
Extra Sprinkles|50|Profit Speed Doubled
Deep Fried|100|Profit Speed Doubled
Donut Filled Donuts|200|Profit Speed Doubled
Doughnut Shaped Universe|300|Profit Speed Doubled
Unified Donut Theory|400|Profit Speed Doubled
Final Donut|500|Profit x2
Donut Flavored Coffee|600|Profit x2
Golden Glaze|700|Profit x2
Guaranteed Minimal Donuts|800|Profit x2
Roll Up The Outer Rim|900|Profit x2
Wireless Donuts|1000|Profit x3
Got Donuts?|1100|Profit x2
Long John Long Johns|1200|Profit x2
Reality DonuTV|1300|Profit x2
Donut Addiction Hotlines|1400|Profit x2
Donuts Safe Houses|1500|Profit x2
Regenerating Donuts|1600|Profit x2
Heat Seaking Pastries|1700|Profit x2
Submit|1800|Profit x2
The Donutrix|1900|Profit x2
Then Who Was Donut?|2000|Profit x5
Pumpkin Flavored|2100|Profit x3
Strangely Popular|2200|Profit x3
Self Dunking|2300|Profit x3
Double Rainbow Sprinkles!|2400|Profit x3
Edible Receipts|2500|Profit x3
Dough-Cubes|2600|Profit x3
Fifth Dimension Frosting|2700|Profit x3
The Adar Standard|2800|Profit x3
Donut Don't it?|2900|Profit x3
Temperance Solvent|3000|Profit x3
Build Your Own|3100|Profit x3
Cream Cheese Based|3200|Profit x3
Gone Viral?|3300|Profit x3
Chicken Options|3400|Profit x3
0 Calories|3500|Profit x3
Donut Booths|3600|Profit x3
Liquid Donuts|3700|Profit x3
Sassy Chefs|3800|Profit x3
Everyone Knows Your Name|3900|Profit x3
Cookies Too|4000|Profit x3
Gold Leaf Sprinkles|4100|Profit x3
The Only Food Group|4200|Profit x3
Innuendonut|4300|Profit x3
Tae Kwon Donut|4400|Profit x3
5th Dimension Donuts|4500|Profit x3
Creme Filled Filled|4750|Profit x3
Basically Sugar|5000|Profit x3
Gluten Free Water|5250|Profit x3
Vacuum Sealed|5500|Profit x3
Hasty Pastry|5750|Profit x3
6000 Is A Lot|6000|Profit x3
Philosophiae Donutus Principia|6250|Profit x3
`),
  [siliconValleyBusinessTargets.shrimp]: parseRows(siliconValleyBusinessTargets.shrimp, `
Wanna Buy A Shrimp Boat?|25|Profit Speed Doubled
Surf and Turf|50|Profit Speed Doubled
Gumbo King|100|Profit Speed Doubled
Gigantic Shrimp|200|Profit Speed Doubled
Galactic Fleet|300|Profit Speed Doubled
Celestial Shrimp|400|Profit Speed Doubled
Cosmic Grill|500|Profit x2
Black Hole Trolling|600|Profit x2
The Shrimpularity|700|Profit x2
All You Can Eat|800|Profit x2
Shrimpocalypse|900|Profit x2
Shellfish Selfish|1000|Profit x3
Prawns Are Good Too|1100|Profit x2
Begun The Shrimp Wars Have|1200|Profit x2
Gumbo's Rebellion|1300|Profit x2
King in The North Sea|1400|Profit x2
Crustacean Uprising|1500|Profit x2
Nuclear Shish Kabobs|1600|Profit x2
The Blackwater BBQ|1700|Profit x2
Battle of The Bilge|1800|Profit x2
Lobster Betrayal!|1900|Profit x2
The Red Wetting|2000|Profit x5
Butter|2100|Profit x3
The Spice Flows|2200|Profit x3
Mermaid-Safe Nets|2300|Profit x3
Room On The Barbie|2400|Profit x3
All In The De-tails|2500|Profit x3
Miniature Jumbo Shrimp|2600|Profit x3
Darling It's Better|2700|Profit x3
A Nice Chianti|2800|Profit x3
Shrimpulse|2900|Profit x3
Hungry?|3000|Profit x3
Shrimp-Based Fashions|3250|Profit x5
Shrimpshrimpshrimpshrimp|3500|Profit x5
Never Gets Old|3750|Profit x3
A Complete Breakfast|4000|Profit x5
What Is Even Happening|4250|Profit x3
No|4500|Profit x5
Stroke!|4750|Profit x3
Off The Port Bow|5000|Profit x5
Just Keep Shrimping|5250|Profit x3
Snap To It|5500|Profit x3
Butter Prices Soar|5750|Profit x3
The Meaning Of Garlic|6000|Profit x5
From Heck's Heart...|6250|Profit x3
...I Skewer Thee!|6500|Profit x5
`),
  [siliconValleyBusinessTargets.hockey]: parseRows(siliconValleyBusinessTargets.hockey, `
Underdogs|25|Profit Speed Doubled
Division Champs|50|Profit Speed Doubled
All Stars|100|Profit Speed Doubled
Hall of Fame|200|Profit Speed Doubled
The Great Ones|300|Profit Speed Doubled
Dream Team|400|Profit Speed Doubled
Perfect Puck|500|Profit x2
Robot Players|600|Profit x2
Intergalactic League|700|Profit x2
Yeah. More Hockey.|800|Profit x2
Sudden Death|900|Profit x2
Leagues Of Leagues|1000|Profit x3
Daily Game 7|1100|Profit x2
Player Cloning Factories|1200|Profit x2
Explosive Pucks|1300|Profit x2
The Refs ARE Blind|1400|Profit x2
Rocket Skates|1500|Profit x2
Release The Lions!|1600|Profit x2
Release The Robo-Lions!!|1700|Profit x2
Play For Food|1800|Profit x2
The Hungry Games|1900|Profit x2
Almost As Big As Football|2000|Profit x5
Competent Refs|2100|Profit Speed Doubled
Extra Loud Sirens|2200|Profit x3
Either Orr|2300|Profit Speed Doubled
Super Bash Bros.|2400|Profit x3
Puck Injections|2500|Profit Speed Doubled
Artificial Ice|2600|Profit x3
Knucklepuck|2700|Profit Speed Doubled
Cutting Edge Effect|2800|Profit x3
Flying W|2900|Profit x3
Everyone's Crosby|3000|Profit x3
Miracle On Ice|3250|Profit x3
Honorary Canadian|3500|Profit x3
Helmet Shortages|3750|Profit x3
Puck Is A 4 Letter Word|4000|Profit x5
Face On Face Off|4250|Profit x3
Game On!|4500|Profit x3
Double Decker Rinks|4750|Profit x3
Game On And On And On|5000|Profit x7
Boom Boom Clap|5250|Profit x3
Fight Night|5500|Profit x3
Icing On The Cake|5750|Profit x3
Do The Wave|6000|Profit x7
Slap Shotgun|6250|Profit x3
Be The Puck|6500|Profit x3
A Sea Of Jerseys|6750|Profit x3
Hockey Is Pretty Cool|7000|Profit x7
`),
  [siliconValleyBusinessTargets.movie]: parseRows(siliconValleyBusinessTargets.movie, `
Lights!|25|Profit Speed Doubled
Camera!|50|Profit Speed Doubled
Action!|100|Profit Speed Doubled
Blockbuster!|200|Profit Speed Doubled
Statuette Sweeper!|300|Profit Speed Doubled
Library Of Congress|400|Profit Speed Doubled
Cultural Masterpiece|500|Profit x2
Cult Following|600|Profit x2
Holodeck Tech|700|Profit x2
Dream-To-Screen Implants|800|Profit x2
Rosebud...|900|Profit x2
Wizard Vampire Decalogy|1000|Profit x3
The Cinema Constant|1100|Profit x2
$0.99 Admission|1200|Profit x2
Crossover Cornucopia|1300|Profit x2
Inconsiderate Patron Muted|1400|Profit x2
Wake Up...|1500|Profit x2
This Game Has You...|1600|Profit x2
But It's No Game...|1700|Profit x2
It's A SPACE STATION!|1800|Profit x2
Free Popcorn!|1900|Profit x2
Pax Hollywooda|2000|Profit x5
Eye-Max|2100|Profit Speed Doubled
Glasses Free 4D|2200|Profit x2
98 Hour Award Show|2300|Profit Speed Doubled
Feature Length Trailer|2400|Profit x2
Privacy Domes|2500|Profit Speed Doubled
Director's Cutlass|2600|Profit x2
Bad Movie Executions|2700|Profit Speed Doubled
Critical Hit!|2800|Profit x2
Choose Your Own Ending|2900|Profit x2
Nothing Sucks|3000|Profit x2
Physical Props|3250|Profit Speed Doubled
Kibrick Clones|3500|Profit x2
Make-A-Movie Booths|3750|Profit x2
Under Budget|4000|Profit x2
Film Renaissance|4250|Profit x3
Here's Looking At You|4500|Profit x3
It Was The Sled|4750|Profit x3
Show Me The Money|5000|Profit x5
Daisy... Daisy...|5250|Profit x3
Greenlit|5500|Profit x3
104% Rating|5750|Profit x3
Skyward Thumbs|6000|Profit x9
Triple Triple Triple Threat|6250|Profit x3
Max-I-Max-Ium|6500|Profit x3
Toast|6750|Profit x3
Tinsel Megapolis|7000|Profit x9
Industry Jargon|7250|Profit x3
Alan Smithee Award|7500|Profit x3
That's Show Biz|7750|Profit x3
`),
  [siliconValleyBusinessTargets.bank]: parseRows(siliconValleyBusinessTargets.bank, `
A Capital Idea|25|Profit Speed Doubled
Not-So-Petty Cash|50|Profit Speed Doubled
Too Big To Fail|100|Profit Speed Doubled
Galactic Reserve|200|Profit Speed Doubled
All The Moneys|300|Profit Speed Doubled
Bourgeois Banks|400|Profit Speed Doubled
It Prints Money|500|Profit x2
Ritual Residuals|600|Profit x2
Money Trees|700|Profit x2
Recession Proof|800|Profit x2
Open On Weekends|900|Profit x2
Monetary Overlord|1000|Profit x3
Your Face On Money|1100|Profit x2
No Interest Loans|1200|Profit x2
Taxes Make Sense|1300|Profit x2
Bank Teller House Calls|1400|Profit x2
Loveably Snarky ATMs|1500|Profit x2
Unlimited Overdraft|1600|Profit x2
More Like FAIR Miles|1700|Profit x2
Please Sign Here|1800|Profit x2
Mega Buck Research|1900|Profit x2
Multiverse Bank Est.|2000|Profit x5
Indestructible Bank Bills|2250|Profit Speed Doubled
Fat Cat Scratch Post|2500|Profit Speed Doubled
Hack Proof Accounts|2750|Profit Speed Doubled
1st National Piggy Bank|3000|Profit Speed Doubled
Recuse Rescue|3250|Profit Speed Doubled
Conflict of Win-terest|3500|Profit Speed Doubled
Now Accepting Blood|3750|Profit Speed Doubled
Truly The Bank Of Banks|4000|Profit Speed Doubled
Mo' Money|4250|Profit x3
Mad Money|4500|Profit x3
Cash-ual Fridays|4750|Profit x3
Rothschild|5000|Profit x5
#1 Banker Mug|5250|Profit x5
Smooth Operator|5500|Profit x3
Gold Backed|5750|Profit x3
Cash. Must. Flow.|6000|Profit x5
Branches In Branches|6250|Profit x3
Vest Investments|6500|Profit x3
More Roman Columns|6750|Profit x3
Money Is Valuable|7000|Profit x5
Legal Tender Embrace|7250|Profit x3
Crash-Proof|7500|Profit x3
Magnificence|7750|Profit x3
Bank Right|8000|Profit x5
Ascend The Ivory Tower|8250|Profit x3
The Offest Shore|8500|Profit x3
`),
  [siliconValleyBusinessTargets.oil]: parseRows(siliconValleyBusinessTargets.oil, `
Slick Enterprise|25|Profit Speed Doubled
Black Gold|50|Profit Speed Doubled
There Will Be Oil|100|Profit Speed Doubled
Crude Empire|200|Profit Speed Doubled
Oil Nebula|300|Profit Speed Doubled
Carbon Universe|400|Profit Speed Doubled
Planck Petrol|500|Profit x2
5th Dimension-Oil|600|Profit x2
Oil String Theory|700|Profit x2
Dark Matter Derricks|800|Profit x2
Observable Oiliverse|900|Profit x2
Excessive|1000|Profit x3
Total Carbon Mastery|1100|Profit x2
Reverse Engineered Dinos|1200|Profit x2
Drill, Baby, Drill!|1300|Profit x2
Renewable Oil Wells|1400|Profit x2
Derricks With Googly Eyes|1500|Profit x2
Robotic Barrels|1600|Profit x2
Reasonable Gas Prices|1700|Profit x2
Free Oil-Based Education|1800|Profit x2
Crude Is Still King|1900|Profit x2
It's Oily...|2000|Profit x5
Crudementary|2250|Profit Speed Doubled
Win Or Diesel|2500|Profit Speed Doubled
LFM WD40 ASAP|2750|Profit Speed Doubled
Mole-Friendly Derricks|3000|Profit Speed Doubled
Gas Diesel Hybrids|3250|Profit Speed Doubled
Lay Pipe|3500|Profit Speed Doubled
Catchy Slogan|3750|Profit Speed Doubled
Peaked?|4000|Profit Speed Doubled
That Constant T-oil|4250|Profit Speed Doubled
Hey, Why Not?|4500|Profit Speed Doubled
Thrill Drilling|4750|Profit Speed Doubled
Oil|5000|Profit Speed Doubled
Obsessed Much?|5250|Profit x3
Get ALL The Oil!|5500|Profit x3
Derrick Every 5 Feet|5750|Profit x3
That's Oil Folks!|6000|Profit x5
Oil Is Love|6250|Profit x3
The P-Oil-ice|6500|Profit x3
Move To Beverly|6750|Profit x3
Black|7000|Profit x7
New Deposits|7250|Profit x3
Hot And Fresh|7500|Profit x3
Carbonous|7750|Profit x3
Oi Yoi yOil!|8000|Profit x3
Frack!|8250|Profit x3
Apolitical Market|8500|Profit x3
Fries With That?|8750|Profit x3
Terra Infirma|9000|Profit x7
Licence To Drill|9250|Profit x3
It Never Ends|9500|Profit x3
Pipe Dream|9750|Profit x3
`),
};

export const siliconValleyAllBusinessUnlockRows = parseRows("all", `
Isn't That Vierd?|1|5 Free Gold
Mogul|25|Profit Speed Doubled
Oligarch|50|Profit Speed Doubled
Pull-Vault|50|1 spin on the Slot Machine
Tycoon|100|Profit Speed Doubled
I Am Ya Fahza!|100|5 Free Gold
Adam Smith Award|200|Profit Speed Doubled
Jack Pot O'Gold|200|1 spin on the Slot Machine
Universal Capitalist|300|Profit Speed Doubled
Theoretical Economist|400|Profit Speed Doubled
Casino Royale with Cheese|400|1 spin on the Slot Machine
The One True Investor|500|Profit Doubled
Shigar Und A Waffle?|500|10 Free Gold
Game Of Loans|600|Profit Doubled
That Can't Be Good|666|Profit Doubled
Black Ink Inc|700|Profit Doubled
Lucky 777s|777|Profit Doubled
Can You Slot Me In?|777|1 spin on the Slot Machine
Lord Of Lobbyists|800|Profit Doubled
Midas|900|Profit Doubled
Literally Can't Even|1000|Profit Doubled
Yesh, Dat Is A Keepah!|1000|15 Free Gold
Psyche!|1100|Profit Doubled
There Can Only Be Ones|1111|Profit Doubled
The Hang Of It|1200|Profit Doubled
Oceans Elevigintillion|1200|1 spin on the Slot Machine
Invisible Hand High Five|1300|Profit Doubled
Captain Capitalism|1400|Profit Doubled
$ Shaped Pool|1500|Profit Doubled
You're The Boss|1600|Profit Doubled
Perspective Annihilation|1700|Profit Doubled
New Frontier Capitalism|1800|Profit Doubled
It's Never Enough|1900|Profit Doubled
Nice Round Numbers|2000|Profit Doubled
Big Pit Bossman|2000|1 spin on the Slot Machine
Frequent Updates|2100|Profit Doubled
Punctual Launches|2200|Profit Doubled
2222|2222|Profit Doubled
Audience Rapport|2300|Profit Doubled
A Top Hat Is You|2400|Profit Doubled
A True AdVenture Capitalist|2500|Profit Doubled
Toite Like A Toiger|2500|20 Free Gold
Good Gracious|2600|Profit Doubled
Gold Pressed Latinum|2700|Profit Doubled
FASTER!|2800|Profit Doubled
A Noteworthy Day|2900|Profit Doubled
Adam Smith Is Proud|3000|Profit Doubled
Make it Rain Man!|3000|1 spin on the Slot Machine
Keep Climbing|3100|Profit Doubled
Upward Trend|3200|Profit Doubled
Boom|3300|Profit Doubled
3333|3333|Profit Doubled
Magical Pixels|3400|Profit Doubled
The Roaring 3500s|3500|Profit Doubled
Robert's Dinero|3500|1 spin on the Slot Machine
Take What You Can|3600|Profit Doubled
Where's The Roof On This?|3700|Profit Doubled
Symphon-Economics|3800|Profit Doubled
Pecunia Vincit Omnia|3900|Profit Doubled
The Legend Continues|4000|Profit Doubled
An Amster-dam Good Time|4000|30 Free Gold
12th Cup of Coffee|4000|1 spin on the Slot Machine
Who Writes These Things?|4100|Profit Doubled
Humongous Numbers|4200|Profit Doubled
Penny Pincher|4300|Profit Doubled
Glorious|4400|Profit Doubled
Always I Will Believe In You|4500|Profit Doubled
Slot Pull Tunnel Syndrome|4500|1 spin on the Slot Machine
And Make Believe In You|4600|Profit Doubled
And Live In Harmony|4700|Profit Doubled
Battery Eater|4800|Profit Doubled
Never Give Up|4900|Profit Doubled
Achievement|5000|Profit Doubled
I Love GOOOOOOLD!|5000|50 Free Gold
`);
