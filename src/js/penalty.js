if (typeof window.Penalty === "undefined") {
  window.Penalty = function () {
    // ------------------ selectors in one place ------------------
    this.selectors = {
      loader: "#loader",
      userTable: "#user_table",
      applyFilters: "#apply_penalty_filters",
      resetFilters: "#reset_penalty_filters",
      addBtn: "#penalty_add_btn",
      transactionId: "#penalty_transactionid",
      amount: "#penalty_amount",
      reason: "#penalty_reason",
      payBtn: "#penalty_pay_btn",
      payModal: "#penalty_pay_modal",
      payPenaltyId: "#penalty_pay_penaltyid",
      payAmount: "#penalty_pay_amount",
      length: "#penalty_length",
      status: "#penalty_filter_status",
      filterType: "#penalty_filter_type",
      filterValue: "#penalty_filter_value",
      filters: ".filters",
      reset: "#reset"
    };

    // ------------------ public methods ------------------
    this.init = function () {
      const s = this.selectors;
      this.validateForm();

      $(document)
        .off("click", s.applyFilters)
        .on("click", s.applyFilters, this.applyFilters.bind(this));

      $(document)
        .off("click", s.resetFilters)
        .on("click", s.resetFilters, this.resetFilters.bind(this));

      $(document)
        .off("click", s.addBtn)
        .on("click", s.addBtn, (e)=>{
            e.preventDefault();
            if($("#penalty_add_form").valid()){
                this.addPenalty();
            }
        });

        $(document)
        .off("click", s.reset)
        .on("click", s.reset, this.resetPenaltyForm.bind(this));
      
      $(document)
        .off("click", ".penalty-pay")
        .on("click", ".penalty-pay", this.openPayModal.bind(this));

      $(document)
        .off("click", s.payBtn)
        .on("click", s.payBtn, this.payPenalty.bind(this));

      $(document)
        .off("change", s.filterType)
        .on("change", s.filterType, this.toggleFilterInput.bind(this));

      $(document)
        .off("change", s.filters)
        .on("change", s.filters, this.toggleFilters.bind(this));

      $(document)
        .off("input", s.filterValue)
        .on("input", s.filterValue, this.changeFilterValue.bind(this));

      this.toggleFilterInput();
    };

    this.changeFilterValue = function () {
      const s = this.selectors;
      if ($.fn.DataTable.isDataTable(s.userTable)) {
        $(s.userTable).DataTable().clear().destroy();
        $(s.userTable).hide();
      }
    };

    this.toggleFilters = function () {
      const s = this.selectors;
      if ($.fn.DataTable.isDataTable(s.userTable)) {
        $(s.userTable).DataTable().clear().destroy();
        $(s.userTable).hide();
      }
    };

    this.toggleFilterInput = function () {
      const s = this.selectors;
      const selected = $(s.filterType).val();
      if ($.fn.DataTable.isDataTable(s.userTable)) {
        $(s.userTable).DataTable().clear().destroy();
        $(s.userTable).hide();
      }
      // enable input if user picked anything other than "all"
      if (selected && selected.toLowerCase() !== "all") {
        $(s.filterValue).prop("disabled", false);
      } else {
        $(s.filterValue).prop("disabled", true).val(""); // also clear value
      }
    };

    this.resetFilters = function () {
      const s = this.selectors;
      $(s.filterType).val("all");
      $(s.filterValue).val("");
      $(s.status).val("all");
      $(s.length).val("10");

      if ($.fn.DataTable.isDataTable(s.userTable)) {
        $(s.userTable).DataTable().clear().destroy();
        $(s.userTable).hide();
      }

      this.toggleFilterInput();
    };
    this.applyFilters = function () {
      const s = this.selectors;
      $(s.loader).show();
      $(s.userTable).hide();

      let length = $(s.length).val();
      let status = $(s.status).val();
      let searchColumn = $(s.filterType).val();
      let searchValue = $(s.filterValue).val().trim();
      let asc = "asc";
      console.log(status);
      let params = { start: 0, length: length, order: asc };

      if ((status === "paid" || status === "pending") && searchValue !== "") {
        params = {
          start: 0,
          length: length,
          order: asc,
          paymentStatus: status,
          searchColumn: searchColumn,
          searchValue: searchValue,
        };
      } else if (status === "paid" || status === "pending") {
        params = {
          start: 0,
          length: length,
          order: asc,
          paymentStatus: status,
        };
      } else if (searchValue !== "") {
        params = {
          start: 0,
          length: length,
          order: asc,
          searchColumn: searchColumn,
          searchValue: searchValue,
        };
      }

      $.ajax({
        url: "http://localhost:8080/LibraryManagementSystem/Penalty/getPenalty",
        type: "GET",
        data: params,
        dataType: "json",
        success: (res) => {
          if ($.fn.DataTable.isDataTable(s.userTable)) {
            $(s.userTable).DataTable().destroy();
          }
          const rows =
            res.object && Array.isArray(res.object.data) ? res.object.data : [];
          $(s.userTable).DataTable({
            data: rows,
            sort: false,
            destroy: true,
            dom: '<"top"lp>t<"bottom"ip>',
            lengthMenu: [10, 25, 50, 100],
            language: { emptyTable: "No data found" },
            columns: this.columnsConfig(true),
            drawCallback: function () {
              const tipEls = document.querySelectorAll(
                '[data-bs-toggle="tooltip"]'
              );
              tipEls.forEach((el) => {
                // avoid duplicates
                if (!bootstrap.Tooltip.getInstance(el)) {
                  new bootstrap.Tooltip(el);
                }
              });
            },
          });
          $(s.loader).hide();
          $(s.userTable).show();
        },
        error: () => {
          if ($.fn.DataTable.isDataTable(s.userTable)) {
            $(s.userTable).DataTable().destroy();
          }
          $(s.userTable).DataTable({
            data: [],
            sort: false,
            destroy: true,
            dom: '<"top"p>t<"bottom"ip>',
            language: { emptyTable: "No data found" },
            // columns: this.columnsConfig(false)
          });
          $(s.loader).hide();
          $(s.userTable).show();
        },
      });
    };

    this.resetPenaltyForm = () => {
    const $form = $("#penalty_add_form");
    if ($form.length) {                  // ensure it exists
        $form.trigger("reset");          // native form reset
        $form.validate().resetForm();    // clear validation errors
    } else {
        console.warn("#penalty_add_form not found in DOM");
    }
};
    this.validateForm = ()=> {
        jQuery.validator.addMethod(
            "pattern",                                      // name of the rule
            function (value, element, param) {               // validation callback
            // param will be the string you provide in rules, e.g. "^[1-9][0-9]*$"
            const re = new RegExp(param);
            // this.optional(element) → true if the field is empty and not required
            return this.optional(element) || re.test(value);
            },
            "Invalid format."                                // default message if you don’t override it
        );
         $("#penalty_add_form").validate({
            ignore: [], onkeyup: false,
            rules:{
                penalty_transactionid:{
                    required:true,
                    pattern:/^[1-9][0-9]*$/
                },
                penalty_amount:{
                    required:true,
                    pattern:/^[1-9][0-9]*$/
                },
                penalty_reason:{
                    required:true,
                    pattern:/^[a-zA-Z ]+$/,
                    minlength:5
                },
            },
            messages:{
                    penalty_transactionid:{
                    required:"Please Fill Transaction ID",
                    pattern:"Transaction ID only be Number"
                },
                penalty_amount:{
                    required:"Please Fill Penalty Amount",
                    pattern:"Penalty Amount only be Number"
                },
                penalty_reason:{
                    required:"Please Fill Penalty Reason",
                    pattern:"Penalty Reason Only be Letters",
                    minlength:5
                },
            }
        })
    }
    this.addPenalty = function () {
      const s = this.selectors;
     
      $(s.loader).show();
       
      let params = {
        TransactionId: parseInt($(s.transactionId).val().trim()),
        amount: parseInt($(s.amount).val().trim()),
        reason: $(s.reason).val().trim(),
      };

      $.ajax({
        url: "http://localhost:8080/LibraryManagementSystem/Penalty/add",
        type: "POST",
        data: params,
        success: () => {
          $(s.loader).hide();
          $("#penalty_modal").modal("hide");
          Swal.fire({
            icon: "success",
            title: "Added",
            text: "✅ Penalty Added Successfully",
            showConfirmButton: false,
            timer: 2000,
          }).then(() => $(s.applyFilters).click());
          $("#penalty_add_form")[0].reset();
          $("#penalty_add_form").validate().resetForm();
        },
        error: (xhr) => this.showError(xhr),
      });
    };

    this.openPayModal = function (e) {
      const s = this.selectors;
      const btn = $(e.currentTarget);
      $(s.payPenaltyId).val(btn.data("id"));
      $(s.payAmount).val(btn.data("amount"));
      $(s.payModal).modal("show");
    };

    this.payPenalty = function () {
      const s = this.selectors;
      $(s.loader).show();

      let params = {
        penaltyId: parseInt($(s.payPenaltyId).val()),
        amount: parseInt($(s.payAmount).val()),
      };

      $.ajax({
        url: "http://localhost:8080/LibraryManagementSystem/Penalty/pay",
        method: "POST",
        data: params,
        success: (response) => {
          $(s.loader).hide();
          $(s.payModal).modal("hide");
          Swal.fire({
            icon: "success",
            title: "Paid",
            text: "✅ " + response.object,
            showConfirmButton: false,
            timer: 2000,
          }).then(() => $(s.applyFilters).click());
        },
        error: (xhr) => this.showError(xhr),
      });
    };

    this.showError = function (xhr) {
      const s = this.selectors;
      let message = "Something went wrong.";

      if (xhr.responseJSON) {
        if (xhr.responseJSON.object) {
          if (typeof xhr.responseJSON.object === "string") {
            message = xhr.responseJSON.object;
          } else {
            message = Object.values(xhr.responseJSON.object).join("\n");
          }
        } else if (xhr.responseJSON.message) {
          message = xhr.responseJSON.message;
        }
      }
      $(s.loader).hide();
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "❌ " + message,
        showConfirmButton: true,
      });
    };

    this.columnsConfig = function (withActions) {
      const baseCols = [
        {
          title: "S.No",
          data: null, // no field from the data source
          orderable: false,
          searchable: false,
          render: (data, type, row, meta) => meta.row + 1, // row index + 1
        },
        { title: "Penalty ID", data: "penaltyId" },
        { title: "Transaction ID", data: "transactionId" },
        { title: "Member ID", data: "memberId" },
        { title: "Book ID", data: "bookId" },
        { title: "Amount", data: "amount" },
        { title: "Penalty Added Flag", data: "penaltyAddedFlag" },
        { title: "Penalty Amount", data: "penaltyAmount" },
        { title: "Reason", data: "reason" },
        {
          title: "Status",
          data: "status",
          render: (data, type, row) =>
            row.status === "Paid"
              ? `<div><p class="bg-success rounded-5 text-white">${row.status}</p></div>`
              : `<div><p class="bg-danger rounded-5 text-white">${row.status}</p></div>`,
        },
        { title: "Payment Date", data: "paymentDate" },
      ];

      if (withActions) {
        baseCols.push({
          title: "Actions",
          data: null,
          orderable: false,
          render: (data, type, row) => {
            if (row.status === "Pending") {
              return `
            <button class="btn btn-sm btn-warning me-2 mb-2 penalty-pay"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Pay Penalty"
                    data-bs-target="#penalty_pay_modal"
                    data-id="${row.penaltyId}"
                    data-amount="${row.amount}">
                <i class="fa-solid fa-indian-rupee-sign" style="color:#fff;"></i>
            </button>`;
            } else {
              return `
            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Already Paid" >
        <button class="btn btn-sm btn-dark me-2 mb-2" disabled>
            <i class="fa-solid fa-indian-rupee-sign" style="color:#fff;"></i>
        </button>
    </span>`;
            }
          },
        });
      }
      return baseCols;
    };
  };

  // ------------------ create and initialize ------------------
  $(document).ready(function () {
    const penalty = new Penalty();
    penalty.init();
  });
}
