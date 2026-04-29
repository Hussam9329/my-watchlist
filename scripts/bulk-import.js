/**
 * Bulk import movies from user data
 * Format: Title\tGenre\tYear\tRating
 * Run: node scripts/bulk-import.js
 */

const API_BASE = 'https://my-watchlist-rho.vercel.app/api/watchlist'

// Raw movie data from user (Title\tGenre\tYear\tRating)
const rawData = `9	Animation	2009	75.14
21	Drama	2015	61.80
300	History	2007	79.47
1408	Horror	2007	84.84
1917	War	2019	83.24
1922	Thriller	2017	74.45
2012	Disaster	2009	85.03
#Alive	Horror	2020	68.71
10 Cloverfield Lane	Thriller	2016	80.80
10 Things I Hate About You	Romance	1999	80.32
10 Years	Romance	2011	52.03
10,000 BC	Adventure	2008	38.74
101 Dalmatains	Animation	1962	76.67
101 Dalmatains II	Animation	2003	70.14
10x10	Thriller	2018	78.97
11.11.11	Horror	2011	50.98
11:14	Thriller	2003	83.03
12 Angry Men	Drama	1957	92.00
12 Monkeys	Thriller	1995	76.42
12 Rounds	Action	2009	71.04
12 Years A Slave	Drama	2013	71.86
127 Hours 	Adventure	2011	83.37
13 Going to 30	Romance	2004	71.50
13 Hours	War	2016	63.19
15 Minutes	Action	2001	68.99
16 - Love	Romance	2012	10.88
16 Blocks	Action	2006	36.88
17 Again	Comedy	2006	75.39
18 Years Old Virgin	Comedy	2009	71.18
1911 Revolution	War	2011	77.63
2 Fast 2 Furious	Action	2003	74.58
2012: Ice Age	Disaster	2011	69.22
21 Bridges	Action	2019	71.05
21 Grams	Crime	2003	84.35
21 Jump Street 	Comedy	2012	79.75
22 Jump Street	Comedy	2014	75.42
24 Redemption	Action	2008	80.45
28 Days Later	Horror	2002	79.49
28 Weeks Later	Horror	2007	70.70
30 Minutes or Less	Comedy	2011	78.92
300: Rise of An Empire	History	2014	70.67
4.3.2.1	Crime	2010	65.08
400 Days 	Sci-Fi	2015	28.71
50 / 50	Drama	2011	80.50
50 First Dates	Romance	2004	84.68
500 Days of Summer	Romance	2009	83.83
6 Bullets	Action	2012	52.30
7 Seconds	Action	2005	67.98
88 Minutes	Crime	2007	71.84
8-Bit Christmas	Family	2021	81.89
8mm	Action	1999	79.04
8mm 2	Action	2005	59.41
99 Homes	Drama	2015	69.23
A Beautiful Day in The Neighborhood 	Drama	2019	84.82
A Beautiful Mind	Drama	2001	83.81
A Christmas Carol	Animation	2009	85.34
A Cure for Wellness	Drama	2017	80.11
A Dangerous Man	Action	2009	69.00
A Dark Song	Thriller	2017	9.21
A Dark Truth	Drama	2012	51.93
A Few Best Men	Comedy	2011	61.30
A Good Day to Die Hard	Action	2013	63.23
A Good Old Fashioned Orgy	Comedy	2011	71.74
A Little Bit of Heaven	Romance	2011	62.85
A Man Apart	Action	2003	59.44
A Man Called Otto	Drama	2022	83.98
A Million Way To Die In The West	Comedy	2014	78.11
A Nightmare on Elm Street 	Horror	2010	71.45
A Nightmare on Elm Street 1	Horror	1984	65.33
A Nightmare on Elm Street 2	Horror	1985	64.11
A Nightmare on Elm Street 3	Horror	1987	62.60
A Nightmare on Elm Street 4	Horror	1988	62.64
A Nightmare on Elm Street 5	Horror	1989	60.37
A Perfect Getaway	Adventure	2009	69.54
A Quiet Place	Horror	2018	84.23
A Quiet Place 2	Horror	2020	84.68
A Scanner Darkly	Sci-Fi	2004	80.37
A Secret Affair	Drama	2012	12.60
A Series of Unfortunate Events	Adventure	2004	80.32
A Single Shot	Drama	2013	18.21
A Thousand Words	Drama	2012	71.39
A Walk Among Tombstones	Action	2011	37.05
A Walk To Remember	Romance	2012	84.60
A Wrinkle in Time	Fantasy	2018	68.78
Abduction	Action	2011	69.82
Abominable	Animation	2019	81.36
About Time	Romance	2013	38.53
Accepted	Comedy	2006	81.76
According To Greta	Romance	2009	62.89
Ace Ventura	Comedy	1994	81.54
Ace Ventura 2	Comedy	1995	81.24
Act of Valor	Action	2012	41.97
AD Astra	Sci-Fi	2019	70.92
Adaptation	Drama	2002	80.00
Addam's Family 2	Animation	2021	61.53
Addam's Family Values	Fantasy	1993	77.43
Adrift	Adventure	2018	70.08
Adventures in Babysitting 	Adventure	1987	81.03
Aeon Flux	Sci-Fi	2005	76.31
After Earth	Disaster	2013	55.54
After Life	Thriller	2009	70.96
After The Dark	Fantasy	2013	31.34
After The Sunset	Drama	2004	67.39
Aftermath	Thriller	2017	67.81
Agora	History	2009	70.68
AI: Artificial Intelligence 	Sci-Fi	2001	70.93
Air	Sci-Fi	2019	82.99
Air	Thriller	2015	12.38
Air Force One	Thriller	1997	81.86
Aladdin 	Animation	1992	83.39
Aladdin 	Fantasy	2019	84.83
Alex Cross	Action	2012	69.83
Alexander	History	2004	49.59
Alice in Wonderland	Fantasy	2010	78.65
Alice Through The Looking Glass	Fantasy	2016	82.17
Alien	Horror	1979	81.00
Alien 2	Horror	1986	78.69
Alien 3	Horror	1992	78.71
Alien: Resurrection	Horror	1997	69.74
All About Eve	Drama	1950	70.42
All About Steve	Comedy	2009	67.18
All The Money in The World 	Drama	2018	78.46
All The Way	Drama	2016	77.08
Allied 	Drama	2016	61.84
Almost Heroes	Comedy	1998	84.03
Almost Home	Animation	2014	81.64
Alone	Thriller	2020	78.02
Along Came Polly	Romance	2004	78.90
Altered States	Thriller	1980	67.85
Ambulance	Crime	2022	84.11
American Beauty	Drama	1999	80.90
American History X	Drama	1998	81.98
American Hustle	Drama	2013	27.40
American Made	Action	2017	15.61
American Pie	Comedy	1999	70.22
American Pie 2	Comedy	2001	68.36
American Poltergeist	Horror	2015	0.00
American Psycho	Crime	2000	69.63
American Renion	Romance	2012	60.50
American Ultra	Comedy	2015	69.10
American Wedding	Comedy	2003	69.11
An American Pickle	Comedy	2020	63.58
An Education	Romance	2009	78.91
An Invisible Sign	Drama	2010	68.73
Anastasia 	Animation	1997	72.90
Anatomy of a Fall	Crime	2023	83.07
Anchorman	Comedy	2004	80.38
Anchorman 2	Comedy	2013	75.44
Angel Has Fallen	Action	2019	81.82
Angels & Demons	Thriller	2009	81.46
Anger Management 	Comedy	2003	83.63
Anna	Action	2019	82.66
Annabelle	Horror	2014	70.71
Annabelle 2	Horror	2017	81.73
Annabelle Comes Home	Horror	2019	78.73
Another Earth	Adventure	2011	50.30
Antichrist	Horror	2009	79.02
Ant-Man	Comics	2015	84.32
Ant-Man And The Wasp	Comics	2018	85.05
Ant-Man Quantumania	Comics	2023	84.01
Antz	Animation	1998	50.40
Anything Else	Romance	2003	76.14
Anywhere But Here	Drama	1999	70.43
Aound The World in 80 Days	Adventure	2004	76.61
Apocalypse Pompie 	Disaster	2014	38.44
Apollo 18	Adventure	2011	70.09
Aquaman	Comics	2018	83.44
Are We Done Yet	Comedy	2007	70.23
Are We There Yet	Comedy	2005	71.75
Argo	Drama	2016	77.12
Argylle	Action	2024	80.00
Armageddon	Disaster	1998	73.75
Around The Block	Action	2012	4.38
Arrival	Sci-Fi	2016	51.35
Arthur	Comedy	2011	61.34
Arthur Christmas	Animation	2011	77.95
As Above , So Below	Horror	2014	71.94
As Good As It Gets	Romance	1997	85.00
Assassination Games	Action	2012	50.02
Assassins Bullet	Action	2012	5.22
Assassins Creed 	Action	2016	50.09
Assault On Precinct 13	Action	2005	80.10
Assault on Wall Street	Action	2013	4.44
ATM	Thriller	2012	69.43
Atomic Blonde 	Action	2017	53.74
Atonement 	Drama	2007	77.15
Attack Force	Action	2006	36.59
Attack The Block	Action	2011	6.98
Avengers: Age of Ultron	Comics	2015	86.79
Avengers: Endgame	Comics	2019	98.79
Avengers: Infinity War	Comics	2018	99.01
Awake	Thriller	2007	80.84
Awakenings	Drama	1990	83.55
Baby Driver	Action	2017	79.72
Babylon A.D	Sci-Fi	2008	71.57
Baby's Day Out	Comedy	1994	83.88
Back To The Future	Adventure	1985	85.94
Back To The Future II	Adventure	1990	85.81
Back To The Future III	Adventure	1991	82.83
Backtrack	Horror	2015	82.79
Bad Ass	Comedy	2012	13.03
Bad Boys 	Comedy	1995	80.92
Bad Boys 2	Comedy	2003	83.42
Bad Boys 3	Comedy	2020	80.15
Bad Company	Action	2002	69.01
Bad Moms	Comedy	2016	61.38
Bad Samaritan	Thriller	2018	81.37
Bad Teacher	Comedy	2011	64.87
Bait	Horror	2012	17.34
Ballerina 	Animation	2016	61.05
Bandersnatch 	Thriller	2018	90.00
Bandits 	Comedy	2001	68.40
Bangkok Dangerous	Action	2008	69.45
Barber Shop	Comedy	2002	69.57
Barber Shop 2	Comedy	2004	57.22
Barber Shop 3	Comedy	2016	48.81
Barefoot Gen	Anime	1980	80.05
Barefoot Gen 2	Anime	1986	72.17
Barely Legal	Comedy	2006	59.83
Barnyard 	Animation	2006	61.09
Basic Instinct	Crime	1992	79.76
Batman	Comics	1989	50.66
Batman : Bad Blood	Comics	2016	16.91
Batman : Return	Comics	1992	52.56
Batman : The Killing Joke	Animation	2016	77.97
Batman : Year One	Animation	2011	79.17
Batman And Robin	Comics	1997	51.82
Batman Begins	Comics	2005	79.34
Batman Forever	Comics	1995	57.74
Batman Hush	Animation	2019	64.78
Batman Under The Red Hood	Animation	2013	81.02
Batman V Superman	Comics	2016	81.80
Batman: Assault on Arkham	Animation	2014	63.48
Batman: The Dark Knight Returns P1	Animation	2012	70.15
Batman: The Dark Knight Returns P2	Animation	2013	71.12
Battle LA	War	2011	41.49
Battle Royale	Action	2000	70.52
Battle Royale 2	Action	2003	65.52
Battle Ship	War	2012	60.63
Be Cool	Comedy	2005	38.35
Be With You	Drama	2018	84.36
Bean	Comedy	1997	84.56
Beastly	Romance	2009	71.51
Beautiful Creatures	Fantasy	2013	52.77
Beauty and the Beast	Animation	1991	83.52
Beauty and the Beast	Romance	2017	84.42
Because of Winn-Dixie	Drama	2005	81.01
Bedtime Stories	Adventure	2008	80.24
Bee Movie	Animation	2007	75.16
Before I Fall	Thriller	2016	80.63
Before I Go to Sleep	Thriller	2014	82.74
Before Midnight 	Drama	2013	71.40
Before Sunrise 	Romance	1995	64.36
Before Sunset	Romance	2004	67.73
Before We Go	Romance	2014	80.50
Behind Enemy Lines	War	2001	79.77
Being Flynn 	Action	2012	6.74
Being John Malkovic	Thriller	1999	81.12
Belle	Drama	2012	73.80
Beneath Hill 60	Action	2010	50.13
Beowulf	Animation	2007	66.72
Berlin Syndrome	Thriller	2017	80.69
Bestille Day	Action	2016	69.84
Bewitched	Romance	2005	84.87
Beyond a Reasonable Doubt	Drama	2009	71.87
Bicentennial Man	Drama	1999	85.56
Big Daddy	Comedy	1999	82.22
Big Fat Liar	Comedy	2002	72.18
Big Hero 6	Animation	2014	81.70
Big Momma's House	Comedy	2000	80.38
Big Momma's House 2	Comedy	2006	71.76
Big Mommas Like Father Like Son	Comedy	2011	75.47
Big Stan	Comedy	2007	80.71
Bird Box	Thriller	2018	85.48
Bird Box: Barcelona	Thriller	2023	50.54
Birdman	Drama	2014	80.27
Birds of America	Drama	2010	80.34
Birds of Prey	Comics	2020	80.20
Black Eagle	Action	1988	79.05
Black Hawk Down	War	2001	83.89
Black Knight 	Comedy	2001	78.13
Black Mass	Action	2015	60.67
Black Out	Horror	2008	72.33
Black Panther	Comics	2018	84.18
Black Panther: Wakanda Forever	Comics	2022	75.03
Black Swan	Thriller	2010	77.61
Black Widow	Comics	2021	81.19
Blades of Glory	Comedy	2007	82.85
Blast From the Past	Romance	1999	74.30
Bleeding Steel	Action	2017	71.60
Blindness	Thriller	2008	80.55
Blink Twice	Thriller	2024	81.09
Blitz	Action	2011	69.02
BloodDiamond	Drama	2006	77.18
Blood Red Sky	Horror	2021	77.88
Bloodsport	Action	1988	77.64
Blue Streak	Comedy	1999	81.04
Boat Trip	Comedy	2002	79.75
Bolt 	Animation	2008	69.08
Boogyman	Horror	2005	77.50`

