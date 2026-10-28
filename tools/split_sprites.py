"""شخصیت‌ها را از «تصویر کامل» می‌سازد و فقط پاها/پوتین‌ها را برای حرکت جدا می‌کند (بدون تکرار لباس)."""
import numpy as np, cv2
from PIL import Image
from rigs import crop
def split_char(sheet, comp, cut, x0, x1, scale, overlap=8):
    c, _, _ = crop(sheet, comp); H, W = c.shape[:2]
    a = c[..., 3] > 127
    band = a[H-22:, x0:x1].any(axis=0)                      # ستون‌های دارای پیکسل در پایین
    empty = np.where(~band)[0]; mid = (x1 - x0) / 2
    gap = x0 + int(empty[np.argmin(np.abs(empty - mid))]) if len(empty) else (x0 + x1) // 2
    body = c.copy(); body[cut:, x0:x1, 3] = 0
    pieces = {}
    for nm, (a0, a1) in (('legL', (x0, gap)), ('legR', (gap, x1))):
        p = c[cut-overlap:, a0:a1].copy(); al = p[..., 3] > 20
        ys, xs = np.where(al); py0, px0 = ys.min(), xs.min(); p = p[py0:ys.max()+1, px0:xs.max()+1]
        pieces[nm] = (p, a0 + px0, cut - overlap + py0)
    imgs, parts = {}, {}
    sz = lambda im: (max(1, round(im.shape[1]*scale)), max(1, round(im.shape[0]*scale)))
    imgs['body'] = Image.fromarray(body).resize(sz(body), Image.LANCZOS)
    parts['body'] = dict(w=imgs['body'].width, h=imgs['body'].height, pv=[gap*scale, cut*scale], pos=(0, 0), children=[])
    for nm, (p, px, py) in pieces.items():
        imgs[nm] = Image.fromarray(p).resize(sz(p), Image.LANCZOS); w, h = imgs[nm].size
        parts[nm] = dict(w=w, h=h, pv=[w/2, 0], pos=((px + p.shape[1]/2 - gap)*scale, (py - cut)*scale), children=[])
    return {'lower': ['legL', 'legR'], 'upper': ['body']}, parts, imgs, gap
