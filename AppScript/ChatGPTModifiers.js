
const today = new Date();

function createSeed(uuid) {
    // Get current date for reference
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][today.getDay()];
    
    // Create a truly unique random seed that changes daily
    return `${dateString}-${uuid}-${Math.random().toString(36).substring(2, 15)}-${today.getHours()}`;
}

function resourceGuidance() {
    // Get the current date and calculate the day of the month (1-31)
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    // Define the category rotation schedule
    const categoryRotation = {
        "day1": "Personal Wellness",
        "day4": "Relationship Guidance",
        "day8": "Career and Finances",
        "day12": "Child Guidance",
        "day16": "Important Person Guidance"
    };
    
    // Calculate which day in the rotation cycle (1-3) we're on
    // This ensures we only show a suggestion every third day
    const rotationDay = dayOfMonth % 3;
    console.log("ROTATION DAY ", rotationDay);
    
    // Only show a suggestion if today is a "first day" in the 3-day cycle (remainder = 1)
    if (rotationDay !== 1) {
        return null; // No suggestion for today
    }
    
    // Determine which category to show based on the day of the month
    let guidance;
    if (dayOfMonth >= 1 && dayOfMonth < 4) {
        guidance = categoryRotation.day1;
    } else if (dayOfMonth >= 4 && dayOfMonth < 8) {
        guidance = categoryRotation.day4;
    } else if (dayOfMonth >= 8 && dayOfMonth < 12) {
        guidance = categoryRotation.day8;
    } else if (dayOfMonth >= 12 && dayOfMonth < 16) {
        guidance = categoryRotation.day16;
    } else {
        guidance = categoryRotation.day16;
    }

    console.log("TODAY'S RESOURCE ", guidance);
    
    return guidance;
}

function relationshipStatus(userNamesData, jsonSinglePersonData) {
    const isInRelationship = userNamesData.partnerName && userNamesData.partnerName.trim() !== "";
    const isSingle = jsonSinglePersonData.relationship_status && 
                   (jsonSinglePersonData.relationship_status.toLowerCase().includes("single") || 
                    jsonSinglePersonData.relationship_status.toLowerCase().includes("divorced") ||
                    jsonSinglePersonData.relationship_status.toLowerCase().includes("widowed") ||
                    jsonSinglePersonData.relationship_status.toLowerCase().includes("seeking"));

    return {
        isInRelationship: isInRelationship,
        isSingle: isSingle
    };
}

function predictionTimeframes(astroData) {
    const predictionTimeframes = [
        "in the next 24 hours", 
        "this week", 
        "within the next three days", 
        "before the next full moon",
        "by the end of this month",
        "before the next Mercury retrograde", 
        "within the next lunar cycle",
        "by the weekend",
        "before the month ends",
        "as the Sun moves through " + astroData.sunPosition,
        "while Mercury travels through " + astroData.mercuryPosition,
        "as the Moon waxes toward fullness",
        "as the Moon wanes from fullness",
        "during this " + astroData.currentMoonPhase + " phase"
    ];

    const today = new Date();
    return predictionTimeframes[today.getDay() + today.getDate() % predictionTimeframes.length];
}

