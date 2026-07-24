export const AVATAR_COLORS = [
  { key: "forest", label: "Forest", background: "#294434", foreground: "#f4ead6" },
  { key: "sage", label: "Sage", background: "#8da58a", foreground: "#17251b" },
  { key: "amber", label: "Amber", background: "#dfa95f", foreground: "#35230e" },
  { key: "terracotta", label: "Terracotta", background: "#bd7158", foreground: "#fff5ed" },
  { key: "lavender", label: "Lavender", background: "#9585b8", foreground: "#191225" },
  { key: "ocean", label: "Ocean", background: "#4f8295", foreground: "#effbff" },
  { key: "sky", label: "Sky", background: "#89b6cf", foreground: "#132934" },
  { key: "rose", label: "Rose", background: "#c78895", foreground: "#32161c" },
  { key: "plum", label: "Plum", background: "#72536f", foreground: "#fff1fb" },
  { key: "moss", label: "Moss", background: "#65744b", foreground: "#f6f2dd" },
  { key: "clay", label: "Clay", background: "#a98c72", foreground: "#271d15" },
  { key: "slate", label: "Slate", background: "#667684", foreground: "#f4f8fa" },
  { key: "sunshine", label: "Sunshine", background: "#e3c85e", foreground: "#352f0e" },
  { key: "coral", label: "Coral", background: "#df8874", foreground: "#371912" },
  { key: "mint", label: "Mint", background: "#8fc7b1", foreground: "#173128" },
  { key: "midnight", label: "Midnight", background: "#30364f", foreground: "#f2f1ff" },
];

export const AVATAR_CATEGORIES = ["All", "Nature", "Animals", "Food", "Activities", "Places", "Objects", "Symbols", "More"];

const CATEGORY_PATTERNS = {
  Nature: /Acorn|Cactus|Clover|Cloud|Drop|Feather|Fire|Flower|Island|Leaf|Lightning|Moon|Mountains?|Planet|Rainbow|Snow|Sparkle|Star|Sun|Tree|Waves?|Wind|Farm|Plant|Seedling|Paw|Volcano|Hurricane|Thermometer|Tornado/i,
  Animals: /Animal|Bird|Butterfly|Cat|Cow|Crab|Dog|Fish|Horse|Owl|Rabbit|Bug|Spider|Shrimp|Bone|Paw|Penguin|Bat|Mouse|Turtle|Whale|Dolphin|Duck|Pig|Sheep|Chicken|Rooster|Deer|Squirrel|Seal/i,
  Food: /Apple|Avocado|Beer|Bowl|Bread|Cake|Carrot|Cheese|Coffee|Cookie|Cooking|Egg|Fork|Hamburger|IceCream|Lemon|Orange|Pepper|Pizza|Popcorn|Wine|Martini|Tea|BowlFood|Chef|Grains|Jar|Knife|Mug|Pint|Strawberry|Watermelon|Burrito|Taco/i,
  Activities: /Ball|Basketball|Bicycle|Boat|Book|Camera|Campfire|Cards|Chess|Game|Guitar|Headphones|Microphone|Music|Palette|Paint|Piano|Soccer|Tennis|Football|Baseball|PersonSimple|Running|Swimming|Barbell|Medal|Trophy|Film|Vinyl|Sketch|Needle|Yarn|Puzzle|Dice|Sneaker|Hockey|Volleyball|Bowling/i,
  Places: /Building|Castle|Church|City|Factory|Farm|Garage|Globe|House|Island|Lighthouse|Map|Mountains?|Park|Road|Tent|Tipi|Tree|Warehouse|Bridge|Compass|Path|Signpost|Storefront|Hospital|Bank|Office|School|University/i,
  Objects: /Anchor|Backpack|Bag|Balloon|Bell|Binoculars|Book|Bottle|Broom|Bucket|Calendar|Candle|Chair|Clock|Compass|Crown|Diamond|Envelope|Eyeglasses|Fan|Flashlight|Gift|Glasses|Globe|Handbag|Headphones|Key|Lamp|Lantern|MagicWand|Magnet|Medal|PaperPlane|Pencil|Phone|Rocket|Sailboat|Suitcase|Telescope|Ticket|Toolbox|Umbrella|Watch|Wheel|Windmill/i,
  Symbols: /Circle|Diamond|Eye|Flag|Flower|Hand|Heart|Infinity|Peace|Shield|Smiley|Sparkle|Star|Thumb|YinYang|Crown|Medal|Confetti|Cheers|Handshake|Hands|Fingerprint|Selection|SealCheck|CheckCircle|Question|Exclamation/i,
};

