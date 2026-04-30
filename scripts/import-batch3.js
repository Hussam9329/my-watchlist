// Batch 3 import
const API_BASE = 'https://my-watchlist-rho.vercel.app/api/watchlist';

const moviesData = `Fifty Shades of Grey |2015|Romance|80.25
Fight Club|1999|Action|83.18
Filth|2013|Crime|61.76
Final Destination|2000|Horror|83.95
Final Destination 2|2003|Horror|81.95
Final Destination 3|2006|Horror|80.60
Final Destination 4|2009|Horror|80.57
Final Destination 5|2011|Horror|81.94
Finch|2021|Sci-Fi|75.92
Finding Dory|2016|Animation|83.53
Finding Forrester|2001|Drama|70.48
Finding Nemo|2003|Animation|83.54
Finding Neverland|2008|Drama|62.01
First Blood|1982|Action|71.63
First Daughter|2004|Romance|70.87
First Man|2018|Drama|79.39
First Match|2018|Action|60.71
Flatliners|2017|Thriller|68.83
Flee|2021|Animation|83.01
Flight|2012|Drama|80.01
Flipped|2010|Romance|79.62
Florence Foster Jenkins|2016|Comedy|79.75
Flushed Away|2006|Animation |82.57
Fly Papper|2011|Romance|69.39
Flyboys|2006|War|51.51
Focus|2015|Drama|80.24
Fools Rush In|1997|Romance|79.77
For The Love of Money|2012|Drama|70.49
Ford v Ferrari|2019|Drama|84.76
Forrest Gump|1994|Drama|81.20
Forsaken|2015|Western|69.44
Four Brothers|2005|Action|63.27
Fractured|2019|Thriller|82.43
Freaky Friday|2003|Comedy|61.47
Freaky Friday |1976|Adventure|52.93
Freddy vs. Jason|2003|Horror|21.71
Free Birds |2013|Animation|71.13
Free Guy|2021|Adventure|84.99
Free State of Jones|2015|Drama|79.40
Freerunner|2011|Action|7.34
Frequency|2000|Thriller|83.15
Friday After Next|2002|Comedy|71.24
Friday The 13th|2009|Horror|68.80
Friday The 13th 1|1980|Horror|51.08
Friday The 13th 2|1981|Horror|10.66
Friday The 13th 3|1982|Horror|9.49
Friday The 13th 4|1983|Horror|9.29
Friday The 13th 5|1984|Horror|7.18
Friday The 13th 6|1985|Horror|6.79
Friday The 13th 7|1986|Horror|9.19
Friday The 13th 8|1987|Horror|8.91
Friday The 13th The Fiinal|1993|Horror|1.80
Friend Request |2016|Horror|70.76
Friends With Benefits|2011|Romance|76.20
Friends With Kids|2013|Romance|41.01
Fright Night|2011|Horror|64.20
From Dusk Till Dawn|1996|Horror|74.10
From Paris With Love |2010|Action|72.60
From Prada To Nada|2011|Drama|69.26
Frozen|2013|Animation|82.75
Frozen 2|2019|Animation|82.33
Fun With Dick and Jane|2005|Comedy|80.58
Funny Games|2007|Thriller|76.34
Funny People|2009|Comedy|80.11
Furious 7|2015|Action|82.55
Furry Vengeance|2010|Adventure|77.88
Fury|2014|War|81.36
G.I. Joe: Retaliation|2013|Action|74.72
G.I. Joe: The Rise of Cobra|2009|Action|81.17
Gallowwalkers|2012|Horror|69.33
Game Night|2018|Comedy|81.21
Gamer|2009|War|74.55
Gangs of New York|2002|Action|53.87
Gardens Of The Night |2008|Horror|75.98
Garfield|2004|Animation|68.27
Geostorm|2017|Disaster|69.21
Gerald's Game|2017|Thriller|78.33
Get Carter|2000|Action|68.10
Get Hard|2015|Comedy|76.80
Get Out|2017|Thriller|85.87
Get Smart|2008|Comedy|80.85
Get The Gringo|2012|Action|72.65
Ghost|1990|Romance|83.58
Ghost House|2017|Horror|40.05
Ghost Rider |2007|Action|53.99
Ghost Rider 2|2012|Action|54.12
Ghost Ship|2002|Horror|79.98
Ghostbusters|2016|Comedy|65.88
Gifted|2017|Drama|70.50
Ginger Snaps|2001|Horror|72.35
Ginger Snaps 2|2004|Horror|48.29
Ginger Snaps 3|2004|Horror|69.34
Girl, Interrupted|2004|Drama|79.41
Gladiator|2000|History|79.48
Glass|2019|Thriller|84.43
Gnomeo And Juliet|2010|Animation|79.19
Gods of Egypt|2016|Fantasy|69.29
Godzilla|2014|Disaster|65.12
Godzilla|1998|Disaster|70.41
Godzilla: King of Monsters|2019|Disaster|80.28
Gold|2016|Drama|70.51
Gone|2012|Thriller|79.68
Gone Baby Gone|2007|Drama|37.62
Gone Girl|2014|Mystrey|81.23
Gone in 60 Seconds|2000|Action|68.15
Gone With The Wind|1939|Drama|81.42
Good Luck Chuck|2007|Comedy|65.92
Goosebumps|2015|Fantasy|78.61
Goosebumps : Haunted Halloween|2018|Comedy|79.52
Gothika|2003|Horror|76.00
Gran Torino|2009|Drama|80.09
Grand Piano|2013|Thriller|80.23
Gravity|2013|Adventure|81.16
Green Book|2019|Drama|84.88
Green Lantern|2011|Comics|50.71
Green Lantern 1|2009|Animation|50.45
Green Lantern 2|2011|Animation|46.57
Green Zone|2009|War|72.03
Greyhound|2020|War|76.51
Groundhog Day|1993|Adventure|82.77
Grown Ups|2010|Comedy|83.09
Grown Ups 2|2013|Comedy|82.10
Guardiance of The Galaxy|2014|Comics|83.28
Guardians|2017|Sci-Fi|37.79
Guardians of the Galaxy Vol.2|2017|Comics|80.98
Guardians of the Galaxy Vol.3|2023|Comics|86.05
Guillermo Del Toro's Pinocchio|2022|Animation|84.52
Guilty|2021|Crime|80.18
Gulliver's Travels|2010|Comedy|76.83
Hachi: A Dog Story|2009|Drama|84.00
Hacksaw Ridge|2016|War|83.17
Hall Pass|2011|Comedy|78.20
Halloween|2002|Horror|66.34
Halloween 2|2007|Horror|79.50
Halloween 3|2009|Horror|71.47
Hancock|2008|Action|80.47
Hangman|2018|Action|71.07
Hanna|2011|Action|59.58
Hannah Montana: The Movie|2009|Comedy|69.58
Hannibal |2001|Crime|54.77
Hannibal Raising|2007|Crime|46.91
Hansel & Gretel |2013|Fantasy|78.63
Happy Death Day|2017|Horror|83.45
Happy Death Day 2U|2019|Horror|78.76
Happy Feet|2006|Animation|63.52
Hard Boiled Sweets|2012|Crime|3.98
Hard Candy|2006|Horror|51.98
Hard Target|1993|Action|72.06
Harrison's Flowers|2001|Drama|79.76
Harry Potter 1|2001|Fantasy|84.94
Harry Potter 2|2002|Fantasy|84.95
Harry Potter 3|2004|Fantasy|85.52
Harry Potter 4|2005|Fantasy|85.53
Harry Potter 5|2007|Fantasy|84.96
Harry Potter 6|2009|Fantasy|85.54
Harry Potter 7|2010|Fantasy|84.97
Harry Potter 8|2011|Fantasy|86.31
Hatching|2022|Horror |72.65
Haywire|2011|Action|29.15
Head of State|2003|Comedy|69.59
Heartbreakers|2001|Comedy|60.00
Heat|1995|Action|80.19
Heist|2015|Action|80.34
Heist|2001|Action|82.03
Henry's Crime|2010|Crime|51.88
Her|2013|Romance|83.47
Hercules|2014|History|69.73
Here Comes The Boom|2012|Comedy|80.74
Hereafter|2010|Romance|71.97
Hereditary |2018|Horror|82.62
Heretic|2024|Thriller|84.00
Hidden Figures|2016|Drama|81.11
Hide and Seek|2005|Thriller|79.77
High Life|2019|Sci-Fi|31.77
High Noon|1952|Action|70.07
High School Musical|2006|Comedy|79.75
High School Musical 2|2007|Comedy|79.75
High School Musical 3: Senior Year|2008|Comedy|79.75
High Strug|1991|Comedy|37.14
His House|2020|Thriller|85.09
Hitch|2005|Comedy|80.17
Hitman|2007|Action|79.12
Hitman : Agent 47|2015|Action|71.64
Holes|2003|Adventure|22.59
Home|2015|Animation|82.13
Home Alone|1990|Comedy|84.72
Home Alone 2|1992|Comedy|80.83
Home Alone 3|1997|Comedy|79.26
Home Alone 4|2002|Comedy|61.51
Home Alone 5|2014|Comedy|64.91
Home Sweet Hell|2015|Comedy|46.74
Honey|2003|Drama|52.62
Honey 2|2011|Drama|8.29
Honey, I Blew Up the Kid|1992|Comedy|75.50
Honey, I Shrunk the Kids|1989|Comedy|71.25
Hop|2011|Comedy|78.22
Horrible Bosses |2011|Comedy|79.75
Horrible Bosses 2|2014|Comedy|75.53
Horton Hears a Who!|2008|Animation|80.73
Hostage|2005|Action|82.31
Hostel|2006|Horror|67.60
Hostel II|2007|Horror|8.36
Hostel III|2011|Horror|37.31
Hot Fuzz|2007|Action|64.57
Hot Tub Time Machine|2011|Comedy|70.25
Hot Tub Time Machine 2|2015|Comedy|13.67
Hotel Artemis|2018|Action|79.13
Hotel Transylvania|2012|Animation|79.75
Hotel Transylvania 2|2015|Animation|79.20
Hotel Transylvania 3 |2018|Animation|80.47
Hotel Transylvania 4: Transformania|2021|Animation|80.08
Hours |2013|Disaster|80.42
House At The End Of The Street|2012|Horror|81.44
House of the Dead|2003|Horror|7.99
House of the Rising Sun|2011|Action|9.33
House of Wax|2005|Horror|78.78
How It Ends|2018|Sci-Fi|81.93
How To Be Single |2016|Comedy|37.92
How to Lose a Guy in 10 Days|2003|Romance|67.77
How to Lose Friends & Alienate People|2008|Romance|51.29
Howl's Moving Castle|2004|Anime|81.84
Hugo|2011|Fantasy|70.66
Hulk|2003|Comics|71.83
Hunger|2009|Horror|78.80
Hush|2016|Thriller|82.88
I Am Legend|2007|Thriller|84.50
I Am Mother|2019|Sci-Fi|72.50
I Am Number Four|2011|Sci-Fi|14.75
I Am Wrath|2016|Action|66.51
I Do Until I Don't|2017|Comedy|50.55
I Don't Know How She Does It|2011|Drama|65.16
I Hate Valentine's Day|2009|Comedy|68.52
I Know What You Did Last Summer|1997|Horror|79.77
I Lost My Body|2019|Animation|84.17
I Love You Beth Cooper|2008|Comedy|73.20
I Love You Man|2009|Comedy|80.19
I Love You Phillip Morris|2009|Comedy|67.26
I Now Pronounce You Chuck and Larry|2007|Comedy|84.12
I Origins |2014|Fantasy|69.72
I Saw The Devil |2010|Crime|79.98
I See You|2019|Thriller|80.10
I Spy|2002|Comedy|71.80
I Still Know What You Did Last Summer|1998|Horror|80.48
I, Robot|2004|Action|83.61
Ice Age|2002|Animation|84.91
Ice Age 2|2006|Animation|79.75
Ice Age 3|2009|Animation|78.01
Ice Age 4|2012|Animation|81.60
Ice Age 5|2016|Animation|71.14
Ice Age 6|2022|Animation|56.77
Identity|2003|Thriller|85.15
IF|2024|Adventure |83.71
If Only|2004|Romance|85.91
I'll Always Know What You Did Last Summer|2006|Horror|69.35
I'm Thinking of Ending Things|2020|Thriller|82.91
Imagine Me & You|2015|Romance|71.98
Imagine That|2009|Comedy|78.24
Immaculate|2024|Horror|73.93
Immortals|2011|History|74.00
In The Heart of The Sea|2015|Adventure|50.34
In the Name of The King|2007|History|69.30
In The Tall Grass|2019|Horror|80.68
In The Valley of Elah|2007|Action|67.05
In Time|2011|Thriller|51.40
Incarnate |2016|Horror|72.36
Inception |2011|Sci-Fi|88.27
Incredibles 2|2019|Animation|80.27
Independence Day |1996|Adventure|72.85
Independence Day : Resurgence|2016|Adventure|60.92
Inferno|2016|Thriller|83.32
Inglourious Basterds|2009|War|68.84
Injustice|2021|Comics|76.62
Inland Empire |2006|Drama|50.82
Inside Man|2006|Action|82.39
Inside Out|2015|Animation|85.83
Inside Out 2|2024|Animation|84.00
Insidious |2010|Horror|82.50
Insidious 2|2013|Horror|81.72
Insidious 3|2015|Horror|80.61
Insidious: The Last Key|2018|Horror|80.09
Insidious: The Red Door|2023|Horror |83.03
Insomnia|2002|Thriller|80.10
Insurgent|2015|Action|77.67
Interrogation |2016|Action|59.62
Interstellar|2014|Thriller|84.51
Into The Blue|2005|Romance|26.52
Into The Forest |2015|Thriller|79.78
Into The Storm |2014|Drama|79.42
Into The Wild |2007|Drama|70.52
Into The Woods|2014|Fantasy|77.46
Intruder|2016|Thriller|78.99
Iron Man |2008|Comics|83.91
Iron Man 2|2010|Comics|81.79
Iron Man 3|2013|Comics|84.14
Iron Sky|2012|Sci-Fi|11.09
Irresistible |2006|Thriller|79.69
Isi & Ossi|2020|Romance|78.93
It|2017|Horror|81.29
It Comes At Night|2017|Horror|56.45
It: Chapter 2|2019|Horror|70.77
It's a Boy Girl Thing|2006|Comedy|71.26
It's a Wonderful Life|1946|Drama|81.56
It's Complicated|2010|Drama|54.90
It's Kind of A Funny Story|2010|Comedy|61.55
J Edgar|2011|Crime|63.90
Jack and Jill|2011|Comedy|71.27
Jack Reacher|2012|Action|69.85
Jack Reacher: Never Go Back|2016|Action|60.75
Jack The Giant Slayer|2013|Fantasy|71.93
Jackie|2016|Drama|71.41
Jane Eyre|2011|Drama|39.09
Jason Bourne|2016|Action|69.47
Jason X|2002|Horror|7.25
Jaws|1975|Horror|58.64
Jaws 2|1978|Horror|44.85
Jaws 3|1983|Horror|44.88
Jaws 4|1987|Horror|44.93
JCVD|2008|Biography|8.22
Jeepers Creepers|2001|Horror|79.51
Jeepers Creepers 2|2003|Horror|69.36
Jeff Who Lives At Home|2011|Comedy|80.03
Jennifer's Body|2009|Horror|72.37
Jenny's Wedding |2015|Comedy|37.49
Jerry Maguire|1996|Romance|77.99
Jessabelle|2014|Horror|74.15
Jigsaw|2017|Horror|83.29
Joe Dirt|2001|Comedy|69.17
Joe Dirt 2|2015|Comedy|9.99
Joe Somebody|2001|Comedy|63.65
John Carter|2012|Fantasy|80.35
John Q|2002|Drama|80.30
John Tucker Must Die|2006|Comedy|69.18
John Wick|2014|Action|85.01
John Wick 4|2023|Action |86.92
John Wick: Chapter 2|2017|Action|85.55
John Wick: Chapter 3|2019|Action|85.76
Johnny English|2003|Comedy|83.77
Johnny English: Reborn|2011|Comedy|83.87
Jojo Rabbit|2019|Comedy|52.99
Joker|2019|Drama|87.34
Journey 2: Mysterious Island|2012|Adventure|79.74
Journey to The Center of The Earth|2008|Adventure|71.08
Joy|2015|Drama|69.27
Joy Ride|2001|Horror|80.02
Joy Ride 2|2008|Horror|14.10
Joy Ride 3|2014|Horror|1.00
Ju On : The Final Curse|2015|Horror|60.46
Judy Moodyand The Not Bummer Summer|2011|Comedy|36.74
Julia's Eyes|2010|Thriller|83.22
Julie & Julia|2009|Drama|63.94
Jumanji|1995|Comedy|85.43
Jumanji: The Next Level|2019|Adventure|84.90
Jumanji: Welcome To The Jungle|2017|Adventure|85.41
Jumper|2008|Sci-Fi|70.94
Jumping The Broom|2012|Comedy|70.26
Juno|2007|Comedy|51.66
Jupiter Ascending|2015|Sci-Fi|0.00
Jurassic Park|1993|Adventure|80.54
Jurassic Park 2|1997|Adventure|67.14
Jurassic Park 3|2001|Adventure|70.10
Jurassic World|2015|Adventure|80.81
Jurassic World: Fallen Kingdom|2018|Adventure|69.55
Just Go With It|2011|Romance|79.77
Just Like Heaven|2005|Romance|79.77
Just Married|2005|Romance|68.96
Justice League|2008|Animation|65.75
Justice League|2017|Comics|83.92
Justice League : Crisis of Two Earths|2010|Animation|71.15
Justice League : Flashpoint Paradox|2013|Animation|82.59
Justice League Dark|2016|Animation|65.79
Kakushigoto Movie|2021|Anime|62.61
Keeping Mum|2005|Comedy|82.96
Keeping Up With The Joneses|2016|Comedy|72.22
Kevin Hart What Now? |2016|Comedy|80.65
Kick Ass|2010|Adventure|70.11
Kick Ass 2|2013|Adventure|38.96
Kidnap|2017|Action|69.48
Killer Elite|2011|Action|64.62
Killers|2010|Comedy|48.98
Killing Gunther|2017|Action|36.66
Kinds of Kindness|2024|Drama|77.00
King Arthur|2004|Action|69.86
King Arthur : Legend of the Sword|2017|History|65.29
King Kong|2005|Adventure|82.58
Kingdom of Heaven|2005|Action|59.66
Kingsman: The Golden Circle |2017|Action|82.44
Kingsman: The Secret Service|2015|Action|84.01
Klaus|2019|Animation|85.74
Knight And Day|2010|Action|69.87
Knives Out|2019|Crime|82.48
Knowing|2009|Thriller|84.80
Kong: Skull Island|2017|Disaster|78.42
Krampus|2015|Comedy|70.27
Kung Fu Panda|2008|Animation|80.26
Kung Fu Panda 2|2011|Animation|75.25
Kung Fu Panda 3|2015|Animation|72.12`;

