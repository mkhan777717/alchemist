function validateMobileAndEmail(emailId, phoneId) {
    // validation of email and mobile
    const emailInput = document.getElementById(emailId);
    let emailError = null;
    if(emailId === "email"){
        emailError = document.getElementById("email-error");
    }else{
        emailError = document.getElementById("email-error-2");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    emailInput.addEventListener("change", function () {
        const email = emailInput.value.trim();

        if (!email || !emailRegex.test(email)) {
            emailError.textContent = "Please enter a valid email address.";
        } else {
            emailError.textContent = "";
        }
    });

    const phoneInput = document.getElementById(phoneId);
    let phoneError = null;
    if(phoneId === "phone"){
        phoneError = document.getElementById("phone-error");
    }else{
        phoneError = document.getElementById("phone-error-2");
    }
    const phoneRegex = /^\d{10}$/;

    phoneInput.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, ''); // Remove any non-digit characters
    });

    phoneInput.addEventListener("change", function () {
        const phone = phoneInput.value.trim();

        if (!phone || !phoneRegex.test(phone)) {
            phoneError.textContent = "Please enter a valid phone number.";
        } else {
            phoneError.textContent = "";
        }
    });
}

let timerInterval; // make this variable outside the function

function startTimer(timerId, submitBtnId) {
    let timeLeft = 60;
    const timerElement = document.getElementById(timerId);
    const submitButton = document.getElementById(submitBtnId);

    // Clear any existing timer first (important!)
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Disable and hide the submit button
    submitButton.disabled = true;
    submitButton.style.display = "none";

    // Show the initial timer message
    timerElement.textContent = `Resend OTP in ${timeLeft} seconds`;

    timerInterval = setInterval(() => {
        timeLeft--;

        if (timeLeft > 0) {
            timerElement.textContent = `Resend OTP in ${timeLeft} seconds`;
        } else {
            clearInterval(timerInterval);
            timerInterval = null; // reset it
            submitButton.disabled = false;
            submitButton.style.display = "block";
            timerElement.textContent = "Resend OTP now.";
        }
    }, 1000);
}

