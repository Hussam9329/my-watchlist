// Batch import movies - handles both new movies and existing unrated ones
const API_BASE = 'https://my-watchlist-rho.vercel.app/api/watchlist';

const moviesData = `9|2009|Animation|75.14
21|2015|Drama|61.80
300|2007|History|79.47
1408|2007|Horror|84.84
1917|2019|War|83.24
1922|2017|Thriller|74.45
2012|2009|Disaster|85.03
#Alive|2020|Horror|68.71
10 Cloverfield Lane|2016|Thriller|80.80
10 Things I Hate About You|1999|Romance|80.32
10 Years|2011|Romance|52.03
10,000 BC|2008|Adventure|38.74
101 Dalmatains|1962|Animation|76.67
101 Dalmatains II|2003|Animation|70.14
10x10|2018|Thriller|78.97
11.11.11|2011|Horror|50.98
11:14|2003|Thriller|83.03
12 Angry Men|1957|Drama|92.00
12 Monkeys|1995|Thriller|76.42
12 Rounds|2009|Action|71.04
12 Years A Slave|2013|Drama|71.86
127 Hours |2011|Adventure|83.37
13 Going to 30|2004|Romance|71.50
13 Hours|2016|War|63.19
15 Minutes|2001|Action|68.99
16 - Love|2012|Romance|10.88
16 Blocks|2006|Action|36.88
17 Again|2006|Comedy|75.39
18 Years Old Virgin|2009|Comedy|71.18
1911 Revolution|2011|War|77.63
2 Fast 2 Furious|2003|Action|74.58
2012: Ice Age|2011|Disaster|69.22
21 Bridges|2019|Action|71.05
21 Grams|2003|Crime|84.35
21 Jump Street |2012|Comedy|79.75
22 Jump Street|2014|Comedy|75.42
24 Redemption|2008|Action|80.45
28 Days Later|2002|Horror|79.49
28 Weeks Later|2007|Horror|70.70
30 Minutes or Less|2011|Comedy|78.92
300: Rise of An Empire|2014|History|70.67
4.3.2.1|2010|Crime|65.08
400 Days |2015|Sci-Fi|28.71
50 / 50|2011|Drama|80.50
50 First Dates|2004|Romance|84.68
500 Days of Summer|2009|Romance|83.83
6 Bullets|2012|Action|52.30
7 Seconds|2005|Action|67.98
88 Minutes|2007|Crime|71.84
8-Bit Christmas|2021|Family|81.89
8mm|1999|Action|79.04
8mm 2|2005|Action|59.41
99 Homes|2015|Drama|69.23
A Beautiful Day in The Neighborhood |2019|Drama|84.82
A Beautiful Mind|2001|Drama|83.81
A Christmas Carol|2009|Animation|85.34
A Cure for Wellness|2017|Drama|80.11
A Dangerous Man|2009|Action|69.00
A Dark Song|2017|Thriller|9.21
A Dark Truth|2012|Drama|51.93
A Few Best Men|2011|Comedy|61.30
A Good Day to Die Hard|2013|Action|63.23
A Good Old Fashioned Orgy|2011|Comedy|71.74
A Little Bit of Heaven|2011|Romance|62.85
A Man Apart|2003|Action|59.44
A Man Called Otto|2022|Drama|83.98
A Million Way To Die In The West|2014|Comedy|78.11
A Nightmare on Elm Street |2010|Horror|71.45
A Nightmare on Elm Street 1|1984|Horror|65.33
A Nightmare on Elm Street 2|1985|Horror|64.11
A Nightmare on Elm Street 3|1987|Horror|62.60
A Nightmare on Elm Street 4|1988|Horror|62.64
A Nightmare on Elm Street 5|1989|Horror|60.37
A Perfect Getaway|2009|Adventure|69.54
A Quiet Place|2018|Horror|84.23
A Quiet Place 2|2020|Horror|84.68
A Scanner Darkly|2004|Sci-Fi|80.37
A Secret Affair|2012|Drama|12.60
A Series of Unfortunate Events|2004|Adventure|80.32
A Single Shot|2013|Drama|18.21
A Thousand Words|2012|Drama|71.39
A Walk Among Tombstones|2011|Action|37.05
A Walk To Remember|2012|Romance|84.60
A Wrinkle in Time|2018|Fantasy|68.78
Abduction|2011|Action|69.82
Abominable|2019|Animation|81.36
About Time|2013|Romance|38.53
Accepted|2006|Comedy|81.76
According To Greta|2009|Romance|62.89
Ace Ventura|1994|Comedy|81.54
Ace Ventura 2|1995|Comedy|81.24
Act of Valor|2012|Action|41.97
AD Astra|2019|Sci-Fi|70.92
Adaptation|2002|Drama|80.00
Addam's Family 2|2021|Animation|61.53
Addam's Family Values|1993|Fantasy|77.43
Adrift|2018|Adventure|70.08
Adventures in Babysitting |1987|Adventure|81.03
Aeon Flux|2005|Sci-Fi|76.31
After Earth|2013|Disaster|55.54
After Life|2009|Thriller|70.96
After The Dark|2013|Fantasy|31.34
After The Sunset|2004|Drama|67.39
Aftermath|2017|Thriller|67.81
Agora|2009|History|70.68
AI: Artificial Intelligence |2001|Sci-Fi|70.93
Air|2019|Sci-Fi|82.99
Air|2015|Thriller|12.38
Air Force One|1997|Thriller|81.86
Aladdin |1992|Animation|83.39
Aladdin |2019|Fantasy|84.83
Alex Cross|2012|Action|69.83
Alexander|2004|History|49.59
Alice in Wonderland|2010|Fantasy|78.65
Alice Through The Looking Glass|2016|Fantasy|82.17
Alien|1979|Horror|81.00
Alien 2|1986|Horror|78.69
Alien 3|1992|Horror|78.71
Alien: Resurrection|1997|Horror|69.74
All About Eve|1950|Drama|70.42
All About Steve|2009|Comedy|67.18
All The Money in The World |2018|Drama|78.46
All The Way|2016|Drama|77.08
Allied |2016|Drama|61.84
Almost Heroes|1998|Comedy|84.03
Almost Home|2014|Animation|81.64
Alone|2020|Thriller|78.02
Along Came Polly|2004|Romance|78.90
Altered States|1980|Thriller|67.85
Ambulance|2022|Crime|84.11
American Beauty|1999|Drama|80.90
American History X|1998|Drama|81.98
American Hustle|2013|Drama|27.40
American Made|2017|Action|15.61
American Pie|1999|Comedy|70.22
American Pie 2|2001|Comedy|68.36
American Poltergeist|2015|Horror|0.00
American Psycho|2000|Crime|69.63
American Renion|2012|Romance|60.50
American Ultra|2015|Comedy|69.10
American Wedding|2003|Comedy|69.11
An American Pickle|2020|Comedy|63.58
An Education|2009|Romance|78.91
An Invisible Sign|2010|Drama|68.73
Anastasia |1997|Animation|72.90
Anatomy of a Fall|2023|Crime|83.07
Anchorman|2004|Comedy|80.38
Anchorman 2|2013|Comedy|75.44
Angel Has Fallen|2019|Action|81.82
Angels & Demons|2009|Thriller|81.46
Anger Management |2003|Comedy|83.63
Anna|2019|Action|82.66
Annabelle|2014|Horror|70.71
Annabelle 2|2017|Horror|81.73
Annabelle Comes Home|2019|Horror|78.73
Another Earth|2011|Adventure|50.30
Antichrist|2009|Horror|79.02
Ant-Man|2015|Comics|84.32
Ant-Man And The Wasp|2018|Comics|85.05
Ant-Man Quantumania|2023|Comics|84.01
Antz|1998|Animation|50.40
Anything Else|2003|Romance|76.14
Anywhere But Here|1999|Drama|70.43
Aound The World in 80 Days|2004|Adventure|76.61
Apocalypse Pompie |2014|Disaster|38.44
Apollo 18|2011|Adventure|70.09
Aquaman|2018|Comics|83.44
Are We Done Yet|2007|Comedy|70.23
Are We There Yet|2005|Comedy|71.75
Argo|2016|Drama|77.12
Argylle|2024|Action|80.00
Armageddon|1998|Disaster|73.75
Around The Block|2012|Action|4.38
Arrival|2016|Sci-Fi|51.35
Arthur|2011|Comedy|61.34
Arthur Christmas|2011|Animation|77.95
As Above , So Below|2014|Horror|71.94
As Good As It Gets|1997|Romance|85.00
Assassination Games|2012|Action|50.02
Assassins Bullet|2012|Action|5.22
Assassins Creed |2016|Action|50.09
Assault On Precinct 13|2005|Action|80.10
Assault on Wall Street|2013|Action|4.44
ATM|2012|Thriller|69.43
Atomic Blonde |2017|Action|53.74
Atonement |2007|Drama|77.15
Attack Force|2006|Action|36.59
Attack The Block|2011|Action|6.98
Avengers: Age of Ultron|2015|Comics|86.79
Avengers: Endgame|2019|Comics|98.79
Avengers: Infinity War|2018|Comics|99.01
Awake|2007|Thriller|80.84
Awakenings|1990|Drama|83.55
Baby Driver|2017|Action|79.72
Babylon A.D|2008|Sci-Fi|71.57
Baby's Day Out|1994|Comedy|83.88
Back To The Future|1985|Adventure|85.94
Back To The Future II|1990|Adventure|85.81
Back To The Future III|1991|Adventure|82.83
Backtrack|2015|Horror|82.79
Bad Ass|2012|Comedy|13.03
Bad Boys |1995|Comedy|80.92
Bad Boys 2|2003|Comedy|83.42
Bad Boys 3|2020|Comedy|80.15
Bad Company|2002|Action|69.01
Bad Moms|2016|Comedy|61.38
Bad Samaritan|2018|Thriller|81.37
Bad Teacher|2011|Comedy|64.87
Bait|2012|Horror|17.34
Ballerina |2016|Animation|61.05
Bandersnatch |2018|Thriller|90.00
Bandits |2001|Comedy|68.40
Bangkok Dangerous|2008|Action|69.45
Barber Shop|2002|Comedy|69.57
Barber Shop 2|2004|Comedy|57.22
Barber Shop 3|2016|Comedy|48.81
Barefoot Gen|1980|Anime|80.05
Barefoot Gen 2|1986|Anime|72.17
Barely Legal|2006|Comedy|59.83
Barnyard |2006|Animation|61.09
Basic Instinct|1992|Crime|79.76
Batman|1989|Comics|50.66
Batman : Bad Blood|2016|Comics|16.91
Batman : Return|1992|Comics|52.56
Batman : The Killing Joke|2016|Animation|77.97
Batman : Year One|2011|Animation|79.17
Batman And Robin|1997|Comics|51.82
Batman Begins|2005|Comics|79.34
Batman Forever|1995|Comics|57.74
Batman Hush|2019|Animation|64.78
Batman Under The Red Hood|2013|Animation|81.02
Batman V Superman|2016|Comics|81.80
Batman: Assault on Arkham|2014|Animation|63.48
Batman: The Dark Knight Returns P1|2012|Animation|70.15
Batman: The Dark Knight Returns P2|2013|Animation|71.12
Battle LA|2011|War|41.49
Battle Royale|2000|Action|70.52
Battle Royale 2|2003|Action|65.52
Battle Ship|2012|War|60.63
Be Cool|2005|Comedy|38.35
Be With You|2018|Drama|84.36
Bean|1997|Comedy|84.56
Beastly|2009|Romance|71.51
Beautiful Creatures|2013|Fantasy|52.77
Beauty and the Beast|1991|Animation|83.52
Beauty and the Beast|2017|Romance|84.42
Because of Winn-Dixie|2005|Drama|81.01
Bedtime Stories|2008|Adventure|80.24
Bee Movie|2007|Animation|75.16
Before I Fall|2016|Thriller|80.63
Before I Go to Sleep|2014|Thriller|82.74
Before Midnight |2013|Drama|71.40
Before Sunrise |1995|Romance|64.36
Before Sunset|2004|Romance|67.73
Before We Go|2014|Romance|80.50
Behind Enemy Lines|2001|War|79.77
Being Flynn |2012|Action|6.74
Being John Malkovic|1999|Thriller|81.12
Belle|2012|Drama|73.80
Beneath Hill 60|2010|Action|50.13
Beowulf|2007|Animation|66.72
Berlin Syndrome|2017|Thriller|80.69
Bestille Day|2016|Action|69.84
Bewitched|2005|Romance|84.87
Beyond a Reasonable Doubt|2009|Drama|71.87
Bicentennial Man|1999|Drama|85.56
Big Daddy|1999|Comedy|82.22
Big Fat Liar|2002|Comedy|72.18
Big Hero 6|2014|Animation|81.70
Big Momma's House|2000|Comedy|80.38
Big Momma's House 2|2006|Comedy|71.76
Big Mommas Like Father Like Son|2011|Comedy|75.47
Big Stan|2007|Comedy|80.71
Bird Box|2018|Thriller|85.48
Bird Box: Barcelona|2023|Thriller|50.54
Birdman|2014|Drama|80.27
Birds of America|2010|Drama|80.34
Birds of Prey|2020|Comics|80.20
Black Eagle|1988|Action|79.05
Black Hawk Down|2001|War|83.89
Black Knight |2001|Comedy|78.13
Black Mass|2015|Action|60.67
Black Out|2008|Horror|72.33
Black Panther|2018|Comics|84.18
Black Panther: Wakanda Forever|2022|Comics|75.03
Black Swan|2010|Thriller|77.61
Black Widow|2021|Comics|81.19
Blades of Glory|2007|Comedy|82.85
Blast From the Past|1999|Romance|74.30
Bleeding Steel|2017|Action|71.60
Blindness|2008|Thriller|80.55
Blink Twice|2024|Thriller|81.09
Blitz|2011|Action|69.02
BloodDiamond|2006|Drama|77.18
Blood Red Sky|2021|Horror|77.88
Bloodsport|1988|Action|77.64
Blue Streak|1999|Comedy|81.04
Boat Trip|2002|Comedy|79.75
Bolt |2008|Animation|69.08
Boogyman|2005|Horror|77.50`;

