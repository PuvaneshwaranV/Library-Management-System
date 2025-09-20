/**
 * Password Visibility & Focus UI Handler
 * --------------------------------------
 * Usage:
 *   const passwordToggler = new PasswordToggler();
 *   passwordToggler.init();
 */
const LibraryLogin = function() {
    // ---------- Central selectors ----------
    this.selectors = {
        passwordField: "#login_password", // Password input
        toggleButton: "#login_toggle_password", // Eye/eye-slash toggle button
        toggleIcon: "#login_toggle_password i", // <i> icon inside toggle button
        libraryLoginForm: "#library_login_form",
        libraryLoginFormSubmitBtn: "#library_login_form_submit_button"
    };

    // ---------- Public methods ----------
    this.passwordToggler = function () {
        const s = this.selectors; // shorter alias

        // Toggle password visibility
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

    this.validateLibraryForm = function(){
        if ($(this.selectors.libraryLoginForm).data("validator")) {
            $(this.selectors.libraryLoginForm).removeData("validator").removeData("unobtrusiveValidation");
        }
        jQuery.validator.addMethod(
            "pattern",
            function (value, element, param) {
                const re = new RegExp(param);
                return this.optional(element) || re.test(value);
            },
            "Invalid format."
        );
        $(this.selectors.libraryLoginForm).validate({
            ignore: [],
            onkeyup: false,
            rules: {
                login_user_name: {
                    required: true,
                    pattern:/^[a-z]+$/,
                    minlength: 5,
                },
                login_password: {
                    required: true,
                    pattern:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                    
                    
                }
            },
            messages: {
                login_user_name: {
                    required: "Please enter Username",
                    pattern:"Letters only allowed",
                    minlength: "Atleast length of 5 characters",
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

        })
    }

    this.submitLoginFrom = function(){
        const s = this.selectors;
        $(s.libraryLoginFormSubmitBtn).on("click", (e) => {
            e.preventDefault();
            if (!$(s.libraryLoginForm).valid()) return;
            console.log("Logged in");
        });
        }

}

// ---------- Create object & call ----------

const libraryLogin = new LibraryLogin();
libraryLogin.passwordToggler();
libraryLogin.validateLibraryForm();
libraryLogin.submitLoginFrom();
