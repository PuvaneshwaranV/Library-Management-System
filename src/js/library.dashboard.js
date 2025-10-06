const Dashboard = function () {
    this.Selectors = {
        loader: "#loader",
        mainContainer: "#dashboard_container",
        bookStatusChart: "#book_status_chart",
        rentalsChart: "#rentals_chart",
        membersChart: "#members_chart",
        totalMembers: "#total_members",
        activePenalties: "#active_penalties",
        refreshBtn: "#dashboard_refresh_btn",
    };

    this.bookStatusInstance = null;
    this.rentalsInstance = null;
    this.membersInstance = null;

    // ---------------- INIT -----------------
    this.init = () => {
        // Hide dashboard until data is ready
        $(this.Selectors.mainContainer).hide();
        $(this.Selectors.loader).show();

        // Optional manual refresh
        $(document)
            .off("click", this.Selectors.refreshBtn)
            .on("click", this.Selectors.refreshBtn, () =>
                this.fetchAndRender()
            );

        // Initial load
        this.fetchAndRender();
    };

    // ----------- HELPERS -------------
    this._destroyIfExists = (inst) => {
        if (inst && typeof inst.destroy === "function") {
            try {
                inst.destroy();
            } catch (e) {}
        }
    };

    const apiUrl = "http://localhost:8080/LibraryManagementSystem";

    this._fetchMembers = () =>
        $.ajax({
            url: `${apiUrl}/Members/getAllMembers`,
            data: {
                start: 0,
                length: 25,
                memberStatusFilter: "active",
                order: "asec",
            },
            method: "GET",
            dataType: "json",
        });

    this._fetchPenalties = () =>
        $.ajax({
            url: `${apiUrl}/Penalty/getPenalty`,
            data: {
                start: 0,
                length: 10,
                order: "asc",
                paymentStatus: "pending",
            },
            method: "GET",
            dataType: "json",
        });

    // 🔹 New Books API
    this._fetchBooks = () =>
        $.ajax({
            url: `${apiUrl}/Books/getAllBooks`,
            data: {
                start: 0,
                length: 20,
                BookAvailablity: "available",
            },
            method: "GET",
            dataType: "json",
        });

    // -------------- CORE ---------------
    this.fetchAndRender = () => {
        $(this.Selectors.loader).show();
        $(this.Selectors.mainContainer).hide();

        // Fire all three requests together
        Promise.allSettled([
            this._fetchMembers(),
            this._fetchPenalties(),
            this._fetchBooks(),
        ])
            .then(([membersRes, penaltyRes, booksRes]) => {
                // -------- Members --------
                if (
                    membersRes.status === "fulfilled" &&
                    membersRes.value?.object
                ) {
                    $(this.Selectors.totalMembers).text(
                        membersRes.value.object.fetchedRecords || 0
                    );
                }

                // -------- Penalties --------
                if (
                    penaltyRes.status === "fulfilled" &&
                    penaltyRes.value?.object
                ) {
                    $(this.Selectors.activePenalties).text(
                        penaltyRes.value.object.fetchedRecords || 0
                    );
                }

                // -------- Books (Available vs Borrowed) --------
                let available = 0;
                let borrowed = 0;
                if (booksRes.status === "fulfilled" && booksRes.value?.object) {
                    // available count from API
                    available = booksRes.value.object.fetchedRecords || 0;

                    // borrowed = total - available
                    const totalBooks =
                        booksRes.value.object.totalRecords || available;
                    borrowed = Math.max(totalBooks - available, 0);
                }

                this.initCharts({
                    available,
                    borrowed,
                });
            })
            .catch((err) => console.error("Dashboard fetch error:", err))
            .finally(() => {
                $(this.Selectors.loader).hide();
                $(this.Selectors.mainContainer).show();
            });
    };

    // -------------- CHARTS --------------
    this.initCharts = ({ available = 0, borrowed = 0 } = {}) => {
        this.initBookStatusChart(available, borrowed);
        this.initRentalsChart();
        this.initMembersChart();
    };

    this.initBookStatusChart = (available, borrowed) => {
        const ctx = $(this.Selectors.bookStatusChart)[0];
        if (!ctx) return;
        this._destroyIfExists(this.bookStatusInstance);

        this.bookStatusInstance = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: ["Available", "Borrowed"],
                datasets: [
                    {
                        data: [available, borrowed],
                        backgroundColor: ["#3b82f6", "#10b981"],
                        borderWidth: 0,
                    },
                ],
            },
            options: {
                cutout: "70%",
                plugins: {
                    legend: {
                        position: "bottom",
                    },
                },
                responsive: true,
            },
        });
    };

    this.initRentalsChart = () => {
        const ctx = $(this.Selectors.rentalsChart)[0];
        if (!ctx) return;
        this._destroyIfExists(this.rentalsInstance);

        const labels = ["Apr", "May", "Jun", "Jul", "Aug", "Sept"];
        const activeRentals = [30, 25, 40, 37, 20, 41];
        const overdue = [20, 15, 10, 15, 12, 18];

        this.rentalsInstance = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Active Rentals",
                        data: activeRentals,
                        backgroundColor: "#1e293b",
                    },
                    {
                        label: "Overdue",
                        data: overdue,
                        backgroundColor: "#f59e0b",
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom",
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    };

    this.initMembersChart = () => {
        const ctx = $(this.Selectors.membersChart)[0];
        if (!ctx) return;
        this._destroyIfExists(this.membersInstance);

        const labels = ["Apr", "May", "Jun", "Jul", "Aug", "Sept"];
        const newMembers = [6, 7, 11, 6, 12, 13];

        this.membersInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "New Members",
                        data: newMembers,
                        borderColor: "#f97316",
                        tension: 0.4,
                        fill: false,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    };
};

const DashboardInstance = new Dashboard();
DashboardInstance.init();
