// Enhanced form submission handling for ZodiAccurate form

/**
 * Centralized handler for form submission events
 * @param {Event} event The form submission event
 * @returns {Boolean} False to prevent default form submission
 */
async function handleFormSubmission(event) {
    // Always prevent default form submission
    event.preventDefault();
    
    console.log("Form submission initiated...");
    
    // Validate final consent checkboxes
    const consentAgree = document.getElementById("consent_agree");
    const emailAgree = document.getElementById("email_agree");
    const errorElement = document.getElementById("consent-error");
    
    if (!consentAgree || !consentAgree.checked || !emailAgree || !emailAgree.checked) {
        if (errorElement) {
            errorElement.style.display = "block";
            errorElement.textContent = "You must agree to both policies before submitting.";
        }
        console.log("Submission halted: Consent validation failed");
        return false;
    }
    
    // Disable submit button to prevent double submission
    const submitButton = document.querySelector(".submit");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.style.pointerEvents = "none";
        submitButton.textContent = "Processing...";
        submitButton.style.backgroundColor = "#ccc";
    }
    
    // Start the loading animation
    const rotatingTextDiv = document.getElementById("rotatingText");
    if (rotatingTextDiv) {
        startRotatingText(rotatingTextDiv);
    }
    
    try {
        // Collect all form data
        const formData = await collectAllFormData();
        
        // Get the UUID from the URL if present
        const uuid = getUUIDFromUrl();
        if (uuid) {
            formData.uuid = uuid;
        }
        
        console.log("Form data prepared for submission");
        
        // Submit to Firebase
        const response = await fetch("https://handleformsubmission-feti3ggk7q-uc.a.run.app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("Form submitted successfully:", result);
        
        // Show success message
        alert(result.message || "Form submitted successfully! You will receive your personalized astrological guidance soon.");
        
        // Update UI to show completed state
        markFormAsCompleted();
        
        return false;
    } catch (error) {
        console.error("Error submitting form:", error);
        
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.pointerEvents = "";
            submitButton.textContent = "Submit";
            submitButton.style.backgroundColor = "#d6138f";
        }
        
        // Stop the loading animation
        if (rotatingTextDiv) {
            stopRotatingText(rotatingTextDiv);
        }
        
        // Show error message to user
        alert("There was an error submitting the form. Please try again or contact support if the problem persists.");
        
        return false;
    }
}

/**
 * Collect and process all form data
 * @returns {Object} The fully processed form data
 */
async function collectAllFormData() {
    // Get basic form data
    const form = document.getElementById("multiStepForm");
    const formData = {};
    
    // Process all input elements
    const allFormElements = form.querySelectorAll("input, select, textarea");
    allFormElements.forEach((element) => {
        if (!element.name) return;
        
        if (element.type === "checkbox") {
            if (element.checked) {
                if (!formData[element.name]) {
                    formData[element.name] = [];
                }
                
                if (!formData[element.name].includes(element.value)) {
                    formData[element.name].push(element.value);
                }
            }
        } else if (element.type === "radio") {
            if (element.checked) {
                formData[element.name] = element.value;
            }
        } else {
            formData[element.name] = element.value.trim();
        }
    });
    
    // Special processing for sections
    processChildrenData(formData);
    processImportantPersonsData(formData);
    processPartnerData(formData);
    
    // Remove empty values
    removeEmptyValues(formData);
    
    return formData;
}

/**
 * Process children section data
 * @param {Object} formData The form data object to update
 */
