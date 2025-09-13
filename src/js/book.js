const Books = function () {
    const nameRegex = /^[A-Za-z0-9\s]+$/;
    const numberRegex = /^[0-9]+$/;
    this.displayBooksTable = function () {
        $("#apply_filters").off("click").on("click", function () {
            $("#loader").show();
            $("#user_table").hide();

            let filter_type = $("#filter_type").val();
            let filter_value = $("#filter_value").val().trim();
            let status = $("#filter_status").val();
            let length = $("#custom_length").val();
            let apiUrl = "http://localhost:8080/LibraryManagementSystem/Books/getAllBooks";

            let params = {
                start: 0,
                length: length,
            };

            if (status !== "all" && filter_type !== "all" && filter_value !== "") {
                params = {
                    start: 0,
                    length: length,
                    searchColumn: filter_type,
                    searchValue: filter_value,
                    BookAvailablity: status,
                };
            } else if (status === "all" && filter_type !== "all" && filter_value !== "") {
                params = {
                    start: 0,
                    length: length,
                    searchColumn: filter_type,
                    searchValue: filter_value,
                };
            } else if (status !== "all" && filter_type === "all" && filter_value === "") {
                params = {
                    start: 0,
                    length: length,
                    BookAvailablity: status,
                };
            }

            $.ajax({
                method: "GET",
                url: apiUrl,
                data: params,
                dataType: "json",
                success: function (res) {
                    let data = [];
                    console.log(res);

                    if (res.object?.data) {
                        data = res.object.data;
                    } else if (Array.isArray(res.object)) {
                        data = res.object;
                    } else if (res.object) {
                        data = [res.object];
                    }

                    if ($.fn.DataTable.isDataTable("#user_table")) {
                        $("#user_table").DataTable().destroy();
                    }

                    table = $("#user_table").DataTable({
                        data: data,
                        sort: false,
                        destroy: true,
                        dom: '<"top"<"custom-length">lp>t<"bottom"ip>',
                        lengthMenu: [10, 25, 50, 100],
                        language: {
                            emptyTable: "No data found",
                        },
                        columns: [
                            { title: "Book ID", data: "bookId" },
                            { title: "Title", data: "title" },
                            { title: "Language", data: "language" },
                            { title: "Author", data: "author" },
                            { title: "Book Reg. Date", data: "bookRegistrationDate" },
                            { title: "Total Count", data: "totalCount" },
                            {
                                title: "Status",
                                data: "bookStatus",
                                render: function (data, type, row) {
                                    if (row.bookStatus === "Available") {
                                        return `<div><p class="bg-success rounded-5 text-white">${row.bookStatus}</p></div>`;
                                    } else {
                                        return `<div><p class="bg-danger rounded-5 text-white">${row.bookStatus}</p></div>`;
                                    }
                                },
                            },
                            {
                                title: "Actions",
                                data: null,
                                orderable: false,
                                render: function (data, type, row) {
                                    return `
                                        <button class="btn btn-sm btn-warning me-2 update-book" 
                                            data-bs-toggle="modal" 
                                            data-bs-target="#update_modal" 
                                            data-id="${row.bookId}">
                                            <i class="fa-solid fa-pen-to-square" style="color:#fff"></i>
                                        </button>
                                        <button class="btn btn-sm btn-danger delete-book" data-id="${row.bookId}">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>`;
                                },
                            },
                        ],
                    });

                    $("#loader").hide();
                    $("#user_table").show();
                },
                error: function () {
                    if ($.fn.DataTable.isDataTable("#user_table")) {
                        $("#user_table").DataTable().destroy();
                    }

                    $("#user_table").DataTable({
                        data: [],
                        sort: false,
                        destroy: true,
                        dom: '<"top">t<"bottom"ip>',
                        language: { emptyTable: "No data found" },
                        columns: [
                            { title: "Book ID", data: "bookId" },
                            { title: "Title", data: "title" },
                            { title: "Language", data: "language" },
                            { title: "Author", data: "author" },
                            { title: "Book Reg. Date", data: "bookRegistrationDate" },
                            { title: "Total Count", data: "totalCount" },
                            { title: "Status", data: "bookStatus" },
                            { title: "Borrowed Count", data: "borrowedCount" },
                            { title: "Actions", data: null },
                        ],
                    });

                    $("#loader").hide();
                    $("#user_table").show();
                },
            });
        });
        $("#cancel").on("click", function () {
            resetForm();
        });
    };

    this.generateAvailableBookPdf = function () {
        $(document).on("click", "#book_pdf", function () {
            $("#loader").show();
            $.ajax({
                url: "http://localhost:8080/LibraryManagementSystem/Books/getBookPDF",
                method: "GET",
                dataType: "json",
                success: function (res) {
                    $("#loader").hide();
                    Swal.fire({
                        icon: "success",
                        title: "Generated",
                        text: "✅ " + res.object,
                        showConfirmButton: false,
                        timer: 2000,
                    });
                },
                error: function () {
                    $("#loader").hide();
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "❌ Failed to Generate Available Book",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                },
            });
        });
    };

    let total__count = "";
    let bookId = "";
    this.getBookDetailsById = function () {
        $(document).on("click", ".update-book", function () {
            let bookId = $(this).data("id");
            $("#loader").show();
            $.ajax({
                url: `http://localhost:8080/LibraryManagementSystem/Books/getBookById/${bookId}`,
                method: "GET",
                dataType: "json",
                success: function (res) {
                    $("#loader").hide();
                    let book = res.object;
                    bookId = book.bookId;
                    console.log(bookId)
                    $("#title_update").val(book.title);
                    $("#author_update").val(book.author);
                    $("#language_update").val(book.language);
                    $("#total_count").val(book.totalCount);
                    $("#update_modal").data("bookId", bookId);
                    $("#update_modal").modal("show");
                },
                error: function () {
                    $("#loader").hide();
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Failed to fetch book details.",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                },
            });
        });
    };

    this.deleteBookById = function () {
        $(document).on("click", ".delete-book", function () {
            let bookId = $(this).data("id");
            Swal.fire({
                icon: "warning",
                title: "Are you sure?",
                text: "This action cannot be undone!",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
            }).then((result) => {
                if (result.isConfirmed) {
                    $("#loader").show();
                    $.ajax({
                        url: `http://localhost:8080/LibraryManagementSystem/Books/deleteBook/${bookId}`,
                        method: "PUT",
                        success: function () {
                            $("#loader").hide();
                            Swal.fire({
                                icon: "success",
                                title: "Deleted!",
                                text: "The book was removed.",
                                showConfirmButton: false,
                                timer: 2000,
                            });
                            $("#reset_filters").click();
                            $("#apply_filters").click();
                        },
                        error: function () {
                            $("#loader").hide();
                            Swal.fire({
                                icon: "error",
                                title: "Failed",
                                text: "Could not delete book.",
                                showConfirmButton: false,
                                timer: 2000,
                            });
                        },
                    });
                }
            });
        });
    };

    this.resetFiltersApplied = function () {
        $("#reset_filters")
            .off("click")
            .on("click", function () {
                $("#filter_type").val("all");
                $("#filter_value").val("");
                $("#filter_status").val("all");
                $("#custom_length").val("10");

                if ($.fn.DataTable.isDataTable("#user_table")) {
                    $("#user_table").DataTable().clear().destroy();
                    $("#user_table").hide();
                }
            });
    };

    this.validateField = function (id, regex, errorId, errorMessage) {
       

        let value = $(id).val().trim();
        if (value === "") {
            $(errorId).text("Required Field.");
            return false;
        } else if (regex && !regex.test(value)) {
            $(errorId).text(errorMessage);
            return false;
        } else {
            $(errorId).text("");
            return true;
        }
    };

    this.updateBookDetails = function () {
      const that = this;
        $("#update_btn").on("click", function () {
            let validTitle = that.validateField("#title_update", nameRegex, "#update_title_error", "Only letters and numbers allowed.");
            let validAuthor = that.validateField("#author_update", nameRegex, "#update_author_error", "Only letters and numbers allowed.");
            let validLanguage = that.validateField("#language_update", nameRegex, "#language_error", "Only letters and numbers allowed.");
            let validTotalCount = that.validateField("#total_count", numberRegex, "#update_total_error", "Only numbers allowed.");

            if (total__count <= $("#total_count").val()) {
                validTotalCount = true;
            } else {
                $("#update_total_error").text("Must Be Greater than previous count");
                validTotalCount = false;
            }
            const bookId = $("#update_modal").data("bookId");
            console.log(bookId)
            if (validTitle && validAuthor && validLanguage && validTotalCount) {
                let requestData = {
                    bookId: parseInt(bookId),
                    title: $("#title_update").val().trim(),
                    author: $("#author_update").val().trim(),
                    language: $("#language_update").val().trim(),
                    totalCount: $("#total_count").val().trim(),
                };
                $("#loader").show();
                $.ajax({
                    url: "http://localhost:8080/LibraryManagementSystem/Books/updateBookDetails",
                    type: "PUT",
                    data: JSON.stringify(requestData),
                    contentType: "application/json",
                    success: function () {
                        $("#loader").hide();
                        $("#update_modal").modal("hide");
                        resetForm();
                        Swal.fire({
                            icon: "success",
                            title: "Book Updated",
                            text: "✅ Your book was Updated successfully!",
                            showConfirmButton: false,
                            timer: 2000,
                        }).then(() => {
                            $("#apply_filters").click();
                        });
                    },
                    error: function (xhr) {
                        let message = "Something went wrong.";
                        if (xhr.responseJSON) {
                            if (xhr.responseJSON.message) message = xhr.responseJSON.message;
                            if (xhr.responseJSON.object) {
                                let errors = Object.values(xhr.responseJSON.object).join("\n");
                                message = errors;
                            }
                        }
                        $("#loader").hide();
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "❌ " + message,
                            showConfirmButton: false,
                            timer: 2000,
                        });
                    },
                });
            }
        });
    };

    this.addNewBook = function () {
      const that = this;
        $("#add_btn").on("click", function () {
            let validTitle = that.validateField("#title", nameRegex, "#title_error", "Only letters and numbers allowed.");
            let validAuthor = that.validateField("#author", nameRegex, "#author_error", "Only letters and numbers allowed.");
            let validLanguage = that.validateField("#language", nameRegex, "#language_error", "Only letters and numbers allowed.");
            let validQuantity = that.validateField("#quantity", numberRegex, "#quantity_error", "Only numbers allowed.");

            if (validTitle && validAuthor && validQuantity && validLanguage) {
                let requestData = {
                    title: $("#title").val().trim(),
                    author: $("#author").val().trim(),
                    totalCount: parseInt($("#quantity").val().trim()),
                    language: $("#language").val().trim(),
                };
                $("#loader").show();
                $.ajax({
                    url: "http://localhost:8080/LibraryManagementSystem/Books/addNewBook",
                    type: "POST",
                    data: JSON.stringify(requestData),
                    contentType: "application/json",
                    success: function () {
                        $("#loader").hide();
                        $("#example_modal").modal("hide");
                        resetForm();
                        Swal.fire({
                            icon: "success",
                            title: "Book Saved",
                            text: "✅ Your book was added successfully!",
                            showConfirmButton: false,
                            timer: 2000,
                        }).then(() => {
                            $("#apply_filters").click();
                        });
                    },
                    error: function (xhr) {
                        let message = "Something went wrong.";
                        if (xhr.responseJSON) {
                            if (xhr.responseJSON.message) message = xhr.responseJSON.message;
                            if (xhr.responseJSON.object) {
                                let errors = Object.values(xhr.responseJSON.object).join("\n");
                                message = errors;
                            }
                        }
                        $("#loader").hide();
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "❌ " + message,
                            showConfirmButton: false,
                            timer: 2000,
                        });
                    },
                });
            }
        });
    };

   
      function resetForm(){ 
        $("#title, #author, #language, #quantity").val("");
        $("#title_error, #author_error, #language_error, #quantity_error").text("");
    
    }
    $("#example_modal").on("hidden.bs.modal", function () {
        resetForm();
    });
};

const books = new Books();
books.displayBooksTable();
books.generateAvailableBookPdf();
books.getBookDetailsById();
books.deleteBookById();
books.resetFiltersApplied();
//
books.updateBookDetails();
books.addNewBook();