async function addMovie(title, year, genre, rating) {
  const cleanTitle = title.trim();
  const cleanYear = year.trim();
  const cleanGenre = genre.trim();
  const cleanRating = parseFloat(rating);
  if (isNaN(cleanRating)) return { ok: false, action: 'invalid_rating', title: cleanTitle };

  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: cleanTitle, originalTitle: cleanTitle, year: cleanYear, type: 'movie', genres: cleanGenre, userRating: cleanRating, ratingStatus: 'watched', rewatch: false })
  });
  if (res.ok) return { ok: true, action: 'created', title: cleanTitle };
  if (res.status === 409) {
    try {
      const data = await res.json();
      const existing = data.existingItem;
      if (existing && existing.id) {
        const u = await fetch(`${API_BASE}/${existing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: cleanTitle, originalTitle: cleanTitle, year: cleanYear, type: 'movie', genres: cleanGenre, userRating: cleanRating, ratingStatus: 'watched', rewatch: false }) });
        if (u.ok) return { ok: true, action: 'updated', title: cleanTitle };
      }
    } catch (e) {}
    try {
      const s = await fetch(`${API_BASE}?type=movie&search=${encodeURIComponent(cleanTitle)}`);
      const sd = await s.json();
      const m = (sd.items || []).find(i => i.title === cleanTitle && i.year === cleanYear);
      if (m && m.id) {
        const u = await fetch(`${API_BASE}/${m.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: cleanTitle, originalTitle: cleanTitle, year: cleanYear, type: 'movie', genres: cleanGenre, userRating: cleanRating, ratingStatus: 'watched', rewatch: false }) });
        if (u.ok) return { ok: true, action: 'updated', title: cleanTitle };
      }
    } catch (e) {}
    return { ok: false, action: 'conflict', title: cleanTitle };
  }
  return { ok: false, action: 'error', title: cleanTitle };
}