document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("apply-form");

    // Helper function to get query parameters from the URL
    function getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        queryString.split("&").forEach((pair) => {
            const [key, value] = pair.split("=");
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || "");
            }
        });
        return params;
    }

    // Timer function for resend OTP
    // function startTimer() {
    //     let timeLeft = 60;
    //     const timerElement = document.getElementById("timer");
    //     const submitButton = document.getElementById("submit-button");

    //     // Disable and hide the submit button
    //     submitButton.disabled = true;
    //     submitButton.style.display = "none";

    //     // Show the timer message
    //     timerElement.textContent = `Resend OTP in ${timeLeft} seconds`;

    //     const timerInterval = setInterval(() => {
    //         timeLeft--;
    //         timerElement.textContent = `Resend OTP in ${timeLeft} seconds`;

    //         if (timeLeft <= 0) {
    //             clearInterval(timerInterval);
    //             // Enable and show the submit button after the timer ends
    //             submitButton.disabled = false;
    //             submitButton.style.display = "block";
    //             timerElement.textContent = "Resend OTP now.";
    //         }
    //     }, 1000);
    // }

    // maj
    // let timerInterval; // make this variable outside the function

    // function startTimer() {
    //     let timeLeft = 60;
    //     const timerElement = document.getElementById("timer");
    //     const submitButton = document.getElementById("submit-button");

    //     // Clear any existing timer first (important!)
    //     if (timerInterval) {
    //         clearInterval(timerInterval);
    //     }

    //     // Disable and hide the submit button
    //     submitButton.disabled = true;
    //     submitButton.style.display = "none";

    //     // Show the initial timer message
    //     timerElement.textContent = `Resend OTP in ${timeLeft} seconds`;

    //     timerInterval = setInterval(() => {
    //         timeLeft--;

    //         if (timeLeft > 0) {
    //             timerElement.textContent = `Resend OTP in ${timeLeft} seconds`;
    //         } else {
    //             clearInterval(timerInterval);
    //             timerInterval = null; // reset it
    //             submitButton.disabled = false;
    //             submitButton.style.display = "block";
    //             timerElement.textContent = "Resend OTP now.";
    //         }
    //     }, 1000);
    // }

    // Function to send OTP
    function sendOtp(data) {
        Promise.all([
                fetch("https://api.ipify.org?format=json").then((response) => response.json()),
                Promise.resolve(document.referrer || "Direct"),
            ])
            .then(([ipData, referrer]) => {
                const updatedData = {
                    name: data.name,
                    mobile: data.mobile,
                    email: data.email,
                    utm_source: `IP Address: ${ipData.ip}, Referrer: ${referrer}, URL: ${window.location.href}, Source: New Landing Page`, // Pass as string in utm_source
                };

                $.ajax({
                    url: "https://schedule.alchemistindia.com/student_api/users/send_otp_lp.json",
                    type: "POST",
                    data: updatedData,
                    success: function(response) {
                        if (response.success) {
                            // alert("OTP sent successfully!");
                            document.getElementById("otp_id").value = response.id;
                            document.getElementById("otpSection").style.display = "block";
                            startTimer("timer", "submit-button");
                        } else {
                            alert("Failed to send OTP. Please try again.");
                        }
                    },
                    error: function() {
                        alert("Error sending OTP. Please try again.");
                    },
                });
            })
            .catch(() => {
                alert("Error fetching additional data. Please try again.");
            });
    }

    // Function to verify OTP
    function verifyOtp() {
        const otp = document.getElementById("otpInput").value.trim();
        const id = document.getElementById("otp_id").value.trim();

        if (!otp) {
            alert("Please enter the OTP.");
            return;
        }

        $.ajax({
            url: "https://schedule.alchemistindia.com/student_api/users/verify_otp_lp.json",
            type: "POST",
            data: {
                id,
                OTP: otp
            },
            success: function(response) {
                if (response.success) {
                    alert("OTP verified successfully!");
                    document.getElementById("otpSection").style.display = "none";
                    sendPayload(); // Call function to send payload
                } else {
                    alert("OTP verification failed. Please try again.");
                }
            },
            error: function() {
                alert("Error verifying OTP. Please try again.");
            },
        });
    }

    // Function to send payload to API
    function sendPayload() {
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const userMessage = document.getElementById("message").value.trim();
        const currentURL = window.location.href; // Get the current page URL

        Promise.all([
                fetch("https://api.ipify.org?format=json").then((response) => response.json()),
                Promise.resolve(document.referrer || "Direct"),
            ])
            .then(([ipData, referrer]) => {
                const crmData = {
                    first_name: name,
                    email: email,
                    mobile: phone,
                    message: `Message: ${userMessage}`, // Include current URL here
                    ip: ipData.ip,
                    referrer: referrer,
                    currentURL: currentURL,
                    utm_source: getQueryParams()["utm_source"] || "",
                    utm_campaign: getQueryParams()["utm_campaign"] || "",
                    utm_medium: getQueryParams()["utm_medium"] || "",
                    course_enquired: ["CAT"],
                    source: "New Landing Page",
                    time: new Date()
                        .toLocaleString("en-GB", {
                            timeZone: "Asia/Kolkata"
                        })
                        .replace(",", ""),
                };

                $.ajax({
                    url: "https://sheet-kwec.onrender.com",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(crmData),
                    success: function() {
                        console.log("Payload saved to Google Sheets.");
                    },
                    error: function() {
                        console.error("Error saving payload to Google Sheets.");
                    },
                });


                $.ajax({
                    url: "https://admin-schedule.alchemistindia.com/cp2/schedule/apis/contact",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(crmData),
                    success: function() {
                        window.location.href = "https://alchemistindia.com/enquirycat/thankyou.html";
                    },
                    error: function() {
                        alert("Error submitting the form. Please try again.");
                    },
                });
                $.ajax({
                    url: "https://webdevez.in/save_crm_data/", // PHP endpoint
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(crmData), // Convert JavaScript object to JSON
                    success: function() {
                        console.log("Data saved to server successfully.");
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        // Log detailed error information
                        console.error("Error saving data to server.");
                        console.error("Status: " + textStatus);
                        console.error("Error Thrown: " + errorThrown);
                        console.error("Response Text: " + jqXHR.responseText);

                        // Optionally, show an alert or UI message to the user
                        alert("Failed to save data. Please try again later.");
                    },
                });

            })
            .catch(() => {
                alert("Error fetching additional data. Please try again.");
            });
    }

    validateMobileAndEmail("email", "phone");

    // Handle form submission
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        // const errors = [];
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // const phoneRegex = /^\d{10}$/;

        // if (!name) errors.push("Name is required");
        // if (!email || !emailRegex.test(email)) errors.push("Valid email is required");
        // if (!phone || !phoneRegex.test(phone)) errors.push("Valid 10-digit phone number is required");

        // if (errors.length > 0) {
        //     alert(errors.join("\n"));
        //     return;
        // }

        // Start timer and send OTP if validation passes
        startTimer("timer", "submit-button");
        sendOtp({
            name,
            mobile: phone,
            email
        });
    });

    // Attach event listener for verifying OTP
    document.getElementById("verifyOtpButton").addEventListener("click", verifyOtp);
});

