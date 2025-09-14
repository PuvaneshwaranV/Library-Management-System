// ----------------- CENTRAL SELECTOR MAP -----------------
const selectors = {
  loader:              "#loader",
  dataTable:           "#user_table",

  // Filter section
  filterApplyBtn:      "#apply_filters",
  filterResetBtn:      "#reset_filters",
  filterType:          "#filter_type",
  filterValue:         "#filter_value",
  filterStatus:        "#filter_status",
  filterLength:        "#custom_length",

  // Add book modal
  addModal:            "#example_modal",
  addBtn:              "#add_btn",
  addCancelBtn:        "#cancel",
  addTitle:            "#title",
  addAuthor:           "#author",
  addLanguage:         "#language",
  addQuantity:         "#quantity",
  addTitleError:       "#title_error",
  addAuthorError:      "#author_error",
  addLanguageError:    "#language_error",
  addQuantityError:    "#quantity_error",

  // Update book modal
  updateModal:         "#update_modal",
  updateBtn:           "#update_btn",
  updateTitle:         "#title_update",
  updateAuthor:        "#author_update",
  updateLanguage:      "#language_update",
  updateTotalCount:    "#total_count",
  updateTitleError:    "#update_title_error",
  updateAuthorError:   "#update_author_error",
  updateLanguageError: "#language_error",
  updateTotalError:    "#update_total_error",

  // Table row actions
  updateBookBtn:       ".update-book",
  deleteBookBtn:       ".delete-book",

  // Generate PDF
  generatePdfBtn:      "#book_pdf",
};

// ---------------------------------------------------------

