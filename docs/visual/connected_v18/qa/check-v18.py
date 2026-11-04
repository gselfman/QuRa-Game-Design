import json,copy,pathlib,hashlib,subprocess,wave,math,os
BASE=pathlib.Path(__file__).resolve().parent
ROOT=BASE.parents[3]
os.chdir(BASE)
models=json.load(open('v18-reaction-model.json'));models={m['key']:m for m in models}
names={};defaults={}
for f in ['target-prototype-vars.json','defense-prototype-vars.json','v18-vars.json','v18-more-vars.json','v18-input-vars.json','v18-combat-vars.json','v18-extra-legacy-vars.json']:
    j=json.load(open(f));names.update(j.get('variables',{}))
    for k,v in j.get('defaults',{}).items():defaults[k]=v.get('value') if isinstance(v,dict) and 'value' in v else v
class Run:
    def __init__(self):self.s={names[k]:v for k,v in defaults.items() if k in names};self.dest=None
    def get(self,n):return self.s.get(names[n])
    def set(self,n,v):self.s[names[n]]=v
    def val(self,m,i):
        x=m['pool'][i]
        if 'l' in x:return x['l']
        if 'v' in x:return self.s.get(x['v'],False)
        a=[self.val(m,j) for j in x['a']];e=x['e']
        return {'NOT':lambda:not a[0],'AND':lambda:a[0] and a[1],'OR':lambda:a[0] or a[1],'EQUALS':lambda:a[0]==a[1],'ADDITION':lambda:str(a[0])+str(a[1])}[e]()
    def acts(self,m,ids):
        for i in ids:
            a=m['pool'][i]
            if a[0]=='set':self.s[a[1]]=self.val(m,a[2])
            elif a[0]=='go':self.dest=a[1]
            elif a[0]=='if':
                for cond,actions in a[1]:
                    if cond is None or self.val(m,cond):self.acts(m,actions);break
    def click(self,k,path):
        m=models[k];n=next(n for n in m['nodes'] if n['path']==path);self.acts(m,n['r'][0][1])
    def action(self,t,hero,kind):
        m=models[f'{t}-turn'];var=names['current/actionKey']
        for n in m['nodes']:
            if not n['path'].startswith('current actions/'+hero+'/'):continue
            for i in n['r'][0][1]:
                a=m['pool'][i]
                if a[0]=='set' and a[1]==var and self.val(m,a[2])==kind:self.acts(m,n['r'][0][1]);return
        raise AssertionError((hero,kind))
    def init(self,t,typ,roster):
        self.set('combat/type',typ);self.set(f'combat{t}/inited',False);self.set(f'prep{t}/ready',True)
        for i,k in enumerate(roster,1):
            self.set(f'prep{t}/p{i}/key',k)
            for key in ['C01','C02','C03','C04','C05','C06']:self.set(f'prep{t}/p{i}/show/{key}',key==k)
        self.click(f'{t}-turn','')
def confirm(r,t):r.click(f'{t}-effect','modal/Выбранное действие/button/Подтвердить действие')
checks=[]
def check(name,fn):fn();checks.append({'name':name,'pass':True})
def snapshot():
    r=Run();r.init(3,'target',['C02','C06','C03']);assert [r.get(f'combat3/p{i}/key') for i in [1,2,3]]==['C02','C06','C03'];assert r.get('current/actorKey')=='C02'
    r.set('prep3/p1/key','C01');assert r.get('combat3/p1/key')=='C02'
check('arbitrary six-hero roster is copied once into a battle snapshot',snapshot)
def target():
    r=Run();r.init(3,'target',['C01','C05','C04']);r.action(3,'C01','maneuver');confirm(r,3);assert r.dest==models['3-target']['id'];r.click('3-target','asset/C06');r.click('3-target','button/Подтвердить цель');assert r.get('saved/C01/action')=='Скорлупа';assert r.get('saved/C01/targetKey')=='C06';assert r.get('current/actorKey')=='C05'
check('maneuver and selected target survive individual confirmation',target)
def defense():
    r=Run();r.init(2,'target',['C02','C06']);r.action(2,'C02','defend');confirm(r,2);assert r.get('saved/C02/action')=='Защита';assert r.get('saved/C02/targetKey')=='';assert r.get('current/actorKey')=='C06'
