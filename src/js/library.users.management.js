// =====================  User Management  =====================
const UserManagement = function() {
    // ---------- Selectors ----------
    this.selectors = {
        // filters
        filterType: "#member_filter_type",
        filterValue: "#member_filter_value",
        filters: ".filters",
        applyFiltersBtn: "#apply_member_filters",
        resetFiltersBtn: "#reset_member_filters",
        lmFilterChanged: "#lm_filter_changed",

        // table & modals
        userTable: "#user_table",
        memberModal: "#member_modal",
        updateMemberModal: "#update_member_modal",
        viewMemberModal: "#member_profile_modal",

        // loader
        loader: "#loader",

        // add form + fields (IDs and names must match your HTML)
        addForm: "#member_form",
        memberName: "#member_name",
        memberEmail: "#member_email",
        hiddenMemberEmail: "#hidden_member_email",
        memberWorkStatus: "#member_work_status",
        memberAddress: "#member_address",
        mobileNumber: "#mobile_number",
        hiddenmobileNumber: "#hidden_mobile_number",
        membershipEndDate: "#membership_end_date",
        memberAddBtn: "#member_add_btn",
        memberCancelBtn: "#member_cancel_btn",

        // update form + fields (IDs and names must match your HTML)
        updateForm: "#update_member_form",
        updateMemberId: "#update_member_id",
        updateMemberName: "#update_member_name",
        updateMemberEmail: "#update_member_email",
        updateMemberWorkStatus: "#update_member_work_status",
        updateMemberAddress: "#update_member_address",
        updateMobileNumber: "#update_mobile_number",
        updateMembershipStart: "#update_membership_start_date",
        updateMemberStatus: "#update_member_status",
        updateMembershipEnd: "#update_membership_end_date",
        updateMemberBtn: "#update_member_btn",
        updateCancelBtn: "#update_cancel_btn",
        updateAddressLine1: "#update_address_line1",
        updateAddressLine2: "#update_address_line2",
        updateState: "#update_state",
        updateCountry: "#update_country",
        updatePincode: "#update_pincode",
        updateHiddenMemberEmail: "#hidden_update_member_email",
        updateHiddenMemberNumber: "#hidden_update_mobile_number",

        // membership status modal
        membershipModal: "#membership_modal",
        membershipStatus: "#membership_status",
        membershipEndDateStatus: "#membership_end_date_status",
        membershipSaveBtn: "#membership_save",
        calendarIconChange: "#calendar_icon_change",

        // profile view
        profileAvatar: "#profile_avatar",
        profileName: "#profile_name",
        profileStatus: "#profile_status",
        profileEmail: "#profile_email",
        profileMobile: "#profile_mobile",
        profileWork: "#profile_work",
        profileMembership: "#profile_membership",
        profileAddress: "#profile_address",
        profileBooks: "#profile_books",
        favBooksSection: "#fav_books_section",

        // misc calendar icons in markup
        calendarIcon: "#calendar_icon",
        updateCalendarIcon: "#update_calendar_icon"
    };

    // ---------- Regex patterns (used indirectly via pattern validator) ----------
    // keep as JS strings in rules below
    this.patterns = {
        name: "^[A-Za-z\\s]{3,50}$",
        address: "^[A-Za-z0-9 ,\\.\\-]+$",
        mobile: "^[(][6-9][0-9]{2}[)][-][0-9]{3}[-][0-9]{4}$",
        // email will use built-in email rule
        email: "^[A-Za-z0-9]+@[A-Za-z]+[.](com|in)$",
        dateISO: true
    };

    // ---------- Initialization ----------
    this.init = function() {
        // init validation
        this.initValidation();
        this.memberFilter();
        // init widgets, masks, pickers
        this.initUI();

        // bind events
        this.bindEvents();

        $('#member_modal').on('show.bs.modal', function() {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const year = today.getFullYear();
            const display = `${month}-${day}-${year}`; // MM-DD-YYYY for the user

            $('#membership_start_date').val(display);
        });
        // initial filter toggle

    };

    // ---------- init UI helpers ----------
    this.initUI = function() {
        const s = this.selectors;
        // input masks
        if ($.fn.inputmask) {
            $(s.mobileNumber + ", " + s.updateMobileNumber).inputmask("(999)-999-9999");
            $(s.membershipEndDate + ", " + s.updateMembershipEnd + ", " + s.membershipEndDateStatus).inputmask("99-99-9999");
        }

        // TempusDominus datepickers (guarded in case library not loaded)
        try {
            this.statusEndDp = new tempusDominus.TempusDominus(
                document.getElementById("membership_end_date_status"), {
                    localization: { format: "MM-dd-yyyy" },
                    restrictions: { minDate: new tempusDominus.DateTime(new Date()), maxDate: new tempusDominus.DateTime(new Date(2030, 11, 31)) },
                    display: { components: { calendar: true, date: true, month: true, year: true } }
                }
            );
            // add end date picker (for add form)
            $('#member_modal').on('shown.bs.modal', () => {
                if (!this.addEndDp) {
                    this.addEndDp = new tempusDominus.TempusDominus(
                        document.getElementById('membership_end_date'), {
                            localization: { format: 'MM-dd-yyyy' },
                            restrictions: { minDate: new tempusDominus.DateTime(new Date()), maxDate: new tempusDominus.DateTime(new Date(2030, 11, 31)) },
                            display: { components: { calendar: true, date: true, month: true, year: true } },
                        }
                    );
                    $('#calendar_icon_add').off('click').on('click', e => {
                        e.stopPropagation();
                        // prevent bootstrap modal click bubbling
                        this.addEndDp.show();
                    });
                }
            })
        } catch (err) {
            // tempusDominus might not be available in some contexts — ignore safely.
            // console.warn("TempusDominus not initialized:", err);
            console.log("tempusDominus");

        }


        const filterParam = localStorage.getItem("dashboardFilter");

        if (filterParam) {
            try {
                this.showLoader(true);
                $(s.userTable).hide();
                localStorage.removeItem("dashboardFilter");
                const filter = JSON.parse(decodeURIComponent(filterParam));
                // 🔹 Make your AJAX call with these filter values
                $(this.selectors.resetFiltersBtn).css("display", "block");
                $("#member_filter_status").val("active").trigger("change");
                $("#member_length").val("50").trigger("change");
                $.ajax({
                    url: `http://localhost:8080/LibraryManagementSystem/Members/getAllMembers?start=0&length=50&memberStatusFilter=active&order=asec`,
                    method: "GET",
                    dataType: "json",
                    success: (res) => {
                        if ($.fn.DataTable.isDataTable(s.userTable)) $(s.userTable).DataTable().destroy();
                        $(s.userTable).DataTable({
                            data: res.object ?.data || [],
                            sort: false,
                            destroy: true,
                            dom: '<"top d-flex justify-content-end "<"dt-left"> <"dt-right d-flex align-items-center"p>>t<"bottom"ip>',
                            lengthMenu: [10, 25, 50, 100],
                            language: { emptyTable: "No data found" },
                            columns: [
                                { title: "S.No", data: null, orderable: false, searchable: false, render: (d, t, row, meta) => meta.row + 1 },
                                {
                                    title: "Member Id",
                                    data: "memberId",
                                    render: (d, t, r) => `#${r.memberId}`
                                },
                                { title: "Full Name", data: "memberName" },
                                {
                                    title: "Membership Start Date",
                                    data: "memberShipStartDate",
                                    render: (d, t, row) => {
                                        const backendDate = row.memberShipStartDate;
                                        const [year, month, day] = backendDate.split("-");
                                        const formatted = `${month}-${day}-${year}`;
                                        return `${formatted}`
                                    }
                                },
                                { title: "Membership End Date", data: "memberShipEndDate" },
                                {
                                    title: "Membership Status",
                                    data: "memberShipStatus",
                                    render: (d, t, row) => {

                                        const bgColor = row.memberShipStatus === "ACTIVE" ? "#d4edda" : "#f8d7da"; // light green / light red
                                        const textColor = row.memberShipStatus === "ACTIVE" ? "#155724" : "#721c24"; // dark text for contrast

                                        return `<span style="
                                  display:inline-block;
                                  background-color: ${bgColor}; 
                                  color: ${textColor}; 
                                  border-radius: 12px; 
                                  padding: 2px 0px; 
                                
                                  width: 100px;
                                  font-weight: 500;
                                  cursor:pointer;
                              " class="status-click"
                              data-id="${row.memberId}"
                              data-bs-toggle="tooltip" data-bs-placement="top" title="Change Status" data-status="${row.memberShipStatus}"
                              >${row.memberShipStatus}</span>`;
                                    },
                                    className: "text-center",
                                    width: "50px !important"
                                },
                                {
                                    title: "Work Status",
                                    data: "memberWorkStatus",
                                    className: "text-capitalize"
                                },
                                {
                                    title: "Action",
                                    data: null,
                                    orderable: false,
                                    render: (d, t, row) => `
                            
                              <i class="fa-solid fa-pen-to-square text-grey  update-member i-btn-dark me-3 cursor-pointer" data-bs-toggle="tooltip" data-bs-target="${s.updateMemberModal}" data-id="${row.memberId}" title="Edit" ></i>
                            
                              <i class="fa-solid fa-eye  cursor-pointer  view-member" data-bs-toggle="tooltip" data-bs-target="${s.viewMemberModal}" data-id="${row.memberId}" title="View Profile"></i>
                            `
                                }
                            ],
                            initComplete: function() {
                                const dtRight = $('.dt-right');
                                if (dtRight.children('#addMemberBtn').length === 0) {
                                    dtRight.prepend(`
                                  <button
                                      id="addMemberBtn"
                                      class="btn btn-warning text-white me-2 mb-0 pagination-button"
                                      data-bs-toggle="modal" 
                                      data-bs-target="#member_modal" 
                                  >
                                      <i class="fa-solid fa-circle-plus fa-lg me-1" style="color: #ffffff"></i>
                                      Add Member
                                  </button>
                              `);
                                }
                            },
                            drawCallback: function() {

                                document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                                    const old = bootstrap.Tooltip.getInstance(el);
                                    if (old) old.dispose();
                                    new bootstrap.Tooltip(el, { trigger: 'hover' });
                                });
                            }
                        });
                        this.showLoader(false);
                        $(s.userTable).show();
                    }
                });
            } catch (e) {
                console.error("Invalid filter from dashboard", e);
            }
        }

    };

    // ---------- Validation (single global pattern method + form configs) ----------
    this.initValidation = function() {
        const s = this.selectors;

        // single global pattern validator (only once)
        if (!jQuery.validator || !jQuery.validator.addMethod) {
            console.warn("jQuery Validate plugin not loaded.");
            return;
        }

        jQuery.validator.addMethod("notPastDate", function(value, element) {
            if (!value) return true; // let required rule handle empties

            // Match MM-DD-YYYY and extract parts
            const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
            if (!m) return false; // invalid format

            const month = parseInt(m[1], 10);
            const day = parseInt(m[2], 10);
            const year = parseInt(m[3], 10);

            // Create a date at local midnight
            const typedDate = new Date(year, month - 1, day);
            if (isNaN(typedDate)) return false;

            // Today at local midnight
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // ✅ return true if today or future, false if past
            return typedDate >= today;
        }, "Date cannot be in the past");

        jQuery.validator.addMethod(
            "pattern",
            function(value, element, param) {
                // param can be a string (regex source) or a RegExp
                const re = param instanceof RegExp ? param : new RegExp(param);
                return this.optional(element) || re.test(value);
            },
            "Invalid format."
        );

        // Add form validation — keys MUST match the form field `name` attributes
        if ($(s.addForm).length) {
            $(s.addForm).validate({
                ignore: [],
                rules: {
                    first_name: { required: true, pattern: this.patterns.name },
                    middle_name: { required: false, pattern: /^[A-Za-z\s]{0,50}$/ },
                    last_name: { required: true, pattern: /^[A-Za-z\s]{1,50}$/ },
                    member_email: { required: true, pattern: this.patterns.email },
                    confirm_email: { required: true, equalTo: "#member_email" },

                    member_work_status: { required: true },
                    mobile_number: { required: true, pattern: this.patterns.mobile },
                    membership_end_date: { required: true, pattern: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/, notPastDate: true },
                    address_line1: { required: true, pattern: /^[a-zA-z0-9 /,\\]{3,}$/ },
                    address_line2: { pattern: /^[a-zA-z0-9 ,\\]{3,}$/ },
                    city: { required: true, pattern: /^[a-zA-z ]+$/, minlength:3 },
                    state: { required: true, pattern: /^[a-zA-z ]+$/, minlength:3 },
                    country: { required: true, pattern: /^[a-zA-z ]{3,}$/ },
                    pincode: { required: true, pattern: /^\d{5}$/ }
                },
                messages: {
                    first_name: { required: "First name is required", pattern: "Invalid first name" },
                    last_name: { required: "Last name is required", pattern: "Invalid last name" },
                    member_email: { required: "Email is required", pattern: "Invalid email" },
                    confirm_email: { required: "Confirm email", equalTo: "Emails not match" },
                    member_work_status: { required: "Select designation" },
                    mobile_number: { required: "Mobile number is required", pattern: "Enter a valid 10-digit number", },
                    membership_end_date: { required: "End date is required", pattern: "Use MM-DD-YYYY", notPastDate: "Date cannot be earlier than today." },
                    address_line1: { required: "Address is required", pattern: "Invalid adress format" },
                    address_line2: { pattern: "Invalid adress format" },
                    city: { required: "city is required", pattern: "Letters and spaces only allowed", minlength:"Minimum 3 characters required" },
                    state: { required: "State is required", pattern: "Letters and spaces only allowed", minlength:"Minimum 3 characters required" },
                    country: { required: "Country is required", pattern: "Letters ans spaces only allowed" },
                    pincode: { required: "Zipcode is required", pattern: "Must be 5 Digits only" }
                },
                errorPlacement: function(error, element) {
                    if (element.closest(".input-group").length) {
                        error.insertAfter(element.closest(".input-group"));
                    } else {
                        error.insertAfter(element);
                    }
                },
                // highlight: el => $(el).addClass("is-invalid"),
                // unhighlight: el => $(el).removeClass("is-invalid")
            });
        }

        // Update form validation (names assumed to be update_* as in earlier code)
        if ($(s.updateForm).length) {
            $(s.updateForm).validate({
                ignore: [],
                rules: {
                    update_first_name: { required: true, pattern: /^[A-Za-z\s]+$/ },
                    update_middle_name: { pattern: /^[A-Za-z\s]+$/ }, // optional
                    update_last_name: { required: true, pattern: /^[A-Za-z\s]+$/ },
                    update_member_email: {
                        required: true,
                        pattern: this.patterns.email
                    },
                    update_mobile_number: {
                        required: true,
                        pattern: this.patterns.mobile
                    },
                    update_address_line1: { required: true, pattern: /^[a-zA-z0-9 /,\\]{3,}$/ },
                    update_address_line2: { pattern: /^[a-zA-z0-9 ,\\]{3,}$/ },
                    update_state: { required: true, pattern: /^[A-Za-z \s]+$/ },
                    update_country: { required: true, pattern: /^[A-Za-z \s]+$/ },
                    update_pincode: {
                        required: true,
                        pattern: /^\d{5}$/ 
                    },
                    update_membership_end_date: { required: true, pattern: /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/, notPastDate: true }
                },
                messages: {
                    update_first_name: { required: "First name is required", pattern: "Letters only" },
                    update_middle_name: { pattern: "Letters only" },
                    update_last_name: { required: "Last name is required", pattern: "Letters only" },
                    update_member_email: {
                        required: "Email is required",
                        pattern: "Invalid email"
                    },
                    update_mobile_number: {
                        required: "Mobile number is required",
                        pattern: "Enter a valid 10-digit number"
                    },
                    update_address_line1: { required: "Address Line 1 is required", pattern: "Invalid adress format" },
                    update_address_line2: { pattern: "Invalid adress format" },
                    update_state: { required: "State is required", pattern: "Letters ans spaces only allowed" },
                    update_country: { required: "Country is required", pattern: "Letters ans spaces only allowed" },
                    update_pincode: {
                        required: "Zipcode is required",
                        pattern: "Use 5 digits only"
                    },
                    update_membership_end_date: { required: "End date is required", pattern: "Use MM-DD-YYYY", notPastDate: "Date cannot be earlier than today." }
                },
                errorPlacement: function(error, element) {
                    if (element.closest(".input-group").length) {
                        error.insertAfter(element.closest(".input-group"));
                    } else {
                        error.insertAfter(element);
                    }
                },
                // highlight: el => $(el).addClass("is-invalid"),
                // unhighlight: el => $(el).removeClass("is-invalid")
            });
        }
    };

    // ---------- Bind DOM events ----------
    this.bindEvents = function() {
        const s = this.selectors;

        // Filters / table
        $(document).on("click", s.applyFiltersBtn, () => this.renderUserTable());
        $(document).on("click", s.resetFiltersBtn, () => this.resetFilters());

        $(document).on("input", s.filterValue, this.changeFilterInput.bind(this));
        $(document).on("change", s.filters, this.toggleFilters.bind(this));

        // Add form buttons
        $(document).on("click", s.memberAddBtn, (e) => {
            e.preventDefault();
            this.addMember();
        });
        $(document).on("click", s.memberCancelBtn, (e) => {
            e.preventDefault();
            this.resetForm(s.addForm);
        });

        // Update form buttons
        $(document).on("click", s.updateMemberBtn, (e) => {
            e.preventDefault();
            this.updateMember();
        });
        $(document).on("click", s.updateCancelBtn, (e) => {
            e.preventDefault();
            this.resetForm(s.updateForm);
        });

        // Table action buttons (delegated)
        $(document).on("click", ".status-click", (e) => this.changeMemberStatus(e.currentTarget));
        $(document).on("click", "#membership_save", () => this.saveMembershipUpdate());
        $(document).on("click", ".update-member", (e) => this.openUpdateModal(e));
        $(document).on("click", ".view-member", (e) => this.openProfile(e));

        // calendar icons: show datepickers if present
        $(document).on("click", s.calendarIcon, () => { if (this.addEndDp) this.addEndDp.show(); });
        $(document).on("click", s.updateCalendarIcon, () => { if (this.updateEndDp) this.updateEndDp.show(); });
        $(document).on("click", s.calendarIconChange, () => { if (this.statusEndDp) this.statusEndDp.show(); });

        // modal hidden handlers -> reset proper forms
        $(s.memberModal).on("hidden.bs.modal", () => this.resetForm(s.addForm));
        $(s.updateMemberModal).on("hidden.bs.modal", () => this.cleanupUpdateModal());
        $(s.membershipModal).on("hidden.bs.modal", () => this.resetStatusModal());
    };

    // ---------- Helpers: show/hide loader ----------
    this.showLoader = function(show) { show ? $(this.selectors.loader).show() : $(this.selectors.loader).hide(); };

    // ---------- Reset a form and its validation state ----------
    this.resetForm = function(formSelector) {
        // default to add form if not provided
        const s = this.selectors;
        const sel = formSelector || s.addForm;
        const $f = $(sel);
        if (!$f.length) return;
        // native reset
        if ($f[0].reset) $f[0].reset();
        // clear selects explicitly (ensure the placeholder option gets selected)
        $f.find("select").prop("selectedIndex", 0);
        // reset validator messages and classes
        try {
            const validator = $f.data("validator") || $f.validate();
            if (validator) validator.resetForm();
        } catch (err) { /* ignore */ }
        // $f.find(".is-invalid").removeClass("is-invalid");
    };

    // ---------- Reset membership status modal fields ----------
    this.resetStatusModal = function() {
        const s = this.selectors;
        $(s.membershipEndDateStatus).val("");
        $(s.membershipStatus).val("");
        $("#end_date_error, #status_error").text("");
    };

    // ---------- Toggle / filters helpers ----------
    this.changeFilterInput = function() {
        if ($.fn.DataTable.isDataTable(this.selectors.userTable)) {
            $(this.selectors.userTable).DataTable().clear().destroy();
            $(this.selectors.userTable).hide();
            $(this.selectors.lmFilterChanged).css("display", "block")
            $(this.selectors.resetFiltersBtn).css("display", "block")
        }
    };

    this.toggleFilters = function() {
        this.changeFilterInput();
    };



    // ---------- Add Member (uses jQuery Validate .valid()) ----------
    this.addMember = function() {
        const s = this.selectors;
        // ensure form is valid
        if (!$(s.addForm).valid()) return;

        Swal.fire({
            title: "Add New Member?",
            text: "Please confirm member details before add.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Add",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                // format mobile (digits only)
                const localNo = $(s.addForm + " [name='mobile_number']").val().replace(/\D/g, "");
                const memberName = [
                    $("#first_name").val().trim(),
                    $("#middle_name").val().trim(),
                    $("#last_name").val().trim()
                ].filter(Boolean).join(" ");

                const memberAddress = [
                    $("#address_line1").val().trim(),
                    $("#address_line2").val().trim(),
                    $("#city").val().trim(),
                    $("#state").val().trim(),
                    $("#country").val().trim(),
                    $("#pincode").val().trim()
                ].filter(Boolean).join("-");

                const [month, day, year] = $(s.addForm + " [name='membership_end_date']").val().trim().split("-");
                const membershipEndDateFormat = `${year}-${month}-${day}`;
                // prepare payload
                console.log(localNo);

                const payload = {
                    memberName: memberName,
                    memberShipEndDate: membershipEndDateFormat,
                    memberaddress: memberAddress,
                    memberMobileNumber: `+91 ${localNo}`,
                    memberWorkStatus: $(s.addForm + " [name='member_work_status']").val(),
                    memberEmail: $(s.addForm + " [name='member_email']").val().trim()
                };

                this.showLoader(true);
                $.ajax({
                    url: "http://localhost:8080/LibraryManagementSystem/Members/registerMember",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(payload),
                    success: (res) => {
                        this.showLoader(false);
                        $(s.memberModal).modal("hide");
                        this.resetForm(s.addForm);
                        Swal.fire({ icon: "success", title: "Member Added", text: "✅ " + res.object, timer: 4000, showConfirmButton: false })
                            .then(() => $(s.applyFiltersBtn).click());
                    },
                    error: (xhr, textStatus, errorThrown) => {
                        this.showLoader(false);
                        console.log(xhr.responseJSON ?.message);
                        if (xhr.responseJSON ?.message === "FAILURE") {
                            //  hiddenmobileNumber
                            if (xhr.responseJSON ?.object.startsWith("Email")) {
                                // Handle email-related error
                                $(s.hiddenMemberEmail).val(0);
                                $(s.hiddenMemberEmail).rules('add', {
                                    messages: {
                                        min: xhr.responseJSON ?.object
                                    }
                                });
                                console.log(xhr.responseJSON ?.object);
                                $(s.addForm).validate().element(s.hiddenMemberEmail)
                                $(s.hiddenMemberEmail).val(1);
                            } else if (xhr.responseJSON ?.object.startsWith("Mobile")) {
                                $(s.hiddenmobileNumber).val(0);
                                $(s.hiddenmobileNumber).rules('add', {
                                    messages: {
                                        min: xhr.responseJSON ?.object
                                    }
                                });
                                console.log(xhr.responseJSON ?.object);
                                $(s.addForm).validate().element(s.hiddenmobileNumber)
                                $(s.hiddenmobileNumber).val(1);
                            }
                        } else {
                            const msg = xhr.responseJSON ?.object || "Something went wrong.";
                            Swal.fire({ icon: "error", title: "Oops...", text: "❌ " + msg, timer: 2000, showConfirmButton: false });
                        }
                    }
                });
            }
        });
    };

    // ---------- Update Member ----------
    this.updateMember = function() {
        const s = this.selectors;
        if (!$(s.updateForm).valid()) return;
        Swal.fire({
            title: "Update Member Details?",
            text: "Please confirm before Make Change.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Update",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                const mobileVal = $(s.updateMobileNumber).val() || "";
                const localNo = mobileVal.replace(/\D/g, "");
                console.log(localNo);
                const memberAddress = [
                    $(s.updateAddressLine1).val().trim(),
                    $(s.updateAddressLine2).val().trim(),
                    $("#update_city").val().trim(),
                    $(s.updateState).val().trim(),
                    $(s.updateCountry).val().trim(),
                    $(s.updatePincode).val().trim()
                ].filter(Boolean).join('-');
                const endDateRaw = $(s.updateMembershipEnd).val().trim();
                const memberShipEndDate = endDateRaw ?
                    endDateRaw.replace(/(\d{2})-(\d{2})-(\d{4})/, "$3-$1-$2") :
                    "";

                const first = $("#update_first_name").val().trim();
                const middle = $("#update_middle_name").val().trim();
                const last = $("#update_last_name").val().trim();

                // Join with space, skip empty middle
                const memberName = [first, middle, last].filter(Boolean).join(" ");
                const payload = {
                    memberId: $(s.updateMemberId).val().trim(),
                    memberName: memberName,
                    memberShipEndDate: memberShipEndDate,
                    memberaddress: memberAddress,
                    memberMobileNumber: `+91 ${localNo}`,
                    memberWorkStatus: $(s.updateMemberWorkStatus).val(),
                    memberEmail: $(s.updateMemberEmail).val().trim()
                };
                console.log(payload);

                this.showLoader(true);
                $.ajax({
                    url: "http://localhost:8080/LibraryManagementSystem/Members/updateMemberDetails",
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify(payload),
                    success: (res) => {
                        this.showLoader(false);
                        $(s.updateMemberModal).modal("hide");
                        this.resetForm(s.updateForm);
                        Swal.fire({ icon: "success", title: "Updated", text: "✅ " + res.object, timer: 2000, showConfirmButton: false })
                            .then(() => {
                                $(s.resetFiltersBtn).click();
                                $(s.applyFiltersBtn).click();
                            });
                    },
                    error: (xhr) => {
                        this.showLoader(false);
                        const msg = xhr.responseJSON ?.message || "Something went wrong.";
                        if (xhr.responseJSON ?.message === "FAILURE") {
                            //  hiddenmobileNumber
                            if (xhr.responseJSON ?.object.startsWith("Email")) {
                                // Handle email-related error
                                $(s.updateHiddenMemberEmail).val(0);
                                $(s.updateHiddenMemberEmail).rules('add', {
                                    messages: {
                                        min: xhr.responseJSON ?.object
                                    }
                                });
                                console.log(xhr.responseJSON ?.object);
                                $(s.updateForm).validate().element(s.updateHiddenMemberEmail)
                                $(s.updateHiddenMemberEmail).val(1);
                            } else if (xhr.responseJSON ?.object.startsWith("Mobile")) {
                                $(s.updateHiddenMemberNumber).val(0);
                                $(s.updateHiddenMemberNumber).rules('add', {
                                    messages: {
                                        min: xhr.responseJSON ?.object
                                    }
                                });
                                console.log(xhr.responseJSON ?.object);
                                $(s.updateForm).validate().element(s.updateHiddenMemberNumber)
                                $(s.updateHiddenMemberNumber).val(1);
                            }
                        } else {
                            Swal.fire({ icon: "error", title: "Oops...", text: "❌ " + msg, timer: 2000, showConfirmButton: false });
                        }
                    }
                });
            }
        });
    };

    // ---------- DataTable render (unchanged logic from your original) ----------
    this.renderUserTable = function() {
        const s = this.selectors;
        this.showLoader(true);
        $(s.userTable).hide();
        $(this.selectors.lmFilterChanged).css("display", "none")
        $(this.selectors.resetFiltersBtn).css("display", "none")
        let length = $("#member_length").val();
        let status = $("#member_filter_status").val();
        let searchColumn = $(s.filterType).val();
        let search = $("#member_filter_value").val().trim();
        let params = { start: 0, length: length, order: "asc" };

        if ((status === "active" || status === "deactive") && search !== "") {
            params.memberStatusFilter = status;
            params.searchColumn = searchColumn;
            params.search = search;
        } else if (status === "active" || status === "deactive") {
            params.memberStatusFilter = status;
        } else if (search !== "") {
            params.searchColumn = searchColumn;
            params.search = search;
        }

        $.ajax({
            url: "http://localhost:8080/LibraryManagementSystem/Members/getAllMembers",
            method: "GET",
            data: params,
            dataType: "json",
            success: (res) => {
                if ($.fn.DataTable.isDataTable(s.userTable)) $(s.userTable).DataTable().destroy();
                $(s.userTable).DataTable({
                    data: res.object ?.data || [],
                    sort: false,
                    destroy: true,
                    autoWidth: false,
                    dom: '<"top d-flex justify-content-between align-items-center"<"dt-left"> <"dt-right d-flex align-items-center"p>>t<"bottom"ip>',
                    lengthMenu: [10, 25, 50, 100],
                    language: { emptyTable: "No data found" },
                    columns: [
                        { title: "S.No", data: null, orderable: false, searchable: false, render: (d, t, row, meta) => meta.row + 1 },
                        { title: "Full Name", data: null,
                            render:(d,t,r) => {
                                return `${r.memberName} (${r.memberId})`
                            }
                         },
                        {
                            title: "Membership Start Date",
                            data: "memberShipStartDate",

                            render: (d, t, row) => {
                                const backendDate = row.memberShipStartDate;
                                const [year, month, day] = backendDate.split("-");
                                const formatted = `${month}-${day}-${year}`;
                                return `${formatted}`
                            }
                        },
                        {
                            title: "Membership End Date",
                            data: "memberShipEndDate",
                            render: (d, t, row) => {
                                const backendDate = row.memberShipEndDate;
                                const [year, month, day] = backendDate.split("-");
                                const formatted = `${month}-${day}-${year}`;
                                return `${formatted}`
                            }
                        },
                        {
                            title: "Membership Status",
                            data: "memberShipStatus",
                            render: (d, t, row) => {

                                const bgColor = row.memberShipStatus === "ACTIVE" ? "#d4edda" : "#f8d7da"; // light green / light red
                                const textColor = row.memberShipStatus === "ACTIVE" ? "#155724" : "#721c24"; // dark text for contrast
                                let status = "";
                                if (row.memberShipStatus === "DEACTIVE") {
                                    status = "Inactive";
                                } else {
                                    status = "Active";
                                }
                                return `<span style="
                      display:inline-block;
                      background-color: ${bgColor}; 
                      color: ${textColor}; 
                      border-radius: 12px; 
                      padding: 2px 0px; 
                     
                      width: 100px;
                      font-weight: 500;
                      cursor:pointer;
                  " class="status-click"
                  data-id="${row.memberId}"
                  data-bs-toggle="tooltip" data-bs-placement="top" title="Change Status" data-status="${row.memberShipStatus}"
                  >${status} <i class="fa-solid fa-pen-to-square text-dark" ></i></span>`;
                            },
                            className: "text-center",
                            width: "50px !important"
                        },
                        {
                            title: "Designation",
                            data: "memberWorkStatus",
                            className: "text-capitalize"
                        },
                        {
                            title: "Action",
                            data: null,
                            orderable: false,
                            render: (d, t, row) => `
                                <i class="fa-solid fa-pen-to-square text-grey  update-member i-btn-dark me-3 cursor-pointer" data-bs-toggle="tooltip" data-bs-target="${s.updateMemberModal}" data-id="${row.memberId}" title="Edit Member Details" ></i>
                            
                                <i class="fa-solid fa-eye  cursor-pointer  view-member" data-bs-toggle="tooltip" data-bs-target="${s.viewMemberModal}" data-id="${row.memberId}" title="View Profile"></i>`
                        }
                    ],
                    initComplete: function() {
                        const dtRight = $('.dt-right');
                        if (dtRight.children('#addMemberBtn').length === 0) {
                            dtRight.prepend(`
                                <button
                                    id="addMemberBtn"
                                    class="btn btn-warning text-white me-2 mb-0 pagination-button"
                                    data-bs-toggle="modal" 
                                    data-bs-target="#member_modal"
                                >
                                    <i class="fa-solid fa-circle-plus fa-lg me-1" style="color: #ffffff"></i>
                                    Add Member
                                </button>
                            `);
                        }
                    },
                    drawCallback: function() {

                        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                            const old = bootstrap.Tooltip.getInstance(el);
                            if (old) old.dispose();
                            new bootstrap.Tooltip(el, { trigger: 'hover' });
                        });

                    }
                });
                this.showLoader(false);
                $(s.userTable).show();
            },
            error: () => {
                this.showLoader(false);
                Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch members" });
            }
        });
    };

    this.memberFilter = function() {
        const input = $("#member_filter_value");
        const clear = $("#clear_filter_value");

        // Show/hide the × icon as user types
        input.on("input", function() {
            if (this.value.trim().length) {
                clear.show();
            } else {
                clear.hide();
            }
        });

        // Click the × to clear and hide
        clear.on("click", function() {
            input.val("").trigger("input"); // trigger to hide icon
            input.focus(); // optional: keep focus in field
        });
    };



    // ---------- Change member status (modal) ----------
    this.changeMemberStatus = function(el) {
        const s = this.selectors;
        const $el = $(el);
        const memberId = $el.data("id");
        this.showLoader(true);

        $.ajax({
            url: `http://localhost:8080/LibraryManagementSystem/Members/getMemberById/${memberId}`,
            method: "GET",
            dataType: "json",
            success: (res) => {
                const m = res.object || {};
                this.showLoader(false);
                const raw = m.memberShipEndDate || m.membershipEndDate || "";
                const endDate = raw ? raw.split("T")[0] : "";
                $(s.membershipEndDateStatus).val(endDate);
                if (this.statusEndDp && endDate) this.statusEndDp.dates.setValue(new tempusDominus.DateTime(endDate));
                $(s.membershipStatus).val(m.membershipStatus || m.memberShipStatus || "");


                if (!this.statusEndDp) {
                    this.statusEndDp = new tempusDominus.TempusDominus(
                        document.getElementById('membership_end_date_status'), {
                            localization: { format: 'MM-dd-yyyy' },
                            restrictions: { minDate: new tempusDominus.DateTime(new Date()), maxDate: new tempusDominus.DateTime(new Date(2030, 11, 31)) },
                            display: { components: { calendar: true, date: true, month: true, year: true } }
                        }
                    );
                    // bind AFTER init and AFTER modal is visible
                    $('#calendar_icon_change').off('click').on('click', e => {
                        e.stopPropagation();
                        const isOpen = this.statusEndDp.display ?.isVisible(); // v6/v7 API
                        if (isOpen) {
                            this.statusEndDp.hide(); // close it
                        } else {
                            this.statusEndDp.show(); // open it
                        }
                    });
                }

                $(s.membershipModal).data("member-id", memberId).modal("show");
            },
            error: () => {
                this.showLoader(false);
                Swal.fire({ icon: "error", title: "Error", text: "Unable to fetch member details." });
            }
        });
    };

    // ---------- Save membership update ----------
    this.saveMembershipUpdate = function() {
        Swal.fire({
            title: "Update MemberShip Status?",
            text: "Please confirm before Make Change.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, Update",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                const s = this.selectors;
                const memberId = $(s.membershipModal).data("member-id");
                const endDate = $(s.membershipEndDateStatus).val().trim();
                let formattedDate = "";
                if (endDate) {
                    const parts = endDate.split("-"); // ["MM", "DD", "YYYY"]
                    if (parts.length === 3) {
                        formattedDate = `${parts[2]}-${parts[0]}-${parts[1]}`; // "YYYY-MM-DD"
                    }
                }
                const status = $(s.membershipStatus).val();

                if (!endDate) { $("#end_date_error").text("End date required."); return; } else $("#end_date_error").text("");
                if (!status) { $("#status_error").text("Select status."); return; } else $("#status_error").text("");

                this.showLoader(true);
                $.ajax({
                    method: "PUT",
                    url: `http://localhost:8080/LibraryManagementSystem/Members/updateMemberStatus?id=${memberId}&membershipEndDate=${formattedDate}&status=${status}`,
                    dataType: "json",
                    success: () => {
                        this.showLoader(false);
                        $(s.membershipModal).modal("hide");
                        Swal.fire("Updated!", "Membership updated successfully.", "success");
                        $(this.selectors.applyFiltersBtn).click();
                    },
                    error: () => {
                        this.showLoader(false);
                        Swal.fire("Error", "Failed to update membership.", "error");
                    }
                });
            }
        });
    };

    // ---------- Open update modal and populate ----------
    this.openUpdateModal = function(e) {
        const s = this.selectors;
        const memberId = $(e.currentTarget).data("id");
        this.showLoader(true);

        $.ajax({
            url: `http://localhost:8080/LibraryManagementSystem/Members/getMemberById/${memberId}`,
            method: "GET",
            dataType: "json",
            success: (res) => {
                const m = res.object || {};
                const nameParts = (m.memberName || "").trim().split(/\s+/);
                const first = nameParts[0] || "";
                const middle = nameParts.length === 3 ? nameParts[1] : (nameParts.length > 3 ? nameParts.slice(1, -1).join(" ") : "");
                const last = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
                $("#update_member_id").val(m.memberId);
                $("#update_first_name").val(first);
                $("#update_middle_name").val(middle);
                $("#update_last_name").val(last);
                $(s.updateMemberName).val(m.memberName || "");
                $(s.updateMemberEmail).val(m.memberEmail || "");
                $("#update_member_work_status").val(m.memberWorkStatus || "");
                $(s.updateMemberStatus).val(m.memberShipStatus || "");
                const startDate = m.memberShipStartDate ?
                    m.memberShipStartDate.replace(/(\d{4})-(\d{2})-(\d{2})/, "$2-$3-$1") :
                    "";
                $(s.updateMembershipStart).val(startDate);

                let a1 = "",
                    a2 = "",
                    city = "",
                    state = "",
                    country = "",
                    zip = "";
                if (m.memberaddress) {
                    const parts = m.memberaddress.split("-");
                    [a1, a2, city, state, country, zip] = parts;
                }
                $(s.updateAddressLine1).val(a1 || "");
                $(s.updateAddressLine2).val(a2 || "");
                $("#update_city").val(city || "");
                $(s.updateState).val(state || "");
                $(s.updateCountry).val(country || "");
                $(s.updatePincode).val(zip || "");
                if (m.memberMobileNumber) {
                    $(s.updateMobileNumber).val(m.memberMobileNumber.replace(/^\+\d{1,3}\s?/, "").replace(/\D/g, ""));
                }
                try {

                    $('#update_member_modal').on('shown.bs.modal', () => {
                        if (!this.updateEndDp) {
                            this.updateEndDp = new tempusDominus.TempusDominus(
                                document.getElementById('update_membership_end_date'), {
                                    localization: { format: 'MM-dd-yyyy' },
                                    restrictions: {
                                        minDate: new tempusDominus.DateTime(new Date()),
                                        maxDate: new tempusDominus.DateTime(new Date(2030, 11, 31))
                                    },
                                    display: { components: { calendar: true, date: true, month: true, year: true } }
                                }
                            );
                            $('#calendar_icon_update').off('click').on('click', (e) => {
                                e.stopPropagation();
                                this.updateEndDp.show()
                            });
                        }
                        if (m.memberShipEndDate) {
                            const endDt = new tempusDominus.DateTime(m.memberShipEndDate);
                            this.updateEndDp.dates.setValue(endDt); // Tempus Dominus API
                            // or, if you prefer raw input text:
                            // $('#update_membership_end_date').val(endDt.format('MM-dd-yyyy'));
                        }
                    })

                } catch (err) {
                    console.error('TempusDominus init error', err);
                }
                this.showLoader(false);
                $(s.updateMemberModal).modal("show");
            },
            error: () => {
                this.showLoader(false);
                Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch Member details." });
            }
        });
    };

    // ---------- Cleanup update modal ----------
    this.cleanupUpdateModal = function() {
        if (this.updateEndDp && this.updateEndDp.dispose) {
            try { this.updateEndDp.dispose(); } catch (err) { /* ignore */ }
            this.updateEndDp = null;
        }
        // reset update form if exists
        this.resetForm(this.selectors.updateForm);
    };

    // ---------- View profile ----------
    this.openProfile = function(e) {
        const s = this.selectors;
        const memberId = $(e.currentTarget).data("id");
        this.showLoader(true);

        $.ajax({
            url: `http://localhost:8080/LibraryManagementSystem/Members/getMemberById/${memberId}`,
            method: "GET",
            dataType: "json",
            success: (res) => {
                const m = res.object || {};
                const firstLetter = (m.memberName || "?").charAt(0).toUpperCase();
                const colors = ["#4f46e5", "#16a34a", "#db2777", "#f97316", "#0ea5e9"];
                const bgColor = colors[firstLetter.charCodeAt(0) % colors.length];

                $(s.profileAvatar).text(firstLetter).css("background-color", bgColor);
                $(s.profileName).text(m.memberName || "N/A");

                // Status with color
                const statusText = m.memberShipStatus || "N/A";
                const $statusEl = $(s.profileStatus);

                $statusEl.text(`Status: ${statusText}`).removeClass("text-success text-danger text-muted");

                if (statusText.toLowerCase() === "active") {
                    $statusEl.addClass("text-success"); // Bootstrap green
                } else  {
                    $statusEl.addClass("text-danger"); // Bootstrap red
                }

                $(s.profileEmail).text(m.memberEmail || "N/A");
                let mobile = m.memberMobileNumber || "N/A";
                if (mobile && mobile !== "N/A") {
                    // Extract country code if included (assume starts with +)
                    let formatted = mobile;
                    const countryCodeMatch = mobile.match(/^\+?\d{1,3}/);
                    let countryCode = "";
                    if (countryCodeMatch) {
                        countryCode = countryCodeMatch[0]; // +91, +1, etc.
                        formatted = mobile.replace(countryCode, "").trim();
                    }
                    // Keep only digits
                    formatted = formatted.replace(/\D/g, "");
                    if (formatted.length === 10) {
                        formatted = `(${formatted.substring(0,3)})-${formatted.substring(3,6)}-${formatted.substring(6)}`;
                    }
                    mobile = countryCode ? `${countryCode} ${formatted}` : formatted;
                }
                $(s.profileMobile).text(mobile);
                $(s.profileWork).text(m.memberWorkStatus || "N/A");

                const formatDate = (dateStr) => {
                    if (!dateStr) return "";
                    const parts = dateStr.split("-");
                    if (parts.length === 3) {
                        // input assumed dd-mm-yyyy or yyyy-mm-dd?
                        // If API gives yyyy-mm-dd → rearrange
                        if (parts[0].length === 4) {
                            return `${parts[1]}-${parts[2]}-${parts[0]}`;
                        } 
                    }
                    return dateStr;
                };
                const start = m.memberShipStartDate ? `Start: ${formatDate(m.memberShipStartDate)}` : "";
                const end = m.memberShipEndDate ? ` | End: ${formatDate(m.memberShipEndDate)}` : "";
                $(s.profileMembership).text(`${start}${end}`);

                // Address formatting: replace hyphens with commas
                const formattedAddress = (m.memberaddress || "N/A").replace(/-/g, ", ");
                $(s.profileAddress).text(formattedAddress);

                this.showLoader(false);
                $(s.viewMemberModal).modal("show");

                // async fetch favorite books
                $(s.profileBooks).empty().html('<span class="text-muted">Loading…</span>');
                $(s.favBooksSection).hide();

                $.ajax({
                    url: `http://localhost:8080/LibraryManagementSystem/RentalTransactions/getTop3FavoriteAuthorsBooks?memberId=${memberId}`,
                    method: "GET",
                    dataType: "json",
                    success: (books) => {
                        const list = Array.isArray(books.object) ? books.object : [];
                        if (list.length) {
                            // Join titles with " | "
                            const booksLine = list.map(b => b.title).join(" | ");
                            $(s.profileBooks).html(`<span class="text-dark">${booksLine}</span>`);
                            $(s.favBooksSection).show();
                        } else {
                            $(s.profileBooks).html('<span class="text-muted">No books borrowed yet</span>');
                            $(s.favBooksSection).show();
                        }
                    },
                    error: () => {
                        $(s.profileBooks).html('<span class="text-muted">No books borrowed yet</span>');
                        $(s.favBooksSection).show();
                    }
                });
            },
            error: () => {
                this.showLoader(false);
                Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch Member details.", timer: 2000, showConfirmButton: false });
            }
        });
    };


    // ---------- Reset filters ----------
    this.resetFilters = function() {
        $("#member_length").val("10");
        $("#member_filter_type").val("memberName");
        $("#member_filter_status").val("all");
        $("#member_filter_value").val("");
        $("#clear_filter_value").hide();

        if ($.fn.DataTable.isDataTable(this.selectors.userTable)) {
            $(this.selectors.userTable).DataTable().clear().destroy();
            $(this.selectors.userTable).hide();
        }

    };
};

// Create & init
const userManagement = new UserManagement();
$(document).ready(() => userManagement.init());