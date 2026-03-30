import { Pie, Bar } from "react-chartjs-2";

const COLORS = ["#c4431a", "#1a7fc4", "#1d6b43", "#7b3fb5", "#b06c10", "#0f6e56"];

const s = {
  section: { marginTop: "32px" },
  sectionTitle: {
    fontFamily: "Georgia, serif",
    fontSize: "20px",
    color: "#1a1814",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid rgba(30,25,20,0.1)",
    padding: "24px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#1a1814",
    marginBottom: "4px",
  },
  cardSub: {
    fontSize: "12px",
    color: "#7a7670",
    marginBottom: "20px",
  },
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "16px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#7a7670",
  },
  legendLeft: { display: "flex", alignItems: "center", gap: "6px" },
  legendDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  empty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "180px",
    color: "#7a7670",
    fontSize: "13px",
  },
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 12, family: "DM Sans, sans-serif" }, color: "#7a7670" },
    },
    y: {
      grid: { color: "rgba(0,0,0,0.04)" },
      ticks: {
        font: { size: 11, family: "DM Sans, sans-serif" },
        color: "#7a7670",
        callback: (v) => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v),
      },
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "68%",
  plugins: { legend: { display: false }, tooltip: { callbacks: {
    label: (ctx) => ` ₹${ctx.raw.toLocaleString("en-IN")}`,
  }}},
};

export default function Charts({ pieData, barData }) {
  const hasBarData = barData?.datasets?.[0]?.data?.length > 0;
  const hasPieData = pieData?.datasets?.[0]?.data?.length > 0;

  // Enrich bar dataset styling
  const styledBarData = hasBarData
    ? {
        ...barData,
        datasets: barData.datasets.map((ds) => ({
          ...ds,
          backgroundColor: "#c4431a",
          borderRadius: 6,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        })),
      }
    : barData;

  // Enrich pie dataset styling
  const styledPieData = hasPieData
    ? {
        ...pieData,
        datasets: pieData.datasets.map((ds) => ({
          ...ds,
          backgroundColor: COLORS.slice(0, ds.data.length),
          borderWidth: 0,
          hoverOffset: 6,
        })),
      }
    : pieData;

  // Total for pie percentages
  const pieTotal = hasPieData
    ? pieData.datasets[0].data.reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div style={s.section} id="charts">
      <h2 style={s.sectionTitle}>Spending Analytics</h2>

      <div style={s.grid}>
        {/* Bar chart */}
        <div style={s.card}>
          <div style={s.cardTitle}>Monthly Spending</div>
          <div style={s.cardSub}>Breakdown by month</div>
          {hasBarData ? (
            <div style={{ position: "relative", height: "220px" }}>
              <Bar data={styledBarData} options={barOptions} />
            </div>
          ) : (
            <div style={s.empty}>No monthly data yet</div>
          )}
        </div>

        {/* Donut chart */}
        <div style={s.card}>
          <div style={s.cardTitle}>By Category</div>
          <div style={s.cardSub}>This month's breakdown</div>
          {hasPieData ? (
            <>
              <div style={{ position: "relative", height: "180px" }}>
                <Pie data={styledPieData} options={pieOptions} />
              </div>
              <div style={s.legend}>
                {pieData.labels.map((label, i) => {
                  const val = pieData.datasets[0].data[i];
                  const pct = pieTotal > 0 ? ((val / pieTotal) * 100).toFixed(0) : 0;
                  return (
                    <div key={label} style={s.legendItem}>
                      <div style={s.legendLeft}>
                        <div style={{ ...s.legendDot, background: COLORS[i % COLORS.length] }} />
                        <span>{label}</span>
                      </div>
                      <span style={{ fontWeight: "500", color: "#1a1814" }}>
                        {pct}% · ₹{val.toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div style={s.empty}>No category data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}