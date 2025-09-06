function renderUserTable() {
  $("#apply_member_filters")
    .off("click")
    .on("click", function () {
       
      $("#loader").show();
      $("#user_table").hide();

      let length = $("#member_length").val();
      let status = $("#member_filter_status").val();
      let search = $("#member_filter_value").val().trim();
      let asec="asec";
      let apiUrl =
        "http://localhost:8080/LibraryManagementSystem/Members/getAllMembers";
      let params = { start: 0, length: length,order:asec };
        console.log(length)
        console.log(status)
        console.log(search)
      if ((status === "active" || status === "deactive") && search !== "") {
        params = {
          start: 0,
          length: length,
          order:asec,
          memberStatusFilter: status,
          search: search,
        };
      } else if ((status === "active" || status === "deactive")) {
        params = { start: 0, length: length,order:asec, memberStatusFilter: status };
      } else if (search !== "") {
        params = { start: 0, length: length,order:asec, search: search };
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
              { title: "Member ID", data: "memberId" },
              { title: "Member Name", data: "memberName" },

              { title: "MemberShip Start Date", data: "memberShipStartDate" },

              { title: "MemberShip End Date", data: "memberShipEndDate" },

              { title: "Member Ship Status", data: "memberShipStatus" },

              { title: "Address", data: "memberaddress" },

              { title: "Mobile Number", data: "memberMobileNumber" },

              { title: "Work Status", data: "memberWorkStatus" },

              { title: "Email", data: "memberEmail" },
              {
                  title: "Actions",
                  data: null,
                  orderable: false,
                  render: function (data, type, row) {
                    return `
        <button class="btn btn-sm btn-dark me-2 mb-2 update-member" data-bs-toggle="modal"
        data-bs-target="#update_member_modal" data-id="${row.memberId}">
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
                { title: "Book ID", data: "bookId" },
                { title: "Title", data: "title" },
                { title: "Language", data: "language" },
                { title: "Author", data: "author" },
                { title: "Book Reg. Date", data: "bookRegistrationDate" },
                { title: "Book Del Date", data: "bookDeletedDate" },
                { title: "Total Count", data: "totalCount" },
                { title: "Status", data: "bookStatus" },
                {
                  title: "Actions",
                  data: null,
                  
                },
              ],
            });
            $("#loader").hide();
            $("#user_table").show();
        }
      });
    });

    $(document).on("click",".delete-member", function () {
  let bookId = $(this).data("id");
  console.log("Delete member ID:", memberId);

  Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: "This action cannot be undone!",
    showCancelButton: true,
    confirmButtonText: "Yes, delete!",
    cancelButtonText: "Cancel"
  }).then((result) => {
    if (result.isConfirmed) {
      
      $.ajax({
        url: `http://localhost:8080/LibraryManagementSystem/Books/deleteBook/${bookId}`,
        method: "PUT",
        success: function () {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "The book was removed.",
            showConfirmButton: false,
            timer: 2000
          });
          $("#apply_filters").click(); // refresh table
        },
        error: function () {
          Swal.fire({
            icon: "error",
            title: "Failed",
            text: "Could not delete book.",
            showConfirmButton: false,
            timer: 2000
          });
        }
      });
    }
  });
});


    const nameRegex = /^[A-Za-z0-9\s]{3,30}$/;
    const addressRegex = /^[A-Za-z0-9,\s]{3,30}$/;
    const numberRegex = /^[6-9][0-9]{9}$/;
    const emailRegex=/^[a-z0-9]{8,20}[@][a-z]{1,15}[.][a-z]{1,3}$/;
    function validateField(id, regex, errorId, errorMessage) {
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
    }

    function initPhoneInput() {
  var input = $("#mobile_number");

  // Destroy if already initialized (avoid duplicates)
  if (input.hasClass("iti")) {
    input.intlTelInput("destroy");
  }

  // Reinitialize
  window.intlTelInput(input[0], {
    initialCountry: "",         // no default country
    separateDialCode: true,     // show code separately
    nationalMode: true,         // allow local number input
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
  });
}

