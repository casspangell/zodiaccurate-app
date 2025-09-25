

function getChatPrompt() {

  return `Create a completely unique horoscope that doesn't follow formulaic patterns using this person's data. Ensure language, structure, insights, and recommendations vary significantly from previous days. Include at least one unexpected insight or recommendation that would surprise.
  Step 1. Initial Data Gathering
User Information:
  • Personal Data: 
  • Collect birthdate, birth time, and birthplace for the user and key people (spouse, children, important people).
  • Gather user preferences, including wellness goals, relationship dynamics, personal struggles, etc.
  • Collect information about emotional needs, mental state, physical health, and mental wellness based on user input (how they feel emotionally, mentally, and physically).
Astrological Data:
  • Astrological Transits: 
  • Collect and analyze astrological transits and positions for the user and their key people.
  • Include influences of planets, houses, nodes, etc.
  • Focus on the current, past three days, and next seven days’ astrological influences to ensure up-to-date guidance.

Step 2. Data Interpretation & Categorization
Categorization:
  • Once data is gathered, categorize it into five main sections 
Emotional Context:
  • For each category, ensure the advice is emotionally aligned with the user’s astrological influences and life stage. Ensure the advice respects sensitive topics (e.g., grief, financial struggles).

Step 3. Horoscope Content Generation
Steps for Each Category:
  • Personal Wellness (Physical, Emotional, and Mental Health):
  • Focus on emotional, mental, and physical health.
  • Ensure a balance between actionable advice (e.g., wellness strategies) and emotional insights.
  • Apply mindfulness techniques and gentle suggestions for stress management, mental clarity, and physical balance.
  • Ensure no redundancy from previous horoscopes. Track the suggestions from past wellness horoscopes to avoid repetition.
  • Relationship Guidance:
  • Tailor relationship advice based on relationship status (single, married, separated, etc.).
  • Make dynamic adjustments based on astrological influences affecting the user’s relationship today.
  • Focus on emotional connection, communication, and understanding for the specific relationship context.
  • Verification: Ensure no overlap from previous relationship advice, building on past advice without repetition.
  • Career and Finances:
  • Provide guidance for career growth, financial strategies, and work-life balance.
  • Dynamic Adjustments: 
  • If employed, focus on career growth.
  • If unemployed, offer advice on job searching, networking, and confidence building.
  • If retired, provide advice on finding purpose and staying engaged.
  • For aspiring entrepreneurs or small business owners, provide strategies on starting or growing a business.
  • Verification: Ensure career advice remains consistent with the user’s current employment status.
  • Child Guidance:
  • Offer emotional and behavioral guidance for the child, factoring in astrological influences.
  • Dynamic Adjustments: Account for any current emotional or developmental needs of the child.
  • Provide suggestions for engaging activities, communication strategies, and parent-child bonding.
  • Verification: Track and verify the child’s emotional sensitivity or specific needs mentioned in prior horoscopes to avoid repetition.
  • Important Person Guidance:
  • Tailor the guidance to help the user support an important person (partner, family member, close friend) based on their current emotional state.
  • Dynamic Adjustments: Ensure advice is relevant to the current emotional dynamics and astrological influences affecting this person.
  • Provide strategies for building better communication, empathy, and emotional understanding.
  • Verification: Ensure that past conflicts or emotional struggles are acknowledged but not repeated verbatim. Offer new insights or reflections based on recent astrological influences.

Step 4. Output Quality Check
Before Finalizing the Horoscope:
  • Ensure No Redundancy: Cross-check the output with the previous day’s horoscope. Make sure no redundant advice is included, especially in emotional health and relationship guidance.
  • Check Length: Ensure the 6-10 sentence range is met, providing enough depth in each category without overwhelming the user.
  • Check Rotation Compliance: Verify that resource suggestions are being applied only once per day, and that resources are being rotated correctly across categories.
  • Empathy and Sensitivity: Ensure that all sensitive topics (e.g., grief, relationship struggles, financial concerns) are addressed with care. Use empathetic language to support the user’s emotional state and avoid sounding mechanical or repetitive.
   Verification of Redundancy: Each day’s guidance should be checked to ensure that it doesn’t overlap with previous guidance. If repeating advice is necessary, it should be reframed in a progressive way.

Step 5. Final Delivery
Once the horoscope has been generated and reviewed:
  • Ensure Comprehensive Delivery: The final horoscope should include meaningful insights for each category and should seamlessly integrate actionable steps with reflective insights.
  • Ensure Resource Relevance: If applicable, include a resource suggestion that aligns with the user’s current life stage and astrological influences, ensuring it is relevant and adds value.

Step 6. Additional Implementation Details
  • Astrological Influence Hierarchy: When multiple astrological transits are affecting the user, prioritize the most relevant ones and focus on how they influence the current day.
  • Contextual Relevance: Ensure advice is contextually relevant to the user’s current life stage, goals, and emotional state. Use the astrological context as a tool to refine the guidance, ensuring that it is tailored to the user’s journey.
  • Link Between Previous and Upcoming Advice: Reference previous advice where necessary to ensure that the user feels the guidance is continuous and evolving. Similarly, offer insights about the next 7 days based on the user’s current astrological influences to help them prepare for what’s to come.

This finalized instruction set is now designed to ensure a consistent, personalized, and actionable horoscope is generated every day, while addressing the user's specific needs, astrological influences, and emotional states. This will allow for a dynamic, evolving user experience, avoiding redundancy and ensuring resource suggestions are carefully placed.

  IMPORTANT: Data needs to be in CSV Format: ${CSVFileInstructions}`;
}

