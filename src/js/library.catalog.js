/* ===================== Rental Transactions ===================== */
const RentalTransaction = function () {
    /* ---------- CENTRAL SELECTORS ---------- */
    const s = {
        loader: "#loader",
        table: "#user_table",

        // Filters
        applyFiltersBtn: "#apply_rental_filters",
        resetFiltersBtn: "#reset_rental_filters",
        filterLength: "#rental_length",
        filterStatus: "#rental_status",
        filterType: "#rental_filter_type",
        filterValue: "#rental_filter_value",
        filters: ".filters",
        lmFilterChanged: "#lm_filter_changed",

        // Borrow
        booksContainer: "#books_container",
        addBookBtn: "#add_book_btn",
        borrowCancel: "#cancel",
        borrowSubmit: "#add_btn",
        borrowForm: "#borrow_form",
        memberId: "#member_id",
        memberIdError: "#member_id_error",
        borrowModal: "#borrow_modal",
        calendarIcon: ".due_date_calendar_icon", // <-- icon in borrow modal

        // Return
        addReturnGroup: "#add_group",
        bookGroups: "#book_groups",
        returnCancel: "#return_cancel",
        returnBtn: "#return_btn",

        // Update
        updateRentalModal: "#update_rental_modal",
        updateTransaction: "#update_transactionId",
        updateBookId: "#update_bookId",
        updateQuantity: "#update_quantity",
        updateRentalBtn: "#update_rental_btn",
        updateDueInput: "#update_due_date", // <-- input in update modal
        updateCalendarIcon: ".update_due_date_calendar_icon", // <-- icon in update modal
        updateQuantityName: ".update_quantity",
        lmReturningBookTitle: "#lm_returning_book_title",
        lmPenaltyModal: "#lm_penalty_modal",
        lmPenaltyForm: "#lm_penalty_add_form",
        lmPenaltyTransactionId: "#lm_penalty_transactionid",
        lmPenaltyAmount: "#lm_penalty_amount",
        lmPenaltyReason: "#lm_penalty_reason",
        lmPenaltyReset: "#lm_penalty_reset",
        lmPenaltyReset: "#lm_penalty_reset",
        lmPenaltyReset: "#lm_penalty_reset",
        lmPenaltyAddBtn: "#lm_penalty_add_btn",

        // PDF
        pdfBtn: "#transaction_pdf",
    };

    const apiBase =
        "http://localhost:8080/LibraryManagementSystem/RentalTransactions";

    // ===== Tempus Dominus pickers =====
    this.addDueDp = null; // for borrow modal
    this.updateDueDp = null; // for update modal

    /* ---------- INIT ---------- */
    this.init = function () {
        this.bindFilterHandlers();
        this.bindBorrowHandlers();
        this.bindReturnHandlers();
        this.bindUpdateHandlers();
        this.bindPDFHandler();
        this.bindDatePickers();
        this.rentalFilter();
        this.addPenaltyHandlers();

        $("#member_name").autocomplete({
            minLength: 3,
            source: RentalTransactionInstance.searchMemberName,
            create: function () {
                $(this).data("ui-autocomplete").liveRegion = $();
            },
            select: (event, ui) =>
                RentalTransactionInstance.setInputFieldValuesAfterSelection(
                    event,
                    ui
                ),
            appendTo: $("#member_name").parent("div"),
        });
        $(".book_title").autocomplete({
            minLength: 3,
            source: RentalTransactionInstance.searchBookTitle,
            create: function () {
                $(this).data("ui-autocomplete").liveRegion = $();
            },
            select: (event, ui) =>
                RentalTransactionInstance.setBookTitleInputFieldValuesAfterSelection(
                    event,
                    ui
                ),
            appendTo: $(".book_title").parent("div"),
        });
    };
    this.searchBookTitle = function (autoCompleteReq, autoCompleteResponse) {
        $.ajax({
            url: `http://localhost:8080/LibraryManagementSystem/Books/getAllBooks?start=0&length=10&searchColumn=title&searchValue=${autoCompleteReq.term}`,
            method: "GET",
            dataType: "json",
            success: (res) => {
                if (res.message === "SUCCESS") {
                    if (res.object.data.length !== 0) {
                        autoCompleteResponse(
                            res.object.data.map((eachBook) => {
                                const { bookId, title, author } = eachBook;
                                return {
                                    id: bookId,
                                    value: `${title} (${author})`,
                                    label: `${title} (${author})`,
                                };
                            })
                        );
                    } else {
                        autoCompleteResponse([
                            { id: null, value: `No Book found`, label: null },
                        ]);
                    }
                }
            },
            error: () => {
                this.showLoader(false);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to fetch Books",
                });
            },
        });
    };

    this.setBookTitleInputFieldValuesAfterSelection = function (event, ui) {
        console.log("Bb");
        $('[name="book_id[]"]').val(ui.item.id); // optional: set input text
        console.log("Book ID set:", ui.item.id);
        false;
    };

    this.rentalFilter = function () {
        const input = $("#rental_filter_value");
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
            input.focus(); // optional: keep focus in field
        });
    };

    this.searchMemberName = function (autoCompleteReq, autoCompleteResponse) {
        $.ajax({
            url: `http://localhost:8080/LibraryManagementSystem/Members/getAllMembers?start=0&length=100&order=asc&searchColumn=memberName&search=${autoCompleteReq.term}`,
            method: "GET",
            dataType: "json",
            success: (res) => {
                if (res.message === "SUCCESS") {
                    if (res.object.data.length !== 0) {
                        autoCompleteResponse(
                            res.object.data.map((eachMember) => {
                                const { memberId, memberName } = eachMember;
                                return {
                                    id: memberId,
                                    value: `${memberName} (${memberId})`,
                                    label: `${memberName} (${memberId})`,
                                };
                            })
                        );
                    } else {
                        autoCompleteResponse([
                            { id: null, value: `No member found`, label: null },
                        ]);
                    }
                }
            },
            error: () => {
                this.showLoader(false);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to fetch members",
                });
            },
        });
    };

    this.setInputFieldValuesAfterSelection = function (event, ui) {
        console.log("Aa");
        $("#member_id").val(ui.item.id);
    };

    /* ---------- FILTER / TABLE ---------- */
    this.bindFilterHandlers = function () {
        $(s.applyFiltersBtn)
            .off("click")
            .on("click", () => this.applyFilters());
        $(s.resetFiltersBtn)
            .off("click")
            .on("click", () => this.resetFilters());
        $(s.filters)
            .off("change")
            .on("change", () => this.toggleFilters());
        $(s.filterType)
            .off("change")
            .on("change", () => this.toggleFilterInput());
        $(s.filterValue)
            .off("input")
            .on("input", () => this.changeFilterInput());
    };

    this.addPenaltyHandlers = function () {
        this.validateForm();
        $(s.lmPenaltyModal).on(
            "hidden.bs.modal",
            this.resetPenaltyForm.bind(this)
        );
        $(s.lmPenaltyAddBtn).on("click", this.addPenalty.bind(this));
        $(s.lmPenaltyReset).on("click", this.resetPenaltyForm.bind(this));
    };

    $(document).on("click", "#lm_add_penalty_modal_btn", function () {
        const transactionId = $(this).data("id");
        $("#lm_penalty_transactionid").val(transactionId);
    });

    /**
     *
     * Form reset function
     *
     */
    this.resetPenaltyForm = () => {
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
                lm_penalty_transactionid: {
                    required: true,
                    pattern: /^[1-9][0-9]*$/,
                },
                lm_penalty_amount: {
                    required: true,
                    pattern: /^[1-9][0-9]*$/,
                    maxlength: 3,
                },
                lm_penalty_reason: {
                    required: true,
                    pattern: /^[a-zA-Z ]+$/,
                    minlength: 5,
                },
            },
            messages: {
                lm_penalty_transactionid: {
                    required: "Transaction Id is required",
                    pattern: "Transaction Id must be +ve Number",
                },
                lm_penalty_amount: {
                    required: "Penalty amount is required",
                    pattern: "Penalty amount must be +ve Number",
                    maxlength: "Penalty amount not excced the 999",
                },
                lm_penalty_reason: {
                    required: "Penalty reason is required",
                    pattern: "Penalty reason Only Letters",
                    minlength: "Minimum 5 characters",
                },
            },
        });
    };

    // ------------------ CRUD ------------------
    this.addPenalty = function () {
        if ($(s.lmPenaltyForm).valid()) {
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
                    $(s.loader).show();
                    let params = {
                        TransactionId: parseInt(
                            $(s.lmPenaltyTransactionId).val().trim()
                        ),
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
                        error: (xhr) => this.showAjaxError(xhr),
                    });
                }
            });
        }
    };

    /**
     *
     */
    this.toggleFilterInput = function () {
        const selected = $(s.filterType).val();
        if (selected && selected.toLowerCase() !== "all") {
            $(s.filterValue).prop("disabled", false);
            $(s.resetFiltersBtn).css("display", "block");
        } else {
            $(s.filterValue).prop("disabled", true).val("");
            $("#clear_filter_value").hide();
        }
        if ($.fn.DataTable.isDataTable(s.table)) {
            $(s.table).DataTable().clear().destroy();
            $(s.table).hide();
            $(s.lmFilterChanged).css("display", "block");
        }
    };
    this.changeFilterInput = function () {
        if ($.fn.DataTable.isDataTable(s.table)) {
            $(s.table).DataTable().clear().destroy();
            $(s.table).hide();
            $(s.lmFilterChanged).css("display", "block");
            $(s.resetFiltersBtn).css("display", "block");
        }
    };
    this.toggleFilters = function () {
        if ($.fn.DataTable.isDataTable(s.table)) {
            $(s.table).DataTable().clear().destroy();
            $(s.table).hide();
            $(s.lmFilterChanged).css("display", "block");
        }
        $(s.resetFiltersBtn).css("display", "block");
    };

    this.applyFilters = function () {
        $(s.loader).show();
        $(s.table).hide();
        $(s.lmFilterChanged).css("display", "none");
        $(s.resetFiltersBtn).css("display", "none");
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
            success: (res) => this.populateTable(res.object?.data || []),
            error: () => this.populateTable([]),
        });
    };

    this.buildFilterParams = function (length, status, col, field) {
        const base = { start: 0, length, order: "asec" };
        if (status !== "all") base.bookRentalStatus = status;
        if (col !== "all") {
            base.searchColumn = col;
            base.searchField = field;
        }
        return base;
    };

    this.populateTable = function (data) {
        if ($.fn.DataTable.isDataTable(s.table)) {
            $(s.table).DataTable().destroy();
        }
        console.log(data);

        $(s.table).DataTable({
            data,
            autoWidth: false,
            sort: false,
            destroy: true,
            dom: '<"top d-flex justify-content-end gap-2 "<"dt-left gap-2 d-flex align-items-center"> <"dt-right gap-2 d-flex align-items-center"p>>t<"bottom"ip>',
            lengthMenu: [10, 25, 50, 100],
            language: { emptyTable: "No data found" },
            columns: [
                {
                    title: "S.No",
                    data: null,
                    orderable: false,
                    render: (d, t, r, m) => m.row + 1,
                },
                {
                    title: "Member Name (Id)",
                    data: null,
                    className: "text-capitalize",
                    render: (d, t, r) => {
                        return `${r.memberName} (${r.memberId})`;
                    },
                },
                {
                    title: "Book Title (Id)",
                    data: null, // since we'll use both fields
                    className: "text-capitalize",
                    render: (data, type, row) => {
                        return `${row.bookTittle} (${row.bookId})`;
                    },
                },
                { title: "Quantity", data: "quantity" },
                { title: "Returned Qty", data: "bookReturnedQuantity" },
                { title: "Borrowed Date", data: "borrowedDate" },
                { title: "Return Due Date", data: "returnDueDate" },
                {
                    title: "Actual Return Date",
                    data: "actualReturnedDate",
                    render: (d, t, r) => {
                        if (r.actualReturnedDate === null) {
                            return `Not returned`;
                        } else {
                            return `${r.actualReturnedDate}`;
                        }
                    },
                },
                {
                    title: "Status",
                    data: "bookRentalStatus",
                    render: (d, t, row) => {
                        const bgColor =
                            row.bookRentalStatus === "Returned"
                                ? "#d4edda"
                                : "#f8d7da"; // light green / light red
                        const textColor =
                            row.bookRentalStatus === "Returned"
                                ? "#155724"
                                : "#721c24"; // dark text for contrast
                        return `<span class=" text-center mb-0 px-2" style="background-color:${bgColor};color:${textColor};
                                display:inline-block;
                                border-radius: 12px; 
                                padding: 2px 0px; 
                                margin: 0 auto;
                                width: 100px;
                                font-weight: 500;
                            ">
                              ${row.bookRentalStatus}</span>`;
                    },
                    className: "text-center",
                },
                {
                    title: "Action",
                    data: null,
                    orderable: false,
                    render: (d, t, row) =>
                        row.bookRentalStatus === "Borrowed"
                            ? `<button class="btn btn-md  update-rental"
                                        data-bs-toggle="tooltip"
                                       data-id="${row.transactionId}"
                                       data-bookid="${row.bookId}"
                                       data-quantity="${row.quantity}" data-booktittle="${row.bookTittle}" title="Return Book">
                                       <img src="../../assets/returning.png" alt="return book" height="25" width="25">
                                   </button>`
                            : `<span data-bs-toggle="tooltip" title="Already Returned"><button class="btn btn-md border-0" disabled>
                                       <img src="../../assets/already return.png" alt="already returned" height="25" width="25">
                                   </button></span>
                                  
                          <span data-bs-toggle="tooltip" title="Add Penalty">
                          <img  data-id="${row.transactionId}" style="cursor:pointer;"  data-bs-toggle="modal" 
                          data-bs-target="#lm_penalty_modal" id="lm_add_penalty_modal_btn" width="30" height="30" src="https://img.icons8.com/ios/100/add-dollar.png" alt="add-dollar"/>
                          </span>
                
                        `,
                },
            ],
            initComplete: function () {
                const dtLeft = $(".dt-left");
                if (dtLeft.children("#lm_borrow_modal_btn").length === 0) {
                    dtLeft.append(`
                      <button class="btn btn-warning text-white" data-bs-toggle="modal" data-bs-target="#borrow_modal" id="lm_borrow_modal_btn">
                        <!-- <i class="fa-solid fa-circle-plus fa-lg me-1"></i> -->
                        <img src="../../assets/borrow.png" alt="borrow book" height="25" width="25">
                        Borrow
                    </button>
                  `);
                }

                //   const dtRight = $('.dt-right');
                //   if (dtRight.children('#lm_return_modal_btn').length === 0) {
                //       dtRight.prepend(`
                //           <button class="btn btn-warning text-white" data-bs-toggle="modal" data-bs-target="#return_modal" id="lm_return_modal_btn">
                //         <!-- <i class="fa-solid fa-circle-minus fa-lg me-1"></i> -->
                //         <img src="../../assets/return.png" alt="return book" height="22" width="22" >
                //         Return
                //         </button>
                //       `);
                //   }
            },
            drawCallback: () => {
                document
                    .querySelectorAll('[data-bs-toggle="tooltip"]')
                    .forEach((el) => {
                        if (!bootstrap.Tooltip.getInstance(el))
                            new bootstrap.Tooltip(el);
                    });
                const dtLeft = $(".dt-left");
                if (dtLeft.children().length === 0) {
                    // avoid duplicates
                    dtLeft.prepend(`
                            <button id="transaction_pdf" class="btn btn-warning pagination-button text-white ms-3">
                                <i class="fa-solid fa-file-lines fa-lg me-1" style="color: #ffffff"></i>Generate All Transaction Pdf
                            </button>
                        `);
                }
            },
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
        $(s.filterValue).prop("disabled", true).val("");
        $(s.lmFilterChanged).css("display", "none");
        $("#clear_filter_value").hide();
    };
    function clearValidationErrors(modalSelector) {
        $(`${modalSelector} .text-danger.small`).text("");
    }
    /* ---------- BORROW ---------- */
    this.bindBorrowHandlers = function () {
        const $form = $(s.borrowForm);
        const container = $(s.booksContainer);
        const $tableBody = $("#added_books_table tbody");

        jQuery.validator.addMethod(
            "futureDate",
            function (value, element) {
                if (this.optional(element)) return true; // must be YYYY-MM-DD and after today
                const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
                if (!m) return false;

                const inputDate = new Date(`${m[3]}-${m[1]}-${m[2]}T00:00:00`);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                return inputDate > today && inputDate <= maxDate;
            },
            "Enter a valid date (MM-DD-YYYY) within one month from today."
        );

        const now = new Date();
        const maxDate = new Date();
        maxDate.setMonth(now.getMonth() + 1);

        $(".due_date").each(function () {
            const picker = new tempusDominus.TempusDominus(this, {
                localization: { format: "MM-dd-yyyy" }, // what the user sees
                restrictions: {
                    minDate: new tempusDominus.DateTime(now),
                    maxDate: new tempusDominus.DateTime(maxDate),
                },
                display: {
                    components: {
                        calendar: true,
                        date: true,
                        month: true,
                        year: true,
                    },
                },
            });
            $(this).data("tdPicker", picker);
            $(this).inputmask("99-99-9999");
        });
        $(document).on("click", ".input-group-text", function () {
            const input = $(this).siblings("input.due_date");
            const picker = input.data("tdPicker");
            if (picker) picker.show();
        });
        // base validation for member + single input row
        if (!$form.data("validator")) {
            $form.validate({
                ignore: [],
                rules: {
                    member_name: { required: true },
                    "lm_catalog_book_title[]": {
                        required: true,
                        pattern: "^[a-zA-Z ()0-9]+$",
                    },
                    "quantity[]": {
                        required: true,
                        digits: true,
                        minlength: 1,
                        maxlength: 10,
                    },
                    "due_date[]": { required: true, futureDate: true },
                },
                messages: {
                    member_name: { required: "Member name is required" },
                    "lm_catalog_book_title[]": {
                        required: "Book title is required",
                        pattern: "Invalid format",
                    },
                    "quantity[]": {
                        required: "Book quantity is required",
                        digits: "Digits only allowed",
                        min: "Must be greater than 0",
                        maxlength: "must be lesser than 11",
                    },
                    "due_date[]": {
                        required: "Due date is required",
                        futureDate: "Must be future date within 1 month",
                    },
                },
                errorElement: "span",
                errorClass: "text-danger small",
                errorPlacement: function (error, element) {
                    const $wrapper = element.closest(".input-with-error");
                    $wrapper.length
                        ? error.appendTo($wrapper)
                        : error.insertAfter(element);
                },
            });
        }

        const resetInputRow = () => {
            container.find("input").val("");
            container.find(".due_date").each(function () {
                $(this).inputmask("99-99-9999");
                new tempusDominus.TempusDominus(this, {
                    localization: { format: "MM-dd-YYYY" },
                    restrictions: {
                        minDate: new tempusDominus.DateTime(now),
                        maxDate: new tempusDominus.DateTime(maxDate),
                    },
                    display: {
                        components: {
                            calendar: true,
                            date: true,
                            month: true,
                            year: true,
                        },
                    },
                });
            });
            if ($form.data("validator")) {
                $form.validate().resetForm(); // clears error messages
                $form.find(".text-danger").remove(); // clears error <span> elements
            }
        };

        //Add-to-table handler
        $("#add_book_btn").on("click", () => {
            // validate only the book-entry fields, not the whole form
            if (!$form.valid()) return;

            const title = $form.find('[name="lm_catalog_book_title[]"]').val();
            const id = $form.find('[name="book_id[]"]').val();
            console.log("ID ", id);
            console.log("title" + title);
            const qty = $form.find('[name="quantity[]"]').val();
            const dueDate = $form.find('[name="due_date[]"]').val();
            const parts = dueDate.split("-");
            const dueDateISO = `${parts[2]}-${parts[0]}-${parts[1]}`;

            // append to table
            const rowCount = $tableBody.children().length;
            $tableBody.append(`
            <tr>
                <td>${rowCount + 1}</td>
                <td>${title}<input type="hidden" name="book_title[]" value="${title}"></td>
                <td>${qty}<input type="hidden" name="quantity_hidden[]" value="${qty}"></td>
                <td>${dueDate}<input type="hidden" name="due_date_hidden[]" value="${dueDateISO}"></td>
                <td>
                    <input type="hidden" name="book_id_hidden[]" value="${id}">
                    <button type="button" class="btn btn-sm btn-danger remove-book-row">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `);
            $tableBody
                .find(".remove-book-row")
                .last()
                .on("click", function () {
                    $(this).closest("tr").remove();
                    // Re-number S.No
                    $tableBody.find("tr").each((i, tr) =>
                        $(tr)
                            .children()
                            .first()
                            .text(i + 1)
                    );
                });

            // clear input row for next entry
            $form
                .find(
                    '[name="lm_catalog_book_title[]"], [name="quantity[]"], [name="due_date[]"], [name="book_id[]"]'
                )
                .val("");
        });

        // remove row
        $tableBody.on("click", ".remove-row", function () {
            $(this).closest("tr").remove();
            // re-number rows
            $tableBody.children("tr").each((i, tr) =>
                $(tr)
                    .children()
                    .first()
                    .text(i + 1)
            );
        });

        // Save button: build payload from table rows

        if (!$form.data("validator")) {
            $form.validate({
                rules: {
                    member_name: { required: true },
                    "lm_catalog_book_title[]": {
                        required: true,
                        pattern: "^[a-zA-Z ()0-9]+$",
                    },
                    "quantity[]": { required: true, numbersOnly: true, min: 1 },
                    "due_date[]": { required: true, futureDate: true },
                },
                messages: {
                    member_name: { required: "Member name is required" },
                    "lm_catalog_book_title[]": {
                        required: "Book name is required",
                        pattern: "Invalid format",
                    },
                    "quantity[]": {
                        required: "Quantity is required",
                        numbersOnly: "Digits only",
                        min: "Quantity must be at least 1",
                    },
                    "due_date[]": {
                        required: "Due date is required",
                        futureDate: "Due date must be after today",
                    },
                },
                errorElement: "span",
                errorClass: "text-danger small",
                errorPlacement: function (error, element) {
                    const $wrapper = element.closest(".input-with-error");
                    if ($wrapper.length) {
                        error.appendTo($wrapper); // always below input
                    } else {
                        error.insertAfter(element);
                    }
                },
            });
        }

        this.resetBorrowModal = function () {
            const $form = $(s.borrowForm); // your borrow form
            const $tableBody = $("#added_books_table tbody");

            // 1. Clear all form inputs
            $form[0].reset();

            // 2. Clear hidden fields (like book_id)
            $form.find('input[type="hidden"]').val("");

            // 3. Clear added books table
            $tableBody.empty();

            // 4. Reset datepickers/input masks
            $form.find(".due_date").each(function () {
                $(this).inputmask("99-99-9999");
                new tempusDominus.TempusDominus(this, {
                    localization: { format: "MM-dd-YYYY" },
                    restrictions: {
                        minDate: new tempusDominus.DateTime(now),
                        maxDate: new tempusDominus.DateTime(maxDate),
                    },
                    display: {
                        components: {
                            calendar: true,
                            date: true,
                            month: true,
                            year: true,
                        },
                    },
                });
            });
            if ($form.data("validator")) {
                $form.validate().resetForm(); // clears error messages
                $form.find(".text-danger").remove(); // clears error <span> elements
            }
            // 5. Optionally close the modal (if using Bootstrap)
            $(s.borrowModal).modal("hide");
        };

        // Save Button
        $(s.borrowSubmit).on("click", () => {
            const rowCount = $tableBody.children().length;
            if (rowCount === 0) {
                Swal.fire({
                    icon: "warning",
                    text: "Add at least one book to borrow.",
                });
                return;
            }

            if (!$form.validate().element("#member_name")) return;

            const books = [];
            $tableBody.find("tr").each(function () {
                const $tds = $(this).children();
                books.push({
                    bookId: +$tds
                        .eq(4)
                        .find('input[name="book_id_hidden[]"]')
                        .val(), // fetch bookId
                    quantity: +$tds
                        .eq(2)
                        .find('input[name="quantity_hidden[]"]')
                        .val(),
                    returnDueDate: $tds
                        .eq(3)
                        .find('input[name="due_date_hidden[]"]')
                        .val(),
                });
            });

            const payload = {
                memberId: +$("#member_id").val(),
                books,
            };

            this.ajaxBorrow(payload, $tableBody, () => {
                $tableBody.empty();
                resetInputRow();
            });
        });

        // Cancel/Reset
        $(s.borrowCancel).on("click", () => {
            $tableBody.empty();
            resetInputRow();
            $form[0].reset();
        });
        $("#borrow_modal").on("hidden.bs.modal", function(){
            $tableBody.empty();
            resetInputRow();
            $form[0].reset();             
        })  
        // Initialize datepicker/inputmask on initial row
        container.find(".due_date").each(function () {
            $(this).inputmask("99-99-9999");
            new tempusDominus.TempusDominus(this, {
                localization: { format: "yyyy-MM-dd" },
                restrictions: {
                    minDate: new tempusDominus.DateTime(now),
                    maxDate: new tempusDominus.DateTime(maxDate),
                },
                display: {
                    components: {
                        calendar: true,
                        date: true,
                        month: true,
                        year: true,
                    },
                },
            });
        });
    };

    this.ajaxBorrow = function (payload, container, updater) {
        $(s.loader).show();
        console.log(payload);

        $.ajax({
            url: `${apiBase}/borrowBooks`,
            type: "POST",
            data: JSON.stringify(payload),
            contentType: "application/json",
            success: (res) => {
                $(s.loader).hide();
                $(s.borrowModal).modal("hide");
                this.resetBorrowModal();
                Swal.fire({
                    icon: "success",
                    title: "Borrowed",
                    text: `✅ ${res.object}`,
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => $(s.applyFiltersBtn).click());
            },
            error: (xhr) => this.showAjaxError(xhr),
        });
    };

    $("#return_modal").on("shown.bs.modal", function () {
        const form = $("#return_form");

        if (!form.data("validator")) {
            // Only initialize once
            form.validate({
                rules: {
                    "book-id[]": { required: true, number: true },
                    "quantity[]": { required: true, number: true, min: 1 },
                    "transaction-id[]": { required: true, number: true },
                },
                messages: {
                    "book-id[]": {
                        required: "Book ID is required",
                        number: "Book ID must be a number",
                    },
                    "quantity[]": {
                        required: "Quantity is required",
                        number: "Quantity must be a number",
                        min: "Quantity must be at least 1",
                    },
                    "transaction-id[]": {
                        required: "Transaction ID is required",
                        number: "Transaction ID must be a number",
                    },
                },
                errorElement: "span", // use <span> for error
                errorClass: "text-danger small", // bootstrap class + custom size
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
            g.find('input[name="book-id[]"]').rules("add", {
                required: true,
                number: true,
            });
            g.find('input[name="quantity[]"]').rules("add", {
                required: true,
                number: true,
                min: 1,
            });
            g.find('input[name="transaction-id[]"]').rules("add", {
                required: true,
                number: true,
            });
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
                const id = $(this).find(".book-id").val().trim();
                const qty = $(this).find(".quantity").val().trim();
                const trans = $(this).find(".transaction-id").val().trim();
                books.push({
                    bookId: +id,
                    quantity: +qty,
                    transactionId: +trans,
                });
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
                    Swal.fire({
                        icon: "success",
                        title: "Returned",
                        text: `✅ Books Returned Successfully`,
                        timer: 4000,
                        showConfirmButton: false,
                    }).then(() => $(s.applyFiltersBtn).click());
                },
                error: (xhr) => this.showAjaxError(xhr),
            });
        });
    };

    /* ---------- UPDATE ---------- */
    this.bindUpdateHandlers = function () {
        $(document).on("click", ".update-rental", function () {
            $(s.updateTransaction).val($(this).data("id"));
            $(s.updateBookId).val($(this).data("bookid"));
            $("#lm_returning_book_title").text($(this).data("booktittle"));
            $(s.updateQuantity).val($(this).data("quantity"));
            $(s.updateRentalModal).modal("show");
        });
        $("#update_single_book_form").validate({
            ignore: [],
            onkeyup: false,
            rules: {
                update_quantity: {
                    required: true,
                    minlength: 1,
                    maxlength: 999,
                },
            },
            messages: {
                update_quantity: {
                    required: "Return Book quantity is required",
                    minlength: "Minimum 1 book want to return",
                    maxlength: "Don't exceed 999",
                },
            },
        });

        $(s.updateRentalBtn).on("click", () => {
            if ($("#update_single_book_form").valid()) {
                const params = [
                    {
                        transactionId: +$(s.updateTransaction).val(),
                        bookId: +$(s.updateBookId).val(),
                        quantity: +$(s.updateQuantity).val().trim(),
                    },
                ];
                $(s.loader).show();
                $.ajax({
                    url: `${apiBase}/returnBooks`,
                    method: "POST",
                    data: JSON.stringify(params),
                    contentType: "application/json",
                    success: () => {
                        $(s.loader).hide();
                        $(s.updateRentalModal).modal("hide");
                        Swal.fire({
                            icon: "success",
                            title: "Returned",
                            text: "✅ Book Returned Successfully",
                            timer: 2000,
                            showConfirmButton: false,
                        }).then(() => $(s.applyFiltersBtn).click());
                    },
                    error: (xhr) => this.showAjaxError(xhr),
                });
            }
        });
    };

    /* ---------- Tempus Dominus delegated handlers ---------- */
    this.bindDatePickers = function () {
        // create default picker when borrow modal is shown
        $(document).on("shown.bs.modal", s.borrowModal, () => {
            const addInput = document.querySelector(
                "#books_container .due_date"
            );
            if (addInput && !this.addDueDp) {
                this.addDueDp = new tempusDominus.TempusDominus(addInput, {
                    localization: { format: "yyyy-MM-dd" },
                    restrictions: {
                        minDate: new tempusDominus.DateTime(new Date()),
                    },
                });
            }
        });

        // create update picker when update modal is shown
        $(document).on("shown.bs.modal", s.updateRentalModal, () => {
            const updInput = document.querySelector(s.updateDueInput);
            if (updInput) {
                // dispose old picker if it exists
                if (this.updateDueDp && this.updateDueDp.dispose)
                    this.updateDueDp.dispose();
                this.updateDueDp = new tempusDominus.TempusDominus(updInput, {
                    localization: { format: "yyyy-MM-dd" },
                    restrictions: {
                        minDate: new tempusDominus.DateTime(new Date()),
                    },
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
                    Swal.fire({
                        icon: "success",
                        title: "Generated",
                        text: `✅ ${res.object}`,
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                error: (xhr) => this.showAjaxError(xhr),
            });
        });
    };

    /* ---------- Helper ---------- */
    this.showAjaxError = function (xhr) {
        $(s.loader).hide();
        const msg = xhr?.responseJSON?.object || "Unexpected error";
        Swal.fire({
            icon: "error",
            title: "Error",
            text: `❌ ${msg}`,
            confirmButtonColor: "#3085d6",
        });
    };
};

/* ---------- INITIALIZE ---------- */

const RentalTransactionInstance = new RentalTransaction();
RentalTransactionInstance.init();
