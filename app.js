const monthlyData = [
  { month: "Oca", income: 760000, expense: 420000 },
  { month: "Şub", income: 812000, expense: 446000 },
  { month: "Mar", income: 865000, expense: 479000 },
  { month: "Nis", income: 891000, expense: 501000 },
  { month: "May", income: 950000, expense: 524000 },
  { month: "Haz", income: 986000, expense: 542000 },
  { month: "Tem", income: 1015000, expense: 575000 },
  { month: "Ağu", income: 1108000, expense: 618000 },
  { month: "Eyl", income: 1170000, expense: 643000 },
  { month: "Eki", income: 1235000, expense: 674000 },
  { month: "Kas", income: 1290000, expense: 702000 },
  { month: "Ara", income: 1375000, expense: 731000 },
];

const transactions = [
  { date: "2026-01-06", desc: "Enterprise CRM Lisansı", type: "Gider", amount: 48000, status: "Onaylandı" },
  { date: "2026-01-07", desc: "Yıllık Destek Sözleşmesi", type: "Gelir", amount: 220000, status: "Tahsil Edildi" },
  { date: "2026-01-08", desc: "Sunucu Ölçeklendirme", type: "Gider", amount: 72000, status: "Beklemede" },
  { date: "2026-01-09", desc: "Kurumsal Eğitim Paketi", type: "Gelir", amount: 138000, status: "Tahsil Edildi" },
];

const formatTRY = (value) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value);

function renderKPIs() {
  const totalIncome = monthlyData.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = monthlyData.reduce((sum, item) => sum + item.expense, 0);
  const netProfit = totalIncome - totalExpense;
  const pending = transactions.filter((item) => item.status === "Beklemede").length;
  const score = Math.max(70, Math.min(98, Math.round((totalIncome / (totalExpense * 1.2)) * 100)));

  document.getElementById("revenue").textContent = formatTRY(totalIncome);
  document.getElementById("profit").textContent = formatTRY(netProfit);
  document.getElementById("pending").textContent = String(pending);
  document.getElementById("cash").textContent = `${score}/100`;
}

function drawChart() {
  const canvas = document.getElementById("financeChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 44;
  const chartHeight = height - padding * 1.8;
  const chartWidth = width - padding * 2;

  const maxVal = Math.max(...monthlyData.map((x) => Math.max(x.income, x.expense))) * 1.08;

  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "rgba(111, 140, 255, 0.28)");
  gradient.addColorStop(1, "rgba(111, 140, 255, 0.02)");

  const drawSeries = (key, stroke, fill = null) => {
    ctx.beginPath();
    monthlyData.forEach((point, i) => {
      const x = padding + (i * chartWidth) / (monthlyData.length - 1);
      const y = padding + chartHeight - (point[key] / maxVal) * chartHeight;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });

    if (fill) {
      ctx.lineTo(padding + chartWidth, height - padding * 0.8);
      ctx.lineTo(padding, height - padding * 0.8);
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.beginPath();
      monthlyData.forEach((point, i) => {
        const x = padding + (i * chartWidth) / (monthlyData.length - 1);
        const y = padding + chartHeight - (point[key] / maxVal) * chartHeight;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
    }

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = padding + (i * chartHeight) / 5;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  drawSeries("income", "#6f8cff", gradient);
  drawSeries("expense", "#ff5d8f");

  ctx.fillStyle = "#9fb2de";
  ctx.font = "12px Inter";
  monthlyData.forEach((point, i) => {
    const x = padding + (i * chartWidth) / (monthlyData.length - 1);
    ctx.fillText(point.month, x - 10, height - 16);
  });
}

function renderTransactions() {
  const body = document.getElementById("transactionsBody");
  body.innerHTML = "";

  transactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((item) => {
      const row = document.createElement("tr");
      const badgeType = item.status === "Beklemede" ? "pending" : "success";
      row.innerHTML = `
        <td>${item.date}</td>
        <td>${item.desc}</td>
        <td>${item.type}</td>
        <td>${formatTRY(item.amount)}</td>
        <td><span class="badge ${badgeType}">${item.status}</span></td>
      `;
      body.appendChild(row);
    });

  document.getElementById("transaction-count").textContent = `${transactions.length} işlem`;
}

function initializeForm() {
  const form = document.getElementById("transactionForm");
  const dateInput = document.getElementById("date");
  dateInput.value = new Date().toISOString().slice(0, 10);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const desc = document.getElementById("desc").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const date = dateInput.value;

    if (!desc || !amount || !date) {
      return;
    }

    transactions.unshift({
      date,
      desc,
      type,
      amount,
      status: type === "Gelir" ? "Tahsil Edildi" : "Onaylandı",
    });

    if (type === "Gelir") {
      monthlyData[monthlyData.length - 1].income += amount;
    } else {
      monthlyData[monthlyData.length - 1].expense += amount;
    }

    renderTransactions();
    renderKPIs();
    drawChart();
    form.reset();
    dateInput.value = new Date().toISOString().slice(0, 10);
  });
}

function setLastSync() {
  const now = new Date();
  const text = now.toLocaleDateString("tr-TR") + " " + now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("last-sync").textContent = text;
}

setLastSync();
renderKPIs();
drawChart();
renderTransactions();
initializeForm();
