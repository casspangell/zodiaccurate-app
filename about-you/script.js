const FIREBASE_FUNCTIONS_URL = "https://handleformsubmission-feti3ggk7q-uc.a.run.app";
const FIREBASE_GET_DATA_URL = "https://handleformdataretrieval-feti3ggk7q-uc.a.run.app";
import { validateRelationshipStatus, validateEmploymentStatus, validateFinalConsent } from "./validate.js";

// Make functions globally accessible for HTML inline onclick attributes
window.validateRelationshipStatus = validateRelationshipStatus;
window.validateEmploymentStatus = validateEmploymentStatus;
window.validateFinalConsent = validateFinalConsent;


document.addEventListener("DOMContentLoaded", function () {

    let currentSection = 0;
    const navigationHistory = [];
    const form = document.getElementById("multiStepForm");

    const sections = document.querySelectorAll(".section");
    const nextButtons = document.querySelectorAll(".next");
    const prevButtons = document.querySelectorAll(".prev");
    const submitButton = document.querySelector(".submit");
    const consentCheckbox = document.getElementById("consent-checkbox");
    const emailCheckbox = document.getElementById("agree-checkbox");

    const steps = document.querySelectorAll(".step");

    const relationshipStatus = document.getElementById("relationship-status");
    const partnerSection = document.getElementById("partner-section");
    const futurePartnerSection = document.getElementById("future-partner-section");
    const addPartnerButton = document.getElementById("add-partner");
    const partnerContainer = document.getElementById("partner-container");
    const addChildButton = document.getElementById("add-child");
    const childContainer = document.getElementById("child-container");

    const rotatingTextDiv = document.getElementById("rotatingText");

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

    const progressBar = document.createElement("div");
    document.querySelector(".progress-container").appendChild(progressBar);
    progressBar.classList.add("progress-bar-active");
    const progressContainer = document.querySelector(".progress-container");
    const emailInput = document.getElementById("email");

    let dbData = {};

    //------------------

    const uuid = getUUIDFromUrl();
    fetchData();
    //------------------

    let partnerCount = 1;
    let childCount = 0;
    let importantPersonCount = 0;
    updateProgressBar(0);

    const stepOrder = {
        0: "intro",
        1: "wellness",
        2: "relationship_status",
        3: ["partner", "future_partner"],
        4: "important_people",
        5: "children",
        6: "employment_status",
        7: ["employed", "unemployed", "retired"],
        8: "final"
    };

    const progressFlowOrder = {
        0: "intro",
        1: "wellness",
        2: "relationship_status",
        3: "partner", 
        4: "future_partner",
        5: "employment_status",
        6: "employed",
        7: "unemployed",
        8: "retired",
        9: "children",
        10: "important_people",
        11: "final"
    };

    async function fetchData() {
        const loadingOverlay = document.getElementById("loadingOverlay");
        loadingOverlay.style.display = "flex";
        const uuid = getUUIDFromUrl();

        if (uuid) {
            try {
                const response = await fetch(`${FIREBASE_GET_DATA_URL}?uuid=${encodeURIComponent(uuid)}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const result = await response.json();
                dbData = result;
                console.log("User found. Fetching data.");
                populateFormFields(result);
                updateLocalStorageWithData(result);

            } catch (error) {
                document.getElementById("loadingOverlay").style.display = "none";
                console.error("Error fetching data:", error);
            } finally {
                // Hide overlay when data is loaded or in case of an error
                setTimeout(() => {
                    loadingOverlay.style.display = "none";
                }, 3000);
            }
        } else {
            console.log("no uuid found");
            setTimeout(() => {
                loadingOverlay.style.display = "none";
            }, 3000);
        }
    }

    function populateFormFields(data) {
        // Loop through each key-value pair in the data object.
        Object.entries(data).forEach(([fieldName, value]) => {
            // Handle radio buttons separately
            if (document.querySelector(`input[type="radio"][name="${fieldName}"]`)) {
                const radioButton = document.querySelector(`input[type="radio"][name="${fieldName}"][value="${value}"]`);
                if (radioButton) {
                    radioButton.checked = true;
                }
            } else {
                // Find the element with the given ID for other input types
                const field = document.getElementById(fieldName);
                if (field) {
                    if (
                        field instanceof HTMLInputElement ||
                        field instanceof HTMLTextAreaElement ||
                        field instanceof HTMLSelectElement
                    ) {
                        field.value = value;
                    } else {
                        field.textContent = value;
                    }
                }
            }
        });
    }

    function populateImportantPersons(data) {
        // Collect indices from keys starting with "important_person_name_"
        const indices = [];
        Object.keys(data).forEach((key) => {
            console.log(key);
            if (key.startsWith("important_person_name_")) {

                const parts = key.split("_");
                const idx = parts[parts.length - 1];
                if (!indices.includes(idx)) {
                    indices.push(idx);
                }
            }
        });

        // If we found any important person entries, unhide the section.
        if (indices.length > 0) {
            document.getElementById("important-person-section").style.display = "block";
        }

        // Sort indices numerically so they appear in order.
        indices.sort((a, b) => parseInt(a) - parseInt(b));

        // For each detected index, add a card and prefill it.
        indices.forEach((dataIndex) => {
            // Call function to add a new important person card.
            addImportantPerson();
            const currentIndex = importantPersonCount;

            // List of fields to populate
            const fields = [
                "name",
                "birthdate",
                "birth_time",
                "birth_city",
                "relation",
                "impact",
                "stress",
                "appreciation",
                "improvement"
            ];

            // Update both input and textarea fields
            fields.forEach((field) => {
                const dataKey = `important_person_${field}_${dataIndex}`;
                const selector = `#important-person-${currentIndex} [name="important_person_${field}_${currentIndex}"]`;

                const element = document.querySelector(selector);
                if (element && data[dataKey] !== undefined) {
                    element.value = data[dataKey];
                }
            });

            // Handle checkboxes (e.g., conflict preferences)
            const conflictKey = `important_person_conflict_${dataIndex}`;
            if (data[conflictKey]) {
                const values = Array.isArray(data[conflictKey])
                    ? data[conflictKey]
                    : data[conflictKey].split(",").map(v => v.trim());

                const checkboxes = document.querySelectorAll(
                    `#important-person-${currentIndex} input[name="important_person_conflict_${currentIndex}"]`
                );
                checkboxes.forEach((checkbox) => {
                    if (values.includes(checkbox.value)) {
                        checkbox.checked = true;
                    }
                });
            }
        });
    }

    // Overwrite local storage data with the new data.
    function updateLocalStorageWithData(data) {
        Object.entries(data).forEach(([key, value]) => {
            // If value is an object, store it as JSON; otherwise, store the string representation.
            localStorage.setItem(key, typeof value === "object" ? JSON.stringify(value) : value);
        });
    }

    function getUUIDFromUrl() {
        // window.location.search returns a string like "?5dee1b8e-a2f5-4613-8655-f9667561cead"
        const query = window.location.search;
        if (query && query.length > 1) {
            return query.substring(1);
        }
        return null;
    }

    // Load saved form data from localStorage
    let formData = JSON.parse(localStorage.getItem("formData")) || {};

    loadFormData();

    // Function to save form data to localStorage
    function saveFormData() {
        sections[currentSection].querySelectorAll("input, select, textarea").forEach((input) => {
            if (input.type === "checkbox") {
                if (!formData[input.name]) {
                    formData[input.name] = [];
                }
                if (input.checked && !formData[input.name].includes(input.value)) {
                    formData[input.name].push(input.value);
                } else if (!input.checked) {
                    formData[input.name] = formData[input.name].filter((val) => val !== input.value);
                }
            } else if (input.type === "radio") {
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.name] = input.value;
            }
        });
        localStorage.setItem("formData", JSON.stringify(formData));
    }

    // Function to restore form data from localStorage
    function loadFormData() {
        sections.forEach((section) => {
            section.querySelectorAll("input, select, textarea").forEach((input) => {
                if (formData.hasOwnProperty(input.name)) {
                    if (input.type === "checkbox") {
                        input.checked = Array.isArray(formData[input.name]) && formData[input.name].includes(input.value);
                    } else if (input.type === "radio") {
                        input.checked = input.value === formData[input.name];
                    } else {
                        input.value = formData[input.name] || "";
                    }
                } else {
                    if (input.type === "checkbox") {
                        input.checked = false;
                    } else if (input.type === "radio") {
                        input.checked = false;
                    } else {
                        input.value = "";
                    }
                }
            });
        });
    }

    // Function to validate email with regex
    function validateEmailField(input) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const errorMessageElement = document.getElementById("email-error");

        if (!errorMessageElement) return;

        if (input.value.trim() === "") {
            input.classList.add("error");
            errorMessageElement.textContent = "Email is required";
            errorMessageElement.style.display = "block";
        } else if (!emailRegex.test(input.value)) {
            input.classList.add("error");
            errorMessageElement.textContent = "Please enter a valid email address";
            errorMessageElement.style.display = "block";
        } else {
            input.classList.remove("error");
            errorMessageElement.textContent = "";
            errorMessageElement.style.display = "none";
        }
    }

    // Attach event listeners to all required text fields
    document.querySelectorAll("input[required]").forEach((input) => {
        input.addEventListener("blur", function () {
            if (input.type === "email") {
                validateEmailField(input);
            } else {
                validateTextField(input);
            }
        });
    });

    function validateTextField(input) {
        const errorMessageElement = document.getElementById(`${input.id}-error`);

        if (!errorMessageElement) return; // If no error message element exists, return

        if (input.value.trim() === "") {
            input.classList.add("error");
            errorMessageElement.textContent = "This field is required";
            errorMessageElement.style.display = "block";
        } else {
            input.classList.remove("error");
            errorMessageElement.textContent = "";
            errorMessageElement.style.display = "none";
        }
    }

    function validateSection() {
        const currentSectionElement = document.querySelector(".section.active");
        const requiredFields = currentSectionElement.querySelectorAll("input[required], select[required], textarea[required]");
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add("error");
                field.setCustomValidity("This field is required.");
            } else {
                field.classList.remove("error");
                field.setCustomValidity("");
            }
        });

        return isValid;
    }

    document.querySelectorAll("input, select, textarea").forEach((input) => {
        input.addEventListener("input", saveFormData);
        input.addEventListener("change", saveFormData);
        input.addEventListener("blur", saveFormData);
    });

    function updateProgressBar(index) {
        const steps = document.querySelectorAll(".step");
        const progressBar = document.querySelector(".progress-bar");

        if (index < 0 || index >= steps.length) return;

        // Get bounding positions
        const firstStep = steps[0].getBoundingClientRect().top;
        const lastStep = steps[steps.length - 1].getBoundingClientRect().top;
        const activeStep = steps[index].getBoundingClientRect().top;

        // Calculate exact height to align the bar to the middle of each button
        const stepHeight = steps[0].offsetHeight; // Use step height for centering
        const progressHeight = (activeStep - firstStep) + (stepHeight / 2);

        // Update progress bar height dynamically
        progressBar.style.height = `${progressHeight}px`;

        // Update step states
        steps.forEach((step, i) => {
            step.classList.remove("active", "completed");
            if (i < index) {
                step.classList.add("completed");
            } else if (i === index) {
                step.classList.add("active");
            }
        });
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
        progressContainer.style.display = "block"; // Ensure progress bar is visible
    }

    function showSection(index) {
        if (index == 10) { populateImportantPersons(dbData); }
        if (index == 9) { populateChildren(dbData); }
        sections.forEach((section, i) => {
            section.style.display = i === index ? "block" : "none";
        });

        const num = findStepNumber(index);
        if (num == null) {
            updateProgressBar(1);
        } else {
            updateProgressBar(num);
        }

        scrollToTop();
    }

    function goToSection(sectionNumber) {
        if (!progressFlowOrder.hasOwnProperty(sectionNumber)) {
            console.error(`Invalid section: ${sectionNumber}`);
            return;
        }

        navigationHistory.push(sectionNumber);
        currentSection = sectionNumber;
        showSection(currentSection);
    }

    nextButtons.forEach((button) => {
        button.addEventListener("click", function () {
            if (!validateSection()) {
                alert("Please fill out all required fields before continuing.");
                return;
            }

            let currentStep = progressFlowOrder[currentSection];

            if (Array.isArray(currentStep)) {
                currentStep = currentStep.find(step => document.getElementById(step)?.style.display === "block") || currentStep[0];
            }

            switch (currentStep) {
                case "intro":
                    goToSection(1);
                    break;
                case "wellness":
                    goToSection(2);
                    break;
                case "relationship_status":
                    const selectedStatus = document.querySelector('input[name="relationship_status"]:checked');
                    if (!selectedStatus) return;
                    const status = selectedStatus.value;

                    updateRelationshipSections(status);

                    if (["married", "committed", "separated_fix"].includes(status)) {
                        goToSection(3);
                    } else if (["future_partner", "divorced", "separated_differences", "widowed"].includes(status)) {
                        goToSection(4);
                    } else {
                        goToSection(10);
                    }
                    break;
                case "partner":
                case "future_partner":
                    goToSection(10);
                    break
                case "important_people":
                    goToSection(9);
                    break;
                case "children":
                    goToSection(5);
                    break;
                case "employment_status":
                    const selectedEmployment = document.querySelector('input[name="employment_status"]:checked');
                    if (!selectedEmployment) return;
                    const employmentStatus = selectedEmployment.value;
                    updateEmploymentSections(employmentStatus);

                    if (["employed", "business_owner", "entrepreneur", "self_employed"].includes(employmentStatus)) {
                        goToSection(6);
                    } else if (employmentStatus === "unemployed") {
                        goToSection(7);
                    } else if (employmentStatus === "retired") {
                        goToSection(8);
                    }
                    break;
                case "employed":
                case "unemployed":
                case "retired":
                    populateEmploymentData(dbData);
                    goToSection(11);
                    break;

                default:
                    console.error(`Unhandled section: ${currentStep}`);
                    break;
            }
        });
    });

    prevButtons.forEach((button) => {
        button.addEventListener("click", function () {
            resetChildren();
            resetImportantPersons();
            if (navigationHistory.length > 1) {
                navigationHistory.pop();
                currentSection = navigationHistory[navigationHistory.length - 1];
                showSection(currentSection);
            } else {
                navigationHistory.pop();
                currentSection = 0;
                showSection(0);
            }
        });
    });

    function findStepNumber(progressKey) {
        if (!progressFlowOrder.hasOwnProperty(progressKey)) {
            console.warn(`Invalid progress key: ${progressKey}`);
            return null;
        }

        const valueToFind = progressFlowOrder[progressKey];

        for (const stepKey in stepOrder) {
            if (Array.isArray(stepOrder[stepKey])) {
                if (stepOrder[stepKey].includes(valueToFind)) {
                    return parseInt(stepKey);
                }
            } else if (stepOrder[stepKey] === valueToFind) {
                return parseInt(stepKey);
            }
        }

        console.warn(`Value '${valueToFind}' not found in stepOrder`);
        return null;
    }

    showSection(currentSection);

    document.querySelectorAll("textarea.auto-expand").forEach((textarea) => {
        textarea.addEventListener("input", function () {
            this.style.height = "auto"; // Reset height to recalculate
            this.style.height = this.scrollHeight + "px"; // Set height based on content
        });
    });

    if (addChildButton) {
        if (!addChildButton.dataset.listener) {  // Prevent duplicate event listeners
            addChildButton.addEventListener("click", function () {
                addChild();
            });
            addChildButton.dataset.listener = "true";  // Mark event as added
        }
    }

    function resetChildren(){
        childCount = 0;
        document.getElementById("child-container").innerHTML = "";
    }               

    function addChild() {
        childCount++;
        const newChild = document.createElement("div");
        newChild.classList.add("child-entry");
        newChild.setAttribute("id", `child-${childCount}`);
        newChild.innerHTML = `
            <div class="child-card">
                <h3>Child ${childCount} Information</h3>
                <label>Child's First Name: <input type="text" id="child_name_${childCount}" name="child_name_${childCount}" placeholder="Example: Emily"></label><br>
                <label>Child's Birth Place: <input type="text" id="child_name_${childCount}" name="child_birth_place_${childCount}" placeholder="Example: Los Angeles, California, USA"></label><br>
                <label>Child's Birth Date: <input type="text" id="child_name_${childCount}" name="child_birth_date_${childCount}" placeholder="Example: May 25, 2019"></label><br>
                <label>Child's Birth Time: <input type="text" id="child_name_${childCount}" name="child_birth_time_${childCount}" placeholder="Example: 1:30 PM"></label><br>
                
                <label>What is your child's gender?</label><br>
                <div class="main-radio-group multi-column">
                   <label><input type="radio" id="child_gender_${childCount}" name="child_gender_${childCount}" value="Male"> Male</label>
                    <label><input type="radio" id="child_gender_${childCount}" name="child_gender_${childCount}" value="Female"> Female</label>
                    <label><input type="radio" id="child_gender_${childCount}" name="child_gender_${childCount}" value="Prefer Not to Say"> Prefer Not to Say</label>
                    <label><input type="radio" id="child_gender_${childCount}" name="child_gender_${childCount}" value="Other"> Other</label>
                </div>
                <br>
                <label for="child_activities_${childCount}">Child's Primary Activities:</label>
                <textarea id="child_activities_${childCount}" name="child_activities_${childCount}" class="text-large auto-expand" placeholder="Example: Playing soccer, reading books, and drawing."></textarea>

                <label for="child_stress_${childCount}">Child's Stress:</label>
                <textarea id="child_stress_${childCount}" name="child_stress_${childCount}" class="text-large auto-expand" placeholder="Example: 1. Adjusting to school. 2. Difficulty making friends. 3. Feeling overwhelmed with homework."></textarea>

                <label for="child_joy_${childCount}">Child's Joy and Satisfaction:</label>
                <textarea id="child_joy_${childCount}" name="child_joy_${childCount}" class="text-large auto-expand" placeholder="Example: Playing with friends, spending time with family, and exploring nature."></textarea>


                <label for="joy_satisfaction">Child's Long-Term Concerns:</label>
                <textarea type="text" id="child_concerns_${childCount}" name="child_concerns_${childCount}" class="text-large auto-expand" placeholder="Example: 1. Struggling with confidence. 2. Adapting to new environments. 3. Balancing school and extracurricular activities."></textarea>
                <button type="button" class="remove-child-btn" data-child-id="${childCount}">Remove Child</button>
            </div>
        `;

        childContainer.appendChild(newChild);
        // Attach remove event to the button immediately after adding the child
        newChild.querySelector(".remove-child-btn").addEventListener("click", function () {
            removeChild(newChild);
        });
    }

    function removeChild(childElement) {
        // Get the child ID from the element
        const childId = childElement.id;
        const childIndex = parseInt(childId.split('-')[1]);
        
        // Get the name mapping for this child
        const nameMapping = {
            1: "one",
            2: "two",
            3: "three",
            4: "four",
            5: "five"
        };
        
        // Remove from localStorage and formData
        const storedData = JSON.parse(localStorage.getItem("formData")) || {};
        
        // Remove all fields related to this child
        Object.keys(storedData).forEach(key => {
            // Check if this key is related to the deleted child using both naming patterns
            if (key.startsWith(`child_name_${childIndex}`) || 
                key.startsWith(`child_${nameMapping[childIndex]}_`) ||
                key.startsWith(`child_birth_place_${childIndex}`) ||
                key.startsWith(`child_birth_date_${childIndex}`) ||
                key.startsWith(`child_birth_time_${childIndex}`) ||
                key.startsWith(`child_gender_${childIndex}`) ||
                key.startsWith(`child_activities_${childIndex}`) ||
                key.startsWith(`child_stress_${childIndex}`) ||
                key.startsWith(`child_joy_${childIndex}`) ||
                key.startsWith(`child_concerns_${childIndex}`)) {
                
                delete storedData[key];
            }
        });
        
        // Save updated data back to localStorage
        localStorage.setItem("formData", JSON.stringify(storedData));
        
        // Finally, remove the element from DOM
        childElement.remove();
        childCount--;
        
        // Update number_of_children in localStorage if there are any children left
        if (childCount === 0) {
            delete storedData["number_of_children"];
            localStorage.setItem("formData", JSON.stringify(storedData));
        } else {
            storedData["number_of_children"] = `${childCount} Child${childCount > 1 ? 'ren' : ''}`;
            localStorage.setItem("formData", JSON.stringify(storedData));
        }
        
        console.log(`Child ${childIndex} removed from data and DOM`);
    }

    function populateChildren(data) {
        // Gather indices by checking for keys that start with "child_name_"
        const indices = [];
        Object.keys(data).forEach(key => {
            if (key.startsWith("child_name_")) {
                // E.g., key "child_name_1" yields index "1"
                const parts = key.split("_");
                const idx = parts[parts.length - 1];
                if (!indices.includes(idx)) {
                    indices.push(idx);
                }
            }
        });
        console.log("Extracted Child Indices:", indices);
        // If any child data is found, unhide the Children Section
        if (indices.length > 0) {
            document.getElementById("children-section").style.display = "block";
        }
        
        // Sort indices numerically to maintain the order
        indices.sort((a, b) => parseInt(a) - parseInt(b));
        
        // For each index, add a new child entry and prefill its fields
        indices.forEach(dataIndex => {
            // Call your existing addChild() function
            addChild();
            // The new card's index corresponds to the current value of the global childCount
            const currentIndex = childCount;
            
            // List the text fields to prefill
            const fields = [
                "name",
                "birth_place",
                "birth_date",
                "birth_time",
                "activities",
                "stress",
                "joy",
                "concerns",
                "activities"
            ];
            
            fields.forEach(field => {
                // Build the key from the Firebase data (for example: child_name_1)
                const dataKey = `child_${field}_${dataIndex}`;

                // Select both input and textarea fields
                const selector = `#child-${currentIndex} input[name="child_${field}_${currentIndex}"], 
                                #child-${currentIndex} textarea[name="child_${field}_${currentIndex}"]`;
                
                const inputElem = document.querySelector(selector);
                if (inputElem && data[dataKey] !== undefined) {
                    inputElem.value = data[dataKey];
                }
            });
            
            // Handle radio buttons for child gender
            const genderKey = `child_gender_${dataIndex}`;
            if (data[genderKey]) {
                const radios = document.querySelectorAll(
                    `#child-${currentIndex} input[name="child_gender_${currentIndex}"]`
                );
                radios.forEach(radio => {
                    if (radio.value === data[genderKey]) {
                        radio.checked = true;
                    }
                });
            }
        });
    }


    // Prevent duplicate event listeners
    if (!document.getElementById("add-important-person").dataset.listener) {
        document.getElementById("add-important-person").addEventListener("click", function () {
            addImportantPerson();
        });
        document.getElementById("add-important-person").dataset.listener = "true";
    }

    function resetImportantPersons(){
        importantPersonCount = 0;
        document.getElementById("important-person-container").innerHTML = "";
    }

 function addImportantPerson() {
        importantPersonCount++;
        const newPerson = document.createElement("div");
        newPerson.classList.add("important-person-entry");
        newPerson.setAttribute("id", `important-person-${importantPersonCount}`);
        newPerson.innerHTML = `
            <div class="important-person-card">
                <h3>Person ${importantPersonCount} Information</h3>
                <label>First Name: <input type="text" name="important_person_name_${importantPersonCount}" placeholder="Example: John"></label><br>
                <label>Birthdate: <input type="text" name="important_person_birthdate_${importantPersonCount}" placeholder="Example: May 25, 1984 or 'Unknown'"></label><br>
                <label>Birth Time: <input type="text" name="important_person_birth_time_${importantPersonCount}" placeholder="Example: 1:30 PM or 'Unknown'"></label><br>
                <label>Birth City: <input type="text" name="important_person_birth_city_${importantPersonCount}" placeholder="City, State, Country or 'Unknown'"></label><br>
                <label>What is your relationship with this person?</label><br>
                <div class="main-radio-group multi-column">
                    <label><input type="radio" id="important_person_relation_${importantPersonCount}" name="important_person_relation_${importantPersonCount}" value="Family Member"> Family Member</label>
                    <label><input type="radio" id="important_person_relation_${importantPersonCount}" name="important_person_relation_${importantPersonCount}" value="Roommate"> Roommate</label>
                    <label><input type="radio" id="important_person_relation_${importantPersonCount}" name="important_person_relation_${importantPersonCount}" value="Friend"> Friend</label>
                    <label><input type="radio" id="important_person_relation_${importantPersonCount}" name="important_person_relation_${importantPersonCount}" value="Business Partner"> Business Partner</label>
                    <label><input type="radio" id="important_person_relation_${importantPersonCount}" name="important_person_relation_${importantPersonCount}" value="Ex-Partner"> Ex-Partner</label>
                    <label><input type="radio" id="important_person_relation_${importantPersonCount}" name="important_person_relation_${importantPersonCount}" value="Other"> Other</label>
                </div>
                <br>
                <label for="joy_satisfaction">Describe how this person affects your daily life:</label>
                <textarea id="important_person_impact_${importantPersonCount}" name="important_person_impact_${importantPersonCount}" class="text-large auto-expand" placeholder="Example: This person inspires me to work harder and stay positive, but they can also add stress when we disagree."></textarea>

                <label for="important_person_stress_${importantPersonCount}">List 3-5 sources of stress related to this person</label>
                <textarea id="important_person_stress_${importantPersonCount}" name="important_person_stress_${importantPersonCount}" class="text-large auto-expand" placeholder="Example: 1. Miscommunication. 2. Different priorities. 3. Financial disagreements."></textarea>
                
                <label for="important_person_appreciation_${importantPersonCount}">List 3-5 things you appreciate about this person:</label>
                <textarea id="important_person_appreciation_${importantPersonCount}" name="important_person_appreciation_${importantPersonCount}" class="text-large auto-expand" placeholder="Example: 1. Their loyalty. 2. Their sense of humor. 3. Their ability to listen. 4. Their dedication to family. 5. Their honesty."></textarea>

                <label>How do you typically handle disagreements with this person?</label><br>
                <div class="main-checkbox-group multi-column">
                    <label><input type="checkbox" id="important_person_conflict_${importantPersonCount}" name="important_person_conflict_${importantPersonCount}" value="Address Immediately"> Address Immediately</label>
                    <label><input type="checkbox" id="important_person_conflict_${importantPersonCount}" name="important_person_conflict_${importantPersonCount}" value="Take Time to Cool Down"> Take Time to Cool Down</label>
                    <label><input type="checkbox" id="important_person_conflict_${importantPersonCount}" name="important_person_conflict_${importantPersonCount}" value="Avoid Confrontation"> Avoid Confrontation</label>
                    <label><input type="checkbox" id="important_person_conflict_${importantPersonCount}" name="important_person_conflict_${importantPersonCount}" value="Seek a Third-Party Opinion"> Seek a Third-Party Opinion</label>
                </div>
                <br>

                <label for="important_person_improvement_${importantPersonCount}">List 3-5 ways you want to improve your relationship with this person (Optional):</label>
                <textarea id="important_person_improvement_${importantPersonCount}" name="important_person_improvement_${importantPersonCount}" class="text-large auto-expand" placeholder="Example: 1. Their loyalty. 2. Their sense of humor. 3. Their ability to listen. 4. Their dedication to family. 5. Their honesty."></textarea>

                <button type="button" class="remove-important-person-btn" data-person-id="${importantPersonCount}">Remove This Person</button>
            </div>
        `;
        document.getElementById("important-person-container").appendChild(newPerson);
        newPerson.querySelector(".remove-important-person-btn").addEventListener("click", function () {
            removeImportantPerson(newPerson);
        });
    }

    // Function to remove an important person section
    function removeImportantPerson(personElement) {
        // Get the person ID from the element
        const personId = personElement.id;
        const personIndex = parseInt(personId.split('-')[2]);
        
        // Remove from localStorage and formData
        const storedData = JSON.parse(localStorage.getItem("formData")) || {};
        
        // Remove all fields related to this important person
        Object.keys(storedData).forEach(key => {
            if (key.startsWith(`important_person_${personIndex}_`)) {
                delete storedData[key];
            }
        });
        
        // Save updated data back to localStorage
        localStorage.setItem("formData", JSON.stringify(storedData));
        
        // Remove the element from DOM
        personElement.remove();
        importantPersonCount--;
        
        console.log(`Important Person ${personIndex} removed from data and DOM`);
    }

    // Improved function to collect form data that properly handles all input types
    function collectFormData() {
        const formData = {};
        
        // Get all form inputs, select menus, and textareas
        const allFormElements = document.querySelectorAll("input, select, textarea");
        
        allFormElements.forEach((element) => {
            // Skip elements without names
            if (!element.name) return;
            
            if (element.type === "checkbox") {
                // For checkboxes, we need to handle groups
                if (element.checked) {
                    if (!formData[element.name]) {
                        formData[element.name] = [];
                    }
                    
                    // If this checkbox was already processed, don't add it again
                    if (!formData[element.name].includes(element.value)) {
                        formData[element.name].push(element.value);
                    }
                }
            } else if (element.type === "radio") {
                // For radio buttons, only include the checked ones
                if (element.checked) {
                    formData[element.name] = element.value;
                }
            } else {
                // For text inputs, textareas, and selects
                formData[element.name] = element.value.trim();
            }
        });
        
        // Special handling for dynamically created sections
        processChildrenData(formData);
        processImportantPersonsData(formData);
        processPartnerData(formData);
        
        console.log("Complete form data collected:", formData);
        return formData;
    }

    /**
     * Process children data to ensure all fields are properly collected
     */
    function processChildrenData(formData) {
        const childContainer = document.getElementById("child-container");
        if (!childContainer) return;
        
        // Count how many child entries we have
        const childEntries = childContainer.querySelectorAll(".child-entry");
        formData["number_of_children"] = childEntries.length > 0 ? `${childEntries.length} Child${childEntries.length > 1 ? 'ren' : ''}` : "";
        
        // For each child entry, make sure all fields are properly named
        childEntries.forEach((childEntry, index) => {
            const childIndex = index + 1;
            
            // Create proper child field names for database formatting
            // Convert child_name_1 to child_one_first_name
            const nameMapping = {
                1: "one",
                2: "two",
                3: "three",
                4: "four",
                5: "five"
            };
            
            // Basic fields
            const nameField = childEntry.querySelector(`[name="child_name_${childIndex}"]`);
            if (nameField && nameField.value.trim()) {
                formData[`child_${nameMapping[childIndex]}_first_name`] = nameField.value.trim();
            }
            
            // Birth info
            const birthPlaceField = childEntry.querySelector(`[name="child_birth_place_${childIndex}"]`);
            if (birthPlaceField && birthPlaceField.value.trim()) {
                formData[`child_${nameMapping[childIndex]}_birth_place`] = birthPlaceField.value.trim();
            }
            
            const birthDateField = childEntry.querySelector(`[name="child_birth_date_${childIndex}"]`);
            if (birthDateField && birthDateField.value.trim()) {
                formData[`child_${nameMapping[childIndex]}_birth_date`] = birthDateField.value.trim();
            }
            
            const birthTimeField = childEntry.querySelector(`[name="child_birth_time_${childIndex}"]`);
            if (birthTimeField && birthTimeField.value.trim()) {
                formData[`child_${nameMapping[childIndex]}_birth_time`] = birthTimeField.value.trim();
            }
            
            // Gender
            const genderField = childEntry.querySelector(`[name="child_gender_${childIndex}"]:checked`);
            if (genderField) {
                formData[`child_${nameMapping[childIndex]}_gender`] = genderField.value;
            }
            
            // Textareas
            const activitiesField = childEntry.querySelector(`[name="child_activities_${childIndex}"]`);
            if (activitiesField && activitiesField.value.trim()) {
                formData[`child_${nameMapping[childIndex]}_primary_activities`] = activitiesField.value.trim();
            }
            
            const stressField = childEntry.querySelector(`[name="child_stress_${childIndex}"]`);
            if (stressField && stressField.value.trim()) {
                formData[`child_${nameMapping[childIndex]}_stress`] = stressField.value.trim();
            }
            
            const joyField = childEntry.querySelector(`[name="child_joy_${childIndex}"]`);
            if (joyField && joyField.value.trim()) {
                formData[`child_${nameMapping[childIndex]}_joy_and_satisfaction`] = joyField.value.trim();
            }
            
            const concernsField = childEntry.querySelector(`[name="child_concerns_${childIndex}"]`);
            if (concernsField && concernsField.value.trim()) {
                formData[`child_${nameMapping[childIndex]}_long_term_concerns`] = concernsField.value.trim();
            }
        });

        // Make sure we remove data from any deleted children
        // For example, if we have 3 children but childCount has decreased to 2
        for (let i = childEntries.length + 1; i <= 5; i++) {
        const nameMapping = {
            1: "one",
            2: "two",
            3: "three",
            4: "four",
            5: "five"
        };
        
        // Remove legacy data for this deleted child
        Object.keys(formData).forEach(key => {
            if (key.startsWith(`child_${nameMapping[i]}_`) || key.startsWith(`child_${i}_`)) {
                delete formData[key];
            }
        });
    }
    }

    /**
     * Process important persons data to ensure all fields are properly collected
     * Only saves data if it contains meaningful information
     */
    function processImportantPersonsData(formData) {
        const container = document.getElementById("important-person-container");
        if (!container) return;
        
        // Count how many entries we have
        const entries = container.querySelectorAll(".important-person-entry");
        
        // For each entry, verify if it contains meaningful data before processing
        entries.forEach((entry, index) => {
            const personIndex = index + 1;
            
            // First, check if this entry has a name (required field)
            const nameField = entry.querySelector(`[name="important_person_name_${personIndex}"]`);
            if (!nameField || !nameField.value.trim()) {
                console.log(`Important person ${personIndex} has no name - skipping`);
                return; // Skip this entry entirely if no name is provided
            }
            
            // Count how many fields have data for this person
            let fieldCount = 0;
            let hasData = false;
            
            // Check for data in various fields
            const fieldsToCheck = [
                `important_person_name_${personIndex}`,
                `important_person_birthdate_${personIndex}`,
                `important_person_birth_time_${personIndex}`,
                `important_person_birth_city_${personIndex}`,
                `important_person_impact_${personIndex}`,
                `important_person_stress_${personIndex}`,
                `important_person_appreciation_${personIndex}`,
                `important_person_improvement_${personIndex}`
            ];
            
            // Check text fields
            fieldsToCheck.forEach(fieldName => {
                const field = entry.querySelector(`[name="${fieldName}"]`);
                if (field && field.value.trim() !== '') {
                    fieldCount++;
                    if (fieldName === `important_person_impact_${personIndex}` || 
                        fieldName === `important_person_stress_${personIndex}` ||
                        fieldName === `important_person_appreciation_${personIndex}`) {
                        hasData = true; // These fields are considered more important
                    }
                }
            });
            
            // Check radio fields
            const relationField = entry.querySelector(`[name="important_person_relation_${personIndex}"]:checked`);
            if (relationField) {
                fieldCount++;
            }
            
            // Check checkboxes
            const conflictChecks = entry.querySelectorAll(`[name="important_person_conflict_${personIndex}"]:checked`);
            if (conflictChecks.length > 0) {
                fieldCount++;
                hasData = true; // This is considered an important field
            }
            
            // Only process and save if we have meaningful data
            // Requiring at least 3 fields filled out or at least one "important" field
            if (fieldCount >= 3 || hasData) {
                console.log(`Important person ${personIndex} has sufficient data - processing`);
                
                // Save the basic name field
                formData[`important_person_${personIndex}_name`] = nameField.value.trim();
                
                // Process and save the rest of the fields
                // Birth info
                const birthdateField = entry.querySelector(`[name="important_person_birthdate_${personIndex}"]`);
                if (birthdateField && birthdateField.value.trim()) {
                    formData[`important_person_${personIndex}_birthdate`] = birthdateField.value.trim();
                }
                
                const birthTimeField = entry.querySelector(`[name="important_person_birth_time_${personIndex}"]`);
                if (birthTimeField && birthTimeField.value.trim()) {
                    formData[`important_person_${personIndex}_birth_time`] = birthTimeField.value.trim();
                }
                
                const birthCityField = entry.querySelector(`[name="important_person_birth_city_${personIndex}"]`);
                if (birthCityField && birthCityField.value.trim()) {
                    formData[`important_person_${personIndex}_birth_city`] = birthCityField.value.trim();
                }
                
                // Relationship
                if (relationField) {
                    formData[`important_person_${personIndex}_relation`] = relationField.value;
                }
                
                // Textareas
                const impactField = entry.querySelector(`[name="important_person_impact_${personIndex}"]`);
                if (impactField && impactField.value.trim()) {
                    formData[`important_person_${personIndex}_impact`] = impactField.value.trim();
                }
                
                const stressField = entry.querySelector(`[name="important_person_stress_${personIndex}"]`);
                if (stressField && stressField.value.trim()) {
                    formData[`important_person_${personIndex}_stress`] = stressField.value.trim();
                }
                
                const appreciationField = entry.querySelector(`[name="important_person_appreciation_${personIndex}"]`);
                if (appreciationField && appreciationField.value.trim()) {
                    formData[`important_person_${personIndex}_appreciation`] = appreciationField.value.trim();
                }
                
                // Conflict management (checkboxes)
                if (conflictChecks.length > 0) {
                    formData[`important_person_${personIndex}_conflict`] = Array.from(conflictChecks).map(cb => cb.value);
                }
                
                const improvementField = entry.querySelector(`[name="important_person_improvement_${personIndex}"]`);
                if (improvementField && improvementField.value.trim()) {
                    formData[`important_person_${personIndex}_improvement`] = improvementField.value.trim();
                }
            } else {
                console.log(`Important person ${personIndex} has insufficient data - skipping`);
                // We don't add any data for this person
            }
        });
        
        // Make sure we remove data from any deleted important persons
        // If we had more entries before that were deleted
        for (let i = entries.length + 1; i <= 10; i++) {
            // Remove legacy data for deleted important persons
            Object.keys(formData).forEach(key => {
                if (key.startsWith(`important_person_${i}_`)) {
                    delete formData[key];
                }
            });
        }
    }

    /**
     * Handles relationship status changes by showing/hiding relevant sections
     * and clearing data for unused relationship types
     */
    function updateRelationshipSections(status) {
        console.log("Relationship Status Selected:", status);

        // Show or hide sections based on relationship status
        document.getElementById("partner-section").style.display = 
            (["married", "committed", "separated_fix"].includes(status)) 
            ? "block" : "none";

        document.getElementById("future-partner-section").style.display = 
            (["future_partner", "divorced", "separated_differences"].includes(status)) 
            ? "block" : "none";

        // If relationship status changes to something other than married/committed/etc
        if (!["married", "committed", "separated_fix"].includes(status)) {
            // Clear partner data from local storage
            const storedData = JSON.parse(localStorage.getItem("formData")) || {};
            
            Object.keys(storedData).forEach(key => {
                if (key.startsWith("partner_") || key === "partners_belief_system") {
                    delete storedData[key];
                }
            });
            
            localStorage.setItem("formData", JSON.stringify(storedData));
            console.log("Partner data cleared due to relationship status change");
        }
        
        // If relationship status changes to something other than future_partner/divorced/etc
        if (!["future_partner", "divorced", "separated_differences"].includes(status)) {
            // Clear future partner data from local storage
            const storedData = JSON.parse(localStorage.getItem("formData")) || {};
            
            // Find and delete future partner fields
            Object.keys(storedData).forEach(key => {
                if (key.startsWith("future_partner_") || 
                    key.includes("partner_preference") ||
                    key.includes("love_language") ||
                    key.includes("lifestyle")) {
                    
                    delete storedData[key];
                }
            });
            
            localStorage.setItem("formData", JSON.stringify(storedData));
            console.log("Future partner data cleared due to relationship status change");
        }
    }

    /**
     * Process partner data to ensure all fields are properly collected
     */
    function processPartnerData(formData) {
        const partnerSection = document.getElementById("partner-section");
        if (!partnerSection || partnerSection.style.display === "none") return;
        
        // Basic fields
        const nameField = partnerSection.querySelector('[name="partner_name_1"]');
        if (nameField && nameField.value.trim()) {
            formData["partner_name"] = nameField.value.trim();
        }
        
        // Birth info
        const birthDateField = partnerSection.querySelector('[name="partner_birth_date_1"]');
        if (birthDateField && birthDateField.value.trim()) {
            formData["partner_birth_date"] = birthDateField.value.trim();
        }
        
        const birthTimeField = partnerSection.querySelector('[name="partner_birth_time_1"]');
        if (birthTimeField && birthTimeField.value.trim()) {
            formData["partner_birth_time"] = birthTimeField.value.trim();
        }
        
        const birthCityField = partnerSection.querySelector('[name="partner_birth_city_1"]');
        if (birthCityField && birthCityField.value.trim()) {
            formData["partner_birth_city"] = birthCityField.value.trim();
        }
        
        // Stress
        const stressField = partnerSection.querySelector('[name="partner_stress_1"]');
        if (stressField && stressField.value.trim()) {
            formData["partner_stress"] = stressField.value.trim();
        }
        
        // Conflict management (checkboxes)
        const conflictChecks = partnerSection.querySelectorAll('[name="partner_conflict_1"]:checked');
        if (conflictChecks.length > 0) {
            formData["partner_conflict"] = Array.from(conflictChecks).map(cb => cb.value);
        }
        
        // Love and improvement
        const loveField = partnerSection.querySelector('[name="partner_love_1"]');
        if (loveField && loveField.value.trim()) {
            formData["partner_appreciation"] = loveField.value.trim();
        }
        
        const improveField = partnerSection.querySelector('[name="partner_improve_1"]');
        if (improveField && improveField.value.trim()) {
            formData["partner_improvements"] = improveField.value.trim();
        }
        
        // Belief system
        const beliefField = partnerSection.querySelector('[name="belief_system"]:checked');
        if (beliefField) {
            formData["partners_belief_system"] = beliefField.value;
        }
    }

    /**
     * Improved function to remove empty values from the form data
     */
    function removeEmptyValues(obj) {
        const filteredObj = {};
        
        Object.entries(obj).forEach(([key, value]) => {
            // Check if it's an array
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    filteredObj[key] = value;
                }
            } 
            // Check if it's a string
            else if (typeof value === 'string') {
                if (value.trim() !== '') {
                    filteredObj[key] = value;
                }
            }
            // Keep other non-null, non-undefined values
            else if (value !== null && value !== undefined) {
                filteredObj[key] = value;
            }
        });
        
        return filteredObj;
    }

    function populateEmploymentData(data) {
        console.log("Employment Data:", data); // Debugging output

        // Handle the job_title field (text input)
        const jobTitleField = document.querySelector('input[name="job_title"]');
        if (jobTitleField && data.job_title !== undefined) {
            jobTitleField.value = data.job_title;
        } else {
            console.warn("job_title field not found or undefined in data.");
        }

        // List of employment-related checkboxes and radio buttons
        const checkableFields = [
            "job_satisfaction",
            "career_goals",
            "work_stress",
            "work_environment",
            "career_decision",
            "work_life_balance",
            "financial_security"
        ];

        // Loop through each checkable field (radio buttons & checkboxes)
        checkableFields.forEach(field => {
            // Select the appropriate inputs
            const inputs = document.querySelectorAll(`input[name="${field}"]`);
            
            if (inputs.length > 0 && data[field] !== undefined) {
                inputs.forEach(input => {
                    // For checkboxes that can have multiple values
                    if (input.type === "checkbox") {
                        if (Array.isArray(data[field])) {
                            input.checked = data[field].includes(input.value);
                        } else if (typeof data[field] === 'string') {
                            // If the value was stored as comma-separated string
                            const values = data[field].split(',').map(v => v.trim());
                            input.checked = values.includes(input.value);
                        }
                    } 
                    // For radio buttons
                    else if (input.type === "radio") {
                        input.checked = input.value === data[field];
                    }
                });
            }
        });
    }

    function updateEmploymentSections(status) {
        console.log("Employment Status Selected:", status);

        // Show or hide sections based on employment status
        document.getElementById("current-employment-section").style.display = 
            (status === "employed" || status === "business_owner" || status === "entrepreneur" || status === "self_employed") 
            ? "block" : "none";

        document.getElementById("unemployed-section").style.display = 
            (status === "unemployed") ? "block" : "none";

        document.getElementById("retired-section").style.display = 
            (status === "retired") ? "block" : "none";

        // Remove conflicting data when status changes
        clearEmploymentData(status);
    }

    function clearEmploymentData(status) {
        // If user selects "Unemployed" or "Retired", clear job-related fields
        if (status === "unemployed" || status === "retired") {
            console.log("Clearing job-related fields...");
            const jobFields = ["job_title", "job_satisfaction", "career_goals", "work_stress", "work_environment", "career_decision", "work_life_balance", "financial_security"];

            jobFields.forEach(field => {
                const inputElements = document.querySelectorAll(`[name="${field}"]`);
                inputElements.forEach(input => {
                    if (input.type === "checkbox" || input.type === "radio") {
                        input.checked = false;
                    } else {
                        input.value = "";
                    }
                });
            });
        }

        // If user selects "Employed", clear unemployment/retirement-related fields
        if (status === "employed" || status === "business_owner" || status === "entrepreneur" || status === "self_employed") {
            console.log("Clearing unemployment & retirement-related fields...");
            const clearFields = ["job_focus", "retirement_focus", "retirement_transition", "retirement_activity", "social_connections", "sense_of_purpose"];

            clearFields.forEach(field => {
                const inputElements = document.querySelectorAll(`[name="${field}"]`);
                inputElements.forEach(input => {
                    if (input.type === "checkbox" || input.type === "radio") {
                        input.checked = false;
                    } else {
                        input.value = "";
                    }
                });
            });
        }
    }

    let currentIndex = 0;
    function updateText() {
        if (currentIndex < rotatingStrings.length) {
            rotatingTextDiv.textContent = rotatingStrings[currentIndex];
            currentIndex++;

            if (currentIndex < rotatingStrings.length) {
                const randomDelay = (Math.floor(Math.random() * 3) + 1) * 500;
                setTimeout(updateText, randomDelay);
            }
        }
    }

    function validateRadioGroup(groupName) {
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        const errorMessage = document.getElementById(`${groupName}-error`);

        if (!checkedRadio) {
            if (errorMessage) {
                errorMessage.style.display = "block";
                errorMessage.textContent = "Please select an option.";
            } else {
                console.error(`No error message element found for: ${groupName}`);
            }
            return false;
        } else {
            if (errorMessage) {
                errorMessage.style.display = "none";
                errorMessage.textContent = "";
            }
            return true;
        }
    }

    submitButton.addEventListener("click", async function (event) {
        event.preventDefault();
        
        // Validate consent
        const consent = validateFinalConsent();
        if (consent === false) {
            return;
        }
          
        submitButton.disabled = true;
        submitButton.style.pointerEvents = "none";
        submitButton.textContent = "Processing...";
        submitButton.style.backgroundColor = "#ccc";

        // Collect all form data
        let formDataObject = collectFormData();
        
        // Remove empty values
        formDataObject = removeEmptyValues(formDataObject);

        const uuid = getUUIDFromUrl();
        if (uuid) {
            formDataObject.uuid = uuid;
        }

        try {
            updateText();
            setInterval(updateText, 3000);
            const response = await fetch(FIREBASE_FUNCTIONS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formDataObject),
            });

            const result = await response.json();
            alert(result.message || "Form submitted successfully!");
        } catch (error) {
            submitButton.disabled = false;
            submitButton.style.pointerEvents = "";
            console.error("Error submitting form:", error);
            alert("There was an error submitting the form.");
        } finally {
            document.querySelectorAll(".prev").forEach((button) => {
                button.style.display = "none";
            });
            document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
                checkbox.disabled = true;
                checkbox.style.pointerEvents = "none";
            });

            rotatingTextDiv.style.display = "none";
            submitButton.style.pointerEvents = "none";
            submitButton.textContent = "Submitted";
            submitButton.style.color = "#5a3e85";
            submitButton.style.backgroundColor = "#f5d76e";
        }
    });
});