function getDailyAstrologicalData() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    
    // Lunar phases (approximate based on date)
    const lunarDay = day % 30;
    let moonPhase;
    if (lunarDay < 4) moonPhase = "New Moon";
    else if (lunarDay < 11) moonPhase = "Waxing Crescent";
    else if (lunarDay < 15) moonPhase = "First Quarter";
    else if (lunarDay < 19) moonPhase = "Waxing Gibbous";
    else if (lunarDay < 22) moonPhase = "Full Moon";
    else if (lunarDay < 26) moonPhase = "Waning Gibbous";
    else if (lunarDay < 30) moonPhase = "Last Quarter";
    else moonPhase = "Waning Crescent";
    
    // Zodiac signs (approximate)
    const zodiacSigns = [
        "Aries", "Taurus", "Gemini", "Cancer", 
        "Leo", "Virgo", "Libra", "Scorpio", 
        "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    
    // Planet positions (simplified - would come from real ephemeris)
    const moonPosition = zodiacSigns[(month + day % 12) % 12];
    const sunPosition = zodiacSigns[(month - 1 + Math.floor(day/30)) % 12];
    const mercuryPosition = zodiacSigns[(month + 2 + day % 12) % 12];
    const venusPosition = zodiacSigns[(month + 1 + Math.floor(day/15)) % 12];
    const marsPosition = zodiacSigns[(month + 3 + Math.floor(day/20)) % 12];
    const jupiterPosition = zodiacSigns[(month + 4 + Math.floor(day/25)) % 12];
    
    // Retrogrades (simulated based on date)
    const retrogradeOptions = [
        "Mercury Retrograde",
        "Venus Retrograde", 
        "Mars Retrograde",
        "Jupiter Retrograde",
        "Saturn Retrograde",
        "Uranus Retrograde",
        "Neptune Retrograde",
        "Pluto Retrograde",
        "No major planets in retrograde"
    ];
    
    // Select retrogrades based on day
    const retrogradeIndex = (day * month) % retrogradeOptions.length;
    const currentRetrogrades = retrogradeOptions[retrogradeIndex];
    
    // Significant transits (important planet movements)
    const transitOptions = [
        `Mercury entering ${mercuryPosition}`,
        `Venus and Mars in ${venusPosition} creating a trine aspect`,
        `Sun square Jupiter in ${jupiterPosition}`,
        `New Moon in ${moonPosition}`,
        `Full Moon opposing Saturn`,
        `Mars conjunct Pluto in ${marsPosition}`,
        `Jupiter entering ${jupiterPosition}`,
        `Mercury sextile Venus`,
        `Saturn stationing direct`,
        `Venus square Uranus`,
        `Sun conjunct Mercury in ${sunPosition}`,
        `Neptune trine Mars`
    ];
    
    const transitIndex = (day + month) % transitOptions.length;
    const significantTransit = transitOptions[transitIndex];
    
    // Current planetary positions summary
    const planetarySummaries = [
        `Mercury in ${mercuryPosition} and Jupiter in ${jupiterPosition} creating a harmonious trine`,
        `Sun in ${sunPosition} squaring Saturn, creating tension with authority figures`,
        `Venus in ${venusPosition} opposing Mars in ${marsPosition}, heightening relationship dynamics`,
        `Mercury retrograde in ${mercuryPosition} causing communication challenges`,
        `Jupiter in ${jupiterPosition} forming a grand trine with Saturn and Neptune`,
        `Mars in ${marsPosition} squaring Pluto, intensifying power dynamics`,
        `Venus in ${venusPosition} conjunct Jupiter in ${jupiterPosition}, bringing abundance`,
        `Mercury, Venus, and Mars forming a stellium in ${mercuryPosition}`,
        `Sun in ${sunPosition} trine Moon in ${moonPosition}, creating emotional harmony`,
        `Saturn opposing Uranus, creating tension between tradition and innovation`,
        `Neptune retrograde causing spiritual awakening and revealing illusions`,
        `Pluto stationing direct, bringing transformation to power structures`,
        `Chiron stationed retrograde in Aries, triggering healing of old wounds`,
        `North Node in Taurus emphasizing financial stability and natural resources`,
        `Lilith in ${zodiacSigns[(month + 5) % 12]} amplifying personal boundaries and authentic expression`,
        `Ceres conjunct Venus in ${venusPosition}, nurturing relationships and self-worth`,
        `Pallas Athena in ${zodiacSigns[(month + 6) % 12]} enhancing strategic thinking and creative problem-solving`,
        `Vesta in ${zodiacSigns[(month + 7) % 12]} illuminating your sacred purpose and dedication`,
        `Juno in ${zodiacSigns[(month + 8) % 12]} highlighting partnership commitments and equality`,
        `Eclipse season approaching, amplifying transformation and revelations`,
        `Mercury out of shadow phase, clearing communication channels`,
        `Uranus square Mars creating unexpected breakthroughs and restlessness`,
        `Neptune forming a grand water trine with personal planets, deepening intuition`,
        `Saturn forming positive aspects to natal planets, strengthening foundations`
    ];
    
    const planetaryIndex = (day * month + day) % planetarySummaries.length;
    const currentPlanetaryPositions = planetarySummaries[planetaryIndex];

    return {
        currentMoonPhase: moonPhase,
        currentMoonSign: moonPosition,
        currentRetrogrades: currentRetrogrades,
        significantTransit: significantTransit,
        sunPosition: sunPosition,
        mercuryPosition: mercuryPosition,
        venusPosition: venusPosition,
        marsPosition: marsPosition,
        jupiterPosition: jupiterPosition,
        currentPlanetaryPositions: currentPlanetaryPositions
    };
}

function variationStyles() {

    const variationStyles = [
        "Use vivid sensory language and unexpected metaphors today",
        "Emphasize the contrasts and polarities in cosmic energies today",
        "Focus on the transformative potential of today's aspects",
        "Highlight subtle, often overlooked astrological influences today",
        "Emphasize the cyclical nature of cosmic patterns today",
        "Focus on how micro-cosmic events mirror macro-cosmic patterns today"
    ];

    return variationStyles[today.getDate() % variationStyles.length];
}

