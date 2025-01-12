// Function to construct ChatGPT instructions
function getChatInstructions(jsonSinglePersonData, uuid) {
    console.log("getChatInstructions uuid ", uuid);

    const modifiers = getRandomModifiers();

    const prompt = `
        Here is user data: ${JSON.stringify(jsonSinglePersonData)}
        Your task is to create a daily, personalized horoscope for this person, incorporating astrological insights and practical advice. Focus on these sections and generate a CSV file containing the following columns and data:
        - Overview: Emotional, mental, and spiritual insights (${modifiers.overview})
        - Career and Finances: Strategies for growth (${modifiers.careerAndFinances})
        - Relationships: Emotional connections (${modifiers.relationships})
        - Parenting Guidance: Support tailored to children (${modifiers.parentingGuidance})
        - Health: Holistic well-being (${modifiers.health})
        - Personal Guidance: Introspective advice (${modifiers.personalGuidance})
        - Local Weather: Brief forecast.
        Format the columns of the csv with snake case formatting
    `;

    return prompt.trim();
}

function getRandomModifiers() {
  var overviewModifier = overviewModifiers[Math.floor(Math.random() * overviewModifiers.length)];
  var careerAndFinancesModifier = careerAndFinancesModifiers[Math.floor(Math.random() * careerAndFinancesModifiers.length)];
  var relationshipsModifier = relationshipsModifiers[Math.floor(Math.random() * relationshipsModifiers.length)];
  var parentingGuidanceModifier = parentingGuidanceModifiers[Math.floor(Math.random() * parentingGuidanceModifiers.length)];
  var healthModifier = healthModifiers[Math.floor(Math.random() * healthModifiers.length)];
  var personalGuidanceModifier = personalGuidanceModifiers[Math.floor(Math.random() * personalGuidanceModifiers.length)];

  console.log("Mod-MODIFIERS: Overview: "+overviewModifier+", Career and Finances: "+careerAndFinancesModifier+" Relationships: "+relationshipsModifier+" Parenting Guidance: "+parentingGuidanceModifier+" Health: "+ healthModifier+" Personal Guidance: "+personalGuidanceModifier);

  return {
    overview: overviewModifier,
    careerAndFinances: careerAndFinancesModifier,
    relationships: relationshipsModifier,
    parentingGuidance: parentingGuidanceModifier,
    health: healthModifier,
    personalGuidance: personalGuidanceModifier
  };
}

var overviewModifiers = [
  "Focus on clarity and understanding today.",
  "Consider how today's events shape your future.",
  "Reflect on the opportunities present in your life.",
  "Emphasize the positive aspects of your current situation.",
  "Today's challenges can lead to personal growth.",
  "Look for the silver lining in today's circumstances.",
  "Think about long-term goals and how today fits into them.",
  "Pay attention to your intuition today.",
  "Today is a day for reflection and contemplation.",
  "Consider how your actions today affect those around you.",
  "Focus on the present moment and its importance.",
  "Take a step back to gain a broader perspective.",
  "Consider the balance between work and personal life today.",
  "Today may bring unexpected opportunities.",
  "Focus on personal development and self-improvement.",
  "Think about how you can make a positive impact today.",
  "Today is a day for making thoughtful decisions.",
  "Consider how your current path aligns with your values.",
  "Reflect on your progress and where you're headed.",
  "Focus on creating harmony in your life today."
];

var careerAndFinancesModifiers = [
  "Consider how today's tasks contribute to your long-term career goals.",
  "Think about new ways to manage your finances effectively.",
  "Today's efforts may lead to significant progress in your career.",
  "Focus on improving your financial habits.",
  "Reflect on how to achieve a better work-life balance.",
  "Today might be a good day to explore new career opportunities.",
  "Think about how to optimize your productivity.",
  "Consider the financial implications of your decisions today.",
  "Focus on setting clear, achievable goals.",
  "Today is a day to take calculated risks in your career.",
  "Think about ways to increase your financial security.",
  "Consider how you can advance in your current role.",
  "Today's decisions could have long-term financial benefits.",
  "Reflect on your career path and where you want to go.",
  "Focus on professional growth and learning new skills.",
  "Think about ways to diversify your income streams.",
  "Consider how you can improve your financial planning.",
  "Today may bring new opportunities for career advancement.",
  "Reflect on the financial aspects of your current lifestyle.",
  "Focus on building strong professional relationships."
];