async function addMovie(title, year, genre, rating) {
  const cleanTitle = title.trim();
  const cleanYear = year.trim();
  const cleanGenre = genre.trim();
  const cleanRating = parseFloat(rating);

  // Try POST first
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: cleanTitle,
      originalTitle: cleanTitle,
      year: cleanYear,
      type: 'movie',
      genres: cleanGenre,
      userRating: cleanRating,
      ratingStatus: 'watched',
      rewatch: false,
    })
  });

  if (res.ok) {
    return { ok: true, action: 'created', title: cleanTitle };
  }

  if (res.status === 409) {
    // Movie exists - find it and update with rating
    try {
      const data = await res.json();
      const existing = data.existingItem;
      if (existing && existing.id) {
        // Update the existing item with the rating
        const updateRes = await fetch(`${API_BASE}/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: cleanTitle,
            originalTitle: cleanTitle,
            year: cleanYear,
            type: 'movie',
            genres: cleanGenre,
            userRating: cleanRating,
            ratingStatus: 'watched',
            rewatch: false,
          })
        });
        if (updateRes.ok) {
          return { ok: true, action: 'updated', title: cleanTitle };
        }
        return { ok: false, action: 'update_failed', title: cleanTitle };
      }
    } catch (e) {
      // If 409 response parsing fails, search for it
    }

    // Fallback: search for the movie
    try {
      const searchRes = await fetch(`${API_BASE}?type=movie&search=${encodeURIComponent(cleanTitle)}`);
      const searchData = await searchRes.json();
      const items = searchData.items || [];
      const match = items.find(i => i.title === cleanTitle && i.year === cleanYear);
      if (match && match.id) {
        const updateRes = await fetch(`${API_BASE}/${match.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: cleanTitle,
            originalTitle: cleanTitle,
            year: cleanYear,
            type: 'movie',
            genres: cleanGenre,
            userRating: cleanRating,
            ratingStatus: 'watched',
            rewatch: false,
          })
        });
        if (updateRes.ok) {
          return { ok: true, action: 'updated', title: cleanTitle };
        }
      }
    } catch (e) {}
    
    return { ok: false, action: 'conflict_not_resolved', title: cleanTitle };
  }

  return { ok: false, action: 'error', title: cleanTitle, status: res.status };
}

