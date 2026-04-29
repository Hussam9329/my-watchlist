/**
 * Batch import K-Z movies to RATINGS ONLY
 * These will have userRating set so they only appear in "تقييماتي" tab
 * Run: node scripts/add-ratings-batch3.js
 */

const API_BASE = 'https://my-watchlist-rho.vercel.app/api/watchlist'

const rawData = `Kung Fu Yoga\tAction\t2017\t69.88
La La Land\tRomance\t2016\t74.25
La Sociedad de la Nieve\tAdventure\t2023\t84.93
Land of The Lost\tAdventure\t2009\t83.07
Last Holiday\tComedy\t2006\t80.25
Laura\tCrime\t1944\t77.05
Law Abiding Citizen\tAction\t2009\t80.51
Leathal Weapon\tComedy\t1987\t83.27
Leathal Weapon 2\tComedy\t1989\t82.09
Leathal Weapon 3\tComedy\t1992\t81.41
Leathal Weapon 4\tComedy\t1992\t80.48
Leave the World Behind\tThriller\t2023\t81.74
Left Behind\tDrama\t2014\t73.85
Legend\tDrama\t2015\t37.18
Legendary\tAction\t2010\t56.70
Legion\tFantasy\t2010\t66.30
Leo\tAnimation\t2023\t83.90
Let Me In\tHorror\t2010\t62.73
Let's Be Cops\tComedy\t2014\t79.75
Letters To Juliet\tRomance\t2010\t52.14
Level 16\tThriller\t2018\t80.33
Liar Liar\tComedy\t1997\t84.46
Life\tAdventure\t2017\t81.18
Life As We Know It\tComedy\t2010\t60.04
Life or Something Like it\tComedy\t2002\t80.30
Lifted\tShort\t2007\tShort
Lights Out\tHorror\t2016\t80.20
Limitless\tSci-Fi\t2011\t80.09
Lion\tDrama\t2016\t83.01
Lionheart\tAction\t1990\t74.74
Little Fockers\tComedy\t2010\t79.75
Little Man\tComedy\t2000\t79.76
Little Miss Sunshine\tComedy\t2006\t68.57
Little Nicky\tComedy\t2000\t76.86
Little Women\tDrama\t2019\t82.49
Live Free or Die Hard\tAction\t2007\t69.89
Lockout\tAction\t2012\t9.56
Logan\tComics\t2017\t83.79
Lolita\tDrama\t1997\t71.88
London Has Fallen\tAction\t2016\t79.74
Long Shot\tComedy\t2019\t78.26
Long Weekend\tThriller\t2008\t83.04
Looper\tThriller\t2012\t63.06
Lord of The Rings: Fellowship of The Ring\tFantasy\t2001\t83.12
Lord of The Rings: The Return of The King\tAdventure\t2003\t82.71
Lord of The Rings: The Two Towers\tFantasy\t2002\t80.56
Lord of War\tAction\t2005\t77.69
Love And Other Drugs\tDrama\t2010\t70.53
Love Story\tRomance\t1970\t68.97
Loving\tDrama\t2016\t70.54
Luca\tAnimation\t2021\t84.79
Luck\tAnimation\t2022\t84.65
Lucky Number Slevin\tDrama\t2006\t80.26
Lucky Numbers\tComedy\t2000\t71.28
Lucy\tAction\t2014\t77.70
Lullaby\tDrama\t2014\t71.42
M3GAN\tHorror\t2022\t76.88
Ma\tThriller\t2019\t79.70
Machete\tAction\t2010\t38.70
Machine Gun Preacher\tAction\t2011\t69.49
Mad Max\tAction\t2015\t82.67
Mad Money\tComedy\t2008\t80.16
Madagascar\tAnimation\t2006\t80.93
Madagascar 2\tAnimation\t2008\t76.71
Madagascar 3\tAnimation\t2012\t79.21
Madame Web\tComics\t2024\t81.63
Made of Honor\tRomance\t2008\t79.63
Madison Country\tHorror\t2011\t58.77
Magamind\tAnimation\t2010\t80.95
Maggie\tHorror\t2015\t36.97
Malcolm X\tDrama\t1992\t79.43
Maleficent\tFantasy\t2014\t81.43
Maleficent: Mistress of Evil\tFantasy\t2019\t81.63
Malena\tDrama\t2000\t7.74
Mama\tHorror\t2013\t82.90
Mamma Mia\tRomance\t2008\t38.22
Man of Steel\tComics\t2014\t79.35
Man On Fire\tAction\t2004\t81.49
Man On The Moon\tComedy\t1999\t81.66
Management\tComedy\t2009\t75.56
Manchester By The Sea\tDrama\t2016\t70.55
Manhattan Night\tThriller\t2016\t67.94
Marley & Me\tDrama\t2008\t79.76
Marriage Story\tDrama\t2019\t85.26
Mars Needs Moms\tSci-Fi\t2011\t49.88
Mary Poppins Return\tFantasy\t2018\t80.25
Matchstick Men\tDrama\t2003\t70.56
Maze Runner: The Death Cure\tAdventure\t2018\t83.62
Maze Runner: The Scorch Trials\tAdventure\t2015\t77.90
Me Before You\tRomance\t2016\t81.71
Me Myself & Irene\tComedy\t2000\t81.67
Mean Girls\tComedy\t2004\t68.61
Mean Machine\tDrama\t2001\t69.68
Meet Dave\tComedy\t2008\t78.28
Meet The Fockers\tComedy\t2004\t79.27
Meet The Parents\tComedy\t2000\t81.08
Meet The Spartans\tComedy\t2008\t68.90
Meeting Evil\tHorror\t2012\t78.82
Melancholia\tFantasy\t2011\t37.75
Memento\tThriller\t2000\t83.84
Men In Black\tAdventure\t1997\t77.92
Men In Black 2\tAdventure\t2002\t71.09
Men In Black 3\tAdventure\t2012\t71.10
Men in Black: International\tSci-Fi\t2019\t78.95
Men of Honor\tAction\t2000\t80.37
Midnight in Paris\tDrama\t2011\t70.57
Midway\tAction\t2019\t84.15
Mike & Dave Need Wdding Dates\tComedy\t2016\t63.69
Minions\tAnimation\t2015\t84.71
Minority Report\tSci-Fi\t2002\t80.12
Mirage\tThriller\t2018\t85.78
Mirror Mirror\tRomance\t2012\t69.40
Mirrors\tHorror\t2008\t83.02
Mirrors 2\tHorror\t2010\t71.48
Misery\tThriller\t1990\t85.57
Miss Congeniality\tComedy\t2000\t80.23
Miss Congeniality 2\tComedy\t2005\t61.59
Miss Peregrine's Home for Children\tFantasy\t2016\t75.92
Miss Sloane\tDrama\t2016\t62.05
Missing Link\tAnimation\t2019\t83.08
Mission Impossible\tAction\t1996\t80.53
Mission Impossible 2\tAction\t2000\t82.56
Mission Impossible 3\tAction\t2006\t80.52
Mission Impossible: Ghost Protocol\tAction\t2011\t80.43
Moana\tAnimation\t2016\t81.52
Moana 2\tAnimation\t2024\t78.98
Money Talks\tAction\t1997\t52.35
Monster\tDrama\t2003\t83.61
Monster House\tAnimation\t2006\t70.17
Monster Hunter\tAdventure\t2020\t77.78
Monsters Inc.\tAnimation\t2001\t82.40
Monsters University\tAnimation\t2013\t82.72
Monte Carlo\tRomance\t2011\t69.79
Moon\tThriller\t2009\t80.00
Moonlight\tDrama\t2016\t56.19
Morbius\tComics\t2022\t69.97
Morning Glory\tDrama\t2010\t68.75
Mortdecai\tDrama\t2015\t58.00
Mother\tThriller\t2017\t82.89
Mother's Day\tRomance\t2016\t76.23
Mousehunt\tComedy\t1997\t83.78
Mr Harrigan's Phone\tDrama\t2022\t80.00
Mr. & Mrs. Smith\tComedy\t2005\t78.30
Mr. Bean's Holiday\tComedy\t2007\t84.30
Mr. Deeds\tRomance\t2002\t84.61
Mr. Magoo\tComedy\t1997\t80.30
Mr. Nobody\tThriller\t2009\t80.03
Mr. Nobody\tSci-Fi\t2009\t86.92
Mr. Poppers Penguins\tComedy\t2011\t81.15
Mr. Smith Goes to Washington\tDrama\t1939\t80.04
Mrs. Doubtfire\tComedy\t1993\t79.76
Mulan\tFantasy\t2020\t80.14
Murder Mystrey\tComedy\t2019\t80.16
Murder On The Orient Express\tCrime\t2017\t81.47
My Best Friend's Wedding\tRomance\t1997\t80.33
My Bloody Valentine\tHorror\t2009\t69.37
My Sister's Keeper\tDrama\t2009\t78.49
My Son\tThriller\t2021\t43.61
My Super Ex-Girlfriend\tComedy\t2006\t52.51
Mystic River\tCrime\t2003\t80.49
Nacho Libre\tComedy\t2006\t70.28
Naked Weapon\tAction\t2002\t74.77
Nancy Drew\tComedy\t2007\t60.08
Nanny Mcphee\tComedy\t2005\t80.29
Napoleon Dynamite\tComedy\t2004\t68.65
National Security\tComedy\t2004\t71.29
National Treasure\tAdventure\t2004\t80.51
National Treasure 2: Book of Secrets\tAdventure\t2007\t79.75
Neighboars 2\tComedy\t2016\t81.35
Neighbors\tComedy\t2014\t81.56
Nerve\tAdventure\t2016\t77.93
Never Rarely Sometimes Always\tDrama\t2020\t70.58
Never Surrender\tAction\t2009\t22.15
New Police Story\tAction\t2004\t74.80
New Year's Eve\tRomance\t2011\t52.19
New York Minute\tComedy\t2004\t70.29
Next\tThriller\t2007\t84.52
Next Friday\tComedy\t2000\t76.89
Night At The Muesum\tComedy\t2006\t84.73
Night At The Muesum 2\tComedy\t2009\t81.51
Night At The Muesum 3\tAdventure\t2014\t84.54
Night Crawler\tDrama\t2014\t80.43
Night Swim\tHorror\t2024\t58.63
Nim's Island\tFantasy\t2008\t65.25
No Escape\tAction\t2015\t80.49
No Exit\tThriller\t2022\t76.73
No Reservations\tRomance\t2008\t76.26
No Retreat, No Surrender\tAction\t1986\t74.83
No Strings Attachted\tComedy\t2011\t79.28
Noah\tAdventure\t2014\t60.96
Nocturnal Animals\tDrama\t2016\t73.90
Non-Stop\tAction\t2014\t80.24
Norbit\tComedy\t2007\t71.30
North Country\tDrama\t2006\t84.00
Not Another Teen Movie\tComedy\t2001\t69.19
Nothing To Lose\tComedy\t1997\t73.25
Now You See Me\tAdventure\t2013\t83.74
Now You See Me 2\tAdventure\t2016\t82.85
Nowhere To Run\tAction\t1993\t74.86
Numb\tThriller\t2008\t83.72
Nutty Proffessor 2\tComedy\t2000\t80.28
Oblivion\tSci-Fi\t2012\t70.91
Ocean's 8\tComedy\t2018\t79.76
Ocean's Eleven\tAction\t2001\t80.18
Ocean's Thirteen\tAction\t2007\t74.88
Ocean's Twelve\tAction\t2004\t74.91
Oculus\tHorror\t2013\t83.70
Office Space\tComedy\t1999\t79.76
Old Dogs\tDrama\t2009\t71.89
Old School\tComedy\t2003\t80.06
Oldboy\tDrama\t2003\t81.06
Oliver & Company\tAnimation\t1988\t78.03
Oliver Twist\tDrama\t2005\t62.10
Olympus Has Fallen\tAction\t2013\t84.02
Once Upon A Time in ... Hollywood\tDrama\t2019\t72.26
One Flew Over The Cuckoo's Nest\tDrama\t1975\t84.78
One For The Money\tDrama\t2012\t63.99
One Hour Photo\tThriller\t2002\t81.88
One Man Band\tShort\t2005\tShort
One Missed Call\tHorror\t2008\t84.39
Only Yesterday\tAnime\t1991\t75.33
Onward\tAnimation\t2020\t83.40
Open Season\tAnimation\t2006\t79.22
Open Season 2\tAnimation\t2008\t75.28
Open Season 3\tAnimation\t2010\t71.73
Oppenheimer\tHistory\t2023\t83.16
Ordinary Love\tRomance\t2019\t60.23
Ouija\tHorror\t2014\t70.78
Ouija: Origin of Evil\tHorror\t2016\t66.38
Our Brand is Crisis\tDrama\t2015\t47.08
Our Family Wedding\tRomance\t2010\t49.82
Our Idiot Brother\tComedy\t2011\t79.76
Outcast\tDrama\t2014\t52.67
Oxygène\tThriller\t2021\t84.88
Oz The Great & Powerful\tFantasy\t2013\t77.40
P.S. I Love You\tRomance\t2007\t69.41
P2\tThriller\t2007\t80.29
Pacific Rim\tAdventure\t2013\t82.07
Pacific Rim: Uprising\tAdventure\t2018\t81.13
Palm Springs\tRomance\t2020\t81.00
Pandorum\tHorror\t2009\t49.63
Panic Room\tThriller\t2002\t84.44
Pan's Labyrinth\tFantasy\t2006\t68.79
Paper Towns\tRomance\t2015\t37.40
Parasite\tThriller\t2019\t85.79
Parker\tAction\t2013\t38.91
Partly Cloudy\tShort\t2009\tShort
Passengers\tSci-Fi\t2016\t80.21
Passengers\tThriller\t2008\t82.64
Paul\tAdventure\t2011\t23.02
Paul Blart: Mall Cop\tComedy\t2009\t81.32
Paul Blart: Mall Cop 2\tComedy\t2015\t69.60
Pay it Forward\tDrama\t2000\t81.62
Paycheck\tSci-Fi\t2003\t84.00
Pee Wee's Big Holiday\tComedy\t2016\t63.73
Penguins of Madagascars\tAnimation\t2014\t72.13
Percy Jackson & the Olympians\tSci-Fi\t2010\t32.21
Perfect Stranger\tThriller\t2007\t80.31
Perfect Strangers\tDrama\t2016\t85.85
Pet Sematary\tHorror\t2019\t81.93
Peter Rabbit\tAnimation\t2018\t80.04
Phone Booth\tThriller\t2003\t84.45
Pi\tThriller\t1998\t51.45
Pinocchio\tAnimation\t1940\t82.86
Pitch Black\tAction\t2000\t14.96
Pixels\tComedy\t2015\t76.93
Plane\tAction\t2023\t79.98
Planet 51\tAnimation\t2009\t71.16
Playing For Keeps\tDrama\t2012\t37.66
Pokemon: Detective Pikatchu\tComedy\t2019\t63.78
Polaroid\tHorror\t2019\t80.35
Police Academy\tComedy\t1984\t70.30
Police Academy 2\tComedy\t1985\t70.31
Police Academy 3\tComedy\t1986\t69.61
Police Academy 4\tComedy\t1987\t68.91
Police Academy 5\tComedy\t1988\t67.31
Police Academy 6\tComedy\t1989\t64.95
Police Academy 7\tComedy\t1994\t65.96
Police Story\tAction\t1985\t80.22
Police Story 2\tAction\t1988\t80.21
Police Story 3: Supercop\tAction\t1992\t80.26
Police Story 4: First Strike\tAction\t1996\t80.06
Ponyo\tAnime\t2008\t85.61
Poor Things\tSci-Fi\t2023\t80.09
Portrait of a Lady on Fire\tDrama\t2019\t79.93
Powder Blue\tDrama\t2009\t68.93
Precious\tDrama\t2009\t15.39
Predator\tAction\t1987\t63.31
Predestination\tThriller\t2014\t82.36
Premonition\tHorror\t2007\t71.95
Presto\tShort\t2008\tShort
Pretty Baby\tRomance\t1978\t66.93
Pride & Prejudice & Zombies\tFantasy\t2016\t19.96
Priest\tAdventure\t2011\t54.51
Primer\tThriller\t2005\t25.14
Prince of Persia\tFantasy\t2011\t80.35
Prisoners\tCrime\t2013\t82.86
Project Power\tAction\t2020\t77.71
Prom\tRomance\t2011\t64.41
Psycho\tThriller\t1960\t80.00
Public Enimies\tAction\t2009\t64.66
Pulp Fiction\tAction\t1994\t83.31
Punisher: War Zone\tAction\t2009\t79.74
Push\tSci-Fi\t2009\t78.96
Quantum of Solace\tAction\t2008\t80.55
Quarantine\tHorror\t2008\t69.75
Queen of The Desert\tBiography\t2015\t38.31
Quills\tDrama\t2000\t37.70
Quiz Show\tThriller\t2005\t55.87
R.I.P.D\tComedy\t2013\t66.00
Rabbit Hole\tDrama\t2011\t71.43
Rain Man\tDrama\t1988\t80.47
Ralph Breaks the Internet\tAnimation\t2018\t85.38
Rambo\tWar\t2008\t71.01
Rambo 2\tWar\t1985\t60.58
Rambo 3\tWar\t1988\t69.80
Rambo: Last Blood\tWar\t2019\t66.47
Ramona And Beezus\tComedy\t2010\t63.82
Rampage\tAdventure\t2018\t80.17
Rango\tAnimation\t2011\t82.94
Rat Race\tComedy\t2007\t83.89
Ratatouille\tAnimation\t2007\t85.62
Raw Deal\tAction\t1986\t69.90
Raya and The Last Dragon\tAnimation\t2021\t84.98
Ready Or Not\tThriller\t2019\t81.01
Ready Player One\tSci-Fi\t2018\t84.89
Real Steal\tAction\t2011\t79.14
Rear Window\tThriller\t1954\t83.96
Rebound\tComedy\t2005\t73.30
Red\tAction\t2010\t71.65
Red 2\tAction\t2014\t67.10
Red Dragon\tThriller\t2002\t55.29
Red Eye\tThriller\t2005\t80.23
Red Lights\tDrama\t2012\t55.03
Red Notice\tComedy\t2021\t81.01
Red Riding Hood\tFantasy\t2011\t80.02
Red Shoes and Seven Dwarfs\tAnimation\t2019\t81.14
Red Sparrow\tDrama\t2018\t65.21
Red Tails\tAction\t2012\t11.52
Redemption\tAction\t2013\t45.36
Regression\tThriller\t2015\t36.81
Reign Over Me\tDrama\t2007\t80.05
Remember Me\tRomance\t2010\t78.94
Rememory\tDrama\t2017\t60.29
Replicant\tAction\t2001\t80.40
Repo Men\tAction\t2010\t47.43
Requiem For A Dream\tDrama\t2000\t85.14
Resident Evil\tHorror\t2002\t79.77
Resident Evil : Afterlife\tHorror\t2010\t80.17
Resident Evil : Apocalypse\tHorror\t2004\t78.84
Resident Evil : Extintion\tHorror\t2007\t78.86
Resident Evil : Retribution\tHorror\t2012\t70.79
Resident Evil : The Final Chapter\tHorror\t2016\t80.21
Revolutionary Road\tDrama\t2009\t80.08
Revolver\tAction\t2005\t29.59
Righteous Kill\tAction\t2008\t72.70
Rings\tHorror\t2017\t71.49
Rio\tAnimation\t2011\t70.18
Rio 2\tAnimation\t2014\t64.83
Rise of The Planet of Apes\tAction\t2011\t82.45
Road House\tAction\t2024\t81.73
Road Trip\tComedy\t2000\t65.00
Robin Hood\tFantasy\t2010\t62.56
Robocop\tAction\t2014\t26.96
Robocop 1\tAction\t1987\t15.82
Robocop 2\tAction\t1990\t9.85
Robocop 3\tAction\t1993\t16.04
Robots\tAnimation\t2005\t83.70
Rocky\tAction\t1976\t80.04
Rocky Balboa\tAction\t2006\t80.05
Rocky II\tAction\t1979\t80.06
Rocky III\tAction\t1982\t80.07
Rocky IV\tAction\t1985\t80.07
Rocky V\tAction\t1990\t80.07
Romeo + Juliet\tRomance\t1996\t71.52
Room in Rome\tRomance\t2010\t38.57
Rubber\tHorror\t2010\t0.00
Ruby Sparks\tRomance\t2012\t35.71
Run\tThriller\t2020\t85.49
Rush\tAction\t2013\t60.79
Rush Hour\tComedy\t1998\t82.34
Rush Hour 2\tComedy\t2001\t80.39
Rush Hour 3\tComedy\t2007\t80.45
S.W.A.T\tAction\t2003\t69.50
Sacrifice\tAction\t2011\t64.70
Safe\tAction\t2012\t66.55
Safe House\tAction\t2012\t65.67
Salt\tAction\t2010\t82.32
San Andreas\tAdventure\t2015\t81.39
Sandy Wexler\tComedy\t2017\t79.29
Sausage Party\tAnimation\t2016\t83.75
Savages\tAction\t2012\t59.70
Saving Private Ryan\tWar\t1998\t80.78
Saw\tHorror\t2004\t84.86
Saw 2\tHorror\t2005\t82.87
Saw 3\tHorror\t2006\t82.76
Saw 4\tHorror\t2007\t80.96
Saw 5\tHorror\t2008\t82.63
Saw 6\tHorror\t2009\t82.51
Saw 7\tHorror\t2010\t82.42
Saw X\tHorror\t2023\t84.83
Say It Isn't So\tComedy\t2001\t66.05
SBSP: Sponge on the Run\tAnimation\t2021\t80.01
Scarface\tAction\t1983\t70.01
Scary Movie\tComedy\t2000\t80.15
Scary Movie 2\tComedy\t2001\t70.32
Scary Movie 3\tComedy\t2003\t68.71
Scary Movie 4\tComedy\t2006\t57.48
Scary Movie 5\tComedy\t2013\t43.89
Scary Stories to Tell in The Dark\tHorror\t2019\t49.65
Scent of a Woman\tDrama\t1992\t84.82
Schindler's List\tDrama\t1993\t77.27
School of Rock\tComedy\t2003\t78.32
Scooby-Doo\tAdventure\t2002\t69.05
Scream\tHorror\t1996\t80.86
Scream 2\tHorror\t1997\t79.52
Scream 3\tHorror\t2000\t72.38
Scream 4\tHorror\t2011\t70.80
Se7en\tCrime\t1995\t82.97
Searching\tThriller\t2018\t82.53
Season of The Witch\tFantasy\t2011\t19.09
Second in Command\tAction\t2006\t70.02
Secret Obsession\tMystrey\t2019\t76.12
Seed\tHorror\t2006\t8.92
Seed of Chucky\tHorror\t2003\t19.52
Self/less\tSci-Fi\t2015\t77.56
Serenity\tDrama\t2019\t37.23
Serving Sara\tComedy\t2002\t70.33
Setup\tAction\t2011\t63.36
Seven Pounds\tDrama\t2008\t82.82
Shang-Chi and the Legend of the Ten Rings\tComics\t2021\t82.00
Shanghai Knights\tComedy\t2003\t80.34
Shanghai Noon\tComedy\t2000\t80.21
Shaun of The Dead\tComedy\t2004\t55.41
Shaun The Sheap Movie\tAnimation\t2005\t70.19
Shazam\tComics\t2019\t83.68
She Dies Tomorrow\tDrama\t2020\t10.22
Sherlock Gnomes\tAnimation\t2018\t76.74
Sherlock Holmes\tAction\t2010\t80.13
Sherlock Holmes 2\tAction\t2011\t66.59
She's The Man\tComedy\t2006\t80.41
Shirley\tDrama\t2020\t41.01
Shoot Em Up\tAction\t2007\t4.32
Shooter\tAction\t2007\t47.60
Shorts\tAdventure\t2009\t69.06
Showtime\tAction\t2002\t59.74
Shrek\tAnimation\t2001\t80.41
Shrek 2\tAnimation\t2004\t80.42
Shrek Forever After\tAnimation\t2010\t80.32
Shrek The Third\tAnimation\t2007\t80.46
Shutter\tHorror\t2004\t82.92
Shutter Island\tThriller\t2010\t84.98
Sicario\tWar\t2015\t52.25
Silence\tDrama\t2016\t62.14
Silenced\tDrama\t2011\t84.59
Silent Hill\tHorror\t2006\t79.53
Silent House\tHorror\t2013\t62.77
Sin City\tDrama\t2005\t38.05
Sing\tAnimation\t2016\t80.52
Sing 2\tAnimation\t2021\t80.54
Sinister\tHorror\t2013\t70.81
Sinister 2\tHorror\t2015\t28.27
Skateland\tDrama\t2010\t30.46
Skinwalkers\tHorror\t2007\t58.90
Skyfall\tAction\t2012\t80.20
Skyscraper\tAction\t2018\t83.06
Sleeping Beauty\tDrama\t2011\t55.16
Slumdog Millionaire\tDrama\t2008\t52.72
Smallfoot\tAnimation\t2018\t82.81
Smile 2\tHorror\t2024\t84.02
Smiley\tHorror\t2012\t8.44
Snitch\tAction\t2013\t56.83
Snow White And The Huntman\tAdventure\t2012\t70.12
Snowden\tDrama\t2016\t72.25
Snowpiercer\tAdventure\t2013\t84.64
Soldiers of Fortune\tWar\t2012\t48.46
Solitary Man\tDrama\t2010\t70.59
Some kind of Beautiful\tDrama\t2015\t70.60
Something Borrowed\tRomance\t2011\t70.88
Somewhere\tDrama\t2010\t66.26
Son of Rambo\tAdventure\t2008\t35.27
Son of the Mask\tAdventure\t2005\t43.41
Sonic the Hedgehog 2\tComedy\t2022\t82.63
Sonic The Hedgehog 3\tAdventure\t2024\t83.76
Sonic: The Hedgedog\tAdventure\t2020\t76.63
Soul\tAnimation\t2020\t82.84
Soul Survivors\tHorror\t2001\t65.37
Source Code\tThriller\t2011\t83.97
Southpaw\tAction\t2015\t82.46
Space Jam\tAdventure\t1996\t56.06
Spanglish\tRomance\t2004\t82.26
Speak\tDrama\t2004\t79.76
Spectral\tSci-Fi\t2016\t71.56
Spectre\tAction\t2015\t76.55
Speed\tAction\t1994\t83.51
Speed 2: Crulse Control\tAction\t1997\t77.73
Spell\tThriller\t2020\t83.73
Spider-Man\tComics\t2002\t83.93
Spider-Man 2\tComics\t2004\t84.33
Spider-Man 3\tComics\t2007\t84.57
Spider-Man Far From Home\tComics\t2019\t85.13
Spider-Man Homecoming\tComics\t2017\t84.05
Spider-Man Into the Spider Verse\tComics\t2018\t86.77
Spider-Man: Across the Spider-Verse\tComics\t2023\t91.00
Spider-Man: No Way Home\tComics\t2021\t90.00
Spies in Disguise\tAnimation\t2019\t82.47
Spinning Man\tCrime\t2018\t81.19
Spirited Away\tAnime\t2001\t85.35
Split\tThriller\t2017\t84.99
Spotlight\tDrama\t2015\t79.44
Spring Breakers\tRomance\t2012\t36.82
Spy\tComedy\t2015\t67.35
Spy Kids\tComedy\t2001\t75.58
Spy Kids 2\tComedy\t2002\t70.34
Spy Kids 3\tComedy\t2003\t71.31
Spy Kids 4\tComedy\t2011\t65.04
Stand Up Guys\tDrama\t2013\t47.94
Star Wars Episode I\tSci-Fi\t1977\t32.65
Star Wars Episode II\tSci-Fi\t1980\t33.09
Star Wars Episode III\tSci-Fi\t1985\t33.52
Star Wars Episode IV\tSci-Fi\t1990\t33.96
Star Wars Episode V\tSci-Fi\t1992\t34.40
Star Wars Episode VI\tSci-Fi\t1994\t34.84
Starsky and Hutch\tComedy\t2004\t66.76
Stay Cool\tRomance\t2009\t14.53
Step Brothers\tComedy\t2008\t81.53
Step Up\tDrama\t2006\t60.33
Step Up 2\tDrama\t2008\t38.87
Step Up 3\tDrama\t2010\t13.24
Stolen\tAction\t2012\t71.66
Stonehearst Asylum\tThriller\t2014\t82.37
Storks\tAnimation\t2016\t71.17
Stranger Than Fiction\tComedy\t2006\t84.66
Straw Dogs\tHorror\t2011\t23.90
Street Dance\tDrama\t2010\t37.27
Street Fighter\tAction\t1994\t77.77
Street Fighter: The Legend of Chun Li\tAction\t2009\t71.67
Street Kings\tAction\t2008\t76.60
Stuck On You\tComedy\t2004\t80.15
Suburbicon\tCrime\t2017\t82.60
Sucker Punch\tSci-Fi\t2011\t70.95
Sudden Death\tAction\t1995\t79.74
Suicide Squad\tComics\t2016\t79.36
Sully\tDrama\t2016\t83.11
Summer '03\tDrama\t2018\t49.15
Super 8\tSci-Fi\t2011\t71.58
Superbad\tComedy\t2007\t71.81
Superhero Movie\tComedy\t2008\t63.86
Superman - Doomsday\tAnimation\t2007\t61.13
Superman Returns\tAction\t2006\t74.94
Superman Vs. The Elite\tAnimation\t2012\t68.88
Superman/Batman Apocalypse\tAnimation\t2010\t72.14
Superstar\tComedy\t1999\t71.32
Surf's Up\tAnimation\t2007\t45.53
Surrogates\tAction\t2009\t68.86
Swallow\tDrama\t2019\t79.45
Sweet November\tRomance\t2001\t83.21
Swiss Army Man\tMystrey\t2016\t70.85
Swordfish\tAction\t2001\t52.88
Synchronic\tThriller\t2020\t48.28
Synecdoche New York\tDrama\t2008\t55.82
Tag\tComedy\t2018\t84.31
Take Shelter\tDrama\t2011\t78.51
Taken\tAction\t2009\t80.79
Taken 2\tAction\t2012\t80.72
Taken 3\tAction\t2015\t74.97
Takers\tAction\t2010\t12.81
Taking Lives\tCrime\t2004\t73.70
Talladega Nights\tComedy\t2006\t81.58
Tammy\tComedy\t2014\t51.72
Tangled\tAnimation\t2010\t79.75
Tape 13\tHorror\t2014\t0.50
Tarazan\tAnimation\t1999\t80.13
Tarazan  & Jane\tAnimation\t2002\t53.22
Taxi\tAction\t1998\t1.80
Taxi 2\tAction\t2000\t1.45
Taxi 3\tAction\t2003\t1.10
Taxi 4\tAction\t2004\t0.90
Taxi 5\tAction\t2018\t0.20
Ted\tComedy\t2012\t80.14
Ted 2\tComedy\t2015\t70.35
Teenage Mutant Ninja Turtles\tAdventure\t2014\t83.38
Teenage Mutant Ninja Turtles 2\tAdventure\t2016\t79.75
Tekken\tFantasy\t2010\t7.86
Tell Me Who I Am\tBiography\t2019\t73.00
Tenet\tThriller\t2020\t82.28
Terminator 2: Judgement Day\tAction\t1991\t85.77
Terminator 3: Rise of The Machines\tAction\t2003\t80.97
Terminator Salvation\tAction\t2009\t70.03
Terminator: Dark Fate\tAction\t2019\t75.00
Terminator: Genysis\tAction\t2015\t68.19
That's What I Am\tComedy\t2011\t60.12
The 40 Years Old Virgin\tComedy\t2005\t73.35
The Accidental Husband\tComedy\t2008\t79.30
The Accidental Spy\tAction\t2001\t80.50
The Accountant\tAction\t2016\t64.74
The Addam's Family\tAnimation\t2019\t70.20
The Addam's Family\tFantasy\t1991\t80.18
The Adjustment Bureau\tThriller\t2011\t82.02
The Adventure of Tintin\tAnimation\t2011\t72.15
The Aeronauts\tAdventure\t2019\t81.08
The Aftermath\tDrama\t2019\t49.17
The Age of Adaline\tRomance\t2013\t74.35
The Aggression Scale\tAction\t2012\t56.96
The Amazing Spider-Man\tComics\t2012\t80.99
The Amazing Spider-Man 2\tComics\t2014\t82.91
The American\tAction\t2010\t60.84
The Angry Birds Movie\tAnimation\t2016\t84.55
The Angry Birds Movie 2\tAnimation\t2019\t84.09
The Aristocats\tAnimation\t1970\t72.16
The Art of War\tAction\t2000\t77.79
The Art of War II\tAction\t2008\t51.56
The Art of War III\tWar\t2009\t8.66
The Artist\tRomance\t2011\t70.89
The A-Team\tWar\t2010\t38.65
The Avengers\tComics\t2012\t89.00
The Awakening\tHorror\t2010\t20.40
The Babadook\tHorror\t2014\t79.54
The Back-Up Plan\tRomance\t2010\t72.40
The Backwoods\tAdventure\t2007\t63.44
The Bad Lieutanant\tCrime\t2009\t37.53
The Ballad of Jack and Rose\tRomance\t2005\t52.83
The Bank Job\tAction\t2008\t38.27
The Bar (El Bar)\tThriller\t2017\t85.89
The Batman\tComics\t2022\t85.82
The Beaver\tDrama\t2011\t71.90
The Best Offer\tMystrey\t2013\t64.28
The BFG\tFantasy\t2016\t78.67
The Big Bang\tAction\t2011\t69.04
The Big Short\tDrama\t2015\t56.32
The Big Year\tComedy\t2011\t60.16
The Black Cauldron\tAnimation\t1985\t61.17
The Blind Side\tDrama\t2009\t83.56
The Blue Lagoon\tRomance\t1980\t71.99
The Body (El cuerpo)\tCrime\t2012\t88.70
The Bone Collector\tCrime\t1999\t79.76
The Book of Eli\tThriller\t2010\t74.40
The Boss Baby\tAnimation\t2017\t84.10
The Bounty Hunter\tComedy\t2010\t79.76
The Bourne Identity\tAction\t2002\t77.80
The Bourne Legacy\tAction\t2012\t69.51
The Bourne Supermacy\tAction\t2004\t71.68
The Bourne Ultimatum\tAction\t2007\t70.04
The Box\tHorror\t2009\t70.82
The Boy\tHorror\t2016\t80.62
The Boys Are Back\tDrama\t2009\t10.45
The Brave One\tAction\t2007\t54.25
The Break-Up\tRomance\t2006\t71.53
The Butterfly Effect\tThriller\t2003\t83.98
The Butterfly Effect 2\tThriller\t2006\t70.97
The Butterfly Effect 3\tThriller\t2009\t65.50
The Bye Bye Man\tHorror\t2017\t14.32
The Cabin in The Woods\tHorror\t2014\t67.64
The Cable Guy\tComedy\t1996\t80.66
The Call\tThriller\t2013\t76.37
The Campaign\tComedy\t2012\t80.70
The Cat's Meow\tDrama\t2002\t45.70
The Change Up\tComedy\t2011\t73.40
The Chaperone\tComedy\t2011\t71.33
The Chaser\tThriller\t2008\t70.98
The Child In Time\tDrama\t2017\t79.76
The Choice\tRomance\t2016\t83.59
The Chosen One\tComedy\t2010\t79.76
The Chronicles of Riddick\tSci-Fi\t2004\t8.99
The Clan\tCrime\t2015\t80.31
The Cobbler\tAdventure\t2014\t80.77
The Collector\tHorror\t2009\t83.11
The Colony\tThriller\t2013\t79.92
The Commuter\tAction\t2018\t80.43
The Confirmation\tDrama\t2016\t30.90
The Conjuiring\tHorror\t2013\t80.36
The Conjuiring 2\tHorror\t2016\t83.64
The Conjuring 3\tHorror\t2021\t59.81
The Core\tDisaster\t2003\t78.44
The Crazies\tThriller\t2010\t72.02
The Croods\tAnimation\t2013\t83.76
The Croods New Age\tAnimation\t2020\t80.41
The Curious Case of Benjiman Button\tDrama\t2008\t83.82
The Current War\tDrama\t2017\t80.92
The Da Vinci Code\tThriller\t2006\t82.38
The Danish Girl\tDrama\t2015\t75.72
The Dark Knight\tAction\t2008\t85.04
The Dark Knight Rises\tAction\t2013\t81.84
The Darkest Hour\tThriller\t2011\t24.34
The Day After Tomorrow\tDisaster\t2004\t84.68
The Dead Don't Die\tHorror\t2019\t37.36
The Debt\tDrama\t2010\t70.61
The Decentants\tDrama\t2011\t62.18
The Departed\tDrama\t2006\t68.76
The Devil Wears Prada\tAdventure\t2006\t54.64
The Devil's Advocate\tMystrey\t1997\t84.15
The Devil's Inside\tHorror\t2012\t66.42
The Dictator\tComedy\t2012\t71.34
The Dilemma\tComedy\t2011\t76.96
The Disappearance of Haruhi Suzumiya\tAnime\t2010\t70.21
The Divergent: Allegiant\tFantasy\t2016\t79.46
The Do-Over\tComedy\t2016\t50.61
The Duel\tWestern\t2016\t37.83
The Eagle\tAction\t2011\t36.91
The Emoji Movie\tAnimation\t2017\t81.05
The Empty Man\tThriller\t2020\t43.33
The Equalizer\tAction\t2014\t81.26
The Equalizer 2\tAction\t2018\t83.62
The Equalizer 3\tAction\t2023\t84.00
The Exorcism of Emily Rose\tHorror\t2005\t69.76
The Expendables\tAction\t2010\t82.68
The Expendables 2\tAction\t2012\t83.36
The Expendables 3\tAction\t2014\t82.69
The Experiment\tAction\t2010\t81.55
The Eye\tHorror\t2008\t81.34
The Family Plan\tComedy\t2023\t83.69
The Fantastic Four: First Steps\tComics\t2025\t83.92
The Fast & Furious\tAction\t2001\t82.57
The Fast and the Furious: Tokyo Draft\tAction\t2006\t69.52
The Fate of the Furious\tAction\t2017\t82.82
The Fault in Our Stars\tRomance\t2014\t82.27
The Firm\tThriller\t1993\t72.55
The First Purge\tThriller\t2018\t79.71
The Flash\tComics\t2023\t84.98
The Flowers of War\tHistory\t2011\t81.99
The Forbidden Kingdom\tAction\t2008\t82.70
The Foreigner\tAction\t2017\t81.28
The Founder\tDrama\t2016\t82.61
The Fourth Kind\tThriller\t2009\t65.54
The Game\tThriller\t1997\t80.44
The Game Plan\tComedy\t2007\t72.23
The Gift\tThriller\t2015\t81.87
The Gingerdead Man\tHorror\t2005\t3.21
The Girl Next Door\tComedy\t2004\t73.45
The Girl Who Leapt Through Time\tAnime\t2006\t84.11
The Girl With The Dragon Tatto\tAction\t2011\t57.09
The Glass Castle\tDrama\t2017\t69.69
The Godfather\tAction\t1972\t87.02
The Godfather II\tAction\t1974\t84.53
The Godfather III\tAction\t1990\t80.53
The Golden Compass\tFantasy\t2007\t67.56
The Good Dinosour\tAnimation\t2015\t79.75
The Good Girl\tDrama\t2002\t77.31
The Good Liar\tDrama\t2019\t41.00
The Goods\tComedy\t2009\t8.08
The Great Wall\tWar\t2016\t63.15
The Green Hornet\tAdventure\t2011\t53.09
The Green Mile\tDrama\t1999\t90.41
The Grey\tAction\t2012\t72.07
The Grudge\tHorror\t2004\t82.35
The Grudge 2\tHorror\t2006\t76.03
The Grudge 3\tHorror\t2009\t79.55
The Guilty\tCrime\t2018\t80.01
The Hangover\tComedy\t2009\t85.00
The Hangover 2\tComedy\t2011\t81.40
The Hangover 3\tComedy\t2013\t82.41
The Hateful Eight\tWestern\t2015\t80.48
The Heartbreak Kid\tComedy\t2007\t79.76
The Help\tDrama\t2011\t80.35
The Hidden Face\tThriller\t2011\t84.07
The Hit List\tAction\t2011\t72.75
The Hitcher\tHorror\t2007\t67.68
The Hitman's Bodyguard\tAction\t2017\t80.08
The Hobbit: An Unexpected Journey\tFantasy\t2012\t84.38
The Hobbit: The Disolation of Smaug\tFantasy\t2013\t84.21
The Hobbit: TheBattle of TheFiveArmies\tFantasy\t2014\t87.77
The Holdovers\tDrama\t2023\t60.93
The Hole in The Ground\tHorror\t2019\t65.42
The Holiday\tComedy\t2006\t82.15
The House That Jack Built\tCrime\t2018\t82.98
The Hunchback of Notre Dame\tAnimation\t1996\t78.05
The Hunchback of Notre Dame 2\tAnimation\t2002\t65.84
The Hunger Games\tFantasy\t2012\t83.94
The Hunger Games 2\tFantasy\t2013\t83.57
The Hunger Games 3\tFantasy\t2014\t81.83
The Hunger Games 4\tFantasy\t2015\t81.85
The Hunger Games: Ballad of Songbirds & Snakes\tAdventure\t2023\t83.71
The Hungover Games\tComedy\t2014\t72.24
The Hunt\tThriller\t2020\t79.77
The Hurt Locker\tThriller\t2008\t79.77
The Imitation Game\tDrama\t2014\t82.24
The Impossible\tAdventure\t2012\t70.13
The Incredible Hulk\tComics\t2008\t79.76
The Incredibles\tAnimation\t2004\t81.26
The Innkeepers\tHorror\t2011\t78.87
The International\tAction\t2009\t79.74
The Internship\tComedy\t2013\t69.62
The Intruders\tHorror\t2015\t69.38
The Invasion\tThriller\t2007\t79.00
The Invisible Guest\tThriller\t2017\t86.99
The Invisible Man\tThriller\t2020\t80.49
The Invitation\tThriller\t2015\t80.00
The Irishman\tDrama\t2019\t84.20
The Iron Lady\tDrama\t2011\t62.22
The Italian Job\tAction\t2003\t52.40
The Jacket\tThriller\t2005\t82.29
The Judge\tDrama\t2014\t85.36
The Jungle Book\tFantasy\t2016\t83.19
The Karate Kid\tAction\t2010\t66.63
The Keeper of Lost Causes\tThriller\t2013\t81.90
The Killing of A Scared Deer\tThriller\t2017\t83.60
The King's Speech\tDrama\t2010\t80.39
The Kissing Booth\tRomance\t2018\t71.54
The Lake House\tRomance\t2006\t84.88
The Last House On The Left\tHorror\t2009\t81.92
The Last of The Mohicans\tHistory\t1992\t70.69
The Last Seduction\tDrama\t1994\t62.26
The Last Shot\tComedy\t2004\t79.76
The Last Song\tRomance\t2010\t69.42
The Last Stand\tAction\t2013\t72.80
The Last Survivors\tWar\t2014\t36.15
The Last Witch Hunter\tAction\t2015\t63.40
The Layover\tRomance\t2017\t62.98
The Ledge\tDrama\t2011\t23.46
The Legend of Zorro\tAction\t2005\t82.04
The Lie\tThriller\t2018\t83.99
The Life of David Gale\tCrime\t2003\t79.76
The Lighthouse\tThriller\t2019\t70.99
The Lion King\tAnimation\t1994\t82.08
The Lion King\tFantasy\t2019\t83.20
The Lion King 1&1/2\tAnimation\t2004\t79.23
The Lion King 2\tAnimation\t1998\t76.77
The Lobster\tThriller\t2015\t81.38
The Lodge\tThriller\t2020\t83.33
The Loft\tThriller\t2014\t83.85
The Lone Ranger\tAction\t2013\t37.44
The Long Halloween Part 1\tComics\t2021\t82.59
The Long Halloween Part 2\tComics\t2021\t81.98
The Longest Ride\tRomance\t2015\t76.28
The Longest Yard\tComedy\t2005\t80.40
The Lorax\tAnimation\t2012\t75.30
The Losers\tAction\t2010\t59.79
The Love Guru\tRomance\t2008\t68.81
The Lovely Bones\tThriller\t2009\t80.19
The Lucky One\tDrama\t2012\t70.62
The Machinist\tThriller\t2004\t84.69
The Magnificent Seven\tAction\t2016\t83.26
The Majestic\tDrama\t2004\t85.75
The Man From Earth\tDrama\t2007\t85.86
The Man From Earth Holocene\tDrama\t2017\t81.98
The Man From The U.N.C.L.E\tAction\t2015\t46.22
The Man in The Iron Mask\tDrama\t1998\t78.53
The Marine\tWar\t2006\t76.48
The Marine 2\tWar\t2009\t46.05
The Martian\tSci-Fi\t2015\t83.48
The Marvels\tComics\t2023\t81.00
The Mask\tComedy\t1994\t84.67
The Mask of Zorro\tAction\t1998\t84.08
The Matrix\tSci-Fi\t1999\t86.83
The Matrix 2\tSci-Fi\t2003\t85.97
The Matrix 3\tSci-Fi\t2003\t80.99
The Matrix Ressurections\tSci-Fi\t2021\t77.99
The Maze Runner\tAdventure\t2014\t85.42
The Mechanic\tAction\t2011\t60.88
The Medallion\tAction\t2003\t82.01
The Meg\tAdventure\t2018\t75.11
The Menu\tThriller\t2022\t80.61
The Merchant of Venice\tDrama\t2004\t80.27
The Mist\tThriller\t2007\t85.92
The Mitchells vs. The Machines\tAnimation\t2021\t84.51
The Model\tDrama\t2016\t78.55
The Mule\tDrama\t2018\t78.57
The Mummy\tHorror\t2017\t62.81
The Muppets\tComedy\t2011\t66.13
The Naked Gun\tComedy\t1988\t73.50
The Naked Gun 2: The Smell of Fear\tComedy\t1991\t71.35
The Naked Gun 3: The Final Insult\tComedy\t1994\t71.82
The Nanny Diaries\tComedy\t2007\t75.61
The Neighbor\tDrama\t2019\t81.10
The Nest\tDrama\t2020\t50.22
The New Mutants\tHorror\t2020\t80.40
The New World\tDrama\t2006\t62.31
The Next Three Days\tAction\t2010\t71.69
The Night House\tThriller\t2021\t47.51
The Nightmare Before Christmas\tAnimation\t1993\t80.02
The Ninth Gate\tDrama\t1999\t71.91
The Normal Heart\tDrama\t2014\t82.25
The Notebook\tRomance\t2005\t82.18
The Number 23\tThriller\t2007\t83.25
The Number 23\tCrime\t2007\t84.02
The Nun\tHorror\t2018\t45.19
The Nutcracker and the Four Realms\tFantasy\t2018\t72.31
The Nutty Proffessor\tComedy\t1996\t82.16
The Offering\tHorror\t2016\t26.09
The Old Guard\tAction\t2020\t78.98
The Omen\tHorror\t2006\t64.24
The One\tAction\t2001\t77.82
The Other Boleyn Girl\tDrama\t2008\t72.27
The Other Guys\tComedy\t2010\t75.36
The Other Man\tDrama\t2009\t75.75
The Other Side of The Door\tHorror\t2016\t49.69
The Other Woman\tComedy\t2014\t70.36
The Others\tHorror\t2001\t86.79
The Pacifier\tComedy\t2005\t81.07
The Peanuts Movie\tAnimation\t2015\t50.50
The Perfect Host\tThriller\t2011\t76.40
The Perfection\tMystrey\t2018\t79.77
The Pianist\tWar\t2002\t83.50
The Pink Panther\tComedy\t2006\t78.34
The Pink Panther 2\tComedy\t2009\t76.99
The Platform\tThriller\t2019\t85.93
The Platform 2\tThriller\t2024\t81.21
The Polar Express\tAnimation\t2004\t80.83
The Possesion\tHorror\t2012\t47.25
The Predator\tAction\t2018\t50.19
The Prestige\tMystrey\t2006\t84.40
The Princess And The Frog\tAnimation\t2009\t80.00
The Princess Diaries\tComedy\t2001\t71.36
The Princess Diaries 2\tComedy\t2004\t66.17
The Prodigy\tThriller\t2019\t80.36
The Proposal\tComedy\t2009\t68.92
The Punisher\tAction\t2004\t69.53
The Purge\tThriller\t2013\t83.86
The Purge : Anarchy\tThriller\t2014\t80.64
The Purge: Election Year\tThriller\t2016\t81.48
The Pursuit of Happyness\tDrama\t2006\t84.93
The Quest\tAction\t1996\t77.84
The Quiet\tThriller\t2005\t80.22
The Reader\tDrama\t2009\t68.94
The Realm\tDrama\t2018\t25.65
The Rebound\tComedy\t2009\t66.80
The Rental\tThriller\t2020\t72.35
The Replacements\tComedy\t2000\t66.84
The Resident\tHorror\t2011\t68.95
The Revenant\tDrama\t2015\t78.59
The Ridiculous 6\tComedy\t2015\t79.31
The Ring\tHorror\t2002\t83.46
The Ring Two\tHorror\t2005\t79.56
The Rite\tThriller\t2011\t63.10
The Road\tThriller\t2009\t79.98
The Room\tThriller\t2019\t83.34
The Roommate\tThriller\t2011\t80.02
The Ruins\tHorror\t2008\t80.14
The Runaways\tDrama\t2010\t38.09
The Running Man\tAction\t1987\t79.15
The Samaritan\tAction\t2012\t30.02
The Secret Life of Pets\tAnimation\t2016\t84.65
The Secret Life of Pets 2\tAnimation\t2019\t80.91
The Secret Life of Words\tDrama\t2012\t62.35
The Shape of Water\tDrama\t2017\t81.33
The Shawshank Redemption\tDrama\t1994\t81.09
The Shepherd: Border Patrol\tAction\t2008\t80.14
The Shining\tThriller\t1980\t85.88
The Shunning\tDrama\t2011\t58.12
The Silence\tAdventure\t2019\t79.98
The Silence of The Lambs\tCrime\t1991\t78.40
The Simpsons Movie\tAnimation\t2007\t80.87
The Sisterhood of the Traveling Pants\tDrama\t2005\t67.47
The Sixth Sence\tThriller\t1999\t83.49
The Skeleton Key\tHorror\t2005\t79.57
The Slammin Salmon\tComedy\t2009\t20.84
The Smurfs\tFantasy\t2011\t73.95
The Smurfs 2\tFantasy\t2013\t75.84
The Social Network\tDrama\t2010\t64.03
The Son of No One\tDrama\t2011\t62.39
The Sorcerer's Apprentice\tFantasy\t2010\t38.14
The Spiderwick Chronicles\tAdventure\t2008\t68.87
The Spongbob SqurePants Movie\tAnimation\t2015\t69.09
The Spy Next Door\tComedy\t2010\t79.32
The Stepfather\tThriller\t2009\t83.16
The Stranger: Chapter 1\tThriller\t2024\t84.02
The Strangers\tThriller\t2008\t79.01
The Strangers: Prey At Night\tThriller\t2018\t71.00
The Super Mario Bros. Movie\tAnimation\t2023\t84.22
The Sword in The Stone\tAnimation\t1963\t79.24
The Taking of Pelham 123\tAction\t2009\t72.08
The Tempest\tAdventure\t2011\t4.18
The Terminal\tDrama\t2004\t86.58
The Terminator\tAction\t1984\t81.50
The Theory of Everything\tDrama\t2014\t80.33
The Three Masketeers\tHistory\t2011\t72.32
The Three Stooges\tComedy\t2012\t77.02
The Ticket\tDrama\t2016\t62.43
The Time Traveler's Wife\tAdventure\t2009\t66.68
The Tortured\tHorror\t2012\t49.77
The Tourist\tDrama\t2010\t21.27
The Tournament\tAction\t2009\t84.70
The Tower\tDisaster\t2013\t84.93
The Town\tAction\t2010\t75.02
The Transporter\tAction\t2002\t82.05
The Tree of The Life\tDrama\t2011\t67.52
The Trouble With Bliss\tComedy\t2012\t8.11
The Truman Show\tDrama\t1998\t92.92
The Tuxedo\tComedy\t2002\t80.75
The Twilight Saga: Breaking Dawn Part 1\tHorror\t2011\t79.58
The Twilight Saga: Breaking Dawn Part 2\tHorror\t2012\t78.88
The Twilight Saga: Eclipse\tHorror\t2010\t76.06
The Twilight Saga: New Moon\tHorror\t2009\t70.83
The Ugly Truth\tRomance\t2009\t72.00
The Unborn\tHorror\t2009\t79.59
The Unforgivable\tCrime\t2021\t82.99
The Vault\tHorror\t2017\t51.14
The Virgin Suicides\tDrama\t2000\t69.28
The Vow\tRomance\t2012\t82.80
The Wailing\tHorror\t2016\t80.06
The Wall\tAction\t2017\t70.05
The War with Grandpa\tComedy\t2025\t83.72
The Ward\tThriller\t2011\t84.62
The Way Back\tDrama\t2010\t70.63
The Wedding Singer\tRomance\t1998\t72.41
The Whole Nine Yards\tComedy\t2000\t81.31
The Whole Ten Yards\tComedy\t2004\t70.37
The Wicker Man\tHorror\t2006\t3.43
The Wild\tAnimation\t2006\t79.25
The Wild Robot\tAnimation\t2024\t87.00
The Willoughbys\tAnimation\t2020\t56.52
The Witch\tHorror\t2016\t2.01
The Wizard of Oz\tFantasy\t1939\t58.51
The Wolfman\tHorror\t2010\t37.01
The Wolverine\tComics\t2013\t80.94
The Woman in the Window\tCrime\t1944\t83.80
Thick As Thieves\tMystrey\t2009\t78.89
Think Like a Man\tComedy\t2012\t75.64
Thirteen Ghosts\tHorror\t2001\t74.20
This Is It\tBiography\t2009\t48.63
Thor\tComics\t2011\t84.19
Thor : The Dark World\tComics\t2013\t81.78
Thor: Ragnarok\tComics\t2017\t85.96
Three To Tango\tRomance\t1999\t72.01
Tideland\tAdventure\t2005\t61.00
Time Lapse\tThriller\t2014\t82.30
Timecop\tAction\t1994\t72.09
Tinker Tailor Soldier Spy\tWar\t2011\t1.97
Titanic\tRomance\t1997\t85.80
Titanic II\tDrama\t2010\t2.19
TMNT\tAnimation\t2007\t78.07
To Steal From a Thief\tAction\t2016\t82.06
Tokyo Story\tDrama\t1953\t68.77
Tolkien\tDrama\t2019\t69.70
Tom And Jerry\tAdventure\t2021\t65.90
Tomb Raider\tAdventure\t2018\t71.72
Tomorrowland\tSci-Fi\t2015\t66.97
Tooth Fairy\tComedy\t2010\t70.38
Totall Recall\tAction\t2011\t71.70
Totall Recall\tAction\t1999\t75.05
Tower Heist\tComedy\t2011\t61.63
Toy Story\tAnimation\t1995\t85.11
Toy Story 2\tAnimation\t1999\t84.27
Toy Story 3\tAnimation\t2010\t83.41
Toy Story 4\tAnimation\t2019\t83.65
Tracers\tAction\t2015\t1.45
Train To Busan\tHorror\t2016\t83.30
Training Day\tAction\t2001\t80.00
Trainwreck\tComedy\t2015\t16.44
Transcendence\tSci-Fi\t2014\t80.07
Transporter 2\tAction\t2005\t75.08
Transporter 3\tAction\t2008\t42.93
Treasure Planet\tAnimation\t2002\t82.97
Trespass\tThriller\t2011\t82.65
Trespass Against Us\tDrama\t2016\t62.47
Triangle\tHorror\t2009\t85.90
Triple 9\tAction\t2016\t55.93
Triple Frontier\tAction\t2019\t79.74
Trolls\tAnimation\t2016\t79.75
Trolls Holiday\tAnimation\t2017\t61.21
Tron Legacy\tSci-Fi\t2010\t63.02
Tropic Thunder\tComedy\t2008\t39.00
Troy\tAction\t2004\t80.38
True Grit\tDrama\t2010\t75.78
True Lies\tAction\t1994\t71.71
True Romance\tAction\t1993\t24.77
True Romance\tRomance\t1993\t67.62
True Story\tDrama\t2015\t80.42
TrueMemoirs ofAnInternationalAssassin\tComedy\t2016\t71.37
Trust\tDrama\t2010\t80.04
Truth or Dare\tHorror\t2018\t76.09
Tully\tDrama\t2018\t75.81
Turbo\tAnimation\t2013\t78.09
Turning Red\tAnimation\t2022\t82.90
Twilight\tHorror\t2008\t80.46
Twisted\tThriller\t2004\t74.50
Twister\tDisaster\t1990\t71.85
Unbreakable\tMystrey\t2000\t83.13
Unbroken\tWar\t2014\t64.45
Uncharted\tAdventure\t2022\t82.93
Uncle Buck\tComedy\t1989\t73.55
Uncut Gems\tDrama\t2019\t72.28
Undisputed\tAction\t2002\t79.74
Undisputed 2\tAction\t2006\t80.39
Undisputed 3\tAction\t2010\t80.18
Unfaithful\tDrama\t2002\t69.71
Unforgettable\tThriller\t2017\t79.02
Unfriended\tHorror\t2014\t81.65
Unit 7\tAction\t2012\t68.23
Universal Soldier\tWar\t1992\t80.12
Universal Soldier 2\tWar\t1999\t69.81
Universal Soldier 3\tWar\t2012\t71.02
Universal Soldier 4\tWar\t2012\t59.29
Unknown\tAction\t2011\t65.71
Unlocked\tAction\t2017\t77.86
Unsane\tThriller\t2018\t83.23
Unstoppable\tAction\t2010\t79.74
Up\tAnimation\t2009\t87.88
Upgrade\tThriller\t2018\t82.19
Upside Down\tFantasy\t2012\t75.95
Us\tThriller\t2019\t83.99
V For Vendetta\tThriller\t2005\t79.99
Vacancy\tThriller\t2007\t80.44
Vacation\tComedy\t2015\t84.74
Valkyrie\tWar\t2008\t68.85
Vampire Suck\tComedy\t2010\t10.23
Vamps\tHorror\t2012\t49.80
Van Helsing\tFantasy\t2004\t71.44
Vanilla Sky\tMystrey\t2001\t80.51
Vanishing on The 7th Street\tThriller\t2010\t76.45
Vantage Point\tAction\t2004\t85.37
Velvet Buzzsaw\tDrama\t2019\t72.29
Venom\tComics\t2018\t85.06
Venom: Let There Be Carnage\tComics\t2021\t84.00
Venom: The Last Dance\tComics\t2024\t82.92
Vice\tSci-Fi\t2015\t5.39
Victor Frankestian\tAdventure\t2015\t71.11
Vivarium\tThriller\t2020\t84.81
Vivo\tAnimation\t2021\t84.95
Wag The Dog\tComedy\t1997\t60.21
Wakefield\tDrama\t2016\t81.81
Wall Street: Money Never Sleeps\tDrama\t2010\t53.04
Wall-e\tAnimation\t2008\t83.66
Walled In\tHorror\t2009\t77.53
Wanted\tAction\t2008\t80.59
War\tAction\t2007\t79.74
War of The Planet of The Apes\tAction\t2017\t79.74
War of the Worlds\tAction\t2005\t80.44
Warcraft\tAdventure\t2016\t84.25
Warm Bodies\tRomance\t2013\t71.55
Watcher\tThriller\t2022\t78.52
Watchmen\tComics\t2008\t38.01
Watchmen: Chapter 1\tComics\t2024\t69.56
We Bought A Zoo\tComedy\t2011\t75.67
Weathering With You\tAnime\t2019\t82.95
Wedding Crashers\tComedy\t2005\t75.70
Welcome Home Roscoe Jenkins\tComedy\t2008\t73.60
We're The Millers\tComedy\t2013\t83.90
Werewolf By Night\tComics\t2022\t81.00
Wet Hot American Summer\tComedy\t2002\t38.40
What A Girl Wants\tComedy\t2003\t60.25
What Happened To Monday\tMystrey\t2017\t84.24
What Happens in Vegas\tComedy\t2008\t69.20
What to Expect when you're Expecting\tComedy\t2012\t73.65
What's the Worst That Could Happen?\tComedy\t2001\t78.36
When a Stranger Calls\tThriller\t2008\t80.29
When Angels Sleep\tCrime\t2018\t81.57
When in Rome\tRomance\t2010\t70.90
Where the Wild Things Are\tMystrey\t2009\t64.32
Whip It\tDrama\t2009\t62.52
Whiskey Tango Foxtrot\tComedy\t2016\t4.85
White Bird in A Bilzzard\tDrama\t2014\t50.87
White Chicks\tComedy\t2004\t81.25
White House Down\tAction\t2013\t84.63
White Noise\tHorror\t2005\t79.77
White Noise 2: The Light\tHorror\t2007\t79.77
Who Am I\tMystrey\t2014\t84.41
Why Him?\tComedy\t2016\t81.46
Wild Hogs\tComedy\t2007\t83.67
Wild Wild West\tDrama\t1999\t70.64
Wimbeldon\tRomance\t2004\t72.45
Winchester\tHorror\t2018\t80.45
Wind River\tDrama\t2017\t58.25
Winter's Bone\tDrama\t2010\t77.34
Wishmaster\tHorror\t1997\t38.18
Wishmaster 2\tHorror\t1999\t8.50
Wishmaster 3\tHorror\t2001\t18.65
Wishmaster 4\tHorror\t2002\t13.46
Wonder\tDrama\t2017\t80.22
Wonder Park\tAnimation\t2019\t82.14
Wonder Woman\tAnimation\t2009\t47.77
Wonder Woman\tComics\t2017\t81.75
Wonder Woman 1984\tComics\t2020\t77.49
World War Z\tDisaster\t2013\t80.67
World's Greatest Dad\tDrama\t2010\t80.11
Wrath of the Titans\tFantasy\t2012\t49.55
Wreck it Ralph\tAnimation\t2012\t84.28
Wrecked\tThriller\t2010\t82.52
Wrong Turn\tHorror\t2003\t72.39
Wrong Turn 2\tHorror\t2007\t69.77
Wrong Turn 3\tHorror\t2009\t55.80
Wrong Turn 4\tHorror\t2011\t53.61
Wrong Turn 5\tHorror\t2013\t65.46
Wrong Turn 6\tHorror\t2014\t56.58
X-Men\tComics\t2000\t84.58
X-Men 2\tComics\t2003\t84.34
X-Men: Apocalypse\tComics\t2016\t84.48
X-Men: Dark Phoenix\tComics\t2019\t84.06
X-Men: First Class\tComics\t2011\t84.13
X-Men: Origin\tComics\t2009\t85.44
X-Men: The Last Stand\tComics\t2006\t85.02
XXX\tAction\t2002\t70.06
xXx : Return of Xander Cage\tAction\t2017\t54.38
XXX 2\tAction\t2005\t50.22
Year One\tComedy\t2009\t61.68
YellowBrickRoad\tHorror\t2010\t51.19
Yes Man\tComedy\t2008\t80.76
Yes, God, Yes\tDrama\t2019\t58.38
Yogi Bear\tAnimation\t2010\t61.26
You Don't Mess With The Zohan\tComedy\t2008\t71.38
You Will Kill\tHorror\t2015\t70.84
You, Me and Dupree\tDrama\t2006\t72.30
Your Highness\tHistory\t2011\t64.07
Your Name\tAnime\t2016\t81.77
Zero Dark Thirty\tWar\t2012\t11.31
Zipper\tDrama\t2015\t49.18
Zookeeper\tComedy\t2011\t79.33
Zoolander\tComedy\t2001\t57.61
Zoolander 2\tComedy\t2016\t51.77
Zoom\tAdventure\t2006\t69.07
Zootapia\tAnimation\t2016\t84.29`

