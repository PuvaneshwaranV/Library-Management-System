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
            window.location.href = "Login.html";
        }
    };

    /* ---------- LOAD HEADER & SIDEBAR ---------- */
    this.loadHeaderAndSidebar = () => {
        const s = this.selectors;

        // Load header
        $(s.header).load("header.html", () => {
            const lastTitle = localStorage.getItem("lastTitle") || "Dashboard";
            this.updateHeader(lastTitle);

            const savedUser = localStorage.getItem("libraryUsername");
            if (savedUser) {
                $(s.header).find("h5.mb-0").text(savedUser);
            }
        });

        // Load sidebar
        $(s.sidebar).load("sidebar.html", () => {
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
                icon: "warning",
                title: "Logout",
                text: "Are you sure you want to log out?",
                showCancelButton: true,
                confirmButtonText: "Yes",
                cancelButtonText: "No"
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("libraryUsername");
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

    /**
     * 
     * Restore Last Page where Left while Logout
     * 
     */
   
    this.restoreLastPage = function () {
        const lastPage = localStorage.getItem("lastPage") || "dashboard.html";
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
            if (page === "users.html") $.getScript("js/users.js");
            else if (page === "penalty.html") $.getScript("js/penalty.js");
            else if (page === "catalog.html") $.getScript("js/catalog.js");
            else if (page === "books.html") $.getScript("js/book.js");
            else if (page === "dashboard.html") $.getScript("js/dashboard.js", function () {
                $(document).trigger("dashboardLoaded");
            });
            
        });
    };

    /* ---------- DASHBOARD CARDS CLICK HANDLER ---------- */
    this.attachDashboardCardClicks = function () {
        const s = this.selectors;

        const cardMap = [
            { selector: ".row:first .col-lg-4:nth-child(1)", page: "books.html", title: "Books", sidebarLink: '#sidebar .nav-link[href="books.html"]' },
            { selector: ".row:first .col-lg-4:nth-child(2)", page: "penalty.html", title: "Penalty", sidebarLink: '#sidebar .nav-link[href="penalty.html"]' },
            { selector: ".row:last .col-md-4:nth-child(2)", page: "penalty.html", title: "Penalty", sidebarLink: '#sidebar .nav-link[href="penalty.html"]' },
            { selector: ".row:first .col-lg-4:nth-child(3)", page: "users.html", title: "Users", sidebarLink: '#sidebar .nav-link[href="users.html"]' },
            { selector: ".row:last .col-md-4:nth-child(1)", page: "users.html", title: "Users", sidebarLink: '#sidebar .nav-link[href="users.html"]' }
        ];

        cardMap.forEach(card => {
            const $card = $("#dashboardContainer").find(card.selector);
            $card.css("cursor", "pointer");
            $card.on("click", () => {
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
            const lastPage = localStorage.getItem("lastPage") || "dashboard.html";
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

    // Attach dashboard card clicks when dashboard.js finishes loading
    $(document).on("dashboardLoaded", () => {
        window.appInstance.attachDashboardCardClicks();
    });
});
