// =====================  User Management  =====================
if (typeof window.UserManagement === "undefined") {
    window.UserManagement = function () {

    // ---------- 1️⃣  Selectors ----------
    this.selectors = {
        //SearchFields
        filterType:             "#member_filter_type",
        filterValue:            "#member_filter_value",
        filters:                ".filters",

        // Buttons
        applyFiltersBtn:        "#apply_member_filters",
        resetFiltersBtn:        "#reset_member_filters",
        memberAddBtn:           "#member_add_btn",
        memberUpdateBtn:        "#update_member_btn",
        memberCancelBtn:        "#member_cancel_btn",
        updateCancelBtn:        "#update_cancel_btn",

        membershipModal:        "#membership_modal",
        membershipStatus:       "#membership_status",
        membershipSaveBtn:      "#membership_save",
        membershipEndDateStatus:"#membership_end_date_status",
        calendarIconChange:     "#calendar_icon_change",

        // Tables / Modals
        userTable:              "#user_table",
        memberModal:            "#member_modal",
        updateMemberModal:      "#update_member_modal",
        viewMemberModal:        "#member_profile_modal",

        // Loader
        loader:                 "#loader",

        // Add-form fields
        memberName:             "#member_name",
        memberEmail:            "#member_email",
        memberWorkStatus:       "#member_work_status",
        memberAddress:          "#member_address",
        mobileNumber:           "#mobile_number",
        membershipEndDate:      "#membership_end_date",
        calendarIcon:           "#calendar_icon",

        // Update-form fields
        updateMemberId:         "#update_member_id",
        updateMemberName:       "#update_member_name",
        updateMemberEmail:      "#update_member_email",
        updateMemberWorkStatus: "#update_member_work_status",
        updateMemberStatus:     "#update_member_status",
        updateMembershipStart:  "#update_membership_start_date",
        updateMemberAddress:    "#update_member_address",
        updateMobileNumber:     "#update_mobile_number",
        updateMembershipEnd:    "#update_membership_end_date",
        updateCalendarIcon:     "#update_calendar_icon",

        // Profile view
        profileAvatar:          "#profile_avatar",
        profileName:            "#profile_name",
        profileStatus:          "#profile_status",
        profileEmail:           "#profile_email",
        profileMobile:          "#profile_mobile",
        profileWork:            "#profile_work",
        profileMembership:      "#profile_membership",
        profileAddress:         "#profile_address",
        profileBooks:           "#profile_books",
        favBooksSection:        "#fav_books_section"
    };

    // ---------- 2️⃣  Regex ----------
    this.regex = {
        name:    /^[A-Za-z0-9\s]{3,30}$/,
        address: /^[A-Za-z0-9,\s]{3,30}$/,
        number:  /^[6-9][0-9]{9}$/,   // 10-digit Indian mobile number
        email:   /^[a-z0-9]{8,20}[@][a-z]{1,15}[.][a-z]{1,3}$/
    };

    // ---------- 3️⃣  Init ----------
    this.init = function () {
        const s = this.selectors;

        // DataTable render
        // this.renderUserTable();

        // Bind buttons
        $(document).on("click", s.applyFiltersBtn, () => this.renderUserTable());
        $(document).on("click", ".status-click", function () {
            userManagement.changeMemberStatus(this);
        });
        $(document).on("click", s.resetFiltersBtn, () => this.resetFilters());
        $(document).on("click", s.memberAddBtn,  () => this.addMember());
        $(document).on("click", s.memberCancelBtn, () => this.resetForm());
        $(document).on("click", s.memberUpdateBtn, () => this.updateMember());
        $(document).on("click", ".update-member", (e) => this.openUpdateModal(e));
        $(document).on("click", ".view-member",   (e) => this.openProfile(e));
        $(document).on("click", this.selectors.membershipSaveBtn, () => this.saveMembershipUpdate());
        $(document).on("change", s.filterType, this.toggleFilterInput.bind(this));
        $(document).on("change", s.filters, this.toggleFilters.bind(this));
        $(document).on("input", s.filterValue, this.changeFilterInput.bind(this));
        this.toggleFilterInput();
        $(document).on("click", s.updateCalendarIcon, () => {
            if (this.updateEndDp) this.updateEndDp.show();
        });
        $(document).on("click", s.calendarIcon, () => {
            if (this.addEndDp) this.addEndDp.show();
        });

        // Membership-Status modal icon
        $(document).on("click", s.calendarIconChange, () => {
            if (this.statusEndDp) this.statusEndDp.show();
        });

        $(s.membershipModal).on('hidden.bs.modal', () => this.resetStatusModal());
        $(s.memberModal).on("hidden.bs.modal", () => this.resetForm());
        $(s.updateMemberModal).on("hidden.bs.modal", () => this.cleanupUpdateModal());
        $('#membership_modal').on('shown.bs.modal', function () {
            window.membershipPicker = new tempusDominus.TempusDominus(
                document.getElementById('membership_end_date'),
                {
                    localization: { format: "yyyy-MM-dd" },
                    restrictions: { minDate: new tempusDominus.DateTime(new Date()) },
                    display: {
                        components: { calendar: true, date: true, month: true, year: true }
                    }
                }
            );
        });

        $("#mobile_number").inputmask("99999-99999");
        $("#membership_end_date").inputmask("9999-99-99");
        $("#update_membership_end_date").inputmask("9999-99-99");
        $("#update_mobile_number").inputmask("99999-99999");
        $("#membership_end_date_status").inputmask("9999-99-99");



        // Date picker for status modal
        this.statusEndDp = new tempusDominus.TempusDominus(
            document.getElementById("membership_end_date_status"),
            {
                localization: { format: "yyyy-MM-dd" },
                restrictions: { minDate: new tempusDominus.DateTime(new Date()) },
                display: { components: { calendar: true, date: true, month: true, year: true } }
            }
        );
        // Date picker for Add Member
        this.addEndDp = new tempusDominus.TempusDominus($(s.membershipEndDate)[0], {
            localization: { format: "yyyy-MM-dd" },
            restrictions: { minDate: new tempusDominus.DateTime(new Date()) },
            display: { components: { calendar: true, date: true, month: true, year: true } }
        });
    };

    this.resetStatusModal = function () {
    const s = this.selectors;
    $(s.membershipEndDateStatus).val('');
    $(s.membershipStatus).val('');
    $("#end_date_error, #status_error").text('');
};

    // ---------- 4️⃣  Helpers ----------
    this.showLoader = function (show) {
        show ? $(this.selectors.loader).show() : $(this.selectors.loader).hide();
    };

    this.changeFilterInput = function(){
        if ($.fn.DataTable.isDataTable(this.selectors.userTable)) {
            $(this.selectors.userTable).DataTable().clear().destroy();
            $(this.selectors.userTable).hide();
        }
    };

    this.toggleFilters = function(){
        if ($.fn.DataTable.isDataTable(this.selectors.userTable)) {
            $(this.selectors.userTable).DataTable().clear().destroy();
            $(this.selectors.userTable).hide();
        }
    };

    this.toggleFilterInput = function () {
        const s = this.selectors;
        const selected = $(s.filterType).val();
        if (selected && selected.toLowerCase() !== "all") {
            $(s.filterValue).prop("disabled", false);
        } else {
            $(s.filterValue).prop("disabled", true).val("");
        }
    };

    this.validateField = function (id, regex, errorId, errorMessage) {
        let value = $(id).val().trim();
        if (value === "") {
            $(errorId).text("Required Field.");
            return false;
        } else if (regex && !regex.test(value)) {
            $(errorId).text(errorMessage);
            return false;
        }
        $(errorId).text("");
        return true;
    };

    this.resetForm = function () {
        const s = this.selectors;
        $(`${s.memberName}, ${s.memberEmail}, ${s.memberWorkStatus},
           ${s.mobileNumber}, ${s.membershipEndDate}, ${s.memberAddress}`).val("");
        $("#member_name_error, #member_email_error, #member_work_status_error, #mobile_number_error, #membership_end_date_error, #member_address_error").text("");
    };

    // ---------- 5️⃣  Table ----------
    this.renderUserTable = function () {
        const s = this.selectors;
        this.showLoader(true);
        $(s.userTable).hide();

        let length = $("#member_length").val();
        let status = $("#member_filter_status").val();
        let search = $("#member_filter_value").val().trim();
        let params = { start: 0, length: length, order: "asec" };

        if ((status === "active" || status === "deactive") && search !== "") {
            params.memberStatusFilter = status;
            params.search = search;
        } else if (status === "active" || status === "deactive") {
            params.memberStatusFilter = status;
        } else if (search !== "") {
            params.search = search;
        }

        $.ajax({
            url: "http://localhost:8080/LibraryManagementSystem/Members/getAllMembers",
            method: "GET",
            data: params,
            dataType: "json",
            success: (res) => {
                if ($.fn.DataTable.isDataTable(s.userTable)) {
                    $(s.userTable).DataTable().destroy();
                }
                $(s.userTable).DataTable({
                    data: res.object.data,
                    sort: false,
                    destroy: true,
                    dom: '<"top"lp>t<"bottom"ip>',
                    lengthMenu: [10, 25, 50, 100],
                    language: { emptyTable: "No data found" },
                    columns: [
                        {
                            title: "S.No",
                            data: null,
                            orderable: false,
                            searchable: false,
                            render: (data, type, row, meta) => meta.row + 1
                        },
                        { title: "Member ID", data: "memberId" },
                        { title: "Member Name", data: "memberName" },
                        { title: "MemberShip Start Date", data: "memberShipStartDate" },
                        { title: "MemberShip End Date", data: "memberShipEndDate" },
                        { title: "MemberShip Status", data: "memberShipStatus",
                            render: (d, t, row) => {
                                const cls = row.memberShipStatus === "ACTIVE" ? "bg-success" : "bg-danger";
                                return `<span class="status-click ${cls} rounded-5 text-white mb-0 px-2"
                                    style="cursor:pointer; display:inline-block"
                                    data-id="${row.memberId}" data-bs-toggle="tooltip" data-bs-placement="top" title="Change Status"
                                    data-status="${row.memberShipStatus}">
                                    ${row.memberShipStatus}
                                </span>`;
                            },
                        },
                        { title: "Work Status", data: "memberWorkStatus" },
                        { title: "Actions", data: null, orderable: false,
                            render: (d,t,row) => `
                                <button class="btn btn-sm btn-warning me-2 mb-2 update-member" 
                                        data-bs-toggle="tooltip"
                                        data-bs-target="${s.updateMemberModal}"
                                        data-id="${row.memberId}" title="Edit">
                                  <i class="fa-solid fa-pen-to-square" style="color:#fff;"></i>
                                </button>
                                <button class="btn btn-sm btn-dark me-2 mb-2 view-member"
                                        data-bs-toggle="tooltip"
                                        data-bs-target="${s.viewMemberModal}"
                                        data-id="${row.memberId}" title="view Profile">
                                  <i class="fa-solid fa-eye" style="color:#fff;"></i>
                                </button>`
                        }
                    ],
                    drawCallback: function () {
    // enable all tooltips inside the table, hover only
    document
      .querySelectorAll('[data-bs-toggle="tooltip"]')
      .forEach(el => {
        // destroy any previous instance to avoid duplicates
        const old = bootstrap.Tooltip.getInstance(el);
        if (old) old.dispose();

        // create a new tooltip that shows on hover only
        new bootstrap.Tooltip(el, {
          trigger: 'hover'    // 👈 ensure it shows ONLY on hover
        });
      });
}

                });
                this.showLoader(false);
                $(s.userTable).show();
            },
            error: () => {
                this.showLoader(false);
                Swal.fire({ icon:"error", title:"Error", text:"Failed to fetch members" });
            }
        });
    };

    this.changeMemberStatus = function (el) {
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
                if (this.statusEndDp && endDate) {
                    this.statusEndDp.dates.setValue(new tempusDominus.DateTime(endDate));
                }
                $(s.membershipStatus).val(m.membershipStatus || m.memberShipStatus || "");
                $(s.membershipModal).data("member-id", memberId).modal("show");
            },
            error: () => {
                this.showLoader(false);
                Swal.fire({ icon: "error", title: "Error", text: "Unable to fetch member details." });
            }
        });
    };

    this.saveMembershipUpdate = function () {
        const s = this.selectors;
        const memberId = $(s.membershipModal).data("member-id");
        const endDate  = $(s.membershipEndDateStatus).val().trim();
        const status   = $(s.membershipStatus).val();

        if (!endDate) {
            $("#end_date_error").text("End date required.");
            return;
        } else {
            $("#end_date_error").text("");
        }
        if (!status) {
            $("#status_error").text("Select status.");
            return;
        } else {
            $("#status_error").text("");
        }

        this.showLoader(true);
        $.ajax({
            method: "PUT",
            url: `http://localhost:8080/LibraryManagementSystem/Members/updateMemberStatus?id=${memberId}&membershipEndDate=${endDate}&status=${status}`,
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
    };

    // ---------- 6️⃣  Add Member ----------
    this.addMember = function () {
        const s = this.selectors;
        let validName   = this.validateField(s.memberName,   this.regex.name,   "#member_name_error",   "Only letters and numbers allowed.");
        let validAddr   = this.validateField(s.memberAddress,this.regex.address,"#member_address_error","Only letters and numbers allowed.");
        let validEmail  = this.validateField(s.memberEmail,  this.regex.email,  "#member_email_error",  "Email format not matched.");
        let statusVal   = $(s.memberWorkStatus).val();
        let validStatus = ["student","employed","unemployee"].includes(statusVal);
        if (!validStatus) $("#member_work_status_error").text("Please select the status");

        let localNo = $(s.mobileNumber).val().replace(/\D/g, "");
        let validMobile = this.regex.number.test(localNo);
        if (!validMobile) $("#mobile_number_error").text("Invalid mobile number.");

        if (validName && validAddr && validEmail && validStatus && validMobile) {
            this.showLoader(true);
            // ✅ Prepend +91 before sending
            let payload = {
                memberName: $(s.memberName).val().trim(),
                memberShipEndDate: $(s.membershipEndDate).val().trim(),
                memberaddress: $(s.memberAddress).val().trim(),
                memberMobileNumber: `+91 ${localNo}`,
                memberWorkStatus: statusVal,
                memberEmail: $(s.memberEmail).val().trim()
            };

            $.ajax({
                url: "http://localhost:8080/LibraryManagementSystem/Members/registerMember",
                type: "POST",
                data: JSON.stringify(payload),
                contentType: "application/json",
                success: (res) => {
                    this.showLoader(false);
                    $(s.memberModal).modal("hide");
                    this.resetForm();
                    Swal.fire({ icon:"success", title:"Member Added", text: "✅ "+res.object, timer:2000, showConfirmButton:false })
                        .then(()=> $(s.applyFiltersBtn).click());
                },
                error: (xhr) => {
                    this.showLoader(false);
                    let msg = xhr.responseJSON?.message || "Something went wrong.";
                    Swal.fire({ icon:"error", title:"Oops...", text:"❌ "+msg, timer:2000, showConfirmButton:false });
                }
            });
        }
    };

    // ---------- 7️⃣  Update Member ----------
    this.updateMember = function () {
        const s = this.selectors;
        let validName   = this.validateField(s.updateMemberName,   this.regex.name,   "#update_member_name_error",   "Only letters and numbers allowed.");
        let validAddr   = this.validateField(s.updateMemberAddress,this.regex.address,"#update_member_address_error","Only letters and numbers allowed.");
        let validEmail  = this.validateField(s.updateMemberEmail,  this.regex.email,  "#update_member_email_error",  "Email format not matched.");
        let statusVal   = $(s.updateMemberWorkStatus).val();
        let validStatus = ["student","employed","unemployee"].includes(statusVal);
        if (!validStatus) $("#update_member_work_status_error").text("Please select the status");

        let localNo = $(s.updateMobileNumber).val().replace(/\D/g, "");
        let validMobile = this.regex.number.test(localNo);
        if (!validMobile) $("#update_mobile_number_error").text("Invalid mobile number.");

        if (validName && validAddr && validEmail && validStatus && validMobile) {
            this.showLoader(true);
            // ✅ Prepend +91 before sending
            let payload = {
                memberId: $(s.updateMemberId).val().trim(),
                memberName: $(s.updateMemberName).val().trim(),
                memberShipEndDate: $(s.updateMembershipEnd).val().trim(),
                memberaddress: $(s.updateMemberAddress).val().trim(),
                memberMobileNumber: `+91 ${localNo}`,
                memberWorkStatus: statusVal,
                memberEmail: $(s.updateMemberEmail).val().trim()
            };

            $.ajax({
                url: "http://localhost:8080/LibraryManagementSystem/Members/updateMemberDetails",
                type: "PUT",
                data: JSON.stringify(payload),
                contentType: "application/json",
                success: (res) => {
                    this.showLoader(false);
                    $(s.updateMemberModal).modal("hide");
                    Swal.fire({ icon:"success", title:"Updated", text:"✅ "+res.object, timer:2000, showConfirmButton:false })
                        .then(() => {
                            $(s.resetFiltersBtn).click();
                            $(s.applyFiltersBtn).click();
                        });
                },
                error: (xhr) => {
                    this.showLoader(false);
                    let msg = xhr.responseJSON?.message || "Something went wrong.";
                    Swal.fire({ icon:"error", title:"Oops...", text:"❌ "+msg, timer:2000, showConfirmButton:false });
                }
            });
        }
    };

    // ---------- 8️⃣  Update modal setup ----------
    this.openUpdateModal = function (e) {
        const s = this.selectors;
        const memberId = $(e.currentTarget).data("id");
        this.showLoader(true);
        $.ajax({
            url: `http://localhost:8080/LibraryManagementSystem/Members/getMemberById/${memberId}`,
            method: "GET",
            dataType: "json",
            success: (res) => {
                const m = res.object;
                $(s.updateMemberId).val(m.memberId);
                $(s.updateMemberName).val(m.memberName);
                $(s.updateMemberEmail).val(m.memberEmail);
                $(s.updateMemberWorkStatus).val(m.memberWorkStatus);
                $(s.updateMemberStatus).val(m.memberShipStatus);
                $(s.updateMembershipStart).val(m.memberShipStartDate);
                $(s.updateMemberAddress).val(m.memberaddress);
                // show plain number without +91 if stored that way
                if (m.memberMobileNumber) {
                    $(s.updateMobileNumber).val(m.memberMobileNumber.replace(/^\+91\s?/, ""));
                }
                const minDt = m.memberShipEndDate ? new tempusDominus.DateTime(m.memberShipEndDate) : new Date();
                this.updateEndDp = new tempusDominus.TempusDominus($(s.updateMembershipEnd)[0], {
                    localization: { format: "yyyy-MM-dd" },
                    useCurrent: false,
                    restrictions: { minDate: minDt },
                    display: { components: { calendar:true, date:true, month:true, year:true } }
                });
                if (m.memberShipEndDate) {
                    this.updateEndDp.dates.setValue(new tempusDominus.DateTime(m.memberShipEndDate));
                }
                this.showLoader(false);
                $(s.updateMemberModal).modal("show");
            },
            error: () => {
                this.showLoader(false);
                Swal.fire({ icon:"error", title:"Error", text:"Failed to fetch Member details.", timer:2000, showConfirmButton:false });
            }
        });
    };

    this.cleanupUpdateModal = function () {
        if (this.updateEndDp && this.updateEndDp.dispose) {
            this.updateEndDp.dispose();
            this.updateEndDp = null;
        }
        $(this.selectors.updateMemberModal).find("form")[0].reset();
         $("#update_member_name_error, \
      #update_member_email_error, \
      #update_member_address_error, \
      #update_member_work_status_error, \
      #update_mobile_number_error, \
      #update_membership_end_date_error").text("");
    };

    // ---------- 9️⃣  View Profile ----------
   this.openProfile = function (e) {
    const s = this.selectors;
    const memberId = $(e.currentTarget).data("id");
    this.showLoader(true);

    $.ajax({
        url: `http://localhost:8080/LibraryManagementSystem/Members/getMemberById/${memberId}`,
        method: "GET",
        dataType: "json",
        success: (res) => {
            const m = res.object;
            const firstLetter = (m.memberName || "?").charAt(0).toUpperCase();
            const colors = ["#4f46e5", "#16a34a", "#db2777", "#f97316", "#0ea5e9"];
            const bgColor = colors[firstLetter.charCodeAt(0) % colors.length];

            $(s.profileAvatar).text(firstLetter).css("background-color", bgColor);
            $(s.profileName).text(m.memberName || "N/A");
            $(s.profileStatus).text(`Status: ${m.memberShipStatus || "N/A"}`);
            $(s.profileEmail).text(m.memberEmail || "N/A");
            $(s.profileMobile).text(m.memberMobileNumber || "N/A");
            $(s.profileWork).text(m.memberWorkStatus || "N/A");

            const start = m.memberShipStartDate ? `Start: ${m.memberShipStartDate}` : "";
            const end   = m.memberShipEndDate   ? ` | End: ${m.memberShipEndDate}`   : "";
            $(s.profileMembership).text(`${start}${end}`);
            $(s.profileAddress).text(m.memberaddress || "N/A");

            // show modal immediately after filling basic details
            this.showLoader(false);
            $(s.viewMemberModal).modal("show");

            // ---- fetch favourite books asynchronously ----
            $(s.profileBooks).empty().html('<span class="text-muted">Loading…</span>');
            $(s.favBooksSection).hide();

            $.ajax({
                url: `http://localhost:8080/LibraryManagementSystem/RentalTransactions/getTop3FavoriteAuthorsBooks?memberId=${memberId}`,
                method: "GET",
                dataType: "json",
                success: (books) => {
                    const list = Array.isArray(books.object) ? books.object : [];
                    if (list.length) {
                        $(s.profileBooks).html(
                            list.map(b => `<span class="text-dark me-1">${b.title}</span>`).join("")
                        );
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
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch Member details.",
                timer: 2000,
                showConfirmButton: false
            });
        }
    });
};

    // ---------- 🔟  Reset filters ----------
    this.resetFilters = function () {
        $("#member_length").val("10");
        $("#member_filter_type").val("all");
        $("#member_filter_status").val("all");
        $("#member_filter_value").val("");

        if ($.fn.DataTable.isDataTable(this.selectors.userTable)) {
            $(this.selectors.userTable).DataTable().clear().destroy();
            $(this.selectors.userTable).hide();
        }

        this.toggleFilterInput();
    };
};

// ----------  Create and Init ----------
const userManagement = new UserManagement();
userManagement.init();
}
