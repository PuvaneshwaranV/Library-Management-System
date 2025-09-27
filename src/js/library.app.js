
const App = function () {

    /**
     * 
     * Defining Selectors
     * 
     */
    this.Selectors = {
        lmCommonHeader: "#lm_common_header",
        lmCommonSidebar: "#lm_common_sidebar",
        mainBody: "#lm_main_body",
        lmCommonSidebarToggle: "#lm_sidebar_toggle",
        logoutLink: "#lm_logout a",
        navLink: "#lm_common_sidebar .nav-link",
        lmCommonHeaderTitle: "#lm_common_header h3",
        noTransitionClass: "no-initial-transition",
        collapsedClass: "sidebar_collapsed"
    };  

    /**
     * 
     * Initialize functions
     * 
     */
    this.init = function () {
        this.checkLogin();
        this.loadHeaderAndSidebar();
        this.bindLogout();
        this.restoreLastPage();
        this.bindSidebarToggle();
        this.bindSidebarLinks();
        this.attachDashboardCardClicks();
        this.setActiveLink();
        this.updateHeader();
    };

    /**
     * 
     * check valid login or not
     * 
     */
    this.checkLogin = function () {
        const loggedUser = localStorage.getItem("lmValidUsername");
        if (!loggedUser) {
            window.location.href = "library-login.html";
        }
    };

    /**
     * 
     * Load header and sidebar
     * 
     */
    this.loadHeaderAndSidebar = function () {
        const s = this.Selectors;

        // Load header
        $(this.Selectors.lmCommonHeader).load("library-common-header.html", () => {
            const lastTitle = localStorage.getItem("lastTitle") || "Dashboard";
            this.updateHeader(lastTitle);

            const savedUser = localStorage.getItem("lmValidUsername");
            if (savedUser) {
                $(this.Selectors.lmCommonHeader).find("h5.mb-0").text(savedUser);
            }
        });

        // Load sidebar
        $(this.Selectors.lmCommonSidebar).load("library-common-sidebar.html", () => {
            this.setActiveLink();
            this.bindLogout();
        });
    };

    /**
     * 
     * Logout function
     * 
     */
    this.bindLogout = function () {
        const s = this.Selectors;
        $(this.Selectors.logoutLink).on("click",  (e) => {
            e.preventDefault();
            Swal.fire({
                icon: "danger",
                title: '<i class="fa-solid fa-right-from-bracket fa-rotate-180 me-2 text-danger" style="font-size:40px;"></i> <br> Logout',
                text: "Are you sure about logout?",
                showCancelButton: true,
                cancelButtonText: "No",
                confirmButtonText: "Yes",
                reverseButtons: true,
                customClass: {
                    confirmButton: "btn-dark"
                },
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem("lmValidUsername");
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
        const s = this.Selectors;
        $(this.Selectors.lmCommonSidebar)
            .addClass(`${this.Selectors.noTransitionClass} ${this.Selectors.collapsedClass}`);
        setTimeout(() => {
            $(this.Selectors.lmCommonSidebar).removeClass(this.Selectors.noTransitionClass);
        }, 100);
    };

    /**
     * 
     * Toggle sidebar 
     * 
     */
    this.bindSidebarToggle = function () {
        const s = this.Selectors;
        $(document).on("click", this.Selectors.lmCommonSidebarToggle, () => {
            $(this.Selectors.lmCommonSidebar).toggleClass(this.Selectors.collapsedClass);
            $(this.Selectors.mainBody).toggleClass(this.Selectors.collapsedClass);
        });
    };

    /**
     * 
     * Navigate page
     * 
     */
    this.bindSidebarLinks = function () {
        const s = this.Selectors;
        $(document).on("click", this.Selectors.navLink, (e) => {
            const $link = $(e.currentTarget);

        
            if ($link.closest("#lm_logout").length) {
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

    /**
     * 
     * Load page on the main body
     * 
     */
    this.loadPage = function (page) {
        const s = this.Selectors;
        $(this.Selectors.mainBody).load(page, () => {
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

    /**
     * 
     * Navigate from dashboard charts
     * 
     */
    this.attachDashboardCardClicks = function () {
        const s = this.Selectors;

        const cardMap = [
            { selector: ".row:last .col-lg-4:nth-child(1)", page: "library-books-management.html", title: "Books", sidebarLink: '#lm_common_sidebar .nav-link[href="library-books-management.html"]',filter: { BookAvailablity: "available" } },
            { selector: ".row:last .col-lg-4:nth-child(2)", page: "library-penalty-management.html", title: "Penalty", sidebarLink: '#lm_common_sidebar .nav-link[href="library-penalty-management.html"]', filter: { paymentStatus: "pending" } },
            { selector: ".row:first .col-md-4:nth-child(2)", page: "library-penalty-management.html", title: "Penalty", sidebarLink: '#lm_common_sidebar .nav-link[href="library-penalty-management.html"]', filter: { paymentStatus: "pending" } },
            { selector: ".row:last .col-lg-4:nth-child(3)", page: "library-users-management.html", title: "Members", sidebarLink: '#lm_common_sidebar .nav-link[href="library-users-management.html"]', filter: { memberStatusFilter: "active" } },
            { selector: ".row:first .col-md-4:nth-child(1)", page: "library-users-management.html", title: "Members", sidebarLink: '#lm_common_sidebar .nav-link[href="library-users-management.html"]', filter: { memberStatusFilter: "active" }  }
        ];

        cardMap.forEach(card => {
            const $card = $("#dashboardContainer").find(card.selector);
            $card.css("cursor", "pointer");
            $card.on("click", () => {
                const filterString = encodeURIComponent(JSON.stringify(card.filter));
                localStorage.setItem("dashboardFilter", filterString);
                this.loadPage(card.page);
                this.updateHeader(card.title);
                $(this.Selectors.navLink).removeClass("active");
                $(card.sidebarLink).addClass("active");
                localStorage.setItem("lastPage", card.page);
                localStorage.setItem("lastTitle", card.title);
            });
        });
    };

    /**
     * 
     * Sidebar active link
     * 
     */
    this.setActiveLink = function ($link) {
        const s = this.Selectors;
        $(this.Selectors.navLink).removeClass("active");
        if ($link) $link.addClass("active");
        else {
            const lastPage = localStorage.getItem("lastPage") || "library-dashboard.html";
            $(`${s.navLink}[href="${lastPage}"]`).addClass("active");
        }
    };

    /**
     * 
     * Update header title
     * 
     */
    this.updateHeader = function (title) {
        const s = this.Selectors;
        $(this.Selectors.lmCommonHeaderTitle).text(title);
    };
};


$(document).ready(function () {
    const app = new App();
    app.init();

    // Attach dashboard card clicks when library.dashboard.js finishes loading
    $(document).on("dashboardLoaded", () => {
        app.attachDashboardCardClicks();
    });
});
