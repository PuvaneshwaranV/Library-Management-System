/* ===================== Rental Transactions ===================== */
const RentalTransaction = function () {

        /* ---------- CENTRAL SELECTORS ---------- */
        const s = {
            loader:            "#loader",
            table:             "#user_table",

            // Filters
            applyFiltersBtn:   "#apply_rental_filters",
            resetFiltersBtn:   "#reset_rental_filters",
            filterLength:      "#rental_length",
            filterStatus:      "#rental_status",
            filterType:        "#rental_filter_type",
            filterValue:       "#rental_filter_value",
            filters:           ".filters",
            lmFilterChanged:    "#lm_filter_changed",

            // Borrow
            booksContainer:    "#books_container",
            addBookBtn:        "#add_book_btn",
            borrowCancel:      "#cancel",
            borrowSubmit:      "#add_btn",
            borrowForm:        "#borrow_form",
            memberId:          "#member_id",
            memberIdError:     "#member_id_error",
            borrowModal:       "#borrow_modal",
            calendarIcon:      ".due_date_calendar_icon",          // <-- icon in borrow modal

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
            updateDueInput:    "#update_due_date",                 // <-- input in update modal
            updateCalendarIcon: ".update_due_date_calendar_icon",   // <-- icon in update modal

            // PDF
            pdfBtn:            "#transaction_pdf"
        };

        const apiBase = "http://localhost:8080/LibraryManagementSystem/RentalTransactions";

        // ===== Tempus Dominus pickers =====
        this.addDueDp    = null;   // for borrow modal
        this.updateDueDp = null;   // for update modal

        /* ---------- INIT ---------- */
        this.init = function () {
            this.bindFilterHandlers();
            this.bindBorrowHandlers();
            this.bindReturnHandlers();
            this.bindUpdateHandlers();
            this.bindPDFHandler();
            this.bindDatePickers();
        };

        /* ---------- FILTER / TABLE ---------- */
        this.bindFilterHandlers = function () {
            $(s.applyFiltersBtn).off("click").on("click", () => this.applyFilters());
            $(s.resetFiltersBtn).off("click").on("click", () => this.resetFilters());
            $(s.filters).off("change").on("change", () => this.toggleFilters());
            $(s.filterType).off("change").on("change", () => this.toggleFilterInput());
            $(s.filterValue).off("input").on("input", () => this.changeFilterInput());
        };
        /**
         * 
         */
        this.toggleFilterInput = function () {
            const selected = $(s.filterType).val();
            if (selected && selected.toLowerCase() !== "all") {
                $(s.filterValue).prop("disabled", false);
            } else {
                $(s.filterValue).prop("disabled", true).val("");
            }
            if ($.fn.DataTable.isDataTable(s.table)) {
                $(s.table).DataTable().clear().destroy();
                $(s.table).hide();
                $(s.lmFilterChanged).css("display","block")
            }
        };
        this.changeFilterInput = function () {
            if ($.fn.DataTable.isDataTable(s.table)) {
                $(s.table).DataTable().clear().destroy();
                $(s.table).hide();
                $(s.lmFilterChanged).css("display","block")
            }
        };
        this.toggleFilters = function () {
            if ($.fn.DataTable.isDataTable(s.table)) {
                $(s.table).DataTable().clear().destroy();
                $(s.table).hide();
                $(s.lmFilterChanged).css("display","block")
            }
        };

        this.applyFilters = function () {
            $(s.loader).show();
            $(s.table).hide();
             $(s.lmFilterChanged).css("display","none")
            const params = this.buildFilterParams(
                $(s.filterLength).val(),
                $(s.filterStatus).val(),
                $(s.filterType).val().trim(),
                $(s.filterValue).val().trim()
            );
            $.ajax({
                url: `${apiBase}/getAllTransactions`,
                method: "GET",
                data: params,
                dataType: "json",
                success: res => this.populateTable(res.object?.data || []),
                error:   () => this.populateTable([])
            });
        };

        this.buildFilterParams = function (length, status, col, field) {
            const base = { start: 0, length, order: "asec" };
            if (status !== "all") base.bookRentalStatus = status;
            if (col !== "all") { base.searchColumn = col; base.searchField = field; }
            return base;
        };

        this.populateTable = function (data) {
            if ($.fn.DataTable.isDataTable(s.table)) {
                $(s.table).DataTable().destroy();
            }
            $(s.table).DataTable({
                data,
                autoWidth: false,
                sort: false,
                destroy: true,
                dom: '<"top d-flex justify-content-between"<"dt-left"> <"dt-right"p>>t<"bottom"ip>',
                lengthMenu: [10, 25, 50, 100],
                language: { emptyTable: "No data found"},
                columns: [
                    { title: "S.No", data: null, orderable: false,
                      render: (d, t, r, m) => m.row + 1 },
                    { title: "Transaction ID", data: "transactionId",
                       render:(d,t,r) => `#${r.transactionId}`
                     },
                    { title: "Member Id",      data: "memberId",
                        render:(d,t,r) => `#${r.memberId}`
                     },
                    { title: "Book Id",        data: "bookId",
                        render:(d,t,r) => `#${r.bookId}`
                     },
                    { title: "Book Title",     data: "bookTittle" },
                    { title: "Quantity",       data: "quantity" },
                    { title: "Returned Qty",   data: "bookReturnedQuantity" },
                    { title: "Borrowed Date",  data: "borrowedDate" },
                    { title: "Return Due Date",data: "returnDueDate" },
                    { title: "Actual Return Date", data: "actualReturnedDate" },
                    {
                        title: "Status",
                        data: "bookRentalStatus",
                        render: (d,t,row) => {
                            const bgColor = row.bookRentalStatus === "Returned" ? "#d4edda" : "#f8d7da"; // light green / light red
                            const textColor = row.bookRentalStatus === "Returned" ? "#155724" : "#721c24"; // dark text for contrast
                            return `<span class=" text-center mb-0 px-2" style="background-color:${bgColor};color:${textColor};
                                display:inline-block;
                                border-radius: 12px; 
                                padding: 2px 0px; 
                                margin: 0 auto;
                                width: 100px;
                                font-weight: 500;
                            ">
                              ${row.bookRentalStatus}</span>`
                        }
                    },
                    {
                        title: "Action",
                        data: null,
                        orderable: false,
                        render: (d,t,row) =>
                            row.bookRentalStatus === "Borrowed"
                                ? `<button class="btn btn-md  update-rental"
                                        data-bs-toggle="tooltip"
                                       data-id="${row.transactionId}"
                                       data-bookid="${row.bookId}"
                                       data-quantity="${row.quantity}" title="Return Book">
                                       <img src="../../assets/returning.png" alt="return book" height="25" width="25">
                                   </button>`
                                : `<span data-bs-toggle="tooltip" title="Already Returned"><button class="btn btn-md border-0" disabled>
                                       <img src="../../assets/already return.png" alt="already returned" height="25" width="25">
                                   </button></span>`
                    }
                ],
                drawCallback: () => {
                    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                        if (!bootstrap.Tooltip.getInstance(el)) new bootstrap.Tooltip(el);
                    });
                    const dtLeft = $('.dt-left');
                    if (dtLeft.children().length === 0) { // avoid duplicates
                        dtLeft.append(`
                            <button id="transaction_pdf" class="btn btn-warning text-white ms-3">
                                <i class="fa-solid fa-file-lines fa-lg me-1" style="color: #ffffff"></i>Generate All Transaction Pdf
                            </button>
                        `);
                    }
                }
            });
            $(s.loader).hide();
            $(s.table).show();
        };

        this.resetFilters = function () {
            $(s.filterType).val("all");
            $(s.filterValue).val("");
            $(s.filterStatus).val("all");
            $(s.filterLength).val("10");
            if ($.fn.DataTable.isDataTable(s.table)) {
                $(s.table).DataTable().clear().destroy();
                $(s.table).hide();
            }
             $(s.lmFilterChanged).css("display","none")
        };
        function clearValidationErrors(modalSelector) {
    $(`${modalSelector} .text-danger.small`).text("");
}
        /* ---------- BORROW ---------- */
        this.bindBorrowHandlers = function () {
            const container = document.querySelector(s.booksContainer);

            // Initial validation setup for the main form.
            // This part is already correct in your code.
            const $form = $(s.borrowForm);
            if (!$form.data('validator')) {
                $form.validate({
                    rules: {
                        "member_id": { required: true, numbersOnly: true },
                        "book_id[]": { required: true, numbersOnly: true },
                        "quantity[]": { required: true, numbersOnly: true, min: 1 },
                        "due_date[]": { required: true, dateISO: true, futureDate: true }
                    },
                    messages: {
                        "member_id": { required: "Member ID is required", numbersOnly: "Digits only" },
                        "book_id[]": { required: "Book ID is required", numbersOnly: "Digits only" },
                        "quantity[]": { required: "Quantity is required", numbersOnly: "Digits only", min: "Quantity must be at least 1" },
                        "due_date[]": { required: "Due date is required", dateISO: "Use YYYY-MM-DD", futureDate: "Due date must be after today" }
                    },
                    errorElement: "span",
                    errorClass: "text-danger small",
                    errorPlacement: function (error, element) {
                        if (element.closest(".input-group").length) {
                            error.insertAfter(element.closest(".input-group"));
                        } else {
                            error.insertAfter(element);
                        }
                    },
                });
            }

            const updateRemoveButtons = () => {
                container.querySelectorAll(".book-entry").forEach((e, i) =>
                    e.querySelector(".remove-book-btn").style.display = i === 0 ? "none" : "block"
                );
            };

            $(s.addBookBtn).on("click", () => {
                const entry = $(`
                    <div class="book-entry mb-3 border p-3 rounded position-relative">
                        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 remove-book-btn"><i class="fa-solid fa-trash"></i></button>
                        
                        <input type="text" class="form-control mb-2" id="book_id" placeholder="Book Id" name="book_id[]"/>
                       
                        <input type="number" class="form-control mb-2" id="book_quantity" placeholder="Quantity" name="quantity[]"/>
                       
                        <div class="input-group mb-2">
                            <input type="text" class="form-control due_date border-end-0" placeholder="YYYY-MM-DD" id="due_date" name="due_date[]"/>
                            <span class="input-group-text border border-black border-start-0">
                                <i class="fa fa-calendar update_due_date_calendar_icon" style="color:#1e3a8a;cursor:pointer"></i>
                            </span>
                        </div>
                    </div>`);

                entry.find(".remove-book-btn").on("click", () => {entry.remove();});

                // --- THE KEY CHANGE ---
                // Add the new elements to the form container.
                $(container).append(entry);
                    
                // Manually apply validation rules to the new inputs.
                entry.find('input[name="book_id[]"]').rules("add", {
                    required: true,
                    numbersOnly: true,
                    messages: {
                        required: "Book ID is required",
                        numbersOnly: "Digits only"
                    }
                });

                entry.find('input[name="quantity[]"]').rules("add", {
                    required: true,
                    numbersOnly: true,
                    min: 1,
                    messages: {
                        required: "Quantity is required",
                        numbersOnly: "Digits only",
                        min: "Quantity must be at least 1"
                    }
                });
                
                entry.find('input[name="due_date[]"]').rules("add", {
                    required: true,
                    dateISO: true,
                    futureDate: true,
                    messages: {
                        required: "Due date is required",
                        dateISO: "Use YYYY-MM-DD",
                        futureDate: "Due date must be after today"
                    }
                });
                // --- END OF KEY CHANGE ---
                
                const dateInput = entry.find(".due_date")[0];
                new tempusDominus.TempusDominus(dateInput, {
                    localization: { format: "yyyy-MM-dd" },
                    restrictions: { minDate: new tempusDominus.DateTime(new Date()) },
                    display: { components: { calendar: true, date: true, month: true, year: true } }
                });

                entry.find(".due_date").inputmask("9999-99-99");
                updateRemoveButtons();
            });

            $(s.borrowCancel).on("click", () => this.resetBorrowModal(container, updateRemoveButtons));
            
            $(s.borrowSubmit).on("click", () => {
                // The form.valid() call will now check all elements, including the dynamically added ones.
                if (!$(s.borrowForm).valid()) return;
                const payload = this.collectBorrowData(container);
                this.ajaxBorrow(payload, container, updateRemoveButtons);
            });

            $(s.borrowModal).on("hidden.bs.modal", () => {
                this.resetBorrowModal(container, updateRemoveButtons);
                clearValidationErrors(s.borrowModal);
            });

            updateRemoveButtons();
        };

                this.resetBorrowModal = function (container, updater) {
                    $(s.borrowForm)[0].reset();
                    $(s.memberIdError).text("");                  // 🔑 clear member id error
                    $(s.borrowModal).find(".text-danger.small").text("");
                    container.innerHTML = "";
                    $(s.addBookBtn).trigger("click");
                    updater();
                };

                jQuery.validator.addMethod("numbersOnly", function (value, element) {
                    return this.optional(element) || /^\d+$/.test(value);
                }, "Please enter digits only.");

                jQuery.validator.addMethod("futureDate", function (value, element) {
                    if (this.optional(element)) return true;
                    // must be YYYY-MM-DD and after today
                    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
                    if (!m) return false;
                    const inputDate = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
                    const today     = new Date();
                    today.setHours(0,0,0,0);
                    return inputDate > today;
                }, "Enter a valid date (YYYY-MM-DD) greater than today.");

            

        this.collectBorrowData = function (container) {
            const books = [];
            container.querySelectorAll(".book-entry").forEach(entry => {
                books.push({
                    bookId: +entry.querySelector('[name="book_id[]"]').value,
                    quantity: +entry.querySelector('[name="quantity[]"]').value,
                    returnDueDate: entry.querySelector('[name="due_date[]"]').value
                });
            });
            
            return {
                memberId: +$(s.memberId).val().trim(),
                books
            };
        };

        this.ajaxBorrow = function (payload, container, updater) {
            $(s.loader).show();
            $.ajax({
                url: `${apiBase}/borrowBooks`,
                type: "POST",
                data: JSON.stringify(payload),
                contentType: "application/json",
                success: (res) => {
                    $(s.loader).hide();
                    $(s.borrowModal).modal("hide");
                    this.resetBorrowModal(container, updater);
                    Swal.fire({ icon: "success", title: "Borrowed", text: `✅ ${res.object}`, timer: 2000, showConfirmButton: false })
                        .then(() => $(s.applyFiltersBtn).click());
                },
                error: (xhr) => this.showAjaxError(xhr)
            });
        };

        $("#return_modal").on("shown.bs.modal", function () {
            const form = $("#return_form");

            if (!form.data("validator")) { // Only initialize once
                form.validate({
                    rules: {
                        "book-id[]": { required: true, number: true },
                        "quantity[]": { required: true, number: true, min: 1 },
                        "transaction-id[]": { required: true, number: true }
                    },
                    messages: {
                        "book-id[]": { required: "Book ID is required", number: "Book ID must be a number" },
                        "quantity[]": { required: "Quantity is required", number: "Quantity must be a number", min: "Quantity must be at least 1" },
                        "transaction-id[]": { required: "Transaction ID is required", number: "Transaction ID must be a number" }
                    },
                    errorElement: "span",             // use <span> for error
                    errorClass: "text-danger small",  // bootstrap class + custom size
                    errorPlacement: function (error, element) {
                        // place the error immediately after the input
                        error.insertAfter(element);
                    },
                    
                });
            }
        });

        /* ---------- RETURN ---------- */
        this.bindReturnHandlers = function () {
            const resetReturnModal = () => {
                const form = $("#return_form");
                form[0].reset();

                // Reset validation errors
                if (form.data("validator")) {
                    form.validate().resetForm(); // clears all error messages and classes
                }
                const first = $(".book-group").first().clone();
                $(s.bookGroups).html(first);
                
                $(`${s.bookGroups} .remove-group`).hide();
                
            };

            $(s.addReturnGroup).on("click", () => {
                const g = $(".book-group").first().clone();
                g.find("input").val("");
                g.find(".text-danger").text("");
                g.find(".remove-group").show();
                $(s.bookGroups).append(g);
                g.find('input[name="book-id[]"]').rules("add", { required: true, number: true });
                g.find('input[name="quantity[]"]').rules("add", { required: true, number: true, min: 1 });
                g.find('input[name="transaction-id[]"]').rules("add", { required: true, number: true });
            });

            $(document).on("click", ".remove-group", function () {
                $(this).closest(".book-group").remove();
            });

            $(s.returnCancel).on("click", () => {
                resetReturnModal();
                $("#return_modal").modal("hide");
            });
             $("#return_modal").on("hidden.bs.modal", () => {
                clearValidationErrors("#return_modal");
                resetReturnModal();
            });

       

            $(s.returnBtn).on("click", () => {
                const form = $("#return_form");
                
                if (!form.valid()) return;
                const books = [];
                
                $(`${s.bookGroups} .book-group`).each(function () {
                    const id   = $(this).find(".book-id").val().trim();
                    const qty  = $(this).find(".quantity").val().trim();
                    const trans= $(this).find(".transaction-id").val().trim();
                    books.push({ bookId: +id, quantity: +qty, transactionId: +trans });
                });
                
                $(s.loader).show();
                $.ajax({
                    url: `${apiBase}/returnBooks`,
                    type: "POST",
                    data: JSON.stringify(books),
                    contentType: "application/json",
                    success: (res) => {
                        $(s.loader).hide();
                        resetReturnModal();
                        $("#return_modal").modal("hide");
                        Swal.fire({ icon: "success", title: "Returned", text: `✅ Books Returned Successfully`, timer: 4000, showConfirmButton: false })
                            .then(() => $(s.applyFiltersBtn).click());
                    },
                    error: (xhr) => this.showAjaxError(xhr)
                });
            });
        };

        /* ---------- UPDATE ---------- */
        this.bindUpdateHandlers = function () {
            $(document).on("click", ".update-rental", function () {
                $(s.updateTransaction).val($(this).data("id"));
                $(s.updateBookId).val($(this).data("bookid"));
                $(s.updateQuantity).val($(this).data("quantity"));
                $(s.updateRentalModal).modal("show");
            });

            $(s.updateRentalBtn).on("click", () => {
                const params = [{
                    transactionId: +$(s.updateTransaction).val(),
                    bookId: +$(s.updateBookId).val(),
                    quantity: +$(s.updateQuantity).val().trim()
                }];
                $(s.loader).show();
                $.ajax({
                    url: `${apiBase}/returnBooks`,
                    method: "POST",
                    data: JSON.stringify(params),
                    contentType: "application/json",
                    success: () => {
                        $(s.loader).hide();
                        $(s.updateRentalModal).modal("hide");
                        Swal.fire({ icon: "success", title: "Returned", text: "✅ Book Returned Successfully", timer: 2000, showConfirmButton: false })
                            .then(() => $(s.applyFiltersBtn).click());
                    },
                    error: (xhr) => this.showAjaxError(xhr)
                });
            });
        };

        /* ---------- Tempus Dominus delegated handlers ---------- */
        this.bindDatePickers = function () {
            // create default picker when borrow modal is shown
            $(document).on("shown.bs.modal", s.borrowModal, () => {
                const addInput = document.querySelector("#books_container .due_date");
                if (addInput && !this.addDueDp) {
                    this.addDueDp = new tempusDominus.TempusDominus(addInput, {
                        localization: { format: "yyyy-MM-dd" },
                        restrictions: { minDate: new tempusDominus.DateTime(new Date()) }
                    });
                }
            });

            // create update picker when update modal is shown
            $(document).on("shown.bs.modal", s.updateRentalModal, () => {
                const updInput = document.querySelector(s.updateDueInput);
                if (updInput) {
                    // dispose old picker if it exists
                    if (this.updateDueDp && this.updateDueDp.dispose) this.updateDueDp.dispose();
                        this.updateDueDp = new tempusDominus.TempusDominus(updInput, {
                        localization: { format: "yyyy-MM-dd" },
                        restrictions: { minDate: new tempusDominus.DateTime(new Date()) }
                    });   
                }
            });

            // delegated icon clicks
            $(document).on("click", s.calendarIcon, () => {
                if (this.addDueDp) this.addDueDp.show();
            });
            $(document).on("click", s.updateCalendarIcon, (e) => {
                console.log("updateDueDp =", this.updateDueDp);
                if (this.updateDueDp) this.updateDueDp.show();
            });
        };

        /* ---------- PDF ---------- */
        this.bindPDFHandler = function () {
            $(document).on("click", s.pdfBtn, () => {
                $(s.loader).show();
                $.ajax({
                    url: `${apiBase}/getTransactionPDF`,
                    type: "GET",
                    dataType: "json",                    
                    success: (res) => {
                        $(s.loader).hide();
                        Swal.fire({ icon: "success", title: "Generated", text: `✅ ${res.object}`, timer: 2000, showConfirmButton: false });
                    },
                    error: (xhr) => this.showAjaxError(xhr)
                });
            });
        };

        /* ---------- Helper ---------- */
        this.showAjaxError = function (xhr) {
            $(s.loader).hide();
            const msg = xhr?.responseJSON?.object || "Unexpected error";
            Swal.fire({ icon: "error", title: "Error", text: `❌ ${msg}`, confirmButtonColor: "#3085d6" });
        };
    };


/* ---------- INITIALIZE ---------- */

    const RentalTransactionInstance = new RentalTransaction();
    RentalTransactionInstance.init();
