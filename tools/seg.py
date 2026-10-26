import numpy as np,cv2,sys
from PIL import Image
import os
U=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','art','source')+os.sep
def load(k,f):
    im=np.array(Image.open(U+f).convert('RGBA')).astype(float)
    r,g,b,al=im[...,0],im[...,1],im[...,2],im[...,3]
    if k in('kav','gho'):
        d=g-np.maximum(r,b); a=1-np.clip((d-40)/70,0,1)
        g=np.minimum(g,np.maximum(r,b)+6); al=a*255
    return np.dstack([r,g,b,al]).astype(np.uint8)
def comps(img,minarea=500):
    m=(img[...,3]>127).astype(np.uint8); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    return lab,[(i,*st[i][:4],st[i][4]) for i in range(1,n) if st[i][4]>=minarea]
if __name__=='__main__':
    for k,f in {'kav':'kaveh_sheet.png','foe':'enemy_sheet.png','gho':'ghost_sheet.png','bld':'building.png'}.items():
        img=load(k,f); cv2.imwrite(k+'.png',cv2.cvtColor(img,cv2.COLOR_RGBA2BGRA))
        lab,cs=comps(img)
        vis=np.full(img.shape[:2]+(3,),(215,200,220),np.uint8); a=img[...,3:4]/255.; vis=(img[...,:3]*a+vis*(1-a)).astype(np.uint8)
        for (i,x,y,w,h,ar) in cs:
            cv2.rectangle(vis,(x,y),(x+w,y+h),(255,0,0),2); cv2.putText(vis,str(i),(x+3,y+22),cv2.FONT_HERSHEY_SIMPLEX,.8,(255,0,0),2)
        cv2.imwrite(k+'_lab.png',cv2.cvtColor(cv2.resize(vis,None,fx=.75,fy=.75),cv2.COLOR_RGB2BGR))
        print(k,[(i,x,y,w,h) for (i,x,y,w,h,ar) in cs])
