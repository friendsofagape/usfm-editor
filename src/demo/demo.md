```js
const usfmStrings = new Map([
["small", `
\\id GEN
\\c 1
\\p
\\v 1 the first verse
\\s section
`],

["usfmString1", `
\\id GEN
\\c 1
\\p Front stuffs
\\v 1 the first verse
\\v 2 the second verse
\\v 15 Tell the Israelites that I, 
the \\nd Lord\\nd*, the God of their 
ancestors, the God of Abraham, Isaac, 
and Jacob,
`],

["usfmString2", `
\\id GEN
\\c 1
\\v 1 the first verse
\\v 2 the second verse
\\c 2
\\v 1 the first verse
\\v 2 the second verse
`],

["Mark 1 paragraphs", `
\\id MRK Unlocked Literal Bible
\\ide UTF-8
\\h Mark
\\toc1 The Gospel of Mark
\\toc2 Mark
\\toc3 Mrk
\\mt Mark

\\s5
\\c 1
\\p
\\v 1 This is the beginning of the gospel of Jesus Christ, the Son of God.
\\p
\\v 2 As it is written in Isaiah the prophet,
\\q "Look, I am sending my messenger before your face,
\\q the one who will prepare your way.
\\q
\\v 3 The voice of one calling out in the wilderness,
\\q 'Make ready the way of the Lord;
\\q make his paths straight.'"
\\m

\\s5
\\p
\\v 4 John came, baptizing in the wilderness and preaching a baptism of repentance for the forgiveness of sins.
\\v 5 The whole country of Judea and all the people of Jerusalem went out to him. They were baptized by him in the Jordan River, confessing their sins.
\\v 6 John wore a coat of camel's hair and a leather belt around his waist, and he ate locusts and wild honey.
`],

["usfmNestedTags", `
\\id GEN
\\c 1
\\p
\\v 1 the first verse
\\v 2 the second verse
\\v 14 That is why \\bk The Book of 
the \\+nd Lord\\+nd*'s Battles\\bk* 
speaks of “...the town of Waheb in 
the area of Suphah
`],

["Isaiah 1", `
\\id ISA Unlocked Literal Bible
\\ide UTF-8
\\h Isaiah
\\toc1 The Book of Isaiah
\\toc2 Isaiah
\\toc3 Isa
\\mt Isaiah
\\s5
\\c 1
\\p
\\v 1 The vision of Isaiah son of Amoz, that he saw concerning Judah and Jerusalem, in the days of Uzziah, Jotham, Ahaz, and Hezekiah, kings of Judah.

\\s5
\\q1
\\v 2 Hear, heavens, and give ear, earth; for Yahweh has spoken:
\\q1 "I have nourished and brought up children, but they have rebelled against me.
\\q1
\\v 3 The ox knows his owner, and the donkey his master's feeding trough,
\\q1 but Israel does not know, Israel does not understand."

\\s5
\\q1
\\v 4 Woe! Nation, sinners, a people weighed down with iniquity,
\\q1 offspring of evildoers, sons who act corruptly!
\\q1 They have abandoned Yahweh, they have despised the Holy One of Israel,
\\q1 they have estranged themselves from him.

\\s5
\\q1
\\v 5 Why are you still being beaten? Why do you rebel more and more?
\\q1 The whole head is sick, the whole heart is weak.
\\q1
\\v 6 From the sole of the foot to the head there is no part unharmed;
\\q only wounds, and bruises, and fresh open wounds;
\\q1 they have not been closed, cleansed, bandaged, nor treated with oil.

\\s5
\\q1
\\v 7 Your country is ruined; your cities are burned;
\\q1 your fields—in your presence, strangers are destroying them—
\\q1 abandoned devastation, overthrown by strangers.
\\q1
\\v 8 The daughter of Zion is left like a hut in a vineyard,
\\q1 like a shed in a garden of cucumbers, like a besieged city.

\\s5
\\q1
\\v 9 If Yahweh of hosts had not left for us a small remnant,
\\q1 we would have been like Sodom, we would have been like Gomorrah.

\\s5
\\q1
\\v 10 Hear the word of Yahweh, you rulers of Sodom;
\\q1 listen to the law of our God, you people of Gomorrah:
\\q1
\\v 11 "What is the multitude of your sacrifices to me?" says Yahweh.
\\q1 "I have had enough of the burnt offerings of rams, and the fat of fatted beasts;
\\q1 and in the blood of bulls, lambs, or goats I do not delight.

\\s5
\\q1
\\v 12 When you come to appear before me,
\\q1 who has required this of you, to trample my courts?
\\q1
\\v 13 Bring no more meaningless offerings; incense is an abomination to me;
\\q1 your new moon and Sabbath assemblies—I cannot tolerate these wicked assemblies.

\\s5
\\q1
\\v 14 I hate your new moons and your appointed feasts;
\\q1 they are a burden to me; I am tired of enduring them.
\\q1
\\v 15 So when you spread out your hands in prayer, I hide my eyes from you;
\\q1 even though you offer many prayers, I will not listen;
\\q1 your hands are full of blood.

\\s5
\\q1
\\v 16 Wash, cleanse yourselves;
\\q1 remove the evil of your deeds from my sight;
\\q1 stop being evil;
\\q1
\\v 17 learn to do good;
\\q1 seek justice, make straight the oppression,
\\f + \\ft Instead of \\fqa make straight the oppression \\fqa* , some versions have \\fqa help the oppressed \\fqa* . \\f*
\\q1 give justice to the fatherless, defend the widow."

