
console.log("main ");
$(document).ready(()=>{
  console.log("jjj");   
  const custom_elements = "./template-custom-elements.html";
  $("#book_add").load(custom_elements, () => {
    $("#book_add").append("<book-add-edit-modal></book-add-edit-modal>");
      console.log("mainmmmmmm ");
      const script =document.createElement("script");
      script.src = "js/add.or.update.book.js"
      document.body.appendChild(script);
  })
})

      



// ---------------------------------------------------------
if (typeof window.Books === "undefined") {
    window.Books = function () {
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
  filters:             ".filters",

  // Add book modal
  addModal:            "#book_modal",
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
              {
            title: "S.No",
            data: null,                // no field from the data source
            orderable: false,
            searchable: false,
            render: (data, type, row, meta) => meta.row + 1 // row index + 1
            },
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
          const modalEl = document.querySelector("book-add-edit-modal");
          if (modalEl) {
            modalEl.open({
              bookId: book.bookId,
              title: book.title,
              author: book.author,
              language: book.language,
              totalCount: book.totalCount
            });
          }
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

  this.toggleFilters = function(){
    $(document).on("change", selectors.filters, function(){
        if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
        $(selectors.dataTable).DataTable().clear().destroy();
        $(selectors.dataTable).hide();
      }
    })
  }
  
  this.changeFilterValue = function(){
    $(document).on("input", selectors.filterValue, function(){
      if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
        $(selectors.dataTable).DataTable().clear().destroy();
        $(selectors.dataTable).hide();
      }
    })
  }

  this.toggleFilterInput = function () {
  // use the top-level constant directly
  $(document).on("change", selectors.filterType, function () {
    const selected = $(selectors.filterType).val();

    if (selected && selected.toLowerCase() !== "all") {
      $(selectors.filterValue).prop("disabled", false);
    } else {
      // disable and clear when “all” is chosen
      $(selectors.filterValue).prop("disabled", true).val("");
    }
  });
};
    
};
}
// ------------------- INITIALISE -------------------------
if (!window.books) {
    window.books = new Books();
    books.displayBooksTable();
    books.generateAvailableBookPdf();
    books.getBookDetailsById();
    books.deleteBookById();
    books.resetFiltersApplied();
    books.resetAddBookModalFields();
    books.toggleFilters();
    books.changeFilterValue();
    books.toggleFilterInput();
}
// books.updateBookDetails();
// books.addNewBook();
// books.resetFormOnBackdrop();