//mobile form//
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("apply-form-2");

    // Helper function to get query parameters from the URL
    function getQueryParams() {
        const params = {};
        const queryString = window.location.search.substring(1);
        queryString.split("&").forEach((pair) => {
            const [key, value] = pair.split("=");
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || "");
            }
        });
        return params;
    }

    // Timer function for resend OTP
    // function startTimer() {
    //     let timeLeft = 60;
    //     const timerElement = document.getElementById("timer-2");
    //     const submitButton = document.getElementById("submit-button-2");

    //     // Disable and hide the submit button
    //     submitButton.disabled = true;
    //     submitButton.style.display = "none";

    //     // Show the timer message
    //     timerElement.textContent = `Resend OTP in ${timeLeft} seconds`;

    //     const timerInterval = setInterval(() => {
    //         timeLeft--;
    //         timerElement.textContent = `Resend OTP in ${timeLeft} seconds`;

    //         if (timeLeft <= 0) {
    //             clearInterval(timerInterval);
    //             // Enable and show the submit button after the timer ends
    //             submitButton.disabled = false;
    //             submitButton.style.display = "block";
    //             timerElement.textContent = "Resend OTP now.";
    //         }
    //     }, 1000);
    // }
    // Function to send OTP
    function sendOtp(data) {
        Promise.all([
                fetch("https://api.ipify.org?format=json").then((response) => response.json()),
                Promise.resolve(document.referrer || "Direct"),
            ])
            .then(([ipData, referrer]) => {
                const updatedData = {
                    name: data.name,
                    mobile: data.mobile,
                    email: data.email,
                    utm_source: `IP Address: ${ipData.ip}, Referrer: ${referrer}, URL: ${window.location.href}, Source: New Landing Page`, // Pass as string in utm_source
                };

                $.ajax({
                    url: "https://schedule.alchemistindia.com/student_api/users/send_otp_lp.json",
                    type: "POST",
                    data: updatedData,
                    success: function(response) {
                        if (response.success) {
                            // alert("OTP sent successfully!");
                            document.getElementById("otp_id-2").value = response.id;
                            document.getElementById("otpSection-2").style.display = "block";
                            startTimer("timer-2", "submit-button-2");
                        } else {
                            alert("Failed to send OTP. Please try again.");
                        }
                    },
                    error: function() {
                        alert("Error sending OTP. Please try again.");
                    },
                });
            })
            .catch(() => {
                alert("Error fetching additional data. Please try again.");
            });
    }

    // Function to verify OTP
    function verifyOtp() {
        const otp = document.getElementById("otpInput-2").value.trim();
        const id = document.getElementById("otp_id-2").value.trim();

        if (!otp) {
            alert("Please enter the OTP.");
            return;
        }

        $.ajax({
            url: "https://schedule.alchemistindia.com/student_api/users/verify_otp_lp.json",
            type: "POST",
            data: {
                id,
                OTP: otp
            },
            success: function(response) {
                if (response.success) {
                    alert("OTP verified successfully!");
                    document.getElementById("otpSection-2").style.display = "none";
                    sendPayload1(); // Call function to send payload
                } else {
                    alert("OTP verification failed. Please try again.");
                }
            },
            error: function() {
                alert("Error verifying OTP. Please try again.");
            },
        });
    }

    // Function to send payload to API
    function sendPayload1() {
        const name = document.getElementById("name-2").value.trim();
        const email = document.getElementById("email-2").value.trim();
        const phone = document.getElementById("phone-2").value.trim();
        const userMessage = document.getElementById("message-2").value.trim();
        const currentURL = window.location.href; // Get the current page URL

        Promise.all([
                fetch("https://api.ipify.org?format=json").then((response) => response.json()),
                Promise.resolve(document.referrer || "Direct"),
            ])
            .then(([ipData, referrer]) => {
                const crmData = {
                    first_name: name,
                    email: email,
                    mobile: phone,
                    message: `Message: ${userMessage}`, // Include current URL here
                    ip: ipData.ip,
                    referrer: referrer,
                    currentURL: currentURL,
                    utm_source: getQueryParams()["utm_source"] || "",
                    utm_campaign: getQueryParams()["utm_campaign"] || "",
                    utm_medium: getQueryParams()["utm_medium"] || "",
                    course_enquired: ["CAT"],
                    source: "New Landing Page",
                    time: new Date()
                        .toLocaleString("en-GB", {
                            timeZone: "Asia/Kolkata"
                        })
                        .replace(",", ""),
                };

                $.ajax({
                    url: "https://admin-schedule.alchemistindia.com/cp2/schedule/apis/contact",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(crmData),
                    success: function() {
                        window.location.href = "https://alchemistindia.com/enquirycat/thankyou.html";
                    },
                    error: function() {
                        alert("Error submitting the form. Please try again.");
                    },
                });
                $.ajax({
                    url: "https://sheet-kwec.onrender.com",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(crmData),
                    success: function() {
                        console.log("Payload saved to Google Sheets.");
                    },
                    error: function() {
                        console.error("Error saving payload to Google Sheets.");
                    },
                });
                $.ajax({
                    url: "https://webdevez.in/save_crm_data/", // PHP endpoint
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(crmData), // Convert JavaScript object to JSON
                    success: function() {
                        console.log("Data saved to server successfully.");
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        // Log detailed error information
                        console.error("Error saving data to server.");
                        console.error("Status: " + textStatus);
                        console.error("Error Thrown: " + errorThrown);
                        console.error("Response Text: " + jqXHR.responseText);

                        // Optionally, show an alert or UI message to the user
                        alert("Failed to save data. Please try again later.");
                    },
                });


            })
            .catch(() => {
                alert("Error fetching additional data. Please try again.");
            });
    }

    validateMobileAndEmail("email-2", "phone-2");

    // Handle form submission
    form.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("name-2").value.trim();
        const email = document.getElementById("email-2").value.trim();
        const phone = document.getElementById("phone-2").value.trim();

        // const errors = [];
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // const phoneRegex = /^\d{10}$/;

        // if (!name) errors.push("Name is required");
        // if (!email || !emailRegex.test(email)) errors.push("Valid email is required");
        // if (!phone || !phoneRegex.test(phone)) errors.push("Valid 10-digit phone number is required");

        // if (errors.length > 0) {
        //     alert(errors.join("\n"));
        //     return;
        // }

        // Start timer and send OTP if validation passes
        startTimer("timer-2", "submit-button-2");
        sendOtp({
            name,
            mobile: phone,
            email
        });
    });

    // Attach event listener for verifying OTP
    document.getElementById("verifyOtpButton-2").addEventListener("click", verifyOtp);
});