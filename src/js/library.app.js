/* ===================== Main App ===================== */
const App = function () {

    /**
     * 
     * Defining Selectors
     * 
     */
    this.selectors = {
        header: "#header",
        sidebar: "#sidebar",
        mainBody: "#main_body",
        sidebarToggle: "#sidebarToggle",
        logoutLink: "#logout a",
        navLink: "#sidebar .nav-link",
        headerTitle: "#header h3",
        noTransitionClass: "no-transition",
        collapsedClass: "collapsed"
    };

    /* ---------- INIT ---------- */
    this.init = function () {
        this.checkLogin();
        this.loadHeaderAndSidebar();
        this.restoreLastPage();
        this.bindSidebarToggle();
        this.bindSidebarLinks();
    };

    /* ---------- CHECK LOGIN ---------- */
    this.checkLogin = function () {
        const loggedUser = localStorage.getItem("libraryUsername");
        if (!loggedUser) {
            window.location.href = "library-login.html";
        }
    };

    /* ---------- LOAD HEADER & SIDEBAR ---------- */
    this.loadHeaderAndSidebar = () => {
        const s = this.selectors;

        // Load header
        $(s.header).load("library-common-header.html", () => {
            const lastTitle = localStorage.getItem("lastTitle") || "Dashboard";
            this.updateHeader(lastTitle);

            const savedUser = localStorage.getItem("libraryUsername");
            if (savedUser) {
                $(s.header).find("h5.mb-0").text(savedUser);
            }
        });

        // Load sidebar
        $(s.sidebar).load("library-common-sidebar.html", () => {
            this.setActiveLink();
            this.bindLogout();
        });
    };

    /* ---------- LOGOUT ---------- */
    this.bindLogout = function () {
        const s = this.selectors;
        $(s.logoutLink).on("click",  (e) => {
            e.preventDefault();
            Swal.fire({
                icon: "danger",
                title: '<i class="fa-solid fa-right-from-bracket fa-rotate-180 me-2 text-danger" style="font-size:40px;"></i> <br> Logout',
                text: "Are you sure about log out?",
                showCancelButton: true,
                cancelButtonText: "No",
                confirmButtonText: "Yes",
                reverseButtons: true,
                customClass: {
                    confirmButton: "btn-dark"
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("libraryUsername");
                    Swal.fire({
                        icon: "success",
                        title: "Logged out",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    setTimeout(() => window.location.href = "library-login.html", 1600);
                }
            });
        });
    };

    /**
     * 
     * Restore Last Page where Left while Logout
     * 
     */
   
    this.restoreLastPage = function () {
        const lastPage = localStorage.getItem("lastPage") || "library-dashboard.html";
        this.loadPage(lastPage);

        // Collapse sidebar initially without transition
        const s = this.selectors;
        $(s.sidebar)
            .addClass(`${s.noTransitionClass} ${s.collapsedClass}`);
        setTimeout(() => {
            $(s.sidebar).removeClass(s.noTransitionClass);
        }, 100);
    };

    /* ---------- SIDEBAR TOGGLE ---------- */
    this.bindSidebarToggle = function () {
        const s = this.selectors;
        $(document).on("click", s.sidebarToggle, () => {
            $(s.sidebar).toggleClass(s.collapsedClass);
            $(s.mainBody).toggleClass(s.collapsedClass);
        });
    };

//     const sidebar = document.getElementById("sidebar");
// const mainBody = document.getElementById("main_body");

// sidebar.addEventListener("mouseenter", () => {
  
//     mainBody.style.marginLeft = "200px";
  
// });

// sidebar.addEventListener("mouseleave", () => {
 
//     mainBody.style.marginLeft = "60px";
  
// });

    /* ---------- NAVIGATION LINKS ---------- */
    this.bindSidebarLinks = function () {
        const s = this.selectors;
        $(document).on("click", s.navLink, (e) => {
            const $link = $(e.currentTarget);

        
            if ($link.closest("#logout").length) {
                return;
            }
            e.preventDefault();
            const href = $(e.currentTarget).attr("href");
            const title = $(e.currentTarget).text().trim();

            if (href && href !== "#") {
                localStorage.setItem("lastPage", href);
                localStorage.setItem("lastTitle", title);
                this.loadPage(href);
                this.updateHeader(title);
                this.setActiveLink($(e.currentTarget));
            }
           window.location.reload();
        });
    };

    /* ---------- PAGE LOADER ---------- */
    this.loadPage = function (page) {
        const s = this.selectors;
        $(s.mainBody).load(page, () => {
            // Load page-specific JS
            if (page === "library-users-management.html") $.getScript("js/library.users.management.js");
            else if (page === "library-penalty-management.html") $.getScript("js/library.penalty.management.js");
            else if (page === "library-catalog.html") $.getScript("js/library.catalog.js");
            else if (page === "library-books-management.html") $.getScript("js/library.books.management.js");
            else if (page === "library-dashboard.html") $.getScript("js/library.dashboard.js", function () {
                $(document).trigger("dashboardLoaded");
            });
            
        });
    };

    /* ---------- DASHBOARD CARDS CLICK HANDLER ---------- */
    this.attachDashboardCardClicks = function () {
        const s = this.selectors;

        const cardMap = [
            { selector: ".row:last .col-lg-4:nth-child(1)", page: "library-books-management.html", title: "Books", sidebarLink: '#sidebar .nav-link[href="library-books-management.html"]',filter: { BookAvailablity: "available" } },
            { selector: ".row:last .col-lg-4:nth-child(2)", page: "library-penalty-management.html", title: "Penalty", sidebarLink: '#sidebar .nav-link[href="library-penalty-management.html"]', filter: { paymentStatus: "pending" } },
            { selector: ".row:first .col-md-4:nth-child(2)", page: "library-penalty-management.html", title: "Penalty", sidebarLink: '#sidebar .nav-link[href="library-penalty-management.html"]', filter: { paymentStatus: "pending" } },
            { selector: ".row:last .col-lg-4:nth-child(3)", page: "library-users-management.html", title: "Members", sidebarLink: '#sidebar .nav-link[href="library-users-management.html"]', filter: { memberStatusFilter: "active" } },
            { selector: ".row:first .col-md-4:nth-child(1)", page: "library-users-management.html", title: "Members", sidebarLink: '#sidebar .nav-link[href="library-users-management.html"]', filter: { memberStatusFilter: "active" }  }
        ];

        cardMap.forEach(card => {
            const $card = $("#dashboardContainer").find(card.selector);
            $card.css("cursor", "pointer");
            $card.on("click", () => {
                const filterString = encodeURIComponent(JSON.stringify(card.filter));
                localStorage.setItem("dashboardFilter", filterString);
                this.loadPage(card.page);
                this.updateHeader(card.title);
                $(s.navLink).removeClass("active");
                $(card.sidebarLink).addClass("active");
                localStorage.setItem("lastPage", card.page);
                localStorage.setItem("lastTitle", card.title);
            });
        });
    };

    /* ---------- ACTIVE LINK (visual only) ---------- */
    this.setActiveLink = function ($link) {
        const s = this.selectors;
        $(s.navLink).removeClass("active");
        if ($link) $link.addClass("active");
        else {
            const lastPage = localStorage.getItem("lastPage") || "library-dashboard.html";
            $(`${s.navLink}[href="${lastPage}"]`).addClass("active");
        }
    };

    /* ---------- HEADER TITLE ---------- */
    this.updateHeader = function (title) {
        const s = this.selectors;
        $(s.headerTitle).text(title);
    };
};

/* ===== Kick-off ===== */
$(document).ready(function () {
    window.appInstance = new App();
    window.appInstance.init();

    // Attach dashboard card clicks when library.dashboard.js finishes loading
    $(document).on("dashboardLoaded", () => {
        window.appInstance.attachDashboardCardClicks();
    });
});
