/* Builds the three service pages (Telegram bots, Mini Apps, websites) in RU / KK / EN.
 * Output: site/services/*, site/kk/services/*, site/en/services/*.
 * Usage: node scripts/generate-service-pages.mjs
 * The sitemap and home-page links are produced by scripts/generate-locales.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const domain = 'https://ab-digital.kz';
const TG = 'https://t.me/ArtemBalakin';
const LANGS = ['ru', 'kk', 'en'];
const lp = { ru: '/', kk: '/kk/', en: '/en/' };
const ogLocale = { ru: 'ru_RU', kk: 'kk_KZ', en: 'en_US' };
const switchLabel = { ru: 'RU', kk: 'ҚАЗ', en: 'EN' };
const servicePath = (lang, slug) => (lang === 'ru' ? '' : '/' + lang) + '/services/' + slug + '/';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const attr = s => esc(s).replace(/"/g, '&quot;');

const UI = {
  ru: { home: 'Главная', skip: 'К содержанию', estimate: 'Получить оценку в Telegram', write: 'Написать в Telegram', others: 'Другие услуги', faq: 'Вопросы перед заказом', how: 'Как мы работаем', switchTitle: 'Язык сайта', privacy: 'Политика конфиденциальности', eyebrow: 'АЛМАТЫ · КАЗАХСТАН · УДАЛЁННО', kicker: 'AB/DIGITAL · КАЗАХСТАН', topBots: 'Обсудить бота', topProject: 'Обсудить проект', names: { 'telegram-bots': 'Разработка Telegram-ботов на заказ в Казахстане', 'telegram-mini-apps': 'Разработка Telegram Mini Apps для бизнеса', 'website-development': 'Создание сайтов на заказ в Алматы и Казахстане' } },
  kk: { home: 'Басты бет', skip: 'Мазмұнға өту', estimate: 'Telegram арқылы бағалау алу', write: 'Telegram-ға жазу', others: 'Басқа қызметтер', faq: 'Тапсырыс алдындағы сұрақтар', how: 'Біз қалай жұмыс істейміз', switchTitle: 'Сайт тілі', privacy: '', eyebrow: 'АЛМАТЫ · ҚАЗАҚСТАН · ҚАШЫҚТАН', kicker: 'AB/DIGITAL · ҚАЗАҚСТАН', topBots: 'Ботты талқылау', topProject: 'Жобаны талқылау', names: { 'telegram-bots': 'Қазақстанда тапсырыс бойынша Telegram-бот әзірлеу', 'telegram-mini-apps': 'Бизнеске арналған Telegram Mini App әзірлеу', 'website-development': 'Алматы мен Қазақстанда тапсырыс бойынша сайт жасау' } },
  en: { home: 'Home', skip: 'Skip to content', estimate: 'Get an estimate on Telegram', write: 'Message us on Telegram', others: 'Other services', faq: 'Questions before you order', how: 'How we work', switchTitle: 'Site language', privacy: '', eyebrow: 'ALMATY · KAZAKHSTAN · REMOTE', kicker: 'AB/DIGITAL · KAZAKHSTAN', topBots: 'Discuss a bot', topProject: 'Discuss a project', names: { 'telegram-bots': 'Custom Telegram bot development in Kazakhstan', 'telegram-mini-apps': 'Telegram Mini App development for business', 'website-development': 'Custom website development in Almaty and Kazakhstan' } },
};

const kkFont = lang => lang === 'kk' ? '<link rel="stylesheet" href="/assets/sabina-kk-font.css?v=20261035">' : '';

const process4 = {
  ru: [['Обсуждаем задачу.', 'Уточняем пользователей, функции и ограничения.'], ['Согласуем объём.', 'Фиксируем состав первой версии, оценку и этапы.'], ['Разрабатываем и проверяем.', 'Показываем результат и проходим ключевые сценарии.'], ['Запускаем.', 'Настраиваем размещение и передаём инструкции. Поддержку согласуем отдельно.']],
  kk: [['Міндетті талқылаймыз.', 'Пайдаланушыларды, функциялар мен шектеулерді нақтылаймыз.'], ['Көлемді келісеміз.', 'Бірінші нұсқаның құрамын, бағасын және кезеңдерін бекітеміз.'], ['Әзірлейміз және тексереміз.', 'Нәтижені көрсетіп, негізгі сценарийлерден өтеміз.'], ['Іске қосамыз.', 'Орналастыруды баптап, нұсқаулықтарды береміз. Қолдауды бөлек келісеміз.']],
  en: [['We discuss the task.', 'We clarify users, features and constraints.'], ['We agree the scope.', 'We fix the first version, the estimate and the stages.'], ['We build and test.', 'We show the result and walk through the key scenarios.'], ['We launch.', 'We set up hosting and hand over instructions. Support is agreed separately.']],
};

/* ------------------------------------------------------------------ websites */
const sites = {
  ru: {
    title: 'Создание сайтов в Алматы: цены от 250 000 ₸ | AB/digital',
    desc: 'Создание сайтов в Алматы и Казахстане: лендинг от 250 000 ₸, корпоративный сайт от 500 000 ₸. Дизайн, адаптация для телефона, базовое SEO и запуск на вашем домене.',
    ogTitle: 'Создание сайтов на заказ в Алматы и Казахстане',
    lead: 'Сайт, который объясняет, чем вы занимаетесь, и приводит заявки. Делаем лендинги и корпоративные сайты, а для сложных задач разрабатываем веб-сервисы.',
    facts: [['от 250 000 ₸', 'лендинг'], ['2–4 недели', 'срок лендинга'], ['Рус + каз', 'языки по запросу']],
    anchor: 'Какой сайт нужен ↓', crumb: 'Создание сайтов',
    kindsH: 'Какой сайт вам нужен',
    kinds: [['Лендинг', 'от 250 000 ₸', '2–4 недели', 'Одна страница под конкретное предложение или рекламу: оффер, примеры работ, форма заявки.', 'Когда нужно проверить спрос или запустить рекламу.'], ['Корпоративный сайт', 'от 500 000 ₸', '4–8 недель при готовых материалах, 2–3 месяца с нуля', 'Несколько страниц: услуги, о компании, проекты и контакты.', 'Когда направлений несколько и нужен поиск.'], ['Сайт на Tilda', 'по оценке', 'срок зависит от объёма', 'Быстрый запуск и редактирование контента без разработчика. Ограничения платформы обсудим заранее.', 'Когда важна скорость и вы сами правите тексты.'], ['Веб-сервис', 'по оценке', 'от 3 месяцев', 'Личные кабинеты, своя бизнес-логика и интеграции, которые выходят за рамки конструктора.', 'Когда сайта-визитки недостаточно.']],
    note: 'Цены указаны «от» и зависят от числа страниц, дизайна, контента и интеграций. Домен, хостинг и поддержка обсуждаются отдельно.',
    inclH: 'Что входит в цену', inclCols: [['Входит', ['Структура и дизайн.', 'Адаптация под телефон.', 'Формы заявок.', 'Базовая SEO-настройка: адреса страниц, заголовки, описания, карта сайта.', 'Запуск на вашем домене и инструкция.']], ['Оплачивается отдельно', ['Домен и хостинг.', 'Платные сервисы вроде CRM и рассылок.', 'Поддержка после запуска.', 'Реклама и продвижение.']], ['Чего сайт не сделает', ['Не поднимется в поиске сразу: позиции определяют поисковые системы, нужно время.', 'Не заменит рекламу.', 'Не продаст, если предложение непонятно. Сначала формулируем его.']]],
    exH: 'Пример и опыт', exP: 'На главной показаны проекты Telegram-продуктов и опыт работы с корпоративными платформами. Сам сайт AB/digital показывает наш подход к адаптивному интерфейсу.', exLink: 'Посмотреть на главной',
    faqList: [
      ['Сколько стоит создание сайта?', 'Лендинг — от 250 000 ₸, корпоративный сайт — от 500 000 ₸. Итоговая стоимость зависит от числа страниц, дизайна, контента, функций и интеграций. Оценку подготовим после короткого описания проекта.'],
      ['Почему цены на сайты так отличаются?', 'На цену влияют тип сайта, уникальный дизайн или готовый шаблон, число страниц, подготовка текстов, формы, интеграции и сложность логики. Предложения нескольких студий сравнивайте только при одинаковом объёме работ.'],
      ['Сколько времени занимает создание сайта?', 'Лендинг — 2–4 недели. Корпоративный сайт — 4–8 недель, если материалы готовы, и 2–3 месяца, если дизайн и контент делаются с нуля. Веб-сервис — от 3 месяцев. Быстрее получается, когда готовы структура, тексты, фото и доступы, а медленнее — когда согласования затягиваются.'],
      ['Чем лендинг отличается от корпоративного сайта?', 'Лендинг — одна страница под конкретное предложение или рекламу. Корпоративный сайт — несколько страниц: услуги, о компании, проекты, контакты. Он лучше подходит для поиска, когда у вас несколько направлений.'],
      ['Что входит в базовую SEO-настройку?', 'Понятные адреса страниц, заголовки и описания, основной адрес сайта, карта сайта и доступность для поисковых роботов. Индексацию и позиции определяют поисковые системы.'],
      ['Можно ли заказать сайт без готового текста и дизайна?', 'Да. Начнём со структуры, задач посетителя и материалов о вашей компании. Подготовку контента и дизайн включим в согласованный объём работ.'],
      ['Конструктор вроде Tilda или индивидуальная разработка?', 'Конструктор подходит для быстрого запуска и простого сайта, который вы редактируете сами. Индивидуальная разработка нужна для интеграций, личных кабинетов и полного контроля над скоростью и SEO. Подскажем вариант после разбора задачи.'],
      ['Можно ли сделать сайт на русском и казахском?', 'Да, но языки лучше заложить сразу: адреса страниц, переключатель и разметка языковых версий. Тексты на двух языках увеличивают объём работ, поэтому учитываем их в оценке.'],
      ['Можно ли подключить CRM, аналитику и уведомления?', 'Да, если сервис даёт способ подключения. Заявки можно отправлять сотруднику в Telegram, в CRM или по почте, а для аналитики подключить счётчики посещений и событий.'],
      ['Сколько стоит поддержка после запуска?', 'Зависит от объёма: правки контента, обновления, мониторинг, новые страницы. Её обсуждаем отдельно и фиксируем заранее, чтобы расходы после запуска не были сюрпризом.'],
    ],
    contactH: 'Обсудим ваш проект', contactP: 'Расскажите о задаче и нужном результате. Поможем определить подходящий формат и объём разработки.',
  },
  kk: {
    title: 'Алматыда сайт жасау: 250 000 ₸-ден | AB/digital',
    desc: 'Алматы мен Қазақстанда сайт жасау: лендинг 250 000 ₸-ден, корпоративтік сайт 500 000 ₸-ден. Дизайн, телефонға бейімдеу, базалық SEO және өз доменіңізде іске қосу.',
    ogTitle: 'Алматы мен Қазақстанда тапсырыс бойынша сайт жасау',
    lead: 'Сіз немен айналысатыныңызды түсіндіріп, өтінімдер әкелетін сайт. Біз лендингтер мен корпоративтік сайттар жасаймыз, ал күрделі міндеттер үшін веб-сервистер әзірлейміз.',
    facts: [['250 000 ₸-ден', 'лендинг'], ['2–4 апта', 'лендинг мерзімі'], ['Қаз + орыс', 'тілдер сұрау бойынша']],
    anchor: 'Қандай сайт керек ↓', crumb: 'Сайт жасау',
    kindsH: 'Сізге қандай сайт керек',
    kinds: [['Лендинг', '250 000 ₸-ден', '2–4 апта', 'Нақты ұсыныс немесе жарнама үшін бір бет: ұсыныс, жұмыс мысалдары және өтінім формасы.', 'Сұранысты тексеру немесе жарнаманы іске қосу керек болғанда.'], ['Корпоративтік сайт', '500 000 ₸-ден', 'материалдар дайын болса 4–8 апта, нөлден бастағанда 2–3 ай', 'Бірнеше бет: қызметтер, компания туралы, жобалар және байланыс.', 'Бағыттар бірнешеу болып, іздеу арқылы клиент керек болғанда.'], ['Tilda-дағы сайт', 'бағалау бойынша', 'мерзімі көлемге байланысты', 'Жылдам іске қосу және мазмұнды әзірлеушісіз өңдеу. Платформаның шектеулерін алдын ала талқылаймыз.', 'Жылдамдық маңызды және мәтінді өзіңіз түзететін болғанда.'], ['Веб-сервис', 'бағалау бойынша', '3 айдан бастап', 'Жеке кабинеттер, өз бизнес-логикасы және конструктор мүмкіндігінен асатын интеграциялар.', 'Визитка сайт жеткіліксіз болғанда.']],
    note: 'Бағалар «бастап» деп көрсетілген және беттер санына, дизайнға, мазмұнға және интеграцияға байланысты. Домен, хостинг және қолдау бөлек талқыланады.',
    inclH: 'Бағаға не кіреді', inclCols: [['Кіреді', ['Құрылым және дизайн.', 'Телефонға бейімдеу.', 'Өтінім формалары.', 'Базалық SEO баптауы: бет мекенжайлары, тақырыптар, сипаттамалар, сайт картасы.', 'Сіздің доменіңізде іске қосу және нұсқаулық.']], ['Бөлек төленеді', ['Домен және хостинг.', 'CRM және жіберу сияқты ақылы сервистер.', 'Іске қосқаннан кейінгі қолдау.', 'Жарнама және жылжыту.']], ['Сайт не істемейді', ['Іздеуде бірден көтерілмейді: орындарды іздеу жүйелері анықтайды, уақыт қажет.', 'Жарнаманың орнын баспайды.', 'Ұсыныс түсініксіз болса, сатпайды. Алдымен ұсынысты тұжырымдаймыз.']]],
    exH: 'Мысал және тәжірибе', exP: 'Басты бетте Telegram өнімдеріміз бен корпоративтік платформалармен жұмыс тәжірибеміз көрсетілген. AB/digital сайтының өзі бейімделгіш интерфейске деген біздің көзқарасымызды көрсетеді.', exLink: 'Басты бетте қарау',
    faqList: [
      ['Сайт жасау қанша тұрады?', 'Лендинг — 250 000 ₸-ден, корпоративтік сайт — 500 000 ₸-ден. Түпкілікті баға беттер санына, дизайнға, мазмұнға, функциялар мен интеграцияға байланысты. Жобаның қысқаша сипаттамасынан кейін бағалаймыз.'],
      ['Сайт бағалары неге бұлай ерекшеленеді?', 'Бағаға сайт түрі, бірегей дизайн немесе дайын үлгі, беттер саны, мәтін дайындау, формалар, интеграциялар және логиканың күрделілігі әсер етеді. Бірнеше студияның ұсынысын жұмыс көлемі бірдей болғанда ғана салыстырыңыз.'],
      ['Сайт жасау қанша уақыт алады?', 'Лендинг — 2–4 апта. Корпоративтік сайт — материалдар дайын болса 4–8 апта, ал дизайн мен мазмұн нөлден жасалса 2–3 ай. Жеке кабинеті бар веб-сервис — 3 айдан бастап. Құрылым, мәтін, фото және қолжетімділіктер дайын болса, тезірек шығады, келісулер созылса, баяуырақ.'],
      ['Лендинг корпоративтік сайттан немен ерекшеленеді?', 'Лендинг — нақты ұсыныс немесе жарнама үшін бір бет. Корпоративтік сайт — бірнеше бет: қызметтер, компания туралы, жобалар, байланыс. Бағыттарыңыз бірнешеу болса, іздеу үшін ол қолайлырақ.'],
      ['Базалық SEO баптауына не кіреді?', 'Түсінікті бет мекенжайлары, тақырыптар мен сипаттамалар, сайттың негізгі мекенжайы, сайт картасы және іздеу роботтарына қолжетімділік. Индекстеуді және орындарды іздеу жүйелері анықтайды.'],
      ['Дайын мәтін мен дизайнсыз сайтқа тапсырыс беруге бола ма?', 'Иә. Құрылымнан, келушінің міндеттерінен және компания туралы материалдардан бастаймыз. Мазмұн дайындау мен дизайнды келісілген жұмыс көлеміне қосамыз.'],
      ['Tilda сияқты конструктор ма, әлде жеке әзірлеу ме?', 'Конструктор жылдам іске қосуға және өзіңіз өңдейтін қарапайым сайтқа жарайды. Жеке әзірлеу интеграцияға, жеке кабинеттерге және жылдамдық пен SEO-ны толық бақылауға керек. Міндетті талдағаннан кейін нұсқаны ұсынамыз.'],
      ['Сайтты қазақ және орыс тілдерінде жасауға бола ма?', 'Иә, бірақ тілдерді бірден жоспарлаған жөн: бет мекенжайлары, ауыстырғыш және тіл нұсқаларының белгіленуі. Екі тілдегі мәтін жұмыс көлемін арттырады, сондықтан оны бағалауда ескереміз.'],
      ['CRM, аналитика және хабарландыруларды қосуға бола ма?', 'Иә, егер сервис қосылу тәсілін берсе. Өтінімдерді қызметкерге Telegram-ға, CRM-ге немесе поштаға жіберуге болады, ал аналитика үшін келу және оқиға есептегіштерін қосуға болады.'],
      ['Іске қосқаннан кейінгі қолдау қанша тұрады?', 'Көлемге байланысты: мазмұнды түзету, жаңарту, мониторинг, жаңа беттер. Оны бөлек талқылап, алдын ала бекітеміз, сондықтан іске қосқаннан кейінгі шығын күтпеген жағдай болмайды.'],
    ],
    contactH: 'Жобаңызды талқылайық', contactP: 'Міндет пен қажетті нәтиже туралы айтып беріңіз. Қолайлы формат пен әзірлеу көлемін анықтауға көмектесеміз.',
  },
  en: {
    title: 'Website Development in Almaty: from 250,000 ₸ | AB/digital',
    desc: 'Website development in Almaty and Kazakhstan: landing pages from 250,000 ₸, corporate sites from 500,000 ₸. Design, mobile layout, basic SEO and launch on your domain.',
    ogTitle: 'Custom Website Development in Almaty and Kazakhstan',
    lead: 'A website that explains what you do and brings in enquiries. We build landing pages and corporate sites, and develop web services for more complex tasks.',
    facts: [['from 250,000 ₸', 'landing page'], ['2–4 weeks', 'landing page timeline'], ['RU + KK', 'languages on request']],
    anchor: 'Which website you need ↓', crumb: 'Website development',
    kindsH: 'Which website you need',
    kinds: [['Landing page', 'from 250,000 ₸', '2–4 weeks', 'One page for a specific offer or ad campaign: the offer, work examples and an enquiry form.', 'When you need to test demand or launch ads.'], ['Corporate website', 'from 500,000 ₸', '4–8 weeks with ready materials, 2–3 months from scratch', 'Several pages: services, about the company, projects and contacts.', 'When you have several services and need search traffic.'], ['Tilda website', 'on estimate', 'timeline depends on scope', 'Fast launch and content editing without a developer. We discuss the platform limits in advance.', 'When speed matters and you edit texts yourself.'], ['Web service', 'on estimate', 'from 3 months', 'User accounts, custom business logic and integrations beyond what a site builder can do.', 'When a brochure site is not enough.']],
    note: 'Prices start "from" and depend on the number of pages, design, content and integrations. Domain, hosting and support are discussed separately.',
    inclH: 'What the price includes', inclCols: [['Included', ['Structure and design.', 'Mobile layout.', 'Enquiry forms.', 'Basic SEO setup: page URLs, titles, descriptions, sitemap.', 'Launch on your domain and instructions.']], ['Paid separately', ['Domain and hosting.', 'Paid services such as CRM and mailing tools.', 'Support after launch.', 'Advertising and promotion.']], ['What a website will not do', ['It will not rank in search immediately: search engines decide positions, and it takes time.', 'It will not replace advertising.', 'It will not sell if the offer is unclear. We formulate the offer first.']]],
    exH: 'Examples and experience', exP: 'The home page shows our Telegram products and experience with corporate platforms. The AB/digital site itself shows our approach to responsive interfaces.', exLink: 'See on the home page',
    faqList: [
      ['How much does a website cost?', 'A landing page starts from 250,000 ₸ and a corporate website from 500,000 ₸. The final price depends on the number of pages, design, content, features and integrations. We prepare an estimate after a short description of your project.'],
      ['Why do website prices differ so much?', 'Price depends on the website type, custom design or a ready template, the number of pages, copywriting, forms, integrations and the complexity of the logic. Compare offers from several studios only for the same scope of work.'],
      ['How long does it take to build a website?', 'A landing page takes 2–4 weeks. A corporate website takes 4–8 weeks if materials are ready and 2–3 months if design and content are made from scratch. A web service with accounts takes from 3 months. It goes faster when structure, texts, photos and access are ready, and slower when approvals drag on.'],
      ['How is a landing page different from a corporate website?', 'A landing page is one page for a specific offer or ad. A corporate website has several pages: services, about the company, projects and contacts. It suits search better when you have several lines of business.'],
      ['What does basic SEO setup include?', 'Clear page URLs, titles and descriptions, the main site address, a sitemap and access for search robots. Indexing and positions are decided by search engines.'],
      ['Can I order a website without ready texts and design?', 'Yes. We start with the structure, visitor tasks and materials about your company. Content and design are included in the agreed scope of work.'],
      ['A builder like Tilda or custom development?', 'A builder suits a quick launch and a simple site you edit yourself. Custom development is needed for integrations, accounts and full control over speed and SEO. We suggest an option after reviewing the task.'],
      ['Can the website be in Russian and Kazakh?', 'Yes, but plan the languages from the start: page URLs, a switcher and language version markup. Texts in two languages increase the scope, so we include them in the estimate.'],
      ['Can you connect a CRM, analytics and notifications?', 'Yes, if the service provides a way to connect. Enquiries can go to staff on Telegram, to a CRM or by email, and analytics can use visit and event counters.'],
      ['How much does support after launch cost?', 'It depends on the scope: content edits, updates, monitoring, new pages. We discuss it separately and fix it in advance so costs after launch are not a surprise.'],
    ],
    contactH: 'Let us discuss your project', contactP: 'Tell us about the task and the result you need. We will help you choose the right format and scope.',
  },
};

