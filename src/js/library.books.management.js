


$(document).ready(()=>{
  const custom_elements = "./template-custom-elements.html";
  $("#book_add").load(custom_elements, () => { 
    $("#book_add").append("<book-add-edit-modal></book-add-edit-modal>");
      const script =document.createElement("script");
      script.src = "js/add.or.update.book.js"
      document.body.appendChild(script);
  })
})
      



// ---------------------------------------------------------
const Books = function () {

  
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
  lmFilterChanged:     "#lm_filter_changed",

  // Table row actions
  updateBookBtn:       ".update-book",
  deleteBookBtn:       ".delete-book",

  // Generate PDF
  generatePdfBtn:      "#book_pdf",
};

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
      input.focus();                  // optional: keep focus in field
    });
  };

  this.displayBooksTable = function () {
    $(document).on("click", selectors.filterApplyBtn, function () {
      $(selectors.loader).show();
      $(selectors.dataTable).hide();
      $(selectors.lmFilterChanged).css("display","none");
      $(selectors.filterResetBtn).css("display","none");
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
            autoWidth: false,
            sort: false,
            destroy: true,
            dom: '<"top d-flex justify-content-between"<"dt-left"> <"dt-right"p>>t<"bottom"ip>',
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
              { title: "Book ID", data: "bookId",
                render:(d,t,r) => `#${r.bookId}`
               },
              { title: "Title", data: "title" },
              { title: "Language", data: "language" },
              { title: "Author", data: "author" },
              { title: "Registration Date", data: "bookRegistrationDate",
                width: "200px"
               },
              { title: "Book Quantiy", data: "totalCount" },
              {
                title: "Status",
                data: "bookStatus",
                render: (d, t, row) => {
                  const bgColor = row.bookStatus === "Available" ? "#d4edda" : "#f8d7da"; // light green / light red
                  const textColor = row.bookStatus === "Available" ? "#155724" : "#721c24"; // dark text for contrast

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
                width: "100px !important"
              },
              {
                title: "Action",
                data: null,
                orderable: false,
                render: (d, t, row) => `
                  <button class="btn btn-md me-1 update-book" data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Edit"
                          data-id="${row.bookId}">
                    <i class="fa-solid fa-pen-to-square text-grey"></i>
                  </button>
                  <button class="btn btn-md  delete-book" data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Delete" data-id="${row.bookId}">
                    <i class="fa-solid fa-trash text-danger" ></i>
                  </button>`,
              },
            ],
            drawCallback: function () {
              const tipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
              tipEls.forEach(el => {
                  // avoid duplicates
                  if (!bootstrap.Tooltip.getInstance(el)) {
                      new bootstrap.Tooltip(el);
                  }
              });
              
              const dtLeft = $('.dt-left');
              if (dtLeft.children().length === 0) { // avoid duplicates
                  dtLeft.append(`
                      <button id="book_pdf" class="btn btn-md btn-warning text-white  ms-3">
                          <i class="fa-solid fa-file-lines fa-lg "></i>Generate Available Books PDF
                      </button>
                  `);
              }
          }
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
        icon: "danger",
        title: '<i class="fa-solid fa-trash-can me-2 text-danger" style="font-size:60px;"></i> <br><br> Are you sure?',
        text: "This action cannot be undone!",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        customClass: {
        confirmButton: "btn-dark"
      },
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
        $(selectors.lmFilterChanged).css("display","none");
      }
    });
  };

  this.toggleFilters = function(){
    $(document).on("change", selectors.filters, function(){
        if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
        $(selectors.dataTable).DataTable().clear().destroy();
        $(selectors.dataTable).hide();
        $(selectors.lmFilterChanged).css("display","block");
        $(selectors.filterResetBtn).css("display","block");
      }
    })
  }
  
  this.changeFilterValue = function(){
    $(document).on("input", selectors.filterValue, function(){
      if ($.fn.DataTable.isDataTable(selectors.dataTable)) {
        $(selectors.dataTable).DataTable().clear().destroy();
        $(selectors.dataTable).hide();
        $(selectors.lmFilterChanged).css("display","block");
        $(selectors.filterResetBtn).css("display","block");
      }
    })
  }

  this.toggleFilterInput = function () {
  // use the top-level constant directly
  $(document).on("change", selectors.filterType, function () {
    const selected = $(selectors.filterType).val();

    if (selected && selected.toLowerCase() !== "all") {
      $(selectors.filterValue).prop("disabled", false);
      $(selectors.lmFilterChanged).css("display","block");
    } else {
      // disable and clear when “all” is chosen
      $(selectors.filterValue).prop("disabled", true).val("");
      $(selectors.lmFilterChanged).css("display","block");
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