const CSVFileInstructions = `STRICT CSV FORMAT INSTRUCTIONS:

1. Start with the exact header line with key value: Category,Content
2. You must provide exactly 5 rows of data, each with 2 columns. All text in the Content column must be enclosed in double quotes. Do not include any line breaks within the content text—each row must be on a single line. Do not include any HTML or formatting tags. Content should avoid any special characters that could break CSV parsing.
3. Format each row as: "Category Name","Content Text"
4. IMPORTANT: All text in the Content column MUST be enclosed in double quotes
5. If your content contains double quotes, escape them with another double quote: "" (two double quotes)
6. Do NOT include any line breaks within the content text - each row must be on a single line
7. Do NOT include any HTML or formatting tags

EXAMPLE FORMAT WITH VALIDATION:
Format each row as: "Category Name","Content Text".

FORMAT REQUIREMENTS:
- Content must avoid including special characters that could break CSV parsing
- Each section should have a unique, personalized category name
- Ensure the entire response can be directly parsed as valid CSV without any preprocessing
- DO NOT include ANY additional text before or after the CSV content in your response

CRITICAL: Failure to return properly formatted CSV will result in technical issues. The response MUST be valid CSV without any additional text, explanations, or disclaimers outside the CSV content.`;

function getReviewerBotPrompt(today, userThreeDayData) {
  return `You are an expert Astrological Content Reviewer. Your task is to review a user's horoscope: ${today} to ensure it meets quality standards and follows guidelines for personalized astrological content.
  HOROSCOPE REVIEW CRITERIA:

  NO REPEATED ADVICE - Cross check the content of each category - it must NOT contain any advice, phrasing, or insights similar to what the user has received in the past 3 days for each category: ${userThreeDayData}. This is especially important for relationship, emotional, and parenting content. Exact wording similarities or conceptually similar advice both count as repetition.
  TONE CONSISTENCY - The horoscope's tone must match the client's emotional state and current astrological influences. If the user is experiencing stress, financial pressure, or relationship challenges, the tone should acknowledge these realities while remaining supportive. The horoscope should not be overly optimistic when dealing with serious concerns, nor overly cautious when discussing positive developments.
  SPECIFIC ACTION ITEMS - All advice and action items must be fresh, relevant, and specific (not vague). 

  They should include concrete details like:

  Specific timeframes (e.g., "this morning," "for 15 minutes today")
  Measurable actions (e.g., "write down three goals" instead of "think about your goals")
  Context-appropriate activities based on the user's life circumstances
  Realistic and achievable suggestions

  PROPER FORMATTING - Ensure the horoscope has:

  Appropriate paragraph breaks for readability
  Key points highlighted using bold or emphasis where appropriate
  No excessive punctuation or ALL CAPS
  Consistent styling within each category

  INPUT DATA:
  I will provide you with the following information in JSON format:

  Current horoscope for today (multiple categories like "Career," "Relationships," etc.)
  Past horoscopes from the previous 3 days (if available)
  User profile data with personal details
  Today's day of the week

  YOUR TASK:

  Carefully review the current horoscope against all four criteria
  Identify any issues that need improvement
  If you find issues, modify today's horoscope to correct them, making sure to:

  Preserve the same category structure
  Maintain the astrological insights
  Fix only what needs to be fixed
  Ensure modified content is completely unique from past horoscopes
  This finalized instruction set is now designed to ensure a consistent, personalized, and actionable horoscope is generated every day, while addressing the user's specific needs, astrological influences, and emotional states. This will allow for a dynamic, evolving user experience, avoiding redundancy and ensuring resource suggestions are carefully placed.
  IMPORTANT: Data needs to be in CSV Format: ${CSVFileInstructions} and returned in the same format it was given`;
}