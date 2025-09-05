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
      if (status === "active" && search !== "") {
        params = {
          start: 0,
          length: length,
          memberStatusFilter: status,
          search: search,
        };
      } else if (status === "active") {
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
        <button class="btn btn-sm btn-dark me-2 update-book" data-bs-toggle="modal"
        data-bs-target="#update_modal" data-id="${row.bookId}">
          <i class="fa-solid fa-pen-to-square" style="color: #fff;"></i>
        </button>
        <button class="btn btn-sm btn-dark delete-book" data-id="${row.bookId}">
          <i class="fa-solid fa-trash" style="color: #ff0000;"></i>
        </button>
      `;
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
}
$(document).ready(function () {
  renderUserTable();
});