/* ------------------------------------------------------------------ Mini Apps */
const mini = {
  ru: {
    title: 'Разработка Telegram Mini App в Казахстане от 500 000 ₸ | AB/digital',
    desc: 'Разработка Telegram Mini App от 500 000 ₸: каталог, запись на услуги, личный кабинет. Интерфейс внутри Telegram, серверная часть, интеграции и запуск.',
    ogTitle: 'Разработка Telegram Mini Apps для бизнеса',
    lead: 'Mini App — веб-приложение, которое открывается прямо в Telegram. Подходит, когда клиенту нужны каталог, календарь записи или личный кабинет, а не только кнопки в чате.',
    facts: [['от 500 000 ₸', 'первая версия'], ['4–8 недель', 'срок первой версии'], ['Код и доступы', 'передаём вам']],
    anchor: 'Что можно сделать ↓', crumb: 'Разработка Telegram Mini Apps',
    tasksH: 'Что можно сделать',
    tasks: [['Запись на услуги', 'Клиент выбирает услугу, специалиста и свободное время. Бот дополняет приложение подтверждениями и напоминаниями.', 'Салоны, мастера, консультации.'], ['Каталоги и заказы', 'Карточки товаров или услуг, выбор вариантов и оформление заявки. Состав заказа уходит в вашу систему обработки.', 'Небольшие магазины и услуги с выбором.'], ['Личный кабинет', 'Профиль, история действий, статусы и доступные услуги. Правила доступа определяем под задачу.', 'Клиентские сервисы и закрытые разделы.'], ['Серверная часть и интеграции', 'Проверка авторизации Telegram, хранение данных и подключение внешних систем входят в проектирование решения.', 'Когда приложение должно работать с вашими сервисами.']],
    exH: 'Наш проект: Salon Booking', exP: 'Выбор услуги, мастера и времени, подтверждение записи, отмена и напоминания. Сценарий и четыре экрана показаны на странице разработки ботов.', exLink: 'Посмотреть пример со скриншотами',
    inclH: 'Что входит в цену', inclCols: [['Входит', ['Сценарии и экраны приложения.', 'Серверная часть и бот.', 'Проверка основных сценариев.', 'Размещение и инструкция по запуску.', 'Исходный код и доступы.']], ['Оплачивается отдельно', ['Сервер и база данных.', 'Платные внешние сервисы и API.', 'Комиссия платёжного провайдера.', 'Поддержка и новые функции после запуска.']], ['Чего Mini App не сделает', ['Не приведёт клиентов: трафик дают сайт, реклама и каналы.', 'Не заменит бота: уведомления идут через него.', 'Не нужен, если хватает кнопок в чате.']]],
    faqList: [
      ['Чем Mini App отличается от Telegram-бота?', 'Бот общается сообщениями и кнопками. Mini App даёт веб-интерфейс внутри Telegram: формы, списки, календарь и навигацию. Часто они работают вместе.'],
      ['Сколько стоит разработка Mini App?', 'Разработка Mini App — от 500 000 ₸. Итог зависит от экранов, пользовательских ролей, серверной логики и интеграций. Сначала согласуем сценарии и границы первой версии, затем стоимость и этапы.'],
      ['Сколько времени занимает разработка Mini App?', 'Ориентир для первой версии — 4–8 недель. Срок растёт с числом экранов, ролей и интеграций. Точный срок фиксируем после согласования объёма.'],
      ['Нужно ли устанавливать отдельное приложение?', 'Mini App открывается из Telegram. Пользователю не нужно устанавливать отдельное приложение из магазина.'],
      ['Когда хватит бота, а когда нужен Mini App?', 'Бота достаточно для заявки, уведомлений или выдачи материалов. Mini App нужен, когда пользователю требуется календарь, каталог, несколько связанных экранов или личный кабинет.'],
      ['Можно начать с бота и добавить Mini App позже?', 'Да. Часто так и делают: запускают бота с основным сценарием, смотрят, как им пользуются, и добавляют приложение, когда становится нужен интерфейс с несколькими экранами.'],
      ['Можно подключить оплату и внешние системы?', 'Да, если выбранный сервис предоставляет способ подключения. Оплату, CRM и учётные системы проверяем до начала работ. Комиссии и услуги внешних сервисов в стоимость разработки не входят.'],
      ['Что подготовить для оценки?', 'Расскажите, кто пользуется приложением, какие действия нужны и что должно получиться. Приложите примеры экранов или процессов, укажите системы для подключения, желаемый срок и бюджет.'],
    ],
    contactH: 'Обсудим ваш проект', contactP: 'Расскажите, кто будет пользоваться приложением и что оно должно делать. По описанию определим первую версию и назовём стоимость.',
  },
  kk: {
    title: 'Қазақстанда Telegram Mini App әзірлеу 500 000 ₸-ден | AB/digital',
    desc: 'Telegram Mini App әзірлеу 500 000 ₸-ден: каталог, қызметке жазылу, жеке кабинет. Telegram ішіндегі интерфейс, сервер бөлігі, интеграциялар және іске қосу.',
    ogTitle: 'Бизнеске арналған Telegram Mini App әзірлеу',
    lead: 'Mini App — тікелей Telegram ішінде ашылатын веб-қосымша. Клиентке чаттағы түймелер ғана емес, каталог, жазылу күнтізбесі немесе жеке кабинет керек болғанда жарайды.',
    facts: [['500 000 ₸-ден', 'бірінші нұсқа'], ['4–8 апта', 'бірінші нұсқаның мерзімі'], ['Код және қолжетімділік', 'сізге береміз']],
    anchor: 'Не істей аламыз ↓', crumb: 'Telegram Mini App әзірлеу',
    tasksH: 'Не істей аламыз',
    tasks: [['Қызметке жазылу', 'Клиент қызметті, маманды және бос уақытты таңдайды. Бот қосымшаны растаулар мен еске салулармен толықтырады.', 'Салондар, мамандар, консультациялар.'], ['Каталогтар мен тапсырыстар', 'Тауарлар немесе қызметтер карточкалары, нұсқаны таңдау және өтінімді рәсімдеу. Тапсырыс құрамы сіздің өңдеу жүйеңізге беріледі.', 'Таңдауы бар шағын дүкендер мен қызметтер.'], ['Жеке кабинет', 'Профиль, әрекеттер тарихы, мәртебелер және қолжетімді қызметтер. Қолжетімділік ережелерін міндетке сай анықтаймыз.', 'Клиенттік сервистер мен жабық бөлімдер.'], ['Сервер бөлігі және интеграциялар', 'Telegram авторизациясын тексеру, деректерді сақтау және сыртқы жүйелерді қосу шешімді жобалауға кіреді.', 'Қосымша сіздің сервистеріңізбен жұмыс істеуі керек болғанда.']],
    exH: 'Біздің жоба: Salon Booking', exP: 'Қызметті, маманды және уақытты таңдау, жазылуды растау, бас тарту және еске салулар. Сценарий мен төрт экран боттарды әзірлеу бетінде көрсетілген.', exLink: 'Скриншоттармен мысалды қарау',
    inclH: 'Бағаға не кіреді', inclCols: [['Кіреді', ['Қосымша сценарийлері мен экрандары.', 'Сервер бөлігі және бот.', 'Негізгі сценарийлерді тексеру.', 'Орналастыру және іске қосу нұсқаулығы.', 'Бастапқы код және қолжетімділіктер.']], ['Бөлек төленеді', ['Сервер және деректер қоры.', 'Ақылы сыртқы сервистер мен API.', 'Төлем провайдерінің комиссиясы.', 'Іске қосқаннан кейінгі қолдау және жаңа функциялар.']], ['Mini App не істемейді', ['Клиент әкелмейді: трафикті сайт, жарнама және арналар береді.', 'Боттың орнын баспайды: хабарландырулар бот арқылы жүреді.', 'Чаттағы түймелер жеткілікті болса, қажет емес.']]],
    faqList: [
      ['Mini App Telegram-боттан немен ерекшеленеді?', 'Бот хабарламалар мен түймелер арқылы сөйлеседі. Mini App Telegram ішінде веб-интерфейс береді: формалар, тізімдер, күнтізбе және навигация. Көбінесе олар бірге жұмыс істейді.'],
      ['Mini App әзірлеу қанша тұрады?', 'Mini App әзірлеу — 500 000 ₸-ден. Түпкілікті баға экрандарға, пайдаланушы рөлдеріне, сервер логикасына және интеграцияға байланысты. Алдымен сценарийлер мен бірінші нұсқаның шекарасын келісеміз, содан кейін бағаны және кезеңдерді.'],
      ['Mini App әзірлеу қанша уақыт алады?', 'Бірінші нұсқа үшін бағдар — 4–8 апта. Мерзім экрандар, рөлдер және интеграциялар санымен өседі. Нақты мерзімді көлемді келіскеннен кейін бекітеміз.'],
      ['Бөлек қосымшаны орнату керек пе?', 'Mini App Telegram-нан ашылады. Пайдаланушыға дүкеннен бөлек қосымшаны орнату қажет емес.'],
      ['Қашан бот жеткілікті, қашан Mini App керек?', 'Өтінім, хабарландыру немесе материал беру үшін бот жеткілікті. Пайдаланушыға күнтізбе, каталог, өзара байланысқан бірнеше экран немесе жеке кабинет керек болғанда Mini App қажет.'],
      ['Боттан бастап, Mini App-ты кейін қосуға бола ма?', 'Иә. Көбіне солай істейді: негізгі сценарийі бар ботты іске қосады, оны қалай қолданатынын қарайды, бірнеше экранды интерфейс керек болғанда қосымшаны қосады.'],
      ['Төлем мен сыртқы жүйелерді қосуға бола ма?', 'Иә, егер таңдалған сервис қосылу тәсілін берсе. Төлемді, CRM мен есеп жүйелерін жұмыс басталғанға дейін тексереміз. Сыртқы жүйелердің комиссиялары мен қызметтері әзірлеу құнына кірмейді.'],
      ['Бағалау үшін не дайындау керек?', 'Қосымшаны кім қолданатынын, қандай әрекеттер керек екенін және нәтиже қандай болуы тиіс екенін айтып беріңіз. Экрандар немесе процестер мысалдарын қосыңыз, қосылатын жүйелерді, қалаған мерзім мен бюджетті көрсетіңіз.'],
    ],
    contactH: 'Жобаңызды талқылайық', contactP: 'Қосымшаны кім қолданатынын және ол не істеуі керек екенін жазыңыз. Сипаттама бойынша бірінші нұсқаны анықтап, бағаны атаймыз.',
  },
  en: {
    title: 'Telegram Mini App Development in Kazakhstan from 500,000 ₸ | AB/digital',
    desc: 'Telegram Mini App development from 500,000 ₸: catalogue, booking, user account. An interface inside Telegram, back end, integrations and launch.',
    ogTitle: 'Telegram Mini App Development for Business',
    lead: 'A Mini App is a web application that opens right inside Telegram. It fits when customers need a catalogue, a booking calendar or an account, not just buttons in a chat.',
    facts: [['from 500,000 ₸', 'first version'], ['4–8 weeks', 'first version timeline'], ['Code and access', 'handed over to you']],
    anchor: 'What we can build ↓', crumb: 'Telegram Mini App development',
    tasksH: 'What we can build',
    tasks: [['Service booking', 'The customer picks a service, a specialist and a free time slot. The bot adds confirmations and reminders.', 'Salons, specialists, consultations.'], ['Catalogues and orders', 'Product or service cards, option selection and order submission. The order is passed to your processing system.', 'Small shops and services with options.'], ['User account', 'Profile, activity history, statuses and available services. We define access rules for the task.', 'Customer services and private sections.'], ['Back end and integrations', 'Telegram authorization checks, data storage and connections to external systems are part of the solution design.', 'When the app has to work with your services.']],
    exH: 'Our project: Salon Booking', exP: 'Choosing a service, a specialist and a time, confirming the booking, cancelling and reminders. The scenario and four screens are shown on the bot development page.', exLink: 'See the example with screenshots',
    inclH: 'What the price includes', inclCols: [['Included', ['App scenarios and screens.', 'Back end and bot.', 'Testing of the main scenarios.', 'Hosting and launch instructions.', 'Source code and access.']], ['Paid separately', ['Server and database.', 'Paid external services and APIs.', 'Payment provider fees.', 'Support and new features after launch.']], ['What a Mini App will not do', ['It will not bring customers: traffic comes from a website, ads and channels.', 'It will not replace the bot: notifications go through it.', 'It is not needed if buttons in a chat are enough.']]],
    faqList: [
      ['How is a Mini App different from a Telegram bot?', 'A bot communicates with messages and buttons. A Mini App provides a web interface inside Telegram: forms, lists, a calendar and navigation. They often work together.'],
      ['How much does Mini App development cost?', 'Mini App development starts from 500,000 ₸. The final price depends on screens, user roles, back-end logic and integrations. First we agree on scenarios and the limits of the first version, then the price and stages.'],
      ['How long does Mini App development take?', 'For the first version, expect 4–8 weeks. The timeline grows with the number of screens, roles and integrations. We fix the exact timeline after agreeing on the scope.'],
      ['Do users need to install a separate app?', 'A Mini App opens from Telegram. Users do not need to install a separate app from a store.'],
      ['When is a bot enough and when do you need a Mini App?', 'A bot is enough for an enquiry, notifications or delivering materials. You need a Mini App when users need a calendar, a catalogue, several connected screens or an account.'],
      ['Can we start with a bot and add a Mini App later?', 'Yes. That is a common path: launch a bot with the main scenario, see how people use it, and add the app when an interface with several screens becomes necessary.'],
      ['Can you connect payments and external systems?', 'Yes, if the chosen service provides a way to connect. We check payments, CRM and accounting systems before work starts. Fees and services of external systems are not included in the development price.'],
      ['What should I prepare for an estimate?', 'Tell us who will use the app, which actions are needed and what the result should be. Attach examples of screens or processes, name the systems to connect, and give the desired deadline and budget.'],
    ],
    contactH: 'Let us discuss your project', contactP: 'Tell us who will use the app and what it should do. From your description we will define the first version and give a price.',
  },
};

