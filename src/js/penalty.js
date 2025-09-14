const Penalty = function () {
    // ------------------ selectors in one place ------------------
    this.selectors = {
        loader:        "#loader",
        userTable:     "#user_table",
        applyFilters:  "#apply_penalty_filters",
        addBtn:        "#penalty_add_btn",
        transactionId: "#penalty_transactionid",
        amount:        "#penalty_amount",
        reason:        "#penalty_reason",
        payBtn:        "#penalty_pay_btn",
        payModal:      "#penalty_pay_modal",
        payPenaltyId:  "#penalty_pay_penaltyid",
        payAmount:     "#penalty_pay_amount",
        length:        "#penalty_length",
        status:        "#penalty_filter_status",
        filterType:    "#penalty_filter_type",
        filterValue:   "#penalty_filter_value"
    };

    // ------------------ public methods ------------------
    this.init = function () {
        const s = this.selectors;

        $(document)
            .off("click", s.applyFilters)
            .on("click", s.applyFilters, this.applyFilters.bind(this));

        $(document)
            .off("click", s.addBtn)
            .on("click", s.addBtn, this.addPenalty.bind(this));

        $(document)
            .off("click", ".penalty-pay")
            .on("click", ".penalty-pay", this.openPayModal.bind(this));

        $(document)
            .off("click", s.payBtn)
            .on("click", s.payBtn, this.payPenalty.bind(this));
    };

    this.applyFilters = function () {
        const s = this.selectors;
        $(s.loader).show();
        $(s.userTable).hide();

        let length       = $(s.length).val();
        let status       = $(s.status).val();
        let searchColumn = $(s.filterType).val();
        let searchValue  = $(s.filterValue).val().trim();
        let asc          = "asc";

        let params = { start: 0, length: length, order: asc };

        if ((status === "paid" || status === "pending") && searchValue !== "") {
            params = { ...params, paymentStatus: status, searchColumn, searchValue };
        } else if (status === "paid" || status === "pending") {
            params = { ...params, paymentStatus: status };
        } else if (searchValue !== "") {
            params = { ...params, searchColumn, searchValue };
        }

        $.ajax({
            url:  "http://localhost:8080/LibraryManagementSystem/Penalty/getPenalty",
            type: "GET",
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
                    columns: this.columnsConfig(true)
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
                    columns: this.columnsConfig(false)
                });
                $(s.loader).hide();
                $(s.userTable).show();
            }
        });
    };

    this.addPenalty = function () {
        const s = this.selectors;
        $(s.loader).show();

        let params = {
            TransactionId: parseInt($(s.transactionId).val().trim()),
            amount:        parseInt($(s.amount).val().trim()),
            reason:        $(s.reason).val().trim()
        };

        $.ajax({
            url:  "http://localhost:8080/LibraryManagementSystem/Penalty/add",
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
                    timer: 2000
                }).then(() => $(s.applyFilters).click());
            },
            error: (xhr) => this.showError(xhr)
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
            amount:    parseInt($(s.payAmount).val())
        };

        $.ajax({
            url:    "http://localhost:8080/LibraryManagementSystem/Penalty/pay",
            method: "POST",
            data:   params,
            success: (response) => {
                $(s.loader).hide();
                $(s.payModal).modal("hide");
                Swal.fire({
                    icon: "success",
                    title: "Paid",
                    text: "✅ " + response.object,
                    showConfirmButton: false,
                    timer: 2000
                }).then(() => $(s.applyFilters).click());
            },
            error: (xhr) => this.showError(xhr)
        });
    };

    this.showError = function (xhr) {
        const s = this.selectors;
        let message = "Something went wrong.";

        if (xhr.responseJSON) {
            if (xhr.responseJSON.message) message = xhr.responseJSON.message;
            if (xhr.responseJSON.object) {
                message = Object.values(xhr.responseJSON.object).join("\n");
            }
        }
        $(s.loader).hide();
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "❌ " + message,
            showConfirmButton: true
        });
    };

    this.columnsConfig = function (withActions) {
        const baseCols = [
            { title: "Penalty ID",        data: "penaltyId" },
            { title: "Transaction ID",    data: "transactionId" },
            { title: "Member ID",         data: "memberId" },
            { title: "Book ID",           data: "bookId" },
            { title: "Amount",            data: "amount" },
            { title: "Penalty Added Flag",data: "penaltyAddedFlag" },
            { title: "Penalty Amount",    data: "penaltyAmount" },
            { title: "Reason",            data: "reason" },
            {
                title: "Status",
                data: "status",
                render: (data, type, row) =>
                    row.status === "Paid"
                        ? `<div><p class="bg-success rounded-5 text-white">${row.status}</p></div>`
                        : `<div><p class="bg-danger rounded-5 text-white">${row.status}</p></div>`
            },
            { title: "Payment Date", data: "paymentDate" }
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
                                    data-bs-toggle="modal"
                                    data-bs-target="#penalty_pay_modal"
                                    data-id="${row.penaltyId}"
                                    data-amount="${row.amount}">
                                <i class="fa-solid fa-indian-rupee-sign" style="color:#fff;"></i>
                            </button>`;
                    } else {
                        return `
                            <button class="btn btn-sm btn-dark me-2 mb-2" disabled>
                                <i class="fa-solid fa-indian-rupee-sign" style="color:#fff;"></i>
                            </button>`;
                    }
                }
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