// The picker intentionally removes corporate marks, weapons, editor controls,
// files, currencies, and other shapes that read like software UI—not identity.
const EXCLUDED = /Logo$|Brand|Trademark|Copyright|Currency|Money|Coin|CreditCard|Bank|Receipt|Invoice|Barcode|QrCode|File|Folder|Floppy|Download|Upload|Export|Import|Arrow|Caret|Cursor|Align|Text|Paragraph|List|Columns?|Rows?|Table|Code|Terminal|Brackets?|Braces?|Function|Math|Number|Hash|Regex|Sort|Funnel|Sliders?|Toggle|Radio|Checkbox|Selection|BoundingBox|Crop|Resize|Sidebar|Layout|Queue|Stack|Tabs?|Dots|Grid|Monitor|Device|Browser|AppWindow|Window|Command|Control|Option|KeyReturn|Backspace|Enter|Eject|Play|Pause|Stop|Skip|Rewind|FastForward|Record|Speaker|Volume|Wifi|Bluetooth|Battery|Plug|Cpu|Circuitry|HardDrive|Database|CloudCheck|CloudX|Lock|Password|SignIn|SignOut|User|Users|Identification|AddressBook|Contactless|PhoneCall|Chat|Chats|Notification|BellRinging|Trash|Delete|X$|Plus|Minus|Check$|Warning|Info|Prohibit|Scales|Gavel|Siren|Police|Handcuffs|Gun|Pistol|Knife|Sword|Axe|Bomb|Crosshair|Target|Needle$|Syringe|Pill|Prescription|FirstAid|Ambulance|Virus|Biohazard|Toilet|Gender|PersonArmsSpread|Wheelchair|Baby|Exam|Student|Factory|OfficeChair|Package|Shopping|Storefront|Taxi|Bus|Train|Airplane|Car|Motorcycle|Truck|Tractor|Subway|Traffic|Elevator|Escalator|Engine|GasPump|ChargingStation|RoadHorizon|Git|Github|Gitlab|Codepen|Figma|Discord|Facebook|Instagram|Linkedin|Reddit|Slack|Snapchat|Tiktok|Twitch|Twitter|Whatsapp|Youtube|Windows|Android|AppleLogo|Google|Amazon|Paypal|Spotify/i;

export function buildAvatarCatalog(iconModule) {
  const names = Object.keys(iconModule)
    .filter((name) => /^[A-Z][A-Za-z0-9]+$/.test(name))
    .filter((name) => !name.endsWith("Icon"))
    // Every real Phosphor icon has both `Butterfly` and `ButterflyIcon`
    // exports. This check keeps framework helpers out of the avatar list.
    .filter((name) => iconModule[`${name}Icon`])
    .filter((name) => !EXCLUDED.test(name))
    .filter((name) => name !== "IconContext" && name !== "SSR");

  return [...new Set(names)].sort().map((name) => ({
    name,
    label: name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2"),
    category: Object.entries(CATEGORY_PATTERNS).find(([, pattern]) => pattern.test(name))?.[0] || "More",
  }));
}

export function parsePresetAvatar(value) {
  const match = /^preset:([A-Za-z0-9]+):([a-z-]+)$/.exec(value || "");
  return match ? { icon: match[1], color: match[2] } : null;
}

export function avatarColor(key) {
  return AVATAR_COLORS.find((color) => color.key === key) || AVATAR_COLORS[0];
}
