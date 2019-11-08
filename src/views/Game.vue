<template>
  <div class="pt-4 pr-3 pl-3">
    <b-row>
      <b-col>
        <h4><strong>Stage {{progress.difficulty}}-{{progress.currLevel}}</strong></h4>
      </b-col>
      <b-col v-if="progress.currLevel === progress.maxLevel">
        <stopwatch ref="stopwatch" :time="stopwatchTime" :countingDown="true" :showIcon="false" v-on:timer-stopped="gameOver"></stopwatch>
      </b-col>

      <b-col class="text-right">
        <healthbar v-bind:max="health.max" v-bind:current="health.current"/>
      </b-col>
    </b-row>

    <hr/>
    <b-row>
      <b-col class="text-center">
        <tex v-bind:expression="expression"></tex>
      </b-col>
    </b-row>
    <hr/>

    <tree v-bind:treeData="treeData" class="tree"></tree>
    <b-row class="text-center">
      <b-col>
        <b-form-group label="Set the values">
          <b-form-checkbox-group
              v-model="selected"
              :options="options"
              switches
          ></b-form-checkbox-group>
        </b-form-group>
      </b-col>
    </b-row>

    <b-row class="text-center">
      <b-col>
        <b-button-group>
          <b-button variant="secondary" size="lg" v-on:click="selected=[]">Reset</b-button>
          <b-button variant="primary" size="lg" v-on:click="confirm">Confirm</b-button>
        </b-button-group>
      </b-col>
    </b-row>

    <b-modal ref="modal" :title="modalText" hide-header-close hide-footer no-close-on-backdrop no-close-on-esc>
      <b-container>
        <b-row align-h="center" block v-if="modalText === 'Game Over!'">
          <b-col cols="6">
            <b-button variant="primary" size="lg" block v-on:click="resetGame">Try Again</b-button>
          </b-col>
        </b-row>
        <b-row align-h="center" v-if="modalText === 'Game Over!'">
          <b-col cols="6">
            <b-button variant="primary" size="lg" block v-on:click="printMessage('functionality not yet implemented')">Leaderboard</b-button>
          </b-col>
        </b-row>
        <b-row align-h="center" v-if="modalText === 'Correct!'">
          <b-col cols="6">
            <b-button variant="primary" size="lg" block v-on:click="loadNextStage">Next Level</b-button>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import {randBoolExpr} from "@/lib/compiler/generator";
import Tree from "../components/Tree";
import Tex from "../components/Tex";
import Healthbar from "../components/Healthbar";
import Stopwatch from "../components/Stopwatch";

export default {
  name: "Game",
  components: {Tree, Tex, Healthbar, Stopwatch},
  props: {},
  data() {
    return {
      progress: {
        difficulty: 1,
        currLevel: 1,
        maxLevel: 5,
      },
      health: {
        max: 5,
        current: 3,
      },
      selected: [],
      options: [],
      expression: "",
      modalText: "",
      treeData: {nodes: [], edges: []},
      difficultySettings: {
        1: ["and","or", "not", "True", "False"],
        2: ["and", "not", "True", "False", "xor"]
      }
    };
  },
  computed: {
    selection() {
      let params = {};
      this.options.forEach(o => params[o] = false);
      this.selected.forEach(s => params[s] = true);
      return params;
    },
    vars() {
      return new Array(this.progress.currLevel + 1).fill(0).map((_, index) => "v" + index);
    },
    functions() {
      if(this.progress.difficulty <= 3) {
        return this.difficultySettings[this.progress.difficulty]
      } else {
        return ["and","or", "not", "true", "false", "xor", "implication", "eq"]
      }
    },
    stopwatchTime() {
      let minutesPerDifficulty = 0.5,
          totalSecs = minutesPerDifficulty * 60 * this.progress.difficulty,
          mins = Math.floor(totalSecs/60),
          secs = totalSecs - (mins*60)
      return mins + ":" + secs
    }
  },
  methods: {
    confirm() {
      const isAnswerCorrect = this.tree.evaluate(this.selection);
      if (isAnswerCorrect) {
        if (this.progress.currLevel === this.progress.maxLevel) {
          this.progress.currLevel = 1;
          this.progress.difficulty++;
        } else {
          this.progress.currLevel++;
        }
        this.generateExercise();
      } else {
        this.health.current--;
        if (this.health.current === 0) {
          this.gameOver()
        }
      }
    },
    generateExercise() {
      this.selected = [];
      const {tree, solution} = randBoolExpr({setSize: 2, maxDepth: this.progress.difficulty, vars: this.vars, functions: this.functions});
      console.log(solution);
      this.tree = tree;
      this.options = this.tree.vars.map(v => {
        return {text: v, value: v};
      });

      const {nodes, edges} = this.tree.toGraph();
      this.treeData = {nodes, edges};
      this.expression = "\\phi =" + this.tree.to("tex");
      const treeNodes = new Set(nodes.filter(node => typeof node.type === "string").map(node => node.label));
      this.options = Array.from(treeNodes).sort((a, b) => a.split("v")[1] - b.split("v")[1]);
    },
    resetGame() {
      this.generateExercise();
      this.modalText = "";
      this.$refs["modal"].hide();
      this.progress.currLevel = 1;
      this.progress.difficulty = 1;
      this.health.current = this.health.max;
    },
    gameOver(){
      this.modalText = "Game Over!";
      this.$refs["modal"].show();
    },
    printMessage(msg) {
      alert(msg);
    },
  },
  mounted() {
    this.generateExercise();
  },
};
</script>

<style>
.tree {
  height: 35vh;
}
</style>