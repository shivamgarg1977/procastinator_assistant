export interface Suggestion {
  title: string;
  description: string;
  category: 'physical' | 'learning' | 'admin' | 'creative' | 'quick';
  duration: number; // in minutes
  energy: 'low' | 'medium' | 'high';
  steps: string[];
  tips: string[];
}

export const OFFLINE_SUGGESTIONS: Suggestion[] = [
  // --- PHYSICAL ---
  {
    title: "The 30-Second Desk Decompression",
    description: "Release tension in your shoulders and neck caused by staring at your screen avoiding that task.",
    category: "physical",
    duration: 5,
    energy: "low",
    steps: [
      "Roll your shoulders backward 10 times, then forward 10 times.",
      "Gently tilt your head toward your right shoulder and hold for 15 seconds. Repeat on the left.",
      "Clasp your hands behind your back, push your chest forward, and stretch your arms up."
    ],
    tips: [
      "Keep breathing deeply. Don't hold your breath.",
      "If anything hurts, back off immediately."
    ]
  },
  {
    title: "Active Hydration Circuit",
    description: "Get up, walk to the kitchen or water fountain, and rehydrate while performing micro-stretches.",
    category: "physical",
    duration: 5,
    energy: "medium",
    steps: [
      "Walk slowly to get a fresh glass of water.",
      "While waiting for it to fill, do 10 calf raises.",
      "Drink the entire glass of water standing up, focusing on the cool sensation.",
      "Walk back to your desk via a slightly longer route."
    ],
    tips: [
      "Hydration boosts cognitive function and helps clear brain fog.",
      "Make this a screen-free walk."
    ]
  },
  {
    title: "Workspace Yoga Refresh",
    description: "A quick full-body desk stretch to get blood flowing and reset your nervous system.",
    category: "physical",
    duration: 15,
    energy: "medium",
    steps: [
      "Seated Spinal Twist: Sit tall, place left hand on right knee, twist right and hold for 5 breaths. Repeat other side.",
      "Desk Downward Dog: Place hands on desk edge, walk feet back until spine is parallel to floor, push hips back.",
      "Seated Figure 4: Cross right ankle over left knee, flex foot, fold forward slightly to stretch hips. Repeat other side.",
      "Stand up and shake out your arms and legs for 1 minute."
    ],
    tips: [
      "Use your breath to guide the stretches.",
      "Focus purely on physical sensations to let your mind rest."
    ]
  },
  {
    title: "Neat Freak Speed Run",
    description: "Tidy up your immediate workspace. A clean space leads to a clean mind.",
    category: "physical",
    duration: 15,
    energy: "high",
    steps: [
      "Throw away any trash, empty wrappers, or old papers.",
      "Put away stray pens, notebooks, and cables.",
      "Wipe down your desk surface and keyboard with a microfibre cloth.",
      "Organize your drawers or bookshelf for the remaining 5 minutes."
    ],
    tips: [
      "Work quickly. Treat it like a speedrun.",
      "A tidy workspace reduces visual distractions."
    ]
  },
  {
    title: "Outdoor Fresh Air Reboot",
    description: "Step completely outside, breathe fresh air, and let your eyes focus on distant horizons.",
    category: "physical",
    duration: 30,
    energy: "high",
    steps: [
      "Put on your shoes and walk out of your workspace building.",
      "Walk for 10 minutes in one direction. Focus on the sounds, birds, and weather.",
      "Stop and take 5 deep belly breaths under the open sky.",
      "Walk 10 minutes back, keeping your phone in your pocket."
    ],
    tips: [
      "Staring at distant objects (more than 20 feet away) relaxes your optical muscles.",
      "Do NOT check notifications during this walk."
    ]
  },

  // --- LEARNING ---
  {
    title: "Learn one keyboard shortcut",
    description: "Master a keyboard shortcut in your main editor or operating system and commit it to muscle memory.",
    category: "learning",
    duration: 5,
    energy: "low",
    steps: [
      "Search online for 'best shortcuts for [your IDE / OS]'.",
      "Pick one shortcut you did not know or rarely use.",
      "Practice pressing it 15 times in a row.",
      "Write it on a sticky note and place it under your screen."
    ],
    tips: [
      "Consistency is key. Pick just ONE shortcut and master it today.",
      "Even saving 2 seconds per hour adds up to hours saved over a year."
    ]
  },
  {
    title: "The Wikipedia Rabbit Hole",
    description: "Learn about a completely random, mind-expanding topic via Wikipedia's random selector.",
    category: "learning",
    duration: 15,
    energy: "medium",
    steps: [
      "Go to wikipedia.org/wiki/Special:Random.",
      "Read the article in full. If it's too technical, click the first link in the article to go to a broader topic.",
      "Identify 3 interesting facts from the article.",
      "Briefly write down those 3 facts or explain them out loud as if teaching someone."
    ],
    tips: [
      "Let curiosity guide you. Avoid reading anything related to the work you are avoiding.",
      "Active reading helps rebuild focus muscles."
    ]
  },
  {
    title: "Tech Concept Deep Dive",
    description: "Demystify a foundational tech concept you've heard about but never fully understood (e.g., DNS, WebSockets, JWT).",
    category: "learning",
    duration: 30,
    energy: "medium",
    steps: [
      "Choose a concept: SVG rendering, DNS propagation, OAuth2 flow, or CSS Grid layout.",
      "Search for an educational article or 10-minute video explaining it.",
      "Take notes on a blank sheet of paper, sketch out a simple flow diagram of how it works.",
      "Summarize it in 2 sentences in your own words."
    ],
    tips: [
      "Sketching is a powerful way to reinforce learning.",
      "Focus on the underlying mechanics, not just the terminology."
    ]
  },

  // --- ADMIN ---
  {
    title: "Desktop File Clearance",
    description: "Declutter your computer's Desktop folder. Move files to trash or archive them.",
    category: "admin",
    duration: 15,
    energy: "low",
    steps: [
      "Create a folder named 'Desktop Archive' with today's date.",
      "Identify files you no longer need and move them directly to the Trash/Bin.",
      "Move screenshot files to a dedicated folder or delete them.",
      "Drag all remaining active files into the archive folder so your desktop is 100% clean."
    ],
    tips: [
      "A cluttered screen is a source of subconscious cognitive load.",
      "Empty the trash when done."
    ]
  },
  {
    title: "The 3-Email Sweep",
    description: "Answer exactly three small emails that have been sitting in your inbox weighing on you.",
    category: "admin",
    duration: 15,
    energy: "medium",
    steps: [
      "Open your email client and filter by unread/starred.",
      "Find three emails that require simple, short responses (less than 3 sentences).",
      "Draft and send the replies one by one.",
      "Close the email tab immediately after sending the third one."
    ],
    tips: [
      "Do not browse new threads. Stick strictly to the three selected emails.",
      "Done is better than perfect. Keep responses concise."
    ]
  },
  {
    title: "Password & Security Hygiene",
    description: "Audit your password manager, update one weak password, or enable 2FA on an important account.",
    category: "admin",
    duration: 30,
    energy: "medium",
    steps: [
      "Open your password manager.",
      "Identify an account that uses a reused or weak password.",
      "Go to that website, generate a new strong password (20+ characters), and save it.",
      "Enable 2FA (Two-Factor Authentication) on that account if you haven't already."
    ],
    tips: [
      "Securing your digital identity reduces stress.",
      "Always use an authenticator app rather than SMS where possible."
    ]
  },

  // --- CREATIVE ---
  {
    title: "The 5-Minute Free Write",
    description: "Write continuously for 5 minutes without lifting your pen or pausing typing. Clear your mental buffer.",
    category: "creative",
    duration: 5,
    energy: "low",
    steps: [
      "Open a blank note or grab a piece of paper.",
      "Set a timer for 5 minutes.",
      "Start writing whatever comes to your mind, even if it is 'I don't know what to write.'",
      "Do not backspace, edit, or correct spelling. Keep writing."
    ],
    tips: [
      "This is called brain dumping and is highly therapeutic.",
      "You can delete the note immediately after finishing; the value is in the process."
    ]
  },
  {
    title: "Doodle Sprint",
    description: "Draw a simple object, a pattern, or a fantasy landscape. No art skills required.",
    category: "creative",
    duration: 15,
    energy: "medium",
    steps: [
      "Grab a blank sheet of paper and a pen or pencil.",
      "Choose a subject: a cup of coffee, your desk lamp, a plant, or an abstract pattern.",
      "Draw for 12 minutes straight. Focus on shapes, shadows, and textures.",
      "Sign and date your doodle when done."
    ],
    tips: [
      "Doodling activates the brain's default mode network and helps solve background problems.",
      "Enjoy the physical feeling of pen on paper."
    ]
  },
  {
    title: "Mindmap a Dream Project",
    description: "Map out a project you'd love to build or do if time and money were no object.",
    category: "creative",
    duration: 30,
    energy: "high",
    steps: [
      "Draw a circle in the center of a blank page with your project idea.",
      "Draw branches representing key features, user flows, or materials needed.",
      "Branch out further with aesthetic designs, ideas, and marketing ideas.",
      "Color-code the map with highlights or pens."
    ],
    tips: [
      "This exercises your vision and structural planning muscles without the anxiety of immediate execution.",
      "Let yourself dream wild ideas."
    ]
  }
];