async function main() {
  const lines = moviesData.trim().split('\n').filter(l => l.trim());
  console.log(`Total movies to import: ${lines.length}`);

  let created = 0;
  let updated = 0;
  let failed = 0;
  const BATCH = 8;

  for (let i = 0; i < lines.length; i += BATCH) {
    const batch = lines.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(line => {
        const parts = line.split('|');
        if (parts.length < 4) return Promise.resolve({ ok: false, action: 'parse_error', title: line });
        const [title, year, genre, rating] = parts;
        return addMovie(title, year, genre, rating);
      })
    );

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.ok) {
        if (r.value.action === 'created') created++;
        else if (r.value.action === 'updated') updated++;
      } else {
        failed++;
        const info = r.status === 'fulfilled' ? r.value : r.reason;
        console.log(`  FAIL: ${info?.title || 'unknown'} - ${info?.action || info?.message || 'unknown'}`);
      }
    }

    const progress = Math.min(i + BATCH, lines.length);
    if (progress % 50 < BATCH || progress >= lines.length) {
      console.log(`Progress: ${progress}/${lines.length} | Created: ${created} | Updated: ${updated} | Failed: ${failed}`);
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Created: ${created} | Updated (existing unrated): ${updated} | Failed: ${failed}`);
}

main().catch(console.error);
