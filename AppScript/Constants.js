const DATE_STRING = today.toISOString().split('T')[0];
const DAY_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];


const MAILER_SEND_API_KEY = PropertiesService.getScriptProperties().getProperty("MAILER_SEND_API_KEY");
const CHAT_GPT_KEY = PropertiesService.getScriptProperties().getProperty("CHAT_GPT_KEY");
const CHAT_GPT_URL = 'https://api.openai.com/v1/chat/completions';
const FIREBASE_URL = PropertiesService.getScriptProperties().getProperty("FIREBASE_URL");
const FIREBASE_API_KEY = PropertiesService.getScriptProperties().getProperty("FIREBASE_API_KEY");
const FORM_ID = PropertiesService.getScriptProperties().getProperty("FORM_ID");
const GOOGLE_MAPS_API_KEY = PropertiesService.getScriptProperties().getProperty("GOOGLE_MAPS_API_KEY");
const COPYRIGHT = `&copy; ${new Date().getFullYear()} Zodiaccurate. All rights reserved.`;
const MAILER_SEND_URL = "https://api.mailersend.com/v1/email";
const GITHUB_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("GITHUB_ACCESS_TOKEN");
const STRIPE_WEBHOOK_SECRET = PropertiesService.getScriptProperties().getProperty("STRIPE_WEBHOOK_SECRET");
const SHARED_SECRET = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET");
const STRIPE_LINK = "https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000";
const EDIT_RESPONSE_URL_PRIME = "https://docs.google.com/forms/d/e/1FAIpQLSexpPmDP1R22xUemGUIU3TaDNvSwZVO7c0NZ8bC9piTn-B9XQ/viewform?edit2=";
const FIREBASE_PASSWORD = PropertiesService.getScriptProperties().getProperty("FIREBASE_PASSWORD");
const GOOGLE_SPREADSHEET_ID = "1clfDpgLCHA0bvRjlWmvAX9yeXMqlX58KQaKHe4A2lUw";
const ADMIN_EMAIL = "dahnworldhealer@yahoo.com";
const SIGNUP_LINK = "https://billing.stripe.com/p/login/8wM03Y1ic3ROau4000";
const SURVEY_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSfQTQ5WNQUgPs9oqmqm4gvcld2DSPy_-GaX66_Oxe5_6FzYxQ/viewform?usp=header"

const PAUL_TEST = "2_ABaOnue4XHFL-u5CyI2lyUdFbb9klXCXzfTQ6aCVgX7uW3klsaxK_bTAYk7qRLUdshRh6mQ";
const CASS_TEST = "2_ABaOnuds5b7BPiDNl6ZUlev-eOWXNFLKBWrhPnT_Rdlji9mEhiuCX68uFMFZ8YdhMJ2pq9o";

const TEST_UUID = "a323baee-0828-433f-9502-5d24d633d2ea";

const TEST_FORM_DATA = "{\"formData\":{\"email\":\"dahnworldhealer@yahoo.com\",\"location\":\"denver, co\",\"name\":\"Cass Pangell\",\"birth_city\":\"Littleton\",\"birth_date\":\"fdsafs\",\"birth_time\":\"fdsaf\",\"relationship_status\":\"single\",\"employment_status\":\"retired\",\"retirement_focus\":\"volunteering\",\"retirement_transition\":\"mostly_comfortable\",\"retirement_activity\":\"learning_skills\",\"social_connections\":\"value_solitude\",\"sense_of_purpose\":\"open_to_experiences\",\"consent_agree\":\"on\",\"email_agree\":\"on\",\"uuid\":\"25988965-b1fe-4c40-bde8-a20e824aa440\",\"submissionId\":\"25988965-b1fe-4c40-bde8-a20e824aa440\"},\"source\":\"intakeForm\",\"uuid\":\"25988965-b1fe-4c40-bde8-a20e824aa440\",\"email\":\"dahnworldhealer@yahoo.com\",\"name\":\"Cass Pangell\"}";

