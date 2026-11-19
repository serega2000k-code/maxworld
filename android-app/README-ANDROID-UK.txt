MAXWORLD 5.1 — ПРОЄКТ ANDROID ДЛЯ ЗБІРКИ APK

Це нативна Android-оболонка для поточної вебгри MAXWORLD 5.1. Вона відкриває
локальні файли гри у повноекранному WebView під захищеною локальною адресою,
завдяки чому працюють JavaScript, localStorage та Service Worker. Прогрес
офлайн-гри зберігається на пристрої. Онлайн-режим потребує доступного сервера.

ВАЖЛИВО
- У цьому архіві є вихідний Android Studio-проєкт, але немає готового APK.
- APK не був зібраний або перевірений на фізичному телефоні в цьому середовищі:
  тут відсутні Android SDK, Android Build Tools та Gradle.
- Для першого запуску потрібен інтернет, щоб завантажити Three.js і кешувати
  його Service Worker. Після успішного першого завантаження офлайн-режим може
  працювати з локальним кешем. Це потрібно перевірити на реальному пристрої.
- Для онлайн-гри у формі входу вкажи адресу запущеного MAXWORLD-сервера.

ЯК ЗІБРАТИ APK НА КОМП'ЮТЕРІ
1. Встанови Android Studio з офіційного сайту developer.android.com/studio.
2. Розпакуй архів MAXWORLD-v5.1-Android-Project.zip.
3. В Android Studio обери File → Open і відкрий папку android-app.
4. Дозволь Gradle Sync та встановлення Android SDK Platform 35, якщо IDE попросить.
5. У меню Build обери Build Bundle(s) / APK(s) → Build APK(s).
6. Після успішної збірки натисни Locate у повідомленні Android Studio.
   APK зазвичай буде в android-app/app/build/outputs/apk/debug/app-debug.apk.
7. Передай APK на Android-телефон, дозволь встановлення з цього джерела та
   встанови MAXWORLD.

ПІДПИСАНИЙ APK ДЛЯ ПУБЛІЧНОГО РОЗПОВСЮДЖЕННЯ
Для публікації потрібен окремий release-ключ і Release build. Не передавай
нікому файл ключа та його пароль.

ПРОЄКТ
- Назва: MAXWORLD
- Application ID: ua.maxworld.game
- Версія: 5.1.0 (versionCode 51)
- Мінімальна Android: 6.0 (API 23)
- Орієнтація: підтримується автоматично, гра має мобільні сенсорні кнопки.

ЯК ЗІБРАТИ APK ЧЕРЕЗ GITHUB (БЕЗ ANDROID STUDIO)
У корені проєкту є workflow .github/workflows/build-android-apk.yml.
1. Створи новий репозиторій GitHub.
2. Завантаж у нього вміст папки MAXWORLD-v5.0 з цього архіву (разом із
   прихованою папкою .github та папкою android-app).
3. У репозиторії відкрий Actions → Build MAXWORLD Android APK.
4. Натисни Run workflow і дочекайся зеленого статусу успішного запуску.
5. Відкрий завершений запуск workflow, у нижній частині сторінки завантаж
   артефакт MAXWORLD-Android-APK. Усередині буде app-debug.apk.
6. Скопіюй APK на телефон і встанови його.

Якщо GitHub не показує workflow, перевір, що файл .github/workflows/
build-android-apk.yml завантажено в корінь репозиторію.
