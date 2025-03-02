const FIREBASE_FUNCTIONS_URL = "https://handleformsubmission-feti3ggk7q-uc.a.run.app";
const FIREBASE_GET_DATA_URL = "https://handleformdataretrieval-feti3ggk7q-uc.a.run.app";

document.addEventListener("DOMContentLoaded", function () {

    let currentSection = 0;
    const navigationHistory = [];
    const form = document.getElementById("multiStepForm");

    const sections = document.querySelectorAll(".section");
    const nextButtons = document.querySelectorAll(".next");
    const prevButtons = document.querySelectorAll(".prev");
    const submitButton = document.querySelector(".submit");

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
        "Finalizing astrological analysis (this may take a moment)..."
    ];



    const progressBar = document.createElement("div");
    document.querySelector(".progress-container").appendChild(progressBar);
    progressBar.classList.add("progress-bar-active");
    const progressContainer = document.querySelector(".progress-container");
    const emailInput = document.getElementById("email");



    let dbData = {};

//------------------

const uuid = getUUIDFromUrl();
if (uuid) {
  fetchData();
}

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
    console.error("Error fetching data:", error);
  } finally {
    // Hide overlay when data is loaded or in case of an error
    loadingOverlay.style.display = "none";
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

//     function printSections() {
//     const sections = document.querySelectorAll(".section");
    
//     sections.forEach((section, index) => {
//         const sectionTitle = section.querySelector("h2")?.textContent.trim() || "Unnamed Section";
//         console.log(`Index: ${index}, Section: ${sectionTitle}`);
//     });
// }

// Call the function to print the section list
// printSections();

// function printSectionsWithVisibility() {
//     const sections = document.querySelectorAll(".section");

//     sections.forEach((section, index) => {
//         const wasHidden = section.style.display === "none";
//         section.style.display = "block"; // Temporarily show it

//         const sectionTitle = section.querySelector("h2")?.textContent.trim() || "Unnamed Section";

//         if (wasHidden) section.style.display = "none"; // Restore original state
//     });
// }

// printSectionsWithVisibility();

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

                    if (["married", "committed", "separated_fix"].includes(status)) {
                        goToSection(3);
                    } else if (["future_partner", "divorced", "separated_differences"].includes(status)) {
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

    // if (!addPartnerButton.dataset.listener) {  // Prevent duplicate listeners
    //     addPartnerButton.addEventListener("click", function () {
    //         console.log("Adding a partner..."); 
    //         addPartner();
    //     });
    //     addPartnerButton.dataset.listener = "true";  // Mark as attached
    // }


    // function addPartner() {
    //     partnerCount++;
    //     console.log(`Adding Partner ${partnerCount}`);
    //     const newPartner = document.createElement("div");
    //     newPartner.classList.add("partner-entry");
    //     newPartner.setAttribute("id", `partner-${partnerCount}`);
    //     newPartner.innerHTML = `
    //             <h3>Partner ${partnerCount} Information</h3>
    //             <label>Partner's Name: <input type="text" name="partner_name_${partnerCount}"></label><br>
    //             <label>Partner's Birth Date: <input type="text" name="partner_birth_date_${partnerCount}" placeholder="Example: May 25, 1984"></label><br>
    //             <label>Partner's Birth Time: <input type="text" name="partner_birth_time_${partnerCount}" placeholder="Example: 1:30 PM"></label><br>
    //             <label>Partner's Birth City: <input type="text" name="partner_birth_city_${partnerCount}"></label><br>
    //             <label>Partner's Stress: <input type="text" name="partner_stress_${partnerCount}"></label><br>
    //             <label>How do you handle conflicts in your relationship?</label><br>
    //             <div class="main-checkbox-group multi-column">
    //                 <input type="checkbox" name="partner_conflict_${partnerCount}" value="Address Immediately"> Address Immediately
    //                 <input type="checkbox" name="partner_conflict_${partnerCount}" value="Cool Down First"> Cool Down First
    //                 <input type="checkbox" name="partner_conflict_${partnerCount}" value="Avoid Conflict"> Avoid Conflict
    //                 <input type="checkbox" name="partner_conflict_${partnerCount}" value="Seek a Third-Party Opinion"> Seek a Third-Party Opinion
    //             </div>
    //             <br>
    //             <label>List 3-5 things you love about your partner: <input type="text" name="partner_love_${partnerCount}"></label><br>
    //             <label>List 3-5 things you want to improve about yourself in your relationship: <input type="text" name="partner_improve_${partnerCount}"></label><br>
    //             <label>Partner’s Belief System:</label><br>
    //             <select name="partner_belief_${partnerCount}">
    //                 <option value="Christian">Christian</option>
    //                 <option value="Mormon">Mormon</option>
    //                 <option value="Buddhist">Buddhist</option>
    //                 <option value="Islam">Islam</option>
    //                 <option value="Jewish">Jewish</option>
    //                 <option value="Hindu">Hindu</option>
    //                 <option value="Spiritual">Spiritual</option>
    //                 <option value="Atheist">Atheist</option>
    //                 <option value="Agnostic">Agnostic</option>
    //                 <option value="Pagan">Pagan</option>
    //                 <option value="Other">Other</option>
    //             </select>
    //                             <br>
    //             <button type="button" class="remove-partner-btn" data-partner-id="${partnerCount}">Remove This Partner</button>
    //     `;
    //     partnerContainer.appendChild(newPartner);
    //     console.log(`Partner ${partnerCount} added successfully.`);
    //     // Attach remove event to the button immediately after adding the partner
    //     newPartner.querySelector(".remove-partner-btn").addEventListener("click", function () {
    //         removePartner(newPartner);
    // });
    // }

    // function removePartner(partnerElement) {
    //     partnerCount--;
    //     console.log(`Removing ${partnerElement.id}`);
    //     partnerElement.remove();
    //     console.log(`Partner removed successfully.`);
    // }

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
                
                <label>What is your child’s gender?</label><br>
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
    childElement.remove();
    childCount--;
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
        // The new card’s index corresponds to the current value of the global childCount
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
        personElement.remove();
        importantPersonCount--;
    }

    function collectFormData() {
        const formData = {};
        const inputs = document.querySelectorAll("input, select, textarea");

        inputs.forEach((input) => {
            if (input.type === "checkbox") {
                if (!formData[input.name]) {
                    formData[input.name] = [];
                }
                if (input.checked) {
                    formData[input.name].push(input.value);
                }
            } else if (input.type === "radio") {
                // Ensure each radio group is captured, even if nothing is selected
                if (!(input.name in formData)) {
                    formData[input.name] = ""; // Default empty string for unselected radios
                }
                if (input.checked) {
                    formData[input.name] = input.value;
                }
            } else {
                formData[input.name] = input.value.trim();
            }
        });

        return formData;
    }

    function removeEmptyValues(obj) {
        return Object.fromEntries(
            Object.entries(obj).filter(([_, value]) => {
                return value !== null && value !== "" && 
                       !(Array.isArray(value) && value.length === 0);
            })
        );
    }

    function collectFormData() {
        const formData = new FormData(form);
        const dataObject = {};

        formData.forEach((value, key) => {
            dataObject[key] = value;
        });

        return dataObject;
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
        checkableFields.forEach((field) => {
            const fieldData = data[field]; // Get the value from data
            const elements = document.querySelectorAll(`input[name="${field}"]`);

            if (!elements.length) {
                console.warn(`Field not found: ${field}`);
                return;
            }

            elements.forEach((element) => {
                if (element.type === "radio") {
                    // Match single value for radio buttons
                    if (fieldData === element.value) {
                        element.checked = true;
                    }
                } else if (element.type === "checkbox") {
                    // Handle checkboxes with array or string values
                    if (Array.isArray(fieldData) && fieldData.includes(element.value)) {
                        element.checked = true;
                    } else if (typeof fieldData === "string" && fieldData.split(",").includes(element.value)) {
                        element.checked = true;
                    }
                }
            });
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



    submitButton.addEventListener("click", async function (event) {
        event.preventDefault();

          submitButton.disabled = true;
          submitButton.style.pointerEvents = "none"
          submitButton.textContent = "Processing...";
          submitButton.style.backgroundColor = "#ccc";

        let formDataObject = collectFormData();
        formDataObject = removeEmptyValues(formDataObject);

        const uuid = getUUIDFromUrl();
        if (uuid) {
            formDataObject.uuid = uuid;
        }

        // console.log("Filtered Form Data before sending:", formDataObject);

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
            submitButton.style.pointerEvents = ""
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

});