var relationshipsModifiers = [
  "Consider how you can strengthen your relationships today.",
  "Focus on improving communication with loved ones.",
  "Today is a good day to express appreciation for others.",
  "Reflect on the role of trust in your relationships.",
  "Think about ways to deepen emotional connections.",
  "Consider how your actions affect those around you.",
  "Focus on resolving any ongoing conflicts.",
  "Today is a day to nurture your relationships.",
  "Reflect on the balance between giving and receiving in your relationships.",
  "Think about how you can support the goals of those you care about.",
  "Consider how you can show love and affection today.",
  "Focus on the importance of honesty in your relationships.",
  "Today might be a good day to reconnect with someone.",
  "Reflect on how you can build stronger bonds with others.",
  "Think about ways to be more present in your relationships.",
  "Consider the importance of empathy and understanding.",
  "Focus on spending quality time with loved ones.",
  "Today is a day to celebrate your relationships.",
  "Reflect on how your relationships contribute to your happiness.",
  "Think about how you can maintain healthy boundaries."
];

var parentingGuidanceModifiers = [
  "Focus on understanding your child's needs today.",
  "Consider how you can support your child's emotional growth.",
  "Today is a good day to spend quality time with your child.",
  "Reflect on the importance of positive reinforcement.",
  "Think about ways to encourage your child's curiosity.",
  "Consider how your actions influence your child's behavior.",
  "Focus on building a strong bond with your child.",
  "Today might be a good day to teach your child something new.",
  "Reflect on how you can be a better role model.",
  "Think about ways to foster your child's independence.",
  "Consider the importance of consistency in parenting.",
  "Focus on listening to your child and understanding their perspective.",
  "Today is a day to encourage your child's creativity.",
  "Reflect on how you can support your child's goals.",
  "Think about ways to make learning fun for your child.",
  "Consider how you can help your child develop resilience.",
  "Focus on creating a loving and supportive environment.",
  "Today is a day to celebrate your child's achievements.",
  "Reflect on how you can be more patient with your child.",
  "Think about ways to strengthen your relationship with your child."
];

var healthModifiers = [
  "Focus on maintaining a balanced diet today.",
  "Consider how you can improve your physical fitness.",
  "Today is a good day to prioritize mental health.",
  "Reflect on the importance of regular exercise.",
  "Think about ways to reduce stress in your life.",
  "Consider how your habits impact your long-term health.",
  "Focus on getting enough rest and sleep.",
  "Today might be a good day to try a new healthy activity.",
  "Reflect on how you can improve your overall well-being.",
  "Think about ways to incorporate more movement into your day.",
  "Consider the importance of hydration for your health.",
  "Focus on making healthy choices in your diet.",
  "Today is a day to practice mindfulness and relaxation.",
  "Reflect on how you can support your immune system.",
  "Think about ways to improve your emotional health.",
  "Consider the benefits of regular medical check-ups.",
  "Focus on developing a sustainable health routine.",
  "Today might be a good day to set new health goals.",
  "Reflect on the connection between physical and mental health.",
  "Think about ways to maintain a positive outlook on life."
];

var personalGuidanceModifiers = [
  "Focus on your personal growth and self-improvement.",
  "Consider how you can develop new skills.",
  "Today is a good day to set personal goals.",
  "Reflect on the importance of self-care.",
  "Think about ways to increase your self-confidence.",
  "Consider how you can find more balance in your life.",
  "Focus on pursuing your passions and hobbies.",
  "Today might be a good day to explore new opportunities.",
  "Reflect on how you can be more present in the moment.",
  "Think about ways to enhance your personal relationships.",
  "Consider the importance of self-reflection and introspection.",
  "Focus on staying motivated and determined.",
  "Today is a day to embrace positive change.",
  "Reflect on your strengths and how to build on them.",
  "Think about ways to overcome personal challenges.",
  "Consider how you can create more joy in your life.",
  "Focus on being kind and compassionate to yourself.",
  "Today might be a good day to practice gratitude.",
  "Reflect on your achievements and how far you've come.",
  "Think about ways to cultivate a growth mindset."
];