<template>
  <div class="small" v-if="loaded">
    <line-chart :chart-data="datacollection" v-if="type === 'line'"></line-chart>
    <bar-chart :chart-data="datacollection" v-if="type === 'bar'"></bar-chart>
    <pie-chart :chart-data="datacollection" v-if="type === 'pie'"></pie-chart>
    <doughnut-chart :chart-data="pieData" v-if="type === 'doughnut'"></doughnut-chart>

    <button @click="fillData()">Randomize</button>
  </div>
</template>

<script>
  import LineChart from '../lib/charts/LineChart.js'
  import BarChart from '../lib/charts/BarChart.js'
  import PieChart from '../lib/charts/PieChart.js'
  import DoughnutChart from '../lib/charts/DoughnutChart.js'

  export default {
    name: 'RandomChart',
    components: {
      LineChart,
      BarChart,
      PieChart,
      DoughnutChart
    },
    props: ['type'],
    data () {
      return {
        datacollection: null,
        pieData: null,
        loaded: false
      }
    },
    mounted () {
      this.fillData()
    },
    methods: {
      fillData () {
        this.datacollection = {
          labels: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()],
          datasets: [
            {
              label: 'Run History',
              borderColor: '#f87979',
              fill: false,
              lineTension: 0.4,
              data: [this.getRandomInt(), this.getRandomInt(), this.getRandomInt(), this.getRandomInt()]
            }
          ]
        }

        this.pieData = {
          labels: ['AND','OR','IMPLICATION',
          "NOT",
          "TRUE",
          "FALSE",
          "XOR",
          "EQUAL",],
          datasets: [
            {
              backgroundColor: ['#0066ff','#ff00ff','#66ff33','#ff6600','#cc33ff','#33ffff','#ffff33','#ff3333'],
              data: [this.getRandomInt(),this.getRandomInt(),this.getRandomInt(),this.getRandomInt(),this.getRandomInt(),this.getRandomInt(),this.getRandomInt(),this.getRandomInt()]
            }
          ]
        
        }
        //only render the graph once we have data (especially important for async calls to api)
        this.loaded = true
      },
      getRandomInt () {
        return Math.floor(Math.random() * (50 - 5 + 1)) + 5
      }
    }
  }
</script>

<style>
</style>