
  const Dashboard = function () {
    this.selectors = {
      loader: "#loader",
      mainContainer: "#dashboardContainer",
      bookStatusChart: "#bookStatusChart",
      rentalsChart: "#rentalsChart",
      membersChart: "#membersChart",
      totalMembers: "#totalMembers",
      activePenalties: "#activePenalties",
      refreshBtn: "#dashboard_refresh_btn"
    };

    this.bookStatusInstance = null;
    this.rentalsInstance = null;
    this.membersInstance = null;
    
   // $("#dashboardContainer .row:first .col-lg-4:first").css("cursor", "pointer");
    // ---------------- INIT -----------------
    this.init = () => {
      const s = this.selectors;

      // Hide dashboard until data is ready
      $(s.mainContainer).hide();
      $(s.loader).show();

      // Optional manual refresh
      $(document)
        .off("click", s.refreshBtn)
        .on("click", s.refreshBtn, () => this.fetchAndRender());

      // Initial load
      this.fetchAndRender();
    };

    // ----------- HELPERS -------------
    this._destroyIfExists = inst => {
      if (inst && typeof inst.destroy === "function") {
        try { inst.destroy(); } catch (e) { }
      }
    };

    const apiUrl ="http://localhost:8080/LibraryManagementSystem";

    this._fetchMembers = () =>
      $.ajax({
        url: `${apiUrl}/Members/getAllMembers`,
        data: { start: 0, length: 25, memberStatusFilter: "active", order: "asec" },
        method: "GET",
        dataType: "json"
      });

    this._fetchPenalties = () =>
      $.ajax({
        url: `${apiUrl}/Penalty/getPenalty`,
        data: { start: 0, length: 10, order: "asc", paymentStatus: "pending" },
        method: "GET",
        dataType: "json"
      });

    // 🔹 New Books API
    this._fetchBooks = () =>
      $.ajax({
        url: `${apiUrl}/Books/getAllBooks`,
        data: { start: 0, length: 20, BookAvailablity: "available" },
        method: "GET",
        dataType: "json"
      });

    // -------------- CORE ---------------
    this.fetchAndRender = () => {
      const s = this.selectors;
      $(s.loader).show();
      $(s.mainContainer).hide();

      // Fire all three requests together
      Promise.allSettled([
        this._fetchMembers(),
        this._fetchPenalties(),
        this._fetchBooks()
      ])
        .then(([membersRes, penaltyRes, booksRes]) => {
          // -------- Members --------
          if (membersRes.status === "fulfilled" && membersRes.value?.object) {
            $(s.totalMembers).text(membersRes.value.object.fetchedRecords || 0);
          }

          // -------- Penalties --------
          if (penaltyRes.status === "fulfilled" && penaltyRes.value?.object) {
            $(s.activePenalties).text(penaltyRes.value.object.fetchedRecords || 0);
          }

          // -------- Books (Available vs Borrowed) --------
          let available = 0;
          let borrowed = 0;
          if (booksRes.status === "fulfilled" && booksRes.value?.object) {
            // available count from API
            available = booksRes.value.object.fetchedRecords || 0;

            // borrowed = total - available
            const totalBooks = booksRes.value.object.totalRecords || available;
            borrowed = Math.max(totalBooks - available, 0);
          }

          this.initCharts({ available, borrowed });
        })
        .catch(err => console.error("Dashboard fetch error:", err))
        .finally(() => {
          $(s.loader).hide();
          $(s.mainContainer).show();
        });
    };

    // -------------- CHARTS --------------
    this.initCharts = ({ available = 0, borrowed = 0 } = {}) => {
      this.initBookStatusChart(available, borrowed);
      this.initRentalsChart();
      this.initMembersChart();
    };

    this.initBookStatusChart = (available, borrowed) => {
      const ctx = $(this.selectors.bookStatusChart)[0];
      if (!ctx) return;
      this._destroyIfExists(this.bookStatusInstance);

      this.bookStatusInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Available", "Borrowed"],
          datasets: [{
            data: [available, borrowed],
            backgroundColor: ["#3b82f6", "#10b981"],
            borderWidth: 0
          }]
        },
        options: {
          cutout: "70%",
          plugins: { legend: { position: "bottom" } },
          responsive: true
        }
      });
    };

    this.initRentalsChart = () => {
      const ctx = $(this.selectors.rentalsChart)[0];
      if (!ctx) return;
      this._destroyIfExists(this.rentalsInstance);

      const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const activeRentals = [160, 180, 190, 200, 210, 220];
      const overdue = [20, 15, 10, 15, 12, 18];

      this.rentalsInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "Active Rentals", data: activeRentals, backgroundColor: "#1e293b" },
            { label: "Overdue", data: overdue, backgroundColor: "#f59e0b" }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: "bottom" } },
          scales: { y: { beginAtZero: true } }
        }
      });
    };

    this.initMembersChart = () => {
      const ctx = $(this.selectors.membersChart)[0];
      if (!ctx) return;
      this._destroyIfExists(this.membersInstance);

      const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const newMembers = [20, 25, 30, 28, 35, 40];

      this.membersInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [{
            label: "New Members",
            data: newMembers,
            borderColor: "#f97316",
            tension: 0.4,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    };
  };

  // Instantiate immediately on DOM ready
  const DashboardInstance = new Dashboard();
  DashboardInstance.init();
  

