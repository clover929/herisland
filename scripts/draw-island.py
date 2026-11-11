from pathlib import Path
import random
random.seed(12)
s=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 880"><defs><pattern id="sea" width="80" height="54" patternUnits="userSpaceOnUse"><path d="M5 25q10 -5 20 0t20 0" fill="none" stroke="#368d8c" stroke-width="1" opacity=".18"/></pattern><filter id="shadow"><feGaussianBlur stdDeviation="17"/></filter></defs><path fill="#bce2d9" d="M0 0h1400v880H0z"/><path fill="url(#sea)" d="M0 0h1400v880H0z"/><ellipse cx="710" cy="703" rx="485" ry="99" fill="#366e67" opacity=".17" filter="url(#shadow)"/><path d="M154 394 640 166 1208 380 1191 555 708 788 180 572z" fill="#a87057" stroke="#31594c" stroke-width="3"/><path d="m180 530 528 218 483-233v40L708 788 180 572z" fill="#855748"/><path d="M154 394 640 166 1208 380 708 638z" fill="#a3c987" stroke="#31594c" stroke-width="3"/><path d="m154 394 554 244 500-258-14 83-486 241-536-231z" fill="#dfc48d"/><path d="m284 400 418 185 373-180M480 297l235 100 204-96M708 397v188" stroke="#f6e8ba" stroke-width="32" fill="none" stroke-linejoin="round"/><path d="m284 400 418 185 373-180M480 297l235 100 204-96M708 397v188" stroke="#d6b786" stroke-width="1.5" stroke-dasharray="4 10" fill="none"/>']
def add(x):s.append(x)
def house(x,y,w,h,c,roof):
 add(f'<g transform="translate({x} {y})"><path d="M0 0 {w} {-w*.45} {w*1.65} 0 {w*.65} {w*.45}z" fill="{roof}" stroke="#31594c" stroke-width="2"/><path d="M0 0v{h}l{w*.65} {w*.45}V{w*.45}z" fill="{c}" stroke="#31594c" stroke-width="2"/><path d="m{w*.65} {w*.45} {w} {-w*.45}v{h}l-{w} {w*.45}z" fill="{c}" filter="brightness(.9)" stroke="#31594c" stroke-width="2"/><path d="m{w*.85} {h*.6} 0 27 18 -8v-27z" fill="#385f59"/>')
 for i in range(3):add(f'<path d="m{w*.82+i*23} {h*.27-i*10}v13l12 -5v-13z" fill="#fbecc3" stroke="#31594c"/>')
 add('</g>')
def tree(x,y,r=22):add(f'<g transform="translate({x} {y})"><ellipse cy="15" rx="{r}" ry="10" fill="#31594c" opacity=".12"/><path d="M0 12v-40" stroke="#71513d" stroke-width="7"/><circle cy="-47" r="{r}" fill="#527f59" stroke="#31594c" stroke-width="1.5"/><circle cx="-8" cy="-56" r="{r*.7}" fill="#7ca768"/></g>')
# Museum, greenhouse, cottages and personal treehouse
house(738,219,118,93,'#f9e6b4','#e3a456');house(750,201,46,23,'#caa0b7','#5c7f76')
for x,y,c in [(349,326,'#c5b0dc'),(260,383,'#eea082'),(414,383,'#e4c169')]:house(x,y,62,64,c,'#657a88')
house(415,506,80,61,'#dfb587','#699771');tree(408,509,47);tree(506,531,36)
# forum amphitheatre
add('<g transform="translate(695 393)"><ellipse rx="117" ry="57" fill="#ce8a70" stroke="#31594c" stroke-width="2"/><ellipse cy="-10" rx="94" ry="44" fill="#f4c4a0" stroke="#31594c" stroke-width="2"/><ellipse cy="-19" rx="72" ry="31" fill="#f9dfb2" stroke="#31594c" stroke-width="2"/><path d="M-42-38v-49l89 7v49z" fill="#6c8d75" stroke="#31594c" stroke-width="2"/><path d="M-32-75h20v16h-20m30-12h23v13H-2" fill="#f6e3a4"/></g>')
# lighthouse at east coast
add('<g transform="translate(1132 352)"><ellipse cy="35" rx="58" ry="25" fill="#f4d59a"/><path d="m-24 20 6-149h36l7 149q-25 17-49 0z" fill="#fff0c6" stroke="#31594c" stroke-width="2"/><path d="m-22-12 2-32h41l2 32zM-19-77l2-25h34l3 25z" fill="#e99470"/><path d="M-25-129v-28h50v28z" fill="#e7b351" stroke="#31594c" stroke-width="2"/><path d="m-33-157 33-23 33 23z" fill="#5c8270" stroke="#31594c" stroke-width="2"/><path d="M-7 25V4q8-14 16 0v21" fill="#486b62"/></g>')
# harbour wooden deck and boat
add('<path d="m866 624 115 44 110-54-115-46z" fill="#bb8a5c" stroke="#31594c" stroke-width="2"/>')
for i in range(9):add(f'<path d="m{875+i*12} {627+i*4} 108-52" stroke="#795a42" opacity=".6"/>')
add('<g transform="translate(1047 727)"><path d="m-70-17 139-18-34 40-70 9z" fill="#487b79" stroke="#31594c" stroke-width="2"/><path d="M0-32v-100L-49-48z" fill="#fff1c8" stroke="#31594c" stroke-width="2"/><path d="M8-118v77l45-10z" fill="#e9a381" stroke="#31594c" stroke-width="2"/></g>')
# tiny original residents, gardens, benches, lamps
for x,y in [(570,338),(850,369),(510,429),(782,478),(313,440),(905,523),(602,564),(1023,426)]:
 add(f'<g transform="translate({x} {y})"><ellipse cy="9" rx="9" ry="4" fill="#31594c" opacity=".15"/><path d="M-4 8v-12h8V8m-9 0v8m8-8v8" stroke="#526c7d" stroke-width="3" fill="#e6a77f"/><circle cy="-12" r="6" fill="#c08b65"/><path d="M-6-13q0-10 12-2" stroke="#4c5147" stroke-width="3"/></g>')
for x,y in [(215,402),(542,276),(625,239),(968,342),(1055,384),(344,502),(563,588),(831,570),(895,294)]:tree(x,y)
for i in range(75):
 x=random.randint(240,1120);y=random.randint(350,540)
 if i%3==0:add(f'<path d="M{x} {y}v-8m-3 4 3-2 4 1" stroke="#5c8c65" stroke-width="2"/>')
add('<g fill="#f8f4dc" opacity=".8"><path d="M188 180q-18-22 8-30 5-28 29-15 22-18 33 8 30-2 28 20z"/><path d="M960 128q-18-22 8-30 5-28 29-15 22-18 33 8 30-2 28 20z"/></g>')
add('</svg>');Path('public/island/map.svg').write_text(''.join(s))