$("#member_modal").on("shown.bs.modal", function () {
  initPhoneInput();
});

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // block today + past

  const endDatePicker = new tempusDominus.TempusDominus(
    document.getElementById("membership_end_date_picker"),
    {
      display: {
        components: {
          calendar: true,
          date: true,
          month: true,
          year: true,
          decades: true,
        },
        buttons: {
          today: false,
          clear: true,
          close: true,
        },
        viewMode: "calendar",
      },
      localization: {
        format: "yyyy-MM-dd", // format YYYY-MM-DD
      },
      restrictions: {
        minDate: tomorrow, // disable past + today
      },
      useCurrent: false,
    }
  );

    $("#member_add_btn").on("click", function () {
      let validMemberName = validateField(
        "#member_name",
        nameRegex,
        "#member_name_error",
        "Only letters and numbers allowed."
      );
      let validMemberAddress = validateField(
        "#member_name",
        addressRegex,
        "#member_name_error",
        "Only letters and numbers allowed."
      );
      let validMemberEMail = validateField(
        "#member_email",
        emailRegex,
        "#member_email_error",
        "Email format not matched."
      );
      let validStatus = $("#member_work_status").val();
      if(validStatus ==="student" ||validStatus ==="employed" || validStatus ==="unemployee"){
         $("#member_work_status_error").text("")
        validStatus=true;
      }
      else{
        $("#member_work_status_error").text("Please select the status")
         validStatus=false;
      }

    let input = $("#mobile_number")[0];
  let iti = window.intlTelInputGlobals.getInstance(input);
  let fullNumber = iti.getNumber();
  let localNumber = $(input).val();
  let validateMobileNumber=true;
  let endDate=false;
  if (!numberRegex.test(localNumber)) {
  $("#mobile_number_error").text("Invalid mobile number.");
  validateMobileNumber=false;
} else {
  $("#mobile_number_error").text("");
}
  

$("#calendar_icon").on("click", function () {
    endDatePicker.show();
    endDate=true;
    console.log(endDatePicker)
  });
let dateVal="";
  // Validation if user types manually
  $("#membership_end_date").on("blur", function () {
     dateVal = $(this).val().trim();
    console.log(dateVal)
    if (dateVal === "") {
      $("#membership_end_date_error").text("");
      endDate=true;
      
    }

    // Check valid format YYYY-MM-DD
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateVal)) {
      $("#membership_end_date_error").text("Invalid format. Use YYYY-MM-DD.");
      
    }

    let enteredDate = new Date(dateVal);
    if (enteredDate <= today) {
      $("#membership_end_date_error").text("Date must be after today.");
    } else {
      $("#membership_end_date_error").text("");
      endDate=true;
    }
  });
alert(validateMobileNumber)
alert(endDate)
  if(validMemberEMail && validateMobileNumber && validStatus && validMemberAddress && validMemberName){
   let requestData= {
    memberName: $("#member_name").val().trim(),
    memberShipEndDate: $("#membership_end_date").val().trim(),
    memberaddress: $("#member_address").val().trim(),
    memberMobileNumber: fullNumber,
    memberWorkStatus: $("#member_work_status").val().trim(),
    memberEmail: $("#member_email").val().trim(),
}

            $.ajax({
          url: "http://localhost:8080/LibraryManagementSystem/Members/registerMember",
          type: "POST",
          data: JSON.stringify(requestData),
          contentType: "application/json",
          success: function (response) {
            $("#example_modal").modal("hide");
            resetForm();
            Swal.fire({
              icon: "success",
              title: "Member Added",
              text: "✅ "+response.object,
              showConfirmButton: false,
              timer: 2000,
            }).then(() => {
              $("#apply_member_filters").click();
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
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "❌ "+message,
              showConfirmButton: false,
              timer: 2000,
            });
          },
        });

  }

    });

    $(document).on("click", ".update-member", function () {
  let memberId = $(this).data("id");
  console.log("Update Member ID:", memberId);
$.ajax({
    url: `http://localhost:8080/LibraryManagementSystem/Members/getMemberById/  ${memberId}`,
    method: "GET",
    dataType: "json",
    success: function (res) {
      let member = res.object; // based on your API response structure

      // Fill modal fields
      $("#update_member_name").val(member.memberName);
      
      $("#update_member_email").val(member.memberEmail);
      $("#update_member_work_status").val(member.memberWorkStatus);
      $("#update_member_status").val(member.memberShipStatus);
      $("#update_membership_start_date").val(member.memberShipStartDate);
     
      $("#update_mobile_number").val(member.memberMobileNumber);
      $("#update_membership_end_date").val(member.memberShipEndDate);
      $("#update_member_address").val(member.memberaddress);
      

      // Change modal button text to Update
     // $("#add_btn").text("Update").data("id", bookId);

      // Show modal
      $("#update_member_modal").modal("show");
    },
    error: function () {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch Member details.",
        showConfirmButton: false,
        timer: 2000
      });
    }
  });
  // Example: open modal with book data
  // fetch details and fill modal fields
  // then show modal
});

    function resetForm() {
      $("#member_name, #member_email, #member_work_status, #mobile_number,#membership_end_date,#member_address").val("");
      $("#member_name_error, #member_email_error, #member_work_status_error, #mobile_number_error,#membership_end_date_error,#member_address_error").text(
        ""
      );
    }

    $("#cancel").on("click", function () {
      resetForm();
    });

    $("#member_modal").on("hidden.bs.modal", function () {
      resetForm();
    });

}
$(document).ready(function () {
  renderUserTable();
});