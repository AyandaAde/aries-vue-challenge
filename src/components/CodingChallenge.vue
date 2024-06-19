<template>
  <div>
    <h1>Options Profit Calculator</h1>
    <canvas id="riskRewardChart"></canvas>
    <div class="data">
      <p>Max Profit: {{ maxProfit }}</p>
      <p>Max Loss: {{ maxLoss }}</p>
      <p>Break Even Points: {{ breakEvenPoints.join(', ') }}</p>
      <p>Risk to Reward Ratio: {{ ratio }}</p>
    </div>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'CodingChallenge',
  props: {
    optionsData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      maxProfit: 0,
      maxLoss: 0,
      ratio: `1: x`,
      breakEvenPoints: []
    };
  },
  mounted() {
    this.calculateRiskReward();
  },
  methods: {
    calculateRiskReward() {
      const prices = [];
      const profits = [];

      //Get profits at various prices to plot on chart

      for (let price = 0; price <= 200; price += 1) {
        let totalProfit = 0;
        this.optionsData.forEach(option => {
          const { strike_price, type, bid, ask, long_short } = option;
          if (type === 'Call') {
            totalProfit = long_short === 'long' ? Math.max(0, price - strike_price) - bid : Math.min(0, strike_price - price) + ask;
          } else if (type === 'Put') {
            totalProfit = long_short === 'long' ? Math.max(0, strike_price - price) - bid : Math.min(0, price - strike_price) + ask;
          }
        });
        prices.push(price);
        profits.push(totalProfit);
      }
 

      // Get the max profit, max loss, break-even points and risk to reward ratios
      this.maxProfit = Math.max(...profits).toFixed(2);
      this.maxLoss = Math.min(...profits).toFixed(2);
      this.breakEvenPoints = prices.filter((price, index) => profits[index] === 0);
      this.ratio = `1 : ${Math.floor(this.maxProfit / Math.floor(Math.abs(this.maxLoss)))}`;

      this.plotChart(prices, profits);
    },
    plotChart(xData, yData) {
      const ctx = document.getElementById('riskRewardChart').getContext('2d');
      const plugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const {ctx} = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || '#99ffff';
    ctx.fillRect(0, -60, (chart.width+50), (chart.height+100));
    ctx.restore();
  }
};
      const riskToRewardChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: xData,
          datasets: [{
            label: 'Options Strategy Risk to Reward Chart',
            data: yData,
            borderColor: 'green',
            borderWidth: 1,
            tension: 0,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            customCanvasBackgroundColor: {
              color: "#bf996d",
            }
          },
          backgroundColor: "black",
          borderColor: "#000",
          color: "#000",
          scales: {
            x: {
              title: {
                display: true,
                text: 'Underlying Price at time of Expiry',
                color: "#000",
                font: {
                  size: 12
                }
              },
            },
            y: {
              title: {
                display: true,
                text: 'Profit/Loss',
                color: "#000",
                font: {
                  size: 12
                }
              }
            }
          }
        },
        plugins: [plugin],
      });
      riskToRewardChart;
    }
  }
};
</script>

<style scoped>
.data{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 760px;
  margin: auto;
}
canvas {
  max-width: 700px;
  height: 500px;
  margin: 0 auto;
  border-radius: 30px;
}
p {
  margin: 10px 0px 0px 40px;
  text-align: left;
}
</style>