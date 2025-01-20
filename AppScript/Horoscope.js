function parseHoroscopeJson(jsonData) {
  const normalizedData = normalizeKeys(jsonData);
  const model = {
    overview: normalizedData.overview || null,
    careerAndFinances: normalizedData.career_and_finances || null,
    relationships: normalizedData.relationships || null,
    parentingGuidance: normalizedData.parenting_guidance || null,
    health: normalizedData.health || null,
    personalGuidance: normalizedData.personal_guidance || null,
    localWeather: normalizedData.local_weather || null,
  };

  return model;
}
