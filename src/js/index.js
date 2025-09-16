/* ===================== Main App ===================== */
const App = function () {

    /* ---------- CENTRAL SELECTORS ---------- */
    const selectors = {
        header:            "#header",
        sidebar:           "#sidebar",
        mainBody:          "#main_body",
        sidebarToggle:     "#sidebarToggle",
        logoutLink:        "#logout a",
        navLink:           "#sidebar .nav-link",
        headerTitle:       "#header h3",
        noTransitionClass: "no-transition",
        collapsedClass:    "collapsed"
    };

    /* ---------- INIT ---------- */
    this.init = function () {
        this.loadHeaderAndSidebar();
        this.restoreLastPage();
        this.bindSidebarToggle();
        this.bindSidebarLinks();
    };

    /* ---------- LOAD HEADER & SIDEBAR ---------- */
    this.loadHeaderAndSidebar = function () {
        $(selectors.header).load("header.html");
        $(selectors.sidebar).load("sidebar.html", () => {
            this.setActiveLink();
            this.bindLogout();
        });
    };

    /* ---------- LOGOUT ---------- */
    this.bindLogout = function () {
        $(document).on("click", selectors.logoutLink, (e) => {
            e.preventDefault();
            Swal.fire({
                icon: "warning",
                title: "Logout",
                text: "Are you sure you want to log out?",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No"
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        icon: "success",
                        title: "Logged out",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    setTimeout(() => window.location.href = "Login.html", 1600);
                }
            });
        });
    };

    /* ---------- RESTORE LAST PAGE ---------- */
    this.restoreLastPage = function () {
        const lastPage = localStorage.getItem("lastPage") || "dashboard.html";
        this.loadPage(lastPage);

        // collapse sidebar initially without transition
        $(selectors.sidebar)
            .addClass(`${selectors.noTransitionClass} ${selectors.collapsedClass}`);
        setTimeout(() => {
            $(selectors.sidebar).removeClass(selectors.noTransitionClass);
        }, 100);
    };

    /* ---------- SIDEBAR TOGGLE ---------- */
    this.bindSidebarToggle = function () {
        $(document).on("click", selectors.sidebarToggle, () => {
            $(selectors.sidebar).toggleClass(selectors.collapsedClass);
            $(selectors.mainBody).toggleClass(selectors.collapsedClass);
        });
    };

    /* ---------- NAVIGATION LINKS ---------- */
    this.bindSidebarLinks = function () {
        $(document).on("click", selectors.navLink, (e) => {
            e.preventDefault();
            const href = $(e.currentTarget).attr("href");
            if (href && href !== "#") {
                localStorage.setItem("lastPage", href);
                this.loadPage(href);
                this.updateHeader($(e.currentTarget).text().trim());
                this.setActiveLink($(e.currentTarget));
                $(selectors.sidebar).addClass(selectors.collapsedClass);
                $(selectors.mainBody).toggleClass(selectors.collapsedClass);
            }
        });
    };

    /* ---------- PAGE LOADER ---------- */
    this.loadPage = function (page) {
        $(selectors.mainBody).load(page, () => {
            // Load page-specific scripts
            // if (page === "books.html") { $.getScript("js/book.js"); }
            if (page === "users.html")   { $.getScript("js/users.js");   }
            //else if (page === "catalog.html") { $.getScript("js/catalog.js"); }
            else if (page === "penalty.html") { $.getScript("js/penalty.js"); }
        });
    };

    /* ---------- ACTIVE LINK ---------- */
    this.setActiveLink = function ($link) {
        $(selectors.navLink).removeClass("active");
        if ($link) {
            $link.addClass("active");
        } else {
            const lastPage = localStorage.getItem("lastPage") || "dashboard.html";
            const $saved = $(`${selectors.navLink}[href="${lastPage}"]`);
            $saved.addClass("active");
            this.updateHeader($saved.text().trim());
        }
    };

    /* ---------- HEADER TITLE ---------- */
    this.updateHeader = function (title) {
        $(selectors.headerTitle).text(title);
    };
};

/* ===== Kick-off ===== */
$(document).ready(function () {
    const app = new App();
    app.init();
});
