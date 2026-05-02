/**
 * Batch import all 4 batches of movies
 * Run: node scripts/add-batch-all.js
 */

const API_BASE = 'https://my-watchlist-rho.vercel.app/api/watchlist';

const rawData = `Kung Fu Yoga|2017|Action|69.88
La La Land|2016|Romance|74.25
La Sociedad de la Nieve|2023|Adventure|84.93
Land of The Lost|2009|Adventure|83.07
Last Holiday|2006|Comedy|80.25
Laura|1944|Crime|77.05
Law Abiding Citizen|2009|Action|80.51
Leathal Weapon|1987|Comedy|83.27
Leathal Weapon 2|1989|Comedy|82.09
Leathal Weapon 3|1992|Comedy|81.41
Leathal Weapon 4|1992|Comedy|80.48
Leave the World Behind|2023|Thriller|81.74
Left Behind|2014|Drama|73.85
Legend|2015|Drama|37.18
Legendary|2010|Action|56.70
Legion|2010|Fantasy|66.30
Leo|2023|Animation|83.90
Let Me In|2010|Horror|62.73
Let's Be Cops|2014|Comedy|79.75
Letters To Juliet|2010|Romance|52.14
Level 16|2018|Thriller|80.33
Liar Liar|1997|Comedy|84.46
Life|2017|Adventure|81.18
Life As We Know It|2010|Comedy|60.04
Life or Something Like it|2002|Comedy|80.30
Lights Out|2016|Horror|80.20
Limitless|2011|Sci-Fi|80.09
Lion|2016|Drama|83.01
Lionheart|1990|Action|74.74
Little Fockers|2010|Comedy|79.75
Little Man|2000|Comedy|79.76
Little Miss Sunshine|2006|Comedy|68.57
Little Nicky|2000|Comedy|76.86
Little Women|2019|Drama|82.49
Live Free or Die Hard|2007|Action|69.89
Lockout|2012|Action|9.56
Logan|2017|Comics|83.79
Lolita|1997|Drama|71.88
London Has Fallen|2016|Action|79.74
Long Shot|2019|Comedy|78.26
Long Weekend|2008|Thriller|83.04
Looper|2012|Thriller|63.06
Lord of The Rings: Fellowship of The Ring|2001|Fantasy|83.12
Lord of The Rings: The Return of The King|2003|Adventure|82.71
Lord of The Rings: The Two Towers|2002|Fantasy|80.56
Lord of War|2005|Action|77.69
Love And Other Drugs|2010|Drama|70.53
Love Story|1970|Romance|68.97
Loving|2016|Drama|70.54
Luca|2021|Animation|84.79
Luck|2022|Animation|84.65
Lucky Number Slevin|2006|Drama|80.26
Lucky Numbers|2000|Comedy|71.28
Lucy|2014|Action|77.70
Lullaby|2014|Drama|71.42
M3GAN|2022|Horror|76.88
Ma|2019|Thriller|79.70
Machete|2010|Action|38.70
Machine Gun Preacher|2011|Action|69.49
Mad Max|2015|Action|82.67
Mad Money|2008|Comedy|80.16
Madagascar|2006|Animation|80.93
Madagascar 2|2008|Animation|76.71
Madagascar 3|2012|Animation|79.21
Madame Web|2024|Comics|81.63
Made of Honor|2008|Romance|79.63
Madison Country|2011|Horror|58.77
Magamind|2010|Animation|80.95
Maggie|2015|Horror|36.97
Malcolm X|1992|Drama|79.43
Maleficent|2014|Fantasy|81.43
Maleficent: Mistress of Evil|2019|Fantasy|81.63
Malena|2000|Drama|7.74
Mama|2013|Horror|82.90
Mamma Mia|2008|Romance|38.22
Man of Steel|2014|Comics|79.35
Man On Fire|2004|Action|81.49
Man On The Moon|1999|Comedy|81.66
Management|2009|Comedy|75.56
Manchester By The Sea|2016|Drama|70.55
Manhattan Night|2016|Thriller|67.94
Marley & Me|2008|Drama|79.76
Marriage Story|2019|Drama|85.26
Mars Needs Moms|2011|Sci-Fi|49.88
Mary Poppins Return|2018|Fantasy|80.25
Matchstick Men|2003|Drama|70.56
Maze Runner: The Death Cure|2018|Adventure|83.62
Maze Runner: The Scorch Trials|2015|Adventure|77.90
Me Before You|2016|Romance|81.71
Me Myself & Irene|2000|Comedy|81.67
Mean Girls|2004|Comedy|68.61
Mean Machine|2001|Drama|69.68
Meet Dave|2008|Comedy|78.28
Meet The Fockers|2004|Comedy|79.27
Meet The Parents|2000|Comedy|81.08
Meet The Spartans|2008|Comedy|68.90
Meeting Evil|2012|Horror|78.82
Melancholia|2011|Fantasy|37.75
Memento|2000|Thriller|83.84
Men In Black|1997|Adventure|77.92
Men In Black 2|2002|Adventure|71.09
Men In Black 3|2012|Adventure|71.10
Men in Black: International|2019|Sci-Fi|78.95
Men of Honor|2000|Action|80.37
Midnight in Paris|2011|Drama|70.57
Midway|2019|Action|84.15
Mike & Dave Need Wdding Dates|2016|Comedy|63.69
Minions|2015|Animation|84.71
Minority Report|2002|Sci-Fi|80.12
Mirage|2018|Thriller|85.78
Mirror Mirror|2012|Romance|69.40
Mirrors|2008|Horror|83.02
Mirrors 2|2010|Horror|71.48
Misery|1990|Thriller|85.57
Miss Congeniality|2000|Comedy|80.23
Miss Congeniality 2|2005|Comedy|61.59
Miss Peregrine's Home for Children|2016|Fantasy|75.92
Miss Sloane|2016|Drama|62.05
Missing Link|2019|Animation|83.08
Mission Impossible|1996|Action|80.53
Mission Impossible 2|2000|Action|82.56
Mission Impossible 3|2006|Action|80.52
Mission Impossible: Ghost Protocol|2011|Action|80.43
Moana|2016|Animation|81.52
Moana 2|2024|Animation|78.98
Money Talks|1997|Action|52.35
Monster|2003|Drama|83.61
Monster House|2006|Animation|70.17
Monster Hunter|2020|Adventure|77.78
Monsters Inc.|2001|Animation|82.40
Monsters University|2013|Animation|82.72
Monte Carlo|2011|Romance|69.79
Moon|2009|Thriller|80.00
Moonlight|2016|Drama|56.19
Morbius|2022|Comics|69.97
Morning Glory|2010|Drama|68.75
Mortdecai|2015|Drama|58.00
Mother|2017|Thriller|82.89
Mother's Day|2016|Romance|76.23
Mousehunt|1997|Comedy|83.78
Mr Harrigan's Phone|2022|Drama|80.00
Mr. & Mrs. Smith|2005|Comedy|78.30
Mr. Bean's Holiday|2007|Comedy|84.30
Mr. Deeds|2002|Romance|84.61
Mr. Magoo|1997|Comedy|80.30
Mr. Nobody|2009|Sci-Fi|86.92
Mr. Poppers Penguins|2011|Comedy|81.15
Mr. Smith Goes to Washington|1939|Drama|80.04
Mrs. Doubtfire|1993|Comedy|79.76
Mulan|2020|Fantasy|80.14
Murder Mystrey|2019|Comedy|80.16
Murder On The Orient Express|2017|Crime|81.47
My Best Friend's Wedding|1997|Romance|80.33
My Bloody Valentine|2009|Horror|69.37
My Sister's Keeper|2009|Drama|78.49
My Son|2021|Thriller|43.61
My Super Ex-Girlfriend|2006|Comedy|52.51
Mystic River|2003|Crime|80.49
Nacho Libre|2006|Comedy|70.28
Naked Weapon|2002|Action|74.77
Nancy Drew|2007|Comedy|60.08
Nanny Mcphee|2005|Comedy|80.29
Napoleon Dynamite|2004|Comedy|68.65
National Security|2004|Comedy|71.29
National Treasure|2004|Adventure|80.51
National Treasure 2: Book of Secrets|2007|Adventure|79.75
Neighboars 2|2016|Comedy|81.35
Neighbors|2014|Comedy|81.56
Nerve|2016|Adventure|77.93
Never Rarely Sometimes Always|2020|Drama|70.58
Never Surrender|2009|Action|22.15
New Police Story|2004|Action|74.80
New Year's Eve|2011|Romance|52.19
New York Minute|2004|Comedy|70.29
Next|2007|Thriller|84.52
Next Friday|2000|Comedy|76.89
Night At The Muesum|2006|Comedy|84.73
Night At The Muesum 2|2009|Comedy|81.51
Night At The Muesum 3|2014|Adventure|84.54
Night Crawler|2014|Drama|80.43
Night Swim|2024|Horror|58.63
Nim's Island|2008|Fantasy|65.25
No Escape|2015|Action|80.49
No Exit|2022|Thriller|76.73
No Reservations|2008|Romance|76.26
No Retreat, No Surrender|1986|Action|74.83
No Strings Attachted|2011|Comedy|79.28
Noah|2014|Adventure|60.96
Nocturnal Animals|2016|Drama|73.90
Non-Stop|2014|Action|80.24
Norbit|2007|Comedy|71.30
North Country|2006|Drama|84.00
Not Another Teen Movie|2001|Comedy|69.19
Nothing To Lose|1997|Comedy|73.25
Now You See Me|2013|Adventure|83.74
Now You See Me 2|2016|Adventure|82.85
Nowhere To Run|1993|Action|74.86
Numb|2008|Thriller|83.72
Nutty Proffessor 2|2000|Comedy|80.28
Oblivion|2012|Sci-Fi|70.91
Ocean's 8|2018|Comedy|79.76
Ocean's Eleven|2001|Action|80.18
Ocean's Thirteen|2007|Action|74.88
Ocean's Twelve|2004|Action|74.91
Oculus|2013|Horror|83.70
Office Space|1999|Comedy|79.76
Old Dogs|2009|Drama|71.89
Old School|2003|Comedy|80.06
Oldboy|2003|Drama|81.06
Oliver & Company|1988|Animation|78.03
Oliver Twist|2005|Drama|62.10
Olympus Has Fallen|2013|Action|84.02
Once Upon A Time in ... Hollywood|2019|Drama|72.26
One Flew Over The Cuckoo's Nest|1975|Drama|84.78
One For The Money|2012|Drama|63.99
One Hour Photo|2002|Thriller|81.88
One Missed Call|2008|Horror|84.39
Only Yesterday|1991|Anime|75.33
Onward|2020|Animation|83.40
Open Season|2006|Animation|79.22
Open Season 2|2008|Animation|75.28
Open Season 3|2010|Animation|71.73
Oppenheimer|2023|History|83.16
Ordinary Love|2019|Romance|60.23
Ouija|2014|Horror|70.78
Ouija: Origin of Evil|2016|Horror|66.38
Our Brand is Crisis|2015|Drama|47.08
Our Family Wedding|2010|Romance|49.82
Our Idiot Brother|2011|Comedy|79.76
Outcast|2014|Drama|52.67
Oxygène|2021|Thriller|84.88
Oz The Great & Powerful|2013|Fantasy|77.40
P.S. I Love You|2007|Romance|69.41
P2|2007|Thriller|80.29
Pacific Rim|2013|Adventure|82.07
Pacific Rim: Uprising|2018|Adventure|81.13
Palm Springs|2020|Romance|81.00
Pandorum|2009|Horror|49.63
Panic Room|2002|Thriller|84.44
Pan's Labyrinth|2006|Fantasy|68.79
Paper Towns|2015|Romance|37.40
Parasite|2019|Thriller|85.79
Parker|2013|Action|38.91
Passengers|2016|Sci-Fi|80.21
Paul|2011|Adventure|23.02
Paul Blart: Mall Cop|2009|Comedy|81.32
Paul Blart: Mall Cop 2|2015|Comedy|69.60
Pay it Forward|2000|Drama|81.62
Paycheck|2003|Sci-Fi|84.00
Pee Wee's Big Holiday|2016|Comedy|63.73
Penguins of Madagascars|2014|Animation|72.13
Percy Jackson & the Olympians|2010|Sci-Fi|32.21
Perfect Stranger|2007|Thriller|80.31
Perfect Strangers|2016|Drama|85.85
Pet Sematary|2019|Horror|81.93
Peter Rabbit|2018|Animation|80.04
Phone Booth|2003|Thriller|84.45
Pi|1998|Thriller|51.45
Pinocchio|1940|Animation|82.86
Pitch Black|2000|Action|14.96
Pixels|2015|Comedy|76.93
Plane|2023|Action|79.98
Planet 51|2009|Animation|71.16
Playing For Keeps|2012|Drama|37.66
Pokemon: Detective Pikatchu|2019|Comedy|63.78
Polaroid|2019|Horror|80.35
Police Academy|1984|Comedy|70.30
Police Academy 2|1985|Comedy|70.31
Police Academy 3|1986|Comedy|69.61
Police Academy 4|1987|Comedy|68.91
Police Academy 5|1988|Comedy|67.31
Police Academy 6|1989|Comedy|64.95
Police Academy 7|1994|Comedy|65.96
Police Story|1985|Action|80.22
Police Story 2|1988|Action|80.21
Police Story 3: Supercop|1992|Action|80.26
Police Story 4: First Strike|1996|Action|80.06
Ponyo|2008|Anime|85.61
Poor Things|2023|Sci-Fi|80.09
Portrait of a Lady on Fire|2019|Drama|79.93
Powder Blue|2009|Drama|68.93
Precious|2009|Drama|15.39
Predator|1987|Action|63.31
Predestination|2014|Thriller|82.36
Premonition|2007|Horror|71.95
Pretty Baby|1978|Romance|66.93
Pride & Prejudice & Zombies|2016|Fantasy|19.96
Priest|2011|Adventure|54.51
Primer|2005|Thriller|25.14
Prince of Persia|2011|Fantasy|80.35
Prisoners|2013|Crime|82.86
Project Power|2020|Action|77.71
Prom|2011|Romance|64.41
Psycho|1960|Thriller|80.00
Public Enimies|2009|Action|64.66
Pulp Fiction|1994|Action|83.31
Punisher: War Zone|2009|Action|79.74
Push|2009|Sci-Fi|78.96
Quantum of Solace|2008|Action|80.55
Quarantine|2008|Horror|69.75
Queen of The Desert|2015|Biography|38.31
Quills|2000|Drama|37.70
Quiz Show|2005|Thriller|55.87
R.I.P.D|2013|Comedy|66.00
Rabbit Hole|2011|Drama|71.43
Rain Man|1988|Drama|80.47
Ralph Breaks the Internet|2018|Animation|85.38
Rambo|2008|War|71.01
Rambo 2|1985|War|60.58
Rambo 3|1988|War|69.80
Rambo: Last Blood|2019|War|66.47
Ramona And Beezus|2010|Comedy|63.82
Rampage|2018|Adventure|80.17
Rango|2011|Animation|82.94
Rat Race|2007|Comedy|83.89
Ratatouille|2007|Animation|85.62
Raw Deal|1986|Action|69.90
Raya and The Last Dragon|2021|Animation|84.98
Ready Or Not|2019|Thriller|81.01
Ready Player One|2018|Sci-Fi|84.89
Real Steal|2011|Action|79.14
Rear Window|1954|Thriller|83.96
Rebound|2005|Comedy|73.30
Red|2010|Action|71.65
Red 2|2014|Action|67.10
Red Dragon|2002|Thriller|55.29
Red Eye|2005|Thriller|80.23
Red Lights|2012|Drama|55.03
Red Notice|2021|Comedy|81.01
Red Riding Hood|2011|Fantasy|80.02
Red Shoes and Seven Dwarfs|2019|Animation|81.14
Red Sparrow|2018|Drama|65.21
Red Tails|2012|Action|11.52
Redemption|2013|Action|45.36
Regression|2015|Thriller|36.81
Reign Over Me|2007|Drama|80.05
Remember Me|2010|Romance|78.94
Rememory|2017|Drama|60.29
Replicant|2001|Action|80.40
Repo Men|2010|Action|47.43
Requiem For A Dream|2000|Drama|85.14
Resident Evil|2002|Horror|79.77
Resident Evil : Afterlife|2010|Horror|80.17
Resident Evil : Apocalypse|2004|Horror|78.84
Resident Evil : Extintion|2007|Horror|78.86
Resident Evil : Retribution|2012|Horror|70.79
Resident Evil : The Final Chapter|2016|Horror|80.21
Revolutionary Road|2009|Drama|80.08
Revolver|2005|Action|29.59
Righteous Kill|2008|Action|72.70
Rings|2017|Horror|71.49
Rio|2011|Animation|70.18
Rio 2|2014|Animation|64.83
Rise of The Planet of Apes|2011|Action|82.45
Road House|2024|Action|81.73
Road Trip|2000|Comedy|65.00
Robin Hood|2010|Fantasy|62.56
Robocop|2014|Action|26.96
Robocop 1|1987|Action|15.82
Robocop 2|1990|Action|9.85
Robocop 3|1993|Action|16.04
Robots|2005|Animation|83.70
Rocky|1976|Action|80.04
Rocky Balboa|2006|Action|80.05
Rocky II|1979|Action|80.06
Rocky III|1982|Action|80.07
Rocky IV|1985|Action|80.07
Rocky V|1990|Action|80.07
Romeo + Juliet|1996|Romance|71.52
Room in Rome|2010|Romance|38.57
Rubber|2010|Horror|0.00
Ruby Sparks|2012|Romance|35.71
Run|2020|Thriller|85.49
Rush|2013|Action|60.79
Rush Hour|1998|Comedy|82.34
Rush Hour 2|2001|Comedy|80.39
Rush Hour 3|2007|Comedy|80.45
S.W.A.T|2003|Action|69.50
Sacrifice|2011|Action|64.70
Safe|2012|Action|66.55
Safe House|2012|Action|65.67
Salt|2010|Action|82.32
San Andreas|2015|Adventure|81.39
Sandy Wexler|2017|Comedy|79.29
Sausage Party|2016|Animation|83.75
Savages|2012|Action|59.70
Saving Private Ryan|1998|War|80.78
Saw|2004|Horror|84.86
Saw 2|2005|Horror|82.87
Saw 3|2006|Horror|82.76
Saw 4|2007|Horror|80.96
Saw 5|2008|Horror|82.63
Saw 6|2009|Horror|82.51
Saw 7|2010|Horror|82.42
Saw X|2023|Horror|84.83
Say It Isn't So|2001|Comedy|66.05
SBSP: Sponge on the Run|2021|Animation|80.01
Scarface|1983|Action|70.01
Scary Movie|2000|Comedy|80.15
Scary Movie 2|2001|Comedy|70.32
Scary Movie 3|2003|Comedy|68.71
Scary Movie 4|2006|Comedy|57.48
Scary Movie 5|2013|Comedy|43.89
Scary Stories to Tell in The Dark|2019|Horror|49.65
Scent of a Woman|1992|Drama|84.82
Schindler's List|1993|Drama|77.27
School of Rock|2003|Comedy|78.32
Scooby-Doo|2002|Adventure|69.05
Scream|1996|Horror|80.86
Scream 2|1997|Horror|79.52
Scream 3|2000|Horror|72.38
Scream 4|2011|Horror|70.80
Se7en|1995|Crime|82.97
Searching|2018|Thriller|85.09
Season of The Witch|2011|Fantasy|19.09
Second in Command|2006|Action|70.02
Secret Obsession|2019|Mystrey|76.12
Seed|2006|Horror|8.92
Seed of Chucky|2003|Horror|19.52
Self/less|2015|Sci-Fi|77.56
Serenity|2019|Drama|37.23
Serving Sara|2002|Comedy|70.33
Setup|2011|Action|63.36
Seven Pounds|2008|Drama|82.82
Shang-Chi and the Legend of the Ten Rings|2021|Comics|82.00
Shanghai Knights|2003|Comedy|80.34
Shanghai Noon|2000|Comedy|80.21
Shaun of The Dead|2004|Comedy|55.41
Shaun The Sheap Movie|2005|Animation|70.19
Shazam|2019|Comics|83.68
She Dies Tomorrow|2020|Drama|10.22
Sherlock Gnomes|2018|Animation|76.74
Sherlock Holmes|2010|Action|80.13
Sherlock Holmes 2|2011|Action|66.59
She's The Man|2006|Comedy|80.41
Shirley|2020|Drama|41.01
Shoot Em Up|2007|Action|4.32
Shooter|2007|Action|47.60
Shorts|2009|Adventure|69.06
Showtime|2002|Action|59.74
Shrek|2001|Animation|80.41
Shrek 2|2004|Animation|80.42
Shrek Forever After|2010|Animation|80.32
Shrek The Third|2007|Animation|80.46
Shutter|2004|Horror|82.92
Shutter Island|2010|Thriller|84.98
Sicario|2015|War|52.25
Silence|2016|Drama|62.14
Silenced|2011|Drama|84.59
Silent Hill|2006|Horror|79.53
Silent House|2013|Horror|62.77
Sin City|2005|Drama|38.05
Sing|2016|Animation|80.52
Sing 2|2021|Animation|80.54
Sinister|2013|Horror|70.81
Sinister 2|2015|Horror|28.27
Skateland|2010|Drama|30.46
Skinwalkers|2007|Horror|58.90
Skyfall|2012|Action|80.20
Skyscraper|2018|Action|83.06
Sleeping Beauty|2011|Drama|55.16
Slumdog Millionaire|2008|Drama|52.72
Smallfoot|2018|Animation|82.81
Smile 2|2024|Horror|84.02
Smiley|2012|Horror|8.44
Snitch|2013|Action|56.83
Snow White And The Huntman|2012|Adventure|70.12
Snowden|2016|Drama|72.25
Snowpiercer|2013|Adventure|84.64
Soldiers of Fortune|2012|War|48.46
Solitary Man|2010|Drama|70.59
Some kind of Beautiful|2015|Drama|70.60
Something Borrowed|2011|Romance|70.88
Somewhere|2010|Drama|66.26
Son of Rambo|2008|Adventure|35.27
Son of the Mask|2005|Adventure|43.41
Sonic the Hedgehog 2|2022|Comedy|82.63
Sonic The Hedgehog 3|2024|Adventure|83.76
Sonic: The Hedgedog|2020|Adventure|76.63
Soul|2020|Animation|82.84
Soul Survivors|2001|Horror|65.37
Source Code|2011|Thriller|83.97
Southpaw|2015|Action|82.46
Space Jam|1996|Adventure|56.06
Spanglish|2004|Romance|82.26
Speak|2004|Drama|79.76
Spectral|2016|Sci-Fi|71.56
Spectre|2015|Action|76.55
Speed|1994|Action|83.51
Speed 2: Crulse Control|1997|Action|77.73
Spell|2020|Thriller|83.73
Spider-Man|2002|Comics|83.93
Spider-Man 2|2004|Comics|84.33
Spider-Man 3|2007|Comics|84.57
Spider-Man Far From Home|2019|Comics|85.13
Spider-Man Homecoming|2017|Comics|84.05
Spider-Man Into the Spider Verse|2018|Comics|86.77
Spider-Man: Across the Spider-Verse|2023|Comics|91.00
Spider-Man: No Way Home|2021|Comics|90.00
Spies in Disguise|2019|Animation|82.47
Spinning Man|2018|Crime|81.19
Spirited Away|2001|Anime|85.35
Split|2017|Thriller|84.99
Spotlight|2015|Drama|79.44
Spring Breakers|2012|Romance|36.82
Spy|2015|Comedy|67.35
Spy Kids|2001|Comedy|75.58
Spy Kids 2|2002|Comedy|70.34
Spy Kids 3|2003|Comedy|71.31
Spy Kids 4|2011|Comedy|65.04
Stand Up Guys|2013|Drama|47.94
Star Wars Episode I|1977|Sci-Fi|32.65
Star Wars Episode II|1980|Sci-Fi|33.09
Star Wars Episode III|1985|Sci-Fi|33.52
Star Wars Episode IV|1990|Sci-Fi|33.96
Star Wars Episode V|1992|Sci-Fi|34.40
Star Wars Episode VI|1994|Sci-Fi|34.84
Starsky and Hutch|2004|Comedy|66.76
Stay Cool|2009|Romance|14.53
Step Brothers|2008|Comedy|81.53
Step Up|2006|Drama|60.33
Step Up 2|2008|Drama|38.87
Step Up 3|2010|Drama|13.24
Stolen|2012|Action|71.66
Stonehearst Asylum|2014|Thriller|82.37
Storks|2016|Animation|71.17
Stranger Than Fiction|2006|Comedy|84.66
Straw Dogs|2011|Horror|23.90
Street Dance|2010|Drama|37.27
Street Fighter|1994|Action|77.77
Street Fighter: The Legend of Chun Li|2009|Action|71.67
Street Kings|2008|Action|76.60
Stuck On You|2004|Comedy|80.15
Suburbicon|2017|Crime|82.60
Sucker Punch|2011|Sci-Fi|70.95
Sudden Death|1995|Action|79.74
Suicide Squad|2016|Comics|79.36
Sully|2016|Drama|83.11
Summer '03|2018|Drama|49.15
Super 8|2011|Sci-Fi|71.58
Superbad|2007|Comedy|71.81
Superhero Movie|2008|Comedy|63.86
Superman - Doomsday|2007|Animation|61.13
Superman Returns|2006|Action|74.94
Superman Vs. The Elite|2012|Animation|68.88
Superman/Batman Apocalypse|2010|Animation|72.14
Superstar|1999|Comedy|71.32
Surf's Up|2007|Animation|45.53
Surrogates|2009|Action|68.86
Swallow|2019|Drama|79.45
Sweet November|2001|Romance|83.21
Swiss Army Man|2016|Mystrey|70.85
Swordfish|2001|Action|52.88
Synchronic|2020|Thriller|48.28
Synecdoche New York|2008|Drama|55.82
Tag|2018|Comedy|84.31
Take Shelter|2011|Drama|78.51
Taken|2009|Action|80.79
Taken 2|2012|Action|80.72
Taken 3|2015|Action|74.97
Takers|2010|Action|12.81
Taking Lives|2004|Crime|73.70
Talladega Nights|2006|Comedy|81.58
Tammy|2014|Comedy|51.72
Tangled|2010|Animation|79.75
Tape 13|2014|Horror|0.50
Tarazan|1999|Animation|80.13
Tarazan & Jane|2002|Animation|53.22
Taxi|1998|Action|1.80
Taxi 2|2000|Action|1.45
Taxi 3|2003|Action|1.10
Taxi 4|2004|Action|0.90
Taxi 5|2018|Action|0.20
Ted|2012|Comedy|80.14
Ted 2|2015|Comedy|70.35
Teenage Mutant Ninja Turtles|2014|Adventure|83.38
Teenage Mutant Ninja Turtles 2|2016|Adventure|79.75
Tekken|2010|Fantasy|7.86
Tell Me Who I Am|2019|Biography|73.00
Tenet|2020|Thriller|82.28
Terminator 2: Judgement Day|1991|Action|85.77
Terminator 3: Rise of The Machines|2003|Action|80.97
Terminator Salvation|2009|Action|70.03
Terminator: Dark Fate|2019|Action|75.00
Terminator: Genysis|2015|Action|68.19
That's What I Am|2011|Comedy|60.12
The 40 Years Old Virgin|2005|Comedy|73.35
The Accidental Husband|2008|Comedy|79.30
The Accidental Spy|2001|Action|80.50
The Accountant|2016|Action|64.74
The Addam's Family|2019|Animation|70.20
The Addam's Family|1991|Fantasy|80.18
The Adjustment Bureau|2011|Thriller|82.02
The Adventure of Tintin|2011|Animation|72.15
The Aeronauts|2019|Adventure|81.08
The Aftermath|2019|Drama|49.17
The Age of Adaline|2013|Romance|74.35
The Aggression Scale|2012|Action|56.96
The Amazing Spider-Man|2012|Comics|80.99
The Amazing Spider-Man 2|2014|Comics|82.91
The American|2010|Action|60.84
The Angry Birds Movie|2016|Animation|84.55
The Angry Birds Movie 2|2019|Animation|84.09
The Aristocats|1970|Animation|72.16
The Art of War|2000|Action|77.79
The Art of War II|2008|Action|51.56
The Art of War III|2009|War|8.66
The Artist|2011|Romance|70.89
The A-Team|2010|War|38.65
The Avengers|2012|Comics|89.00
The Awakening|2010|Horror|20.40
The Babadook|2014|Horror|79.54
The Back-Up Plan|2010|Romance|72.40
The Backwoods|2007|Adventure|63.44
The Bad Lieutanant|2009|Crime|37.53
The Ballad of Jack and Rose|2005|Romance|52.83
The Bank Job|2008|Action|38.27
The Bar (El Bar)|2017|Thriller|85.89
The Batman|2022|Comics|85.82
The Beaver|2011|Drama|71.90
The Best Offer|2013|Mystrey|64.28
The BFG|2016|Fantasy|78.67
The Big Bang|2011|Action|69.04
The Big Short|2015|Drama|56.32
The Big Year|2011|Comedy|60.16
The Black Cauldron|1985|Animation|61.17
The Blind Side|2009|Drama|83.56
The Blue Lagoon|1980|Romance|71.99
The Body (El cuerpo)|2012|Crime|88.70
The Bone Collector|1999|Crime|79.76
The Book of Eli|2010|Thriller|74.40
The Boss Baby|2017|Animation|84.10
The Bounty Hunter|2010|Comedy|79.76
The Bourne Identity|2002|Action|77.80
The Bourne Legacy|2012|Action|69.51
The Bourne Supermacy|2004|Action|71.68
The Bourne Ultimatum|2007|Action|70.04
The Box|2009|Horror|70.82
The Boy|2016|Horror|80.62
The Boys Are Back|2009|Drama|10.45
The Brave One|2007|Action|54.25
The Break-Up|2006|Romance|71.53
The Butterfly Effect|2003|Thriller|83.98
The Butterfly Effect 2|2006|Thriller|70.97
The Butterfly Effect 3|2009|Thriller|65.50
The Bye Bye Man|2017|Horror|14.32
The Cabin in The Woods|2014|Horror|67.64
The Cable Guy|1996|Comedy|80.66
The Call|2013|Thriller|76.37
The Campaign|2012|Comedy|80.70
The Cat's Meow|2002|Drama|45.70
The Change Up|2011|Comedy|73.40
The Chaperone|2011|Comedy|71.33
The Chaser|2008|Thriller|70.98
The Child In Time|2017|Drama|79.76
The Choice|2016|Romance|83.59
The Chosen One|2010|Comedy|79.76
The Chronicles of Riddick|2004|Sci-Fi|8.99
The Clan|2015|Crime|80.31
The Cobbler|2014|Adventure|80.77
The Collector|2009|Horror|83.11
The Colony|2013|Thriller|79.92
The Commuter|2018|Action|80.43
The Confirmation|2016|Drama|30.90
The Conjuiring|2013|Horror|80.36
The Conjuiring 2|2016|Horror|83.64
The Conjuring 3|2021|Horror|59.81
The Core|2003|Disaster|78.44
The Crazies|2010|Thriller|72.02
The Croods|2013|Animation|83.76
The Croods New Age|2020|Animation|80.41
The Curious Case of Benjiman Button|2008|Drama|83.82
The Current War|2017|Drama|80.92
The Da Vinci Code|2006|Thriller|82.38
The Danish Girl|2015|Drama|75.72
The Dark Knight|2008|Action|85.04
The Dark Knight Rises|2013|Action|81.84
The Darkest Hour|2011|Thriller|24.34
The Day After Tomorrow|2004|Disaster|84.68
The Dead Don't Die|2019|Horror|37.36
The Debt|2010|Drama|70.61
The Decentants|2011|Drama|62.18
The Departed|2006|Drama|68.76
The Devil Wears Prada|2006|Adventure|54.64
The Devil's Advocate|1997|Mystrey|84.15
The Devil's Inside|2012|Horror|66.42
The Dictator|2012|Comedy|71.34
The Dilemma|2011|Comedy|76.96
The Disappearance of Haruhi Suzumiya|2010|Anime|70.21
The Divergent: Allegiant|2016|Fantasy|79.46
The Do-Over|2016|Comedy|50.61
The Duel|2016|Western|37.83
The Eagle|2011|Action|36.91
The Emoji Movie|2017|Animation|81.05
The Empty Man|2020|Thriller|43.33
The Equalizer|2014|Action|81.26
The Equalizer 2|2018|Action|83.62
The Equalizer 3|2023|Action|84.00
The Exorcism of Emily Rose|2005|Horror|69.76
The Expendables|2010|Action|82.68
The Expendables 2|2012|Action|83.36
The Expendables 3|2014|Action|82.69
The Experiment|2010|Action|81.55
The Eye|2008|Horror|81.34
The Family Plan|2023|Comedy|83.69
The Fantastic Four: First Steps|2025|Comics|83.92
The Fast & Furious|2001|Action|82.57
The Fast and the Furious: Tokyo Draft|2006|Action|69.52
The Fate of the Furious|2017|Action|82.82
The Fault in Our Stars|2014|Romance|82.27
The Firm|1993|Thriller|72.55
The First Purge|2018|Thriller|79.71
The Flash|2023|Comics|84.98
The Flowers of War|2011|History|81.99
The Forbidden Kingdom|2008|Action|82.70
The Foreigner|2017|Action|81.28
The Founder|2016|Drama|82.61
The Fourth Kind|2009|Thriller|65.54
The Game|1997|Thriller|80.44
The Game Plan|2007|Comedy|72.23
The Gift|2015|Thriller|81.87
The Gingerdead Man|2005|Horror|3.21
The Girl Next Door|2004|Comedy|73.45
The Girl Who Leapt Through Time|2006|Anime|84.11
The Girl With The Dragon Tatto|2011|Action|57.09
The Glass Castle|2017|Drama|69.69
The Godfather|1972|Action|87.02
The Godfather II|1974|Action|84.53
The Godfather III|1990|Action|80.53
The Golden Compass|2007|Fantasy|67.56
The Good Dinosour|2015|Animation|79.75
The Good Girl|2002|Drama|77.31
The Good Liar|2019|Drama|41.00
The Goods|2009|Comedy|8.08
The Great Wall|2016|War|63.15
The Green Hornet|2011|Adventure|53.09
The Green Mile|1999|Drama|90.41
The Grey|2012|Action|72.07
The Grudge|2004|Horror|82.35
The Grudge 2|2006|Horror|76.03
The Grudge 3|2009|Horror|79.55
The Guilty|2018|Crime|80.01
The Hangover|2009|Comedy|85.00
The Hangover 2|2011|Comedy|81.40
The Hangover 3|2013|Comedy|82.41
The Hateful Eight|2015|Western|80.48
The Heartbreak Kid|2007|Comedy|79.76
The Help|2011|Drama|80.35
The Hidden Face|2011|Thriller|84.07
The Hit List|2011|Action|72.75
The Hitcher|2007|Horror|67.68
The Hitman's Bodyguard|2017|Action|80.08
The Hobbit: An Unexpected Journey|2012|Fantasy|84.38
The Hobbit: The Disolation of Smaug|2013|Fantasy|84.21
The Hobbit: TheBattle of TheFiveArmies|2014|Fantasy|87.77
The Holdovers|2023|Drama|60.93
The Hole in The Ground|2019|Horror|65.42
The Holiday|2006|Comedy|82.15
The House That Jack Built|2018|Crime|82.98
The Hunchback of Notre Dame|1996|Animation|78.05
The Hunchback of Notre Dame 2|2002|Animation|65.84
The Hunger Games|2012|Fantasy|83.94
The Hunger Games 2|2013|Fantasy|83.57
The Hunger Games 3|2014|Fantasy|81.83
The Hunger Games 4|2015|Fantasy|81.85
The Hunger Games: Ballad of Songbirds & Snakes|2023|Adventure|83.71
The Hungover Games|2014|Comedy|72.24
The Hunt|2020|Thriller|79.77
The Hurt Locker|2008|Thriller|79.77
The Imitation Game|2014|Drama|82.24
The Impossible|2012|Adventure|70.13
The Incredible Hulk|2008|Comics|79.76
The Incredibles|2004|Animation|81.26
The Innkeepers|2011|Horror|78.87
The International|2009|Action|79.74
The Internship|2013|Comedy|69.62
The Intruders|2015|Horror|69.38
The Invasion|2007|Thriller|79.00
The Invisible Guest|2017|Thriller|86.99
The Invisible Man|2020|Thriller|80.49
The Invitation|2015|Thriller|80.00
The Irishman|2019|Drama|84.20
The Iron Lady|2011|Drama|62.22
The Italian Job|2003|Action|52.40
The Jacket|2005|Thriller|82.29
The Judge|2014|Drama|85.36
The Jungle Book|2016|Fantasy|83.19
The Karate Kid|2010|Action|66.63
The Keeper of Lost Causes|2013|Thriller|81.90
The Killing of A Scared Deer|2017|Thriller|83.60
The King's Speech|2010|Drama|80.39
The Kissing Booth|2018|Romance|71.54
The Lake House|2006|Romance|84.88
The Last House On The Left|2009|Horror|81.92
The Last of The Mohicans|1992|History|70.69
The Last Seduction|1994|Drama|62.26
The Last Shot|2004|Comedy|79.76
The Last Song|2010|Romance|69.42
The Last Stand|2013|Action|72.80
The Last Survivors|2014|War|36.15
The Last Witch Hunter|2015|Action|63.40
The Layover|2017|Romance|62.98
The Ledge|2011|Drama|23.46
The Legend of Zorro|2005|Action|82.04
The Lie|2018|Thriller|83.99
The Life of David Gale|2003|Crime|79.76
The Lighthouse|2019|Thriller|70.99
The Lion King|1994|Animation|82.08
The Lion King|2019|Fantasy|83.20
The Lion King 1&1/2|2004|Animation|79.23
The Lion King 2|1998|Animation|76.77
The Lobster|2015|Thriller|81.38
The Lodge|2020|Thriller|83.33
The Loft|2014|Thriller|83.85
The Lone Ranger|2013|Action|37.44
The Long Halloween Part 1|2021|Comics|82.59
The Long Halloween Part 2|2021|Comics|81.98
The Longest Ride|2015|Romance|76.28
The Longest Yard|2005|Comedy|80.40
The Lorax|2012|Animation|75.30
The Losers|2010|Action|59.79
The Love Guru|2008|Romance|68.81
The Lovely Bones|2009|Thriller|80.19
The Lucky One|2012|Drama|70.62
The Machinist|2004|Thriller|84.69
The Magnificent Seven|2016|Action|83.26
The Majestic|2004|Drama|85.75
The Man From Earth|2007|Drama|85.86
The Man From Earth Holocene|2017|Drama|81.98
The Man From The U.N.C.L.E|2015|Action|46.22
The Man in The Iron Mask|1998|Drama|78.53
The Marine|2006|War|76.48
The Marine 2|2009|War|46.05
The Martian|2015|Sci-Fi|83.48
The Marvels|2023|Comics|81.00
The Mask|1994|Comedy|84.67
The Mask of Zorro|1998|Action|84.08
The Matrix|1999|Sci-Fi|86.83
The Matrix 2|2003|Sci-Fi|85.97
The Matrix 3|2003|Sci-Fi|80.99
The Matrix Ressurections|2021|Sci-Fi|77.99
The Maze Runner|2014|Adventure|85.42
The Mechanic|2011|Action|60.88
The Medallion|2003|Action|82.01
The Meg|2018|Adventure|75.11
The Menu|2022|Thriller|80.61
The Merchant of Venice|2004|Drama|80.27
The Mist|2007|Thriller|85.92
The Mitchells vs. The Machines|2021|Animation|84.51
The Model|2016|Drama|78.55
The Mule|2018|Drama|78.57
The Mummy|2017|Horror|62.81
The Muppets|2011|Comedy|66.13
The Naked Gun|1988|Comedy|73.50
The Naked Gun 2: The Smell of Fear|1991|Comedy|71.35
The Naked Gun 3: The Final Insult|1994|Comedy|71.82
The Nanny Diaries|2007|Comedy|75.61
The Neighbor|2019|Drama|81.10
The Nest|2020|Drama|50.22
The New Mutants|2020|Horror|80.40
The New World|2006|Drama|62.31
The Next Three Days|2010|Action|71.69
The Night House|2021|Thriller|47.51
The Nightmare Before Christmas|1993|Animation|80.02
The Ninth Gate|1999|Drama|71.91
The Normal Heart|2014|Drama|82.25
The Notebook|2005|Romance|82.18
The Number 23|2007|Crime|84.02
The Nun|2018|Horror|45.19
The Nutcracker and the Four Realms|2018|Fantasy|72.31
The Nutty Proffessor|1996|Comedy|82.16
The Offering|2016|Horror|26.09
The Old Guard|2020|Action|78.98
The Omen|2006|Horror|64.24
The One|2001|Action|77.82
The Other Boleyn Girl|2008|Drama|72.27
The Other Guys|2010|Comedy|75.36
The Other Man|2009|Drama|75.75
The Other Side of The Door|2016|Horror|49.69
The Other Woman|2014|Comedy|70.36
The Others|2001|Horror|86.79
The Pacifier|2005|Comedy|81.07
The Peanuts Movie|2015|Animation|50.50
The Perfect Host|2011|Thriller|76.40
The Perfection|2018|Mystrey|79.77
The Pianist|2002|War|83.50
The Pink Panther|2006|Comedy|78.34
The Pink Panther 2|2009|Comedy|76.99
The Platform|2019|Thriller|85.93
The Platform 2|2024|Thriller|81.21
The Polar Express|2004|Animation|80.83
The Possesion|2012|Horror|47.25
The Predator|2018|Action|50.19
The Prestige|2006|Mystrey|84.40
The Princess And The Frog|2009|Animation|80.00
The Princess Diaries|2001|Comedy|71.36
The Princess Diaries 2|2004|Comedy|66.17
The Prodigy|2019|Thriller|80.36
The Proposal|2009|Comedy|68.92
The Punisher|2004|Action|69.53
The Purge|2013|Thriller|83.86
The Purge : Anarchy|2014|Thriller|80.64
The Purge: Election Year|2016|Thriller|81.48
The Pursuit of Happyness|2006|Drama|84.93
The Quest|1996|Action|77.84
The Quiet|2005|Thriller|80.22
The Reader|2009|Drama|68.94
The Realm|2018|Drama|25.65
The Rebound|2009|Comedy|66.80
The Rental|2020|Thriller|72.35
The Replacements|2000|Comedy|66.84
The Resident|2011|Horror|68.95
The Revenant|2015|Drama|78.59
The Ridiculous 6|2015|Comedy|79.31
The Ring|2002|Horror|83.46
The Ring Two|2005|Horror|79.56
The Rite|2011|Thriller|63.10
The Road|2009|Thriller|79.98
The Room|2019|Thriller|83.34
The Roommate|2011|Thriller|80.02
The Ruins|2008|Horror|80.14
The Runaways|2010|Drama|38.09
The Running Man|1987|Action|79.15
The Samaritan|2012|Action|30.02
The Secret Life of Pets|2016|Animation|84.65
The Secret Life of Pets 2|2019|Animation|80.91
The Secret Life of Words|2012|Drama|62.35
The Shape of Water|2017|Drama|81.33
The Shawshank Redemption|1994|Drama|81.09
The Shepherd: Border Patrol|2008|Action|80.14
The Shining|1980|Thriller|85.88
The Shunning|2011|Drama|58.12
The Silence|2019|Adventure|79.98
The Silence of The Lambs|1991|Crime|78.40
The Simpsons Movie|2007|Animation|80.87
The Sisterhood of the Traveling Pants|2005|Drama|67.47
The Sixth Sence|1999|Thriller|83.49
The Skeleton Key|2005|Horror|79.57
The Slammin Salmon|2009|Comedy|20.84
The Smurfs|2011|Fantasy|73.95
The Smurfs 2|2013|Fantasy|75.84
The Social Network|2010|Drama|64.03
The Son of No One|2011|Drama|62.39
The Sorcerer's Apprentice|2010|Fantasy|38.14
The Spiderwick Chronicles|2008|Adventure|68.87
The Spongebob SquarePants Movie|2015|Animation|69.09
The Spy Next Door|2010|Comedy|79.32
The Stepfather|2009|Thriller|83.16
The Stranger: Chapter 1|2024|Thriller|84.02
The Strangers|2008|Thriller|79.01
The Strangers: Prey At Night|2018|Thriller|71.00
The Super Mario Bros. Movie|2023|Animation|84.22
The Sword in The Stone|1963|Animation|79.24
The Taking of Pelham 123|2009|Action|72.08
The Tempest|2011|Adventure|4.18
The Terminal|2004|Drama|86.58
The Terminator|1984|Action|81.50
The Theory of Everything|2014|Drama|80.33
The Three Musketeers|2011|History|72.32
The Three Stooges|2012|Comedy|77.02
The Ticket|2016|Drama|62.43
The Time Traveler's Wife|2009|Adventure|66.68
The Tortured|2012|Horror|49.77
The Tourist|2010|Drama|21.27
The Tournament|2009|Action|84.70
The Tower|2013|Disaster|84.93
The Town|2010|Action|75.02
The Transporter|2002|Action|82.05
The Tree of The Life|2011|Drama|67.52
The Trouble With Bliss|2012|Comedy|8.11
The Truman Show|1998|Drama|92.92
The Tuxedo|2002|Comedy|80.75
The Twilight Saga: Breaking Dawn Part 1|2011|Horror|79.58
The Twilight Saga: Breaking Dawn Part 2|2012|Horror|78.88
The Twilight Saga: Eclipse|2010|Horror|76.06
The Twilight Saga: New Moon|2009|Horror|70.83
The Ugly Truth|2009|Romance|72.00
The Unborn|2009|Horror|79.59
The Unforgivable|2021|Crime|82.99
The Vault|2017|Horror|51.14
The Virgin Suicides|2000|Drama|69.28
The Vow|2012|Romance|82.80
The Wailing|2016|Horror|80.06
The Wall|2017|Action|70.05
The War with Grandpa|2025|Comedy|83.72
The Ward|2011|Thriller|84.62
The Way Back|2010|Drama|70.63
The Wedding Singer|1998|Romance|72.41
The Whole Nine Yards|2000|Comedy|81.31
The Whole Ten Yards|2004|Comedy|70.37
The Wicker Man|2006|Horror|3.43
The Wild|2006|Animation|79.25
The Wild Robot|2024|Animation|87.00
The Willoughbys|2020|Animation|56.52
The Witch|2016|Horror|2.01
The Wizard of Oz|1939|Fantasy|58.51
The Wolfman|2010|Horror|37.01
The Wolverine|2013|Comics|80.94
The Woman in the Window|1944|Crime|83.80
Thick As Thieves|2009|Mystrey|78.89
Think Like a Man|2012|Comedy|75.64
Thirteen Ghosts|2001|Horror|74.20
This Is It|2009|Biography|48.63
Thor|2011|Comics|84.19
Thor : The Dark World|2013|Comics|81.78
Thor: Ragnarok|2017|Comics|85.96
Three To Tango|1999|Romance|72.01
Tideland|2005|Adventure|61.00
Time Lapse|2014|Thriller|82.30
Timecop|1994|Action|72.09
Tinker Tailor Soldier Spy|2011|War|1.97
Titanic|1997|Romance|85.80
Titanic II|2010|Drama|2.19
TMNT|2007|Animation|78.07
To Steal From a Thief|2016|Action|82.06
Tokyo Story|1953|Drama|68.77
Tolkien|2019|Drama|69.70
Tom And Jerry|2021|Adventure|65.90
Tomb Raider|2018|Adventure|71.72
Tomorrowland|2015|Sci-Fi|66.97
Tooth Fairy|2010|Comedy|70.38
Totall Recall|2011|Action|71.70
Tower Heist|2011|Comedy|61.63
Toy Story|1995|Animation|85.11
Toy Story 2|1999|Animation|84.27
Toy Story 3|2010|Animation|83.41
Toy Story 4|2019|Animation|83.65
Tracers|2015|Action|1.45
Train To Busan|2016|Horror|83.30
Training Day|2001|Action|80.00
Trainwreck|2015|Comedy|16.44
Transcendence|2014|Sci-Fi|80.07
Transporter 2|2005|Action|75.08
Transporter 3|2008|Action|42.93
Treasure Planet|2002|Animation|82.97
Trespass|2011|Thriller|82.65
Trespass Against Us|2016|Drama|62.47
Triangle|2009|Horror|85.90
Triple 9|2016|Action|55.93
Triple Frontier|2019|Action|79.74
Trolls|2016|Animation|79.75
Trolls Holiday|2017|Animation|61.21
Tron Legacy|2010|Sci-Fi|63.02
Tropic Thunder|2008|Comedy|39.00
Troy|2004|Action|80.38
True Grit|2010|Drama|75.78
True Lies|1994|Action|71.71
True Romance|1993|Romance|67.62
True Story|2015|Drama|80.42
TrueMemoirs ofAnInternationalAssassin|2016|Comedy|71.37
Trust|2010|Drama|80.04
Truth or Dare|2018|Horror|76.09
Tully|2018|Drama|75.81
Turbo|2013|Animation|78.09
Turning Red|2022|Animation|82.90
Twilight|2008|Horror|80.46
Twisted|2004|Thriller|74.50
Twister|1990|Disaster|71.85
Unbreakable|2000|Mystrey|83.13
Unbroken|2014|War|64.45
Uncharted|2022|Adventure|82.93
Uncle Buck|1989|Comedy|73.55
Uncut Gems|2019|Drama|72.28
Undisputed|2002|Action|79.74
Undisputed 2|2006|Action|80.39
Undisputed 3|2010|Action|80.18
Unfaithful|2002|Drama|69.71
Unforgettable|2017|Thriller|79.02
Unfriended|2014|Horror|81.65
Unit 7|2012|Action|68.23
Universal Soldier|1992|War|80.12
Universal Soldier 2|1999|War|69.81
Universal Soldier 3|2012|War|71.02
Universal Soldier 4|2012|War|59.29
Unknown|2011|Action|65.71
Unlocked|2017|Action|77.86
Unsane|2018|Thriller|83.23
Unstoppable|2010|Action|79.74
Up|2009|Animation|87.88
Upgrade|2018|Thriller|82.19
Upside Down|2012|Fantasy|75.95
Us|2019|Thriller|83.99
V For Vendetta|2005|Thriller|79.99
Vacancy|2007|Thriller|80.44
Vacation|2015|Comedy|84.74
Valkyrie|2008|War|68.85
Vampire Suck|2010|Comedy|10.23
Vamps|2012|Horror|49.80
Van Helsing|2004|Fantasy|71.44
Vanilla Sky|2001|Mystrey|80.51
Vanishing on The 7th Street|2010|Thriller|76.45
Vantage Point|2004|Action|85.37
Velvet Buzzsaw|2019|Drama|72.29
Venom|2018|Comics|85.06
Venom: Let There Be Carnage|2021|Comics|84.00
Venom: The Last Dance|2024|Comics|82.92
Vice|2015|Sci-Fi|5.39
Victor Frankenstein|2015|Adventure|71.11
Vivarium|2020|Thriller|84.81
Vivo|2021|Animation|84.95
Wag The Dog|1997|Comedy|60.21
Wakefield|2016|Drama|81.81
Wall Street: Money Never Sleeps|2010|Drama|53.04
Wall-e|2008|Animation|83.66
Walled In|2009|Horror|77.53
Wanted|2008|Action|80.59
War|2007|Action|79.74
War of The Planet of The Apes|2017|Action|79.74
War of the Worlds|2005|Action|80.44
Warcraft|2016|Adventure|84.25
Warm Bodies|2013|Romance|71.55
Watcher|2022|Thriller|78.52
Watchmen|2008|Comics|38.01
Watchmen: Chapter 1|2024|Comics|69.56
We Bought A Zoo|2011|Comedy|75.67
Weathering With You|2019|Anime|82.95
Wedding Crashers|2005|Comedy|75.70
Welcome Home Roscoe Jenkins|2008|Comedy|73.60
We're The Millers|2013|Comedy|83.90
Werewolf By Night|2022|Comics|81.00
Wet Hot American Summer|2002|Comedy|38.40
What A Girl Wants|2003|Comedy|60.25
What Happened To Monday|2017|Mystrey|84.24
What Happens in Vegas|2008|Comedy|69.20
What to Expect when you're Expecting|2012|Comedy|73.65
What's the Worst That Could Happen?|2001|Comedy|78.36
When a Stranger Calls|2008|Thriller|80.29
When Angels Sleep|2018|Crime|81.57
When in Rome|2010|Romance|70.90
Where the Wild Things Are|2009|Mystrey|64.32
Whip It|2009|Drama|62.52
Whiskey Tango Foxtrot|2016|Comedy|4.85
White Bird in A Blizzard|2014|Drama|50.87
White Chicks|2004|Comedy|81.25
White House Down|2013|Action|84.63
White Noise|2005|Horror|79.77
White Noise 2: The Light|2007|Horror|79.77
Who Am I|2014|Mystrey|84.41
Why Him?|2016|Comedy|81.46
Wild Hogs|2007|Comedy|83.67
Wild Wild West|1999|Drama|70.64
Wimbledon|2004|Romance|72.45
Winchester|2018|Horror|80.45
Wind River|2017|Drama|58.25
Winter's Bone|2010|Drama|77.34
Wishmaster|1997|Horror|38.18
Wishmaster 2|1999|Horror|8.50
Wishmaster 3|2001|Horror|18.65
Wishmaster 4|2002|Horror|13.46
Wonder|2017|Drama|80.22
Wonder Park|2019|Animation|82.14
Wonder Woman|2009|Animation|47.77
Wonder Woman|2017|Comics|81.75
Wonder Woman 1984|2020|Comics|77.49
World War Z|2013|Disaster|80.67
World's Greatest Dad|2010|Drama|80.11
Wrath of the Titans|2012|Fantasy|49.55
Wreck it Ralph|2012|Animation|84.28
Wrecked|2010|Thriller|82.52
Wrong Turn|2003|Horror|72.39
Wrong Turn 2|2007|Horror|69.77
Wrong Turn 3|2009|Horror|55.80
Wrong Turn 4|2011|Horror|53.61
Wrong Turn 5|2013|Horror|65.46
Wrong Turn 6|2014|Horror|56.58
X-Men|2000|Comics|84.58
X-Men 2|2003|Comics|84.34
X-Men: Apocalypse|2016|Comics|84.48
X-Men: Dark Phoenix|2019|Comics|84.06
X-Men: First Class|2011|Comics|84.13
X-Men: Origin|2009|Comics|85.44
X-Men: The Last Stand|2006|Comics|85.02
XXX|2002|Action|70.06
xXx : Return of Xander Cage|2017|Action|54.38
XXX 2|2005|Action|50.22
Year One|2009|Comedy|61.68
YellowBrickRoad|2010|Horror|51.19
Yes Man|2008|Comedy|80.76
Yes, God, Yes|2019|Drama|58.38
Yogi Bear|2010|Animation|61.26
You Don't Mess With The Zohan|2008|Comedy|71.38
You Will Kill|2015|Horror|70.84
You, Me and Dupree|2006|Drama|72.30
Your Highness|2011|History|64.07
Your Name|2016|Anime|81.77
Zero Dark Thirty|2012|War|11.31
Zipper|2015|Drama|49.18
Zookeeper|2011|Comedy|79.33
Zoolander|2001|Comedy|57.61
Zoolander 2|2016|Comedy|51.77
Zoom|2006|Adventure|69.07
Zootopia|2016|Animation|84.29`;