async function importMovies() {
  const lines = rawData.trim().split('\n')
  console.log(`Total movies to import: ${lines.length}`)

  let added = 0
  let skipped = 0
  let errors = 0

  // Fetch existing movies to check duplicates
  console.log('Fetching existing rated movies...')
  const existingRes = await fetch(`${API_BASE}?type=movie&hasRating=true`)
  const existingData = await existingRes.json()
  const existingMovies = existingData.items || existingData
  const existingSet = new Set(existingMovies.map(m => `${m.title.toLowerCase().trim()}_${m.year}`))
  console.log(`Found ${existingMovies.length} existing rated movies in DB`)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const parts = line.split('\t')
    if (parts.length < 4) {
      console.log(`Skipping invalid line ${i + 1}: ${line}`)
      errors++
      continue
    }

    const title = parts[0].trim()
    const genre = parts[1].trim()
    const year = parts[2].trim()
    const ratingStr = parts[3].trim()

    // Handle "Short" films (no numeric rating)
    const rating = parseFloat(ratingStr)
    if (!title || !year) {
      console.log(`Skipping invalid: ${line}`)
      errors++
      continue
    }

    // Check duplicate (by title + year)
    const dedupeKey = `${title.toLowerCase()}_${year}`
    if (existingSet.has(dedupeKey)) {
      console.log(`Skipping duplicate: ${title} (${year})`)
      skipped++
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
          userRating: isNaN(rating) ? 0 : rating,
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
      // Add to existing set to avoid duplicates within this batch
      existingSet.add(dedupeKey)

      if (added % 50 === 0) {
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
  console.log(`Added: ${added}`)
  console.log(`Skipped (duplicates): ${skipped}`)
  console.log(`Errors: ${errors}`)
  console.log(`Total processed: ${lines.length}`)
}

importMovies().catch(err => {
  console.error('Import failed:', err)
  process.exit(1)
})
