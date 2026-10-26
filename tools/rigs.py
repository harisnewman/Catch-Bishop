import cv2,numpy as np,json,math,base64,io
from PIL import Image
from seg import load,comps
def getimg(k,f):
    img=load(k,f); lab,cs=comps(img); return img,lab,{c[0]:c[1:5] for c in cs}
SH={'kav':getimg('kav','kaveh_sheet.png'),'foe':getimg('foe','enemy_sheet.png')}
def crop(sh,i,x0=None,x1=None):
    img,lab,bb=SH[sh]; x,y,w,h=[int(v) for v in bb[i]]
    msk=cv2.dilate((lab==i).astype(np.uint8),np.ones((3,3),np.uint8))
    c=img[y:y+h,x:x+w].copy(); c[...,3]=np.where(msk[y:y+h,x:x+w]>0,c[...,3],0)
    return c,x,y
def gap(sh,i):  # leg gap column in a pants piece
    c,x,y=crop(sh,i); a=c[...,3]>127; h=a.shape[0]; row=a[int(h*.93)]
    xs=np.where(~row)[0]; xs=xs[(xs>a.shape[1]*.25)&(xs<a.shape[1]*.75)]; return int(xs.mean()) if len(xs) else a.shape[1]//2
def build(spec):
    parts={}; imgs={}
    for nm,p in spec['parts'].items():
        sh,i=p['src']; c,x,y=crop(sh,i)
        if 'cut' in p:
            g=gap(sh,i) if p['cut']=='gap' else p['cut']; a0,a1=(0,g) if p['side']=='L' else (g,c.shape[1]); c=c[:,a0:a1]; x+=a0
            pv=p['pv'] if 'pv' in p else None
        h,w=c.shape[:2]; fx,fy=p['f'] if isinstance(p['f'],(list,tuple)) else (p['f'],p['f'])
        nw,nh=max(1,round(w*fx)),max(1,round(h*fy)); imgs[nm]=Image.fromarray(c).resize((nw,nh),Image.LANCZOS)
        parts[nm]=dict(w=nw,h=nh,pv=[p['pvr'][0]*nw,p['pvr'][1]*nh],pos=p['pos'],children=p.get('children',[]))
    return parts,imgs
def M(tx,ty,t): c,s=math.cos(t),math.sin(t); return np.array([[c,-s,tx],[s,c,ty],[0,0,1]])
def render(spec,parts,imgs,pose,sc=1.5,W=420,H=460,ox=None,oy=None,bg=235):
    ox=ox or W/2; oy=oy or H*.8
    cv=np.zeros((H,W,4),np.float32); cv[...,:3]=bg; cv[...,3]=255
    base=np.array([[sc,0,ox],[0,sc,oy],[0,0,1]])
    def draw(nm,parent,flip=False):
        p=parts[nm]; node=parent@M(p['pos'][0],p['pos'][1],pose.get(nm,0)); mat=node@M(-p['pv'][0],-p['pv'][1],0)
        wi=cv2.warpAffine(np.array(imgs[nm]).astype(np.float32),mat[:2],(W,H),flags=cv2.INTER_LINEAR,borderValue=(0,0,0,0))
        al=wi[...,3:4]/255.; cv[...,:3]=wi[...,:3]*al+cv[...,:3]*(1-al)
        for ch in p['children']: draw(ch,node)
    up=base@M(0,pose.get('by',0),pose.get('lean',0))
    for nm in spec['lower']: draw(nm,base)
    for nm in spec['upper']: draw(nm,up)
    return cv.astype(np.uint8)
