const Penalty = function () {
  // ------------------ centralized selectors ------------------
  this.selectors = {
    loader: "#loader",                 // unchanged
    userTable: "#user_table",          // unchanged
    lmPenaltyApplyFilters: "#lm_penalty_apply_filters",
    lmPenaltyResetFilters: "#lm_penalty_reset_filters",
    lmPenaltyAddBtn: "#lm_penalty_add_btn",
    lmPenaltyForm: "#lm_penalty_add_form",
    lmPenaltyTransactionId: "#lm_penalty_transactionid",
    lmPenaltyAmount: "#lm_penalty_amount",
    lmPenaltyReason: "#lm_penalty_reason",
    lmPenaltyPayBtn: "#lm_penalty_pay_btn",
    lmPenaltyPayModal: "#lm_penalty_pay_modal",
    lmPenaltyPayPenaltyId: "#lm_penalty_pay_penaltyid",
    lmPenaltyPayAmount: "#lm_penalty_pay_amount",
    lmPenaltyLength: "#lm_penalty_length",
    lmPenaltyStatus: "#lm_penalty_filter_status",
    lmPenaltyFilterType: "#lm_penalty_filter_type",
    lmPenaltyFilterValue: "#lm_penalty_filter_value",
    lmPenaltyFilters: ".lm_penalty_filters",
    lmPenaltyReset: "#lm_penalty_reset",
    lmPenaltyModal: "#lm_penalty_modal",
    lmFilterChanged: "#lm_filter_changed",
  };

  // ------------------ public methods ------------------
  this.init = function () {
    const s = this.selectors;
    this.validateForm();
    this.penaltyFilter();
    $(document)
      .off("click", s.lmPenaltyApplyFilters)
      .on("click", s.lmPenaltyApplyFilters, this.applyFilters.bind(this));

    $(document)
      .off("click", s.lmPenaltyResetFilters)
      .on("click", s.lmPenaltyResetFilters, this.resetFilters.bind(this));

    $(document)
      .off("click", s.lmPenaltyAddBtn)
      .on("click", s.lmPenaltyAddBtn, (e) => {
        e.preventDefault();
        this.addPenalty();
      });

    $(document)
      .off("click", s.lmPenaltyReset)
      .on("click", s.lmPenaltyReset, this.resetPenaltyForm.bind(this));

    $(document)
      .off("click", ".lm_penalty-pay")
      .on("click", ".lm_penalty-pay", this.openPayModal.bind(this));

    $(document)
      .off("click", s.lmPenaltyPayBtn)
      .on("click", s.lmPenaltyPayBtn, this.payPenalty.bind(this));

    $(document)
      .off("change", s.lmPenaltyFilterType)
      .on("change", s.lmPenaltyFilterType, this.toggleFilterInput.bind(this));

    $(document)
      .off("change", s.lmPenaltyFilters)
      .on("change", s.lmPenaltyFilters, this.toggleFilters.bind(this));

    $(document)
      .off("input", s.lmPenaltyFilterValue)
      .on("input", s.lmPenaltyFilterValue, this.changeFilterValue.bind(this));

    // Reset form on modal close
    $(s.lmPenaltyModal).on("hidden.bs.modal", () => {
      this.resetPenaltyForm();
    });

    this.toggleFilterInput();
  };

  // ------------------ Filter / DataTable logic ------------------
  this.changeFilterValue = function () {
    const s = this.selectors;
    if ($.fn.DataTable.isDataTable(s.userTable)) {
      $(s.userTable).DataTable().clear().destroy();
      $(s.userTable).hide();
       $(this.selectors.lmFilterChanged).css("display","block");
       $(this.selectors.lmPenaltyResetFilters).css("display","block");

    }
   
  };

  this.toggleFilters = function () {
    const s = this.selectors;
    if ($.fn.DataTable.isDataTable(s.userTable)) {
      $(s.userTable).DataTable().clear().destroy();
      $(s.userTable).hide();
      $(this.selectors.lmFilterChanged).css("display","block")
      $(this.selectors.lmPenaltyResetFilters).css("display","block")
    }
    
  };

  this.penaltyFilter = function () {
    const input = $("#lm_penalty_filter_value");
    const clear = $("#clear_filter_value");

    // Show/hide the × icon as user types
    input.on("input", function () {
      if (this.value.trim().length) {
        clear.show();
      } else {
        clear.hide();
      }
    });

    // Click the × to clear and hide
    clear.on("click", function () {
      input.val("").trigger("input"); // trigger to hide icon
      input.focus();                  // optional: keep focus in field
    });
  };

  this.toggleFilterInput = function () {
    const s = this.selectors;
    const selected = $(s.lmPenaltyFilterType).val();
    if ($.fn.DataTable.isDataTable(s.userTable)) {
      $(s.userTable).DataTable().clear().destroy();
      $(s.userTable).hide();
      $(this.selectors.lmFilterChanged).css("display","block")
      $(this.selectors.lmPenaltyResetFilters).css("display","block")
    }
    
    if (selected && selected.toLowerCase() !== "all") {
      $(s.lmPenaltyFilterValue).prop("disabled", false);
    } else {
      $(s.lmPenaltyFilterValue).prop("disabled", true).val("");
    }
  };

  this.resetFilters = function () {
    const s = this.selectors;
    $(s.lmPenaltyFilterType).val("all");
    $(s.lmPenaltyFilterValue).val("");
    $(s.lmPenaltyStatus).val("all");
    $(s.lmPenaltyLength).val("10");

    if ($.fn.DataTable.isDataTable(s.userTable)) {
      $(s.userTable).DataTable().clear().destroy();
      $(s.userTable).hide();
    }
    this.toggleFilterInput();
     $(this.selectors.lmFilterChanged).css("display","none")
  };

  this.applyFilters = function () {
    const s = this.selectors;
    $(s.loader).show();
    $(s.userTable).hide();
    $(this.selectors.lmFilterChanged).css("display","none")
    $(this.selectors.lmPenaltyResetFilters).css("display","none")
    let length = $(s.lmPenaltyLength).val();
    let status = $(s.lmPenaltyStatus).val();
    let searchColumn = $(s.lmPenaltyFilterType).val();
    let searchValue = $(s.lmPenaltyFilterValue).val().trim();
    let asc = "asc";

    let params = { start: 0, length: length, order: asc };
    if ((status === "paid" || status === "pending") && searchValue !== "") {
      params = { start: 0, length, order: asc, paymentStatus: status, searchColumn, searchValue };
    } else if (status === "paid" || status === "pending") {
      params = { start: 0, length, order: asc, paymentStatus: status };
    } else if (searchValue !== "") {
      params = { start: 0, length, order: asc, searchColumn, searchValue };
    }

    $.ajax({
      url: "http://localhost:8080/LibraryManagementSystem/Penalty/getPenalty",
      type: "GET",
      data: params,
      dataType: "json",
      success: (res) => {
        if ($.fn.DataTable.isDataTable(s.userTable)) $(s.userTable).DataTable().destroy();
        const rows = res.object && Array.isArray(res.object.data) ? res.object.data : [];
        $(s.userTable).DataTable({
          data: rows,
          sort: false,
          destroy: true,
          dom: '<"top"p>t<"bottom"ip>',
          lengthMenu: [10, 25, 50, 100],
          language: { emptyTable: "No data found" },
          columns: this.columnsConfig(true),
          drawCallback: function () {
            const tipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            tipEls.forEach((el) => {
              if (!bootstrap.Tooltip.getInstance(el)) new bootstrap.Tooltip(el);
            });
          },
        });
        $(s.loader).hide();
        $(s.userTable).show();
      },
      error: () => {
        if ($.fn.DataTable.isDataTable(s.userTable)) $(s.userTable).DataTable().destroy();
        $(s.userTable).DataTable({
          data: [],
          sort: false,
          destroy: true,
          dom: '<"top"p>t<"bottom"ip>',
          language: { emptyTable: "No data found" },
        });
        $(s.loader).hide();
        $(s.userTable).show();
      },
    });
  };

  // ------------------ Form Reset ------------------
  this.resetPenaltyForm = () => {
    const s = this.selectors;
    const $form = $(s.lmPenaltyForm);
    $form.trigger("reset");
    if ($form.length) {
      if ($form.data("validator")) $form.validate().resetForm();
    }
  };

  // ------------------ Form Validation ------------------
  this.validateForm = () => {
    const s = this.selectors;
    const $form = $(s.lmPenaltyForm);

    if ($form.data("validator")) {
      $form.removeData("validator").removeData("unobtrusiveValidation");
    }

    jQuery.validator.addMethod(
      "pattern",
      function (value, element, param) {
        const re = new RegExp(param);
        return this.optional(element) || re.test(value);
      },
      "Invalid format."
    );

    $form.validate({
      ignore: [],
      onkeyup: false,
      rules: {
        lm_penalty_transactionid: { required: true, pattern: /^[1-9][0-9]*$/ },
        lm_penalty_amount: { required: true, pattern: /^[1-9][0-9]*$/ },
        lm_penalty_reason: { required: true, pattern: /^[a-zA-Z ]+$/, minlength: 5 },
      },
      messages: {
        lm_penalty_transactionid: { required: "Transaction Id is required", pattern: "Transaction Id must be +ve Number" },
        lm_penalty_amount: { required: "Penalty amount is required", pattern: "Penalty amount must be +ve Number" },
        lm_penalty_reason: { required: "Penalty reason is required", pattern: "Penalty reason Only Letters", minlength: "Minimum 5 characters" },
      },
    });
  };

  // ------------------ CRUD ------------------
  this.addPenalty = function () {
    if ($(this.selectors.lmPenaltyForm).valid()) {
      // ✅ Show SweetAlert confirmation
      Swal.fire({
        title: "Add this penalty?",
        text: "Please confirm the penalty details before saving.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Add",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
            const s = this.selectors;
            $(s.loader).show();
            console.log("HI");
            
            let params = {
              TransactionId: parseInt($(s.lmPenaltyTransactionId).val().trim()),
              amount: parseInt($(s.lmPenaltyAmount).val().trim()),
              reason: $(s.lmPenaltyReason).val().trim(),
            };

            $.ajax({
              url: "http://localhost:8080/LibraryManagementSystem/Penalty/add",
              type: "POST",
              data: params,
              success: () => {
                $(s.loader).hide();
                $(s.lmPenaltyModal).modal("hide");
                Swal.fire({
                  icon: "success",
                  title: "Added",
                  text: "✅ Penalty Added Successfully",
                  showConfirmButton: false,
                  timer: 2000,
                }).then(() => $(s.lmPenaltyApplyFilters).click());
                this.resetPenaltyForm();
              },
              error: (xhr) => this.showError(xhr),
            });
        }
      });
    }
  };

  this.openPayModal = function (e) {
    const s = this.selectors;
    const btn = $(e.currentTarget);
    $(s.lmPenaltyPayPenaltyId).val(btn.data("id"));
    $(s.lmPenaltyPayAmount).val(btn.data("amount"));
    $(s.lmPenaltyPayModal).modal("show");
  };

  this.payPenalty = function () {
    Swal.fire({
        title: "Pay this penalty?",
        text: "Please confirm the penalty details before Paying.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Pay",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          const s = this.selectors;
          $(s.loader).show();

          let params = {
            penaltyId: parseInt($(s.lmPenaltyPayPenaltyId).val()),
            amount: parseInt($(s.lmPenaltyPayAmount).val()),
          };

          $.ajax({
            url: "http://localhost:8080/LibraryManagementSystem/Penalty/pay",
            method: "POST",
            data: params,
            success: (response) => {
              $(s.loader).hide();
              $(s.lmPenaltyPayModal).modal("hide");
              Swal.fire({
                icon: "success",
                title: "Paid",
                text: "✅ " + response.object,
                showConfirmButton: false,
                timer: 2000,
              }).then(() => $(s.lmPenaltyApplyFilters).click());
            },
            error: (xhr) => this.showError(xhr),
          });
        }
    });
  };

  // ------------------ Error handling ------------------
  this.showError = function (xhr) {
    const s = this.selectors;
    let message = "Something went wrong.";

    if (xhr.responseJSON) {
      if (xhr.responseJSON.object) {
        message =
          typeof xhr.responseJSON.object === "string"
            ? xhr.responseJSON.object
            : Object.values(xhr.responseJSON.object).join("\n");
      } else if (xhr.responseJSON.message) {
        message = xhr.responseJSON.message;
      }
    }

    $(s.loader).hide();
    Swal.fire({ icon: "error", title: "Oops...", text: "❌ " + message, showConfirmButton: true });
  };

  // ------------------ DataTable Columns ------------------
  this.columnsConfig = function (withActions) {
    const baseCols = [
      { title: "S.No", data: null, orderable: false, searchable: false, render: (data, type, row, meta) => meta.row + 1 },
      { title: "ID", data: "penaltyId",
        render:(d,t,r) => `#${r.penaltyId}`
       },
      { title: "Transaction ID", data: "transactionId",
        render:(d,t,r) => `#${r.transactionId}`
       },
      { title: "Member ID", data: "memberId",
        render:(d,t,r) => `#${r.memberId}`
       },
      { title: "Book ID", data: "bookId",
        render:(d,t,r) => `#${r.bookId}`
       },
      { title: "Amount", data: "amount" },
      { title: "Penalty Added Flag", data: "penaltyAddedFlag" },
      { title: "Penalty Amount", data: "penaltyAmount" },
      { title: "Reason", data: "reason" },
      { title: "Status", data: "status", render: (data, type, row) =>{

            const bgColor = row.status === "Paid" ? "#d4edda" : "#f8d7da"; // light green / light red
            const textColor = row.status === "Paid" ? "#155724" : "#721c24"; // dark text for contrast
                  return `<span class=" text-center  px-2" style="background-color:${bgColor};color:${textColor};
                        display:inline-block;
                        border-radius: 12px; 
                        padding: 2px 0px; 
                        width: 100px;
                        font-weight: 500;
                        ">${row.status}</span>`  
          },
      },
      { title: "Payment Date", data: "paymentDate" },
    ];

    if (withActions) {
      baseCols.push({
        title: "Action",
        data: null,
        orderable: false,
        render: (data, type, row) =>
          row.status === "Pending"
            ? `<button class="btn btn-sm lm_penalty-pay text-center"
                  data-bs-toggle="tooltip" data-bs-placement="top"
                  style="background-color:#1e3a8a;color:#fff; width:80px;"
                  title="Pay Penalty" data-bs-target="#lm_penalty_pay_modal"
                  data-id="${row.penaltyId}" data-amount="${row.amount}">
                  Pay Now
              </button>`
            : `<span data-bs-toggle="tooltip" data-bs-placement="top" class="text-center" title="Already Paid">
                  <button class="btn btn-md  border-0" style="width:80px;" disabled>
                    <i class="fa-solid fa-dollar-sign text-grey" ></i>
                  </button>
              </span>`,
          
      });
    }

    return baseCols;
  };
};

// ------------------ create and initialize ------------------
const penalty = new Penalty();
penalty.init();
