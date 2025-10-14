$(document).ready(() => {
    const custom_elements = "./template-custom-elements.html";
    $("#book_add").load(custom_elements, () => {
        $("#book_add").append("<book-add-edit-modal></book-add-edit-modal>");
        const script = document.createElement("script");
        script.src = "js/add.or.update.book.js";
        document.body.appendChild(script);
    });
});

const Books = function () {
    // ----------------- CENTRAL SELECTOR MAP -----------------
    const selectors = {
        loader: "#loader",
        dataTable: "#user_table",

        // Filter section
        lmBookFilterApplyBtn: "#lm_book_apply_filters",
        lmBookFilterResetBtn: "#reset_filters",
        lmBookFilterType: "#filter_type",
        lmBookFilterValue: "#filter_value",
        filterStatus: "#filter_status",
        filterLength: "#custom_length",
        filters: ".filters",
        lmFilterChanged: "#lm_filter_changed",

        // Table row actions
        updateBookBtn: ".update-book",
        deleteBookBtn: ".delete-book",

        // Generate PDF
        generatePdfBtn: "#book_pdf",
    };

    const resetForm = function () {
        $(
            selectors.addTitle +
                "," +
                selectors.addAuthor +
                "," +
                selectors.addLanguage +
                "," +
                selectors.addQuantity
        ).val("");

        $(
            selectors.addTitleError +
                "," +
                selectors.addAuthorError +
                "," +
                selectors.addLanguageError +
                "," +
                selectors.addQuantityError
        ).text("");
    };

    // -------------------------------------------------------
    this.resetAddBookModalFields = function () {
        $(document).on("click", selectors.addCancelBtn, resetForm);
    };

    this.bookFilter = function () {
        const input = $("#filter_value");
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

    this.displayBooksTable = function () {
        $(document).on("click", selectors.lmBookFilterApplyBtn, function () {
            $(selectors.loader).show();
            $(selectors.dataTable).hide();
            $(selectors.lmFilterChanged).css("display", "none");
            $(selectors.lmBookFilterResetBtn).css("display", "none");
            const lmBookFilterType = $(selectors.lmBookFilterType).val();
            const lmBookFilterValue = $(selectors.lmBookFilterValue)
                .val()
                .trim();
            const status = $(selectors.filterStatus).val();
            const length = $(selectors.filterLength).val();

            let params = { start: 0, length };

            if (
                status !== "all" &&
                lmBookFilterType !== "all" &&
                lmBookFilterValue !== ""
            ) {
                params = {
                    start: 0,
                    length,
                    searchColumn: lmBookFilterType,
                    searchValue: lmBookFilterValue,
                    BookAvailablity: status,
                };
            } else if (
                status === "all" &&
                lmBookFilterType !== "all" &&
                lmBookFilterValue !== ""
            ) {
                params = {
                    start: 0,
                    length,
                    searchColumn: lmBookFilterType,
                    searchValue: lmBookFilterValue,
                };
            } else if (
                status !== "all" &&
                lmBookFilterType === "all" &&
                lmBookFilterValue === ""
            ) {
                params = { start: 0, length, BookAvailablity: status };
            }

            $.ajax({
                method: "GET",
                url: "http://localhost:8080/LibraryManagementSystem/Books/getAllBooks",
                data: params,
                dataType: "json",
                success: function (res) {
                    let data = [];
                    if (res.object?.data) data = res.object.data;
                    else if (Array.isArray(res.object)) data = res.object;
                    else if (res.object) data = [res.object];

                    if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
                        $(selectors.dataTable).DataTable().destroy();
                    }

                    $(selectors.dataTable).DataTable({
                        data,
                        autoWidth: false,
                        sort: false,
                        destroy: true,
                        dom: '<"top d-flex justify-content-end gap-2 "<"dt-left gap-2 d-flex align-items-center"> <"dt-right gap-2 d-flex align-items-center">p>t<"bottom"ip>',
                        lengthMenu: [10, 25, 50, 100],
                        language: { emptyTable: "No data found" },
                        columns: [
                            {
                                title: "S.No",
                                data: null, // no field from the data source
                                orderable: false,
                                searchable: false,
                                render: (data, type, row, meta) => meta.row + 1, // row index + 1
                            },
                            {
                                title: "Book Title",
                                data: "title",
                                className: "text-capitalize",
                            },
                            {
                                title: "Language",
                                data: "language",
                                className: "text-capitalize",
                            },
                            {
                                title: "Author",
                                data: "author",
                                className: "text-capitalize",
                            },
                            {
                                title: "Registration Date",
                                data: "bookRegistrationDate",
                                width: "200px",
                            },
                            { title: "Book Quantity", data: "totalCount" },
                            {
                                title: "Borrowed Quantity",
                                data: "borrowedCount",
                            },
                            {
                                title: "Available Quantity",
                                data: "availableStockCount",
                            },
                            {
                                title: "Status",
                                data: "bookStatus",
                                render: (d, t, row) => {
                                    const bgColor =
                                        row.bookStatus === "Available"
                                            ? "#d4edda"
                                            : "#f8d7da"; // light green / light red
                                    const textColor =
                                        row.bookStatus === "Available"
                                            ? "#155724"
                                            : "#721c24"; // dark text for contrast
                                    let bookstatus = "";
                                    if (row.bookStatus === "Available") {
                                        bookstatus = "Available";
                                    } else bookstatus = "Checked Out";
                                    return `<p style="
                      background-color: ${bgColor}; 
                      color: ${textColor}; 
                      border-radius: 12px; 
                      padding: 2px 12px; 
                      margin: 0 auto;
                      width: 115px;
                      text-align: center;
                      font-weight: 500;
                  ">${bookstatus}</p>`;
                                },
                                className: "text-center", // center the column itself
                            },
                            {
                                title: "Action",
                                data: null,
                                orderable: false,
                                className: "text-center action-cell",
                                createdCell: function (
                                    td,
                                    cellData,
                                    rowData,
                                    row,
                                    col
                                ) {
                                    // add your own custom class and width here
                                    $(td)
                                        .addClass("action-cell") // custom class
                                        .css({
                                            "min-width": "100px",
                                            "white-space": "nowrap",
                                            display: "flex",
                                            "justify-content": "center",
                                            "align-items": "center",
                                            gap: "16px",
                                        });
                                },
                                render: (d, t, row) => `
                  
                    <i class="fa-solid fa-pen-to-square text-grey cursor-pointer i-btn-dark  update-book" data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Edit Book Details" data-id="${row.bookId}" ></i>
                  
                 
                    <i class="fa-solid fa-trash text-danger delete-book cursor-pointer" data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Delete" data-id="${row.bookId}" ></i>
                  `,
                                className: "text-center",
                            },
                        ],
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

                            const dtLeft = $(".dt-left");
                            if (dtLeft.children("#book_pdf").length === 0) {
                                dtLeft.append(`
                      <button id="book_pdf" class="btn btn-md btn-warning text-white pagination-button">
                          <i class="fa-solid fa-file-lines fa-lg"></i> Generate Available Books PDF
                      </button>
                  `);
                            }

                            const dtRight = $(".dt-right");
                            if (
                                dtRight.children("#add_new_book").length === 0
                            ) {
                                dtRight.prepend(`
                      <button id="add_new_book" class="btn btn-warning text-white">
                          <i class="fa-solid fa-circle-plus fa-lg me-1" style="color:#ffffff"></i>
                          Add Book
                      </button>
                  `);
                            }
                        },
                    });

                    $(selectors.loader).hide();
                    $(selectors.dataTable).show();
                },
                error: function () {
                    if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
                        $(selectors.dataTable).DataTable().destroy();
                    }
                    $(selectors.dataTable).DataTable({
                        data: [],
                        columns: [
                            {
                                title: "S.No",
                                data: null, // no field from the data source
                                orderable: false,
                                searchable: false,
                                render: (data, type, row, meta) => meta.row + 1, // row index + 1
                            },
                            {
                                title: "Book Id",
                                data: "bookId",
                                render: (d, t, r) => `#${r.bookId}`,
                            },
                            {
                                title: "Title",
                                data: "title",
                                className: "text-capitalize",
                            },
                            {
                                title: "Language",
                                data: "language",
                                className: "text-capitalize",
                            },
                            {
                                title: "Author",
                                data: "author",
                                className: "text-capitalize",
                            },
                            {
                                title: "Registration Date",
                                data: "bookRegistrationDate",
                                width: "200px",
                            },
                            { title: "Book Quantity", data: "totalCount" },
                            {
                                title: "Borrowed Quantity",
                                data: "borrowedCount",
                            },
                            {
                                title: "Available Quantity",
                                data: "availableStockCount",
                            },
                            {
                                title: "Status",
                                data: "bookStatus",
                                render: (d, t, row) => {
                                    const bgColor =
                                        row.bookStatus === "Available"
                                            ? "#d4edda"
                                            : "#f8d7da"; // light green / light red
                                    const textColor =
                                        row.bookStatus === "Available"
                                            ? "#155724"
                                            : "#721c24"; // dark text for contrast

                                    return `<p style="
                      background-color: ${bgColor}; 
                      color: ${textColor}; 
                      border-radius: 12px; 
                      padding: 2px 12px; 
                      margin: 0 auto;
                      width: 100px;
                      text-align: center;
                      font-weight: 500;
                  ">${row.bookStatus}</p>`;
                                },
                                className: "text-center", // center the column itself
                            },
                            {
                                title: "Action",
                                data: null,
                                orderable: false,
                                className: "text-center action-cell",
                                createdCell: function (
                                    td,
                                    cellData,
                                    rowData,
                                    row,
                                    col
                                ) {
                                    // add your own custom class and width here
                                    $(td)
                                        .addClass("action-cell") // custom class
                                        .css({
                                            "min-width": "100px",
                                            "white-space": "nowrap",
                                            display: "flex",
                                            "justify-content": "center",
                                            "align-items": "center",
                                            gap: "16px",
                                        });
                                },
                                render: (d, t, row) => `
                  
                    <i class="fa-solid fa-pen-to-square text-grey cursor-pointer i-btn-dark  update-book" data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Edit" data-id="${row.bookId}" ></i>
                    <i class="fa-solid fa-trash text-danger delete-book cursor-pointer" data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Delete" data-id="${row.bookId}" ></i>
                  `,
                                className: "text-center",
                            },
                        ],
                        sort: false,
                        destroy: true,
                        dom: '<"top">t<"bottom"ip>',
                        language: { emptyTable: "No data found" },
                    });
                    $(selectors.loader).hide();
                    $(selectors.dataTable).show();
                },
            });
        });

        // also reset form on cancel
        $(document).on("click", selectors.addCancelBtn, resetForm);
    };

    // -------------------------------------------------------
    this.generateAvailableBookPdf = function () {
        $(document).on("click", selectors.generatePdfBtn, function () {
            $(selectors.loader).show();
            $.ajax({
                url: "http://localhost:8080/LibraryManagementSystem/Books/getBookPDF",
                method: "GET",
                dataType: "json",
                success: function (res) {
                    $(selectors.loader).hide();
                    Swal.fire({
                        icon: "success",
                        title: "Generated",
                        text: "✅ " + res.object,
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
                error: function () {
                    $(selectors.loader).hide();
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "❌ Failed to Generate Available Book",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
            });
        });
    };

    // -------------------------------------------------------
    this.getBookDetailsById = function () {
        $(document).on("click", selectors.updateBookBtn, function () {
            const id = $(this).data("id");
            $(selectors.loader).show();
            $.ajax({
                url: `http://localhost:8080/LibraryManagementSystem/Books/getBookById/${id}`,
                method: "GET",
                dataType: "json",
                success: function (res) {
                    $(selectors.loader).hide();
                    const book = res.object;
                    bookId = book.bookId;
                    totalCountPrev = book.totalCount;
                    const modalEl = document.querySelector(
                        "book-add-edit-modal"
                    );
                    if (modalEl) {
                        modalEl.open({
                            bookId: book.bookId,
                            title: book.title,
                            author: book.author,
                            language: book.language,
                            totalCount: book.totalCount,
                        });
                    }
                },
                error: function () {
                    $(selectors.loader).hide();
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to fetch book details.",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                },
            });
        });
    };

    // -------------------------------------------------------
    this.deleteBookById = function () {
        $(document).on("click", selectors.deleteBookBtn, function () {
            const id = $(this).data("id");
            Swal.fire({
                icon: "danger",
                title: '<i class="fa-solid fa-trash-can me-2 text-danger" style="font-size:60px;"></i> <br><br> Are you sure?',
                text: "This action cannot be undone!",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
                customClass: {
                    confirmButton: "btn-dark",
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    $(selectors.loader).show();
                    $.ajax({
                        url: `http://localhost:8080/LibraryManagementSystem/Books/deleteBook/${id}`,
                        method: "PUT",
                        success: function () {
                            $(selectors.loader).hide();
                            Swal.fire({
                                icon: "success",
                                title: "Deleted!",
                                text: "The book was removed.",
                                timer: 2000,
                                showConfirmButton: false,
                            });
                            $(selectors.lmBookFilterResetBtn).click();
                            $(selectors.lmBookFilterApplyBtn).click();
                        },
                        error: function () {
                            $(selectors.loader).hide();
                            Swal.fire({
                                icon: "error",
                                title: "Failed",
                                text: "Could not delete book.",
                                timer: 2000,
                                showConfirmButton: false,
                            });
                        },
                    });
                }
            });
        });
    };

    // -------------------------------------------------------
    this.resetFiltersApplied = function () {
        $(document).on("click", selectors.lmBookFilterResetBtn, function () {
            $(selectors.lmBookFilterType).val("all");
            $(selectors.lmBookFilterValue).val("");
            $(selectors.filterStatus).val("all");
            $(selectors.filterLength).val("10");
            $("#clear_filter_value").hide();
            if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
                $(selectors.dataTable).DataTable().clear().destroy();
                $(selectors.dataTable).hide();
                $(selectors.lmFilterChanged).css("display", "none");
            }
            $(selectors.lmBookFilterValue).prop("disabled", true).val("");
        });
    };

    this.toggleFilters = function () {
        $(document).on("change", selectors.filters, function () {
            if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
                $(selectors.dataTable).DataTable().clear().destroy();
                $(selectors.dataTable).hide();
                $(selectors.lmFilterChanged).css("display", "block");
                $(selectors.lmBookFilterResetBtn).css("display", "block");
            }
        });
    };

    this.changeFilterValue = function () {
        $(document).on("input", selectors.lmBookFilterValue, function () {
            if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
                $(selectors.dataTable).DataTable().clear().destroy();
                $(selectors.dataTable).hide();
                $(selectors.lmFilterChanged).css("display", "block");
                $(selectors.lmBookFilterResetBtn).css("display", "block");
            }
        });
    };

    this.toggleFilterInput = function () {
        // use the top-level constant directly
        $(document).on("change", selectors.lmBookFilterType, function () {
            const selected = $(selectors.lmBookFilterType).val();

            if (selected && selected.toLowerCase() !== "all") {
                $(selectors.lmBookFilterValue).prop("disabled", false);
                $(selectors.lmFilterChanged).css("display", "block");
            } else {
                // disable and clear when “all” is chosen
                $(selectors.lmBookFilterValue).prop("disabled", true).val("");
                $("#clear_filter_value").hide();
            }
        });
    };
};
// ------------------- INITIALISE -------------------------

const books = new Books();
books.displayBooksTable();
books.generateAvailableBookPdf();
books.getBookDetailsById();
books.deleteBookById();
books.resetFiltersApplied();
books.resetAddBookModalFields();
books.toggleFilters();
books.changeFilterValue();
books.toggleFilterInput();
books.bookFilter();
