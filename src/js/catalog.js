$("#apply_rental_filters")
    .off("click")
    .on("click", function () {
      $("#loader").show();
      $("#user_table").hide();

      let length = $("#rental_length").val();
      let bookRentalStatus = $("#rental_status").val();
      let search = $("#rental_filter_value").val().trim();
      let asec = "asec";
      let apiUrl =
        "http://localhost:8080/LibraryManagementSystem/RentalTransactions/getAllTransactions";
      let params = { start: 0, length: length, order: asec };
      console.log(length);
      console.log(bookRentalStatus);
    
      if (bookRentalStatus === "borrowed" || bookRentalStatus === "returned") {
        params = {
          start: 0,
          length: length,
          order: asec,
          bookRentalStatus: bookRentalStatus,
        };
      } 
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
              { title: "Book Rental Status", data: "bookRentalStatus" },
              {
                title: "Actions",
                data: null,
                orderable: false,
                render: function (data, type, row) {
                  return `
        <button class="btn btn-sm btn-dark me-2 mb-2 update-rental" data-bs-toggle="modal"
        data-bs-target="#update_rental_modal" data-id="${row.transactionId}">
          <i class="fa-solid fa-pen-to-square" style="color: #fff;"></i>
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
