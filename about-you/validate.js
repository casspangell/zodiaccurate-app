export function validateRelationshipStatus() {
    const radios = document.querySelectorAll('input[name="relationship_status"]');
    const errorMessage = document.getElementById("relationship-status-error");

    let selected = false;
    radios.forEach(radio => {
        if (radio.checked) {
            selected = true;
        }
    });

    if (!selected) {
        errorMessage.style.display = "block";
    } else {
        errorMessage.style.display = "none";
    }
}

export function validateEmploymentStatus() {
    const radios = document.querySelectorAll('input[name="employment_status"]');
    const errorMessage = document.getElementById("employment-status-error");

    let selected = false;
    radios.forEach(radio => {
        if (radio.checked) {
            selected = true;
        }
    });

    if (!selected) {
        errorMessage.style.display = "block";
    } else {
        errorMessage.style.display = "none";
    }
}

export function validateFinalConsent() {
    const consentAgree = document.getElementById("consent_agree");
    const emailAgree = document.getElementById("email_agree");
    const errorMessage = document.getElementById("consent-error");

    if (!consentAgree.checked || !emailAgree.checked) {
        event.preventDefault(); // Prevents form submission
        errorMessage.style.display = "block"; // Show error message
    } else {
        errorMessage.style.display = "none"; // Hide error message
        alert("Form submitted successfully!"); // Replace with actual form submission logic
    }
}
