const Penalty = function() {

    /**
     * 
     * Defining Selectors 
     * 
     */
    this.selectors = {
        loader: "#loader",
        userTable: "#user_table",
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

    /**
     * 
     * Declare functions and event
     * 
     */
    this.init = function() {
        const s = this.selectors;

        this.validateForm();
        this.penaltyFilter();

        $(s.lmPenaltyApplyFilters).on("click", this.applyFilters.bind(this));
        $(s.lmPenaltyResetFilters).on("click", this.resetFilters.bind(this));
        $(s.lmPenaltyAddBtn).on("click", this.addPenalty.bind(this));
        $(s.lmPenaltyReset).on("click", this.resetPenaltyForm.bind(this));
        $(s.lmPenaltyPayBtn).on("click", this.payPenalty.bind(this));
        $(s.lmPenaltyFilterType).on("change", this.toggleFilterInput.bind(this));
        $(s.lmPenaltyFilters).on("change", this.toggleFilters.bind(this));
        $(s.lmPenaltyFilterValue).on("input", this.changeFilterValue.bind(this));
        $(s.lmPenaltyModal).on("hidden.bs.modal", this.resetPenaltyForm.bind(this));

        this.toggleFilterInput();

        $(document).off("click", ".lm_penalty_pay").on("click", ".lm_penalty_pay", this.openPayModal.bind(this));
    };

    /**
     * 
     * DataTable filter function
     * 
     */
    this.changeFilterValue = function() {
        const s = this.selectors;
        if ($.fn.DataTable.isDataTable(s.userTable)) {
            $(s.userTable).DataTable().clear().destroy();
            $(s.userTable).hide();
            $(this.selectors.lmFilterChanged).css("display", "block");
            $(this.selectors.lmPenaltyResetFilters).css("display", "block");
        }

    };

    this.toggleFilters = function() {
        const s = this.selectors;
        if ($.fn.DataTable.isDataTable(s.userTable)) {
            $(s.userTable).DataTable().clear().destroy();
            $(s.userTable).hide();
            $(this.selectors.lmFilterChanged).css("display", "block")
            $(this.selectors.lmPenaltyResetFilters).css("display", "block")
        }

    };

    this.penaltyFilter = function() {
        const input = $("#lm_penalty_filter_value");
        const clear = $("#clear_filter_value");
        input.on("input", function() {
            if (this.value.trim().length) {
                clear.show();
            } else {
                clear.hide();
            }
        });
        clear.on("click", function() {
            input.val("").trigger("input");
            input.focus();
        });
    };

    this.toggleFilterInput = function() {
        const s = this.selectors;
        const selected = $(s.lmPenaltyFilterType).val();
        if ($.fn.DataTable.isDataTable(s.userTable)) {
            $(s.userTable).DataTable().clear().destroy();
            $(s.userTable).hide();
            $(this.selectors.lmFilterChanged).css("display", "block")
            $(this.selectors.lmPenaltyResetFilters).css("display", "block")
        }

        if (selected && selected.toLowerCase() !== "all") {
            $(s.lmPenaltyFilterValue).prop("disabled", false);
        } else {
            $(s.lmPenaltyFilterValue).prop("disabled", true).val("");
            $("#clear_filter_value").hide();
        }
    };

    this.resetFilters = function() {
        const s = this.selectors;
        $(s.lmPenaltyFilterType).val("all");
        $(s.lmPenaltyFilterValue).val("");
        $(s.lmPenaltyStatus).val("all");
        $(s.lmPenaltyLength).val("10");
        $("#clear_filter_value").hide();
        if ($.fn.DataTable.isDataTable(s.userTable)) {
            $(s.userTable).DataTable().clear().destroy();
            $(s.userTable).hide();
        }
        this.toggleFilterInput();
        $(this.selectors.lmFilterChanged).css("display", "none")
    };

    this.applyFilters = function() {
        const s = this.selectors;
        $(s.loader).show();
        $(s.userTable).hide();
        $(this.selectors.lmFilterChanged).css("display", "none")
        $(this.selectors.lmPenaltyResetFilters).css("display", "none")
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
                    processing: true,
                    serverSide: false,
                    dom: '<"top d-flex justify-content-end gap-2"<"dt-left"> <"dt-right gap-2 d-flex align-items-center"p>>t<"bottom"ip>',
                    lengthMenu: [10, 25, 50, 100],
                    language: { emptyTable: "No data found" },
                    columns: this.columnsConfig(true),
                    drawCallback: function() {
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
                    columns: this.columnsConfig(true),
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

    /**
     * 
     * Form reset function
     * 
     */
    this.resetPenaltyForm = () => {
        const s = this.selectors;
        const $form = $(s.lmPenaltyForm);
        $form.trigger("reset");
        if ($form.length) {
            if ($form.data("validator")) $form.validate().resetForm();
        }
    };

    /**
     * 
     * Validate form
     * 
     */
    this.validateForm = () => {
        const s = this.selectors;
        const $form = $(s.lmPenaltyForm);

        if ($form.data("validator")) {
            $form.removeData("validator").removeData("unobtrusiveValidation");
        }

        jQuery.validator.addMethod(
            "pattern",
            function(value, element, param) {
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
    this.addPenalty = function() {
        if ($(this.selectors.lmPenaltyForm).valid()) {
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

    this.openPayModal = function(e) {
        const s = this.selectors;
        const btn = $(e.currentTarget);
        $(s.lmPenaltyPayPenaltyId).val(btn.data("id"));
        $(s.lmPenaltyPayAmount).val(btn.data("amount"));
        $(s.lmPenaltyPayModal).modal("show");
    };

    this.payPenalty = function() {
       
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
            
    };

    // ------------------ Error handling ------------------
    this.showError = function(xhr) {
        const s = this.selectors;
        let message = "Something went wrong.";

        if (xhr.responseJSON) {
            if (xhr.responseJSON.object) {
                message =
                    typeof xhr.responseJSON.object === "string" ?
                    xhr.responseJSON.object :
                    Object.values(xhr.responseJSON.object).join("\n");
            } else if (xhr.responseJSON.message) {
                message = xhr.responseJSON.message;
            }
        }

        $(s.loader).hide();
        Swal.fire({ icon: "error", title: "Oops...", text: "❌ " + message, showConfirmButton: true });
    };

    // ------------------ DataTable Columns ------------------
    this.columnsConfig = function(withActions) {
        const baseCols = [
            { title: "S.No", data: null, orderable: false, searchable: false, render: (data, type, row, meta) => meta.row + 1 },
            {
                title: "Penalty Id",
                data: "penaltyId",
                render: (d, t, r) => `#${r.penaltyId}`
            },
            {
                title: "Transaction Id",
                data: "transactionId",
                render: (d, t, r) => `#${r.transactionId}`
            },
            {
                title: "Member Id",
                data: "memberId",
                render: (d, t, r) => `#${r.memberId}`
            },
            {
                title: "Book Id",
                data: "bookId",
                render: (d, t, r) => `#${r.bookId}`
            },
            { title: "Amount", data: "amount" },
            { title: "Penalty Added Flag", data: "penaltyAddedFlag" },
            { title: "Penalty Amount", data: "penaltyAmount",
                render:(data,type,row) =>{
                    if(row.penaltyAmount === null){
                        return `0`;
                    }
                    else{
                        return `${row.penaltyAmount}`;
                    }
                }
             },
            { title: "Reason", data: "reason",
                className:"text-capitalize"
             },
            {
                title: "Status",
                data: "status",
                render: (data, type, row) => {

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
            { title: "Payment Date", data: "paymentDate",
                render:(data,type,row) =>{
                    if(row.paymentDate === null){
                        return `Not Paid`;
                    }
                    else{
                        return `${row.paymentDate}`;
                    }
                }
             },
        ];

        if (withActions) {
            baseCols.push({
                title: "Action",
                data: null,
                orderable: false,
                render: (data, type, row) =>
                    row.status === "Pending" ?
                    `<button class="btn btn-sm lm_penalty_pay text-center"
                  data-bs-toggle="tooltip" data-bs-placement="top"
                  style="background-color:#1e3a8a;color:#fff; width:80px;"
                  title="Pay Penalty" data-bs-target="#lm_penalty_pay_modal"
                  data-id="${row.penaltyId}" data-amount="${row.amount}">
                  Pay Now
              </button>` : `
                  <span data-bs-toggle="tooltip" data-bs-placement="top"  title="Already Paid" ><button disabled class="btn btn-sm text-center  border-0" style="background-color:#1e3a8a;color:#fff;width:80px;" >
                    Paid
                  </button></span>
              `,

            });
        }

        return baseCols;
    };
};

// ------------------ create and initialize ------------------
const penalty = new Penalty();
penalty.init();