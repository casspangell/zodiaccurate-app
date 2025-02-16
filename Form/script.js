document.addEventListener("DOMContentLoaded", function () {
    let currentSection = 0;
    const navigationHistory = [];
    const sections = document.querySelectorAll(".section");
    const nextButtons = document.querySelectorAll(".next");
    const prevButtons = document.querySelectorAll(".prev");
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

    let partnerCount = 1;
    let childCount = 0;
    let importantPersonCount = 0;
    updateProgressBar(0);

    const stepOrder = {
        0: "intro",
        1: "wellness",
        2: "relationship_status",
        3: ["partner", "future_partner"],
        4: "employment_status",
        5: ["employed", "unemployed", "retired"],
        6: "children",
        7: "important_people",
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
    document.getElementById("saveContinueBtn").addEventListener("click", function () {
        const currentSection = document.querySelector(".section.active");
        const requiredFields = currentSection.querySelectorAll("input[required], select[required], textarea[required]");
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.classList.add("error");
                validateTextField(field);
            } else {
                field.classList.remove("error");
            }
        });

        if (isValid) {
            saveFormData();
        } else {
            alert("Please fill out all required fields before continuing.");
        }
    });

    function updateProgressBar(index) {
        const steps = document.querySelectorAll(".step");
        const progressBar = document.querySelector(".progress-bar");
        const totalSteps = steps.length - 1;

        if (index < 0 || index > totalSteps) return;

        let progressHeight = ((index / totalSteps) * 100).toFixed(2);
        progressBar.style.height = `${progressHeight}%`;

        steps.forEach((step, i) => {
            step.classList.remove("active", "completed");
            if (i < index) {
                step.classList.add("completed");
            } else if (i === index) {
                step.classList.add("active");
            }
        });

        console.log(`Progress Updated: Step ${index} / ${totalSteps}`);
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

            console.log(`Moving from Section: ${currentStep}`);

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

                    if (["married", "committed", "separated_fix", "separated_differences", "divorced"].includes(status)) {
                        goToSection(3);
                    } else if (status === "future_partner") {
                        goToSection(4);
                    } else {
                        goToSection(5);
                    }
                    break;
                case "partner":
                case "future_partner":
                    goToSection(5);
                    break;
                case "employment_status":
                    const selectedEmployment = document.querySelector('input[name="employment_status"]:checked');
                    if (!selectedEmployment) return;
                    const employmentStatus = selectedEmployment.value;

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
                    goToSection(9);
                    break;
                case "children":
                    goToSection(10);
                    break;
                case "important_people":
                    goToSection(11);
                    break;
                default:
                    console.error(`Unhandled section: ${currentStep}`);
                    break;
            }

            console.log(`Now on Section: ${stepOrder[currentSection]}`);
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

    if (!addPartnerButton.dataset.listener) {  // Prevent duplicate listeners
        addPartnerButton.addEventListener("click", function () {
            console.log("Adding a partner..."); 
            addPartner();
        });
        addPartnerButton.dataset.listener = "true";  // Mark as attached
    }


    function addPartner() {
        partnerCount++;
        console.log(`Adding Partner ${partnerCount}`);
        const newPartner = document.createElement("div");
        newPartner.classList.add("partner-entry");
        newPartner.setAttribute("id", `partner-${partnerCount}`);
        newPartner.innerHTML = `
                <h3>Partner ${partnerCount} Information</h3>
                <label>Partner's Name: <input type="text" name="partner_name_${partnerCount}"></label><br>
                <label>Partner's Birth Date: <input type="text" name="partner_birth_date_${partnerCount}" placeholder="Example: May 25, 1984"></label><br>
                <label>Partner's Birth Time: <input type="text" name="partner_birth_time_${partnerCount}" placeholder="Example: 1:30 PM"></label><br>
                <label>Partner's Birth City: <input type="text" name="partner_birth_city_${partnerCount}"></label><br>
                <label>Partner's Stress: <input type="text" name="partner_stress_${partnerCount}"></label><br>
                <label>How do you handle conflicts in your relationship?</label><br>
                <div class="main-checkbox-group multi-column">
                    <input type="checkbox" name="partner_conflict_${partnerCount}" value="Address Immediately"> Address Immediately
                    <input type="checkbox" name="partner_conflict_${partnerCount}" value="Cool Down First"> Cool Down First
                    <input type="checkbox" name="partner_conflict_${partnerCount}" value="Avoid Conflict"> Avoid Conflict
                    <input type="checkbox" name="partner_conflict_${partnerCount}" value="Seek a Third-Party Opinion"> Seek a Third-Party Opinion
                </div>
                <br>
                <label>List 3-5 things you love about your partner: <input type="text" name="partner_love_${partnerCount}"></label><br>
                <label>List 3-5 things you want to improve about yourself in your relationship: <input type="text" name="partner_improve_${partnerCount}"></label><br>
                <label>Partner’s Belief System:</label><br>
                <select name="partner_belief_${partnerCount}">
                    <option value="Christian">Christian</option>
                    <option value="Mormon">Mormon</option>
                    <option value="Buddhist">Buddhist</option>
                    <option value="Islam">Islam</option>
                    <option value="Jewish">Jewish</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Atheist">Atheist</option>
                    <option value="Agnostic">Agnostic</option>
                    <option value="Pagan">Pagan</option>
                    <option value="Other">Other</option>
                </select>
                                <br>
                <button type="button" class="remove-partner-btn" data-partner-id="${partnerCount}">Remove This Partner</button>
        `;
        partnerContainer.appendChild(newPartner);
        console.log(`Partner ${partnerCount} added successfully.`);
        // Attach remove event to the button immediately after adding the partner
        newPartner.querySelector(".remove-partner-btn").addEventListener("click", function () {
            removePartner(newPartner);
    });
    }

    function removePartner(partnerElement) {
        partnerCount--;
        console.log(`Removing ${partnerElement.id}`);
        partnerElement.remove();
        console.log(`Partner removed successfully.`);
    }

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
            
            <div class="main-radio-group multi-column">
            <label>What is your child’s gender?</label><br>
                <input type="radio" name="child_gender_${childCount}" value="Male"> Male
                <input type="radio" name="child_gender_${childCount}" value="Female"> Female
                <input type="radio" name="child_gender_${childCount}" value="Prefer Not to Say"> Prefer Not to Say
                <input type="radio" name="child_gender_${childCount}" value="Other"> Other
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
                <input type="radio" name="important_person_relation_${importantPersonCount}" value="Family Member"> Family Member
                <input type="radio" name="important_person_relation_${importantPersonCount}" value="Roommate"> Roommate
                <input type="radio" name="important_person_relation_${importantPersonCount}" value="Friend"> Friend
                <input type="radio" name="important_person_relation_${importantPersonCount}" value="Business Partner"> Business Partner
                <input type="radio" name="important_person_relation_${importantPersonCount}" value="Ex-Partner"> Ex-Partner
                <input type="radio" name="important_person_relation_${importantPersonCount}" value="Other"> Other
            </div>
            <br>
            <label>Describe how this person affects your daily life: <input type="text" name="important_person_impact_${importantPersonCount}"></label><br>
            <label>List 3-5 sources of stress related to this person (if any): <input type="text" name="important_person_stress_${importantPersonCount}"></label><br>
            <label>List 3-5 things you appreciate about this person: <input type="text" name="important_person_appreciation_${importantPersonCount}"></label><br>
            <label>How do you typically handle disagreements with this person?</label><br>
            <div class="main-checkbox-group multi-column">
                <input type="checkbox" name="important_person_conflict_${importantPersonCount}" value="Address Immediately"> Address Immediately
                <input type="checkbox" name="important_person_conflict_${importantPersonCount}" value="Take Time to Cool Down"> Take Time to Cool Down
                <input type="checkbox" name="important_person_conflict_${importantPersonCount}" value="Avoid Confrontation"> Avoid Confrontation
                <input type="checkbox" name="important_person_conflict_${importantPersonCount}" value="Seek a Third-Party Opinion"> Seek a Third-Party Opinion
            </div>
            <br>

});

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

});