function processChildrenData(formData) {
    const childContainer = document.getElementById("child-container");
    if (!childContainer) return;
    
    // Count how many child entries we have
    const childEntries = childContainer.querySelectorAll(".child-entry");
    formData["number_of_children"] = childEntries.length > 0 ? `${childEntries.length} Child${childEntries.length > 1 ? 'ren' : ''}` : "";
    
    // Process each child entry
    childEntries.forEach((childEntry) => {
        const childId = childEntry.id.split("-")[1];
        const nameMapping = {
            "1": "one",
            "2": "two",
            "3": "three",
            "4": "four",
            "5": "five"
        };
        
        // Map field values using both formats (for backward compatibility)
        const fieldMappings = [
            { original: `child_name_${childId}`, mapped: `child_${nameMapping[childId]}_first_name` },
            { original: `child_birth_place_${childId}`, mapped: `child_${nameMapping[childId]}_birth_place` },
            { original: `child_birth_date_${childId}`, mapped: `child_${nameMapping[childId]}_birth_date` },
            { original: `child_birth_time_${childId}`, mapped: `child_${nameMapping[childId]}_birth_time` },
            { original: `child_gender_${childId}`, mapped: `child_${nameMapping[childId]}_gender` },
            { original: `child_activities_${childId}`, mapped: `child_${nameMapping[childId]}_primary_activities` },
            { original: `child_stress_${childId}`, mapped: `child_${nameMapping[childId]}_stress` },
            { original: `child_joy_${childId}`, mapped: `child_${nameMapping[childId]}_joy_and_satisfaction` },
            { original: `child_concerns_${childId}`, mapped: `child_${nameMapping[childId]}_long_term_concerns` }
        ];
        
        // Process regular fields
        fieldMappings.forEach(mapping => {
            const field = childEntry.querySelector(`[name="${mapping.original}"]`);
            if (field) {
                if (field.type === "radio") {
                    // For radio buttons, check if selected
                    if (field.checked) {
                        formData[mapping.original] = field.value;
                        formData[mapping.mapped] = field.value;
                    }
                } else {
                    // For regular inputs and textareas
                    if (field.value.trim()) {
                        formData[mapping.original] = field.value.trim();
                        formData[mapping.mapped] = field.value.trim();
                    }
                }
            }
        });
        
        // Process gender radio buttons specifically
        const genderRadios = childEntry.querySelectorAll(`[name="child_gender_${childId}"]`);
        genderRadios.forEach(radio => {
            if (radio.checked) {
                formData[`child_gender_${childId}`] = radio.value;
                formData[`child_${nameMapping[childId]}_gender`] = radio.value;
            }
        });
    });
}

/**
 * Process important persons section data
 * @param {Object} formData The form data object to update
 */
function processImportantPersonsData(formData) {
    const container = document.getElementById("important-person-container");
    if (!container) return;
    
    const entries = container.querySelectorAll(".important-person-entry");
    
    // Process each entry
    entries.forEach(entry => {
        const personId = entry.id.split("-")[2];
        
        // Basic fields
        const fieldNames = [
            "name",
            "birthdate",
            "birth_time",
            "birth_city",
            "impact",
            "stress",
            "appreciation",
            "improvement"
        ];
        
        // Process each field
        fieldNames.forEach(fieldName => {
            const field = entry.querySelector(`[name="important_person_${fieldName}_${personId}"]`);
            if (field && field.value.trim()) {
                formData[`important_person_${fieldName}_${personId}`] = field.value.trim();
            }
        });
        
        // Process relation radio buttons
        const relationRadios = entry.querySelectorAll(`[name="important_person_relation_${personId}"]`);
        relationRadios.forEach(radio => {
            if (radio.checked) {
                formData[`important_person_relation_${personId}`] = radio.value;
            }
        });
        
        // Process conflict checkboxes
        const conflictCheckboxes = entry.querySelectorAll(`[name="important_person_conflict_${personId}"]:checked`);
        if (conflictCheckboxes.length > 0) {
            formData[`important_person_conflict_${personId}`] = Array.from(conflictCheckboxes).map(cb => cb.value);
        }
    });
}

/**
 * Process partner section data
 * @param {Object} formData The form data object to update
 */
function processPartnerData(formData) {
    const partnerSection = document.getElementById("partner-section");
    if (!partnerSection || partnerSection.style.display === "none") return;
    
    // Basic fields
    const fieldMappings = [
        { original: "partner_name_1", mapped: "partner_name" },
        { original: "partner_birth_date_1", mapped: "partner_birth_date" },
        { original: "partner_birth_time_1", mapped: "partner_birth_time" },
        { original: "partner_birth_city_1", mapped: "partner_birth_city" },
        { original: "partner_stress_1", mapped: "partner_stress" },
        { original: "partner_love_1", mapped: "partner_appreciation" },
        { original: "partner_improve_1", mapped: "partner_improvements" }
    ];
    
    // Process regular fields
    fieldMappings.forEach(mapping => {
        const field = partnerSection.querySelector(`[name="${mapping.original}"]`);
        if (field && field.value.trim()) {
            formData[mapping.original] = field.value.trim();
            formData[mapping.mapped] = field.value.trim();
        }
    });
    
    // Process conflict checkboxes
    const conflictCheckboxes = partnerSection.querySelectorAll('[name="partner_conflict_1"]:checked');
    if (conflictCheckboxes.length > 0) {
        const values = Array.from(conflictCheckboxes).map(cb => cb.value);
        formData["partner_conflict_1"] = values;
        formData["partner_conflict"] = values;
    }
    
    // Process belief system radio
    const beliefRadio = partnerSection.querySelector('[name="belief_system"]:checked');
    if (beliefRadio) {
        formData["partners_belief_system"] = beliefRadio.value;
    }
}

