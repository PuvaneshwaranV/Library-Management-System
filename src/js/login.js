
const LibraryLogin = function () {
    // ---------- Central selectors ----------
    this.selectors = {
        passwordField: "#login_password",
        toggleButton: "#login_toggle_password",
        toggleIcon:   "#login_toggle_password i",
        libraryLoginForm: "#library_login_form",
        libraryLoginFormSubmitBtn: "#library_login_form_submit_button",
        loginSuccessToast: "#loginSuccessToast"   
    };

    // ---------- 1. Seed 4 users into localStorage (only once) ----------
    this.seedUsers = function () {
        if (!localStorage.getItem("libraryUsers")) {
            const defaultUsers = [
                { username: "Puvaneshwaran V",   password: "Puvi@123" },
                { username: "Kamalesh S",     password: "Kamal@123" },
                { username: "Dharshan G", password: "Dharsh@123" },
                { username: "Vijiyakumar M",   password: "Vijay@123" }
            ];
            localStorage.setItem("libraryUsers", JSON.stringify(defaultUsers));
        }
    };

    // ---------- Password toggle ----------
    this.passwordToggler = function () {
        const s = this.selectors;
        $(s.toggleButton).on("click", () => {
            if ($(s.passwordField).attr("type") === "password") {
                $(s.passwordField).attr("type", "text");
                $(s.toggleIcon).removeClass("bi-eye").addClass("bi-eye-slash");
            } else {
                $(s.passwordField).attr("type", "password");
                $(s.toggleIcon).removeClass("bi-eye-slash").addClass("bi-eye");
            }
        });
    };

    // ---------- jQuery validation ----------
    this.validateLibraryForm = function () {
        const s = this.selectors;
        if ($(s.libraryLoginForm).data("validator")) {
            $(s.libraryLoginForm).removeData("validator").removeData("unobtrusiveValidation");
        }
        jQuery.validator.addMethod(
            "pattern",
            function (value, element, param) {
                const re = new RegExp(param);
                return this.optional(element) || re.test(value);
            },
            "Invalid format."
        );
        $(s.libraryLoginForm).validate({
            ignore: [],
            onkeyup: false,
            rules: {
                login_user_name: {
                    required: true,
                    pattern: /^[a-zA-Z ]+$/,
                    minlength: 5,
                },
                login_password: {
                    required: true,
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
                }
            },
            messages: {
                login_user_name: {
                    required: "Please enter Username",
                    pattern: "Letters only allowed",
                    minlength: "At least 5 characters",
                },
                login_password: {
                    required: "Please enter Password",
                    pattern: "Invalid Password Format",
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

    // ---------- Login submit ----------
    this.submitLoginForm = function () {
        const s = this.selectors;
        $(s.libraryLoginFormSubmitBtn).on("click", (e) => {
            e.preventDefault();
            if (!$(s.libraryLoginForm).valid()) return;

            const username = $(s.libraryLoginForm).find('[name="login_user_name"]').val().trim();
            const password = $(s.libraryLoginForm).find('[name="login_password"]').val();
            const users    = JSON.parse(localStorage.getItem("libraryUsers")) || [];

            const match = users.find(u =>
                u.username.toLowerCase() === username.toLowerCase() &&
                u.password === password
            );

            const toastEl = document.getElementById("loginSuccessToast");
            const toast   = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 1500 });

            if (match) {
                // ✅ Store the logged-in user
                localStorage.setItem("libraryUsername", match.username);

                
                toastEl.classList.remove("bg-danger");
                toastEl.style.backgroundColor = "#1EA73C";
                toastEl.querySelector(".toast-body").textContent =
                    `✅ Successfully Logged in as: ${match.username}`;

                toast.show();

                // Redirect after toast hides
                toastEl.addEventListener("hidden.bs.toast", () => {
                    window.location.href = "index.html";
                }, { once: true });

            } else {
                // ❌ Invalid credentials
                
                toastEl.classList.add("bg-danger");
                toastEl.style.backgroundColor = "";
                toastEl.querySelector(".toast-body").textContent =
                    "Invalid username or password!";
                toast.show();
            }
        });
    };
};

// ---------- Create object & run ----------
const libraryLogin = new LibraryLogin();
libraryLogin.seedUsers();
libraryLogin.passwordToggler();
libraryLogin.validateLibraryForm();
libraryLogin.submitLoginForm();

