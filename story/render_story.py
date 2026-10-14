#!/usr/bin/env python3
"""Instagram story for AB/digital. Screenshots are real source WebPs, never redrawn."""
from pathlib import Path
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "site/assets/portfolio"
OUT = ROOT / "story/ab-digital-instagram-story.png"
W,H=1080,1920
NAVY="#0e1b26";INK="#0c1924";LIME="#d9ff5e";WHITE="#f9fbf3";MUTED="#b8c7ca";EDGE="#50636c"

FONTS=[Path(os.environ.get("AB_FONT_DIR","/nonexistent")),Path("/usr/share/fonts/opentype/inter"),Path("/usr/share/fonts/truetype/dejavu")]
def font(size,weight="regular"):
    opts={"extra":["InterDisplay-ExtraBold.otf","Inter-ExtraBold.otf","DejaVuSans-Bold.ttf"],
          "bold":["InterDisplay-Bold.otf","Inter-Bold.otf","DejaVuSans-Bold.ttf"],
          "semi":["Inter-SemiBold.otf","InterDisplay-Bold.otf","DejaVuSans-Bold.ttf"],
          "regular":["Inter-Regular.otf","InterDisplay-Regular.otf","DejaVuSans.ttf"],
          "medium":["Inter-Medium.otf","InterDisplay-Regular.otf","DejaVuSans.ttf"]}
    for folder in FONTS:
        for name in opts[weight]:
            if (folder/name).is_file():return ImageFont.truetype(str(folder/name),size)
    raise RuntimeError("Missing font")
def rr(d,box,r,fill,outline=None,width=1):d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)
def rounded(img,r):
    m=Image.new("L",img.size,0);ImageDraw.Draw(m).rounded_rectangle((0,0,img.width-1,img.height-1),radius=r,fill=255)
    out=Image.new("RGBA",img.size);out.paste(img,(0,0),m);return out
def screenshot(base,path,x,y,w):
    if not path.is_file():raise FileNotFoundError(f"Real screenshot missing: {path}")
    src=Image.open(path).convert("RGB")
    h=round(w*src.height/src.width)
    src=rounded(src.resize((w,h),Image.Resampling.LANCZOS),23)
    shadow=Image.new("RGBA",base.size)
    sd=ImageDraw.Draw(shadow);rr(sd,(x-20,y-7,x+w+20,y+h+37),41,"#000000aa")
    base.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(28)))
    layer=Image.new("RGBA",base.size);d=ImageDraw.Draw(layer)
    rr(d,(x-13,y-13,x+w+13,y+h+13),39,"#070d12",outline="#4c5963",width=3)
    rr(d,(x-5,y-5,x+w+5,y+h+5),29,"#0e151c")
    layer.alpha_composite(src,(x,y));base.alpha_composite(layer)
def main():
    im=Image.new("RGBA",(W,H),NAVY);d=ImageDraw.Draw(im)
    d.arc((790,-210,1325,325),20,270,fill=LIME,width=3)
    d.arc((-330,990,115,1435),240,420,fill="#729789",width=2)
    d.ellipse((983,104,997,118),fill=LIME)
    rr(d,(73,81,84,153),6,LIME)
    x=110;ab=font(74,"extra")
    d.text((x,76),"AB",font=ab,fill=WHITE);x+=round(d.textlength("AB",font=ab))
    d.text((x-1,75),"/",font=ab,fill=LIME);x+=round(d.textlength("/",font=ab))-5
    d.text((x,85),"digital",font=font(65,"medium"),fill=WHITE)
    d.text((78,179),"TELEGRAM  •  WEB  •  BACKEND  •  DESIGN",font=font(19,"semi"),fill=MUTED)
    d.line((77,221,1000,221),fill=EDGE,width=2)
    d.text((77,269),"Сайты, боты",font=font(77,"extra"),fill=WHITE)
    d.text((77,360),"и Mini Apps",font=font(77,"extra"),fill=WHITE)
    d.text((77,451),"под вашу задачу.",font=font(74,"extra"),fill=LIME)
    d.text((79,556),"Проектируем, разрабатываем и запускаем.",font=font(28,"medium"),fill="#d7e3df")
    d.text((79,594),"От идеи до работающего продукта.",font=font(28,"medium"),fill=MUTED)
    d.text((80,664),"НАШИ ПРОЕКТЫ",font=font(18,"bold"),fill=LIME)
    d.text((788,664),"01 — 02",font=font(18,"bold"),fill=MUTED)
    rr(d,(65,703,1017,1572),38,"#20313c")
    screenshot(im,ASSETS/"salon-services.webp",103,721,376)
    screenshot(im,ASSETS/"reminder-today.webp",602,721,376)
    d=ImageDraw.Draw(im)
    d.text((89,1505),"SALON BOOKING",font=font(22,"bold"),fill=WHITE)
    d.text((89,1535),"Онлайн-запись и бронирование",font=font(20,"regular"),fill=MUTED)
    d.text((568,1505),"REMINDER BOT",font=font(22,"bold"),fill=WHITE)
    d.text((568,1535),"Задачи и напоминания",font=font(20,"regular"),fill=MUTED)
    d.line((77,1603,1003,1603),fill=EDGE,width=2)
    d.text((78,1625),"Нужен похожий сервис?",font=font(46,"bold"),fill=WHITE)
    d.text((78,1681),"Давайте обсудим вашу идею.",font=font(40,"medium"),fill=LIME)
    d.text((85,1770),"САЙТ",font=font(19,"semi"),fill=MUTED)
    d.text((567,1770),"TELEGRAM",font=font(19,"semi"),fill=MUTED)
    rr(d,(77,1805,516,1892),25,"#f9f8ef")
    rr(d,(555,1805,1003,1892),25,"#f9f8ef")
    OUT.parent.mkdir(parents=True,exist_ok=True)
    im.convert("RGB").save(OUT,optimize=True)
    print(f"Created {OUT} — 1080x1920 — {OUT.stat().st_size} bytes")
if __name__=="__main__":main()