async function importMovies() {
  const lines = rawData.trim().split('\n')
  console.log(`Total movies to import: ${lines.length}`)

  let added = 0
  let skipped = 0
  let errors = 0

  // Fetch existing movies to check duplicates
  console.log('Fetching existing movies...')
  const existingRes = await fetch(`${API_BASE}?type=movie`)
  const existingData = await existingRes.json()
  const existingMovies = existingData.items || existingData
  const existingSet = new Set(existingMovies.map(m => `${m.title.toLowerCase().trim()}_${m.year}`))
  console.log(`Found ${existingMovies.length} existing movies in DB`)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split('\t')
    if (parts.length < 4) {
      // Try splitting by multiple spaces
      const match = line.match(/^(.+?)\s{2,}(\w[\w\s]*?)\s{2,}(\d{4})\s+([\d.]+)$/)
      if (!match) {
        console.log(`Skipping invalid line ${i + 1}: ${line}`)
        errors++
        continue
      }
      parts[0] = match[1].trim()
      parts[1] = match[2].trim()
      parts[2] = match[3].trim()
      parts[3] = match[4].trim()
    }

    const title = parts[0].trim()
    const genre = parts[1].trim()
    const year = parts[2].trim()
    const rating = parseFloat(parts[3].trim())

    if (!title || !year || isNaN(rating)) {
      console.log(`Skipping invalid: ${line}`)
      errors++
      continue
    }

    // Check duplicate (by title + year)
    const dedupeKey = `${title.toLowerCase()}_${year}`
    if (existingSet.has(dedupeKey)) {
      // Update userRating if existing movie has no rating
      const existing = existingMovies.find(m => 
        m.title.toLowerCase().trim() === title.toLowerCase() && m.year === year
      )
      if (existing && (existing.userRating === null || existing.userRating === undefined)) {
        try {
          const res = await fetch(`${API_BASE}/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: existing.title,
              originalTitle: existing.originalTitle || existing.title,
              year: existing.year,
              type: 'movie',
              genres: genre,
              userRating: rating,
              ratingStatus: 'watched',
              rewatch: false,
              runtime: existing.runtime || null,
              watched: true,
            })
          })
          if (res.ok) {
            console.log(`Updated rating for: ${title} (${year}) → ${rating}`)
            added++
          }
        } catch (e) {
          console.error(`Error updating ${title}: ${e.message}`)
          errors++
        }
      } else {
        console.log(`Skipping duplicate: ${title} (${year})`)
        skipped++
      }
      continue
    }

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          originalTitle: title,
          year,
          type: 'movie',
          genres: genre,
          userRating: rating,
          ratingStatus: 'watched',
          rewatch: false,
          watched: true,
          notes: '',
          tags: '',
        })
      })

      if (res.status === 409) {
        console.log(`Duplicate (409): ${title} (${year})`)
        skipped++
        continue
      }

      if (!res.ok) {
        const err = await res.text()
        console.error(`Error adding ${title}: ${res.status} - ${err}`)
        errors++
        continue
      }

      added++
      if ((added) % 20 === 0) {
        console.log(`Progress: ${added} added, ${skipped} skipped, ${errors} errors out of ${lines.length}`)
      }

      // Small delay to avoid overwhelming the API
      if (i % 5 === 0) {
        await new Promise(r => setTimeout(r, 200))
      }
    } catch (e) {
      console.error(`Network error for ${title}: ${e.message}`)
      errors++
    }
  }

  console.log(`\n=== Import Complete ===`)
  console.log(`Added/Updated: ${added}`)
  console.log(`Skipped (duplicates): ${skipped}`)
  console.log(`Errors: ${errors}`)
}

importMovies().catch(err => {
  console.error('Import failed:', err)
  process.exit(1)
})
