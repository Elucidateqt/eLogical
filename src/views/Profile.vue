<template>
  <div class="text-center">
    <h1>My Profile</h1>
    <hr/>
    <b-row class="mb-4">
      <b-col>
        <b-card>
          <div v-if="loading">
            <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading"/>
          </div>
          <div v-else>
            <h5>
              Your username is
              <b-badge variant="info" v-if="hasScore">{{entry.client.name}}</b-badge>
              <b-badge variant="info" v-else>{{localusername}}</b-badge>
            </h5>
            <h5 v-if="hasScore">
              Your highscore is
              <b-badge variant="warning">{{entry.total}}</b-badge>
            </h5>
            <h4 v-else>You don't have a highscore yet!</h4>
          </div>
        </b-card>
      </b-col>
    </b-row>
    <b-card-group>
      <b-card>
        <h2>Answers submitted</h2>
        <doughnut-chart
            :chart-data="charts.successRate.chartData"
            :options="charts.successRate.options"
            v-if="!loading"
        ></doughnut-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else/>
      </b-card>
      <b-card>
        <h2>Correctness by operator</h2>
        <bar-chart
            :chart-data="charts.successByOp.data"
            :otions="charts.successByOp.options"
            v-if="!loading"
        ></bar-chart>
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" label="Loading" v-else/>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
// import PieChart from "../lib/charts/PieChart.js";
import DoughnutChart from "../lib/charts/DoughnutChart";
import BarChart from "../lib/charts/BarChart";

export default {
  name: "Profile",
  components: {DoughnutChart, BarChart},
  data() {
    return {
      loading: true,
      entry: undefined,
      hasScore: false,
      localusername: localStorage.username,
      charts: {
        successRate: {
          chartData: {
            labels: ["right", "wrong"],
            datasets: [
              {
                backgroundColor: ["rgb(77, 186, 135)", "rgb(255, 99, 132)"],
                data: [],
              },
            ],
          },
          options: {},
        },
        successByOp: {
          data: {
            labels: [
              "and",
              "or",
              "not",
              "xor",
              "implication",
              "eq",
            ],
            datasets: [
              {
                label: "answered correctly",
                backgroundColor: "rgb(77, 186, 135)",
                data: [],
              },
              {
                label: "answered wrong",
                backgroundColor: "rgb(255, 99, 132)",
                data: [],
              },
            ],
          },
          options: {},
          successCounts: {
            and: 0,
            or: 0,
            not: 0,
            xor: 0,
            implication: 0,
            eq: 0,
          },
          failCounts: {
            and: 0,
            or: 0,
            not: 0,
            xor: 0,
            implication: 0,
            eq: 0,
          },
        },
      },
    };
  },
  methods: {
    getDataSuccessByOps(successTrueByOp, successFalseByOp) {
      // console.log("success", successTrueByOp);
      // console.log("fail", successFalseByOp);
      // console.log("successLength", successTrueByOp.length);
      // console.log("type", typeof successTrueByOp);

      //increment successCounts for each occurance of successfully answered operators
      for (let i = 0; i < successTrueByOp.length; i++) {
        let currData = successTrueByOp[i];
        // console.log("successLength", currData._id.op.length)
        for (let j = 0; j < currData._id.op.length; j++) {
          this.charts.successByOp.successCounts[currData._id.op[j]] +=
            currData.frequency;
        }
      }

      //do the same for failed operators
      for (let i = 0; i < successFalseByOp.length; i++) {
        let currData = successFalseByOp[i];
        for (let j = 0; j < currData._id.op.length; j++) {
          this.charts.successByOp.failCounts[currData._id.op[j]] +=
            currData.frequency;
        }
      }

      //transfer them to arrays for the bar-chart
      let successArray = [
        this.charts.successByOp.successCounts.and,
        this.charts.successByOp.successCounts.or,
        this.charts.successByOp.successCounts.not,
        this.charts.successByOp.successCounts.xor,
        this.charts.successByOp.successCounts.implication,
        this.charts.successByOp.successCounts.eq,
      ];

      let failArray = [
        this.charts.successByOp.failCounts.and,
        this.charts.successByOp.failCounts.or,
        this.charts.successByOp.failCounts.not,
        this.charts.successByOp.failCounts.xor,
        this.charts.successByOp.failCounts.implication,
        this.charts.successByOp.failCounts.eq,
      ];

      this.charts.successByOp.data.datasets[0].data = successArray;
      this.charts.successByOp.data.datasets[1].data = failArray;
    },
  },
  mounted() {
    Promise.all([this.$api.getStats(), this.$api.getTracker()])
      .then(response => {
        const stats = response[0];
        const tracker = response[1].data;
        // Frequency of total number correctly answered
        const successTrue = tracker.groupBySuccess.filter(t => t._id.success);
        // Frequency of total number wrongly answered
        const successFalse = tracker.groupBySuccess.filter(t => !t._id.success);
        // Frequency of total numbers correctly answered of a certain operator sequence
        const successTrueByOp = tracker.groupBySuccessAndOp.filter(
          t => t._id.success,
        );
        // Frequency of total numbers wrongly answered of a certain operator sequence
        const successFalseByOp = tracker.groupBySuccessAndOp.filter(
          t => !t._id.success,
        );

        // console.log("successTrue", successTrue);
        // console.log("successFalse", successFalse);
        // console.log("successTrueByOp", successTrueByOp);
        // console.log("successFalseByOp", successFalseByOp);

        if (
          successTrue[0] &&
          successTrue[0].hasOwnProperty("frequency") &&
          successFalse[0] &&
          successFalse[0].hasOwnProperty("frequency")
        ) {
          this.charts.successRate.chartData.datasets[0].data.push(
            successTrue[0].frequency,
          );
          this.charts.successRate.chartData.datasets[0].data.push(
            successFalse[0].frequency,
          );
        }

        if (
          successTrueByOp[0] &&
          successTrueByOp[0].hasOwnProperty("_id") &&
          successFalseByOp[0] &&
          successFalseByOp[0].hasOwnProperty("_id")
        ) {
          this.getDataSuccessByOps(successTrueByOp, successFalseByOp);
        }

        this.loading = false;
        if (stats.data.length > 0) {
          this.hasScore = stats.data.length > 0;
          if (this.hasScore) {
            this.entry = stats.data[0];
          }
        }
      })
      .catch(error => {
        this.loading = false;
        alert(error);
      });
  },
};
</script>