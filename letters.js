/**
 * letters.js — Local letter generation engine
 * No API keys. Pure local template intelligence.
 */

/**
 * SituationAnalyzer — reads the free-text "situation" the user typed and
 * figures out what KIND of situation it is (apology, conflict, distance,
 * loss, silence, gratitude, milestone, etc.) using keyword matching.
 * It then WRITES NEW sentences shaped around that category — it never
 * quotes or re-inserts the user's literal wording, so the result reads
 * like it was actually thought about, not pasted back.
 */
const SituationAnalyzer = {

  categories: {
    apology: {
      keywords: [/\bsorry\b/i, /\bapologi[sz]e/i, /my fault/i, /forgive me/i, /messed up/i, /\bmistake\b/i, /shouldn'?t have/i, /i was wrong/i],
      lines: [
        "I keep replaying that moment in my head, and I know I need to say this properly.",
        "It's been sitting heavy on me since it happened, more than I've let on.",
        "I haven't been able to let it go, no matter how much time has passed.",
        "I know saying it doesn't undo it, but staying quiet felt worse.",
        "I'm not asking you to forget it. I just needed you to know I haven't.",
        "Owning it is the least I can do, so here I am, doing it.",
      ],
    },
    conflict: {
      keywords: [/\bfight\b/i, /\bargu(e|ed|ment)/i, /\byelled\b/i, /\bscreamed\b/i, /said things/i, /blew up/i],
      lines: [
        "Since it happened, things have felt different between us, and I don't want to just let that sit.",
        "What happened has been on my mind more than I've let on.",
        "I keep going back to that moment, turning it over.",
        "Words said in the heat of things don't always match what's actually in someone's heart.",
        "I don't want one hard moment to define how we talk to each other going forward.",
        "I'd rather work through this than let it turn into distance between us.",
      ],
    },
    breakup: {
      keywords: [/broke up/i, /break up/i, /breakup/i, /ended things/i, /split up/i, /\bex[- ]?(girlfriend|boyfriend|partner)\b/i],
      lines: [
        "Since it ended, I've had a lot of time to sit with what that actually meant.",
        "It's been anything but simple to live through, whatever the short version sounds like.",
        "I've thought about it more than I probably should admit.",
        "Endings don't erase what was real while it lasted.",
        "I'm not writing this to reopen anything — just to be honest about where I've landed.",
        "Some things stay true even after they're over.",
      ],
    },
    distance: {
      keywords: [/long distance/i, /moved away/i, /miles apart/i, /different (city|country|state)/i, /far away/i, /living apart/i],
      lines: [
        "Ever since the distance came between us, it's been the thing I think about most.",
        "Somehow that gap has only made things clearer, not smaller.",
        "The space between us hasn't made the feeling any smaller.",
        "The miles don't change how often you cross my mind.",
        "Distance is good at making you notice exactly what you miss.",
        "Some connections don't need to be close by to stay real.",
      ],
    },
    loss: {
      keywords: [/passed away/i, /\bdied\b/i, /lost (him|her|them)/i, /\bfuneral\b/i, /no longer (with us|here)/i, /\bpassing\b/i],
      lines: [
        "I still find myself reaching for words big enough for what happened.",
        "Since then, ordinary days have felt different in ways I wasn't ready for.",
        "I keep thinking about it, and how much has changed since.",
        "Grief doesn't move in a straight line, I'm learning that the hard way.",
        "Some absences don't get smaller — you just get more used to carrying them.",
        "I wanted these words to exist somewhere, even if they can't fix anything.",
      ],
    },
    silence: {
      keywords: [/stopped talking/i, /ghosted/i, /silent treatment/i, /haven'?t (spoken|talked)/i, /no contact/i, /been ignoring/i, /radio silence/i],
      lines: [
        "The quiet has said more than either of us has, lately.",
        "Ever since it started, I've noticed the silence more than I expected to.",
        "I don't want that silence to be the last word between us.",
        "Silence has a way of getting louder the longer it lasts.",
        "I'd rather say something imperfect than let quiet decide things for us.",
        "Not talking hasn't made this easier — it's just made it wait longer.",
      ],
    },
    misunderstanding: {
      keywords: [/misunderstood/i, /misunderstanding/i, /wrong (idea|impression)/i, /got it wrong/i, /wasn'?t what (i|it) meant/i],
      lines: [
        "I don't want that gap between us to stay unaddressed.",
        "Somewhere along the way, something got crossed, and it's been bothering me since.",
        "I want the chance to say what I actually meant.",
        "Intentions and impact don't always line up, and I think that's what happened here.",
        "I'd rather clear this up than let an assumption sit between us.",
        "Some things get lost in translation, even between people who know each other well.",
      ],
    },
    gratitude_event: {
      keywords: [/helped me/i, /was there for me/i, /supported me/i, /stood by me/i, /believed in me/i, /showed up for me/i],
      lines: [
        "I don't think I said thank you the way I meant it, back then.",
        "I keep thinking about how much that actually meant to me.",
        "That mattered more than you probably know.",
        "Some kindnesses are easy to receive and hard to properly acknowledge. I want to fix that.",
        "It's the specific things people do — not the grand gestures — that tend to stay with us.",
        "I don't want that to go unnoticed any longer.",
      ],
    },
    milestone: {
      keywords: [/graduated/i, /got the job/i, /promotion/i, /accomplished/i, /achievement/i, /finished (my|the)/i, /passed (my|the) (exam|test)/i],
      lines: [
        "I've been wanting to say how much that means to me.",
        "I haven't stopped thinking about how proud I am since it happened.",
        "That's not a small thing, and I don't want it treated like one.",
        "Some milestones deserve to be said out loud, not just noticed quietly.",
        "The effort behind moments like this is usually invisible. I saw it anyway.",
        "This is me making sure it doesn't pass without being properly marked.",
      ],
    },
    new_beginning: {
      keywords: [/new chapter/i, /starting over/i, /fresh start/i, /moving on/i, /new beginning/i],
      lines: [
        "It feels like the right moment to say this.",
        "I've been thinking about where that leaves us.",
        "That's part of why I'm writing this now.",
        "New chapters are a good excuse to be honest about the old ones.",
        "Beginnings feel lighter when the things behind you are actually said out loud.",
        "I wanted this to be part of how the next chapter starts.",
      ],
    },
    health: {
      keywords: [/\bsick\b/i, /\billness\b/i, /diagnosed/i, /\bhospital\b/i, /\bsurgery\b/i, /health scare/i, /recovering/i],
      lines: [
        "It's changed how I think about a lot of things, honestly.",
        "Since then, I haven't wanted to take anything for granted.",
        "Moments like that have a way of clarifying what matters.",
        "Things like this have a way of making the important words feel urgent instead of optional.",
        "I didn't want to keep putting this off.",
        "Moments like that have a way of reordering your priorities. This letter is one result of that.",
      ],
    },
    betrayal: {
      keywords: [/\blied\b/i, /\bcheated\b/i, /\bbetrayed\b/i, /broke my trust/i, /went behind my back/i, /\bdeceiv(ed|ing)\b/i],
      lines: [
        "I've needed time before I could write this without just being angry.",
        "What happened changed something between us. I won't pretend otherwise.",
        "I've sat with that for a while now.",
        "Trust is slow to rebuild, and I'm not pretending this fixes that on its own.",
        "I needed to say this honestly rather than let it curdle into something worse.",
        "This isn't about assigning blame forever — it's about naming what happened clearly.",
      ],
    },
  },

  // Used when no category keywords match — generic, but still doesn't quote raw text
  genericLines: [
    "There's something specific behind all of this — something I wanted to give shape to in words.",
    "This isn't abstract for me. Something real happened, even if I'm not spelling out every detail here.",
    "I've been sitting with this for a while, and I finally wanted to put it into words.",
    "Whatever the specifics, this has been on my mind enough that I needed to write it down.",
    "This started with something particular, even if the letter doesn't spell it all out.",
    "I wanted this letter to come from something real, not just a general feeling.",
  ],

  // Find the first matching category based on keyword patterns
  detect(text) {
    if (!text) return null;
    for (const [key, cat] of Object.entries(this.categories)) {
      if (cat.keywords.some(rx => rx.test(text))) return key;
    }
    return null;
  },

  splitSentences(text) {
    return text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  },

  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // Pick `count` distinct lines from an array, without repeats
  pickDistinct(arr, count) {
    const pool = [...arr];
    const out = [];
    while (pool.length && out.length < count) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  },

  // Analyse the raw situation text: detect category + how much the user wrote.
  // The user's literal words are used ONLY to decide category and depth —
  // they are never re-inserted into the letter.
  analyze(rawText) {
    const text = (rawText || '').trim();
    if (!text || text.length < 5) return null;

    const sentences = this.splitSentences(text);
    return {
      category: this.detect(text),
      // if they wrote more than one sentence, or a longer single one, give it more room
      depth: (sentences.length > 1 || text.length > 60) ? 2 : 1,
    };
  },

  // Returns an array of 1-2 freshly-written paragraph lines matched to the
  // detected category (or generic lines if no category matched).
  buildSituationLines(analysis) {
    if (!analysis) return [];
    const pool = (analysis.category && this.categories[analysis.category])
      ? this.categories[analysis.category].lines
      : this.genericLines;
    return this.pickDistinct(pool, analysis.depth);
  },
};

const LetterEngine = {

  // Opening lines by emotion
  openings: {
    love: [
      "There are moments when words feel too small for what lives inside me, but I have to try.",
      "I've been sitting with this feeling for a while now, turning it over like a smooth stone, and I think it's time I put it into words.",
      "If I could hand you something real, it would be this — what's been quietly growing in my heart.",
      "Some feelings don't ask permission. They just arrive, and stay, and change the way the light looks.",
      "I'm not always good at saying the important things out loud. That's why I'm writing this.",
    ],
    grief: [
      "I don't really know how to start this, so I'll just say it plainly: I miss you, and it hurts in a way that doesn't have a proper name.",
      "There's a particular silence that comes with loss. It sits in the corners of ordinary days, and I've been feeling it.",
      "Writing this feels like pressing a hand against something that's bruised — tender, but necessary.",
      "Some losses don't announce themselves loudly. They settle in quietly, and suddenly everything is a little different.",
      "I've been trying to find the right words for a while now. I'm not sure these are right, but they're honest.",
    ],
    apology: [
      "I've been carrying this for longer than I should have, and I think it's time I said it properly.",
      "I'm not writing this because it's easy. I'm writing it because you deserve to hear it.",
      "If I could take back that moment, I would. But since I can't, I can at least be honest with you now.",
      "There are things I said — and things I didn't say — that I regret. This is my attempt to make it right.",
      "I want to be clear: this isn't an excuse. It's an apology, and there's a difference.",
    ],
    gratitude: [
      "I've been meaning to say this for a while, and today I decided I wasn't going to let another day pass without it.",
      "You probably don't know how much you've changed things for me. That feels like something worth saying.",
      "Some people pass through your life and leave it quietly better. You're one of those people.",
      "I realized recently that I haven't told you enough — so here it is, all of it, in writing.",
      "Thank you feels small for what I actually mean, but I'll say it anyway, and then try to explain.",
    ],
    longing: [
      "Distance has a way of making things clearer. I've been thinking about you more than I let on.",
      "There's a space in my days that used to be filled with your presence, and I've been noticing it.",
      "I keep returning to certain memories — the way you laugh, the things you say — and I wanted you to know that.",
      "I don't say this often enough, but I miss you in the quiet moments, when nothing's happening and everything reminds me of you.",
      "You're further away than I'd like. And this is me, reaching across that distance.",
    ],
    hope: [
      "I've been holding onto something lately — a feeling that things can still be good between us.",
      "Even when things have been hard, I've kept a little candle of hope burning. This letter is me saying so.",
      "I believe in us — in what we could be, if we try. I wanted you to know that.",
      "This isn't the end of the story. I really believe that, and I want to write us a better next chapter.",
      "Somewhere beneath all the difficult things is something worth protecting. I want to protect it.",
    ],
    anger: [
      "I've been sitting with this for a while, trying to find the calmer version of what I feel. Here is what came out.",
      "I care enough about you to be honest: what happened hurt me, and I need you to understand that.",
      "I'm not writing this to fight. I'm writing it because staying silent would be worse.",
      "There are things I need to say, and I've chosen to write them so they come out clearly instead of loud.",
      "What happened between us matters. And I think we owe it to each other to talk about it honestly.",
    ],
    anxiety: [
      "There are things I've wanted to say but haven't known how to say without them coming out wrong. Let me try.",
      "I've been overthinking this letter for too long. So I'm going to stop thinking and just write what's true.",
      "I get tangled up when I try to speak about this in person. Writing feels a little safer.",
      "I hope you can hear the intention behind these words, even if they don't come out perfectly.",
      "This is my attempt to bridge the gap between what I feel and what I'm able to say out loud.",
    ],
    pride: [
      "I don't say this nearly enough, but I need you to know: I am so proud of you.",
      "Watching you has reminded me what it looks like when someone really commits to something. It's extraordinary.",
      "I've been wanting to tell you this for a while — you've done something remarkable, and you should know it.",
      "There are moments when I look at you and feel something that doesn't have a word small enough for it. Pride comes closest.",
      "You probably brush this off, but please — let this one land: what you've done is remarkable.",
    ],
    forgiveness: [
      "I've been thinking about forgiveness — what it means, what it asks of us. And I think I'm ready.",
      "Holding onto this has only ever hurt me more. So I'm letting it go, and I want you to know that.",
      "I don't want to carry this weight between us anymore. I choose to release it.",
      "Forgiving isn't forgetting. But it is choosing to stop letting something hold power over the present. I choose that.",
      "What happened hurt. And also — I forgive you. Both of those things are true at once.",
    ],
  },

  // Middle paragraphs keyed by emotion
  middles: {
    love: [
      "The way I feel about you isn't loud or dramatic. It's more like a steady light — always there, warming the ordinary parts of my life.",
      "You've made me better without even trying. The way you listen, the way you show up — it changes things.",
      "I think about the small moments most: the quiet ones, the ones where nothing special is happening but everything feels right.",
      "You make it easy to be honest. That's rarer than you might think, and I don't take it lightly.",
      "Some people feel like home. You are that for me, no matter where we are.",
    ],
    grief: [
      "I keep returning to ordinary things — the way you'd say a certain phrase, the small habits you had — and finding them precious now.",
      "Grief is strange. It doesn't follow a schedule. It arrives when you're making tea or watching something ordinary, and suddenly everything is heavy.",
      "I'm learning that loss doesn't really end. It changes shape. Some days it's sharp; some days it's just a soft ache.",
      "What I know for certain is that you mattered. You matter still. That doesn't go away.",
      "I find myself talking to you in my head sometimes. I think that's okay. I think that's love continuing.",
    ],
    apology: [
      "Looking back, I can see how my actions — or my silence — affected you. I didn't see it then the way I see it now.",
      "I want you to know that I've thought about this genuinely, not just as a way to smooth things over.",
      "You deserved better from me in that moment. I know that. I'm saying it plainly because you deserve to hear it plainly.",
      "I'm not looking for forgiveness immediately — I know trust is earned back slowly. I just need you to know I understand what happened.",
      "Whatever comes next between us, I want it to be built on honesty. And honesty means this: I'm sorry.",
    ],
    gratitude: [
      "The specific things you did — the way you showed up without being asked, the way you listened without trying to fix — those things stayed with me.",
      "I think we don't say thank you enough for the things that matter most. The small acts of care that hold us together.",
      "You've been a steady presence in a season that wasn't always easy. That's not nothing. That's everything.",
      "Your kindness isn't flashy, which maybe means I haven't told you enough that I notice it. I do. It means the world.",
      "There's a kind of love that shows itself in small consistent acts. You have that. I hope you know how rare it is.",
    ],
    longing: [
      "I find myself wondering what you're doing, what you're thinking about. Whether you think about me too.",
      "There's a particular ache that comes with missing someone — it's not always sadness, sometimes it's just awareness of absence.",
      "The things I'd say if you were here pile up sometimes. Small things, big things. I save them up.",
      "I hope wherever you are, you're doing okay. Better than okay. I hope you're somewhere that feels right.",
      "Distance makes some things blurry and other things sharper. What I feel for you — that's gotten sharper.",
    ],
    hope: [
      "I still believe that what's between us is worth more than where we've been lately. I hold onto that.",
      "Difficult seasons end. People find their way back to each other. I believe that's possible for us.",
      "I think sometimes we need to get lost before we find the right direction again. I think we can find it.",
      "What I hope for isn't perfect — just honest. Just two people choosing each other, again.",
      "I'm not giving up on this. On us. I want you to know that, clearly and without conditions.",
    ],
    anger: [
      "I need you to understand that what happened affected me more than I may have shown in the moment.",
      "I don't want to exaggerate, but I also don't want to minimize it. It hurt. That's the honest truth.",
      "I've asked myself whether I'm being fair, and I think I am. What I feel is real and it deserves acknowledgment.",
      "I'm telling you this not to punish you, but because I think we can only move forward if we're honest about where we are.",
      "I want to understand your side too. But first, I needed you to understand mine.",
    ],
    anxiety: [
      "I sometimes worry that I'm too much, or not enough, or hard to be around when things get difficult. I wanted to name that.",
      "The fear underneath all of this is that you might not know how much I care — because I'm not always good at showing it.",
      "I second-guess myself a lot. But this — what I feel for you, what I want for us — I don't second-guess that.",
      "I'm learning to say the things that feel most vulnerable out loud. Or on paper. This is me trying.",
      "Please know that even when I go quiet, it's not distance. It's just me getting tangled up in myself.",
    ],
    pride: [
      "The effort you've put in — quietly, without asking for recognition — has not gone unnoticed. Not by me.",
      "You've shown what you're made of, and I want you to carry that knowledge with you.",
      "The things you've done recently reminded me what courage looks like. I want you to know I was watching, and I'm proud.",
      "I know you sometimes doubt yourself. I need you to hear this: you have done something genuinely remarkable.",
      "This is me bearing witness to who you're becoming. It's something worth celebrating.",
    ],
    forgiveness: [
      "Letting go doesn't mean pretending nothing happened. It means choosing a future that isn't built on that past.",
      "I want us to be able to breathe freely around each other again. I think that starts here.",
      "I've sat with the hurt long enough. Now I want to sit with the possibility of healing.",
      "I'm not asking anything of you in return for this. Forgiveness is something I'm giving to both of us.",
      "I believe people can change. I believe we can do better for each other. That's what this letter is.",
    ],
  },

  // Closings by style
  closings: {
    heartfelt: ["With all my heart,", "Always and genuinely,", "With love and honesty,", "Yours, truly,", "With everything I have,"],
    poetic: ["Yours in the spaces between words,", "Softly and with hope,", "Between the lines and the silences,", "In ink and memory,", "With the quiet weight of what remains,"],
    gentle: ["Warmly,", "With care,", "Gently and sincerely,", "With a soft heart,", "Quietly yours,"],
    raw: ["Honestly,", "Without filters,", "Imperfectly but sincerely,", "Just me,", "As I am,"],
    formal: ["With sincere regards,", "Respectfully and sincerely,", "With all due care,", "In earnest,", "With consideration and honesty,"],
  },

  // Extra sentences influenced by sliders
  vulnerabilityLines: [
    "I'm not sure I'd have the courage to say this in person, so I'm saying it here.",
    "This letter took more out of me than it looks. I hope you can feel that.",
    "I'm laying this down in front of you, not knowing how you'll receive it.",
    "There's a kind of courage in saying the true thing, even when it's risky.",
    "Writing this felt necessary, even if reading it feels strange.",
  ],

  nostalgiaLines: [
    "I keep coming back to an older time between us — simpler, maybe, but good.",
    "There are certain memories of us I carry with me, like photographs I never want to lose.",
    "I miss who we were to each other once. I wonder if that version of us still exists somewhere.",
    "Some chapters don't close completely. I think ours is one of them.",
    "There are moments from before that I return to more than you might think.",
  ],

  hopeLines: [
    "And despite everything — I still believe in the possibility of something good.",
    "There is still something here worth building on. I feel it.",
    "I'm not done hoping. I don't think I ever will be.",
    "This isn't resignation. It's the opposite — it's faith.",
  ],

  sadnessLines: [
    "There are days when the weight of this sits heavy, and I just let it.",
    "Some feelings don't need to be fixed. They just need to be acknowledged.",
    "It's okay to be sad about things. I'm learning that.",
    "The sadness is there because something mattered. I try to remember that.",
  ],

  angerLines: [
    "I'm not going to pretend I'm not angry, because I am, and I'd rather be honest about it.",
    "Some of what I feel right now is frustration, and I don't think hiding that helps either of us.",
    "I'm allowed to be upset about this. I'm not trying to make it bigger than it is — just real.",
    "There's an edge to what I feel, and I'd rather show it to you than swallow it.",
  ],

  intensityLines: {
    high: [
      "I need you to really hear this — not just read it, but feel it.",
      "What I'm saying here matters more to me than maybe anything I've said before.",
      "Please let these words reach you the way I mean them to.",
    ],
    low: [
      "I say all of this gently, without pressure.",
      "There's no urgency here — just honesty, offered quietly.",
    ],
  },

  forgivenessLines: [
    "I don't want to hold onto what hurt us. I want to hold onto what's good.",
    "Whatever has passed between us — I'd rather we move forward than carry it.",
    "I release you from whatever you might have been holding onto too.",
  ],

  // Get random item from array
  pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  // Format today's date in a soft, retro style
  formatDate() {
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  },

  /**
   * Main generation function
   * @param {object} opts - { emotion, recipient, situation, style, senderName, sliders }
   */
  generate(opts) {
    const { emotions, recipient, situation, style, senderName, sliders } = opts;

    // Support both array (new) and single string (fallback)
    const ems  = Array.isArray(emotions) ? emotions : [emotions || 'love'];
    const em1  = ems[0] || 'love';   // dominant — opening, bg
    const em2  = ems[1] || null;     // secondary — middle paragraph
    const em3  = ems[2] || null;     // tertiary — bridge line
    const st   = style || 'heartfelt';

    // Greeting
    const greeting = `Dear ${recipient || 'you'},`;

    // Opening from dominant emotion
    let opening = this.pick(this.openings[em1] || this.openings.love);

    // Situation — analysed, not copy-pasted: the user's text is only used to detect
    // a category and how much they wrote. New sentences matched to that category are
    // generated; the user's literal wording never appears in the output.
    const situationAnalysis = SituationAnalyzer.analyze(situation);
    const situationLines     = SituationAnalyzer.buildSituationLines(situationAnalysis);

    // Middle from dominant emotion
    let middle = this.pick(this.middles[em1] || this.middles.love);

    // Blend paragraphs: if secondary emotion exists, add a bridging middle from it
    let blendMiddle = '';
    if (em2 && this.middles[em2]) {
      const bridges = [
        `But there's more than one thing living in me right now.`,
        `And underneath that, something else stirs too.`,
        `At the same time — and this is harder to say —`,
        `Yet if I'm being fully honest with you,`,
        `Alongside all of that,`,
      ];
      blendMiddle = this.pick(bridges) + ' ' + this.pick(this.middles[em2]);
    }

    // Tertiary emotion adds a short closing sentiment
    let tertiaryLine = '';
    if (em3 && this.middles[em3]) {
      tertiaryLine = this.pick(this.middles[em3]);
    }

    // Extra lines based on slider values
    const extras = [];
    if (sliders.vulnerability > 60) extras.push(this.pick(this.vulnerabilityLines));
    if (sliders.nostalgia > 55)     extras.push(this.pick(this.nostalgiaLines));
    if (sliders.hope > 65)          extras.push(this.pick(this.hopeLines));
    if (sliders.sadness > 55)       extras.push(this.pick(this.sadnessLines));
    if (sliders.anger > 55)         extras.push(this.pick(this.angerLines));
    if (sliders.intensity > 70)     extras.push(this.pick(this.intensityLines.high));
    else if (sliders.intensity < 30) extras.push(this.pick(this.intensityLines.low));
    if (sliders.forgiveness > 60)   extras.push(this.pick(this.forgivenessLines));

    // Warmth line
    let warmthLine = '';
    if (sliders.warmth > 65) {
      const warmthPhrases = [
        "Know that you are cared for, deeply and without condition.",
        "You are not alone in this — not while I'm here.",
        "There is warmth here for you, always.",
        "I carry you with me, even when we're apart.",
      ];
      warmthLine = this.pick(warmthPhrases);
    }

    // Assemble body — the first situation line sits right after the opening,
    // and if there's a second one, it appears later, after the middle paragraph.
    const bodyParts = [];
    bodyParts.push(opening);
    if (situationLines[0])  bodyParts.push(situationLines[0]);
    bodyParts.push(middle);
    if (situationLines[1])  bodyParts.push(situationLines[1]);
    if (blendMiddle)        bodyParts.push(blendMiddle);
    if (tertiaryLine)       bodyParts.push(tertiaryLine);
    const picked = extras.slice(0, Math.min(2, extras.length));
    if (picked.length) bodyParts.push(...picked);
    if (warmthLine)    bodyParts.push(warmthLine);

    const body      = bodyParts.join('\n\n');
    const closing   = this.pick(this.closings[st] || this.closings.heartfelt);
    const signature = senderName && senderName.trim() ? senderName.trim() : 'A heart that cares for you';
    const date      = this.formatDate();

    return { greeting, body, closing, signature, date };
  },

  // Aura label based on sliders
  getAuraLabel(sliders) {
    const dominant = Object.entries(sliders).sort((a, b) => b[1] - a[1])[0];
    const map = {
      warmth: 'Warm & Tender',
      vulnerability: 'Open & Honest',
      sadness: 'Tender & Quiet',
      hope: 'Hopeful & Light',
      intensity: 'Deep & Passionate',
      anger: 'Fierce & Honest',
      forgiveness: 'Peaceful & Releasing',
      nostalgia: 'Wistful & Soft',
    };
    if (dominant[1] < 35) return 'Balanced & Calm';
    return map[dominant[0]] || 'Balanced & Open';
  },

  // Aura gradient colors for the orb
  getAuraColors(sliders) {
    const colorMap = {
      warmth:        [255, 180, 120],
      vulnerability: [200, 170, 230],
      sadness:       [140, 170, 210],
      hope:          [160, 210, 150],
      intensity:     [230, 120, 100],
      anger:         [210, 80, 60],
      forgiveness:   [160, 210, 185],
      nostalgia:     [210, 190, 160],
    };
    let r = 0, g = 0, b = 0, total = 0;
    for (const [key, val] of Object.entries(sliders)) {
      const w = val / 100;
      const col = colorMap[key];
      if (!col) continue;
      r += col[0] * w;
      g += col[1] * w;
      b += col[2] * w;
      total += w;
    }
    if (total > 0) {
      r = r / total;
      g = g / total;
      b = b / total;
    }
    r = Math.round(Math.min(255, Math.max(0, r)));
    g = Math.round(Math.min(255, Math.max(0, g)));
    b = Math.round(Math.min(255, Math.max(0, b)));
    // lighter outer color for radial gradient
    const r2 = Math.round(Math.min(255, r + 45));
    const g2 = Math.round(Math.min(255, g + 45));
    const b2 = Math.round(Math.min(255, b + 45));
    return {
      inner: `rgb(${r},${g},${b})`,
      outer: `rgb(${r2},${g2},${b2})`,
      glow:  `rgba(${r},${g},${b},0.4)`,
    };
  }
};