# Kaveh – مرحلهٔ اول

بازی موبایل افقی (دوبعدی) با **Phaser** که با **Capacitor** به برنامهٔ نصبی اندروید تبدیل می‌شود.
کاوه جعبه را روی الاکلنگ می‌گذارد، روی سر دیگر می‌پرد و جعبه به دشمن روی ساختمان می‌خورد.

## ساختار پروژه
| مسیر | کار |
|---|---|
| `www/index.html` | صفحهٔ اصلی بازی |
| `www/sim.js` | فیزیک (حرکت کاوه، هل دادن جعبه، الاکلنگ، پرتاب). مستقل از رندر و تست‌شده |
| `www/game.js` | رندر، صدا، افکت، ابر و پرنده، رابط |
| `www/assets.js` | تصاویر و اسکلت شخصیت‌ها (تولیدشده، دستی ویرایش نکن) |
| `art/source/` | برگه‌های تصویر اصلی (شخصیت، دشمن، ساختمان، روح) |
| `tools/` | اسکریپت پایتون تولید `assets.js` از برگه‌های تصویر |
| `tests/sim.test.js` | تست فیزیک (`npm test`) |
| `android/` | پروژهٔ اندروید (با دستور زیر ساخته می‌شود) |

## پیش‌نیازها (ویندوز)
1. **Git for Windows** – https://git-scm.com
2. **Node.js نسخهٔ LTS (۲۰ یا بالاتر)** – https://nodejs.org
3. **Android Studio** – https://developer.android.com/studio
   هنگام نصب، گزینهٔ *Android Virtual Device* را تیک بزن. بعد از اولین باز کردن، SDK و ابزارها دانلود می‌شوند (چند گیگابایت).
4. (فقط اگر ابزار تصویر را اجرا می‌کنی) Python 3 و `pip install pillow numpy opencv-python`

سیستم: حداقل ۸ گیگ رم (۱۶ بهتر)، حدود ۲۰ گیگ فضای خالی، و روشن بودن Virtualization در بایوس.

## گرفتن پروژه از گیت و اجرا
```bash
git clone <آدرس-مخزن-خودت>
cd kaveh-game
npm install
npm test                 # (اختیاری) تست فیزیک؛ باید همه PASS باشند
npm run android:add      # فقط بار اول: پروژهٔ اندروید را می‌سازد و افقی می‌کند
npm run android:open     # Android Studio را با پروژه باز می‌کند
```
در Android Studio:
1. صبر کن پایین صفحه «Gradle sync» تمام شود (بار اول چند دقیقه).
2. از منوی **Tools > Device Manager** یک گوشی مجازی بساز (مثلاً *Pixel 6*، نسخهٔ *API 34*).
3. گوشی را از بالای صفحه انتخاب کن و دکمهٔ سبز **▶ Run** را بزن. شبیه‌ساز باز می‌شود و بازی اجرا می‌شود.

### اجرا روی گوشی واقعی
1. در گوشی: *Settings > About phone* را باز کن و روی *Build number* هفت بار بزن تا Developer options فعال شود.
2. در *Developer options* گزینهٔ **USB debugging** را روشن کن.
3. گوشی را با کابل USB وصل کن و اجازه بده. گوشی در لیست Android Studio می‌آید؛ آن را انتخاب کن و ▶ بزن.

### ساخت فایل نصبی (APK)
Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
فایل در `android/app/build/outputs/apk/debug/app-debug.apk` ساخته می‌شود و آن را می‌توانی روی هر گوشی اندروید نصب کنی.

## بعد از هر تغییر در بازی
```bash
npm run sync             # فایل‌های www را داخل پروژهٔ اندروید می‌ریزد
```
سپس در Android Studio دوباره ▶ را بزن.
**نکته:** برای تست سریع بدون اندروید، `www/index.html` را در مرورگر Chrome باز کن (بعد از `npm run prepare:web`).

## اگر خطا داد
- `JAVA_HOME is not set`: متغیر محیطی `JAVA_HOME` را روی `C:\Program Files\Android\Android Studio\jbr` بگذار و ترمینال را از نو باز کن.
- `phaser پیدا نشد`: اول `npm install` را اجرا کن.
- شبیه‌ساز باز نمی‌شود یا خیلی کند است: Virtualization را در بایوس روشن کن؛ در ویندوز «Windows Hypervisor Platform» را هم از *Turn Windows features on or off* فعال کن.
- هر خطای دیگر: متن کامل خطا را برای Claude بفرست.

## فونت‌ها
فونت‌های فارسی (لاله‌زار و وزیرمتن) از اینترنت گرفته می‌شوند. بدون اینترنت از فونت سیستم استفاده می‌شود. (بعداً می‌شود داخل پروژه گذاشت.)

## بازسازی تصاویر
```bash
python tools/export_assets.py
```
