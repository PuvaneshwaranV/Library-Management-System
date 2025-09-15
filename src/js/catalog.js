/* ===================== Rental Transactions ===================== */

if (typeof window.RentalTransaction === "undefined") {
    window.RentalTransaction = function () {

    /* ---------- CENTRAL SELECTORS ---------- */
    const selectors = {
        loader:            "#loader",
        table:             "#user_table",

        // Filter
        applyFiltersBtn:   "#apply_rental_filters",
        resetFiltersBtn:   "#reset_rental_filters",
        filterLength:      "#rental_length",
        filterStatus:      "#rental_status",
        filterType:        "#rental_filter_type",
        filterValue:       "#rental_filter_value",

        // Borrow
        booksContainer:    "#books_container",
        addBookBtn:        "#add_book_btn",
        borrowCancel:      "#cancel",
        borrowSubmit:      "#add_btn",
        borrowForm:        "#borrow_form",
        memberId:          "#member_id",
        memberIdError:     "#member_id_error",

        // Return
        addReturnGroup:    "#add_group",
        bookGroups:        "#book_groups",
        returnCancel:      "#return_cancel",
        returnBtn:         "#return_btn",

        // Update
        updateRentalModal: "#update_rental_modal",
        updateTransaction: "#update_transactionId",
        updateBookId:      "#update_bookId",
        updateQuantity:    "#update_quantity",
        updateRentalBtn:   "#update_rental_btn",

        // PDF
        pdfBtn:            "#transaction_pdf",

        // Borrow Modal
        borrowModal:       "#borrow_modal"
    };

    const apiBase = "http://localhost:8080/LibraryManagementSystem/RentalTransactions";

    /* ---------- INIT ---------- */
    this.init = function () {
        this.bindFilterHandlers();
        this.bindBorrowHandlers();
        this.bindReturnHandlers();
        this.bindUpdateHandlers();
        this.bindPDFHandler();
    };

    /* ---------- FILTER / TABLE ---------- */
    this.bindFilterHandlers = function () {
        $(selectors.applyFiltersBtn).off("click").on("click", () => this.applyFilters());
        $(selectors.resetFiltersBtn).off("click").on("click", () => this.resetFilters());
    };

    this.applyFilters = function () {
        $(selectors.loader).show();
        $(selectors.table).hide();

        const length  = $(selectors.filterLength).val();
        const status  = $(selectors.filterStatus).val();
        const column  = $(selectors.filterType).val().trim();
        const value   = $(selectors.filterValue).val().trim();
        const params  = this.buildFilterParams(length, status, column, value);

        $.ajax({
            url: `${apiBase}/getAllTransactions`,
            method: "GET",
            data: params,
            dataType: "json",
            success: res => this.populateTable(res.object?.data || []),
            error: () => this.populateTable([])
        });
    };

    this.buildFilterParams = function (length, status, col, field) {
        const base = { start: 0, length, order: "asec" };
        if (status !== "all") base.bookRentalStatus = status;
        if (col !== "all") { base.searchColumn = col; base.searchField = field; }
        return base;
    };

    this.populateTable = function (data) {
        if ($.fn.DataTable.isDataTable(selectors.table)) {
            $(selectors.table).DataTable().destroy();
        }
        $(selectors.table).DataTable({
            data,
            sort: false,
            destroy: true,
            dom: '<"top"lp>t<"bottom"ip>',
            lengthMenu: [10, 25, 50, 100],
            language: { emptyTable: "No data found" },
            columns: [
                { title: "Transaction ID", data: "transactionId" },
                { title: "Member Id",      data: "memberId" },
                { title: "Book Id",        data: "bookId" },
                { title: "Book Title",     data: "bookTittle" },
                { title: "Quantity",       data: "quantity" },
                { title: "Returned Qty",   data: "bookReturnedQuantity" },
                { title: "Borrowed Date",  data: "borrowedDate" },
                { title: "Return Due",     data: "returnDueDate" },
                { title: "Actual Return",  data: "actualReturnedDate" },
                {
                    title: "Status",
                    data: "bookRentalStatus",
                    render: (d, t, row) =>
                        `<p class="${row.bookRentalStatus === "Returned" ? "bg-success" : "bg-danger"} rounded-5 text-white mb-0 px-2">${row.bookRentalStatus}</p>`
                },
                {
                    title: "Actions",
                    data: null,
                    orderable: false,
                    render: (d, t, row) =>
                        row.bookRentalStatus === "Borrowed"
                            ? `<button class="btn btn-sm btn-warning update-rental"
                                   data-id="${row.transactionId}"
                                   data-bookid="${row.bookId}"
                                   data-quantity="${row.quantity}">
                                   <i class="fa-solid fa-pen-to-square text-white"></i>
                               </button>`
                            : `<button class="btn btn-sm btn-secondary" disabled>
                                   <i class="fa-solid fa-pen-to-square text-white"></i>
                               </button>`
                }
            ]
        });
        $(selectors.loader).hide();
        $(selectors.table).show();
    };

    this.resetFilters = function () {
        $(selectors.filterType).val("all");
        $(selectors.filterValue).val("");
        $(selectors.filterStatus).val("all");
        $(selectors.filterLength).val("10");

        if ($.fn.DataTable.isDataTable(selectors.table)) {
            $(selectors.table).DataTable().clear().destroy();
            $(selectors.table).hide();
        }
    };

    /* ---------- BORROW ---------- */
    this.bindBorrowHandlers = function () {
        const container = document.querySelector(selectors.booksContainer);
        const updateRemoveButtons = () => {
            container.querySelectorAll(".book-entry").forEach((e, i) =>
                e.querySelector(".remove-book-btn").style.display = i === 0 ? "none" : "block"
            );
        };

        $(selectors.addBookBtn).on("click", () => {
            const entry = $(`
                <div class="book-entry mb-3 border p-3 rounded position-relative">
                    <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 remove-book-btn">✖</button>
                    <input type="text" class="form-control mb-2" placeholder="Book Id" name="book_id"/>
                    <div class="text-danger small error_book_id"></div>
                    <input type="text" class="form-control mb-2" placeholder="Quantity" name="quantity"/>
                    <div class="text-danger small error_quantity"></div>
                    <input type="text" class="form-control mb-2" placeholder="YYYY-MM-DD" name="due_date"/>
                    <div class="text-danger small error_due_date"></div>
                </div>`);
            entry.find(".remove-book-btn").on("click", () => entry.remove());
            $(container).append(entry);
            updateRemoveButtons();
        });

        $(selectors.borrowCancel).on("click", () => this.resetBorrowModal(container, updateRemoveButtons));

        $(selectors.borrowSubmit).on("click", () => {
            if (!this.validateBorrow(container)) return;
            const payload = this.collectBorrowData(container);
            this.ajaxBorrow(payload, container, updateRemoveButtons);
        });

        updateRemoveButtons();
    };

    this.resetBorrowModal = function (container, updater) {
        $(selectors.borrowForm)[0].reset();
        container.innerHTML = "";
        $(selectors.addBookBtn).trigger("click");
        updater();
    };

    this.validateBorrow = function (container) {
        let valid = true;
        $(".text-danger.small").text("");

        if (!$(selectors.memberId).val().trim()) {
            $(selectors.memberIdError).text("Member ID is required.");
            valid = false;
        }

        container.querySelectorAll(".book-entry").forEach(entry => {
            const id  = entry.querySelector('[name="book_id"]');
            const qty = entry.querySelector('[name="quantity"]');
            const due = entry.querySelector('[name="due_date"]');

            if (!id.value.trim())  { entry.querySelector(".error_book_id").textContent = "Book ID is required."; valid = false; }
            if (!qty.value.trim()) { entry.querySelector(".error_quantity").textContent = "Quantity is required."; valid = false; }
            if (!due.value.trim()) { entry.querySelector(".error_due_date").textContent = "Due date is required."; valid = false; }
        });
        return valid;
    };

    this.collectBorrowData = function (container) {
        const books = [];
        container.querySelectorAll(".book-entry").forEach(entry => {
            books.push({
                bookId: parseInt(entry.querySelector('[name="book_id"]').value, 10),
                quantity: parseInt(entry.querySelector('[name="quantity"]').value, 10),
                returnDueDate: entry.querySelector('[name="due_date"]').value
            });
        });
        return {
            memberId: parseInt($(selectors.memberId).val().trim(), 10),
            books
        };
    };

    this.ajaxBorrow = function (payload, container, updater) {
        $(selectors.loader).show();
        $.ajax({
            url: `${apiBase}/borrowBooks`,
            type: "POST",
            data: JSON.stringify(payload),
            contentType: "application/json",
            success: (res) => {
                $(selectors.loader).hide();
                $(selectors.borrowModal).modal("hide");
                this.resetBorrowModal(container, updater);
                Swal.fire({ icon: "success", title: "Borrowed", text: `✅ ${res.object}`, timer: 2000, showConfirmButton: false })
                    .then(() => $(selectors.applyFiltersBtn).click());
            },
            error: (xhr) => this.showAjaxError(xhr)
        });
    };

    /* ---------- RETURN ---------- */
    this.bindReturnHandlers = function () {
        const resetReturnModal = () => {
            const first = $(".book-group").first().clone();
            $(selectors.bookGroups).html(first);
            $(`${selectors.bookGroups} .book-group input`).val("");
            $(`${selectors.bookGroups} .remove-group`).hide();
            $(`${selectors.bookGroups} .text-danger`).text("");
        };

        $(selectors.addReturnGroup).on("click", () => {
            const g = $(".book-group").first().clone();
            g.find("input").val("");
            g.find(".text-danger").text("");
            g.find(".remove-group").show();
            $(selectors.bookGroups).append(g);
        });

        $(document).on("click", ".remove-group", function () {
            $(this).closest(".book-group").remove();
        });

        $(selectors.returnCancel).on("click", () => {
            resetReturnModal();
            $("#return_modal").modal("hide");
        });

        $(selectors.returnBtn).on("click", () => {
            const books = [];
            let valid = true;

            $(`${selectors.bookGroups} .book-group`).each(function () {
                const id   = $(this).find(".book-id").val().trim();
                const qty  = $(this).find(".quantity").val().trim();
                const trans= $(this).find(".transaction-id").val().trim();

                $(this).find(".text-danger").text("");

                if (!id)  { $(this).find(".error-book-id").text("Book ID is required"); valid = false; }
                if (!qty || isNaN(qty) || qty <= 0) { $(this).find(".error-quantity").text("Quantity must be a positive number"); valid = false; }
                if (!trans){ $(this).find(".error-transaction-id").text("Transaction ID is required"); valid = false; }

                if (valid && id && qty && trans) {
                    books.push({ bookId: +id, quantity: +qty, transactionId: +trans });
                }
            });

            if (!valid) return;
            $(selectors.loader).show();
            $.ajax({
                url: `${apiBase}/returnBooks`,
                type: "POST",
                data: JSON.stringify(books),
                contentType: "application/json",
                success: (res) => {
                    $(selectors.loader).hide();
                    resetReturnModal();
                    $("#return_modal").modal("hide");
                    Swal.fire({ icon: "success", title: "Returned", text: `✅ ${res.object}`, timer: 4000, showConfirmButton: false })
                        .then(() => $(selectors.applyFiltersBtn).click());
                },
                error: (xhr) => this.showAjaxError(xhr)
            });
        });
    };

    /* ---------- UPDATE ---------- */
    this.bindUpdateHandlers = function () {
        $(document).on("click", ".update-rental", function () {
            $(selectors.updateTransaction).val($(this).data("id"));
            $(selectors.updateBookId).val($(this).data("bookid"));
            $(selectors.updateQuantity).val($(this).data("quantity"));
            $(selectors.updateRentalModal).modal("show");
        });

        $(selectors.updateRentalBtn).on("click", () => {
            const params = [{
                transactionId: +$(selectors.updateTransaction).val(),
                bookId: +$(selectors.updateBookId).val(),
                quantity: +$(selectors.updateQuantity).val().trim()
            }];

            $(selectors.loader).show();
            $.ajax({
                url: `${apiBase}/returnBooks`,
                method: "POST",
                data: JSON.stringify(params),
                contentType: "application/json",
                success: () => {
                    $(selectors.loader).hide();
                    $(selectors.updateRentalModal).modal("hide");
                    Swal.fire({ icon: "success", title: "Returned", text: "✅ Book Returned Successfully", timer: 2000, showConfirmButton: false })
                        .then(() => $(selectors.applyFiltersBtn).click());
                },
                error: (xhr) => this.showAjaxError(xhr)
            });
        });
    };

    /* ---------- PDF ---------- */
    this.bindPDFHandler = function () {
        $(selectors.pdfBtn).on("click", () => {
            $(selectors.loader).show();
            $.ajax({
                url: `${apiBase}/getTransactionPDF`,
                type: "GET",
                dataType: "json",
                success: (res) => {
                    $(selectors.loader).hide();
                    Swal.fire({ icon: "success", title: "Generated", text: `✅ ${res.object}`, timer: 2000, showConfirmButton: false });
                },
                error: (xhr) => this.showAjaxError(xhr)
            });
        });
    };

    /* ---------- COMMON ERROR ---------- */
    this.showAjaxError = function (xhr) {
        $(selectors.loader).hide();
        let msg = "Something went wrong.";
        if (xhr.responseJSON) {
            msg = xhr.responseJSON.message || msg;
            if (xhr.responseJSON.object) msg = Object.values(xhr.responseJSON.object).join("\n");
        }
        Swal.fire({ icon: "error", title: "Oops...", text: `❌ ${msg}`, timer: 2000, showConfirmButton: false });
    };
};
}

/* ===== Kick-off ===== */
$(document).ready(function () {
    const rental = new RentalTransaction();
    rental.init();
});
