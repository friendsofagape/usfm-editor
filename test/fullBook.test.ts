/* eslint-disable jest/expect-expect */

import { act } from "react-dom/test-utils"
import { slateToUsfm } from "../src/transforms/slateToUsfm"
import { usfmToSlate } from "../src/transforms/usfmToSlate"

/**
 * Transforms the input usfm to a slate tree, and then back to usfm.
 * Then tests whether the output matches the original input.
 */
function testUsfm(usfm: string) {
    let output: string | undefined = undefined
    act(() => {
        output = slateToUsfm(usfmToSlate(usfm))
    })
    expect(output).toEqual(usfm)
}

it("Full book round-trip", () => {
    const usfm = book.replace(/\n\n/g, "\n")
    testUsfm(usfm)
})

const book = String.raw`\id 1PE Unlocked Literal Bible
\ide UTF-8
\h 1 Peter
\toc1 The First Letter of Peter
\toc2 First Peter
\toc3 1Pe
\mt First Peter

\s5
\c 1
\p
\v 1 Peter, an apostle of Jesus Christ, to the foreigners of the dispersion, the chosen ones, throughout Pontus, Galatia, Cappadocia, Asia, and Bithynia.
\v 2 This is according to the foreknowledge of God the Father, through the sanctifying work of the Spirit, for obedience and for the sprinkling of the blood of Jesus Christ. May grace be to you, and may your peace increase.

\s5
\p
\v 3 May the God and Father of our Lord Jesus Christ be praised! In his great mercy, he has given us new birth to a living hope through the resurrection of Jesus Christ from the dead.
\v 4 This is for an inheritance that will not perish, will not become stained, and will not fade away. It is reserved in heaven for you.
\v 5 You are protected by God's power through faith for the salvation that is ready to be revealed in the last time.

\s5
\v 6 In this you greatly rejoice, even though now, for little while, you may have to suffer all kinds of trials.
\v 7 This is for the proving of your faith, which is more precious than gold that perishes, even though it is tested by fire. This happens so that your faith will be found to result in praise, glory, and honor at the revealing of Jesus Christ.

\s5
\v 8 You have not seen him, but you love him. You do not see him now, but you believe in him and rejoice with joy that is inexpressible and filled with glory.
\v 9 You are now receiving for yourselves the result of your faith, the salvation of your souls.
\v 10 Concerning this salvation, the prophets who prophesied about the grace that was to come to you, searched diligently and examined carefully,

\s5
\v 11 inquiring into what person or time the Spirit of Christ in them was indicating when he testified beforehand about the sufferings of Christ and the glories that would follow.
\v 12 It was revealed to them that they were not serving themselves, but you, when they spoke of the things that have now been told to you by those who preached the gospel to you by the Holy Spirit sent from heaven—things into which angels long to look.

\s5
\p
\v 13 So gird up the loins of your mind. Be sober. Put your hope fully on the grace that will be brought to you when Jesus Christ is revealed.
\v 14 As obedient children, do not conform yourselves to the desires that you followed when you were ignorant.

\s5
\v 15 But as the one who called you is holy, you, too, be holy in your whole behavior.
\v 16 For it is written, "Be holy, because I am holy."
\v 17 So if you call "Father" the one who judges impartially and according to each person's work, go through the time of your journey in reverence.

\s5
\v 18 You know that it was not with perishable silver or gold that you have been redeemed from the futile behavior that you learned from your fathers.
\v 19 Instead, you have been redeemed with the precious blood of Christ, who was like a lamb without blemish or spot.

\s5
\v 20 Christ was foreknown before the foundation of the world, but now he has been revealed to you in these last times.
\v 21 Through him you believe in God, who raised him from the dead and gave him glory, so that your faith and hope are in God.

\s5
\v 22 You made your souls pure by obedience to the truth. This was for the purpose of sincere brotherly love; so love one another earnestly from the heart. \f + \ft Some important and ancient Greek copies read, \fqa You made your souls pure by obedience to the truth through the Spirit \fqa* . \f*
\v 23 You have been born again, not from perishable seed, but from imperishable seed, through the living and remaining word of God.

\s5
\v 24 For,
\q "All flesh is like grass,
\q and all its glory is like the wild flower of the grass.
\q The grass dries up, and the flower falls off,
\q
\v 25 but the word of the Lord remains forever."
\m This word is the gospel that was preached to you.

\s5
\c 2
\p
\v 1 Therefore put aside all evil, all deceit, hypocrisy, envy, and all slander.
\v 2 As newborn infants, long for pure spiritual milk, so that through it you may grow in salvation,
\v 3 if you have tasted that the Lord is kind.

\s5
\v 4 Come to him who is a living stone that has been rejected by people, but that has been chosen by God as valuable to him.
\v 5 You also are like living stones that are being built up to be a spiritual house in order to be a holy priesthood that offers the spiritual sacrifices acceptable to God through Jesus Christ.

\s5
\v 6 Scripture contains this:
\q "See, I am laying in Zion a cornerstone,
\q chosen and valuable.
\q Whoever believes in him will not be ashamed."

\s5
\p
\v 7 The value, then, is to you who believe.
\q But to those who do not believe,
\q "The stone that was rejected by the builders,
\q this has become the head of the corner,"
\p
\v 8 and,
\q "A stone of stumbling
\q and a rock that makes them fall."
\m They stumble because they disobey the word—which is what they were appointed to do.

\s5
\v 9 But you are a chosen people, a royal priesthood, a holy nation, a people for God's possession, so that you would announce the wonderful actions of the one who called you out from darkness into his marvelous light.
\v 10 Once you were not a people, but now you are the people of God. You did not receive mercy, but now you have received mercy.

\s5
\p
\v 11 Beloved, I exhort you as foreigners and exiles to abstain from fleshly desires, which fight against your soul.
\v 12 Your conduct among the Gentiles should be honorable, so that when they slander you as evildoers, they may be eyewitnesses of your good deeds and give glory to God on the day when he appears.

\s5
\p
\v 13 Be subject to every human authority for the Lord's sake. Obey both the king as supreme,
\v 14 and also the governors, who are sent for the punishment of evildoers and to praise those who do good.
\v 15 For this is God's will, that in doing good you silence the ignorant talk of foolish people.
\v 16 As free people, do not use your freedom as a covering for wickedness, but be like servants of God.
\v 17 Honor all people. Love the brotherhood. Fear God. Honor the king.

\s5
\p
\v 18 Servants, be subject to your masters with all respect. Be subject not only to the good and gentle masters, but also to the malicious ones.
\v 19 For it is praiseworthy if, because he is conscious of God, a person endures sorrows while suffering unjustly.
\v 20 For how much credit is there if you sin and then endure while being afflicted? But if you have done good and then you suffer while being punished, this is worthy of praise from God.

\s5
\v 21 For it is to this that you were called, because Christ also suffered for you. He left an example for you to follow in his steps.
\q1
\p
\v 22 "He committed no sin,
\q1 neither was any deceit found in his mouth."
\m
\p
\v 23 When he was reviled, he did not revile back. When he suffered, he did not threaten back, but he committed himself to the one who judges justly.

\s5
\v 24 He himself carried our sins in his body on the tree so that we would stay away from sin and live for righteousness. By his bruises you have been healed.
\v 25 All of you had been straying like lost sheep, but now you have returned to the shepherd and overseer of your souls.

\s5
\c 3
\p
\v 1 In this way, you who are wives should submit to your own husbands. Do this so even if some men are disobedient to the word, they may be won without a word, through their wives' behavior,
\v 2 having been eyewitnesses of your respectful, pure behavior.

\s5
\v 3 Let it be done not with outward ornaments such as braided hair, jewels of gold, or fashionable clothing.
\v 4 Instead, let it be done with the inner person of the heart, and the lasting beauty of a gentle and quiet spirit, which is precious before God.

\s5
\v 5 For this is how holy women long ago who hoped in God adorned themselves, by submitting to their husbands.
\v 6 In this way Sarah obeyed Abraham and called him her lord. You are now her children if you do what is good and if you are not afraid of trouble.

\s5
\p
\v 7 In the same way, you husbands should live with your wives according to understanding, as with a weaker container, a woman. You should give them honor as fellow heirs of the grace of life. Do this so that your prayers will not be hindered.

\s5
\p
\v 8 Finally, all of you, be likeminded, compassionate, loving as brothers, tenderhearted, and humble.
\v 9 Do not pay back evil for evil or insult for insult. On the contrary, continue to bless, because for this you were called, that you might inherit a blessing.

\s5
\q
\v 10 "The one who wants to love life and see good days
\q should stop his tongue from evil and his lips from speaking deceit.
\q
\v 11 Let him turn away from what is bad and do what is good.
\q Let him seek peace and pursue it.
\q
\v 12 The eyes of the Lord see the righteous, and his ears hear their prayers.
\q But the face of the Lord is against those who do evil."

\s5
\p
\v 13 Who is the one who will harm you if you are eager to do what is good?
\v 14 But if you suffer because of righteousness, you are blessed. Do not fear what they fear. Do not be troubled.

\s5
\v 15 Instead, set apart the Lord Christ in your hearts as holy. Always be ready to give an account to anyone who asks about the hope you have—
\v 16 however, with meekness and respect. Have a good conscience so that the people who insult your good life in Christ may be ashamed because they are speaking against you as if you were evildoers.
\v 17 It is better, if it should be God's will, that you suffer for doing good than for doing evil.

\s5
\v 18 Christ also suffered once for sins. He who is righteous suffered for us, who were unrighteous, so that he would bring us to God. He was put to death in the flesh, but he was made alive by the Spirit.
\v 19 By the Spirit, he went and preached to the spirits who are now in prison.
\v 20 They were disobedient when the patience of God was waiting in the days of Noah, in the days of the building of an ark, and God saved a few people—eight souls—by means of the water.

\s5
\v 21 This is a symbol of the baptism that saves you now—not as a washing away of dirt from the body, but as the appeal of a good conscience to God—through the resurrection of Jesus Christ.
\v 22 Christ is at the right hand of God. He went into heaven. Angels, authorities, and powers must submit to him.

\s5
\c 4
\p
\v 1 Therefore, because Christ suffered in the flesh, arm yourselves with the same intention. For whoever has suffered in the flesh has ceased from sin.
\v 2 As a result, such a person, for the rest of his time in the flesh, no longer lives for men's desires, but for God's will.

\s5
\v 3 For the time that has passed is enough for you to do the will of the Gentiles, living in sensuality, lusts, drunkenness, drunken celebrations, having wild parties, and committing disgusting acts of idolatry.
\v 4 They think it is strange that you do not join with them in these floods of reckless behavior, so they speak evil about you.
\v 5 They will give an account to the one who is ready to judge the living and the dead.
\v 6 For this purpose the gospel was preached also to the dead, so that, although they have been judged in the flesh as humans, they may live in the spirit the way God does.

\s5
\p
\v 7 The end of all things is coming near. Therefore be of sound mind, and be sober in your thinking for the sake of prayers.
\v 8 Above all things, have fervent love for one another, for love covers a multitude of sins.
\v 9 Be hospitable to one another without complaining.

\s5
\v 10 As each one of you has received a gift, use it to serve one another as good stewards of God's grace in its various forms.
\v 11 If anyone speaks, let it be with God's words. If anyone serves, let it be from the strength that God supplies. Do these things so that in all ways God would be glorified through Jesus Christ. May there be to Jesus Christ glory and dominion forever and ever. Amen.

\s5
\p
\v 12 Beloved, do not regard as strange the testing in the fire that has happened to you, as if something strange were happening to you.
\v 13 Instead, however much you experience the sufferings of Christ, rejoice, so that you may also rejoice and be glad when his glory is revealed.
\v 14 If you are insulted for Christ's name, you are blessed, because the Spirit of glory and the Spirit of God is resting on you.

\s5
\v 15 But let none of you suffer as a murderer, a thief, an evildoer, or a meddler.
\v 16 But if anyone suffers as a Christian, let him not be ashamed; instead, let him glorify God with that name.

\s5
\v 17 For it is time for judgment to begin with the household of God. If it begins with us, what will be the outcome for those who disobey God's gospel?
\q
\v 18 And "If it is difficult for the righteous to be saved,
\q what will become of the ungodly and the sinner?"
\m
\p
\v 19 Therefore let those who suffer because of God's will commit their souls to the faithful Creator in well-doing.

\s5
\c 5
\p
\v 1 I am exhorting the elders among you, I, who am a fellow elder and a witness of the sufferings of Christ, and am also one who will share in the glory that will be revealed:
\v 2 Be shepherds of God's flock that is under your care, serving as overseers—not because you must, but because you are willing, as God would have you serve—not for shameful profit but eagerly.
\v 3 Do not act as a master over the people who are in your care. Instead, be an example to the flock.
\v 4 Then when the Chief Shepherd is revealed, you will receive an unfading crown of glory.

\s5
\v 5 In the same way, you younger men, submit to the older men. All of you, clothe yourselves with humility and serve one another. For God resists the proud, but he gives grace to the humble.
\p
\v 6 Therefore humble yourselves under God's mighty hand so that he may exalt you in due time.
\v 7 Cast all your anxiety on him because he cares for you.

\s5
\v 8 Be sober, be watchful. Your adversary the devil is walking around like a roaring lion, looking for someone to devour.
\v 9 Stand against him. Be strong in your faith. You know that your brotherhood in the world is enduring the same sufferings.

\s5
\v 10 After you suffer for a little while, the God of all grace, who called you to his eternal glory in Christ, will perfect you, establish you, strengthen you, and make you stable.
\v 11 To him be the dominion forever and ever. Amen.

\s5
\p
\v 12 I regard Silvanus as a faithful brother, and I have written to you briefly through him. I am exhorting you and I am testifying to you that what I have written is the true grace of God. Stand in it.
\v 13 The woman who is in Babylon, who is chosen together with you, greets you. Also Mark, my son, greets you.
\v 14 Greet one another with a kiss of love.
\p May peace be to you all who are in Christ.`
