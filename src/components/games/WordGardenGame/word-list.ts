// Word Garden word lists.
// Each category is split into CLUSTERS (sub-groups). The cluster name is used to measure
// semantic clustering/switching (e.g. saying cow -> pig -> horse is one "farm" cluster).
// To add a category: copy one block, give it an id/title, fill in clusters.
// Multi-word answers (e.g. "guinea pig") are supported, just write them with a space.

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
      farm: ["cow", "pig", "horse", "sheep", "goat", "chicken", "duck", "turkey", "donkey", "rooster", "hen", "lamb", "calf", "goose", "mule", "pony", "ox", "bull", "geese"],
      pets: ["dog", "cat", "hamster", "rabbit", "guinea pig", "goldfish", "fish", "puppy", "kitten", "ferret", "gerbil", "bunny"],
      safari: ["lion", "tiger", "elephant", "giraffe", "zebra", "hippo", "hippopotamus", "rhino", "rhinoceros", "cheetah", "leopard", "monkey", "gorilla", "chimpanzee", "chimp", "baboon", "camel", "panda", "kangaroo", "koala", "antelope", "gazelle", "hyena", "jaguar", "lemur", "orangutan", "llama"],
      woodland: ["bear", "deer", "wolf", "fox", "raccoon", "squirrel", "moose", "elk", "beaver", "skunk", "porcupine", "bat", "possum", "opossum", "chipmunk", "coyote", "bobcat", "badger", "mountain lion", "boar", "hedgehog", "mouse", "rat", "mice", "bison", "buffalo"],
      arctic: ["polar bear", "penguin", "seal", "walrus", "reindeer", "arctic fox", "snowy owl"],
      ocean: ["whale", "dolphin", "shark", "octopus", "squid", "jellyfish", "crab", "lobster", "starfish", "seahorse", "stingray", "eel", "sea lion", "otter", "shrimp", "clam", "oyster", "salmon", "trout", "tuna", "bass", "catfish", "swordfish", "manatee", "orca"],
      birds: ["eagle", "hawk", "robin", "sparrow", "crow", "blue jay", "cardinal", "pigeon", "dove", "owl", "seagull", "pelican", "flamingo", "swan", "peacock", "woodpecker", "hummingbird", "falcon", "vulture", "parrot", "ostrich", "crane", "heron", "bird", "finch", "canary"],
      "bugs and reptiles": ["ant", "bee", "butterfly", "spider", "fly", "mosquito", "beetle", "ladybug", "grasshopper", "cricket", "worm", "snail", "caterpillar", "wasp", "snake", "lizard", "frog", "toad", "alligator", "crocodile", "turtle", "tortoise", "iguana", "gecko", "dragonfly", "moth"],
    },
  },
  {
    id: "foods",
    title: "FOODS",
    clusters: {
      fruits: ["apple", "banana", "orange", "grape", "strawberry", "blueberry", "raspberry", "blackberry", "cherry", "peach", "pear", "plum", "watermelon", "melon", "cantaloupe", "lemon", "lime", "pineapple", "mango", "kiwi", "apricot", "grapefruit", "pomegranate", "coconut", "fig", "papaya", "tangerine", "cranberry"],
      vegetables: ["carrot", "potato", "tomato", "onion", "lettuce", "spinach", "broccoli", "cauliflower", "celery", "cucumber", "pepper", "corn", "peas", "beans", "cabbage", "squash", "pumpkin", "zucchini", "asparagus", "mushroom", "garlic", "radish", "beet", "eggplant", "kale", "sweet potato", "green beans", "salad"],
      "meat and fish": ["chicken", "beef", "pork", "ham", "bacon", "sausage", "turkey", "steak", "lamb", "fish", "salmon", "shrimp", "tuna", "hamburger", "hot dog", "meatball", "ribs", "crab", "lobster"],
      dairy: ["milk", "cheese", "butter", "yogurt", "cream", "egg", "eggs", "ice cream", "cottage cheese"],
      "bread and grains": ["bread", "rice", "pasta", "cereal", "oatmeal", "bagel", "toast", "crackers", "noodles", "muffin", "biscuit", "tortilla", "pancake", "waffle", "spaghetti", "pizza"],
      sweets: ["cake", "cookie", "pie", "candy", "chocolate", "donut", "doughnut", "brownie", "pudding", "jelly", "honey", "cupcake", "pastry"],
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