const Books = function () {
  const nameRegex   = /^[A-Za-z0-9\s]+$/;
  const numberRegex = /^[0-9]+$/;

  const resetForm = function () {
    $(selectors.addTitle + "," +
      selectors.addAuthor + "," +
      selectors.addLanguage + "," +
      selectors.addQuantity).val("");

    $(selectors.addTitleError + "," +
      selectors.addAuthorError + "," +
      selectors.addLanguageError + "," +
      selectors.addQuantityError).text("");
  };

  const that = this;
  let totalCountPrev = "";
  let bookId = "";

  // -------------------------------------------------------
  this.resetAddBookModalFields = function () {
    $(document).on("click", selectors.addCancelBtn, resetForm);
  };

 
  this.displayBooksTable = function () {
    $(document).on("click", selectors.filterApplyBtn, function () {
      $(selectors.loader).show();
      $(selectors.dataTable).hide();

      const filterType  = $(selectors.filterType).val();
      const filterValue = $(selectors.filterValue).val().trim();
      const status      = $(selectors.filterStatus).val();
      const length      = $(selectors.filterLength).val();

      let params = { start: 0, length };

      if (status !== "all" && filterType !== "all" && filterValue !== "") {
        params = { start: 0, length, searchColumn: filterType, searchValue: filterValue, BookAvailablity: status };
      } else if (status === "all" && filterType !== "all" && filterValue !== "") {
        params = { start: 0, length, searchColumn: filterType, searchValue: filterValue };
      } else if (status !== "all" && filterType === "all" && filterValue === "") {
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
            sort: false,
            destroy: true,
            dom: '<"top"<"custom-length">lp>t<"bottom"ip>',
            lengthMenu: [10, 25, 50, 100],
            language: { emptyTable: "No data found" },
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
                render: (d, t, row) => {
                  const cls = row.bookStatus === "Available" ? "bg-success" : "bg-danger";
                  return `<p class="${cls} rounded-5 text-white mb-0 px-2">${row.bookStatus}</p>`;
                },
              },
              {
                title: "Actions",
                data: null,
                orderable: false,
                render: (d, t, row) => `
                  <button class="btn btn-sm btn-warning me-2 update-book"
                          data-bs-toggle="modal"
                          data-bs-target="${selectors.updateModal}"
                          data-id="${row.bookId}">
                    <i class="fa-solid fa-pen-to-square text-white"></i>
                  </button>
                  <button class="btn btn-sm btn-danger delete-book" data-id="${row.bookId}">
                    <i class="fa-solid fa-trash"></i>
                  </button>`,
              },
            ],
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
          Swal.fire({ icon: "success", title: "Generated", text: "✅ " + res.object, timer: 2000, showConfirmButton: false });
        },
        error: function () {
          $(selectors.loader).hide();
          Swal.fire({ icon: "error", title: "Error", text: "❌ Failed to Generate Available Book", timer: 2000, showConfirmButton: false });
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
          $(selectors.updateTitle).val(book.title);
          $(selectors.updateAuthor).val(book.author);
          $(selectors.updateLanguage).val(book.language);
          $(selectors.updateTotalCount).val(book.totalCount);
          $(selectors.updateModal).data("bookId", bookId).modal("show");
        },
        error: function () {
          $(selectors.loader).hide();
          Swal.fire({ icon: "error", title: "Error", text: "Failed to fetch book details.", timer: 2000, showConfirmButton: false });
        },
      });
    });
  };

  // -------------------------------------------------------
  this.deleteBookById = function () {
    $(document).on("click", selectors.deleteBookBtn, function () {
      const id = $(this).data("id");
      Swal.fire({
        icon: "warning",
        title: "Are you sure?",
        text: "This action cannot be undone!",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          $(selectors.loader).show();
          $.ajax({
            url: `http://localhost:8080/LibraryManagementSystem/Books/deleteBook/${id}`,
            method: "PUT",
            success: function () {
              $(selectors.loader).hide();
              Swal.fire({ icon: "success", title: "Deleted!", text: "The book was removed.", timer: 2000, showConfirmButton: false });
              $(selectors.filterResetBtn).click();
              $(selectors.filterApplyBtn).click();
            },
            error: function () {
              $(selectors.loader).hide();
              Swal.fire({ icon: "error", title: "Failed", text: "Could not delete book.", timer: 2000, showConfirmButton: false });
            },
          });
        }
      });
    });
  };

  // -------------------------------------------------------
  this.resetFiltersApplied = function () {
    $(document).on("click", selectors.filterResetBtn, function () {
      $(selectors.filterType).val("all");
      $(selectors.filterValue).val("");
      $(selectors.filterStatus).val("all");
      $(selectors.filterLength).val("10");

      if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
        $(selectors.dataTable).DataTable().clear().destroy();
        $(selectors.dataTable).hide();
      }
    });
  };

  // -------------------------------------------------------
  this.validateField = function (id, regex, errorId, errorMessage) {
    const value = $(id).val().trim();
    if (value === "") {
      $(errorId).text("Required Field.");
      return false;
    } else if (regex && !regex.test(value)) {
      $(errorId).text(errorMessage);
      return false;
    }
    $(errorId).text("");
    return true;
  };

  // -------------------------------------------------------
  this.updateBookDetails = function () {
    $(document).on("click", selectors.updateBtn, function () {
      const validTitle     = that.validateField(selectors.updateTitle, nameRegex, selectors.updateTitleError,   "Only letters and numbers allowed.");
      const validAuthor    = that.validateField(selectors.updateAuthor, nameRegex, selectors.updateAuthorError, "Only letters and numbers allowed.");
      const validLanguage  = that.validateField(selectors.updateLanguage, nameRegex, selectors.updateLanguageError,"Only letters and numbers allowed.");
      let   validTotalCount = that.validateField(selectors.updateTotalCount, numberRegex, selectors.updateTotalError,"Only numbers allowed.");

      if (parseInt($(selectors.updateTotalCount).val(),10) < totalCountPrev) {
        $(selectors.updateTotalError).text("Must be greater than previous count");
        validTotalCount = false;
      }

      const bookId = $(selectors.updateModal).data("bookId");
      if (validTitle && validAuthor && validLanguage && validTotalCount) {
        const requestData = {
          bookId: parseInt(bookId,10),
          title: $(selectors.updateTitle).val().trim(),
          author: $(selectors.updateAuthor).val().trim(),
          language: $(selectors.updateLanguage).val().trim(),
          totalCount: $(selectors.updateTotalCount).val().trim(),
        };
        $(selectors.loader).show();
        $.ajax({
          url: "http://localhost:8080/LibraryManagementSystem/Books/updateBookDetails",
          type: "PUT",
          data: JSON.stringify(requestData),
          contentType: "application/json",
          success: function () {
            $(selectors.loader).hide();
            $(selectors.updateModal).modal("hide");
            resetForm();
            Swal.fire({ icon: "success", title: "Book Updated", text: "✅ Your book was updated successfully!", timer: 2000, showConfirmButton: false })
                .then(() => $(selectors.filterApplyBtn).click());
          },
          error: function (xhr) {
            let msg = "Something went wrong.";
            if (xhr.responseJSON) {
              if (xhr.responseJSON.message) msg = xhr.responseJSON.message;
              if (xhr.responseJSON.object) msg = Object.values(xhr.responseJSON.object).join("\n");
            }
            $(selectors.loader).hide();
            Swal.fire({ icon: "error", title: "Oops...", text: "❌ " + msg, timer: 2000, showConfirmButton: false });
          },
        });
      }
    });
  };

  // -------------------------------------------------------
  this.addNewBook = function () {
    $(document).on("click", selectors.addBtn, function () {
      const validTitle    = that.validateField(selectors.addTitle,    nameRegex,   selectors.addTitleError,   "Only letters and numbers allowed.");
      const validAuthor   = that.validateField(selectors.addAuthor,   nameRegex,   selectors.addAuthorError,  "Only letters and numbers allowed.");
      const validLanguage = that.validateField(selectors.addLanguage, nameRegex,   selectors.addLanguageError,"Only letters and numbers allowed.");
      const validQty      = that.validateField(selectors.addQuantity, numberRegex, selectors.addQuantityError,"Only numbers allowed.");

      if (validTitle && validAuthor && validQty && validLanguage) {
        const requestData = {
          title:     $(selectors.addTitle).val().trim(),
          author:    $(selectors.addAuthor).val().trim(),
          totalCount:parseInt($(selectors.addQuantity).val().trim(),10),
          language:  $(selectors.addLanguage).val().trim(),
        };
        $(selectors.loader).show();
        $.ajax({
          url: "http://localhost:8080/LibraryManagementSystem/Books/addNewBook",
          type: "POST",
          data: JSON.stringify(requestData),
          contentType: "application/json",
          success: function () {
            $(selectors.loader).hide();
            $(selectors.addModal).modal("hide");
            resetForm();
            Swal.fire({ icon: "success", title: "Book Saved", text: "✅ Your book was added successfully!", timer: 2000, showConfirmButton: false })
                .then(() => $(selectors.filterApplyBtn).click());
          },
          error: function (xhr) {
            let msg = "Something went wrong.";
            if (xhr.responseJSON) {
              if (xhr.responseJSON.message) msg = xhr.responseJSON.message;
              if (xhr.responseJSON.object) msg = Object.values(xhr.responseJSON.object).join("\n");
            }
            $(selectors.loader).hide();
            Swal.fire({ icon: "error", title: "Oops...", text: "❌ " + msg, timer: 2000, showConfirmButton: false });
          },
        });
      }
    });
  };

  // -------------------------------------------------------
  this.resetFormOnBackdrop = function () {
    $(document).on("hidden.bs.modal", selectors.addModal, resetForm);
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
books.updateBookDetails();
books.addNewBook();
books.resetFormOnBackdrop();
