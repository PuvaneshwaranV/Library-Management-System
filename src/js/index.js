/* ===================== Main App ===================== */
const App = function () {

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
    this.loadHeaderAndSidebar = () => {
        // Load header and set the saved title after the HTML arrives
        $(selectors.header).load("header.html", () => {
            const lastTitle = localStorage.getItem("lastTitle") || "Dashboard";
            this.updateHeader(lastTitle);
        });

        // Load sidebar and set active link after HTML arrives
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

            const href  = $(e.currentTarget).attr("href");
            const title = $(e.currentTarget).text().trim();

            if (href && href !== "#") {
                // store page + title BEFORE reload
                localStorage.setItem("lastPage",  href);
                localStorage.setItem("lastTitle", title);

                // reload the entire app so header & sidebar re-init
                window.location.reload();
            }
        });
    };

    /* ---------- PAGE LOADER ---------- */
    this.loadPage = function (page) {
        $(selectors.mainBody).load(page, () => {
            if (page === "users.html")      { $.getScript("js/users.js"); }
            else if (page === "penalty.html") { $.getScript("js/penalty.js"); }
        });
    };

    /* ---------- ACTIVE LINK (visual only) ---------- */
    this.setActiveLink = function ($link) {
        $(selectors.navLink).removeClass("active");
        if ($link) {
            $link.addClass("active");
        } else {
            const lastPage = localStorage.getItem("lastPage") || "dashboard.html";
            const $saved   = $(`${selectors.navLink}[href="${lastPage}"]`);
            $saved.addClass("active");
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
