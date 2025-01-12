function parseHoroscopeJson(jsonData) {
  const model = {
    overview: jsonData.overview || null,
    careerAndFinances: jsonData.career_and_finances || null,
    relationships: jsonData.relationships || null,
    parentingGuidance: jsonData.parenting_guidance || null,
    health: jsonData.health || null,
    personalGuidance: jsonData.personal_guidance || null,
    localWeather: jsonData.local_weather || null,
  };

  return model;
}
