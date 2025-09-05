$(document).ready(function () {
  $("#header").load("header.html");
  $("#sidebar").load("sidebar.html", function () {
    setActiveLink();
  });

  const lastPage = localStorage.getItem("lastPage") || "dashboard.html";
  loadPage(lastPage);

  $("#sidebar").addClass("no-transition collapsed");
  setTimeout(() => {
    $("#sidebar").removeClass("no-transition");
  }, 100);

  $(document).on("click", "#sidebarToggle", function () {
    $("#sidebar").toggleClass("collapsed");
  });

  $(document).on("click", "#sidebar .nav-link", function (e) {
    e.preventDefault();

    const targetFile = $(this).attr("href");

    localStorage.setItem("lastPage", targetFile);

    loadPage(targetFile);

    updateHeader($(this).text().trim());
    setActiveLink($(this));

    $("#sidebar").addClass("collapsed");
  });

  function loadPage(page) {
    $("#main_body").load(page, function () {
      if (page === "books.html") {
        $.getScript("js/book.js");
      }
      else if (page === "user.html") {
        $.getScript("js/users.js");
      }
    });
  }

  function setActiveLink($link) {
    $("#sidebar .nav-link").removeClass("active");
    if ($link) {
      $link.addClass("active");
    } else {
      const lastPage = localStorage.getItem("lastPage") || "dashboard.html";
      $(`#sidebar .nav-link[href="${lastPage}"]`).addClass("active");
      updateHeader($(`#sidebar .nav-link[href="${lastPage}"]`).text().trim());
    }
  }
  function updateHeader(title) {
    $("#header h3").text(title);
  }

  
});
