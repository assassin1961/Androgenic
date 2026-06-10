// Idempotent seed: creates bot users with dating profiles + social posts
// so the app has a populated community on a fresh database.
const bcrypt = require('bcryptjs');
const db = require('./db');

const BOTS = [
  { name: 'Layla', age: 26, gender: 'Woman', city: 'London', distance: 3, job: 'UX Designer', verified: 1, online: 1, intention: 'Marriage', sect: 'Sunni', prayer: 'Usually prays', ethnicity: 'Arab', halal: 'Always halal', interests: ['Travelling', 'Coffee', 'Art', 'Photography', 'Faith'], values: ['Family-oriented', 'Ambitious', 'Romantic'], bio: 'Designer by day, ceramics enthusiast by night. Looking for someone to explore the city and build a future with.', height: `5'6"`, languages: ['English', 'Arabic'], prompts: [{ q: 'My ideal first date', a: 'A walk through a gallery then dessert somewhere cosy.' }] },
  { name: 'Amara', age: 24, gender: 'Woman', city: 'London', distance: 7, job: 'Junior Doctor', verified: 1, online: 0, intention: 'Long-term', sect: 'Sunni', prayer: 'Sometimes prays', ethnicity: 'African', halal: 'Mostly halal', interests: ['Fitness', 'Reading', 'Foodie', 'Family', 'Languages'], values: ['Career-driven', 'Honest', 'Funny'], bio: 'Probably reading three books at once. Will judge you by your taco order.', height: `5'4"`, languages: ['English', 'French'], prompts: [{ q: 'The way to win me over is', a: 'Bring snacks and make me laugh. That simple.' }] },
  { name: 'Sana', age: 28, gender: 'Woman', city: 'Manchester', distance: 12, job: 'Architect', verified: 0, online: 1, intention: 'Marriage', sect: 'Sunni', prayer: 'Always prays', ethnicity: 'South Asian', halal: 'Always halal', interests: ['Hiking', 'Photography', 'Tea lover', 'Nature', 'Faith'], values: ['Spiritual', 'Adventurous', 'Loyal'], bio: 'I design buildings and chase sunsets. Mountains over beaches, always.', height: `5'7"`, languages: ['English', 'Urdu'], prompts: [{ q: 'Together we could', a: 'Hike the Lake District then argue about the best tea.' }] },
  { name: 'Yasmin', age: 25, gender: 'Woman', city: 'London', distance: 2, job: 'Marketing Lead', verified: 1, online: 1, intention: 'Long-term', sect: 'Other', prayer: 'Sometimes prays', ethnicity: 'Turkish', halal: 'Mostly halal', interests: ['Foodie', 'Travelling', 'Music', 'Fashion', 'Coffee'], values: ['Ambitious', 'Funny', 'Open-minded'], bio: 'Spreadsheet by day, playlist curator by night.', height: `5'5"`, languages: ['English', 'Turkish'], prompts: [{ q: 'My simple pleasures', a: 'Friday night takeaway and a perfectly organised playlist.' }] },
  { name: 'Noor', age: 27, gender: 'Woman', city: 'Birmingham', distance: 18, job: 'Pharmacist', verified: 1, online: 0, intention: 'Marriage', sect: 'Shia', prayer: 'Always prays', ethnicity: 'Persian', halal: 'Always halal', interests: ['Cooking', 'Calligraphy', 'Family', 'Faith', 'Poetry'], values: ['Practising', 'Family-oriented', 'Romantic'], bio: 'I find peace in calligraphy and the smell of fresh bread.', height: `5'3"`, languages: ['English', 'Arabic', 'Farsi'], prompts: [{ q: 'A cause I care about', a: 'Teaching kids art at the local community centre.' }] },
  { name: 'Hana', age: 23, gender: 'Woman', city: 'London', distance: 5, job: 'Software Engineer', verified: 0, online: 1, intention: 'Still figuring it out', sect: 'Sunni', prayer: 'Usually prays', ethnicity: 'Mixed', halal: 'Mostly halal', interests: ['Gaming', 'Tech', 'Startups', 'Movies', 'Coffee'], values: ['Ambitious', 'Funny', 'Open-minded'], bio: 'I build apps and break them. 50% caffeine.', height: `5'6"`, languages: ['English'], prompts: [{ q: 'I geek out on', a: 'Clean code, mechanical keyboards, and indie games.' }] },
  { name: 'Mariam', age: 29, gender: 'Woman', city: 'Leeds', distance: 22, job: 'Teacher', verified: 1, online: 0, intention: 'Marriage', sect: 'Sunni', prayer: 'Always prays', ethnicity: 'Arab', halal: 'Always halal', interests: ['Reading', 'Volunteering', 'Family', 'Tea lover', 'Faith'], values: ['Family-oriented', 'Spiritual', 'Loyal'], bio: 'Year 4 teacher with infinite patience (mostly).', height: `5'5"`, languages: ['English', 'Arabic'], prompts: [{ q: 'A life goal of mine', a: 'To open a free weekend school for kids in my area.' }] },
  { name: 'Zara', age: 26, gender: 'Woman', city: 'London', distance: 4, job: 'Physiotherapist', verified: 1, online: 1, intention: 'Long-term', sect: 'Sunni', prayer: 'Sometimes prays', ethnicity: 'Mixed', halal: 'Mostly halal', interests: ['Fitness', 'Yoga', 'Foodie', 'Travelling', 'Dogs'], values: ['Adventurous', 'Honest', 'Ambitious'], bio: 'I fix people for a living and lift weights for fun. Dog mum to Biscuit.', height: `5'8"`, languages: ['English', 'Spanish'], prompts: [{ q: 'My ideal first date', a: 'Bouldering then the best burger in town.' }] },
  { name: 'Eman', age: 25, gender: 'Woman', city: 'London', distance: 9, job: 'Journalist', verified: 0, online: 0, intention: 'Long-term', sect: 'Prefer not to say', prayer: 'Sometimes prays', ethnicity: 'Arab', halal: 'Sometimes', interests: ['Reading', 'Poetry', 'Travelling', 'Music', 'Art'], values: ['Open-minded', 'Romantic', 'Honest'], bio: 'I chase stories and good coffee.', height: `5'5"`, languages: ['English', 'Italian'], prompts: [{ q: 'Together we could', a: 'Road-trip the coast with a questionable playlist.' }] },
  { name: 'Aaliyah', age: 27, gender: 'Woman', city: 'Bristol', distance: 26, job: 'Dentist', verified: 1, online: 1, intention: 'Marriage', sect: 'Sunni', prayer: 'Always prays', ethnicity: 'South Asian', halal: 'Always halal', interests: ['Cooking', 'Family', 'Fitness', 'Faith', 'Foodie'], values: ['Family-oriented', 'Practising', 'Funny'], bio: 'Weekend baker, weekday flosser-evangelist.', height: `5'4"`, languages: ['English', 'Gujarati'], prompts: [{ q: 'The way to win me over is', a: 'Eat my cooking and mean the compliment.' }] },
];

