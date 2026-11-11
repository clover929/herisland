"""HerIsland original SVG world: organic coves, six distinct districts, miniature life."""
from pathlib import Path
import random,math
random.seed(230)
S=[]
def a(s):S.append(s)
def p(d,f='none',sw=1.8,stroke='#204c5a',extra=''):a(f'<path d="{d}" fill="{f}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round" {extra}/>')
def ellipse(x,y,rx,ry,f,extra=''):a(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{f}" {extra}/>')
def group(x,y,scale=1):a(f'<g transform="translate({x} {y}) scale({scale})">')
def end():a('</g>')
def tree(x,y,scale=1,kind=0):
 group(x,y,scale);ellipse(0,7,19,7,'#196c7040');p('M0 5V-30','none',5,'#775135')
 if kind: p('M0-82Q-28-58-16-38Q-34-16-4-16Q30-9 18-37Q26-65 0-82z','#2c9b67');p('M-4-29 5-66','none',1,'#83d577')
 else:
  for dx,dy,r,c in [(-14,-37,18,'#128c67'),(12,-39,21,'#25a96c'),(0,-57,22,'#5dcf70')]:ellipse(dx,dy,r,r,c,'stroke="#267566" stroke-width="1.3"')
 end()
def person(x,y,c='#f55f89',s=1,pose=0):
 group(x,y,s);ellipse(0,8,8,3,'#15566d26');p('M-3 2-4 13M4 2 6 12','none',2.8,'#25475b');p('M-6 0v-13q6-7 12 0V0z',c,1.1);p('M-6-11-11-3m17-8 9 -5' if pose else 'M-6-11-10-3m16-8 10 8','none',2,'#b67350');ellipse(0,-21,5.5,6,'#da9d6b');p('M-6-22q-1-11 9-6l4 6-8-3z','#384957',.8);end()
def building(x,y,w,h,color,roof='#ff8454',style='normal'):
 group(x,y);p(f'M0 0v{h}l{w*.55} {w*.25}V{w*.25}z',color);p(f'M{w*.55} {w*.25} {w*1.45} 0v{h}l-{w*.9} {w*.25}z',color,1.8,extra='filter="brightness(.87)"');
 p(f'M-6 0Q{w*.2} {-w*.22} {w*.52} {-w*.4}L{w*1.52}-8 {w*.55} {w*.3}z',roof)
 for row in range(max(1,h//27)):
  for col in range(max(2,int(w//22))):
   xx=w*.66+col*20; yy=18+row*24-col*5
   p(f'M{xx} {yy}v13l10-3v-13z','#8be2e8',.8)
 for col in range(2):p(f'M{10+col*14} {22+col*5}v16l8 2v-16z','#fff0a1',.7)
 p(f'M{w*.95} {h+7}v-23q7-12 14-3v21','#344b79',1.2)
 p(f'M3 {h+4}l{w*.51} {w*.23} {w*.88} {-w*.24}','none',3,'#f8edb9')
 if style=='shop':
  p(f'M{w*.53} {h-18}l{w*.98} {-w*.27} 5 13-{w*.98} {w*.27}z','#fff5ce',1)
  for k in range(5):p(f'M{w*.55+k*w*.2} {h-18-k*w*.055}l6 12','none',6,'#fa6884')
 end()
def bench(x,y):
 group(x,y);p('M-14-4 10-14 26-7 2 3z','#f8bb55',1);p('M-13-5v9M22-7v9M2 3v8','none',2,'#3d6270');end()
def lamp(x,y):group(x,y);p('M0 8v-40q0-12 12-10','none',2.8);ellipse(13,-42,7,4,'#ffe78c','stroke="#315768"');end()
a('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 880"><defs><pattern id="water" width="92" height="65" patternUnits="userSpaceOnUse"><path d="M8 28q9-4 18 0t18 0m22 20h15" fill="none" stroke="#d4fbf3" stroke-width="1.5" opacity=".35"/></pattern><filter id="shadow"><feGaussianBlur stdDeviation="15"/></filter></defs><style>.wave{animation:wave 8s ease-in-out infinite}@keyframes wave{50%{opacity:.45}}@media(prefers-reduced-motion:reduce){.wave{animation:none}}</style>')
p('M0 0H1400V880H0z','#2ab6d9',0);p('M0 0H1400V880H0z','url(#water)',0,extra='class="wave"');ellipse(700,684,483,103,'#12628540','filter="url(#shadow)"')
shore='M139 371C112 319 189 277 252 283Q255 211 351 207C400 146 491 174 523 150Q619 85 721 141C797 110 851 165 887 187Q1003 163 1049 249C1139 240 1232 305 1201 368Q1282 432 1197 478C1236 530 1153 579 1081 576C1056 655 971 675 900 644Q839 713 739 681C681 727 601 687 568 656C466 696 407 647 393 615Q284 630 252 567C166 580 116 513 161 469Q89 430 139 371z'
group(0,47);p(shore,'#a65b52',3);end();group(0,25);p(shore,'#ce7860',2);end();p(shore,'#ffd162',3);p(shore,'none',11,'#ffeab0');p(shore,'none',2,'#23566a')
# varied district meadows, gardens and natural cove contours
p('M180 340Q190 251 340 256T477 351L407 428Q218 425 180 340z','#59c987',1.5)
p('M226 462Q340 393 475 477T501 607Q319 645 248 545z','#86d16e',1.5)
p('M936 263Q1101 233 1172 337T1103 456L977 419z','#f58f8c',1.5)
p('M804 511Q984 476 1110 527L1055 600Q926 662 810 605z','#79cfbe',1.5)
p('M493 238Q651 141 834 237L899 300 692 374 525 316z','#c1a8f1',1.5)
# layered paths not a regular grid
for d in ['M294 339Q468 322 630 389T1068 350','M385 528Q541 447 661 413T820 244','M667 426Q783 513 933 559','M337 341Q269 438 385 528']:
 p(d,'none',26,'#fff2c2');p(d,'none',1.2,'#d5aa63',extra='stroke-dasharray="2 8"')
# back trees & small terraces
for x,y,k in [(230,290,0),(298,248,0),(446,241,1),(512,200,0),(579,187,1),(884,219,0),(959,251,1),(1168,395,0),(1098,502,1),(206,451,0),(530,581,0),(620,619,1)]:tree(x,y,1,k)
# Museum: curved glass dome, colonnade, banners, open book monument
building(725,228,119,93,'#f5b8d2','#6b5bd2')
group(796,204);p('M-71 0Q-65-100 0-107Q65-100 71 0z','#70d7e2',2);p('M-71 0Q0 28 71 0','none',3,'#305d86')
for xx in [-45,-22,0,22,45]:p(f'M{xx} 2Q{xx*.65}-82 0-107','none',1.3,'#f0ffed')
for yy in [-25,-52,-75]:p(f'M{-65+abs(yy)*.35} {yy}Q0 {yy+15} {65-abs(yy)*.35} {yy}','none',1,'#d3fff1')
end()
for x in [817,843,869]:p(f'M{x} 274v46','none',8,'#fff3ce')
for x,c in [(745,'#ffcd51'),(775,'#f05885')]:p(f'M{x} 258v44l14-6v-44z',c,1)
group(696,280);p('M-30 0Q-10-14 0-2Q17-21 32-14v36Q13 17 0 31Q-15 20-30 25z','#fff2b0',2);p('M0-2v33M-23 5l15-2m-15 10 15-2M8 4l17-8M8 12l17-7','none',1,'#7d73ba');end()
# Community shops: diverse roof silhouettes, cafe and music workshop
building(286,313,71,69,'#b398ef','#f56195','shop');building(391,291,63,99,'#ff9671','#9356c8','shop');building(203,368,56,55,'#ffd85c','#4195b8','shop');building(393,383,64,62,'#6ed7db','#f5b13a')
group(345,304);p('M-27 0Q-30-41 0-57Q30-35 27 0z','#b790e2');ellipse(0,-3,28,9,'#f5d665');p('M0-57v-21l21 7-21 6','#ff728d',1);end()
# music notes, outdoor table, tiny market stalls
for x,y in [(303,427),(453,383)]:
 group(x,y);ellipse(0,-15,23,11,'#ff8398','stroke="#315768" stroke-width="1.5"');p('M0-15V9','none',3);bench(-27,2);bench(25,0);end()
# central amphitheatre has tiered seating, stage shell, message wall
for rx,ry,cy,c in [(111,51,421,'#de6b7b'),(93,42,414,'#ff9d79'),(75,32,406,'#ffe39b')]:ellipse(649,cy,rx,ry,c,'stroke="#33576a" stroke-width="1.5"')
group(651,378);p('M-54 0Q-55-65 0-77Q52-67 54 0z','#a88be4');p('M-40 0Q-37-43 0-52Q39-45 42 0z','#fae2ab');p('M-49 0h100l-11 15h-79z','#6a75b5');p('M-19-7v-21h30v21','#388f9c');p('M-7-28v-12','none',2);end()
group(514,380);p('M0 0v-59l80-9v58z','#2d8f94');
for i in range(7):p(f'M{7+i%4*18} {-49+i//4*24}l13-1v13l-13 1z',['#ffd463','#f8a5b6','#c5a5ed'][i%3],.6)
p('M3 0v12m70-20v15','none',3);end()
# Treehouse neighbourhood with canopy bridge, herb beds, washing line
for x,y in [(309,510),(435,502),(489,563)]:tree(x,y,1.5)
building(332,466,65,53,'#f5b778','#357e99');p('M359 533v29m39-18v27','none',6,'#8a5944');p('M367 535l-18 30m29-26-17 32','none',2,'#ffe4a0')
building(455,532,49,48,'#ffe59d','#e56c96')
p('M315 551Q375 583 449 543','none',7,'#d8a475');p('M315 541Q375 572 449 533','none',2,'#765445');
for x in range(325,441,12):p(f'M{x} {548+12*math.sin((x-325)/116*math.pi)}v12','none',1.1)
p('M276 510Q301 521 330 515','none',1);p('M284 514l2 13 10-2-1-11','#f36b89',1);p('M306 518l2 11 9-2v-10','#98bcef',1)
for x,y in [(401,569),(424,581),(448,592)]:
 p(f'M{x} {y}l20-8 16 6-20 9z','#986548',1)
 for j in range(3):p(f'M{x+6+j*5} {y-2}v-9m0 4-4-4m4 4 4-5','none',1.5,'#3b9f6a')
# lighthouse and sun observatory at eastern peninsula
ellipse(1111,360,66,29,'#fff0bd','stroke="#345b6a" stroke-width="2"')
group(1110,316);p('M-25 23l8-139h34l9 139q-25 18-51 0z','#fff3ca');p('M-22-12l2-28h42l2 28zM-19-69l2-25h34l3 25z','#fc765e',1);p('M-26-116v-31h52v31z','#ffcc48');p('M-34-147 0-173 34-147z','#4867b7');p('M-8 24V2q8-13 16 0v22','#386b7b');p('M-34-114h68','none',4);end()
group(1013,330);p('M-20 18v-35h42v35z','#8b8edb');ellipse(1,-17,24,12,'#ffbf54','stroke="#345b6a"');p('M1-17l15-31','none',5,'#fff1b2');ellipse(17,-49,16,9,'#ffb35e','transform="rotate(30 17 -49)" stroke="#345b6a"');end()
# harbour exploration station, piers, crates, ropes and boats (real harbour retained)
building(901,542,64,59,'#ffcf53','#3d9fb8','shop')
p('M917 596l112 44 85-44-112-41z','#bc8658');
for i in range(11):p(f'M{925+i*9} {598+i*3.4}l83-41','none',1,'#80563e')
for x,y in [(953,609),(1049,620),(1088,600)]:p(f'M{x} {y}v30','none',5,'#82583f')
for x,y in [(973,576),(991,586),(1012,575)]:p(f'M{x} {y}l15-7 13 6-15 7zM{x} {y}v15l13 6 15-8v-14m-15 7v15','#e8886b',1)
group(1077,690);p('M-68-17 60-40 28 8-41 6z','#f5edc8');p('M-68-17-41 6 28 8 60-40 22-14z','#ee6d8e');p('M-20-30v-30l44-8v25z','#519ac1');p('M-9-59v-13','none',2);end()
group(854,704,.8);p('M-50-12 47-25 20 9-47 1z','#385d8e');p('M0-25v-86l-37 78z','#fff4c6');p('M7-104v67l29-8z','#ffa170');end()
# Story-world props: reading corners, gardens, public art, bicycles, benches
for x,y in [(474,316),(755,485),(864,416),(536,515),(1000,445)]:bench(x,y)
for x,y in [(482,353),(758,348),(782,523),(1017,388),(264,463)]:lamp(x,y)
for x,y in [(460,433),(861,474)]:
 group(x,y);ellipse(-11,0,9,9,'none','stroke="#315768" stroke-width="2"');ellipse(15,0,9,9,'none','stroke="#315768" stroke-width="2"');p('M-11 0 0-18 15 0H-11L-1-12m-2-9h9m9 21-5-24h7','none',2,'#ed627c');end()
# dense little flower gardens with boundaries: scattered in valid land pockets
for x,y in [(210,348),(447,258),(495,304),(322,458),(561,565),(809,585),(945,458),(1065,408),(662,573),(869,285)]:
 ellipse(x,y,30,12,'#318e76','stroke="#e0f89f" stroke-width="2"')
 for j in range(7):
  xx=x+random.randint(-24,24);yy=y+random.randint(-7,7);p(f'M{xx} {yy}v-9','none',1,'#24644e');ellipse(xx,yy-10,3,3,random.choice(['#ff729c','#fff19d','#bca2f4']))
# diverse micro residents: discussion, reading, cafe, gardens, museum queue and harbour
positions=[(563,421),(590,437),(615,446),(682,437),(717,421),(696,392),(493,400),(535,444),(753,323),(781,337),(828,334),(861,314),(879,300),(331,391),(353,402),(374,414),(288,360),(251,394),(422,355),(458,414),(390,547),(409,557),(468,568),(310,552),(530,496),(579,520),(755,526),(802,543),(846,563),(919,584),(942,600),(1035,591),(1043,365),(1070,386),(1151,375),(968,425),(897,468),(730,570)]
for i,(x,y) in enumerate(positions):person(x,y,['#ff6689','#654cc2','#ffb629','#f4f1d8','#358fb1'][i%5],.85+(i%3)*.08,i%3==0)
# ornamental clusters and coast stones
for x,y in [(177,401),(232,540),(464,628),(704,657),(1090,565),(1169,429)]:
 for i in range(4):ellipse(x+i*9,y+math.sin(i)*5,8,4,['#ffe8a2','#e7af77','#e2c7ad'][i%3],'stroke="#bb8d62" stroke-width=".6"')
# Original floating stepping-stone islets
for x,y in [(157,622),(1251,523),(635,773)]:
 ellipse(x,y,37,15,'#257b9b30');p(f'M{x-27} {y-13}q25-26 54 0l-8 18-38 1z','#d09167');ellipse(x,y-13,27,11,'#a0dc7b','stroke="#345b6a" stroke-width="1.5"');tree(x,y-12,.45)
# Sculpture walk: symbolic exhibition busts, no likeness of real people.
for x,y in [(537,255),(590,236),(639,253),(585,292)]:
 group(x,y);ellipse(0,17,18,7,'#6853a055');p('M-12 0v17l12 5 13-5V0z','#f5d5a8');ellipse(0,0,13,6,'#fff0c6');p('M-10-4q0-14 10-15q11 1 11 15z','#ef9bb9');ellipse(0,-26,8,10,'#f7c28e','stroke="#6b5b83" stroke-width="1"');p('M-8-27q-3-14 10-12l6 12-7-7z','#756294',1);p('M-5 11h10','none',1,'#866e8d');end()
# Picnic lawn and tiny reading umbrellas along the west cove.
for x,y,c in [(233,309,'#ffad60'),(465,548,'#ec86b8'),(819,473,'#9181df')]:
 group(x,y);p('M0 11v-35','none',2);p('M-23-25Q0-57 23-25Q0-11-23-25z',c,1.1);p('M0-49v33','none',1,'#fff2d4');ellipse(0,6,17,6,'#fff0bd','stroke="#345b6a" stroke-width="1"');end()
# A curved pond and stepping stones make the gardens less geometric.
p('M470 570C429 557 450 597 493 601Q544 603 533 583Q513 568 470 570z','#54bdd4',1.2)
for xx,yy in [(461,581),(478,587),(496,587),(515,583)]:ellipse(xx,yy,6,3,'#f6e5ba','stroke="#668c86" stroke-width=".8"')
# Decorative pennants mark the public plaza and museum approach.
for x,y in [(472,355),(734,348),(853,354)]:
 p(f'M{x} {y}v-45','none',2,'#397282');p(f'M{x} {y-45}l24 6-24 8z','#ff7798',1)
# Greenhouse and seedlings at the residential edge.
group(504,481);p('M0 0v-31l23-22 28 11v31l-28 13z','#a5eee1',1.4);p('M0-31 28-12l23-30M28-12v44M12-43l27 12v23M0-15l28 12 23-11','none',1,'#3e9c92');p('M12 5v-12m0 5-6-6m6 6 7-7','none',2,'#479b58');end()

a('</svg>')
Path('public/island/map.svg').write_text(''.join(S))
print('Original SVG world:',len(''.join(S)),'bytes; 38 micro residents plus interactive NPCs.')
