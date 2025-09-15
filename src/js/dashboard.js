new Chart(document.getElementById('bookStatusChart'), {
    type: 'doughnut',
    data: {
      labels: ['Available','Borrowed'],
      datasets: [{
        data: [80, 20],        // replace with dynamic values
        backgroundColor: ['#3b82f6', '#10b981'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '70%',
      plugins: { legend: { position: 'bottom' } }
    }
  });

  // ===== Rentals Overview Bar =====
  new Chart(document.getElementById('rentalsChart'), {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [
        {
          label: 'Active Rentals',
          data: [160,180,190,200,210,220],
          backgroundColor: '#1e293b'
        },
        {
          label: 'Overdue',
          data: [20,15,10,15,12,18],
          backgroundColor: '#f59e0b'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true } }
    }
  });

  // ===== New Members Line =====
  new Chart(document.getElementById('membersChart'), {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [{
        label: 'New Members',
        data: [20,25,30,28,35,40],
        borderColor: '#f97316',
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