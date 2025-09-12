$("#apply_rental_filters")
  .off("click")
  .on("click", function () {
    $("#loader").show();
    $("#user_table").hide();

    let length = $("#rental_length").val();
    let bookRentalStatus = $("#rental_status").val();
    let searchColumn = $("#rental_filter_type").val().trim();
    let searchField = $("#rental_filter_value").val().trim();
    let asec = "asec";
    let apiUrl =
      "http://localhost:8080/LibraryManagementSystem/RentalTransactions/getAllTransactions";
    let params = { start: 0, length: length, order: asec };

    if (bookRentalStatus !== "all" && searchColumn === "all") {
      params = {
        start: 0,
        length: length,
        order: asec,
        bookRentalStatus: bookRentalStatus,
      };
    } else if (bookRentalStatus === "all" && searchColumn !== "all") {
      params = {
        start: 0,
        length: length,
        order: asec,
        searchColumn: searchColumn,
        searchField: searchField,
      };
    } else if (bookRentalStatus !== "all" && searchColumn !== "all") {
      params = {
        start: 0,
        length: length,
        order: asec,
        bookRentalStatus: bookRentalStatus,
        searchColumn: searchColumn,
        searchField: searchField,
      };
    }
    console.log(params);
    $.ajax({
      url: apiUrl,
      method: "GET",
      data: params,
      dataType: "json",
      success: function (res) {
        if ($.fn.DataTable.isDataTable("#user_table")) {
          $("#user_table").DataTable().destroy();
        }
        table = $("#user_table").DataTable({
          data: res.object.data,
          sort: false,
          destroy: true,
          dom: '<"top"lp>t<"bottom"ip>',
          lengthMenu: [10, 25, 50, 100],
          language: {
            emptyTable: "No data found",
          },
          columns: [
            { title: "Transaction ID", data: "transactionId" },
            { title: "Member Id", data: "memberId" },

            { title: "Book Id", data: "bookId" },

            { title: "Book Title", data: "bookTittle" },

            { title: "Quantity", data: "quantity" },

            { title: "Returned Quantity", data: "bookReturnedQuantity" },

            { title: "Borrowed Date", data: "borrowedDate" },

            { title: "Return Due Date", data: "returnDueDate" },

            { title: "Actual Return Date", data: "actualReturnedDate" },
            {
              title: "Book Rental Status",
              data: "bookRentalStatus",
              render: function (data, type, row) {
                if (row.bookRentalStatus === "Returned") {
                  return `<div><p class="bg-success rounded-5 text-white">${row.bookRentalStatus}</p></div>`;
                } else {
                  return `<div><p class="bg-danger rounded-5 text-white">${row.bookRentalStatus}</p></div>`;
                }
              },
            },
            {
              title: "Actions",
              data: null,
              orderable: false,
              render: function (data, type, row) {
                let isBorrowed = row.bookRentalStatus === "Borrowed";
                if (isBorrowed) {
                  return `
        <button class="btn btn-sm btn-warning me-2 mb-2 update-rental"
          data-id="${row.transactionId}"
          data-bookid="${row.bookId}"
          data-quantity="${row.quantity}">
          <i class="fa-solid fa-pen-to-square" style="color:#fff"></i>
        </button>
      `;
                } else {
                  return `
        <button class="btn btn-sm btn-secondary me-2 mb-2" disabled
          data-bs-toggle="tooltip" title="Already Returned">
          <i class="fa-solid fa-pen-to-square"style="color:#fff"></i>
        </button>
      `;
                }
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
          dom: '<"top"p>t<"bottom"ip>',
          language: {
            emptyTable: "No data found",
          },
          columns: [
            { title: "Transaction ID", data: "transactionId" },
            { title: "Member Id", data: "memberId" },

            { title: "Book Id", data: "bookId" },

            { title: "Book Title", data: "bookTittle" },

            { title: "Quantity", data: "quantity" },

            { title: "Returned Quantity", data: "bookReturnedQuantity" },

            { title: "Borrowed Date", data: "borrowedDate" },

            { title: "Return Due Date", data: "returnDueDate" },

            { title: "Actual Return Date", data: "actualReturnedDate" },
            { title: "Book Rental Status", data: "bookRentalStatus" },
            {
              title: "Actions",
              data: null,
            },
          ],
        });
        $("#loader").hide();
        $("#user_table").show();
      },
    });
  });
(function () {
  const booksContainer = document.getElementById("books_container");
  document
    .getElementById("add_book_btn")
    .addEventListener("click", function () {
      const newEntry = document.createElement("div");
      newEntry.classList.add(
        "book-entry",
        "mb-3",
        "border",
        "p-3",
        "rounded",
        "position-relative"
      );
      newEntry.innerHTML = `
      <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 remove-book-btn">✖</button>
      <input type="text" class="form-control mb-2" placeholder="Book Id" name="book_id" />
      <div class="text-danger small error_book_id"></div>

      <input type="text" class="form-control mb-2" placeholder="Quantity" name="quantity" />
      <div class="text-danger small error_quantity"></div>

      <input type="text" class="form-control mb-2" placeholder="YYYY-MM-DD" name="due_date" />
      <div class="text-danger small error_due_date"></div>
    `;
      booksContainer.appendChild(newEntry);
      newEntry
        .querySelector(".remove-book-btn")
        .addEventListener("click", function () {
          newEntry.remove();
        });
      updateRemoveButtons();
    });

  document.getElementById("cancel").addEventListener("click", function () {
    document.getElementById("borrow_form").reset();
    booksContainer.innerHTML = `
      <div class="book-entry mb-3 border p-3 rounded position-relative">
        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 remove-book-btn" style="display:none;">✖</button>
        <input type="text" class="form-control mb-2" placeholder="Book Id" name="book_id" />
        <div class="text-danger small error_book_id"></div>

        <input type="text" class="form-control mb-2" placeholder="Quantity" name="quantity" />
        <div class="text-danger small error_quantity"></div>

        <input type="text" class="form-control mb-2" placeholder="YYYY-MM-DD" name="due_date" />
        <div class="text-danger small error_due_date"></div>
      </div>
    `;
  });

  function resetBorrowModal() {
    document.getElementById("borrow_form").reset();
    booksContainer.innerHTML = `
    <div class="book-entry mb-3 border p-3 rounded position-relative">
      <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 remove-book-btn" style="display:none;">✖</button>
      <input type="text" class="form-control mb-2" placeholder="Book Id" name="book_id" />
      <div class="text-danger small error_book_id"></div>

      <input type="text" class="form-control mb-2" placeholder="Quantity" name="quantity" />
      <div class="text-danger small error_quantity"></div>

      <input type="text" class="form-control mb-2" placeholder="YYYY-MM-DD" name="due_date" />
      <div class="text-danger small error_due_date"></div>
    </div>
  `;
    updateRemoveButtons();
  }
  document.getElementById("add_btn").addEventListener("click", function () {
    let isValid = true;
    document
      .querySelectorAll(".text-danger.small")
      .forEach((el) => (el.textContent = ""));

    const memberId = document.getElementById("member_id").value.trim();
    if (!memberId) {
      document.getElementById("member_id_error").textContent =
        "Member ID is required.";
      isValid = false;
    }

    const books = [];
    document
      .querySelectorAll("#books_container .book-entry")
      .forEach((entry) => {
        const bookIdInput = entry.querySelector('input[name="book_id"]');
        const qtyInput = entry.querySelector('input[name="quantity"]');
        const dueDateInput = entry.querySelector('input[name="due_date"]');

        let validEntry = true;

        if (!bookIdInput.value.trim()) {
          entry.querySelector(".error_book_id").textContent =
            "Book ID is required.";
          isValid = false;
          validEntry = false;
        }
        if (!qtyInput.value.trim()) {
          entry.querySelector(".error_quantity").textContent =
            "Quantity is required.";
          isValid = false;
          validEntry = false;
        }
        if (!dueDateInput.value.trim()) {
          entry.querySelector(".error_due_date").textContent =
            "Due date is required.";
          isValid = false;
          validEntry = false;
        }

        if (validEntry) {
          books.push({
            bookId: parseInt(bookIdInput.value, 10),
            quantity: parseInt(qtyInput.value, 10),
            returnDueDate: dueDateInput.value,
          });
        }
      });

    if (!isValid) return;

    const borrowData = {
      memberId: parseInt(memberId, 10),
      books: books,
    };

    $("#loader").show();
    $.ajax({
      url: "http://localhost:8080/LibraryManagementSystem/RentalTransactions/borrowBooks",
      type: "POST",
      data: JSON.stringify(borrowData),
      contentType: "application/json",
      success: function (response) {
        $("#loader").hide();
        $("#borrow_modal").modal("hide");
        resetBorrowModal();
        Swal.fire({
          icon: "success",
          title: "Borrowed",
          text: "✅ " + response.object,
          showConfirmButton: false,
          timer: 2000,
        }).then(() => {
          $("#apply_rental_filters").click();
        });
      },
      error: function (xhr, status, error) {
        let message = "Something went wrong.";

        if (xhr.responseJSON) {
          if (xhr.responseJSON.message) {
            message = xhr.responseJSON.message;
          }
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
  });
  function updateRemoveButtons() {
    const entries = booksContainer.querySelectorAll(".book-entry");
    entries.forEach((entry, index) => {
      const btn = entry.querySelector(".remove-book-btn");
      if (index === 0) {
        btn.style.display = "none";
      } else {
        btn.style.display = "block";
      }
    });
  }
  updateRemoveButtons();

  $("#add_group").on("click", function () {
    let newGroup = $(".book-group").first().clone();
    newGroup.find("input").val("");
    newGroup
      .find(".error-book-id, .error-quantity, .error-transaction-id")
      .text("");
    newGroup.find(".remove-group").show();
    $("#book_groups").append(newGroup);
  });
  $(document).on("click", ".remove-group", function () {
    $(this).closest(".book-group").remove();
  });

  function resetReturnModal() {
    $("#book_groups").html($(".book-group").first().clone());
    $("#book_groups .book-group input").val("");
    $("#book_groups .book-group .remove-group").hide();
    $(
      "#book_groups .book-group .error-book-id, #book_groups .book-group .error-quantity, #book_groups .book-group .error-transaction-id"
    ).text(""); // clear errors
  }

  $("#return_cancel").on("click", function () {
    resetReturnModal();
    $("#return_modal").modal("hide");
  });

  $("#return_btn").on("click", function () {
    let booksArray = [];
    let isValid = true;

    $("#book_groups .book-group").each(function () {
      let bookId = $(this).find(".book-id").val().trim();
      let quantity = $(this).find(".quantity").val().trim();
      let transactionId = $(this).find(".transaction-id").val().trim();

      $(this).find(".error-book-id").text("");
      $(this).find(".error-quantity").text("");
      $(this).find(".error-transaction-id").text("");

      if (!bookId) {
        $(this).find(".error-book-id").text("Book ID is required");
        isValid = false;
      }
      if (!quantity) {
        $(this).find(".error-quantity").text("Quantity is required");
        isValid = false;
      } else if (isNaN(quantity) || quantity <= 0) {
        $(this)
          .find(".error-quantity")
          .text("Quantity must be a positive number");
        isValid = false;
      }
      if (!transactionId) {
        $(this)
          .find(".error-transaction-id")
          .text("Transaction ID is required");
        isValid = false;
      }

      if (
        bookId &&
        quantity &&
        transactionId &&
        !isNaN(quantity) &&
        quantity > 0
      ) {
        booksArray.push({
          bookId: parseInt(bookId),
          quantity: parseInt(quantity),
          transactionId: parseInt(transactionId),
        });
      }
    });

    if (!isValid) return;
    $("#loader").show();
    $.ajax({
      url: "http://localhost:8080/LibraryManagementSystem/RentalTransactions/returnBooks",
      type: "POST",
      data: JSON.stringify(booksArray),
      contentType: "application/json",
      success: function (response) {
        $("#loader").hide();
        resetReturnModal();
        $("#return_modal").modal("hide");
        //resetForm();
        Swal.fire({
          icon: "success",
          title: "Returned",
          text: "✅ " + response.object,
          showConfirmButton: false,
          timer: 4000,
        }).then(() => {
          $("#apply_rental_filters").click();
        });
      },
      error: function (xhr, status, error) {
        let message = "Something went wrong.";

        if (xhr.responseJSON) {
          if (xhr.responseJSON.message) {
            message = xhr.responseJSON.message;
          }
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
  });

  $("#transaction_pdf").on("click", function () {
    $("#loader").show();
    $.ajax({
      url: "http://localhost:8080/LibraryManagementSystem/RentalTransactions/getTransactionPDF",
      type: "GET",
      dataType: "json",
      success: function (response) {
        $("#loader").hide();
        Swal.fire({
          icon: "success",
          title: "Generated",
          text: "✅ " + response.object,
          showConfirmButton: false,
          timer: 2000,
        });
      },
      error: function (xhr, status, error) {
        let message = "Something went wrong.";

        if (xhr.responseJSON) {
          if (xhr.responseJSON.message) {
            message = xhr.responseJSON.message;
          }
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
  });
})();

$(document).on("click", ".update-rental", function () {
  let transactionId = $(this).data("id");
  let bookId = $(this).data("bookid");
  let quantity = $(this).data("quantity");

  $("#update_transactionId").val(transactionId);
  $("#update_bookId").val(bookId);
  $("#update_quantity").val(quantity);

  $("#update_rental_modal").modal("show");
});
$(document).on("click", "#update_rental_btn", function () {
  let transactionId = $("#update_transactionId").val();
  let bookId = $("#update_bookId").val();
  let quantity = $("#update_quantity").val().trim();

  let params = [
    {
      bookId: parseInt(bookId),
      quantity: parseInt(quantity),
      transactionId: parseInt(transactionId),
    },
  ];
  $("#loader").show();
  $.ajax({
    url: "http://localhost:8080/LibraryManagementSystem/RentalTransactions/returnBooks",
    method: "POST",
    data: JSON.stringify(params),
    contentType: "application/json",
    success: function (response) {
      $("#loader").hide();
      $("#update_rental_modal").modal("hide");
      Swal.fire({
        icon: "success",
        title: "Returned",
        text: "✅ Book Returned Successfully",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        $("#apply_rental_filters").click();
      });
    },
    error: function (xhr, status, error) {
      let message = "Something went wrong.";

      if (xhr.responseJSON) {
        if (xhr.responseJSON.message) {
          message = xhr.responseJSON.message;
        }
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
});
$("#reset_rental_filters")
  .off("click")
  .on("click", function () {
    $("#rental_filter_type").val("all");
    $("#rental_filter_value").val("");
    $("#rental_status").val("all");
    $("#rental_length").val("10");

    if ($.fn.DataTable.isDataTable("#user_table")) {
      $("#user_table").DataTable().clear().destroy();
      $("#user_table").hide();
    }
  });