/* ------------------------------------------------------------------ bots */
const bots = {
  ru: {
    title: 'Разработка Telegram-бота на заказ в Казахстане от 70 000 ₸ | AB/digital',
    desc: 'Разработка Telegram-ботов на заказ от 70 000 ₸: заявки, запись клиентов, напоминания, Mini Apps и интеграции. Примеры наших ботов, состав работ, оценка и запуск.',
    ogTitle: 'Разработка Telegram-ботов на заказ | AB/digital',
    h1: 'Разработка<br>Telegram-ботов<br><span>на заказ</span>', h1Plain: 'Разработка Telegram-ботов на заказ',
    lead: 'Заявки теряются в личных сообщениях, клиенты ждут ответа, напоминания приходится писать вручную. Мы делаем ботов, которые принимают заявки, записывают на время и напоминают о визите.',
    facts: [['от 70 000 ₸', 'первая версия бота'], ['1–2 недели', 'простой бот'], ['Код и доступы', 'передаём вам']],
    exLink: 'Что мы уже сделали ↓', crumb: 'Разработка Telegram-ботов',
    showcase: ['НАШИ ПРОЕКТЫ', 'БОТ + MINI APP'], showcaseP: 'Запись на услуги. Домашние дела.', showcaseS: 'Два собственных проекта студии, экраны ниже.',
    showcaseAlt: ['Salon Booking — запись на услуги в Telegram', 'Reminder Bot — задачи и напоминания'],
    anchors: ['Как выглядит', 'Задачи', 'Проекты', 'Цена и сроки', 'Что входит', 'Как работаем', 'Вопросы'],
    chatLabel: 'Пример диалога клиента с ботом записи: клиент выбирает время, бот подтверждает запись и сообщает о напоминаниях',
    chat: [['bot', 'Здравствуйте! Чем помочь?', ['Записаться', 'Цены', 'Связаться']], ['user', 'Записаться на завтра'], ['bot', 'Свободно: 11:00, 14:30, 17:00', ['11:00', '14:30', '17:00']], ['user', '14:30'], ['bot', 'Записали вас на завтра в 14:30. Напомним за 24 часа и за 2 часа.']],
    notify: 'Мастеру ушло уведомление: новая запись, завтра 14:30',
    demoH: 'Как бот выглядит для клиента', demoP: 'Клиент нажимает кнопки вместо переписки в личных сообщениях. Запись попадает в расписание, сотрудник получает уведомление сам.',
    demoList: ['Выбор услуги и времени в два-три нажатия.', 'Напоминание клиенту за 24 часа и за 2 часа до визита.', 'Уведомление сотруднику о новой записи или заявке.'], demoSmall: 'Схема диалога для примера. Реальные экраны наших ботов ниже.',
    tasksH: 'Какие задачи решает бот',
    tasks: [['Приём заявок', 'Клиент выбирает услугу, отвечает на несколько вопросов и оставляет контакт. Заявка сразу приходит сотруднику.', 'Консультации, расчёты, обращения в поддержку.'], ['Запись на время', 'Услуга, мастер, свободный слот, подтверждение и отмена. Напоминание клиенту уходит автоматически.', 'Салоны, мастера, встречи.'], ['Напоминания и задачи', 'Разовые и повторяющиеся дела, часовые пояса, отметка о выполнении. Личные и общие задачи в одном месте.', 'Дом, семья, небольшая команда.'], ['Доступы и обучение', 'Материалы выдаются по шагам, оплата проверяется, доступ открывается после неё. Администратор видит, кто прошёл.', 'Курсы и закрытые материалы.']],
    exH: 'Боты, которые мы уже сделали', exP: 'Два собственных проекта студии. На экранах демонстрационные данные, исходный код открыт.',
    codeLink: 'Код на GitHub ↗', screenLabel: 'открыть экран в полном размере',
    salon: { tag: 'ЗАПИСЬ НА УСЛУГИ · СОБСТВЕННЫЙ ПРОЕКТ', h3: 'Salon Booking', lead: 'От выбора услуги до подтверждения записи внутри Telegram.', body: 'Mini App ведёт клиента по шагам: <strong>услуга → мастер → день и свободное время → данные для записи</strong>. После отправки бот сообщает о записи, администратор подтверждает или отклоняет её.', list: ['Свободные слоты запрашиваются с сервера.', 'Клиент видит свои будущие записи и может отменить их.', 'Напоминания за 24 и 2 часа до визита.', 'Администратор получает расписание на сегодня и завтра.'], caps: ['Выбор услуги', 'Выбор мастера', 'Свободное время', 'Проверка записи'], alts: ['Salon Booking: каталог услуг и выбор услуги', 'Salon Booking: выбор специалиста для записи', 'Salon Booking: календарь и свободные интервалы', 'Salon Booking: итоговые данные перед подтверждением'], foot: '<strong>Что сделано:</strong> интерфейс Mini App, API, логика записи, база и бот. Java 17, Spring Boot, PostgreSQL.', small: 'Сейчас запись идёт по часовым слотам. Перенос записи делается через отмену и новую запись. Это собственный проект студии, а не внедрение для действующего салона.' },
    reminder: { tag: 'ЗАДАЧИ И НАПОМИНАНИЯ · СОБСТВЕННЫЙ ПРОЕКТ', h3: 'Reminder Bot · «Мой дом»', lead: 'Личные и общие дела с расписанием и напоминаниями.', body: 'Пользователь создаёт задачу, задаёт дату или повторение, получает напоминание в Telegram и отмечает выполнение. Mini App показывает ближайшие дела, календарь и прогресс.', list: ['Разовые и повторяющиеся задачи, часовые пояса.', 'Общие дела и управление участниками команды.', 'Календарь, статистика выполнения и серии дней.', 'Светлая, тёмная и автоматическая темы.'], caps: ['Задачи на сегодня', 'Тёмная тема', 'Календарь', 'Прогресс'], alts: ['Мой дом: список дел на день в светлой теме', 'Мой дом: домашние задачи в тёмной теме', 'Мой дом: календарь запланированных дел', 'Мой дом: профиль и статистика выполнения задач'], foot: '<strong>Что сделано:</strong> бот, Mini App, API, планировщик и хранение данных. Java 21, PostgreSQL, Liquibase.', small: 'Собственный проект студии. Скриншоты показывают интерфейс с примерными задачами и статистикой.' },
    costH: 'Сколько стоит и когда будет готово', costP: 'Цена зависит от того, что бот должен уметь. Три типовых уровня.',
    tiers: [['ЗАЯВКИ И УВЕДОМЛЕНИЯ', 'Простой бот', 'от 70 000 ₸', '1–2 недели', 'Меню, форма заявки, проверка данных, сохранение и уведомление сотруднику.'], ['ЗАПИСЬ, ЗАДАЧИ, РОЛИ', 'Бот с расписанием', 'по оценке', '3–5 недель', 'Свободное время, повторения, статусы, отмена и права для разных пользователей.'], ['MINI APP', 'Бот и приложение', 'от 500 000 ₸', '4–8 недель и больше', 'Экраны приложения, серверная часть, интеграции и администрирование.']],
    costBottom: [['Что влияет на цену и срок', 'Число сценариев и экранов, интеграции с CRM и оплатой, правила расписания, роли пользователей и готовность ваших материалов. Интеграции чаще всего оказываются самой непредсказуемой частью.'], ['Что после запуска', 'Сервер и база данных, платные внешние сервисы, комиссии платёжного провайдера. Поддержку и новые функции согласуем отдельно.']],
    inclH: 'Что входит в цену', inclCols: [['Входит', ['Сценарии диалога и тексты сообщений.', 'Разработка бота и серверной части.', 'Проверка основного сценария и ошибок ввода.', 'Размещение и инструкция по запуску.', 'Исходный код и доступы.']], ['Оплачивается отдельно', ['Сервер и база данных.', 'Платные внешние сервисы и API.', 'Комиссия платёжного провайдера.', 'Поддержка и новые функции после запуска.']], ['Чего бот не сделает', ['Не приведёт клиентов: трафик дают сайт, реклама и каналы.', 'Не заменит человека в нестандартных вопросах.', 'Не наладит процесс, которого нет. Сначала описываем процесс.']]],
    procH: 'Как мы работаем', proc: [['Разбираем задачу', 'Кто пользуется ботом, какое действие автоматизируем и что нужно получить. Достаточно описания процесса, готовое ТЗ не нужно.'], ['Согласуем объём', 'Фиксируем функции, интеграции, срок и стоимость до начала работы.'], ['Делаем и показываем', 'Промежуточный результат показываем заранее, чтобы проверить логику вместе с вами.'], ['Запускаем', 'Проверяем сценарии и ошибки ввода, размещаем бота, передаём код, доступы и инструкцию.']],
    faqList: [
      ['Что написать, чтобы получить оценку?', 'Кто будет пользоваться ботом, какое действие нужно автоматизировать и что должно получиться в конце. Добавьте примеры сообщений, таблиц или текущего процесса, а если есть CRM или сайт, укажите их. Бюджет и желаемая дата помогут определить первую версию.'],
      ['Сколько стоит разработка бота?', 'Бот — от 70 000 ₸, Mini App — от 500 000 ₸. Итог зависит от функций: диалог, расписание, права, интеграции и запуск. Для формы заявки нужно описать поля и получателя, для записи ещё расписание, занятые слоты и отмену.'],
      ['Сколько времени занимает разработка бота?', 'Бот для заявок и уведомлений — 1–2 недели. Запись, задачи, роли и расписание — 3–5 недель. Mini App с интеграциями — 4–8 недель и больше. Срок фиксируем после согласования объёма.'],
      ['Обязательно делать Mini App?', 'Нет. Для заявки, уведомлений или выдачи материалов хватает сообщений и кнопок. Mini App нужен, когда пользователю требуется календарь, каталог, несколько экранов или личный кабинет.'],
      ['Можно начать с простого бота и добавить функции позже?', 'Да, так и советуем. Запускаем основной сценарий, смотрим на реальные обращения, затем добавляем CRM, оплату или Mini App. Вы платите только за то, что нужно.'],
      ['Можно подключить CRM и оплату?', 'Да, если выбранные сервисы дают способ подключения. До начала работы проверяем доступность API, ограничения аккаунта и платёжного провайдера. Комиссии и услуги внешних систем в стоимость разработки не входят.'],
      ['Бот работает на русском и казахском?', 'Да, тексты можно подготовить на двух языках. Нужные языки и способ переключения согласуем до разработки, потому что они влияют на объём работы.'],
      ['Что нужно оплачивать каждый месяц?', 'Зависит от размещения: обычно сервер, база данных и платные сервисы, которые использует бот. Список расходов определяем заранее. Поддержка и развитие — отдельный согласованный объём.'],
      ['Кому останутся код и доступы?', 'Исходный код, инструкции и доступы мы передаём вам. Бота и размещение можно оформить на ваши аккаунты, чтобы вы сами контролировали сервис.'],
      ['Можно доработать уже существующего бота?', 'Да, после изучения исходного кода, размещения и интеграций. Сначала определяем, что можно сохранить и что менять, затем оцениваем доработку.'],
    ],
    contactH: 'Расскажите, что сейчас<br>делаете вручную', contactP: 'Напишите, кто будет пользоваться ботом и какие шаги нужно автоматизировать. По описанию мы определим первую версию и назовём стоимость.', contactLink: 'Оставить заявку на сайте',
  },
  kk: {
    title: 'Қазақстанда Telegram-бот әзірлеу 70 000 ₸-ден | AB/digital',
    desc: 'Тапсырыс бойынша Telegram-боттар 70 000 ₸-ден: өтінімдер, клиентті жазу, еске салулар, Mini Apps және интеграциялар. Боттарымыздың мысалдары, жұмыс құрамы, бағалау және іске қосу.',
    ogTitle: 'Тапсырыс бойынша Telegram-бот әзірлеу | AB/digital',
    h1: 'Тапсырыс бойынша<br>Telegram-бот<br><span>әзірлеу</span>', h1Plain: 'Тапсырыс бойынша Telegram-бот әзірлеу',
    lead: 'Өтінімдер жеке хабарламаларда жоғалады, клиенттер жауап күтеді, еске салуларды қолмен жазуға тура келеді. Біз өтінімдерді қабылдайтын, уақытқа жазатын және келу туралы еске салатын боттар жасаймыз.',
    facts: [['70 000 ₸-ден', 'боттың бірінші нұсқасы'], ['1–2 апта', 'қарапайым бот'], ['Код және қолжетімділік', 'сізге береміз']],
    exLink: 'Біз не жасадық ↓', crumb: 'Telegram-бот әзірлеу',
    showcase: ['БІЗДІҢ ЖОБАЛАР', 'БОТ + MINI APP'], showcaseP: 'Қызметке жазылу. Үй шаруасы.', showcaseS: 'Студияның екі өз жобасы, экрандар төменде.',
    showcaseAlt: ['Salon Booking — Telegram-да қызметке жазылу', 'Reminder Bot — міндеттер мен еске салулар'],
    anchors: ['Қалай көрінеді', 'Міндеттер', 'Жобалар', 'Баға және мерзім', 'Не кіреді', 'Қалай жұмыс істейміз', 'Сұрақтар'],
    chatLabel: 'Клиенттің жазылу ботымен диалогының мысалы: клиент уақытты таңдайды, бот жазылуды растап, еске салулар туралы хабарлайды',
    chat: [['bot', 'Сәлеметсіз бе! Немен көмектесе аламын?', ['Жазылу', 'Бағалар', 'Байланысу']], ['user', 'Ертеңге жазылу'], ['bot', 'Бос уақыт: 11:00, 14:30, 17:00', ['11:00', '14:30', '17:00']], ['user', '14:30'], ['bot', 'Сізді ертең 14:30-ға жаздық. 24 сағат және 2 сағат бұрын еске саламыз.']],
    notify: 'Шеберге хабарландыру жіберілді: жаңа жазылу, ертең 14:30',
    demoH: 'Бот клиентке қалай көрінеді', demoP: 'Клиент жеке хабарламаға жазудың орнына түймелерді басады. Жазылу кестеге түседі, қызметкер хабарландыруды өзі алады.',
    demoList: ['Қызмет пен уақытты екі-үш басумен таңдау.', 'Клиентке келуге дейін 24 және 2 сағат бұрын еске салу.', 'Әр жаңа жазылу немесе өтінім туралы қызметкерге хабарландыру.'], demoSmall: 'Мысал ретінде көрсетілген диалог схемасы. Боттарымыздың нақты экрандары төменде.',
    tasksH: 'Бот қандай міндеттерді шешеді',
    tasks: [['Өтінім қабылдау', 'Клиент қызметті таңдап, бірнеше сұраққа жауап беріп, байланыс қалдырады. Өтінім қызметкерге бірден келеді.', 'Консультациялар, есептеулер, қолдау сұраулары.'], ['Уақытқа жазылу', 'Қызмет, маман, бос слот, растау және бас тарту. Клиентке еске салу автоматты түрде барады.', 'Салондар, мамандар, кездесулер.'], ['Еске салулар және міндеттер', 'Бір реттік және қайталанатын істер, уақыт белдеулері, орындалды деген белгі. Жеке және ортақ істер бір жерде.', 'Үй, отбасы, шағын команда.'], ['Қолжетімділік және оқыту', 'Материалдар қадам-қадаммен беріледі, төлем тексеріледі, қолжетімділік содан кейін ашылады. Әкімші кім қандай кезеңнен өткенін көреді.', 'Курстар және жабық материалдар.']],
    exH: 'Біз жасаған боттар', exP: 'Студияның екі өз жобасы. Экрандарда демонстрациялық деректер көрсетілген, бастапқы коды ашық.',
    codeLink: 'GitHub-тағы код ↗', screenLabel: 'экранды толық өлшемде ашу',
    salon: { tag: 'ҚЫЗМЕТКЕ ЖАЗЫЛУ · ӨЗ ЖОБАМЫЗ', h3: 'Salon Booking', lead: 'Қызметті таңдаудан жазылуды растауға дейін Telegram ішінде.', body: 'Mini App клиентті қадамдар бойынша жүргізеді: <strong>қызмет → маман → күн және бос уақыт → жазылу деректері</strong>. Жібергеннен кейін бот жазылу туралы хабарлайды, әкімші оны растайды немесе қабылдамайды.', list: ['Бос слоттар серверден сұралады.', 'Клиент болашақ жазылуларын көріп, бас тарта алады.', 'Келуге дейін 24 және 2 сағат бұрын еске салулар.', 'Әкімші бүгінге және ертеңге кестені алады.'], caps: ['Қызметті таңдау', 'Маманды таңдау', 'Бос уақыт', 'Жазылуды тексеру'], alts: ['Salon Booking: қызметтер каталогы және қызметті таңдау', 'Salon Booking: жазылу үшін маманды таңдау', 'Salon Booking: күнтізбе және бос аралықтар', 'Salon Booking: растау алдындағы қорытынды деректер'], foot: '<strong>Не жасалды:</strong> Mini App интерфейсі, API, жазылу логикасы, деректер қоры және бот. Java 17, Spring Boot, PostgreSQL.', small: 'Қазір жазылу сағаттық слоттармен жүреді. Жазылуды ауыстыру бас тарту және жаңадан жазылу арқылы жасалады. Бұл — студияның өз жобасы, жұмыс істеп тұрған салонға енгізу емес.' },
    reminder: { tag: 'МІНДЕТТЕР ЖӘНЕ ЕСКЕ САЛУЛАР · ӨЗ ЖОБАМЫЗ', h3: 'Reminder Bot · «Менің үйім»', lead: 'Кестесі мен еске салулары бар жеке және ортақ істер.', body: 'Пайдаланушы міндет жасайды, күнін немесе қайталануын орнатады, Telegram-да еске салуды алады және орындалғанын белгілейді. Mini App жақын істерді, күнтізбені және прогрессті көрсетеді.', list: ['Бір реттік және қайталанатын міндеттер, уақыт белдеулері.', 'Ортақ істер және команда мүшелерін басқару.', 'Күнтізбе, орындалу статистикасы және күндер тізбегі.', 'Жарық, қараңғы және автоматты тақырыптар.'], caps: ['Бүгінгі міндеттер', 'Қараңғы тақырып', 'Күнтізбе', 'Прогресс'], alts: ['Менің үйім: жарық тақырыптағы күндік істер тізімі', 'Менің үйім: қараңғы тақырыптағы үй міндеттері', 'Менің үйім: жоспарланған істер күнтізбесі', 'Менің үйім: профиль және міндеттердің орындалу статистикасы'], foot: '<strong>Не жасалды:</strong> бот, Mini App, API, жоспарлағыш және деректерді сақтау. Java 21, PostgreSQL, Liquibase.', small: 'Студияның өз жобасы. Скриншоттарда үлгі міндеттер мен статистикасы бар интерфейс көрсетілген.' },
    costH: 'Қанша тұрады және қашан дайын болады', costP: 'Баға боттың не істеуі керектігіне байланысты. Үш типтік деңгей.',
    tiers: [['ӨТІНІМДЕР ЖӘНЕ ХАБАРЛАНДЫРУЛАР', 'Қарапайым бот', '70 000 ₸-ден', '1–2 апта', 'Мәзір, өтінім формасы, деректерді тексеру, сақтау және қызметкерге хабарландыру.'], ['ЖАЗЫЛУ, МІНДЕТТЕР, РӨЛДЕР', 'Кестесі бар бот', 'бағалау бойынша', '3–5 апта', 'Бос уақыт, қайталаулар, мәртебелер, бас тарту және әртүрлі пайдаланушыларға құқықтар.'], ['MINI APP', 'Бот және қосымша', '500 000 ₸-ден', '4–8 апта және одан көп', 'Қосымша экрандары, сервер бөлігі, интеграциялар және әкімшілік.']],
    costBottom: [['Баға мен мерзімге не әсер етеді', 'Сценарийлер мен экрандар саны, CRM және төлеммен интеграция, кесте ережелері, пайдаланушы рөлдері және сіздің материалдарыңыздың дайындығы. Интеграциялар көбіне ең болжап болмайтын бөлік болады.'], ['Іске қосқаннан кейін не бар', 'Сервер және деректер қоры, ақылы сыртқы сервистер, төлем провайдерінің комиссиялары. Қолдау мен жаңа функцияларды бөлек келісеміз.']],
    inclH: 'Бағаға не кіреді', inclCols: [['Кіреді', ['Диалог сценарийлері және хабарлама мәтіндері.', 'Бот пен сервер бөлігін әзірлеу.', 'Негізгі сценарийді және енгізу қателерін тексеру.', 'Орналастыру және іске қосу нұсқаулығы.', 'Бастапқы код және қолжетімділіктер.']], ['Бөлек төленеді', ['Сервер және деректер қоры.', 'Ақылы сыртқы сервистер мен API.', 'Төлем провайдерінің комиссиясы.', 'Іске қосқаннан кейінгі қолдау және жаңа функциялар.']], ['Бот не істемейді', ['Клиент әкелмейді: трафикті сайт, жарнама және арналар береді.', 'Стандартты емес сұрақтарда адамның орнын баспайды.', 'Жоқ процесті реттемейді. Алдымен процесті сипаттаймыз.']]],
    procH: 'Біз қалай жұмыс істейміз', proc: [['Міндетті талдаймыз', 'Ботты кім қолданады, қандай әрекетті автоматтандырамыз және не алу керек. Процестің сипаттамасы жеткілікті, дайын техникалық тапсырма қажет емес.'], ['Көлемді келісеміз', 'Жұмыс басталғанға дейін функцияларды, интеграцияларды, мерзімді және бағаны бекітеміз.'], ['Жасаймыз және көрсетеміз', 'Логиканы сізбен бірге тексеру үшін аралық нәтижені ертерек көрсетеміз.'], ['Іске қосамыз', 'Сценарийлер мен енгізу қателерін тексереміз, ботты орналастырамыз, код, қолжетімділіктер мен нұсқаулықты береміз.']],
    faqList: [
      ['Бағалау алу үшін не жазу керек?', 'Ботты кім қолданатынын, қандай әрекетті автоматтандыру керектігін және соңында не болуы тиіс екенін. Хабарламалар, кестелер немесе ағымдағы процесс мысалдарын қосыңыз, CRM немесе сайт болса, көрсетіңіз. Бюджет пен қалаған күн бірінші нұсқаны анықтауға көмектеседі.'],
      ['Бот әзірлеу қанша тұрады?', 'Бот — 70 000 ₸-ден, Mini App — 500 000 ₸-ден. Түпкілікті баға функцияларға байланысты: диалог, кесте, құқықтар, интеграциялар және іске қосу. Өтінім формасы үшін өрістер мен алушыны сипаттау керек, жазылу үшін кестені, бос емес слоттарды және бас тартуды да.'],
      ['Бот әзірлеу қанша уақыт алады?', 'Өтінімдер мен хабарландыруларға арналған бот — 1–2 апта. Жазылу, міндеттер, рөлдер және кесте — 3–5 апта. Интеграциялары бар Mini App — 4–8 апта және одан көп. Мерзімді көлемді келіскеннен кейін бекітеміз.'],
      ['Mini App міндетті түрде керек пе?', 'Жоқ. Өтінім, хабарландыру немесе материал беру үшін хабарламалар мен түймелер жеткілікті. Mini App пайдаланушыға күнтізбе, каталог, бірнеше экран немесе жеке кабинет керек болғанда қажет.'],
      ['Қарапайым ботпен бастап, функцияларды кейін қосуға бола ма?', 'Иә, біз солай кеңес береміз. Негізгі сценарийді іске қосамыз, нақты өтінімдерді қараймыз, содан кейін CRM, төлем немесе Mini App қосамыз. Сіз тек қажетті нәрсеге ғана төлейсіз.'],
      ['CRM мен төлемді қосуға бола ма?', 'Иә, егер таңдалған сервистер қосылу тәсілін берсе. Жұмыс басталғанға дейін API қолжетімділігін, аккаунт шектеулерін және төлем провайдерін тексереміз. Сыртқы жүйелердің комиссиялары мен қызметтері әзірлеу құнына кірмейді.'],
      ['Бот қазақ және орыс тілінде жұмыс істей ме?', 'Иә, мәтіндерді екі тілде дайындауға болады. Қажетті тілдер мен ауыстыру тәсілін әзірлеуге дейін келісеміз, өйткені олар жұмыс көлеміне әсер етеді.'],
      ['Ай сайын не төлеу керек?', 'Орналастыруға байланысты: әдетте сервер, деректер қоры және бот қолданатын ақылы сервистер. Шығындар тізімін алдын ала анықтаймыз. Қолдау мен дамыту — бөлек келісілген көлем.'],
      ['Код пен қолжетімділіктер кімде қалады?', 'Бастапқы код, нұсқаулықтар мен қолжетімділіктерді біз сізге береміз. Ботты және орналастыруды сіздің аккаунттарыңызға рәсімдеуге болады, сонда сервисті өзіңіз бақылайсыз.'],
      ['Бұрыннан бар ботты жетілдіруге бола ма?', 'Иә, бастапқы кодты, орналастыруды және интеграцияларды зерттегеннен кейін. Алдымен нені сақтауға және нені өзгертуге болатынын анықтаймыз, содан кейін жетілдіруді бағалаймыз.'],
    ],
    contactH: 'Қазір қолмен<br>не істейтініңізді айтыңыз', contactP: 'Ботты кім қолданатынын және қандай қадамдарды автоматтандыру керектігін жазыңыз. Сипаттама бойынша бірінші нұсқаны анықтап, бағаны атаймыз.', contactLink: 'Сайтта өтінім қалдыру',
  },
  en: {
    title: 'Telegram Bot Development in Kazakhstan from 70,000 ₸ | AB/digital',
    desc: 'Custom Telegram bots from 70,000 ₸: enquiries, client booking, reminders, Mini Apps and integrations. Examples of our bots, scope of work, estimate and launch.',
    ogTitle: 'Custom Telegram Bot Development | AB/digital',
    h1: 'Custom<br>Telegram bot<br><span>development</span>', h1Plain: 'Custom Telegram bot development',
    lead: 'Enquiries get lost in direct messages, customers wait for replies, reminders are written by hand. We build bots that accept enquiries, book appointments and remind people about visits.',
    facts: [['from 70,000 ₸', 'first bot version'], ['1–2 weeks', 'simple bot'], ['Code and access', 'handed over to you']],
    exLink: 'What we have already built ↓', crumb: 'Telegram bot development',
    showcase: ['OUR PROJECTS', 'BOT + MINI APP'], showcaseP: 'Booking. Household tasks.', showcaseS: 'Two of our own projects, screens below.',
    showcaseAlt: ['Salon Booking: booking services in Telegram', 'Reminder Bot: tasks and reminders'],
    anchors: ['How it looks', 'Tasks', 'Projects', 'Price and timeline', 'What is included', 'How we work', 'Questions'],
    chatLabel: 'Example dialogue between a customer and a booking bot: the customer picks a time, the bot confirms the booking and mentions reminders',
    chat: [['bot', 'Hello! How can I help?', ['Book', 'Prices', 'Contact']], ['user', 'Book for tomorrow'], ['bot', 'Free slots: 11:00, 14:30, 17:00', ['11:00', '14:30', '17:00']], ['user', '14:30'], ['bot', 'You are booked for tomorrow at 14:30. We will remind you 24 hours and 2 hours before.']],
    notify: 'The master received a notification: new booking, tomorrow 14:30',
    demoH: 'How the bot looks to a customer', demoP: 'Customers tap buttons instead of writing in direct messages. The booking goes into the schedule, and the staff member is notified automatically.',
    demoList: ['Choose a service and a time in two or three taps.', 'A reminder to the customer 24 hours and 2 hours before the visit.', 'A notification to staff about each new booking or enquiry.'], demoSmall: 'Illustrative dialogue. Real screens of our bots are below.',
    tasksH: 'What tasks a bot solves',
    tasks: [['Accepting enquiries', 'The customer picks a service, answers a few questions and leaves a contact. The enquiry reaches your staff immediately.', 'Consultations, quotes, support requests.'], ['Booking appointments', 'Service, specialist, free slot, confirmation and cancellation. The reminder goes to the customer automatically.', 'Salons, specialists, meetings.'], ['Reminders and tasks', 'One-off and recurring tasks, time zones, completion marks. Personal and shared tasks in one place.', 'Home, family, a small team.'], ['Access and learning', 'Materials are released step by step, payment is checked, and access opens after it. The administrator sees who has completed what.', 'Courses and private materials.']],
    exH: 'Bots we have already built', exP: 'Two of our own studio projects. The screens show demo data, and the source code is open.',
    codeLink: 'Code on GitHub ↗', screenLabel: 'open the screen at full size',
    salon: { tag: 'BOOKING · OUR OWN PROJECT', h3: 'Salon Booking', lead: 'From choosing a service to confirming the booking, all inside Telegram.', body: 'The Mini App leads the customer through the steps: <strong>service → specialist → day and free time → booking details</strong>. After submission the bot confirms the booking, and the administrator approves or declines it.', list: ['Free slots are requested from the server.', 'The customer sees upcoming bookings and can cancel them.', 'Reminders 24 and 2 hours before the visit.', 'The administrator gets the schedule for today and tomorrow.'], caps: ['Choosing a service', 'Choosing a specialist', 'Free time', 'Booking review'], alts: ['Salon Booking: service catalogue and service selection', 'Salon Booking: choosing a specialist for the booking', 'Salon Booking: calendar and free time slots', 'Salon Booking: summary before confirmation'], foot: '<strong>What we built:</strong> Mini App interface, API, booking logic, database and bot. Java 17, Spring Boot, PostgreSQL.', small: 'Bookings currently use hourly slots. Rescheduling is done by cancelling and booking again. This is our own project, not a deployment for a working salon.' },
    reminder: { tag: 'TASKS AND REMINDERS · OUR OWN PROJECT', h3: 'Reminder Bot · “My Home”', lead: 'Personal and shared tasks with a schedule and reminders.', body: 'A user creates a task, sets a date or repeat, receives a Telegram reminder and marks it done. The Mini App shows upcoming tasks, a calendar and progress.', list: ['One-off and recurring tasks, time zones.', 'Shared tasks and team member management.', 'Calendar, completion statistics and streaks.', 'Light, dark and automatic themes.'], caps: ['Tasks for today', 'Dark theme', 'Calendar', 'Progress'], alts: ['My Home: daily task list in the light theme', 'My Home: household tasks in the dark theme', 'My Home: calendar of planned tasks', 'My Home: profile and task completion statistics'], foot: '<strong>What we built:</strong> bot, Mini App, API, scheduler and data storage. Java 21, PostgreSQL, Liquibase.', small: 'Our own project. The screenshots show the interface with sample tasks and statistics.' },
    costH: 'How much it costs and when it is ready', costP: 'The price depends on what the bot has to do. Three typical levels.',
    tiers: [['ENQUIRIES AND NOTIFICATIONS', 'Simple bot', 'from 70,000 ₸', '1–2 weeks', 'A menu, an enquiry form, data checks, saving and a notification to staff.'], ['BOOKING, TASKS, ROLES', 'Bot with a schedule', 'on estimate', '3–5 weeks', 'Free time, repeats, statuses, cancellation and permissions for different users.'], ['MINI APP', 'Bot and app', 'from 500,000 ₸', '4–8 weeks and more', 'App screens, back end, integrations and administration.']],
    costBottom: [['What affects price and timeline', 'The number of scenarios and screens, CRM and payment integrations, schedule rules, user roles and how ready your materials are. Integrations are most often the least predictable part.'], ['What comes after launch', 'Server and database, paid external services, payment provider fees. We agree support and new features separately.']],
    inclH: 'What the price includes', inclCols: [['Included', ['Dialogue scenarios and message texts.', 'Development of the bot and the back end.', 'Testing of the main scenario and input errors.', 'Hosting and launch instructions.', 'Source code and access.']], ['Paid separately', ['Server and database.', 'Paid external services and APIs.', 'Payment provider fees.', 'Support and new features after launch.']], ['What a bot will not do', ['It will not bring customers: traffic comes from a website, ads and channels.', 'It will not replace a person in non-standard questions.', 'It will not fix a process that does not exist. We describe the process first.']]],
    procH: 'How we work', proc: [['We break down the task', 'Who uses the bot, which action we automate and what you need to get. A description of the process is enough, no formal specification needed.'], ['We agree the scope', 'We fix features, integrations, timeline and price before work starts.'], ['We build and show', 'We show intermediate results early so we can check the logic with you.'], ['We launch', 'We test scenarios and input errors, host the bot and hand over the code, access and instructions.']],
    faqList: [
      ['What should I write to get an estimate?', 'Who will use the bot, which action needs automating and what the end result should be. Add examples of messages, tables or the current process, and mention your CRM or website if you have one. A budget and a desired date help us define the first version.'],
      ['How much does a bot cost?', 'A bot starts from 70,000 ₸ and a Mini App from 500,000 ₸. The final price depends on features: dialogue, schedule, permissions, integrations and launch. For an enquiry form we need the fields and the recipient; for booking, also the schedule, taken slots and cancellation.'],
      ['How long does it take?', 'A bot for enquiries and notifications takes 1–2 weeks. Booking, tasks, roles and a schedule take 3–5 weeks. A Mini App with integrations takes 4–8 weeks or more. We fix the timeline after agreeing the scope.'],
      ['Do I have to build a Mini App?', 'No. For an enquiry, notifications or delivering materials, messages and buttons are enough. A Mini App makes sense when users need a calendar, a catalogue, several connected screens or an account.'],
      ['Can we start with a simple bot and add features later?', 'Yes, and we recommend it. We launch the main scenario, look at real enquiries, then add CRM, payments or a Mini App. You pay only for what you actually need.'],
      ['Can you connect CRM and payments?', 'Yes, if the chosen services provide a way to connect. Before work starts we check API availability, account limits and the payment provider. Fees and services of external systems are not included in the development price.'],
      ['Does the bot work in Russian and Kazakh?', 'Yes, texts can be prepared in both languages. We agree the languages and how users switch between them before development, because they affect the scope.'],
      ['What do I pay for every month?', 'It depends on hosting: usually a server, a database and the paid services the bot uses. We define the list of costs in advance. Support and further development are a separately agreed scope.'],
      ['Who keeps the code and access?', 'We hand over the source code, instructions and access to you. The bot and hosting can be registered under your accounts so you stay in control of the service.'],
      ['Can you improve an existing bot?', 'Yes, after studying the source code, hosting and integrations. First we decide what can be kept and what has to change, then we estimate the work.'],
    ],
    contactH: 'Tell us what you do<br>by hand now', contactP: 'Write who will use the bot and which steps need automating. From your description we will define the first version and give a price.', contactLink: 'Leave a request on the site',
  },
};