const POSTS = [
  { who: 'Sana', body: 'Caught the most insane sunrise on the Helvellyn ridge this morning. 4am alarm absolutely worth it ☀️🏔️', tag: 'Adventure', imageSeed: 'sunrise' },
  { who: 'Noor', body: 'Spent the afternoon on a new calligraphy piece. There is something so grounding about ink and patience. ✍️', tag: 'Art', imageSeed: 'calligraphy' },
  { who: 'Zara', body: 'PSA: Biscuit the cockapoo has decided 6am is the new wake-up time. Send help (and treats). 🐶', tag: 'Life', imageSeed: null },
  { who: 'Yasmin', body: 'Brunch reviewed: the shakshuka was elite, the queue was not. 7/10 would still queue again. 🍳', tag: 'Foodie', imageSeed: 'brunch' },
  { who: 'Mariam', body: 'My Year 4s wrote letters to their future selves today and I am NOT crying, you are. 🥹', tag: 'Life', imageSeed: null },
];

function seedDating() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM dating_profiles WHERE is_bot = 1').get().n;
  if (count >= BOTS.length) return;

  const hash = bcrypt.hashSync('demo-bot-password-' + Date.now(), 10);
  const ids = {};
  const insertUser = db.prepare('INSERT OR IGNORE INTO users (email, password_hash, display_name) VALUES (?, ?, ?)');
  const getUser = db.prepare('SELECT id FROM users WHERE email = ?');
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO dating_profiles
      (user_id, name, age, gender, city, distance, job, bio, height, intention,
       sect, prayer_level, ethnicity, halal_diet, interests, "values", languages,
       prompts, selfie_verified, is_bot, online)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  for (const b of BOTS) {
    const email = `bot.${b.name.toLowerCase()}@butterfly.demo`;
    insertUser.run(email, hash, b.name);
    const id = getUser.get(email).id;
    ids[b.name] = id;
    insertProfile.run(
      id, b.name, b.age, b.gender, b.city, b.distance, b.job, b.bio, b.height,
      b.intention, b.sect, b.prayer, b.ethnicity, b.halal,
      JSON.stringify(b.interests), JSON.stringify(b.values),
      JSON.stringify(b.languages), JSON.stringify(b.prompts), b.verified, b.online
    );
  }

  const postCount = db.prepare('SELECT COUNT(*) AS n FROM dating_posts').get().n;
  if (postCount === 0) {
    const insertPost = db.prepare('INSERT INTO dating_posts (user_id, body, tag, image_seed, created_at) VALUES (?, ?, ?, ?, ?)');
    let t = Date.now() - 3600000;
    for (const p of POSTS) {
      insertPost.run(ids[p.who], p.body, p.tag, p.imageSeed, t);
      t -= 4 * 3600000;
    }
  }
  console.log(`Seeded ${BOTS.length} dating profiles and ${POSTS.length} posts`);
}

module.exports = { seedDating };
