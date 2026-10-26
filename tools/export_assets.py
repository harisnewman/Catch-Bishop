"""ساخت www/assets.js از برگه‌های تصویر (art/source). اجرا:  python tools/export_assets.py
نیازمند: pip install pillow numpy opencv-python"""
import sys, os, json, io, base64
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
from PIL import Image
from rigs import build
from specs import KAV, FOE
from seg import load, comps
def b64(im, q=88):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
art, out = {}, {}
for key, spec in (('K', KAV), ('F', FOE)):
    parts, imgs = build(spec)
    out[key] = {'lower': spec['lower'], 'upper': spec['upper'],
                'parts': {n: {'w': p['w'], 'h': p['h'], 'pv': p['pv'], 'pos': list(p['pos']), 'ch': p['children']} for n, p in parts.items()}}
    for n, im in imgs.items(): art[key + '_' + n] = b64(im)
bimg = load('bld', 'building.png'); lab, cs = comps(bimg); i, x, y, w, h, _ = cs[0]
bc = Image.fromarray(bimg[y:y+h, x:x+w]); bc = bc.resize((round(bc.width * 420 / bc.height), 420), Image.LANCZOS); art['bld'] = b64(bc, 90)
gimg = load('gho', 'ghost_sheet.png'); lab, cs = comps(gimg); d = {c[0]: c[1:5] for c in cs}; x, y, w, h = [int(v) for v in d[3]]
msk = cv2.dilate((lab == 3).astype(np.uint8), np.ones((3, 3), np.uint8)); g = gimg[y:y+h, x:x+w].copy(); g[..., 3] = np.where(msk[y:y+h, x:x+w] > 0, g[..., 3], 0)
gi = Image.fromarray(g); gi = gi.resize((round(gi.width * 240 / gi.height), 240), Image.LANCZOS); art['ghost'] = b64(gi, 90)
dst = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'www', 'assets.js')
open(dst, 'w', encoding='utf-8').write('/* تولیدشده توسط tools/export_assets.py - دستی ویرایش نکنید */\nconst RIGS=' + json.dumps(out) + ';\nconst ART=' + json.dumps(art) + ';\n')
print('OK ->', dst)
