document.addEventListener("DOMContentLoaded", function () {
    let currentSection = 0;
    const navigationHistory = [];
    const sections = document.querySelectorAll(".section");
    const nextButtons = document.querySelectorAll(".next");
    const prevButtons = document.querySelectorAll(".prev");
    const steps = document.querySelectorAll(".step");

    const progressBar = document.createElement("div");
    progressBar.classList.add("progress-bar-active");
    document.querySelector(".progress-container").appendChild(progressBar);

    const emailInput = document.getElementById("email");

    const progressContainer = document.querySelector(".progress-container");

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
});
