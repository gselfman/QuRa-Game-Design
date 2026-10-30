import {compareFarmScenarios,simulateFarm} from './farm-simulator-m3.mjs';
const scenarios=compareFarmScenarios({days:30});console.log(JSON.stringify(scenarios.map(s=>({cohort:s.cohort,...s.summary,day30:s.timeline.at(-1)})),null,2));
const example=simulateFarm({days:90,cohort:'wallet',seed:20261030});console.log('90-day wallet scenario',JSON.stringify(example.summary));
