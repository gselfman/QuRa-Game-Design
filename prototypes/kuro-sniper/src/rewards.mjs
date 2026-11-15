export const SCORE_VERSION='qura-sniper-s4';
export const LEVEL_WEIGHTS=[1,1.3,1.7,2.1,2.7,3.3,4,5,6,30];
export const CHESTS={5:{tier:'gold',title:'Золотой сундук',xp:60,buff:'Боевой купол',count:1},9:{tier:'platinum',title:'Платиновый сундук',xp:100,buff:'Боевой купол',count:2},10:{tier:'epic',title:'Эпический сундук',xp:150,buff:'Боевой купол',count:3}};
export function shotReward(level,streakBefore,mistakes,center=false){
 const levelFactor=LEVEL_WEIGHTS[level-1]??1,accuracyFactor=Math.max(.3,1-mistakes*.1),seriesFactor=1+Math.min(5,Math.floor(streakBefore/3))*.1;
 return {earned:Math.round(10*levelFactor*accuracyFactor*seriesFactor*(center?1.25:1)),xp:Math.round(10*(1+(level-1)*.15)*accuracyFactor*seriesFactor*(center?1.1:1)),levelFactor,accuracyFactor,seriesFactor};
}
export function maxScore(hits=15,level=1){return Array.from({length:hits},(_,i)=>shotReward(level,i,0,true).earned).reduce((a,b)=>a+b,0);}
export function emptyProgress(){return {version:2,xp:0,attemptXp:{},chests:{},buffs:{}};}
// Per-attempt XP checkpoints, chest issuance and inventory are written in one local snapshot.
export function settleAttempt(current,run){
 const progress=structuredClone(current);if(run.training)return {progress,xpAdded:0,chest:null};
 if(!run.id)throw new Error('Attempt ID required');const previous=Number(progress.attemptXp[run.id]||0),xpAdded=Math.max(0,run.xp-previous);progress.xp+=xpAdded;progress.attemptXp[run.id]=Math.max(previous,run.xp);
 const spec=CHESTS[run.level];if(run.won&&spec&&!progress.chests[run.level])progress.chests[run.level]={id:`qura:sniper:milestone:${run.level}:v1`,...spec,opened:false};
 return {progress,xpAdded,chest:progress.chests[run.level]||null};
}
export function openChest(current,level){
 const progress=structuredClone(current),chest=progress.chests[level];if(!chest||chest.opened)return {progress,reward:null};
 chest.opened=true;progress.xp+=chest.xp;progress.buffs[chest.buff]=(progress.buffs[chest.buff]||0)+chest.count;return {progress,reward:{xp:chest.xp,buff:chest.buff,count:chest.count}};
}
export function compareRuns(a,b){return b.score-a.score||b.accuracy-a.accuracy||a.mistakes-b.mistakes||a.elapsedS-b.elapsedS;}