async function main() {
  const lines = moviesData.trim().split('\n').filter(l => l.trim());
  console.log(`Total: ${lines.length}`);
  let created = 0, updated = 0, failed = 0, skipped = 0;
  const BATCH = 8;
  for (let i = 0; i < lines.length; i += BATCH) {
    const batch = lines.slice(i, i + BATCH);
    const results = await Promise.allSettled(batch.map(line => {
      const parts = line.split('|');
      if (parts.length < 4) return Promise.resolve({ ok: false, action: 'parse_error', title: line });
      return addMovie(parts[0], parts[1], parts[2], parts[3]);
    }));
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.ok) { if (r.value.action === 'created') created++; else updated++; }
      else if (r.status === 'fulfilled' && r.value.action === 'invalid_rating') { skipped++; console.log(`  SKIP: ${r.value.title}`); }
      else { failed++; const info = r.status === 'fulfilled' ? r.value : r.reason; console.log(`  FAIL: ${info?.title || '?'}`); }
    }
    const p = Math.min(i + BATCH, lines.length);
    if (p % 50 < BATCH || p >= lines.length) console.log(`${p}/${lines.length} | New: ${created} | Updated: ${updated} | Fail: ${failed} | Skip: ${skipped}`);
  }
  console.log(`\nDONE | New: ${created} | Updated: ${updated} | Failed: ${failed} | Skipped: ${skipped}`);
}
main().catch(console.error);