check('Defense is saved without an enemy target',defense)
def wall():
    r=Run();r.init(3,'wall',['C01','C05','C04']);assert r.get('current/targetKey')=='C02';r.action(3,'C01','attack');confirm(r,3);assert r.get('saved/C01/targetKey')=='C02';assert r.get('current/targetKey')=='C06';r.action(3,'C05','maneuver');confirm(r,3);assert r.get('saved/C05/targetKey')=='C06';assert r.get('current/targetKey')=='C03'
check('wall pairs stay 1–1, 2–2, 3–3',wall)
def lock():
    r=Run();r.init(3,'target',['C01','C05','C04']);assert not r.get('current/specialReady');r.click('3-turn','fighter/slot2');assert r.get('current/specialReady');assert r.get('current/actorKey')=='C05'
check('Special availability follows the selected fighter',lock)
def full():
    r=Run();r.init(3,'target',['C01','C05','C04'])
    for hero in ['C01','C05','C04']:r.action(3,hero,'defend');confirm(r,3)
    assert r.get('combat3/ready');assert r.dest==models['3-review']['id'];r.click('3-review','modal/Проверьте ходы команды/button/Зафиксировать ходы');assert r.get('combat3/submitted');assert r.dest==models['3-wait']['id'];r.click('3-wait','');assert r.dest not in [models['1-turn']['id'],models['2-turn']['id']]
check('all three choices must be saved before submission; wait resolves to team reveal',full)
def one():
    r=Run();r.init(1,'wall',['C06']);r.action(1,'C06','maneuver');confirm(r,1);assert r.get('saved/C06/action')!='Атака';assert r.dest==models['1-review']['id']
check('1×1 supports a different hero and preserves the unique maneuver',one)
raw=json.load(open('v18-collect-model.json'))['collect'][0]['actions']
state={names['collect/available']:True};dest=[]
def rv(v):return state.get(v['value']['id']) if v['type']=='VARIABLE_ALIAS' else v['value']
def ra(actions):
    for a in actions:
        if a['type']=='SET_VARIABLE':state[a['variableId']]=rv(a['variableValue'])
        elif a['type']=='NODE':dest.append(a['destinationId'])
        elif a['type']=='CONDITIONAL':
            for b in a['conditionalBlocks']:
                if 'condition' not in b or rv(b['condition']):ra(b['actions']);break
ra(raw);first=dest[-1];assert state[names['resources/GE']]=='1 234';assert not state[names['collect/available']]
ra(raw);assert dest[-1]!=first;assert state[names['resources/GE']]=='1 234';checks.append({'name':'collect grants once and repeat taps show the empty state','pass':True})
g=json.load(open('v18-navigation.json'));ids={x['id'] for x in g};assert not [(x['id'],e) for x in g for e in x['edges'] if e not in ids];checks.append({'name':'all internal destinations exist on the unified page','pass':True})
by={x['id']:x for x in g}
for x in g:
    q=[x['id']];seen=set();ok=False
    while q:
        n=by[q.pop()]
        if n['id'] in seen:continue
        seen.add(n['id'])
        if n['back'] or n['key']=='coop-entry' or n['external']:ok=True;break
        q.extend(n['edges'])
    assert ok,x
checks.append({'name':'every state has a return route or an intentional external exit','pass':True})
assert set(f for x in g for f in x['fonts'])=={'Onest','Russo One'};checks.append({'name':'product fonts only','pass':True})
audio=json.load(open(ROOT/'assets/audio/v18/audio-manifest.json'));assert len(audio['files'])==35
for x in audio['files']:
    assert hashlib.sha256((ROOT/x['file']).read_bytes()).hexdigest()==x['sha256']
    assert x['duration']>0 and x['peakDbFS']<0
checks.append({'name':'35 original cues have matching hashes, positive durations and peak headroom','pass':True})
out={'method':'Actual Figma reactions read back through Plugin API, interpreted locally; no browser playback or backend calls.','screens':len(g),'reactions':sum(x['reactions'] for x in g),'checks':checks}
pathlib.Path('v18-checks.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print(json.dumps(out,ensure_ascii=False,indent=2))