export function getOfflineSuggestion(
  avoidedTask: string,
  duration: number,
  energy: 'low' | 'medium' | 'high',
  preferredCategory?: string
): Suggestion {
  // Filter by matching or closest duration and energy
  let filtered = OFFLINE_SUGGESTIONS.filter(item => {
    // If a specific category is requested, filter by it
    if (preferredCategory && preferredCategory !== 'all') {
      return item.category === preferredCategory;
    }
    return true;
  });

  // Try to find exact matches for duration (or nearest) and energy
  let matches = filtered.filter(item => item.duration <= duration && item.energy === energy);
  
  if (matches.length === 0) {
    // Fall back to just matching duration
    matches = filtered.filter(item => item.duration <= duration);
  }
  
  if (matches.length === 0) {
    // Fallback to any suggestion
    matches = filtered.length > 0 ? filtered : OFFLINE_SUGGESTIONS;
  }

  // Pick a random suggestion
  const randomIndex = Math.floor(Math.random() * matches.length);
  const baseSuggestion = matches[randomIndex];

  // Customize description based on what they are avoiding to make it feel tailored!
  let customizedDescription = baseSuggestion.description;
  if (customizedDescription.includes("avoiding that task")) {
    customizedDescription = customizedDescription.replace(
      "avoiding that task",
      `avoiding "${avoidedTask}"`
    );
  } else {
    // Append a contextually tailored sentence to make the suggestion highly effective!
    const endings = [
      `A perfect way to clear your head while avoiding "${avoidedTask}".`,
      `Give yourself a fresh perspective before you tackle "${avoidedTask}".`,
      `A guilt-free way to reset your brain instead of stressing over "${avoidedTask}".`,
      `Use this time to rebuild your focus muscles before getting back to "${avoidedTask}".`
    ];
    // Use the length of the avoidedTask string to pick a stable ending for this task
    const endingIndex = avoidedTask.length % endings.length;
    customizedDescription = `${customizedDescription} ${endings[endingIndex]}`;
  }

  return {
    ...baseSuggestion,
    description: customizedDescription,
  };
}
