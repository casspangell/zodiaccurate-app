const FIREBASE_FUNCTIONS_URL = "https://handleformsubmission-feti3ggk7q-uc.a.run.app";
const FIREBASE_GET_DATA_URL = "https://handleformdataretrieval-feti3ggk7q-uc.a.run.app";

async function fetchData() {
  const uuid = getUUIDFromUrl();
  try {
    const response = await fetch(`${FIREBASE_GET_DATA_URL}?uuid=${encodeURIComponent(uuid)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    populateFormFields(result);
    updateLocalStorageWithData(result);
    console.log("Server Response:", result);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function populateFormFields(data) {
  // Loop through each key-value pair in the data object.
  Object.entries(data).forEach(([fieldId, value]) => {
    // Find the element with the given id.
    const field = document.getElementById(fieldId);
    if (field) {
      // If it's an input, textarea, or select, set its value.
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLTextAreaElement ||
        field instanceof HTMLSelectElement
      ) {
        field.value = value;
      } else {
        // Otherwise, update its text content.
        field.textContent = value;
      }
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

document.addEventListener("DOMContentLoaded", fetchData);
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

    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar-active");
    document.querySelector(".progress-container").appendChild(progressBar);

    const emailInput = document.getElementById("email");

    const progressContainer = document.querySelector(".progress-container");


//------------------

    const uuid = getUUIDFromUrl();
    if (!uuid) {
      console.warn("No UUID found in the URL.");
      return;
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

    // Validate all required fields on "Save & Continue" click
    // document.getElementById("saveContinueBtn").addEventListener("click", function () {
    //     const currentSection = document.querySelector(".section.active");
    //     const requiredFields = currentSection.querySelectorAll("input[required], select[required], textarea[required]");
    //     let isValid = true;

    //     requiredFields.forEach(field => {
    //         if (!field.value.trim()) {
    //             isValid = false;
    //             field.classList.add("error");
    //             validateTextField(field);
    //         } else {
    //             field.classList.remove("error");
    //         }
    //     });

    //     if (isValid) {
    //         saveFormData();
    //     } else {
    //         alert("Please fill out all required fields before continuing.");
    //     }
    // });

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

    function printSections() {
    const sections = document.querySelectorAll(".section");
    
    sections.forEach((section, index) => {
        const sectionTitle = section.querySelector("h2")?.textContent.trim() || "Unnamed Section";
        console.log(`Index: ${index}, Section: ${sectionTitle}`);
    });
}

// Call the function to print the section list
printSections();

function printSectionsWithVisibility() {
    const sections = document.querySelectorAll(".section");

    sections.forEach((section, index) => {
        const wasHidden = section.style.display === "none";
        section.style.display = "block"; // Temporarily show it

        const sectionTitle = section.querySelector("h2")?.textContent.trim() || "Unnamed Section";
        console.log(`Index: ${index}, Section: ${sectionTitle}, ID: ${section.id}`);

        if (wasHidden) section.style.display = "none"; // Restore original state
    });
}

printSectionsWithVisibility();


    nextButtons.forEach((button) => {
        button.addEventListener("click", function () {
            console.log(`Button clicked`);
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
                        console.log("go to partner");
                        goToSection(3);
                    } else if (["future_partner", "divorced", "separated_differences"].includes(status)) {
                        console.log("go to future partner");
                        goToSection(4);
                    } else {
                        console.log("goto important_people");
                        goToSection(10);
                    }
                    break;
                case "partner":
                case "future_partner":
                    console.log("goto important_people");
                    goToSection(10);
                    break
                case "important_people":
                    console.log("goto children");
                    goToSection(9);
                    break;
                case "children":
                    console.log("goto employment_status");
                    goToSection(5);
                    break;
                case "employment_status":
                    const selectedEmployment = document.querySelector('input[name="employment_status"]:checked');
                    if (!selectedEmployment) return;
                    const employmentStatus = selectedEmployment.value;

                    if (["employed", "business_owner", "entrepreneur", "self_employed"].includes(employmentStatus)) {
                        console.log("goto employed");
                        goToSection(6);
                    } else if (employmentStatus === "unemployed") {
                        console.log("goto unemployed");
                        goToSection(7);
                    } else if (employmentStatus === "retired") {
                        console.log("goto retired");
                        goToSection(8);
                    }
                    break;
                case "employed":
                case "unemployed":
                case "retired":
                    console.log("goto final");
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
            if (navigationHistory.length > 1) {
                navigationHistory.pop();
                currentSection = navigationHistory[navigationHistory.length - 1];
                showSection(currentSection);
            } else {
                navigationHistory.pop();
                currentSection = 0;
                showSection(0);
            }

            console.log(`Back to Section ${currentSection}`);
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
                console.log(`Adding Child ${childCount + 1}`);
                addChild();
            });
            addChildButton.dataset.listener = "true";  // Mark event as added
        }
    }

    function addChild() {
    childCount++;
    const newChild = document.createElement("div");
    newChild.classList.add("child-entry");
    newChild.setAttribute("id", `child-${childCount}`);
    newChild.innerHTML = `
        <div class="child-card">
            <h3>Child ${childCount} Information</h3>
            <label>Child's First Name: <input type="text" name="child_name_${childCount}"></label><br>
            <label>Child's Birth Place: <input type="text" name="child_birth_place_${childCount}"></label><br>
            <label>Child's Birth Date: <input type="text" name="child_birth_date_${childCount}" placeholder="Example: May 25, 2019"></label><br>
            <label>Child's Birth Time: <input type="text" name="child_birth_time_${childCount}" placeholder="Example: 1:30 PM"></label><br>
            
            <label>What is your child’s gender?</label><br>
            <div class="main-radio-group multi-column">
               <label><input type="radio" name="child_gender_${childCount}" value="Male"> Male</label>
                <label><input type="radio" name="child_gender_${childCount}" value="Female"> Female</label>
                <label><input type="radio" name="child_gender_${childCount}" value="Prefer Not to Say"> Prefer Not to Say</label>
                <label><input type="radio" name="child_gender_${childCount}" value="Other"> Other</label>
            </div>
            <br>
            <label>Child's Primary Activities: <input type="text" name="child_activities_${childCount}"></label><br>
            <label>Child's Stress: <input type="text" name="child_stress_${childCount}"></label><br>
            <label>Child's Joy and Satisfaction: <input type="text" name="child_joy_${childCount}"></label><br>
            <label>Child's Long-Term Concerns: <input type="text" name="child_concerns_${childCount}"></label><br>
            <button type="button" class="remove-child-btn" data-child-id="${childCount}">Remove Child</button>
        </div>
    `;

    childContainer.appendChild(newChild);
    console.log(`Child ${childCount} added successfully.`);
    // Attach remove event to the button immediately after adding the child
    newChild.querySelector(".remove-child-btn").addEventListener("click", function () {
        removeChild(newChild);
    });
}
function removeChild(childElement) {
    console.log(`Removing ${childElement.id}`);
    childElement.remove();
    childCount--;
    console.log(`Child removed successfully.`);
}

// Prevent duplicate event listeners
if (!document.getElementById("add-important-person").dataset.listener) {
    document.getElementById("add-important-person").addEventListener("click", function () {
        addImportantPerson();
    });
    document.getElementById("add-important-person").dataset.listener = "true";
}

function addImportantPerson() {
    importantPersonCount++;
    console.log(`Adding Important Person ${importantPersonCount}`);
    const newPerson = document.createElement("div");
    newPerson.classList.add("important-person-entry");
    newPerson.setAttribute("id", `important-person-${importantPersonCount}`);
    newPerson.innerHTML = `
        <div class="important-person-card">
            <h3>Person ${importantPersonCount} Information</h3>
            <label>First Name: <input type="text" name="important_person_name_${importantPersonCount}"></label><br>
            <label>Birthdate: <input type="text" name="important_person_birthdate_${importantPersonCount}" placeholder="Example: May 25, 1984 or 'Unknown'"></label><br>
            <label>Birth Time: <input type="text" name="important_person_birth_time_${importantPersonCount}" placeholder="Example: 1:30 PM or 'Unknown'"></label><br>
            <label>Birth City: <input type="text" name="important_person_birth_city_${importantPersonCount}" placeholder="City, State, Country or 'Unknown'"></label><br>
            <label>What is your relationship with this person?</label><br>
            <div class="main-radio-group multi-column">
                <label><input type="radio" name="important_person_relation_${importantPersonCount}" value="Family Member"> Family Member</label>
                <label><input type="radio" name="important_person_relation_${importantPersonCount}" value="Roommate"> Roommate</label>
                <label><input type="radio" name="important_person_relation_${importantPersonCount}" value="Friend"> Friend</label>
                <label><input type="radio" name="important_person_relation_${importantPersonCount}" value="Business Partner"> Business Partner</label>
                <label><input type="radio" name="important_person_relation_${importantPersonCount}" value="Ex-Partner"> Ex-Partner</label>
                <label><input type="radio" name="important_person_relation_${importantPersonCount}" value="Other"> Other</label>
            </div>
            <br>
            <label>Describe how this person affects your daily life: <input type="text" name="important_person_impact_${importantPersonCount}"></label><br>
            <label>List 3-5 sources of stress related to this person (if any): <input type="text" name="important_person_stress_${importantPersonCount}"></label><br>
            <label>List 3-5 things you appreciate about this person: <input type="text" name="important_person_appreciation_${importantPersonCount}"></label><br>
            <label>How do you typically handle disagreements with this person?</label><br>
            <div class="main-checkbox-group multi-column">
                <label><input type="checkbox" name="important_person_conflict_${importantPersonCount}" value="Address Immediately"> Address Immediately</label>
                <label><input type="checkbox" name="important_person_conflict_${importantPersonCount}" value="Take Time to Cool Down"> Take Time to Cool Down</label>
                <label><input type="checkbox" name="important_person_conflict_${importantPersonCount}" value="Avoid Confrontation"> Avoid Confrontation</label>
                <label><input type="checkbox" name="important_person_conflict_${importantPersonCount}" value="Seek a Third-Party Opinion"> Seek a Third-Party Opinion</label>
            </div>
            <br>

            <label>List 3-5 ways you want to improve your relationship with this person (Optional): <input type="text" name="important_person_improvement_${importantPersonCount}"></label><br>
            <button type="button" class="remove-important-person-btn" data-person-id="${importantPersonCount}">Remove This Person</button>
        </div>
    `;
    document.getElementById("important-person-container").appendChild(newPerson);
    console.log(`Important Person ${importantPersonCount} added successfully.`);
    newPerson.querySelector(".remove-important-person-btn").addEventListener("click", function () {
        removeImportantPerson(newPerson);
    });
}

// Function to remove an important person section
function removeImportantPerson(personElement) {
    console.log(`Removing ${personElement.id}`);
    personElement.remove();
    importantPersonCount--;
    console.log(`Important Person removed. Remaining count: ${importantPersonCount}`);
}

function collectFormData() {
        const formData = {};
        const inputs = form.querySelectorAll("input, select, textarea");

        inputs.forEach((input) => {
            if (input.type === "checkbox") {
                if (!formData[input.name]) {
                    formData[input.name] = [];
                }
                if (input.checked) {
                    formData[input.name].push(input.value);
                }
            } else if (input.type === "radio") {
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


    submitButton.addEventListener("click", async function (event) {
        event.preventDefault();

        let formDataObject = collectFormData();
        formDataObject = removeEmptyValues(formDataObject);

        console.log("Filtered Form Data before sending:", formDataObject);

        try {
            const response = await fetch(FIREBASE_GET_DATA_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formDataObject),
            });

            const result = await response.json();
            console.log("Server Response:", result);
            alert(result.message || "Form submitted successfully!");
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("There was an error submitting the form.");
        }
    });


});

