
$("#apply_penalty_filters")
    .off("click")
    .on("click", function () {
      $("#loader").show();
      $("#user_table").hide();

      let length = $("#penalty_length").val();
      let status = $("#penalty_filter_status").val();
      let searchColumn = $("#penalty_filter_type").val();
      let searchValue=$("#penalty_filter_value").val().trim();
      let asc = "asc";
      let apiUrl =
        "http://localhost:8080/LibraryManagementSystem/Penalty/getPenalty";
      let params = { start: 0, length: length, order: asc };
      console.log(length);
      console.log(status);
      
      if ((status === "paid" || status === "pending") && searchValue !== "") {
        params = {
          start: 0,
          length: length,
          order: asc,
          paymentStatus: status,
          searchColumn:searchColumn,
          searchValue:searchValue
        };
      } else if (status === "paid" || status === "pending") {
        params = {
          start: 0,
          length: length,
          order: asc,
          paymentStatus: status,
        };
      } else if (searchValue !== "") {
        params = { start: 0, length: length, order: asc, searchColumn:searchColumn, searchValue:searchValue,};
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
              { title: "Penalty ID", data: "penaltyId" },
              { title: "Transaction ID", data: "transactionId" },

              { title: "Member ID", data: "memberId" },

              { title: "Book ID", data: "bookId" },

              { title: "Amount", data: "amount" },

              { title: "Penalty Added Flag", data: "penaltyAddedFlag" },

              { title: "Penalty Amount", data: "penaltyAmount" },

              { title: "Reason", data: "reason" },

              { title: "Status", data: "status" },
               { title: "Payment Date", data: "paymentDate" },
              {
                title: "Actions",
                data: null,
                orderable: false,
                render: function (data, type, row) {
                  let status =row.status ==="Pending";
                  if(status)
                  return `
        <button class="btn btn-sm btn-dark me-2 mb-2 penalty-pay" data-bs-toggle="modal"
        data-bs-target="#penalty_pay_modal" data-id="${row.penaltyId}" data-amount="${row.amount}">
          <i class="fa-solid fa-indian-rupee-sign" style="color: #fff;"></i>
        </button>`;
          else{
                return `
        <button class="btn btn-sm btn-dark me-2 mb-2 penalty-pay"  disabled>
          <i class="fa-solid fa-indian-rupee-sign" style="color: #fff;"></i>
        </button>`;
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
              { title: "Penalty ID", data: "penaltyId" },
              { title: "Transaction ID", data: "transactionId" },

              { title: "Member ID", data: "memberId" },

              { title: "Book ID", data: "bookId" },

              { title: "Amount", data: "amount" },

              { title: "Penalty Added Flag", data: "penaltyAddedFlag" },

              { title: "Penalty Amount", data: "penaltyAmount" },

              { title: "Reason", data: "reason" },

              { title: "Status", data: "status" },
               { title: "Payment Date", data: "paymentDate" },
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

    $("#penalty_add_btn").on("click",function(){
       $("#loader").show();
        let transactionId=parseInt($("#penalty_transactionid").val().trim());
        let Amount=parseInt($("#penalty_amount").val().trim());
        let Reason=$("#penalty_reason").val().trim();
        let params={
            TransactionId:transactionId,
            amount:Amount,
            reason:Reason
        }
       
      alert(JSON.stringify(params));
        $.ajax({
          url: "http://localhost:8080/LibraryManagementSystem/Penalty/add",
          type: "POST",
          data: params,

          success: function (response) {
             $("#loader").hide();
            $("#penalty_modal").modal("hide");
            
            Swal.fire({
              icon: "success",
              title: "Added",
              text: "✅ Penalty Added Successfully",
              showConfirmButton: false,
              timer: 2000,
            }).then(() => {
              $("#apply_penalty_filters").click();
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
  } $("#loader").hide();
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "❌ "+message,
              showConfirmButton: false,
              timer: 2000,
            });
          },
        });
      
    });

    
  $(document).on("click", ".penalty-pay", function () {
  let penaltyid= $(this).data("id");
  let amount = $(this).data("amount");
  

  $("#penalty_pay_penaltyid").val(penaltyid);
  $("#penalty_pay_amount").val(amount);
  

  $("#penalty_pay_modal").modal("show");
});
  $(document).on("click", "#penalty_pay_btn", function () {
     $("#loader").show();
    let penalty=parseInt($("#penalty_pay_penaltyid").val());
    let amount=parseInt($("#penalty_pay_amount").val())
  let params=
    {
      penaltyId:penalty,
      amount:amount,
    }
  $.ajax({
    
    url:"http://localhost:8080/LibraryManagementSystem/Penalty/pay",
    method:"POST",
    data: params,
        
        success: function (response) {
          $("#loader").hide();
          Swal.fire({
            icon: "success",
            title: "Paid",
            text: "✅ " + response.object,
            showConfirmButton: false,
            timer: 2000,
          }).then(() => {
            $("#apply_penalty_filters").click();
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
          $("#loader").hide ();
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "❌ " + message,
            showConfirmButton: false,
            timer: 2000,
          });
        },
  })
  });