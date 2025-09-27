const LibraryLogin = function () {

    /**
     * 
     * Defining Selectors
     * 
     */

    this.Selectors = {
        lmLoginPasswordField: "#lm_login_password",
        lmLoginPasswordFieldToggleButton: "#lm_login_toggle_password",
        lmLoginPasswordFieldToggleIcon:   "#lm_login_toggle_password i",
        lmLibraryLoginForm: "#lm_login_form",
        libraryLoginFormSubmitBtn: "#lm_login_form_submit_button",
        loginSuccessToast: "#lm_login_success_toast"   
    };

    /**
     * 
     * Set temporary login Credentials for login
     * 
     */

    this.setTemporaryLoginCredentials = function () {
        if (localStorage.getItem("lmTemporaryLoginCredentials")) {
            const temporaryLoginCredentials = [
                { username: "Puvaneshwaran",   password: "Puvi@123" },
                { username: "Kamalesh",     password: "Kamal@123" },
                { username: "Dharshan", password: "Dharsh@123" },
                { username: "Vijiyakumar",   password: "Vijay@123" }
            ];
            localStorage.setItem("lmTemporaryLoginCredentials", JSON.stringify(temporaryLoginCredentials));
        }
    };

    /**
     * 
     * Password field manaul toggle eye function
     * 
     */

    this.passwordToggler = function () {
        $(this.Selectors.lmLoginPasswordField).attr("type", "password").val("");
        $(this.Selectors.lmLoginPasswordFieldToggleButton).on("click", () => {
            if ($(this.Selectors.lmLoginPasswordField).attr("type") === "password") {
                $(this.Selectors.lmLoginPasswordField).attr("type", "text");
                $(this.Selectors.lmLoginPasswordFieldToggleIcon).removeClass("bi-eye").addClass("bi-eye-slash");
            } else {
                $(this.Selectors.lmLoginPasswordField).attr("type", "password");
                $(this.Selectors.lmLoginPasswordFieldToggleIcon).removeClass("bi-eye-slash").addClass("bi-eye");
            }
        });
    };

    /**
     * 
     * Validate login form function
     * 
     */

    this.validateLibraryForm = function () {
        $(this.Selectors.lmLibraryLoginForm).validate({
            ignore: [],
            onkeyup: false,
            rules: {
                lm_login_username: {
                    required: true,
                    pattern: "^[a-zA-Z]+$",
                    minlength: 5,
                },
                lm_login_password: {
                    required: true,
                    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,}$"
                }
            },
            messages: {
                lm_login_username: {
                    required: "Username is required",
                    pattern: "Alphabets only allowed",
                    minlength: "At least 5 characters required",
                },
                lm_login_password: {
                    required: "Password is required",
                    pattern: "Invalid Password",
                }
            },
            errorPlacement: function (error, element) {
                if (element.closest(".input-group").length) {
                    error.insertAfter(element.closest(".input-group"));
                } else {
                    error.insertAfter(element);
                }
            },
        });
    };

    /**
     * 
     * Check the logging in user is existing
     * 
     */

    this.submitLoginForm = function () {
        $(this.Selectors.libraryLoginFormSubmitBtn).on("click", (e) => {
            e.preventDefault();
            if ($(this.Selectors.lmLibraryLoginForm).valid()){
                const username = $(this.Selectors.lmLibraryLoginForm).find('[name="lm_login_username"]').val().trim();
                const password = $(this.Selectors.lmLibraryLoginForm).find('[name="lm_login_password"]').val();
                const users    = JSON.parse(localStorage.getItem("lmTemporaryLoginCredentials")) || [];
    
                const match = users.find(u =>
                    u.username.toLowerCase() === username.toLowerCase() &&
                    u.password === password
                );
    
                const toastEl = document.getElementById("lm_login_success_toast");
                const toast   = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 1500 });
    
                if (match) {
                    // ✅ Store the logged-in user
                    localStorage.setItem("lmValidUsername", match.username);

                    toastEl.classList.remove("bg-danger");
                    toastEl.style.backgroundColor = "#1EA73C";
                    toastEl.querySelector(".toast-body").textContent =`✅ Successfully Logged in as: ${match.username}`;
                    toast.show();
    
                    // Redirect after toast hides
                    toastEl.addEventListener("hidden.bs.toast", () => {
                        window.location.href = "library-main-page.html";
                    }, { once: true });
    
                } else {
                    // ❌ Invalid credentials
                    toastEl.classList.add("bg-danger");
                    toastEl.style.backgroundColor = "";
                    toastEl.querySelector(".toast-body").textContent ="Invalid username or password!";
                    toast.show();
                }
            } 

        });
    };
};


const libraryLogin = new LibraryLogin();
libraryLogin.setTemporaryLoginCredentials();
libraryLogin.passwordToggler();
libraryLogin.validateLibraryForm();
libraryLogin.submitLoginForm();