function getRelationshipGuidance() {
    return `
    RELATIONSHIP GUIDANCE AND MINI-HOROSCOPE INSTRUCTIONS:
    1. Each relationship section (partner, children, important person) MUST include a mini-horoscope for that person
    2. Mini-horoscopes should explain how today's specific astrological conditions are affecting them personally
    3. Focus on their likely emotional state, communication style, needs, and energy levels today
    4. Identify specific signals or patterns to watch for that indicate what they need
    5. Provide concrete, actionable advice on how to best connect with and support them today
    6. Include at least one specific challenge they may be facing due to today's planetary positions
    7. Suggest specific activities or approaches that will be especially effective today
    8. Keep insights specific, practical and grounded in today's actual astrological conditions
    
    FOR USERS WITH PARTNERS - INTIMATE CONNECTION GUIDANCE:
    1. Always include guidance on physical/intimate connection that relates directly to today's planetary positions
    2. Suggest specific approaches, timing, or settings that enhance intimate connection today
    3. Balance practical advice with romantic/sensual suggestions that are tasteful and appropriate
    4. Connect physical intimacy to emotional bonding in ways that are relevant to today's cosmic energy
    5. Frame intimate guidance in terms of deepening connection rather than just physical satisfaction
    6. Consider today's astrological implication that specifically influence romantic and physical energy
    
    FOR SINGLE USERS - RELATIONSHIP SEEKING GUIDANCE:
   Begin with a SPECIFIC PREDICTION about how today's unique cosmic energy, 
   is influencing ${user.firstName}'s romantic magnetism and 
   relationship potential. Read and understand the persons personality profile , their sexual preferences, their hopes dreams 
   and future desires. Subtly reference this occasionally in your predictive guidance, so as to create a sense of authentic 
   understanding of their needs etc. Describe which facets of ${user.firstName}'s personality are being cosmically enhanced 
   today that might attract potential partners. Identify and occasionally mention specific LOCATIONS, ACTIVITIES, or SOCIAL 
   CONTEXTS that are astrologically favorable for meeting compatible people ${todaysPredictionTimeframe} based on today's 
   planetary positions. Occasionally Suggest a specific APPEARANCE ELEMENT (color to wear, accessory, hairstyle) that will 
   enhance attractive energy under today's cosmic influences. Be flexible with the closing statement. Sometimes its important 
   to acknowledge how difficult their search for healthy, loving, supportive relationship  concerns can be.
    `;
}
    
function psychicElements() {
    return `
    PREDICTION AND PSYCHIC ELEMENT INSTRUCTIONS:
    1. Each section MUST include at least one specific, testable prediction for the timeframe mentioned
    2. Incorporate intuitive elements like colors, symbols, numbers, or synchronicities to watch for
    3. Predictions should be specific enough to be memorable but not so specific they feel implausible
    4. Balance spiritual/intuitive insights with practical astrological guidance
    5. Keep the tone mystical and insightful without becoming too abstract or "woo-woo"
    6. Use language that evokes intuition and inner knowing rather than superstition
    7. Predictions should feel personal and tailored to the individual, not generic
    8. Include one unexpected or surprising prediction in each section
    `;
}
    
function creativityInstructions(dateString, randomSeed) {
    return `
    IMPORTANT CREATIVITY AND NON-REPETITION REQUIREMENTS:
    1. Each horoscope MUST BE SUBSTANTIALLY DIFFERENT from horoscopes delivered in the past 7 days
    2. DO NOT REUSE phrases, metaphors, symbols, colors, or numbers from previous days
    3. Reference today's SPECIFIC DATE (${dateString}) and incorporate unique seasonal elements relevant to this time of year
    4. Vary your sentence structures, vocabulary choices, and writing style from day to day
    5. Create predictions that are specific, concrete, and testable rather than vague
    6. Use the following unique seed for today's generation: ${randomSeed}
    7. Each section must include at least one element that has NEVER appeared in previous horoscopes
    8. Today's style guide: ${variationStyles()}

    AVOID REPETITIVE PATTERNS:
    - No repeating the same colors, numbers, or symbols within a 10-day period
    - Do not use the phrase "trust your intuition" or similar generic advice more than once per week
    - Vary the cosmic bodies referenced (use asteroids, fixed stars, nodes, and houses - not just planets)
    - Create distinct synchronicity patterns each day (not just "watch for three references to X")
    - Alternate between different types of predictions (career opportunities, conversations, insights, physical experiences)
    - Use different timeframes for predictions (morning/afternoon/evening, specific dates, astrological events)
    - Avoid starting sections with the same sentence structure used in previous days
    `;
}

// temp=0.86, top_p=0.66, freq=0.66, pres=0.66
// Dynamic creativity parameters that change daily
function getCreativityParams() {

    const today = new Date();
    const dayOfMonth = today.getDate();
    
    // Vary temperature based on day of month (higher values = more creativity/variety)
    // Range from 0.7 to 0.95 for good variety while maintaining coherence
    const dynamicTemperature = 0.7 + ((dayOfMonth % 25) / 100);
    
    // Vary top_p parameter as well for additional diversity
    const dynamicTopP = 0.5 + ((dayOfMonth % 40) / 100);
    
    // Adjust frequency and presence penalties to reduce repetition
    const frequencyPenalty = 0.5 + ((dayOfMonth % 30) / 100);
    const presencePenalty = 0.5 + ((dayOfMonth % 35) / 100);

    return {
        temp: dynamicTemperature,
        top_p: dynamicTopP,
        freq: frequencyPenalty,
        pres: presencePenalty
    }
}