const TEST_USER_DATA = {
  "areas_of_improvement": "Getting up 6am and bed by 10pm, make consistently better food choices and eat less when I eat. Be non-responsive (negatively) to my daughter's tantrums.",
  "belief_system": "Spiritual",
  "birth_city": "California",
  "birth_date": "December 26, 1963",
  "birth_time": "12pm",
  "career_decisions": [
    "I analyze data and facts thoroughly",
    "I balance intuition with analysis",
    "I tend to delay decisions"
  ],
  "career_goals": "Work-life balance",
  "child_one_birth_date": "May 25, 2020",
  "child_one_birth_place": "Honolulu, Hawaii, USA",
  "child_one_birth_time": "12pm",
  "child_one_first_name": "Elice",
  "child_one_gender": "Female",
  "child_one_joy_and_satisfaction": "Making up fun things to do, new experiences, mom and dad's approval, when her friends come to visit her.",
  "child_one_long_term_concerns": "She is a healthy child, I have none to report.",
  "child_one_primary_activities": "She is in pre-kindergarten at Montessori private school. She does not currently appear to have educational learning disabilities. She is easily distracted, and it is difficult for her to stay focused on what is being asked.",
  "child_one_stress": "When either parent gets upset, when she has insufficient sleep or food, when she is too entrenched in digital entertainment. It has to be kept to 30-60 minutes a day max.",
  "choose_best_answer": "SKIP TO NEXT SECTION",
  "click_to_bypass_future_partner": "Career And Employment",
  "consent_policies": "Yes",
  "email": "dahnworldhealer@yahoo.com",
  "email_agreement": "Yes",
  "emotional_health": "Overall pretty good on emotional balance. Occasionally I snap with some anger at my child's antics or temper tantrums.",
  "employment_status": "Self-Employed",
  "family_values": "Making enough each month to stay ahead of the bills, saving for a house down payment, correcting my credit score, finding enough extra income so my wife doesn't have to work to send money home to her family.",
  "financial_security": "Somewhat insecure",
  "important_goals": "Have huge success in my new subscription-based business. Educate myself on being a better father and better at understanding my child's behaviors and responses. Be completely financially free and the business operates on its own with minimal activity on my behalf. Set up legal trusts and businesses that avoid excess taxation. Become immortal in this lifetime. Open up Ta Chang Center locally where I live.",
  "job_satisfaction": "Satisfied",
  "job_title": "Spiritual Healer and Guidance Counselor",
  "joy_and_satisfaction": "When my manifestations come true. When my healing abilities work and affect others in a positive way. When I get validation that I am a good dad doing a good job. When I get to spend time in my spiritual teacher's field.",
  "mental_health": "I would like to be much more aware of negative thinking and minimize it as it arises. I would like to stop judging people. I don't do it a lot, but I need to improve and reduce any negative thoughts, words, and actions because it is very important to my spiritual journey.",
  "name": "Paul Fletcher",
  "number_of_children": "1 Child",
  "orientation": "Prefer Female",
  "partner_appreciation": "She is easygoing and allows me to be me. She is a great and loving mother. She loves her family and puts them first. She is considerate of all people around her. She is kind and generous.",
  "partner_birth_city": "Surin, Thailand",
  "partner_birth_time": "Unknown",
  "partner_birth_date": "April 15, 1982",
  "partner_improvements": "I want to be more understanding of what is important to her. I want to be better at communicating when I am irritated with her. I want to make a real home for our family.",
  "partner_name": "Sau",
  "partner_stress": "Inability to provide enough income for my wife to take care of all her family's financial responsibilities.",
  "partners_belief_system": "Buddhist",
  "physical_health": "Don't feel fully rested after 8 hours of sleep. Teeth need to be healthier. Eyes are okay but a little farsighted. No pain. Not as much energy in the mornings as I would like.",
  "relationship_conflict": "Address them immediately.",
  "relationship_status": "Married",
  "skip_to_bypass_unemployed": "Skip to Bypass Unemployed",
  "stress": "Making enough each month to stay ahead of the bills, saving for a house down payment, correcting my credit score, finding enough extra income so my wife doesn't have to work to send money home to her family.",
  "timezone": "Australia/Brisbane",
  "trial": true,
  "trial_date_start": "2025-01-19T00:49:02.183Z",
  "wellness": "Pretty good health.",
  "wellness_goals": "I would say I am about 5 pounds overweight, and I don't exercise daily, even though I don't have any physical limits that would stop me. I would like to be consistent about waking up and doing spiritual practice Mon-Fri 6-7:30am. I would enjoy more balanced energy from the moment of waking.",
  "work_environment": "Collaborative and team-oriented",
  "work_life_balance": "Work dominates my life.",
  "work_stress": "I take breaks to recharge.",
  "current_location": "Australia Brisbane"
};

