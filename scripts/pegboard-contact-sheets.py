from PIL import Image,ImageDraw
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
pairs=re.findall(r"\['([a-z0-9-]+)','([^']+)'",(root/'src/features/pegboard/catalog.ts').read_text())
counts=[17,4,7,8,8,8,8,6,8]
start=0
for index,count in enumerate(counts):
 group=pairs[start:start+count];start+=count
 out=Image.new('RGB',(1000,((count+4)//5)*200),'#e5efeb');draw=ImageDraw.Draw(out)
 for i,(id,name) in enumerate(group):
  file=root/f'public/pegboard/items/{id}.webp'
  if file.exists():
   im=Image.open(file).convert('RGBA');im.thumbnail((175,165));out.paste(im,((i%5)*200+(200-im.width)//2,(i//5)*200),im)
  draw.text(((i%5)*200+5,(i//5)*200+177),id,fill='#234e4b')
 out.save(root/f'artifacts/visual-check/pegboard-category-{index+1}.jpg')
print(f'{len(pairs)} catalog entries in nine QA sheets')
