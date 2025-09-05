function renderUserTable(){
     $("#apply_filters")
      .off("click")
      .on("click", function () {
        $("#loader").show();
        $("#user_table").hide();
      })
}