/**
 * Remove empty values from form data
 * @param {Object} obj The form data object to clean
 * @returns {Object} The cleaned object
 */
function removeEmptyValues(obj) {
    Object.keys(obj).forEach(key => {
        // For arrays (like checkbox groups)
        if (Array.isArray(obj[key])) {
            if (obj[key].length === 0) {
                delete obj[key];
            }
        } 
        // For strings
        else if (typeof obj[key] === 'string') {
            if (obj[key].trim() === '') {
                delete obj[key];
            }
        }
        // For null or undefined
        else if (obj[key] === null || obj[key] === undefined) {
            delete obj[key];
        }
    });
    
    return obj;
}

/**
 * Start rotating text animation
 * @param {HTMLElement} element The element to animate
 */
function startRotatingText(element) {
    const rotatingStrings = [
        "Initializing astrological data...",
        "Fetching celestial coordinates...",
        "Calculating planetary alignments...",
        "Analyzing natal charts...",
        "Loading zodiac sign information...",
        "Processing transit cycles...",
        "Updating celestial positions...",
        "Computing horoscope insights...",
        "Synchronizing astral events...",
        "Finalizing astrological analysis...",
        "Do not exit or refresh page..."
    ];
    
    let currentIndex = 0;
    element.style.display = 'block';
    element.textContent = rotatingStrings[0];
    
    const intervalId = setInterval(() => {
        currentIndex = (currentIndex + 1) % rotatingStrings.length;
        element.textContent = rotatingStrings[currentIndex];
    }, 2000);
    
    // Store interval ID on element for later cleanup
    element.dataset.intervalId = intervalId;
}

/**
 * Stop rotating text animation
 * @param {HTMLElement} element The element to stop animating
 */
function stopRotatingText(element) {
    if (element.dataset.intervalId) {
        clearInterval(parseInt(element.dataset.intervalId));
        delete element.dataset.intervalId;
    }
    element.style.display = 'none';
}

/**
 * Mark the form as completed after successful submission
 */
function markFormAsCompleted() {
    // Hide all previous buttons
    document.querySelectorAll(".prev").forEach(button => {
        button.style.display = "none";
    });
    
    // Disable all form elements
    document.querySelectorAll("input, select, textarea").forEach(element => {
        element.disabled = true;
    });
    
    // Update submit button appearance
    const submitButton = document.querySelector('.submit');
    if (submitButton) {
        submitButton.style.pointerEvents = "none";
        submitButton.textContent = "Submitted";
        submitButton.style.color = "#5a3e85";
        submitButton.style.backgroundColor = "#f5d76e";
    }
    
    // Hide rotating text
    const rotatingTextDiv = document.getElementById('rotatingText');
    if (rotatingTextDiv) {
        stopRotatingText(rotatingTextDiv);
    }
}

/**
 * Get UUID from URL query string
 * @returns {string|null} The UUID if found, null otherwise
 */
function getUUIDFromUrl() {
    const query = window.location.search;
    if (query && query.length > 1) {
        return query.substring(1);
    }
    return null;
}

// Attach form submission handler when document is ready
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('multiStepForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmission);
        
        // Also handle direct click on submit button
        const submitButton = document.querySelector('.submit');
        if (submitButton) {
            submitButton.addEventListener('click', handleFormSubmission);
        }
    }
});

// Make functions available globally
window.handleFormSubmission = handleFormSubmission;
window.getUUIDFromUrl = getUUIDFromUrl;