/* ------------------------------------------------------------------ shared pieces */
function pageHead(lang, slug, title, desc, ogTitle, css, ldExtra, faqList, serviceName, minPrice, offerNames) {
  const url = domain + servicePath(lang, slug);
  const alternates = LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${domain + servicePath(l, slug)}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${domain + servicePath('ru', slug)}">`;
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Service', '@id': url + '#service', name: serviceName, url, description: desc, serviceType: serviceName, inLanguage: lang, areaServed: { '@type': 'Country', name: 'Kazakhstan' }, offers: offerNames.map(([name, min]) => ({ '@type': 'Offer', name, priceSpecification: { '@type': 'PriceSpecification', minPrice: min, priceCurrency: 'KZT' } })), provider: { '@type': 'Organization', name: 'AB/digital', url: domain + '/' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: UI[lang].home, item: domain + lp[lang] }, { '@type': 'ListItem', position: 2, name: serviceName, item: url }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang, mainEntity: faqList.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  ].map(o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`).join('');
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0e1b26"><title>${esc(title)}</title><meta name="description" content="${attr(desc)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${url}">${alternates}<meta property="og:type" content="website"><meta property="og:site_name" content="AB/digital"><meta property="og:locale" content="${ogLocale[lang]}"><meta property="og:title" content="${attr(ogTitle)}"><meta property="og:description" content="${attr(desc)}"><meta property="og:url" content="${url}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">${css}${ld}<script src="/assets/analytics.js" defer></script><script src="/assets/preview-redirect.js"></script></head>`;
}

function topbar(lang, slug, contactLabel) {
  const sw = LANGS.map(l => `<a href="${servicePath(l, slug)}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="page"' : ''}>${switchLabel[l]}</a>`).join('');
  return `<header class="topbar"><a class="brand" href="${lp[lang]}">AB/digital</a><nav class="lang-switch" aria-label="${attr(UI[lang].switchTitle)}">${sw}</nav><a class="top-contact" href="${TG}" target="_blank" rel="noopener noreferrer">${esc(contactLabel)}</a></header>`;
}

function footer(lang) {
  const privacy = lang === 'ru' ? ` · <a href="/legal/privacy/">${UI.ru.privacy}</a>` : '';
  return `<footer class="footer"><a href="${lp[lang]}">AB/digital</a>${privacy}</footer>`;
}

const faqHtml = list => list.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n');
const threeCols = (cols, cls) => `<div class="${cls}">${cols.map(([h, items]) => `<div><h3>${esc(h)}</h3><ul${cls.includes('tg-') ? ' class="tg-list"' : ''}>${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}</div>`;
const relatedLinks = (lang, slugs) => slugs.map(s => `<a href="${servicePath(lang, s)}">${esc(UI[lang].names[s])}</a>`).join('');

/* ------------------------------------------------------------------ generic service page (sites, Mini Apps) */
function servicePage(lang, slug, c, kind) {
  const u = UI[lang];
  const css = '<link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/services.css?v=20261031-lang">' + kkFont(lang);
  const offers = kind === 'sites' ? [[c.kinds[0][0], 250000], [c.kinds[1][0], 500000]] : [[u.names[slug], 500000]];
  const h1 = u.names[slug];
  let middle;
  if (kind === 'sites') {
    middle = `<section id="kinds"><h2>${esc(c.kindsH)}</h2><div class="service-grid">${c.kinds.map(([n, p, t, d, f]) => `<article><h3>${esc(n)}</h3><p class="service-card-price">${esc(p)}</p><p class="service-card-term">${esc(t)}</p><p>${esc(d)}</p><p class="service-fit">${esc(f)}</p></article>`).join('')}</div><p class="service-note">${esc(c.note)}</p></section>
<section class="service-example" id="included"><h2>${esc(c.inclH)}</h2>${threeCols(c.inclCols, 'service-three')}</section>
<section class="service-example"><h2>${esc(c.exH)}</h2><p>${esc(c.exP)}</p><a href="${lp[lang]}#corporate-platforms">${esc(c.exLink)}</a></section>`;
  } else {
    middle = `<section id="tasks"><h2>${esc(c.tasksH)}</h2><div class="service-grid">${c.tasks.map(([n, d, f]) => `<article><h3>${esc(n)}</h3><p>${esc(d)}</p><p class="service-fit">${esc(f)}</p></article>`).join('')}</div></section>
<section class="service-example"><h2>${esc(c.exH)}</h2><p>${esc(c.exP)}</p><a href="${servicePath(lang, 'telegram-bots')}#salon-booking">${esc(c.exLink)}</a></section>
<section class="service-example" id="included"><h2>${esc(c.inclH)}</h2>${threeCols(c.inclCols, 'service-three')}</section>`;
  }
  const others = kind === 'sites' ? ['telegram-bots', 'telegram-mini-apps'] : ['telegram-bots', 'website-development'];
  const anchorId = kind === 'sites' ? '#kinds' : '#tasks';
  return pageHead(lang, slug, c.title, c.desc, c.ogTitle, css, null, c.faqList, h1, null, offers) +
    `<body>${topbar(lang, slug, u.topProject)}<main class="service-page wrap"><nav aria-label="${attr(u.home)}"><a href="${lp[lang]}">${esc(u.home)}</a> / ${esc(c.crumb)}</nav><section class="service-hero"><p class="service-kicker">${u.kicker}</p><h1>${esc(h1)}</h1><p class="service-lead">${esc(c.lead)}</p><ul class="service-facts">${c.facts.map(([a, b]) => `<li><strong>${esc(a)}</strong><span>${esc(b)}</span></li>`).join('')}</ul><div class="service-actions"><a class="btn btn-accent" href="${TG}" target="_blank" rel="noopener noreferrer">${esc(u.estimate)}</a><a href="${anchorId}">${esc(c.anchor)}</a></div></section>${middle}<section><h2>${esc(u.how)}</h2><ol class="service-process">${process4[lang].map(([a, b]) => `<li><strong>${esc(a)}</strong> ${esc(b)}</li>`).join('')}</ol></section><section><h2>${esc(u.faq)}</h2>${faqHtml(c.faqList)}</section><section><h2>${esc(u.others)}</h2><nav class="service-related">${relatedLinks(lang, others)}</nav></section><section class="service-contact"><h2>${esc(c.contactH)}</h2><p>${esc(c.contactP)}</p><a class="btn btn-accent" href="${TG}" target="_blank" rel="noopener noreferrer">${esc(u.write)}</a></section></main>${footer(lang)}</body></html>\n`;
}

/* ------------------------------------------------------------------ bots page */
function botsPage(lang, c) {
  const u = UI[lang];
  const slug = 'telegram-bots';
  const css = '<link rel="stylesheet" href="/assets/site.css"><link rel="stylesheet" href="/assets/telegram-bots.css?v=20261031-lang">' + kkFont(lang);
  const shots = (names, caps, alts, label) => `<div class="tg-screens">${names.map((n, i) => `<figure><a href="/assets/portfolio/${n}.webp" target="_blank" rel="noopener" aria-label="${attr(caps[i] + ': ' + label)}"><img src="/assets/portfolio/${n}.webp" alt="${attr(alts[i])}" width="500" height="1013" loading="lazy" decoding="async"></a><figcaption><span>0${i + 1}</span> ${esc(caps[i])}</figcaption></figure>`).join('')}</div>`;
  const project = (id, extraClass, p, href, names) => `<article class="tg-project${extraClass}" id="${id}" aria-labelledby="${id}-title"><div class="tg-project-heading"><div><p class="tg-project-tag">${esc(p.tag)}</p><h3 id="${id}-title">${esc(p.h3)}</h3><p class="tg-project-lead">${esc(p.lead)}</p></div><a class="tg-source" href="${href}" target="_blank" rel="noopener noreferrer">${esc(c.codeLink)}</a></div>
<div class="tg-project-body"><p>${p.body}</p><ul class="tg-list">${p.list.map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>
${shots(names, p.caps, p.alts, c.screenLabel)}
<div class="tg-project-footer"><p>${p.foot}</p><p class="tg-small">${esc(p.small)}</p></div></article>`;
  const chat = c.chat.map(([who, text, btns]) => `<div class="tg-msg tg-msg-${who}">${esc(text)}${btns ? `<div class="tg-btns">${btns.map(b => `<span>${esc(b)}</span>`).join('')}</div>` : ''}</div>`).join('\n');
  const body = `<body>
<a class="tg-skip" href="#main">${esc(u.skip)}</a>
${topbar(lang, slug, u.topBots)}
<main class="tg-page wrap" id="main">
<nav class="tg-crumbs" aria-label="${attr(u.home)}"><a href="${lp[lang]}">${esc(u.home)}</a><span aria-hidden="true"> / </span><span aria-current="page">${esc(c.crumb)}</span></nav>

<section class="tg-hero" aria-labelledby="tg-title">
<div class="tg-hero-copy"><p class="tg-eyebrow">${u.eyebrow}</p>
<h1 id="tg-title">${c.h1}</h1>
<p class="tg-lead">${esc(c.lead)}</p>
<ul class="tg-facts">${c.facts.map(([a, b]) => `<li><strong>${esc(a)}</strong><span>${esc(b)}</span></li>`).join('')}</ul>
<div class="tg-actions"><a class="btn btn-accent" href="${TG}" target="_blank" rel="noopener noreferrer">${esc(u.estimate)}</a><a class="tg-text-link" href="#examples">${esc(c.exLink)}</a></div></div>
<a class="tg-hero-showcase" href="#examples" aria-label="${attr(c.showcaseAlt.join(' / '))}">
<div class="tg-showcase-heading"><span>${esc(c.showcase[0])}</span><span>${esc(c.showcase[1])}</span></div>
<div class="tg-hero-phones"><img class="tg-phone-salon" src="/assets/portfolio/salon-services.webp" alt="${attr(c.showcaseAlt[0])}" width="500" height="1013" fetchpriority="high"><img class="tg-phone-reminder" src="/assets/portfolio/reminder-today.webp" alt="${attr(c.showcaseAlt[1])}" width="500" height="1013" decoding="async"></div>
<p>${esc(c.showcaseP)}<br><span>${esc(c.showcaseS)}</span></p></a>
</section>

<nav class="tg-anchors" aria-label="${attr(c.crumb)}"><a href="#demo">${esc(c.anchors[0])}</a><a href="#tasks">${esc(c.anchors[1])}</a><a href="#examples">${esc(c.anchors[2])}</a><a href="#cost">${esc(c.anchors[3])}</a><a href="#included">${esc(c.anchors[4])}</a><a href="#process">${esc(c.anchors[5])}</a><a href="#faq">${esc(c.anchors[6])}</a></nav>

<section class="tg-section tg-demo" id="demo" aria-labelledby="demo-title">
<div class="tg-chat" role="img" aria-label="${attr(c.chatLabel)}">
${chat}
<div class="tg-notify">${esc(c.notify)}</div>
</div>
<div class="tg-demo-text"><h2 id="demo-title">${esc(c.demoH)}</h2>
<p class="tg-section-intro">${esc(c.demoP)}</p>
<ul class="tg-list">${c.demoList.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
<p class="tg-small">${esc(c.demoSmall)}</p></div>
</section>

<section class="tg-section" id="tasks" aria-labelledby="tasks-title"><div class="tg-section-head"><h2 id="tasks-title">${esc(c.tasksH)}</h2></div>
<div class="tg-task-grid tg-task-grid-2">
${c.tasks.map(([n, d, f]) => `<article class="tg-task"><h3>${esc(n)}</h3><p>${esc(d)}</p><p class="tg-fit">${esc(f)}</p></article>`).join('\n')}
</div></section>

<section class="tg-section" id="examples" aria-labelledby="examples-title"><div class="tg-section-head"><h2 id="examples-title">${esc(c.exH)}</h2><p class="tg-section-intro">${esc(c.exP)}</p></div>

${project('salon-booking', '', c.salon, 'https://github.com/ArtemBalakin/salon-booking-bot/tree/feature/miniapp-showcase', ['salon-services', 'salon-master', 'salon-slots', 'salon-summary'])}

${project('reminder-bot', ' tg-project-home', c.reminder, 'https://github.com/ArtemBalakin/reminderBot', ['reminder-today', 'reminder-night', 'reminder-calendar', 'reminder-profile'])}
</section>

<section class="tg-section tg-cost" id="cost" aria-labelledby="cost-title"><div class="tg-section-head"><h2 id="cost-title">${esc(c.costH)}</h2><p class="tg-section-intro">${esc(c.costP)}</p></div>
<div class="tg-estimate-grid">
${c.tiers.map(([l, h, p, t, d]) => `<article><span>${esc(l)}</span><h3>${esc(h)}</h3><p class="tg-price">${esc(p)}</p><p class="tg-term">${esc(t)}</p><p>${esc(d)}</p></article>`).join('\n')}
</div>
<div class="tg-cost-bottom">${c.costBottom.map(([h, p]) => `<div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join('')}</div>
<a class="btn btn-accent" href="${TG}" target="_blank" rel="noopener noreferrer">${esc(u.estimate)}</a></section>

<section class="tg-section tg-scope" id="included" aria-labelledby="included-title"><div class="tg-section-head"><h2 id="included-title">${esc(c.inclH)}</h2></div>
${threeCols(c.inclCols, 'tg-scope-columns tg-three')}</section>

<section class="tg-section" id="process" aria-labelledby="process-title"><div class="tg-section-head"><h2 id="process-title">${esc(c.procH)}</h2></div>
<ol class="tg-process">${c.proc.map(([h, p], i) => `<li><span>0${i + 1}</span><div><h3>${esc(h)}</h3><p>${esc(p)}</p></div></li>`).join('')}</ol></section>

<section class="tg-section tg-faq" id="faq" aria-labelledby="faq-title"><div class="tg-section-head"><h2 id="faq-title">${esc(u.faq)}</h2></div>
${faqHtml(c.faqList)}
</section>

<section class="tg-section tg-contact" id="contact" aria-labelledby="contact-title"><h2 id="contact-title">${c.contactH}</h2><p>${esc(c.contactP)}</p><div class="tg-actions"><a class="btn btn-accent" href="${TG}" target="_blank" rel="noopener noreferrer">${esc(u.write)}</a><a class="tg-text-link" href="${lp[lang]}#contact">${esc(c.contactLink)}</a></div></section>
<nav class="tg-related" aria-label="${attr(u.others)}">${relatedLinks(lang, ['telegram-mini-apps', 'website-development'])}</nav>
</main>
${footer(lang)}
</body>
</html>
`;
  return pageHead(lang, slug, c.title, c.desc, c.ogTitle, css, null, c.faqList, c.h1Plain, null, [[c.h1Plain, 70000], [UI[lang].names['telegram-mini-apps'], 500000]]) + body;
}

for (const lang of LANGS) {
  const out = (slug, html) => {
    const file = path.join(root, 'site', lang === 'ru' ? '' : lang, 'services', slug, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    console.log('wrote', path.relative(root, file));
  };
  out('telegram-bots', botsPage(lang, bots[lang]));
  out('telegram-mini-apps', servicePage(lang, 'telegram-mini-apps', mini[lang], 'mini'));
  out('website-development', servicePage(lang, 'website-development', sites[lang], 'sites'));
}