\\s5
\\q1
\\v 18 "Come now, and let us reason together," says Yahweh;
\\q1 "though your sins are like scarlet, they will be white like snow;
\\q1 though they are red like crimson, they will be like wool.

\\s5
\\q1
\\v 19 If you are willing and obedient, you will eat the good of the land,
\\q1
\\v 20 but if you refuse and rebel, the sword will devour you,"
\\q1 for the mouth of Yahweh has spoken it.

\\s5
\\q1
\\v 21 How the faithful city has become a prostitute!
\\q1 She who was full of justice—she was full of righteousness,
\\q1 but now she is full of murderers.
\\q1
\\v 22 Your silver has become impure, your wine mixed with water.

\\s5
\\q1
\\v 23 Your princes are rebels and companions of thieves;
\\q1 everyone loves bribes and runs after payoffs.
\\q1 They do not defend the fatherless, nor does the widow's legal plea come before them.

\\s5
\\q1
\\v 24 Therefore this is the declaration of the Lord Yahweh of hosts, the Mighty One of Israel:
\\q1 "Woe to them! I will take vengeance against my adversaries, and avenge myself against my enemies;
\\q1
\\v 25 I will turn my hand against you,
\\q1 refine away your dross as with lye, and take away all your dross.

\\s5
\\q1
\\v 26 I will restore your judges as at the first, and your counselors as at the beginning;
\\q1 after that you will be called the city of righteousness, a faithful town."

\\s5
\\q1
\\v 27 Zion will be redeemed by justice, and her repentant ones by righteousness.
\\q1
\\v 28 Rebels and sinners will be crushed together, and those who abandon Yahweh will be done away with.

\\s5
\\q1
\\v 29 "For you will be ashamed of the sacred oak trees that you desired,
\\q1 and you will be embarrassed by the gardens that you have chosen.
\\q1
\\v 30 For you will be like an oak whose leaf fades,
\\q1 and like a garden that has no water.

\\s5
\\q1
\\v 31 The strong man will be like tinder, and his work like a spark;
\\q1 they will both burn together, and no one will quench them."
\\s5
`],

["1 Chronicles 2",
`
\\c 2
\\p
\\v 1 These were the sons of Israel: Reuben, Simeon, Levi, Judah, Issachar, Zebulun,
\\v 2 Dan, Joseph, Benjamin, Naphtali, Gad, and Asher.

\\s5
\\p
\\v 3 Judah's sons were Er, Onan, and Shelah, who were born to him by Shua's daughter, a Canaanite woman. Er, Judah's firstborn, was wicked in the sight of Yahweh, and Yahweh killed him.
\\v 4 Tamar, his daughter-in-law, bore him Perez and Zerah. Judah had five sons.

\\s5
\\p
\\v 5 Perez's sons were Hezron and Hamul.
\\p
\\v 6 Zerah's sons were Zimri, Ethan, Heman, Kalkol, and Darda, five in all.
\\p
\\v 7 Karmi's son was Achar, who brought trouble on Israel when he stole what was reserved for God. \\f + \\ft Some Hebrew copies spell the name: \\fqa Achan \\fqa* instead of \\fqa Achar \\fqa* , a name which means \\fqa trouble \\fqa* . \\f*
\\p
\\v 8 Ethan's son was Azariah.

\\s5
\\p
\\v 9 Hezron's sons were Jerahmeel, Ram, and Caleb.
\\p
\\v 10 Ram became the father of Amminadab, and Amminadab became the father of Nahshon, a leader among Judah's descendants.
\\v 11 Nahshon became the father of Salmon, and Salmon became the father of Boaz.
\\v 12 Boaz became the father of Obed, and Obed became the father of Jesse.

\\s5
\\p
\\v 13 Jesse became the father of his firstborn Eliab, Abinadab the second, Shimea the third,
\\v 14 Nethanel the fourth, Raddai the fifth,
\\v 15 Ozem the sixth, and David the seventh.

\\s5
\\v 16 Their sisters were Zeruiah and Abigail. The sons of Zeruiah were Abishai, Joab, and Asahel, three of them.
\\v 17 Abigail bore Amasa, whose father was Jether the Ishmaelite.

\\s5 Hur
\\p
\\v 50 These were the descendants of Caleb. The sons of Hur the firstborn of Ephrathah: Shobal the father of Kiriath Jearim,
\\v 51 Salma the father of Bethlehem, and Hareph the father of Beth Gader.

\\s5
\\p
\\v 52 Shobal the father of Kiriath Jearim had descendants: Haroeh, half of the Manahathites,
\\v 53 and the clans of Kiriath Jearim: the Ithrites, Puthites, Shumathites, and Mishraites. The Zorathites and Eshtaolites descended from these.

\\s5
\\p
\\v 54 The descendants of Salma were Bethlehem, the Netophathites, Atroth Beth Joab, and half of the Manahathites—the Zorites,
\\v 55 and the clans of the scribes who lived at Jabez: the Tirathites, Shimeathites, and Sucathites. These were the Kenites who came from Hammath, father of the house of Rekab.

\\s5
`]
]);

import {EditorDemo} from "./EditorDemo.js";

(<EditorDemo usfmStrings={usfmStrings}/>)
```