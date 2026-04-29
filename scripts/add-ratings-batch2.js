/**
 * Batch import movies to RATINGS ONLY
 * These will have userRating set so they only appear in "تقييماتي" tab
 * Run: node scripts/add-ratings-batch2.js
 */

const API_BASE = 'https://my-watchlist-rho.vercel.app/api/watchlist'

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
127 Hours	Adventure	2011	83.37
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
21 Jump Street	Comedy	2012	79.75
22 Jump Street	Comedy	2014	75.42
24 Redemption	Action	2008	80.45
28 Days Later	Horror	2002	79.49
28 Weeks Later	Horror	2007	70.70
30 Minutes or Less	Comedy	2011	78.92
300: Rise of An Empire	History	2014	70.67
4.3.2.1	Crime	2010	65.08
400 Days	Sci-Fi	2015	28.71
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
A Beautiful Day in The Neighborhood	Drama	2019	84.82
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
A Nightmare on Elm Street	Horror	2010	71.45
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
Adventures in Babysitting	Adventure	1987	81.03
Aeon Flux	Sci-Fi	2005	76.31
After Earth	Disaster	2013	55.54
After Life	Thriller	2009	70.96
After The Dark	Fantasy	2013	31.34
After The Sunset	Drama	2004	67.39
Aftermath	Thriller	2017	67.81
Agora	History	2009	70.68
AI: Artificial Intelligence	Sci-Fi	2001	70.93
Air	Sci-Fi	2019	82.99
Air	Thriller	2015	12.38
Air Force One	Thriller	1997	81.86
Aladdin	Animation	1992	83.39
Aladdin	Fantasy	2019	84.83
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
All The Money in The World	Drama	2018	78.46
All The Way	Drama	2016	77.08
Allied	Drama	2016	61.84
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
Anastasia	Animation	1997	72.90
Anatomy of a Fall	Crime	2023	83.07
Anchorman	Comedy	2004	80.38
Anchorman 2	Comedy	2013	75.44
Angel Has Fallen	Action	2019	81.82
Angels & Demons	Thriller	2009	81.46
Anger Management	Comedy	2003	83.63
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
Apocalypse Pompie	Disaster	2014	38.44
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
Assassins Creed	Action	2016	50.09
Assault On Precinct 13	Action	2005	80.10
Assault on Wall Street	Action	2013	4.44
ATM	Thriller	2012	69.43
Atomic Blonde	Action	2017	53.74
Atonement	Drama	2007	77.15
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
Bad Boys	Comedy	1995	80.92
Bad Boys 2	Comedy	2003	83.42
Bad Boys 3	Comedy	2020	80.15
Bad Company	Action	2002	69.01
Bad Moms	Comedy	2016	61.38
Bad Samaritan	Thriller	2018	81.37
Bad Teacher	Comedy	2011	64.87
Bait	Horror	2012	17.34
Ballerina	Animation	2016	61.05
Bandersnatch	Thriller	2018	90.00
Bandits	Comedy	2001	68.40
Bangkok Dangerous	Action	2008	69.45
Barber Shop	Comedy	2002	69.57
Barber Shop 2	Comedy	2004	57.22
Barber Shop 3	Comedy	2016	48.81
Barefoot Gen	Anime	1980	80.05
Barefoot Gen 2	Anime	1986	72.17
Barely Legal	Comedy	2006	59.83
Barnyard	Animation	2006	61.09
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
Before Midnight	Drama	2013	71.40
Before Sunrise	Romance	1995	64.36
Before Sunset	Romance	2004	67.73
Before We Go	Romance	2014	80.50
Behind Enemy Lines	War	2001	79.77
Being Flynn	Action	2012	6.74
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
Black Knight	Comedy	2001	78.13
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
Bolt	Animation	2008	69.08
Boogyman	Horror	2005	77.50
Boogyman 2	Horror	2007	70.72
Boogyman 3	Horror	2009	74.05
Boston Strangler	Crime	2023	61.62
Bounce	Romance	2000	71.96
Boundin'	Short	2004	0
Bowfinger	Comedy	1999	68.89
Boyka : Undisputed	Action	2016	79.06
Brahms The Boy II	Horror	2020	80.52
Brave	Animation	2012	75.19
Braveheart	Drama	1995	69.65
Brawl in Cell Block 99	Action	2017	80.03
Break	Survival	2019	52.73
Bride of Chucky	Horror	1998	45.88
Bride Wars	Comedy	2009	72.19
Bridemades	Comedy	2011	78.15
Bridge of Spies	Drama	2015	80.11
Brightburn	Thriller	2019	83.72
Bring it On	Comedy	2000	82.73
Bring it On 2	Comedy	2004	69.12
Bring it On 3	Comedy	2006	59.87
Bring it On 4	Comedy	2007	38.78
Bring it On 5	Comedy	2009	37.10
Bringing Down the House	Comedy	2003	72.20
Broken City	Drama	2013	70.44
Brooklyn	Romance	2015	59.03
Brooklyn Rules	Crime	2013	68.72
Brooklyn's Finest	Crime	2010	70.39
Brother Bear	Animation	2003	79.75
Brother Bear 2	Animation	2006	69.56
Brother Nature	Comedy	2016	57.35
Brothers	War	2009	71.03
Bruce Almighty	Comedy	2003	81.59
Bruno	Drama	2009	8.18
Bug	Horror	2007	71.46
Bugsy Malone	Drama	1976	44.37
Bullet Train	Action	2022	84.55
Bulletproof	Action	1996	79.07
Burn.E	Short	2008	0
Burried	Drama	2010	81.61
Candleshoe	Drama	1977	61.89
Captain America : Civil War	Comics	2016	87.55
Captain America: Brave New World	Comics	2025	76.51
Captain America: The First Avenger	Comics	2010	84.04
Captain America: Winter Soldier	Comics	2014	85.46
Captain Fantastic	Drama	2016	36.78
Captain Marvel	Comics	2019	82.11
Captain Phillips	Action	2013	80.13
Captain Underpants	Animation	2017	72.10
Captive State	Drama	2019	11.74
Carnage	Drama	2011	83.69
Carol	Drama	2015	69.24
Carrie	Horror	2013	69.31
Cars	Animation	2006	77.99
Cars 2	Animation	2011	75.22
Cars 3	Animation	2017	79.18
Case 39	Thriller	2009	80.28
Cashback	Action	1999	3.50
Casino Royale	Action	2006	82.12
Casper	Comedy	1995	81.28
Cast Away	Drama	2000	82.23
Catch Me if You Can	Drama	2002	81.97
Catch.44	Action	2011	8.89
Catwoman	Comics	2004	37.96
Cedar Rapids	Comedy	2011	61.42
Celeste & Jesse Forever	Romance	2012	62.94
Central Intelligence	Comedy	2016	80.82
Chained	Horror	2012	11.95
Chalet Girl	Romance	2011	40.52
Changeling	Drama	2008	80.88
Chaos	Action	2005	80.01
Charlie St. Cloud	Drama	2010	69.66
Charlie's Angel	Comedy	2000	69.13
Charlie's Angel 2	Comedy	2003	59.91
Che: Part One	Biography	2008	68.31
Che: Part Two	Biography	2008	51.61
Cheaper By The Dozen	Comedy	2003	78.17
Cheaper By The Dozen 2	Comedy	2005	72.21
Chicken Run	Animation	2000	72.95
Child's Play	Horror	1988	70.73
Child's Play 2	Horror	1990	64.15
Child's Play 3	Horror	1991	60.42
Children of Men	Thriller	2006	79.66
Child's Play	Horror	2019	48.12
Chinese Zodiac	Action	2012	65.58
Chloe	Romance	2010	79.60
Chocolat	Romance	2001	52.09
Churchill	Drama	2017	61.93
Cinderella	Animation	1950	80.42
Cinderella	Fantasy	2015	75.86
Cinderella II	Animation	2001	72.11
Cinderella III	Animation	2007	70.16
Circle	Thriller	2015	80.90
Citizen Kane	Drama	1941	69.25
City of Angels	Romance	1998	69.78
City of Lies	Crime	2018	69.64
Civic Duty	Drama	2006	68.74
Civil War	Action	2024	79.87
Clash of Titans	Fantasy	2010	50.92
Cleaner	Crime	2008	61.72
Click	Comedy	2006	86.25
Closer	Romance	2004	76.17
Cloudy With A Chance of A Meatballs 2	Animation	2013	84.26
Cloudy with a Chance of Meatballs	Animation	2009	80.89
Cloverfield	Thriller	2008	68.98
Clown	Horror	2014	72.34
Coco	Animation	2017	85.95
Code Name: The Cleaner	Comedy	2007	71.19
Cold Mountin	Drama	2003	69.67
Cold Pursuit	Action	2019	68.02
Collateral Beauty	Drama	2016	84.75
Collateral Damage	Action	2002	80.75
College Road Trip	Comedy	2008	71.77
Columbiana	Action	2011	59.49
Come and Find Me	Thriller	2016	17.77
Commando	War	1985	79.03
Con Air	Action	1997	67.01
Conan The Barbarian	History	2011	55.67
Concussion	Drama	2015	84.37
Contagion	Thriller	2011	81.15
Contraband	Action	2012	72.04
Contracted	Horror	2013	13.89
Cop Out	Comedy	2010	63.57
Coraline	Animation	2009	85.07
Coriolanus	War	2011	38.61
Corpse Bride	Animation	2005	82.21
Costantine	Horror	2005	84.85
Cougar Club	Comedy	2007	7.40
Countdown	Horror	2019	78.74
Countdown	Thriller	2016	60.54
Cowboys & Alliens	Action	2011	64.49
Crank	Action	2006	82.00
Crank 2	Action	2009	80.03
Crash	Thriller	2004	85.12
Crazy Heart	Drama	2009	70.45
Creed	Action	2015	82.20
Creep	Horror	2005	80.12
Cruel Intentions	Drama	1999	66.89
Cruella	Fantasy	2021	79.99
Cube	Mystrey	1997	83.31
Cult of Chucky	Horror	2017	53.35
Curse of Chucky	Horror	2013	49.60
Cyborg	Action	1989	68.06
Cyrus	Comedy	2010	79.75
Daddy Day Camp	Comedy	2007	71.78
Daddy's Day Care	Comedy	2003	69.14
Daddy's Home	Comedy	2015	73.05
Daddy's Home 2	Comedy	2017	71.20
Dallas Buyer Club	Drama	2013	79.37
Dare	Thriller	2011	67.89
Dark Shadows	Horror	2012	38.48
Darkness Falls	Horror	2003	53.48
Darling Compantion	Drama	2012	70.46
Date Night	Comedy	2010	73.10
Dawn of the Planet of Apes	Action	2014	74.59
Dead Fall	Drama	2012	39.04
Dead Poets Society	Drama	1989	80.03
Deadpool	Comics	2016	85.47
Deadpool 2	Comics	2018	81.30
Deadpool 3	Comics	2024	85.87
Dear John	Romance	2009	78.92
Death At Funeral	Comedy	2010	80.16
Death Note	Thriller	2017	79.71
Death Race	Action	2008	80.28
Death Race 2	Action	2010	64.53
Death Race 3	Action	2013	42.45
Death Tunnel	Horror	2005	27.84
Death Warrant	Action	1990	71.61
Deep	Animation	2017	46.39
Deep Blue Sea	Drama	1999	61.97
Deepwater Horizon	Adventure	2016	79.16
Déjà Vu	Action	2006	80.46
Delirium	Horror	2018	70.74
Demolition	Drama	2015	80.08
Demolition Man	Action	1993	82.93
Demonic	Horror	2015	12.17
Derailed	Action	2002	74.64
Derailed	Action	2005	79.08
Descendants	Fantasy	2015	70.65
Despicable Me	Animation	2010	80.97
Despicable Me 2	Animation	2012	80.98
Despicable Me 3	Animation	2017	82.78
Despicable Me 4	Animation	2024	81.07
Despite The Falling Snow	Drama	2016	15.18
Detachment	Drama	2011	85.71
Die Hard 1	Action	1988	83.00
Die Hard 2	Action	1990	71.62
Die Hard: With a Vengeance	Action	1995	72.05
Dinner For Schumbacks	Comedy	2010	73.15
Dirty Grandpa	Comedy	2015	69.15
Disaster Movie	Comedy	2008	69.16
Disturbia	Thriller	2007	81.89
Divergent	Fantasy	2014	84.49
Djinn	Horror	2013	81.22
Doctor Sleep	Thriller	2019	83.14
Doctor Strange	Comics	2016	91.00
Doctor Strange: The Multiverse of Madness	Comics	2022	87.92
Dodgeball: A True Undercover Story	Comedy	2004	78.19
Dogma	Drama	1999	60.00
Dolittle	Fantasy	2020	77.37
Don Jon	Drama	2013	50.77
Donnie Darko	Thriller	2002	81.31
Don't Breathe	Thriller	2016	78.98
Don't Hang Up	Thriller	2016	79.67
Doom	Action	2005	37.88
Dorothy Mills	Horror	2008	51.03
Double Impact	Action	1991	69.46
Doubt	Drama	2008	77.21
Down a Dark Hall	Horror	2018	70.75
Downfall	War	2004	80.37
Dracula 2000	Horror	2000	69.32
Drag Me To Hell	Horror	2009	79.77
Dread	Action	2012	9.11
Dream House	Horror	2011	81.96
Dreamer	Drama	2005	79.76
Drillbit Taylor	Comedy	2008	68.44
Drive Angry	Action	2011	71.06
Driven	Action	2001	74.66
Driving Miss Daisy	Drama	1989	83.10
Duane Hopwood	Romance	2005	70.86
Dude Where's My Car	Comedy	2000	63.61
Due Date	Comedy	2010	71.21
Dumb & Dumber	Comedy	1994	84.92
Dumb & Dumber 2	Comedy	2014	79.75
Dumb&Dumberer:WhenHarryMetLoyd	Comedy	2003	70.24
Dumbo	Animation	1941	84.16
Dumbo	Fantasy	2019	71.92
Dunkirk	Drama	2017	81.27
Eagle Eye	Thriller	2008	71.59
Easy A	Comedy	2010	52.46
Easy Money	Action	2010	69.03
Eddie The Eagle	Drama	2016	77.24
Edge of Tomorrow	Sci-Fi	2014	79.77
Edward Scissorhands	Sci-Fi	1990	79.64
Edwin Boyd: Citizen Gangster	Crime	2011	25.21
Elektra	Comics	2005	78.38
Elf	Comedy	2003	80.97
Elizabethtown	Romance	2005	59.16
Elysium	Sci-Fi	2013	80.36
Emergency Declaration	Thriller	2021	85.72
Encanto	Animation	2021	83.11
End Game	Action	2006	79.73
End of Days	Action	1999	79.09
Endless Love	Romance	1981	80.49
Enemy	Thriller	2013	84.79
Enemy At the Gates	Action	2001	79.10
Enemy of the State	Action	1998	80.54
Enough Said	Drama	2013	79.76
Envy	Drama	2004	80.54
Epic	Fantasy	2013	75.89
Epic Movie	Comedy	2007	67.22
Equals	Sci-Fi	2015	68.82
Equilibrium	Sci-Fi	2002	81.74
Erased	Action	2012	83.77
Erin Brockovich	Drama	2000	79.76
Escape From Pretoria	Mystrey	2020	80.31
Escape Plan	Action	2013	83.05
Escape Plan 2: Hades	Action	2018	79.11
Escape Plan 3: The Extractors	War	2019	49.99
Escape Room	Thriller	2019	81.91
Escape Room 2	Thriller	2021	80.42
Eternal Sunshine of The Spotless Mind	Romance	2004	83.71
Eternals	Comics	2021	84.00
Euro Trip	Comedy	2004	59.95
Evan Almighty	Comedy	2007	80.53
Everest	Adventure	2015	7.39
Everybody Wants Some	Romance	2016	51.24
Everything Must Go	Drama	2011	80.55
Everything Will Be Fine	Drama	2015	37.57
Ex Machina	Sci-Fi	2015	79.65
Exam	Mystrey	2009	84.78
Exit Humanity	Horror	2011	7.93
Exit Wounds	Drama	2011	67.43
Extract	Comedy	2009	68.48
Extraction	Action	2020	80.62
Extraction 2	Action	2023	83.01
Extraordinary Measures	Drama	2010	78.47
Extreme Movie	Comedy	2009	71.22
F9: The Fast Saga	Action	2021	63.09
Face/Off	Drama	1993	85.45
Faces In The Crowd	Crime	2011	70.40
Fair Game	Drama	2010	79.38
Fame	Drama	2009	66.21
Family Switch	Adventure	2023	79.98
Fantastic Beasts	Fantasy	2016	84.77
Fantastic Beasts 2	Fantasy	2018	84.22
Fantastic Beasts: The Secrets of Dumbledore	Fantasy	2022	83.79
Fantastic Four	Comics	2005	84.47
Fantastic Four: Rise of the Silver Surfer	Comics	2007	83.43
Far Cry	Action	2008	59.53
Far From The Madding Crowd	Drama	2015	70.47
Fargo	Crime	1995	38.83
Fast & Furious 4	Action	2009	6.64
Fast and Furiose: Hobbs and Shaw	Action	2019	83.35
Fast And Furious 6	Action	2013	82.54
Fast Five	Action	2011	74.69
Fast X	Action	2023	87.92
Faster	Action	2010	65.63
Father of the Bride	Comedy	1991	71.79
Father of the Bride II	Comedy	1995	71.23
Ferdinand	Animation	2017	79.75
Fifty Shades Darker	Romance	2017	79.61
Fifty Shades of Grey	Romance	2015	80.25
Fight Club	Action	1999	83.18
Filth	Crime	2013	61.76
Final Destination	Horror	2000	83.95
Final Destination 2	Horror	2003	81.95
Final Destination 3	Horror	2006	80.60
Final Destination 4	Horror	2009	80.57
Final Destination 5	Horror	2011	81.94
Finch	Sci-Fi	2021	75.92
Finding Dory	Animation	2016	83.53
Finding Forrester	Drama	2001	70.48
Finding Nemo	Animation	2003	83.54
Finding Neverland	Drama	2008	62.01
First Blood	Action	1982	71.63
First Daughter	Romance	2004	70.87
First Man	Drama	2018	79.39
First Match	Action	2018	60.71
Flatliners	Thriller	2017	68.83
Flee	Animation	2021	83.01
Flight	Drama	2012	80.01
Flipped	Romance	2010	79.62
Florence Foster Jenkins	Comedy	2016	79.75
Flushed Away	Animation	2006	82.57
Fly Papper	Romance	2011	69.39
Flyboys	War	2006	51.51
Focus	Drama	2015	80.24
Fools Rush In	Romance	1997	79.77
For The Birds	Short	2001	0
For The Love of Money	Drama	2012	70.49
Ford v Ferrari	Drama	2019	84.76
Forrest Gump	Drama	1994	81.20
Forsaken	Western	2015	69.44
Four Brothers	Action	2005	63.27
Fractured	Thriller	2019	82.43
Freaky Friday	Comedy	2003	61.47
Freaky Friday	Adventure	1976	52.93
Freddy vs. Jason	Horror	2003	21.71
Free Birds	Animation	2013	71.13
Free Guy	Adventure	2021	84.99
Free State of Jones	Drama	2015	79.40
Freerunner	Action	2011	7.34
Frequency	Thriller	2000	83.15
Friday After Next	Comedy	2002	71.24
Friday The 13th	Horror	2009	68.80
Friday The 13th 1	Horror	1980	51.08
Friday The 13th 2	Horror	1981	10.66
Friday The 13th 3	Horror	1982	9.49
Friday The 13th 4	Horror	1983	9.29
Friday The 13th 5	Horror	1984	7.18
Friday The 13th 6	Horror	1985	6.79
Friday The 13th 7	Horror	1986	9.19
Friday The 13th 8	Horror	1987	8.91
Friday The 13th The Fiinal	Horror	1993	1.80
Friend Request	Horror	2016	70.76
Friends With Benefits	Romance	2011	76.20
Friends With Kids	Romance	2013	41.01
Fright Night	Horror	2011	64.20
From Dusk Till Dawn	Horror	1996	74.10
From Paris With Love	Action	2010	72.60
From Prada To Nada	Drama	2011	69.26
Frozen	Animation	2013	82.75
Frozen 2	Animation	2019	82.33
Frozen Fever	Animation	2015	0
Fun With Dick and Jane	Comedy	2005	80.58
Funny Games	Thriller	2007	76.34
Funny People	Comedy	2009	80.11
Furious 7	Action	2015	82.55
Furry Vengeance	Adventure	2010	77.88
Fury	War	2014	81.36
G.I. Joe: Retaliation	Action	2013	74.72
G.I. Joe: The Rise of Cobra	Action	2009	81.17
Gallowwalkers	Horror	2012	69.33
Game Night	Comedy	2018	81.21
Gamer	War	2009	74.55
Gangs of New York	Action	2002	53.87
Gardens Of The Night	Horror	2008	75.98
Garfield	Animation	2004	68.27
Geostorm	Disaster	2017	69.21
Gerald's Game	Thriller	2017	78.33
Get Carter	Action	2000	68.10
Get Hard	Comedy	2015	76.80
Get Out	Thriller	2017	85.87
Get Smart	Comedy	2008	80.85
Get The Gringo	Action	2012	72.65
Ghost	Romance	1990	83.58
Ghost House	Horror	2017	40.05
Ghost Rider	Action	2007	53.99
Ghost Rider 2	Action	2012	54.12
Ghost Ship	Horror	2002	79.98
Ghostbusters	Comedy	2016	65.88
Gifted	Drama	2017	70.50
Ginger Snaps	Horror	2001	72.35
Ginger Snaps 2	Horror	2004	48.29
Ginger Snaps 3	Horror	2004	69.34
Girl, Interrupted	Drama	2004	79.41
Gladiator	History	2000	79.48
Glass	Thriller	2019	84.43
Gnomeo And Juliet	Animation	2010	79.19
Gods of Egypt	Fantasy	2016	69.29
Godzilla	Disaster	2014	65.12
Godzilla	Disaster	1998	70.41
Godzilla: King of Monsters	Disaster	2019	80.28
Gold	Drama	2016	70.51
Gone	Thriller	2012	79.68
Gone Baby Gone	Drama	2007	37.62
Gone Girl	Mystrey	2014	81.23
Gone in 60 Seconds	Action	2000	68.15
Gone With The Wind	Drama	1939	81.42
Good Luck Chuck	Comedy	2007	65.92
Goosebumps	Fantasy	2015	78.61
Goosebumps : Haunted Halloween	Comedy	2018	79.52
Gothika	Horror	2003	76.00
Gran Torino	Drama	2009	80.09
Grand Piano	Thriller	2013	80.23
Gravity	Adventure	2013	81.16
Green Book	Drama	2019	84.88
Green Lantern	Comics	2011	50.71
Green Lantern 1	Animation	2009	50.45
Green Lantern 2	Animation	2011	46.57
Green Zone	War	2009	72.03
Greyhound	War	2020	76.51
Groundhog Day	Adventure	1993	82.77
Grown Ups	Comedy	2010	83.09
Grown Ups 2	Comedy	2013	82.10
Guardiance of The Galaxy	Comics	2014	83.28
Guardians	Sci-Fi	2017	37.79
Guardians of the Galaxy Vol.2	Comics	2017	80.98
Guardians of the Galaxy Vol.3	Comics	2023	86.05
Guillermo Del Toro's Pinocchio	Animation	2022	84.52
Guilty	Crime	2021	80.18
Gulliver's Travels	Comedy	2010	76.83
Hachi: A Dog Story	Drama	2009	84.00
Hacksaw Ridge	War	2016	83.17
Hall Pass	Comedy	2011	78.20
Halloween	Horror	2002	66.34
Halloween 2	Horror	2007	79.50
Halloween 3	Horror	2009	71.47
Hancock	Action	2008	80.47
Hangman	Action	2018	71.07
Hanna	Action	2011	59.58
Hannah Montana: The Movie	Comedy	2009	69.58
Hannibal	Crime	2001	54.77
Hannibal Raising	Crime	2007	46.91
Hansel & Gretel	Fantasy	2013	78.63
Happy Death Day	Horror	2017	83.45
Happy Death Day 2U	Horror	2019	78.76
Happy Feet	Animation	2006	63.52
Hard Boiled Sweets	Crime	2012	3.98
Hard Candy	Horror	2006	51.98
Hard Target	Action	1993	72.06
Harrison's Flowers	Drama	2001	79.76
Harry Potter 1	Fantasy	2001	84.94
Harry Potter 2	Fantasy	2002	84.95
Harry Potter 3	Fantasy	2004	85.52
Harry Potter 4	Fantasy	2005	85.53
Harry Potter 5	Fantasy	2007	84.96
Harry Potter 6	Fantasy	2009	85.54
Harry Potter 7	Fantasy	2010	84.97
Harry Potter 8	Fantasy	2011	86.31
Hatching	Horror	2022	72.65
Haywire	Action	2011	29.15
Head of State	Comedy	2003	69.59
Heartbreakers	Comedy	2001	60.00
Heat	Action	1995	80.19
Heist	Action	2015	80.34
Heist	Action	2001	82.03
Henry's Crime	Crime	2010	51.88
Her	Romance	2013	83.47
Hercules	History	2014	69.73
Here Comes The Boom	Comedy	2012	80.74
Hereafter	Romance	2010	71.97
Hereditary	Horror	2018	82.62
Heretic	Thriller	2024	84.00
Hidden Figures	Drama	2016	81.11
Hide and Seek	Thriller	2005	79.77
High Life	Sci-Fi	2019	31.77
High Noon	Action	1952	70.07
High School Musical	Comedy	2006	79.75
High School Musical 2	Comedy	2007	79.75
High School Musical 3: Senior Year	Comedy	2008	79.75
High Strug	Comedy	1991	37.14
His House	Thriller	2020	85.09
Hitch	Comedy	2005	80.17
Hitman	Action	2007	79.12
Hitman : Agent 47	Action	2015	71.64
Holes	Adventure	2003	22.59
Home	Animation	2015	82.13
Home Alone	Comedy	1990	84.72
Home Alone 2	Comedy	1992	80.83
Home Alone 3	Comedy	1997	79.26
Home Alone 4	Comedy	2002	61.51
Home Alone 5	Comedy	2014	64.91
Home Sweet Hell	Comedy	2015	46.74
Honey	Drama	2003	52.62
Honey 2	Drama	2011	8.29
Honey, I Blew Up the Kid	Comedy	1992	75.50
Honey, I Shrunk the Kids	Comedy	1989	71.25
Hop	Comedy	2011	78.22
Horrible Bosses	Comedy	2011	79.75
Horrible Bosses 2	Comedy	2014	75.53
Horton Hears a Who!	Animation	2008	80.73
Hostage	Action	2005	82.31
Hostel	Horror	2006	67.60
Hostel II	Horror	2007	8.36
Hostel III	Horror	2011	37.31
Hot Fuzz	Action	2007	64.57
Hot Tub Time Machine	Comedy	2011	70.25
Hot Tub Time Machine 2	Comedy	2015	13.67
Hotel Artemis	Action	2018	79.13
Hotel Transylvania	Animation	2012	79.75
Hotel Transylvania 2	Animation	2015	79.20
Hotel Transylvania 3	Animation	2018	80.47
Hotel Transylvania 4: Transformania	Animation	2021	80.08
Hours	Disaster	2013	80.42
House At The End Of The Street	Horror	2012	81.44
House of the Dead	Horror	2003	7.99
House of the Rising Sun	Action	2011	9.33
House of Wax	Horror	2005	78.78
How It Ends	Sci-Fi	2018	81.93
How To Be Single	Comedy	2016	37.92
How to Lose a Guy in 10 Days	Romance	2003	67.77
How to Lose Friends & Alienate People	Romance	2008	51.29
Howl's Moving Castle	Anime	2004	81.84
Hugo	Fantasy	2011	70.66
Hulk	Comics	2003	71.83
Hunger	Horror	2009	78.80
Hush	Thriller	2016	82.88
I Am Legend	Thriller	2007	84.50
I Am Mother	Sci-Fi	2019	72.50
I Am Number Four	Sci-Fi	2011	14.75
I Am Wrath	Action	2016	66.51
I Do Until I Don't	Comedy	2017	50.55
I Don't Know How She Does It	Drama	2011	65.16
I Hate Valentine's Day	Comedy	2009	68.52
I Know What You Did Last Summer	Horror	1997	79.77
I Lost My Body	Animation	2019	84.17
I Love You Beth Cooper	Comedy	2008	73.20
I Love You Man	Comedy	2009	80.19
I Love You Phillip Morris	Comedy	2009	67.26
I Now Pronounce You Chuck and Larry	Comedy	2007	84.12
I Origins	Fantasy	2014	69.72
I Saw The Devil	Crime	2010	79.98
I See You	Thriller	2019	80.10
I Spy	Comedy	2002	71.80
I Still Know What You Did Last Summer	Horror	1998	80.48
I, Robot	Action	2004	83.61
Ice Age	Animation	2002	84.91
Ice Age 2	Animation	2006	79.75
Ice Age 3	Animation	2009	78.01
Ice Age 4	Animation	2012	81.60
Ice Age 5	Animation	2016	71.14
Ice Age 6	Animation	2022	56.77
Identity	Thriller	2003	85.15
IF	Adventure	2024	83.71
If Only	Romance	2004	85.91
I'll Always Know What You Did Last Summer	Horror	2006	69.35
I'm Thinking of Ending Things	Thriller	2020	82.91
Imagine Me & You	Romance	2015	71.98
Imagine That	Comedy	2009	78.24
Immaculate	Horror	2024	73.93
Immortals	History	2011	74.00
In The Heart of The Sea	Adventure	2015	50.34
In the Name of The King	History	2007	69.30
In The Tall Grass	Horror	2019	80.68
In The Valley of Elah	Action	2007	67.05
In Time	Thriller	2011	51.40
Incarnate	Horror	2016	72.36
Inception	Sci-Fi	2011	88.27
Incredibles 2	Animation	2019	80.27
Independence Day	Adventure	1996	72.85
Independence Day : Resurgence	Adventure	2016	60.92
Inferno	Thriller	2016	83.32
Inglourious Basterds	War	2009	68.84
Injustice	Comics	2021	76.62
Inland Empire	Drama	2006	50.82
Inside Man	Action	2006	82.39
Inside Out	Animation	2015	85.83
Inside Out 2	Animation	2024	84.00
Insidious	Horror	2010	82.50
Insidious 2	Horror	2013	81.72
Insidious 3	Horror	2015	80.61
Insidious: The Last Key	Horror	2018	80.09
Insidious: The Red Door	Horror	2023	83.03
Insomnia	Thriller	2002	80.10
Insurgent	Action	2015	77.67
Interrogation	Action	2016	59.62
Interstellar	Thriller	2014	84.51
Into The Blue	Romance	2005	26.52
Into The Forest	Thriller	2015	79.78
Into The Storm	Drama	2014	79.42
Into The Wild	Drama	2007	70.52
Into The Woods	Fantasy	2014	77.46
Intruder	Thriller	2016	78.99
Iron Man	Comics	2008	83.91
Iron Man 2	Comics	2010	81.79
Iron Man 3	Comics	2013	84.14
Iron Sky	Sci-Fi	2012	11.09
Irresistible	Thriller	2006	79.69
Isi & Ossi	Romance	2020	78.93
It	Horror	2017	81.29
It Comes At Night	Horror	2017	56.45
It: Chapter 2	Horror	2019	70.77
It's a Boy Girl Thing	Comedy	2006	71.26
It's a Wonderful Life	Drama	1946	81.56
It's Complicated	Drama	2010	54.90
It's Kind of A Funny Story	Comedy	2010	61.55
J Edgar	Crime	2011	63.90
Jack and Jill	Comedy	2011	71.27
Jack Reacher	Action	2012	69.85
Jack Reacher: Never Go Back	Action	2016	60.75
Jack The Giant Slayer	Fantasy	2013	71.93
Jackie	Drama	2016	71.41
Jack-Jack Attack	Short	2005	0
Jane Eyre	Drama	2011	39.09
Jason Bourne	Action	2016	69.47
Jason X	Horror	2002	7.25
Jaws	Horror	1975	58.64
Jaws 2	Horror	1978	44.85
Jaws 3	Horror	1983	44.88
Jaws 4	Horror	1987	44.93
JCVD	Biography	2008	8.22
Jeepers Creepers	Horror	2001	79.51
Jeepers Creepers 2	Horror	2003	69.36
Jeff Who Lives At Home	Comedy	2011	80.03
Jennifer's Body	Horror	2009	72.37
Jenny's Wedding	Comedy	2015	37.49
Jerry Maguire	Romance	1996	77.99
Jessabelle	Horror	2014	74.15
Jigsaw	Horror	2017	83.29
Joe Dirt	Comedy	2001	69.17
Joe Dirt 2	Comedy	2015	9.99
Joe Somebody	Comedy	2001	63.65
John Carter	Fantasy	2012	80.35
John Q	Drama	2002	80.30
John Tucker Must Die	Comedy	2006	69.18
John Wick	Action	2014	85.01
John Wick 4	Action	2023	86.92
John Wick: Chapter 2	Action	2017	85.55
John Wick: Chapter 3	Action	2019	85.76
Johnny English	Comedy	2003	83.77
Johnny English: Reborn	Comedy	2011	83.87
Jojo Rabbit	Comedy	2019	52.99
Joker	Drama	2019	87.34
Journey 2: Mysterious Island	Adventure	2012	79.74
Journey to The Center of The Earth	Adventure	2008	71.08
Joy	Drama	2015	69.27
Joy Ride	Horror	2001	80.02
Joy Ride 2	Horror	2008	14.10
Joy Ride 3	Horror	2014	1.00
Ju On : The Final Curse	Horror	2015	60.46
Judy Moodyand The Not Bummer Summer	Comedy	2011	36.74
Julia's Eyes	Thriller	2010	83.22
Julie & Julia	Drama	2009	63.94
Jumanji	Comedy	1995	85.43
Jumanji: The Next Level	Adventure	2019	84.90
Jumanji: Welcome To The Jungle	Adventure	2017	85.41
Jumper	Sci-Fi	2008	70.94
Jumping The Broom	Comedy	2012	70.26
Juno	Comedy	2007	51.66
Jupiter Ascending	Sci-Fi	2015	0.00
Jurassic Park	Adventure	1993	80.54
Jurassic Park 2	Adventure	1997	67.14
Jurassic Park 3	Adventure	2001	70.10
Jurassic World	Adventure	2015	80.81
Jurassic World: Fallen Kingdom	Adventure	2018	69.55
Just Go With It	Romance	2011	79.77
Just Like Heaven	Romance	2005	79.77
Just Married	Romance	2005	68.96
Justice League	Animation	2008	65.75
Justice League	Comics	2017	83.92
Justice League : Crisis of Two Earths	Animation	2010	71.15
Justice League : Flashpoint Paradox	Animation	2013	82.59
Justice League Dark	Animation	2016	65.79
Kakushigoto Movie	Anime	2021	62.61
Keeping Mum	Comedy	2005	82.96
Keeping Up With The Joneses	Comedy	2016	72.22
Kevin Hart What Now?	Comedy	2016	80.65
Kick Ass	Adventure	2010	70.11
Kick Ass 2	Adventure	2013	38.96
Kidnap	Action	2017	69.48
Killer Elite	Action	2011	64.62
Killers	Comedy	2010	48.98
Killing Gunther	Action	2017	36.66
Kinds of Kindness	Drama	2024	77.00
King Arthur	Action	2004	69.86
King Arthur : Legend of the Sword	History	2017	65.29
King Kong	Adventure	2005	82.58
Kingdom of Heaven	Action	2005	59.66
Kingsman: The Golden Circle	Action	2017	82.44
Kingsman: The Secret Service	Action	2015	84.01
Klaus	Animation	2019	85.74
Knight And Day	Action	2010	69.87
Knives Out	Crime	2019	82.48
Knowing	Thriller	2009	84.80
Kong: Skull Island	Disaster	2017	78.42
Krampus	Comedy	2015	70.27
Kung Fu Panda	Animation	2008	80.26
Kung Fu Panda 2	Animation	2011	75.25
Kung Fu Panda 3	Animation	2015	72.12`

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
