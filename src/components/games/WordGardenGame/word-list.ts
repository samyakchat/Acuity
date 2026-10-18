export type Category = {
  id: string;
  title: string; 
  clusters: Record<string, string[]>;
};


export const CATEGORIES: Category[] = [
  {
    id: "animals",
    title: "ANIMALS",
    clusters: {
      farm: [
        "cow", "pig", "horse", "sheep", "goat", "chicken", "duck",
        "turkey", "donkey", "rooster", "hen", "lamb", "calf", "goose",
        "mule", "pony", "ox", "bull", "geese", "rabbit", "barn cat",
      ],
      pets: [
        "dog", "cat", "hamster", "rabbit", "guinea pig", "goldfish",
        "fish", "puppy", "kitten", "ferret", "gerbil", "bunny",
        "parakeet", "canary", "parrot", "turtle", "pet bird",
      ],
      safari: [
        "lion", "tiger", "elephant", "giraffe", "zebra", "hippo",
        "hippopotamus", "rhino", "rhinoceros", "cheetah", "leopard",
        "monkey", "gorilla", "chimpanzee", "chimp", "baboon", "camel",
        "panda", "kangaroo", "koala", "antelope", "gazelle", "hyena",
        "jaguar", "lemur", "orangutan", "llama",
      ],
      woodland: [
        "bear", "deer", "wolf", "fox", "raccoon", "squirrel", "moose",
        "elk", "beaver", "skunk", "porcupine", "bat", "possum",
        "opossum", "chipmunk", "coyote", "bobcat", "badger",
        "mountain lion", "boar", "hedgehog", "mouse", "rat", "mice",
        "bison", "buffalo", "rabbit",
      ],
      arctic: [
        "polar bear", "penguin", "seal", "walrus", "reindeer",
        "arctic fox", "snowy owl", "caribou", "arctic hare",
      ],
      ocean: [
        "whale", "dolphin", "shark", "octopus", "squid", "jellyfish",
        "crab", "lobster", "starfish", "seahorse", "stingray", "eel",
        "sea lion", "otter", "shrimp", "clam", "oyster", "salmon",
        "trout", "tuna", "bass", "catfish", "swordfish", "manatee",
        "orca", "seal", "pelican", "sea turtle",
      ],
      birds: [
        "eagle", "hawk", "robin", "sparrow", "crow", "blue jay",
        "cardinal", "pigeon", "dove", "owl", "seagull", "pelican",
        "flamingo", "swan", "peacock", "woodpecker", "hummingbird",
        "falcon", "vulture", "parrot", "ostrich", "crane", "heron",
        "bird", "finch", "canary", "wren", "bluebird", "blackbird",
        "mockingbird", "chickadee",
      ],
      "bugs and reptiles": [
        "ant", "bee", "butterfly", "spider", "fly", "mosquito", "beetle",
        "ladybug", "grasshopper", "cricket", "worm", "snail",
        "caterpillar", "wasp", "snake", "lizard", "frog", "toad",
        "alligator", "crocodile", "turtle", "tortoise", "iguana",
        "gecko", "dragonfly", "moth", "firefly", "earthworm",
      ],
    },
  },
  {
    id: "foods",
    title: "FOODS",
    clusters: {
      fruits: [
        "apple", "banana", "orange", "grape", "strawberry", "blueberry",
        "raspberry", "blackberry", "cherry", "peach", "pear", "plum",
        "watermelon", "melon", "cantaloupe", "lemon", "lime",
        "pineapple", "mango", "kiwi", "apricot", "grapefruit",
        "pomegranate", "coconut", "fig", "papaya", "tangerine",
        "cranberry", "persimmon", "nectarine", "honeydew",
      ],
      vegetables: [
        "carrot", "potato", "tomato", "onion", "lettuce", "spinach",
        "broccoli", "cauliflower", "celery", "cucumber", "pepper",
        "corn", "peas", "beans", "cabbage", "squash", "pumpkin",
        "zucchini", "asparagus", "mushroom", "garlic", "radish",
        "beet", "eggplant", "kale", "sweet potato", "green beans",
        "salad", "turnip", "parsnip", "okra", "collard greens",
      ],
      "meat and fish": [
        "chicken", "beef", "pork", "ham", "bacon", "sausage", "turkey",
        "steak", "lamb", "fish", "salmon", "shrimp", "tuna",
        "hamburger", "hot dog", "meatball", "ribs", "crab", "lobster",
        "roast beef", "meatloaf", "fried chicken", "pork chop",
        "fried fish", "cod", "tilapia", "brisket", "pot roast",
      ],
      dairy: [
        "milk", "cheese", "butter", "yogurt", "cream", "egg", "eggs",
        "ice cream", "cottage cheese", "sour cream", "whipped cream",
        "cheddar", "cream cheese", "buttermilk", "pudding",
      ],
      "bread and grains": [
        "bread", "rice", "pasta", "cereal", "oatmeal", "bagel", "toast",
        "crackers", "noodles", "muffin", "biscuit", "tortilla",
        "pancake", "waffle", "spaghetti", "pizza", "cornbread",
        "roll", "dinner roll", "grits", "gravy", "pretzel", "pita",
        "French toast", "macaroni", "mashed potatoes",
      ],
      sweets: [
        "cake", "cookie", "pie", "candy", "chocolate", "donut",
        "doughnut", "brownie", "pudding", "jelly", "honey", "cupcake",
        "pastry", "fudge", "caramel", "ice cream cone", "milkshake",
        "banana split", "apple pie", "peach cobbler", "cheesecake",
        "gingerbread", "lollipop", "marshmallow", "taffy", "sundae",
      ],
      "soups and home cooking": [
        "chicken soup", "tomato soup", "vegetable soup", "stew",
        "chili", "casserole", "pot roast", "meatloaf", "lasagna",
        "pot pie", "chicken and dumplings", "macaroni and cheese",
        "stuffing", "gravy", "mashed potatoes", "baked beans",
        "deviled eggs", "cornbread", "tuna salad", "potato salad",
      ],
      "breakfast foods": [
        "eggs", "bacon", "sausage", "pancakes", "waffles", "oatmeal",
        "toast", "cereal", "grits", "hash browns", "French toast",
        "breakfast biscuit", "ham", "muffin", "bagel", "orange juice",
        "coffee", "scrambled eggs", "omelet", "porridge",
      ],
      "drinks and beverages": [
        "water", "coffee", "tea", "lemonade", "milk", "orange juice",
        "apple juice", "soda", "cola", "root beer", "ginger ale",
        "hot chocolate", "iced tea", "grape juice", "buttermilk",
        "milkshake", "smoothie", "punch", "cocoa",
      ],
    },
  },
  {
    id: "gardening",
    title: "GARDENING AND NATURE WORDS",
    clusters: {
      "garden tools": [
        "rake", "shovel", "spade", "hoe", "trowel", "watering can",
        "garden hose", "pruning shears", "wheelbarrow", "lawn mower",
        "hedge trimmer", "garden gloves", "pitchfork", "hand fork",
        "sprinkler", "garden fork", "leaf blower", "edger", "pruners",
      ],
      "flowers": [
        "rose", "tulip", "daisy", "sunflower", "lily", "daffodil",
        "marigold", "violet", "pansy", "petunia", "orchid", "iris",
        "carnation", "peony", "hydrangea", "chrysanthemum", "zinnia",
        "geranium", "dahlia", "lilac", "bluebell", "poppy", "azalea",
        "magnolia", "gardenia", "lavender", "forget-me-not",
      ],
      "plants and trees": [
        "oak", "pine", "maple", "willow", "birch", "elm", "dogwood",
        "magnolia tree", "apple tree", "peach tree", "cherry tree",
        "palm tree", "cedar", "cypress", "fern", "ivy", "moss",
        "cactus", "succulent", "bush", "hedge", "vine", "houseplant",
        "fern", "bamboo", "evergreen", "weeping willow",
      ],
      "garden produce": [
        "tomato", "cucumber", "pepper", "zucchini", "pumpkin",
        "watermelon", "strawberry", "blueberry", "raspberry", "corn",
        "green beans", "peas", "carrot", "lettuce", "potato",
        "onion", "herbs", "basil", "mint", "parsley", "rosemary",
        "thyme", "dill", "cilantro", "chives", "sage",
      ],
      "yard wildlife": [
        "robin", "cardinal", "blue jay", "hummingbird", "squirrel",
        "rabbit", "chipmunk", "butterfly", "bee", "ladybug", "worm",
        "frog", "toad", "firefly", "caterpillar", "moth", "snail",
        "grasshopper", "woodpecker", "wren", "bluebird", "deer",
        "raccoon", "groundhog", "nest", "birdhouse", "bird feeder",
      ],
      "weather and seasons": [
        "sunshine", "rain", "snow", "wind", "cloud", "thunder",
        "lightning", "rainbow", "fog", "frost", "hail", "breeze",
        "spring", "summer", "autumn", "fall", "winter", "sunrise",
        "sunset", "heat wave", "drought", "drizzle", "ice",
      ],
    },
  },
  {
    id: "transportation",
    title: "TRANSPORTATION WORDS",
    clusters: {
      "cars and trucks": [
        "car", "truck", "pickup truck", "van", "station wagon",
        "convertible", "sedan", "taxi", "cab", "jeep", "SUV",
        "minivan", "delivery truck", "fire truck", "ambulance",
        "tow truck", "dump truck", "tractor", "school bus", "bus",
        "motor home", "camper", "recreational vehicle", "RV",
      ],
      "classic transportation": [
        "Model T", "old car", "horse and buggy", "stagecoach",
        "covered wagon", "streetcar", "trolley", "steam locomotive",
        "steam train", "biplane", "propeller plane", "sailboat",
        "rowboat", "canoe", "paddle steamer", "ferry", "cable car",
        "horse carriage", "buggy", "wagon",
      ],
      "trains and buses": [
        "train", "railroad", "locomotive", "freight train", "passenger train",
        "subway", "streetcar", "trolley", "tram", "bus", "school bus",
        "city bus", "Greyhound bus", "train station", "railroad crossing",
        "ticket booth", "conductor", "train whistle", "caboose", "sleeper car",
      ],
      "air and water": [
        "airplane", "helicopter", "jet", "glider", "hot air balloon",
        "airport", "runway", "sailboat", "motorboat", "rowboat",
        "canoe", "kayak", "yacht", "ferry", "cruise ship", "tugboat",
        "submarine", "lifeboat", "paddle boat", "ship", "ocean liner",
      ],
      "things on the road": [
        "traffic light", "stop sign", "crosswalk", "highway", "bridge",
        "tunnel", "gas station", "garage", "parking meter", "toll booth",
        "license plate", "steering wheel", "seat belt", "windshield",
        "rearview mirror", "spare tire", "car keys", "map", "road sign",
        "speedometer", "turn signal", "horn", "trunk", "glove compartment",
      ],
      "bicycles and walking": [
        "bicycle", "bike", "tricycle", "scooter", "motorcycle",
        "moped", "wheelchair", "walker", "cane", "roller skates",
        "skateboard", "walking stick", "helmet", "bike basket",
        "bike bell", "pedestrian", "sidewalk", "walking trail",
      ],
    },
  },
  {
    id: "music",
    title: "MUSIC AND ENTERTAINMENT WORDS",
    clusters: {
      "musical instruments": [
        "piano", "organ", "guitar", "violin", "cello", "banjo",
        "mandolin", "harmonica", "accordion", "drums", "trumpet",
        "trombone", "saxophone", "clarinet", "flute", "piccolo",
        "tuba", "harp", "ukulele", "tambourine", "xylophone",
        "fiddle", "bass guitar", "recorder",
      ],
      "old-fashioned music": [
        "phonograph", "record player", "vinyl record", "78 record",
        "45 record", "LP record", "jukebox", "radio", "transistor radio",
        "cassette tape", "eight-track tape", "reel-to-reel tape",
        "music box", "Victrola", "gramophone", "hi-fi stereo",
        "record collection", "needle", "turntable", "album",
      ],
      "singing and dancing": [
        "singing", "choir", "hymn", "carol", "lullaby", "folk song",
        "gospel song", "country song", "love song", "duet", "solo",
        "karaoke", "square dancing", "waltz", "foxtrot", "jitterbug",
        "tap dancing", "ballet", "line dancing", "polka", "jive",
        "ballroom dancing", "dance hall",
      ],
      "music styles": [
        "jazz", "blues", "country", "gospel", "classical", "bluegrass",
        "folk music", "big band", "swing", "rock and roll", "soul",
        "opera", "musical theater", "marching band", "barbershop quartet",
        "ragtime", "doo-wop", "disco", "rhythm and blues", "waltz",
      ],
      "movies and shows": [
        "movie", "film", "musical", "western", "comedy", "drama",
        "silent movie", "drive-in", "movie theater", "matinee",
        "television show", "sitcom", "soap opera", "game show",
        "variety show", "cartoon", "documentary", "news program",
        "talk show", "movie star", "comedian", "actor", "actress",
        "director", "movie ticket", "popcorn",
      ],
      "radio and television": [
        "radio", "television", "TV antenna", "rabbit ears", "dial",
        "channel", "remote control", "broadcast", "weather report",
        "news bulletin", "radio announcer", "disc jockey", "DJ",
        "soap opera", "radio drama", "serial", "commercial",
        "evening news", "morning show", "television guide", "TV guide",
        "test pattern", "black and white TV", "color television",
      ],
    },
  },
  {
    id: "pastimes",
    title: "HOBBIES AND PASTIMES",
    clusters: {
      "cards and board games": [
        "playing cards", "deck of cards", "poker", "bridge", "rummy",
        "canasta", "solitaire", "cribbage", "bingo", "checkers",
        "chess", "dominoes", "mahjong", "backgammon", "scrabble",
        "monopoly", "parcheesi", "jigsaw puzzle", "crossword puzzle",
        "word search", "trivia", "tic-tac-toe", "Yahtzee",
      ],
      "crafts and sewing": [
        "knitting", "crocheting", "quilting", "embroidery", "sewing",
        "needlepoint", "cross-stitch", "weaving", "pottery", "painting",
        "drawing", "watercolors", "scrapbooking", "woodworking",
        "basket weaving", "beadwork", "macrame", "quilting bee",
        "sewing circle", "patchwork", "lace making", "needlework",
      ],
      "outdoor hobbies": [
        "fishing", "birdwatching", "gardening", "hiking", "camping",
        "picnicking", "boating", "sailing", "golf", "bowling",
        "croquet", "horseshoes", "badminton", "tennis", "bicycling",
        "nature walks", "stargazing", "mushroom picking", "berry picking",
        "bird feeding", "fossil hunting",
      ],
      "collecting": [
        "stamps", "coins", "postcards", "baseball cards", "dolls",
        "figurines", "teacups", "antique furniture", "old photographs",
        "rocks", "seashells", "buttons", "thimbles", "bottles",
        "comic books", "model trains", "model cars", "snow globes",
        "ornaments", "vintage toys", "records", "antiques",
      ],
      "reading and writing": [
        "novel", "mystery book", "romance novel", "newspaper",
        "magazine", "comic strip", "poetry", "short story", "biography",
        "autobiography", "library book", "book club", "diary",
        "journal", "letter writing", "postcard", "crossword",
        "word puzzle", "dictionary", "encyclopedia", "bookmark",
        "paperback", "hardcover", "library card",
      ],
      "sports and exercise": [
        "baseball", "softball", "football", "basketball", "soccer",
        "tennis", "golf", "bowling", "swimming", "dancing", "walking",
        "jogging", "yoga", "tai chi", "badminton", "volleyball",
        "ping-pong", "table tennis", "croquet", "horseshoes", "shuffleboard",
        "bocce ball", "billiards", "pool", "darts", "gymnastics",
      ],
    },
  },
  {
    id: "technology",
    title: "COMMUNICATION AND TECHNOLOGY WORDS",
    clusters: {
      "old-fashioned technology": [
        "typewriter", "rotary phone", "telephone", "pay phone",
        "phone booth", "telephone cord", "answering machine",
        "typewriter ribbon", "carbon paper", "fax machine", "telex",
        "telegram", "telegraph", "dictation machine", "slide projector",
        "film projector", "overhead projector", "8mm film", "camera film",
        "Polaroid camera", "cassette recorder", "VCR", "VHS tape",
        "rewind button", "record button", "floppy disk",
      ],
      "modern everyday technology": [
        "cell phone", "mobile phone", "smartphone", "computer",
        "laptop", "tablet", "keyboard", "mouse", "printer", "scanner",
        "email", "text message", "video call", "internet", "website",
        "camera", "digital camera", "remote control", "GPS", "charger",
        "headphones", "speaker", "USB drive", "password", "screen",
      ],
      "telephone and mail": [
        "telephone", "rotary dial", "telephone directory", "phone book",
        "yellow pages", "operator", "long-distance call", "party line",
        "busy signal", "dial tone", "postcard", "envelope", "stamp",
        "letter", "post office", "mailbox", "airmail", "registered mail",
        "postmark", "mail carrier", "letter opener", "telegram",
        "greeting card", "Christmas card", "birthday card",
      ],
      "photography": [
        "camera", "film roll", "flash bulb", "camera lens", "tripod",
        "photo album", "family portrait", "snapshot", "Polaroid",
        "photograph", "negative", "darkroom", "slide", "viewfinder",
        "flashlight", "photo frame", "school picture", "wedding photo",
        "passport photo", "disposable camera", "picture day",
      ],
      "office and paperwork": [
        "typewriter", "paper clip", "stapler", "staples", "rubber band",
        "pencil", "pen", "eraser", "notebook", "ledger", "filing cabinet",
        "manila folder", "envelope", "letterhead", "carbon copy",
        "calculator", "adding machine", "desk calendar", "date stamp",
        "ink pad", "binder", "three-ring binder", "index card",
        "paper shredder", "clipboard", "ruler", "dictionary",
      ],
    },
  },
  {
    id: "clothing",
    title: "CLOTHING AND PERSONAL ITEMS",
    clusters: {
      "everyday clothing": [
        "shirt", "blouse", "pants", "trousers", "jeans", "skirt", "dress",
        "sweater", "cardigan", "vest", "jacket", "coat", "raincoat",
        "overalls", "coveralls", "apron", "pajamas", "nightgown",
        "bathrobe", "suit", "tie", "uniform", "sundress", "shorts",
      ],
      "shoes and accessories": [
        "shoes", "sneakers", "boots", "sandals", "slippers", "loafers",
        "high heels", "socks", "stockings", "belt", "suspenders",
        "scarf", "gloves", "mittens", "hat", "cap", "baseball cap",
        "sun hat", "handbag", "purse", "wallet", "backpack", "umbrella",
        "handkerchief", "watch", "brooch", "cufflinks",
      ],
      "jewelry": [
        "ring", "wedding ring", "necklace", "bracelet", "earrings",
        "brooch", "pendant", "locket", "watch", "pocket watch",
        "cufflinks", "pearls", "gold chain", "charm bracelet",
        "jewelry box", "tie clip", "lapel pin", "cameo", "wristwatch",
      ],
      "grooming": [
        "comb", "hairbrush", "mirror", "razor", "shaving cream",
        "aftershave", "perfume", "cologne", "lipstick", "powder",
        "face cream", "lotion", "nail polish", "nail file", "nail clippers",
        "hair spray", "hair rollers", "curlers", "hair dryer",
        "barber shop", "beauty salon", "shaving brush", "tweezers",
      ],
      "seasonal clothing": [
        "winter coat", "rain boots", "raincoat", "wool scarf",
        "mittens", "snow boots", "swimsuit", "bathing suit", "sun hat",
        "sunglasses", "flip-flops", "beach hat", "rain hat", "poncho",
        "thermal underwear", "wool socks", "ear muffs", "galoshes",
        "rubber boots", "ski jacket",
      ],
    },
  },
  {
    id: "family",
    title: "FAMILY AND PEOPLE",
    clusters: {
      "family members": [
        "mother", "father", "mom", "dad", "grandmother", "grandfather",
        "grandma", "grandpa", "grandparents", "daughter", "son",
        "sister", "brother", "aunt", "uncle", "cousin", "niece",
        "nephew", "wife", "husband", "spouse", "mother-in-law",
        "father-in-law", "stepmother", "stepfather", "stepsister",
        "stepbrother", "granddaughter", "grandson", "in-laws",
      ],
      "people in the community": [
        "neighbor", "friend", "teacher", "doctor", "nurse", "dentist",
        "librarian", "mail carrier", "postman", "policeman", "firefighter",
        "farmer", "baker", "butcher", "barber", "hairdresser",
        "store clerk", "cashier", "waiter", "waitress", "cook",
        "mechanic", "carpenter", "plumber", "electrician", "preacher",
        "minister", "pastor", "librarian", "shoemaker", "tailor",
      ],
      "life events": [
        "birthday", "wedding", "anniversary", "graduation", "retirement",
        "reunion", "baby shower", "christening", "baptism", "engagement",
        "family picnic", "housewarming", "new baby", "first day of school",
        "prom", "school dance", "family portrait", "holiday dinner",
        "retirement party", "wedding anniversary", "class reunion",
      ],
      "family activities": [
        "family dinner", "Sunday dinner", "picnic", "barbecue",
        "storytelling", "singing together", "board games", "card games",
        "baking cookies", "gardening", "fishing trip", "road trip",
        "family vacation", "camping", "Christmas tree decorating",
        "birthday cake", "looking at photos", "home movies",
        "visiting relatives", "Sunday drive",
      ],
      "professions and trades": [
        "teacher", "principal", "doctor", "nurse", "dentist", "farmer",
        "blacksmith", "carpenter", "tailor", "seamstress", "shoemaker",
        "welder", "plumber", "electrician", "bricklayer", "painter",
        "factory worker", "salesperson", "secretary", "bookkeeper",
        "accountant", "bank teller", "librarian", "police officer",
        "firefighter", "postal worker", "telephone operator",
      ],
    },
  },
  {
    id: "places",
    title: "FAMILIAR PLACES",
    clusters: {
      "town and neighborhood": [
        "grocery store", "general store", "post office", "bank",
        "library", "school", "church", "town hall", "barbershop",
        "beauty salon", "hardware store", "bakery", "butcher shop",
        "pharmacy", "drugstore", "gas station", "fire station",
        "police station", "courthouse", "town square", "city hall",
        "laundromat", "dry cleaner", "diner", "coffee shop",
      ],
      "shopping": [
        "department store", "shopping mall", "supermarket", "market",
        "farmers market", "flea market", "thrift store", "antique shop",
        "five-and-dime", "corner store", "discount store", "bookstore",
        "shoe store", "clothing store", "jewelry store", "florist",
        "hardware store", "candy shop", "toy store", "dollar store",
        "checkout counter", "shopping cart", "shopping basket",
      ],
      "countryside": [
        "farm", "barn", "silo", "pasture", "meadow", "orchard",
        "vegetable garden", "country road", "gravel road", "dirt road",
        "pond", "creek", "river", "covered bridge", "windmill",
        "cornfield", "hayfield", "farmhouse", "chicken coop", "stable",
        "fence", "haystack", "water tower", "grain elevator",
      ],
      "vacation places": [
        "beach", "lake", "mountains", "national park", "campground",
        "amusement park", "boardwalk", "seaside town", "fishing pier",
        "hotel", "motel", "resort", "cabin", "cottage", "cruise ship",
        "state park", "picnic area", "waterfall", "lighthouse",
        "Grand Canyon", "Niagara Falls", "Disneyland", "Yellowstone",
        "Las Vegas", "Atlantic City",
      ],
      "community gathering places": [
        "community center", "senior center", "church hall", "school gym",
        "town square", "park", "playground", "bandstand", "gazebo",
        "fairground", "county fair", "church basement", "clubhouse",
        "recreation center", "VFW hall", "American Legion hall",
        "dance hall", "meeting room", "picnic pavilion", "town library",
      ],
      "health and care": [
        "doctor's office", "hospital", "clinic", "pharmacy", "dentist",
        "optometrist", "eye doctor", "nursing home", "rehabilitation center",
        "physical therapy office", "urgent care", "waiting room",
        "examination room", "blood pressure machine", "examination table",
        "ambulance bay", "health center", "medical laboratory",
      ],
    },
  },
  {
    id: "transport_and_travel",
    title: "TRAVEL AND HOLIDAY WORDS",
    clusters: {
      "road trips": [
        "road map", "atlas", "road trip", "rest stop", "picnic basket",
        "suitcase", "luggage", "thermos", "cooler", "car radio",
        "gas station", "highway", "scenic route", "roadside diner",
        "postcard", "souvenir", "travel brochure", "hotel key",
        "motel sign", "travel guide", "camera", "binoculars",
      ],
      "air travel": [
        "airport", "airplane", "boarding pass", "ticket counter",
        "luggage tag", "suitcase", "flight attendant", "pilot",
        "runway", "terminal", "baggage claim", "passport", "customs",
        "departure gate", "window seat", "aisle seat", "overhead bin",
        "tarmac", "jet bridge",
      ],
      "camping and picnics": [
        "tent", "sleeping bag", "campfire", "marshmallow", "cooler",
        "picnic basket", "thermos", "lantern", "flashlight", "compass",
        "canoe", "fishing rod", "camp chair", "folding table",
        "paper plate", "checkered tablecloth", "hamburger", "hot dog",
        "trail mix", "campground", "RV", "camper",
      ],
      "beach and summer": [
        "beach towel", "bathing suit", "sunscreen", "beach umbrella",
        "sandcastle", "seashell", "beach ball", "sand bucket",
        "swimsuit", "flip-flops", "sunglasses", "ice cream",
        "lifeguard", "pier", "boardwalk", "fishing rod", "surfboard",
        "beach chair", "popsicle", "lemonade", "watermelon",
      ],
      "travel keepsakes": [
        "postcard", "souvenir spoon", "snow globe", "keychain",
        "shot glass", "magnet", "travel diary", "photo album",
        "stamped postcard", "shell collection", "tourist map",
        "ticket stub", "brochure", "pressed flower", "travel sticker",
        "commemorative coin", "souvenir plate", "lapel pin",
      ],
    },
  },
  {
    id: "holidays",
    title: "HOLIDAYS AND TRADITIONS",
    clusters: {
      Christmas: [
        "Christmas tree", "ornament", "wreath", "mistletoe", "holly",
        "stocking", "Santa Claus", "reindeer", "sleigh", "snowman",
        "gift", "wrapping paper", "ribbon", "Christmas card",
        "fruitcake", "gingerbread", "candy cane", "tinsel",
        "Christmas lights", "nativity scene", "carol", "fireplace",
        "Christmas dinner", "eggnog", "family gathering",
      ],
      Thanksgiving: [
        "turkey", "stuffing", "gravy", "cranberry sauce", "pumpkin pie",
        "sweet potato", "cornbread", "mashed potatoes", "green beans",
        "dinner table", "family gathering", "thanksgiving card",
        "cornucopia", "autumn leaves", "football game", "leftovers",
        "apple pie", "pecan pie", "casserole", "dinner roll",
      ],
      "Easter and spring": [
        "Easter egg", "basket", "chocolate bunny", "jelly beans",
        "Easter bonnet", "lilies", "daffodils", "tulips", "spring flowers",
        "egg hunt", "Sunday service", "Easter dinner", "pastel colors",
        "baby chick", "bunny", "hot cross bun", "new dress",
      ],
      "birthdays and celebrations": [
        "birthday cake", "candles", "balloons", "birthday card",
        "birthday present", "party hat", "streamers", "confetti",
        "ice cream", "gift wrap", "ribbon", "surprise party",
        "anniversary cake", "wedding cake", "champagne toast",
        "graduation cap", "diploma", "congratulations card",
      ],
      "patriotic holidays": [
        "flag", "fireworks", "parade", "picnic", "barbecue",
        "Fourth of July", "Memorial Day", "Veterans Day", "Labor Day",
        "Independence Day", "marching band", "star-spangled banner",
        "red white and blue", "bunting", "parade float", "sparklers",
        "American flag", "flagpole", "community celebration",
      ],
      "autumn traditions": [
        "pumpkin", "hayride", "corn maze", "apple picking",
        "pumpkin patch", "scarecrow", "harvest", "fall leaves",
        "cider", "cinnamon", "bonfire", "Halloween costume",
        "jack-o'-lantern", "candy corn", "costume party", "hay bale",
      ],
    },
  },
  {
    id: "sports",
    title: "SPORTS AND GAMES WORDS",
    clusters: {
      "baseball": [
        "baseball", "bat", "glove", "mitt", "pitcher", "catcher",
        "umpire", "home plate", "first base", "second base", "third base",
        "home run", "grand slam", "dugout", "bleachers", "scoreboard",
        "baseball cap", "baseball card", "stadium", "seventh-inning stretch",
        "double play", "outfield", "infield", "World Series",
      ],
      "football": [
        "football", "touchdown", "quarterback", "goalpost", "helmet",
        "referee", "coach", "stadium", "cheerleader", "halftime",
        "football field", "yard line", "end zone", "field goal",
        "kickoff", "fumble", "tackle", "playbook", "football jersey",
      ],
      "bowling and indoor games": [
        "bowling ball", "bowling pin", "lane", "gutter ball", "strike",
        "spare", "bowling shoes", "score sheet", "pool table", "cue stick",
        "billiard ball", "dartboard", "darts", "shuffleboard", "ping-pong",
        "table tennis", "foosball", "air hockey", "bocce ball",
      ],
      "golf and outdoor sports": [
        "golf club", "golf ball", "tee", "putter", "driver", "golf cart",
        "golf bag", "fairway", "green", "sand trap", "caddie",
        "scorecard", "tennis racket", "tennis ball", "net", "badminton",
        "horseshoe", "croquet mallet", "croquet ball", "bicycle",
        "fishing rod", "rowing boat", "swimming pool",
      ],
      "sports spectatorship": [
        "stadium", "bleachers", "ticket stub", "scoreboard", "radio broadcast",
        "sports announcer", "team pennant", "jersey", "foam finger",
        "program", "concession stand", "hot dog", "peanuts", "popcorn",
        "tailgate party", "team mascot", "championship", "trophy",
        "autograph", "sports page", "box score", "rally towel",
      ],
    },
  },
  {
    id: "tools",
    title: "HANDY TOOL WORDS",
    clusters: {
      "hand tools": [
        "hammer", "screwdriver", "wrench", "pliers", "saw", "handsaw",
        "hacksaw", "chisel", "file", "clamp", "vise", "level",
        "tape measure", "utility knife", "putty knife", "crowbar",
        "rubber mallet", "allen wrench", "socket wrench", "ratchet",
        "screw", "nail", "bolt", "nut", "washer",
      ],
      "garage and workshop": [
        "toolbox", "workbench", "vise", "drill", "electric drill",
        "cordless drill", "sandpaper", "paintbrush", "paint roller",
        "ladder", "extension cord", "work light", "oil can",
        "grease gun", "air compressor", "bench grinder", "vise grips",
        "safety goggles", "work gloves", "nail gun", "tool belt",
        "pegboard", "shop vacuum",
      ],
      "automobile maintenance": [
        "spare tire", "jack", "lug wrench", "jumper cables", "battery",
        "motor oil", "oil filter", "funnel", "dipstick", "spark plug",
        "radiator", "fan belt", "air filter", "grease gun", "car wax",
        "chamois", "windshield wiper", "washer fluid", "tire gauge",
        "hubcap", "license plate", "car jack", "owner's manual",
      ],
      "building and repairs": [
        "lumber", "plywood", "paint", "paintbrush", "nails", "screws",
        "hinge", "door knob", "lock", "padlock", "caulk", "putty",
        "spackle", "sandpaper", "plumb line", "level", "stud finder",
        "ladder", "sawhorse", "roof shingles", "brick", "mortar",
        "wood glue", "drill bit", "measuring tape",
      ],
    },
  },
  {
    id: "books",
    title: "BOOKS AND LEARNING WORDS",
    clusters: {
      "reading materials": [
        "newspaper", "magazine", "novel", "dictionary", "encyclopedia",
        "atlas", "cookbook", "hymnal", "Bible", "poetry book",
        "mystery novel", "romance novel", "western novel", "biography",
        "autobiography", "history book", "almanac", "comic book",
        "library book", "paperback", "hardcover", "booklet",
      ],
      "school supplies": [
        "pencil", "pen", "eraser", "ruler", "notebook", "chalk",
        "chalkboard", "blackboard", "globe", "protractor", "compass",
        "crayon", "colored pencil", "school desk", "book bag",
        "lunchbox", "report card", "dictionary", "index card",
        "book cover", "book strap", "ink bottle", "fountain pen",
      ],
      "library and writing": [
        "library card", "book return", "bookshelf", "bookmobile",
        "librarian", "book club", "reading glasses", "bookmark",
        "writing desk", "fountain pen", "inkwell", "stationery",
        "letterhead", "envelope", "postcard", "diary", "journal",
        "writing paper", "typewriter", "bookplate", "library stamp",
      ],
      "knowledge and learning": [
        "history", "geography", "arithmetic", "algebra", "spelling",
        "grammar", "science", "astronomy", "botany", "poetry",
        "literature", "music lessons", "piano lessons", "night school",
        "adult education", "lecture", "museum", "documentary",
        "educational film", "class reunion", "school assembly",
      ],
    },
  },
  {
    id: "seasons",
    title: "SEASONS AND WEATHER WORDS",
    clusters: {
      spring: [
        "rain shower", "rainbow", "tulip", "daffodil", "nest",
        "baby bird", "lamb", "butterfly", "garden", "seedling",
        "mud puddle", "spring cleaning", "birdsong", "fresh grass",
        "Easter", "April showers", "green leaves", "flower bud",
      ],
      summer: [
        "sunshine", "beach", "picnic", "lemonade", "watermelon",
        "ice cream", "fireflies", "barbecue", "swimming", "sun hat",
        "garden hose", "lawn mower", "thunderstorm", "sunglasses",
        "vacation", "camping", "fishing", "popsicle", "porch swing",
      ],
      autumn: [
        "fall leaves", "pumpkin", "apple picking", "hayride", "scarecrow",
        "cornfield", "harvest", "acorn", "chestnut", "squirrel",
        "rake", "bonfire", "apple cider", "Thanksgiving", "corn maze",
        "flannel shirt", "cool breeze", "chrysanthemum", "football",
      ],
      winter: [
        "snowflake", "snowman", "snow shovel", "mittens", "scarf",
        "wool coat", "fireplace", "hot cocoa", "icicle", "frost",
        "snow boots", "sled", "ice skating", "snow day", "frozen pond",
        "winter hat", "blanket", "radiator", "evergreen", "holidays",
      ],
      "weather conditions": [
        "sunshine", "cloud", "rain", "drizzle", "downpour", "thunder",
        "lightning", "hail", "snow", "sleet", "fog", "mist", "frost",
        "breeze", "gust", "heat wave", "cold snap", "drought",
        "humidity", "windstorm", "tornado", "hurricane", "blizzard",
      ],
    },
  },
  {
    id: "food_and_cooking",
    title: "COOKING AND RECIPE WORDS",
    clusters: {
      "cooking equipment": [
        "stove", "oven", "refrigerator", "freezer", "microwave",
        "slow cooker", "pressure cooker", "Dutch oven", "skillet",
        "frying pan", "saucepan", "stockpot", "baking dish", "roasting pan",
        "cookie sheet", "pie plate", "muffin tin", "loaf pan", "griddle",
        "waffle iron", "toaster", "coffee pot", "tea kettle", "food processor",
      ],
      "baking supplies": [
        "flour", "sugar", "brown sugar", "baking powder", "baking soda",
        "vanilla", "cinnamon", "nutmeg", "yeast", "shortening", "butter",
        "eggs", "milk", "chocolate chips", "cocoa powder", "molasses",
        "cornmeal", "powdered sugar", "pie crust", "pastry dough",
        "cookie cutter", "rolling pin", "sifter", "measuring spoon",
      ],
      "kitchen activities": [
        "chopping", "stirring", "kneading", "baking", "roasting",
        "frying", "boiling", "steaming", "grilling", "mashing",
        "whisking", "peeling", "slicing", "dicing", "measuring",
        "simmering", "seasoning", "marinating", "canning", "pickling",
        "freezing", "thawing", "setting the table",
      ],
      "preserving food": [
        "canning jars", "mason jar", "canning lid", "pressure canner",
        "water bath", "pickles", "jam", "jelly", "preserves", "relish",
        "applesauce", "tomato sauce", "dried herbs", "fruit cellar",
        "root cellar", "freezer bags", "wax seal", "canning funnel",
        "jar lifter", "homemade preserves", "dill pickle", "chutney",
      ],
      "family recipes": [
        "apple pie", "banana bread", "cornbread", "meatloaf",
        "chicken soup", "pot roast", "beef stew", "chili", "casserole",
        "potato salad", "coleslaw", "deviled eggs", "peach cobbler",
        "pound cake", "gingerbread", "oatmeal cookies", "pancakes",
        "biscuits and gravy", "fried chicken", "Sunday roast",
        "homemade bread", "family cookbook",
      ],
    },
  },
  {
    id: "faith",
    title: "COMMUNITY TRADITIONS",
    clusters: {
      "places of worship": [
        "church", "chapel", "cathedral", "synagogue", "mosque",
        "meetinghouse", "sanctuary", "church pew", "bell tower",
        "church hall", "fellowship hall", "cemetery", "churchyard",
        "parish house", "chapel bell", "stained glass", "church organ",
      ],
      "music and gatherings": [
        "hymn", "choir", "organ", "piano", "sing-along", "gospel music",
        "Christmas carol", "Easter service", "wedding ceremony",
        "funeral service", "potluck", "bake sale", "church picnic",
        "fellowship dinner", "community supper", "prayer meeting",
        "Sunday school", "choir practice", "holiday pageant",
      ],
      "community service": [
        "volunteer", "food pantry", "food drive", "clothing drive",
        "bake sale", "charity dinner", "fundraiser", "soup kitchen",
        "community garden", "visiting neighbor", "helping a friend",
        "donation box", "coat drive", "church bazaar", "craft fair",
        "volunteer kitchen", "community cleanup", "charity auction",
      ],
    },
  },
];


type Hit = { word: string; cluster: string };
const cache = new Map<string, Map<string, Hit>>();

function getMap(categoryId: string): Map<string, Hit> {
  let map = cache.get(categoryId);
  if (map) return map;
  map = new Map();
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (category) {
    for (const [cluster, words] of Object.entries(category.clusters)) {
      for (const word of words) {
        if (!map.has(word)) map.set(word, { word, cluster }); // first cluster wins
      }
    }
  }
  cache.set(categoryId, map);
  return map;
}

// Returns the canonical word + cluster if `spoken` is valid for this category, else null.
// Handles simple plurals (cats -> cat, berries -> berry, peaches -> peach).
export function findWord(categoryId: string, spoken: string): Hit | null {
  const map = getMap(categoryId);
  const w = spoken.toLowerCase().trim();
  const tries = [w];
  if (w.endsWith("ies")) tries.push(w.slice(0, -3) + "y");
  if (w.endsWith("es")) tries.push(w.slice(0, -2));
  if (w.endsWith("s")) tries.push(w.slice(0, -1));
  for (const t of tries) {
    const hit = map.get(t);
    if (hit) return hit;
  }
  return null;
}