async function main() {
  const lines = rawData.trim().split('\n').filter(l => l.trim());
  const movies = [];
  let skipped = 0;

  for (const line of lines) {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 4) continue;
    
    const [title, year, genre, ratingStr] = parts;
    const rating = parseFloat(ratingStr);
    
    // Skip Short films and non-numeric ratings
    if (isNaN(rating)) {
      console.log(`  Skipping: ${title} (${genre} - no numeric rating)`);
      skipped++;
      continue;
    }
    
    movies.push({ title, year, genre, rating });
  }

  console.log(`Total movies to add: ${movies.length} (skipped: ${skipped})`);
  
  let added = 0;
  let updated = 0;
  let duplicates = 0;
  let failed = 0;

  const BATCH = 5;
  for (let i = 0; i < movies.length; i += BATCH) {
    const batch = movies.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (movie) => {
        try {
          // First check if movie exists
          const searchRes = await fetch(`${API_BASE}?search=${encodeURIComponent(movie.title)}&type=movie`);
          const searchData = await searchRes.json();
          const existing = searchData.items?.find(
            item => item.title.toLowerCase() === movie.title.toLowerCase() && item.year === movie.year
          );

          if (existing) {
            if (existing.userRating != null) {
              duplicates++;
              return { status: 'duplicate', title: movie.title };
            } else {
              // Update existing unrated movie with rating
              const updateRes = await fetch(`${API_BASE}/${existing.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userRating: movie.rating, genres: movie.genre })
              });
              if (updateRes.ok) {
                updated++;
                return { status: 'updated', title: movie.title };
              } else {
                failed++;
                return { status: 'failed', title: movie.title };
              }
            }
          }

          // Create new movie
          const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: movie.title,
              year: movie.year,
              type: 'movie',
              genres: movie.genre,
              userRating: movie.rating
            })
          });

          if (res.ok) {
            added++;
            return { status: 'added', title: movie.title };
          } else if (res.status === 409) {
            // Duplicate - try to update
            const errData = await res.json();
            const existingItem = errData.existingItem;
            if (existingItem && existingItem.userRating == null) {
              const updateRes = await fetch(`${API_BASE}/${existingItem.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userRating: movie.rating, genres: movie.genre })
              });
              if (updateRes.ok) {
                updated++;
                return { status: 'updated', title: movie.title };
              }
            }
            duplicates++;
            return { status: 'duplicate', title: movie.title };
          } else {
            failed++;
            return { status: 'failed', title: movie.title, statusText: res.statusText };
          }
        } catch (err) {
          failed++;
          return { status: 'error', title: movie.title, error: err.message };
        }
      })
    );

    const progress = Math.min(i + BATCH, movies.length);
    if (progress % 50 === 0 || progress >= movies.length) {
      console.log(`Progress: ${progress}/${movies.length} | Added: ${added} | Updated: ${updated} | Duplicates: ${duplicates} | Failed: ${failed}`);
    }
  }

  console.log(`\n=== FINAL RESULTS ===`);
  console.log(`Added: ${added}`);
  console.log(`Updated: ${updated}`);
  console.log(`Duplicates: ${duplicates}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped (Short): ${skipped}`);

  // Verify total
  console.log('\nVerifying...');
  const ratedRes = await fetch(`${API_BASE}?hasRating=true&type=movie`);
  const ratedData = await ratedRes.json();
  console.log(`Total rated movies now: ${ratedData.items?.length || 'unknown'}`);
}

main().catch(console.error);
