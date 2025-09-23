// =====================  User Management  =====================
const UserManagement = function () {
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
    memberWorkStatus: "#member_work_status",
    memberAddress: "#member_address",
    mobileNumber: "#mobile_number",
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
    updateMembershipStart : "#update_membership_start_date",
    updateMemberStatus : "#update_member_status",
    updateMembershipEnd: "#update_membership_end_date",
    updateMemberBtn: "#update_member_btn",
    updateCancelBtn: "#update_cancel_btn",

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
    name: "^[A-Za-z0-9\\s]{3,50}$",
    address: "^[A-Za-z0-9 ,\\.\\-]{3,100}$",
    mobile: "^[6-9][0-9]{4}[-][0-9]{5}$",
    // email will use built-in email rule
    email:"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+[.][A-Za-z]{2,}$",
    dateISO: true
  };

  // ---------- Initialization ----------
  this.init = function () {
    // init validation
    this.initValidation();

    // init widgets, masks, pickers
    this.initUI();

    // bind events
    this.bindEvents();

    // initial filter toggle
    this.toggleFilterInput();
  };

  // ---------- init UI helpers ----------
  this.initUI = function () {
    const s = this.selectors;
    // input masks
    if ($.fn.inputmask) {
      $(s.mobileNumber + ", " + s.updateMobileNumber).inputmask("99999-99999");
      $(s.membershipEndDate + ", " + s.updateMembershipEnd + ", " + s.membershipEndDateStatus).inputmask("9999-99-99");
    }

    // TempusDominus datepickers (guarded in case library not loaded)
    try {
      this.statusEndDp = new tempusDominus.TempusDominus(
        document.getElementById("membership_end_date_status"),
        {
          localization: { format: "yyyy-MM-dd" },
          restrictions: { minDate: new tempusDominus.DateTime(new Date()) },
          display: { components: { calendar: true, date: true, month: true, year: true } }
        }
      );

      // add end date picker (for add form)
      if ($(this.selectors.membershipEndDate).length) {
        this.addEndDp = new tempusDominus.TempusDominus($(this.selectors.membershipEndDate)[0], {
          localization: { format: "yyyy-MM-dd" },
          restrictions: { minDate: new tempusDominus.DateTime(new Date()) },
          display: { components: { calendar: true, date: true, month: true, year: true } }
        });
      }
    } catch (err) {
      // tempusDominus might not be available in some contexts — ignore safely.
      // console.warn("TempusDominus not initialized:", err);
    }
  };

  // ---------- Validation (single global pattern method + form configs) ----------
  this.initValidation = function () {
    const s = this.selectors;

    // single global pattern validator (only once)
    if (!jQuery.validator || !jQuery.validator.addMethod) {
      console.warn("jQuery Validate plugin not loaded.");
      return;
    }

    jQuery.validator.addMethod(
      "pattern",
      function (value, element, param) {
        // param can be a string (regex source) or a RegExp
        const re = param instanceof RegExp ? param : new RegExp(param);
        return this.optional(element) || re.test(value);
      },
      "Invalid format."
    );

    // Add form validation — keys MUST match the form field `name` attributes
    if ($(s.addForm).length) {
      $(s.addForm).validate({
        rules: {
          member_name: { required: true, pattern: this.patterns.name },
          member_email: { required: true, pattern: this.patterns.email },
          member_work_status: { required: true },
          mobile_number: { required: true, pattern: this.patterns.mobile },
          membership_end_date: { required: true, dateISO: true },
          member_address: { required: true, pattern: this.patterns.address }
        },
        messages: {
          member_name: { required: "Please enter name", pattern: "Only letters/numbers (3-50 chars)" },
          member_email: { required: "Please enter email", pattern: "Enter a valid email" },
          member_work_status: { required: "Please select status" },
          mobile_number: { required: "Please enter mobile number", pattern: "Enter a valid 10-digit number" },
          membership_end_date: { required: "Please select end date", dateISO: "Use YYYY-MM-DD" },
          member_address: { required: "Please enter address", pattern: "Only letters, numbers and ,.- allowed" }
        },
        errorPlacement: function (error, element) {
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
        rules: {
          update_member_name: { required: true, pattern: this.patterns.name },
          update_member_email: { required: true, email: true },
          update_member_work_status: { required: true },
          update_mobile_number: { required: true, pattern: this.patterns.mobile },
          update_membership_end_date: { required: true, dateISO: true },
          update_member_address: { required: true, pattern: this.patterns.address }
        },
        messages: {
          update_member_name: { required: "Please enter name", pattern: "Only letters/numbers (3–50 chars)" },
          update_member_email: { required: "Please enter email", email: "Enter a valid email" },
          update_member_work_status: { required: "Please select status" },
          update_mobile_number: { required: "Please enter mobile number", pattern: "Enter a valid 10-digit number" },
          update_membership_end_date: { required: "Please select end date", dateISO: "Use YYYY-MM-DD" },
          update_member_address: { required: "Please enter address", pattern: "Only letters, numbers and ,.- allowed" }
        },
        errorPlacement: (error, element) => error.insertAfter(element),
        // highlight: el => $(el).addClass("is-invalid"),
        // unhighlight: el => $(el).removeClass("is-invalid")
      });
    }
  };

  // ---------- Bind DOM events ----------
  this.bindEvents = function () {
    const s = this.selectors;

    // Filters / table
    $(document).on("click", s.applyFiltersBtn, () => this.renderUserTable());
    $(document).on("click", s.resetFiltersBtn, () => this.resetFilters());
    $(document).on("change", s.filterType, this.toggleFilterInput.bind(this));
    $(document).on("input", s.filterValue, this.changeFilterInput.bind(this));
    $(document).on("change", s.filters, this.toggleFilters.bind(this));

    // Add form buttons
    $(document).on("click", s.memberAddBtn, (e) => { e.preventDefault(); this.addMember(); });
    $(document).on("click", s.memberCancelBtn, (e) => { e.preventDefault(); this.resetForm(s.addForm); });

    // Update form buttons
    $(document).on("click", s.updateMemberBtn, (e) => { e.preventDefault(); this.updateMember(); });
    $(document).on("click", s.updateCancelBtn, (e) => { e.preventDefault(); this.resetForm(s.updateForm); });

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
  this.showLoader = function (show) { show ? $(this.selectors.loader).show() : $(this.selectors.loader).hide(); };

  // ---------- Reset a form and its validation state ----------
  this.resetForm = function (formSelector) {
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
  this.resetStatusModal = function () {
    const s = this.selectors;
    $(s.membershipEndDateStatus).val("");
    $(s.membershipStatus).val("");
    $("#end_date_error, #status_error").text("");
  };

  // ---------- Toggle / filters helpers ----------
  this.changeFilterInput = function () {
    if ($.fn.DataTable.isDataTable(this.selectors.userTable)) {
      $(this.selectors.userTable).DataTable().clear().destroy();
      $(this.selectors.userTable).hide();
      $(this.selectors.lmFilterChanged).css("display","block")
    }
  };

  this.toggleFilters = function () {
    this.changeFilterInput();
  };

  this.toggleFilterInput = function () {
    const s = this.selectors;
    const selected = $(s.filterType).val();
    if (selected && selected.toLowerCase() !== "all") {
      $(s.filterValue).prop("disabled", false);
    } else {
      $(s.filterValue).prop("disabled", true).val("");
    }
    this.changeFilterInput();
  };

  // ---------- Add Member (uses jQuery Validate .valid()) ----------
  this.addMember = function () {
    const s = this.selectors;
    // ensure form is valid
    if (!$(s.addForm).valid()) return;

    // format mobile (digits only)
    const localNo = $(s.addForm + " [name='mobile_number']").val().replace(/\D/g, "");

    // prepare payload
    const payload = {
      memberName: $(s.addForm + " [name='member_name']").val().trim(),
      memberShipEndDate: $(s.addForm + " [name='membership_end_date']").val().trim(),
      memberaddress: $(s.addForm + " [name='member_address']").val().trim(),
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
        Swal.fire({ icon: "success", title: "Member Added", text: "✅ " + res.object, timer: 2000, showConfirmButton: false })
          .then(() => $(s.applyFiltersBtn).click());
      },
      error: (xhr) => {
        this.showLoader(false);
        const msg = xhr.responseJSON?.message || "Something went wrong.";
        Swal.fire({ icon: "error", title: "Oops...", text: "❌ " + msg, timer: 2000, showConfirmButton: false });
      }
    });
  };

  // ---------- Update Member ----------
  this.updateMember = function () {
    const s = this.selectors;
    if (!$(s.updateForm).valid()) return;

    const mobileVal = $(s.updateMobileNumber).val() || "";
    const localNo   = mobileVal.replace(/\D/g, "");
    const payload = {
      memberId: $(s.updateMemberId).val().trim(),
      memberName: $(s.updateMemberName).val().trim(),
      memberShipEndDate: $(s.updateMembershipEnd).val().trim(),
      memberaddress: $(s.updateMemberAddress).val().trim(),
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
        const msg = xhr.responseJSON?.message || "Something went wrong.";
        Swal.fire({ icon: "error", title: "Oops...", text: "❌ " + msg, timer: 2000, showConfirmButton: false });
      }
    });
  };

  // ---------- DataTable render (unchanged logic from your original) ----------
  this.renderUserTable = function () {
    const s = this.selectors;
    this.showLoader(true);
    $(s.userTable).hide();
    $(this.selectors.lmFilterChanged).css("display","none")
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
          data: res.object?.data || [],
          sort: false,
          destroy: true,
          dom: '<"top"p>t<"bottom"ip>',
          lengthMenu: [10, 25, 50, 100],
          language: { emptyTable: "No data found" },
          columns: [
            { title: "S.No", data: null, orderable: false, searchable: false, render: (d, t, row, meta) => meta.row + 1 },
            { title: "Member ID", data: "memberId",
              render:(d,t,r) => `#${r.memberId}`
             },
            { title: "Member Name", data: "memberName" },
            { title: "MemberShip Start Date", data: "memberShipStartDate" },
            { title: "MemberShip End Date", data: "memberShipEndDate" },
            {
              title: "MemberShip Status", data: "memberShipStatus",
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
              className:"text-center",
              width:"50px !important"
            },
            { title: "Work Status", data: "memberWorkStatus" },
            {
              title: "Actions", data: null, orderable: false,
              render: (d, t, row) => `
                <button class="btn btn-md me-2 mb-2 update-member" data-bs-toggle="tooltip" data-bs-target="${s.updateMemberModal}" data-id="${row.memberId}" title="Edit">
                  <i class="fa-solid fa-pen-to-square text-grey" ></i>
                </button>
                <button class="btn btn-md  me-2 mb-2 view-member" data-bs-toggle="tooltip" data-bs-target="${s.viewMemberModal}" data-id="${row.memberId}" title="View Profile">
                  <i class="fa-solid fa-eye" btn-dark></i>
                </button>`
            }
          ],
          drawCallback: function () {
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

  // ---------- Change member status (modal) ----------
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
        if (this.statusEndDp && endDate) this.statusEndDp.dates.setValue(new tempusDominus.DateTime(endDate));
        $(s.membershipStatus).val(m.membershipStatus || m.memberShipStatus || "");
        $(s.membershipModal).data("member-id", memberId).modal("show");
      },
      error: () => {
        this.showLoader(false);
        Swal.fire({ icon: "error", title: "Error", text: "Unable to fetch member details." });
      }
    });
  };

  // ---------- Save membership update ----------
  this.saveMembershipUpdate = function () {
    const s = this.selectors;
    const memberId = $(s.membershipModal).data("member-id");
    const endDate = $(s.membershipEndDateStatus).val().trim();
    const status = $(s.membershipStatus).val();

    if (!endDate) { $("#end_date_error").text("End date required."); return; } else $("#end_date_error").text("");
    if (!status) { $("#status_error").text("Select status."); return; } else $("#status_error").text("");

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

  // ---------- Open update modal and populate ----------
  this.openUpdateModal = function (e) {
    const s = this.selectors;
    const memberId = $(e.currentTarget).data("id");
    this.showLoader(true);

    $.ajax({
      url: `http://localhost:8080/LibraryManagementSystem/Members/getMemberById/${memberId}`,
      method: "GET",
      dataType: "json",
      success: (res) => {
        const m = res.object || {};
        $(s.updateMemberId).val(m.memberId || "");
        $(s.updateMemberName).val(m.memberName || "");
        $(s.updateMemberEmail).val(m.memberEmail || "");
        $(s.updateMemberWorkStatus).val(m.memberWorkStatus || "");
        $(s.updateMemberStatus).val(m.memberShipStatus || "");
        $(s.updateMembershipStart).val(m.memberShipStartDate || "");
        $(s.updateMemberAddress).val(m.memberaddress || "");
        if (m.memberMobileNumber) $(s.updateMobileNumber).val(m.memberMobileNumber.replace(/^\+91\s?/, ""));
        const minDt = m.memberShipEndDate ? new tempusDominus.DateTime(m.memberShipEndDate) : new Date();
        // init update datepicker guard
        try {
          this.updateEndDp = new tempusDominus.TempusDominus($(s.updateMembershipEnd)[0], {
            localization: { format: "yyyy-MM-dd" },
            useCurrent: false,
            restrictions: { minDate: minDt },
            display: { components: { calendar: true, date: true, month: true, year: true } }
          });
          if (m.memberShipEndDate) this.updateEndDp.dates.setValue(new tempusDominus.DateTime(m.memberShipEndDate));
        } catch (err) {
          // ignore if tempus not available
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
  this.cleanupUpdateModal = function () {
    if (this.updateEndDp && this.updateEndDp.dispose) {
      try { this.updateEndDp.dispose(); } catch (err) { /* ignore */ }
      this.updateEndDp = null;
    }
    // reset update form if exists
    this.resetForm(this.selectors.updateForm);
  };

  // ---------- View profile ----------
  this.openProfile = function (e) {
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
        $(s.profileStatus).text(`Status: ${m.memberShipStatus || "N/A"}`);
        $(s.profileEmail).text(m.memberEmail || "N/A");
        $(s.profileMobile).text(m.memberMobileNumber || "N/A");
        $(s.profileWork).text(m.memberWorkStatus || "N/A");
        const start = m.memberShipStartDate ? `Start: ${m.memberShipStartDate}` : "";
        const end = m.memberShipEndDate ? ` | End: ${m.memberShipEndDate}` : "";
        $(s.profileMembership).text(`${start}${end}`);
        $(s.profileAddress).text(m.memberaddress || "N/A");

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
              $(s.profileBooks).html(list.map(b => `<span class="text-dark me-1">${b.title}</span>`).join(""));
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

// Create & init
const userManagement = new UserManagement();
$(document).ready(() => userManagement.init());