const TEST_USER_DATA_NO_CHILD_NO_PARTNER = {
  "areas_of_improvement": "Getting up 6am and bed by 10pm, make consistently better food choices and eat less when I eat. Be non-responsive (negatively) to my daughter's tantrums.",
  "belief_system": "Spiritual",
  "birth_city": "California",
  "birth_date": "December 26, 1963",
  "birth_time": "12pm",
  "career_decisions": [
    "I analyze data and facts thoroughly",
    "I balance intuition with analysis",
    "I tend to delay decisions"
  ],
  "career_goals": "Work-life balance",
  "choose_best_answer": "SKIP TO NEXT SECTION",
  "click_to_bypass_future_partner": "Career And Employment",
  "consent_policies": "Yes",
  "email": "dahnworldhealer@yahoo.com",
  "email_agreement": "Yes",
  "emotional_health": "Overall pretty good on emotional balance. Occasionally I snap with some anger at my child's antics or temper tantrums.",
  "employment_status": "Self-Employed",
  "family_values": "Making enough each month to stay ahead of the bills, saving for a house down payment, correcting my credit score, finding enough extra income so my wife doesn't have to work to send money home to her family.",
  "financial_security": "Somewhat insecure",
  "important_goals": "Have huge success in my new subscription-based business. Educate myself on being a better father and better at understanding my child's behaviors and responses. Be completely financially free and the business operates on its own with minimal activity on my behalf. Set up legal trusts and businesses that avoid excess taxation. Become immortal in this lifetime. Open up Ta Chang Center locally where I live.",
  "job_satisfaction": "Satisfied",
  "job_title": "Spiritual Healer and Guidance Counselor",
  "joy_and_satisfaction": "When my manifestations come true. When my healing abilities work and affect others in a positive way. When I get validation that I am a good dad doing a good job. When I get to spend time in my spiritual teacher's field.",
  "mental_health": "I would like to be much more aware of negative thinking and minimize it as it arises. I would like to stop judging people. I don't do it a lot, but I need to improve and reduce any negative thoughts, words, and actions because it is very important to my spiritual journey.",
  "name": "Paul Fletcher",
  "orientation": "Prefer Female",
  "physical_health": "Don't feel fully rested after 8 hours of sleep. Teeth need to be healthier. Eyes are okay but a little farsighted. No pain. Not as much energy in the mornings as I would like.",
  "relationship_conflict": "Address them immediately.",
  "relationship_status": "Married",
  "skip_to_bypass_unemployed": "Skip to Bypass Unemployed",
  "stress": "Making enough each month to stay ahead of the bills, saving for a house down payment, correcting my credit score, finding enough extra income so my wife doesn't have to work to send money home to her family.",
  "timezone": "Australia/Brisbane",
  "trial": true,
  "trial_date_start": "2025-01-19T00:49:02.183Z",
  "wellness": "Pretty good health.",
  "wellness_goals": "I would say I am about 5 pounds overweight, and I don't exercise daily, even though I don't have any physical limits that would stop me. I would like to be consistent about waking up and doing spiritual practice Mon-Fri 6-7:30am. I would enjoy more balanced energy from the moment of waking.",
  "work_environment": "Collaborative and team-oriented",
  "work_life_balance": "Work dominates my life.",
  "work_stress": "I take breaks to recharge.",
  "current_location": "Australia Brisbane"
};
