import type { AppLocale, AppStack } from "../../app-routing";

export type GetStartedConcept = {
  title: string;
  body: string;
};

export type GetStartedStep = {
  title: string;
  body: string;
  code?: string;
};

export type GetStartedPackage = {
  name: string;
  role: string;
};

export type GetStartedContent = {
  title: string;
  lead: string;
  conceptsHeading: string;
  concepts: GetStartedConcept[];
  featuresHeading: string;
  features: GetStartedConcept[];
  stepsHeading: string;
  steps: GetStartedStep[];
  packagesHeading: string;
  packages: GetStartedPackage[];
  tryHeading: string;
  tryBody: string;
  tryCta: string;
};

type StackCopy = {
  title: string;
  lead: string;
  stepsHeading: string;
  installTitle: string;
  installBody: string;
  registerTitle: string;
  registerBody: string;
  loadTitle: string;
  loadBody: string;
  renderTitle: string;
  renderBody: string;
  packagesHeading: string;
  packageRoles: [string, string, string, string, string];
  tryHeading: string;
  tryBody: string;
  tryCta: string;
};

const sharedConcepts: Record<AppLocale, { heading: string; concepts: GetStartedConcept[] }> = {
  de: {
    heading: "Drei Bausteine",
    concepts: [
      {
        title: "JSON Schema",
        body: "Felder, Typen und Pflichtangaben. Optionale Bausteine wie Upload, Karte oder berechnete Werte kommen dazu — wenn Sie sie brauchen.",
      },
      {
        title: "UI-Schema",
        body: "Layout, Stepper, Gruppen und Labels — getrennt vom Datenmodell und im Editor per Drag & Drop anpassbar.",
      },
      {
        title: "Formulardaten",
        body: "Das ausgefüllte JSON-Objekt, gebunden an Ihre Anwendung oder API.",
      },
    ],
  },
  en: {
    heading: "Three building blocks",
    concepts: [
      {
        title: "JSON Schema",
        body: "Fields, types, and required properties. Optional pieces like uploads, maps, or computed values are available when you need them.",
      },
      {
        title: "UI schema",
        body: "Layout, steppers, groups, and labels — separate from the data model, editable with drag & drop.",
      },
      {
        title: "Form data",
        body: "The filled JSON object, bound to your application or API.",
      },
    ],
  },
  fr: {
    heading: "Trois briques",
    concepts: [
      {
        title: "JSON Schema",
        body: "Champs, types et champs obligatoires. Des briques optionnelles comme l’upload, la carte ou les valeurs calculées s’ajoutent si besoin.",
      },
      {
        title: "Schéma UI",
        body: "Disposition, stepper, groupes et libellés — séparés du modèle de données, ajustables par glisser-déposer.",
      },
      {
        title: "Données du formulaire",
        body: "L’objet JSON rempli, lié à votre application ou API.",
      },
    ],
  },
  it: {
    heading: "Tre elementi",
    concepts: [
      {
        title: "JSON Schema",
        body: "Campi, tipi e obbligatori. Elementi opzionali come upload, mappa o valori calcolati si aggiungono quando servono.",
      },
      {
        title: "Schema UI",
        body: "Layout, stepper, gruppi ed etichette — separati dal modello dati, modificabili con drag & drop.",
      },
      {
        title: "Dati del modulo",
        body: "L’oggetto JSON compilato, collegato alla vostra applicazione o API.",
      },
    ],
  },
  pl: {
    heading: "Trzy elementy",
    concepts: [
      {
        title: "JSON Schema",
        body: "Pola, typy i wymagania. Opcjonalne elementy jak upload, mapa lub wartości obliczane — gdy ich potrzebujesz.",
      },
      {
        title: "Schemat UI",
        body: "Układ, stepper, grupy i etykiety — osobno od modelu danych, z drag & drop w edytorze.",
      },
      {
        title: "Dane formularza",
        body: "Wypełniony obiekt JSON, powiązany z aplikacją lub API.",
      },
    ],
  },
  uk: {
    heading: "Три складові",
    concepts: [
      {
        title: "JSON Schema",
        body: "Поля, типи та обов’язковість. За потреби — завантаження файлів, карта або обчислювані значення.",
      },
      {
        title: "Схема UI",
        body: "Макет, stepper, групи та мітки — окремо від моделі даних, з drag & drop у редакторі.",
      },
      {
        title: "Дані форми",
        body: "Заповнений JSON-об’єкт, пов’язаний із вашим додатком або API.",
      },
    ],
  },
  ru: {
    heading: "Три составляющие",
    concepts: [
      {
        title: "JSON Schema",
        body: "Поля, типы и обязательность. При необходимости — загрузка файлов, карта или вычисляемые значения.",
      },
      {
        title: "Схема UI",
        body: "Макет, stepper, группы и метки — отдельно от модели данных, с drag & drop в редакторе.",
      },
      {
        title: "Данные формы",
        body: "Заполненный JSON-объект, связанный с вашим приложением или API.",
      },
    ],
  },
  zh: {
    heading: "三个组成部分",
    concepts: [
      {
        title: "JSON Schema",
        body: "字段、类型与必填项。需要时再加上传、地图或计算字段等可选能力。",
      },
      {
        title: "UI Schema",
        body: "布局、步骤条、分组与标签 — 与数据模型分离，可在编辑器中拖放调整。",
      },
      {
        title: "表单数据",
        body: "已填写的 JSON 对象，绑定到你的应用或 API。",
      },
    ],
  },
  ja: {
    heading: "3つの構成要素",
    concepts: [
      {
        title: "JSON Schema",
        body: "フィールド、型、必須項目。必要ならアップロード、地図、計算フィールドなどの任意機能を追加できます。",
      },
      {
        title: "UI スキーマ",
        body: "レイアウト、ステッパー、グループ、ラベル — データモデルとは分離し、エディターでドラッグ＆ドロップ編集。",
      },
      {
        title: "フォームデータ",
        body: "入力済みの JSON オブジェクト。アプリや API にバインドします。",
      },
    ],
  },
};

const sharedFeatures: Record<AppLocale, { heading: string; features: GetStartedConcept[] }> = {
  de: {
    heading: "Bereits eingebaut",
    features: [
      {
        title: "Visueller Editor",
        body: "Schema und Layout im Browser anpassen — Palette, Drag & Drop und Vorschläge für freie Felder.",
      },
      {
        title: "Berechnete Felder",
        body: "Summen oder Status automatisch füllen. Felder bei Bedarf nur lesbar oder ausblenden.",
      },
      {
        title: "Dateien & Karten",
        body: "Upload mit Vorschau oder Zeichnen auf einer Karte — in den Szenarien zum Ausprobieren.",
      },
      {
        title: "Formate & Auswahl",
        body: "E-Mail, Telefon, Datum, Listen — plus Bewertung, Fortschrittsanzeige und mehrsprachige Labels.",
      },
    ],
  },
  en: {
    heading: "Already included",
    features: [
      {
        title: "Visual editor",
        body: "Edit schema and layout in the browser — palette, drag & drop, and suggestions for unused fields.",
      },
      {
        title: "Computed fields",
        body: "Fill sums or status automatically. Make fields read-only or hidden when needed.",
      },
      {
        title: "Files & maps",
        body: "Uploads with preview, or drawing on a map — try them in the scenarios.",
      },
      {
        title: "Formats & selects",
        body: "Email, phone, date, lists — plus rating, progress bar, and multilingual labels.",
      },
    ],
  },
  fr: {
    heading: "Déjà inclus",
    features: [
      {
        title: "Éditeur visuel",
        body: "Ajustez schéma et disposition dans le navigateur — palette, glisser-déposer et suggestions de champs libres.",
      },
      {
        title: "Champs calculés",
        body: "Remplissez sommes ou statuts automatiquement. Rendez les champs en lecture seule ou masqués si besoin.",
      },
      {
        title: "Fichiers et cartes",
        body: "Téléversement avec aperçu ou dessin sur une carte — à essayer dans les scénarios.",
      },
      {
        title: "Formats et listes",
        body: "E-mail, téléphone, date, listes — plus notation, barre de progression et libellés multilingues.",
      },
    ],
  },
  it: {
    heading: "Già incluso",
    features: [
      {
        title: "Editor visuale",
        body: "Modifica schema e layout nel browser — palette, drag & drop e suggerimenti per campi liberi.",
      },
      {
        title: "Campi calcolati",
        body: "Compila somme o stati automaticamente. Imposta campi in sola lettura o nascosti se serve.",
      },
      {
        title: "File e mappe",
        body: "Upload con anteprima o disegno sulla mappa — da provare negli scenari.",
      },
      {
        title: "Formati e selezioni",
        body: "E-mail, telefono, data, elenchi — più valutazione, barra di avanzamento ed etichette multilingue.",
      },
    ],
  },
  pl: {
    heading: "Już w zestawie",
    features: [
      {
        title: "Edytor wizualny",
        body: "Dostosuj schemat i układ w przeglądarce — paleta, drag & drop i propozycje wolnych pól.",
      },
      {
        title: "Pola obliczane",
        body: "Automatycznie uzupełniaj sumy lub status. Pola tylko do odczytu lub ukryte — gdy trzeba.",
      },
      {
        title: "Pliki i mapy",
        body: "Upload z podglądem lub rysowanie na mapie — do wypróbowania w scenariuszach.",
      },
      {
        title: "Formaty i listy",
        body: "E-mail, telefon, data, listy — plus ocena, pasek postępu i wielojęzyczne etykiety.",
      },
    ],
  },
  uk: {
    heading: "Уже вбудовано",
    features: [
      {
        title: "Візуальний редактор",
        body: "Налаштуйте схему та макет у браузері — палітра, drag & drop і підказки вільних полів.",
      },
      {
        title: "Обчислювані поля",
        body: "Автоматично заповнюйте суми чи статус. За потреби — лише читання або приховати.",
      },
      {
        title: "Файли та карти",
        body: "Завантаження з переглядом або малювання на карті — спробуйте в сценаріях.",
      },
      {
        title: "Формати та списки",
        body: "E-mail, телефон, дата, списки — плюс рейтинг, індикатор прогресу та багатомовні мітки.",
      },
    ],
  },
  ru: {
    heading: "Уже встроено",
    features: [
      {
        title: "Визуальный редактор",
        body: "Настраивайте схему и макет в браузере — палитра, drag & drop и подсказки свободных полей.",
      },
      {
        title: "Вычисляемые поля",
        body: "Автоматически заполняйте суммы или статус. При необходимости — только чтение или скрыть.",
      },
      {
        title: "Файлы и карты",
        body: "Загрузка с просмотром или рисование на карте — попробуйте в сценариях.",
      },
      {
        title: "Форматы и списки",
        body: "E-mail, телефон, дата, списки — плюс рейтинг, индикатор прогресса и многоязычные метки.",
      },
    ],
  },
  zh: {
    heading: "已内置",
    features: [
      {
        title: "可视化编辑器",
        body: "在浏览器中调整 Schema 与布局 — 面板、拖放，以及未使用字段的建议。",
      },
      {
        title: "计算字段",
        body: "自动填充合计或状态。需要时可设为只读或隐藏。",
      },
      {
        title: "文件与地图",
        body: "带预览的上传，或在地图上绘制 — 可在场景中试用。",
      },
      {
        title: "格式与选择",
        body: "邮箱、电话、日期、列表 — 以及评分、进度条和多语言标签。",
      },
    ],
  },
  ja: {
    heading: "すでに含まれています",
    features: [
      {
        title: "ビジュアルエディター",
        body: "ブラウザでスキーマとレイアウトを調整 — パレット、ドラッグ＆ドロップ、未使用フィールドの提案。",
      },
      {
        title: "計算フィールド",
        body: "合計やステータスを自動入力。必要なら読み取り専用や非表示にもできます。",
      },
      {
        title: "ファイルと地図",
        body: "プレビュー付きアップロードや地図上の描画 — シナリオで試せます。",
      },
      {
        title: "形式と選択",
        body: "メール、電話、日付、リスト — さらに評価、プログレスバー、多言語ラベル。",
      },
    ],
  },
};

const vueCopy: Record<AppLocale, StackCopy> = {
  de: {
    title: "Erste Schritte",
    lead: "Statt jedes Formular Feld für Feld zu programmieren, beschreiben Sie es — und erhalten ein prüfbares Formular. Weniger Custom-Code, schnellere Anpassungen. Unten der Einstieg mit Vue.",
    stepsHeading: "In vier Schritten starten",
    installTitle: "Pakete installieren",
    installBody:
      "Im Monorepo genügt pnpm install am Repository-Root. In eigenen Projekten die benötigten @jsonschema-editor/* Pakete hinzufügen.",
    registerTitle: "Erweiterungen registrieren",
    registerBody:
      "Ein Aufruf reicht: Formate, Wertelisten, berechnete Felder, Datei-Upload, Karte, Bewertung und Fortschrittsbalken.",
    loadTitle: "Schema und UI laden",
    loadBody:
      "Mit documentFromJSONWithExtensions() bleiben die Erweiterungs-Attribute erhalten. Das UI-Schema laden oder aus dem Schema erzeugen.",
    renderTitle: "Formular rendern",
    renderBody:
      "JsonSchemaForm bindet Daten per v-model. JsonSchemaFormEditor bearbeitet Schema und Layout im gleichen Modell.",
    packagesHeading: "Pakete im Überblick",
    packageRoles: [
      "Schema-Modell, Validierung, Pfade",
      "Formate, Listen, x-computed, x-file, x-geometry, …",
      "UI-Schema-Typen und Bridge",
      "Formular und visueller Editor",
      "Widgets für die Erweiterungen",
    ],
    tryHeading: "Direkt ausprobieren",
    tryBody:
      "In den Szenarien finden Sie fertige Formulare — von Vorsorge und Schadenmeldung über Spedition und Bauprojekt bis Fahrzeugkonfigurator. Formular testen, Schema und Layout bearbeiten, JSON live mitverfolgen.",
    tryCta: "Zu den Szenarien",
  },
  en: {
    title: "Get started",
    lead: "Instead of coding every form field by field, describe it — and get a validated form. Less custom code, faster changes. Below is the Vue getting-started path.",
    stepsHeading: "Start in four steps",
    installTitle: "Install packages",
    installBody:
      "In this monorepo, run pnpm install at the repository root. In your own app, add the @jsonschema-editor/* packages you need.",
    registerTitle: "Register extensions",
    registerBody:
      "One call enables formats, value lists, computed fields, file upload, maps, rating, and progress bar.",
    loadTitle: "Load schema and UI",
    loadBody:
      "documentFromJSONWithExtensions() keeps extension attributes. Load a UI schema or generate one from the schema.",
    renderTitle: "Render the form",
    renderBody:
      "JsonSchemaForm binds data with v-model. JsonSchemaFormEditor edits schema and layout in the same model.",
    packagesHeading: "Packages at a glance",
    packageRoles: [
      "Schema model, validation, paths",
      "Formats, lists, x-computed, x-file, x-geometry, …",
      "UI schema types and bridge",
      "Form and visual editor",
      "Widgets for the extensions",
    ],
    tryHeading: "Try it now",
    tryBody:
      "The scenarios ship ready-made forms — from screening and insurance claims to freight, building projects, and vehicle configuration. Test the form, edit schema and layout, watch JSON update live.",
    tryCta: "Browse scenarios",
  },
  fr: {
    title: "Premiers pas",
    lead: "Au lieu de programmer chaque formulaire champ par champ, décrivez-le — et obtenez un formulaire contrôlé. Moins de code sur mesure, des changements plus rapides. Ci-dessous le démarrage avec Vue.",
    stepsHeading: "Démarrer en quatre étapes",
    installTitle: "Installer les paquets",
    installBody:
      "Dans ce monorepo, lancez pnpm install à la racine. Dans votre projet, ajoutez les paquets @jsonschema-editor/* nécessaires.",
    registerTitle: "Enregistrer les extensions",
    registerBody:
      "Un appel suffit : formats, listes, champs calculés, téléversement, carte, notation et barre de progression.",
    loadTitle: "Charger le schéma et l’UI",
    loadBody:
      "documentFromJSONWithExtensions() conserve les attributs d’extension. Chargez un schéma UI ou générez-le depuis le schéma.",
    renderTitle: "Afficher le formulaire",
    renderBody:
      "JsonSchemaForm lie les données avec v-model. JsonSchemaFormEditor modifie schéma et disposition dans le même modèle.",
    packagesHeading: "Paquets en un coup d’œil",
    packageRoles: [
      "Modèle de schéma, validation, chemins",
      "Formats, listes, x-computed, x-file, x-geometry, …",
      "Types de schéma UI et bridge",
      "Formulaire et éditeur visuel",
      "Widgets pour les extensions",
    ],
    tryHeading: "Essayer tout de suite",
    tryBody:
      "Les scénarios proposent des formulaires prêts à l’emploi — de la prévention et des sinistres à la logistique, aux projets de construction et au configurateur. Testez, éditez schéma et disposition, suivez le JSON en direct.",
    tryCta: "Vers les scénarios",
  },
  it: {
    title: "Primi passi",
    lead: "Invece di programmare ogni modulo campo per campo, descrivetelo — e ottenete un modulo validato. Meno codice su misura, modifiche più rapide. Qui sotto l’avvio con Vue.",
    stepsHeading: "Iniziare in quattro passi",
    installTitle: "Installare i pacchetti",
    installBody:
      "In questo monorepo esegui pnpm install alla root. Nel tuo progetto aggiungi i pacchetti @jsonschema-editor/* necessari.",
    registerTitle: "Registrare le estensioni",
    registerBody:
      "Basta una chiamata: formati, elenchi, campi calcolati, upload, mappa, valutazione e barra di avanzamento.",
    loadTitle: "Caricare schema e UI",
    loadBody:
      "documentFromJSONWithExtensions() conserva gli attributi di estensione. Carica uno schema UI o generane uno dallo schema.",
    renderTitle: "Renderizzare il modulo",
    renderBody:
      "JsonSchemaForm lega i dati con v-model. JsonSchemaFormEditor modifica schema e layout nello stesso modello.",
    packagesHeading: "Pacchetti in sintesi",
    packageRoles: [
      "Modello schema, validazione, percorsi",
      "Formati, elenchi, x-computed, x-file, x-geometry, …",
      "Tipi schema UI e bridge",
      "Modulo ed editor visuale",
      "Widget per le estensioni",
    ],
    tryHeading: "Provare subito",
    tryBody:
      "Negli scenari trovi moduli pronti — dalla prevenzione e dai sinistri alla logistica, ai progetti edili e al configuratore. Prova il modulo, modifica schema e layout, segui il JSON in tempo reale.",
    tryCta: "Vai agli scenari",
  },
  pl: {
    title: "Pierwsze kroki",
    lead: "Zamiast programować każdy formularz pole po polu, opisz go — i uzyskaj sprawdzany formularz. Mniej własnego kodu, szybsze zmiany. Poniżej start z Vue.",
    stepsHeading: "Start w czterech krokach",
    installTitle: "Zainstaluj pakiety",
    installBody:
      "W tym monorepo wystarczy pnpm install w katalogu głównym. We własnym projekcie dodaj potrzebne pakiety @jsonschema-editor/*.",
    registerTitle: "Zarejestruj rozszerzenia",
    registerBody:
      "Jedno wywołanie włącza formaty, listy, pola obliczane, upload, mapę, ocenę i pasek postępu.",
    loadTitle: "Wczytaj schemat i UI",
    loadBody:
      "documentFromJSONWithExtensions() zachowuje atrybuty rozszerzeń. Wczytaj schemat UI lub wygeneruj go ze schematu.",
    renderTitle: "Wyrenderuj formularz",
    renderBody:
      "JsonSchemaForm wiąże dane przez v-model. JsonSchemaFormEditor edytuje schemat i układ w tym samym modelu.",
    packagesHeading: "Pakiety w skrócie",
    packageRoles: [
      "Model schematu, walidacja, ścieżki",
      "Formaty, listy, x-computed, x-file, x-geometry, …",
      "Typy schematu UI i bridge",
      "Formularz i edytor wizualny",
      "Widgety dla rozszerzeń",
    ],
    tryHeading: "Wypróbuj od razu",
    tryBody:
      "W scenariuszach są gotowe formularze — od badań i szkód, przez spedycję i projekty budowlane, po konfigurator pojazdu. Testuj formularz, edytuj schemat i układ, śledź JSON na żywo.",
    tryCta: "Do scenariuszy",
  },
  uk: {
    title: "Перші кроки",
    lead: "Замість програмувати кожну форму поле за полем, опишіть її — і отримайте перевірену форму. Менше власного коду, швидші зміни. Нижче старт із Vue.",
    stepsHeading: "Старт за чотири кроки",
    installTitle: "Встановити пакети",
    installBody:
      "У цьому монорепозиторії достатньо pnpm install у корені. У власному проєкті додайте потрібні пакети @jsonschema-editor/*.",
    registerTitle: "Зареєструвати розширення",
    registerBody:
      "Одного виклику достатньо: формати, списки, обчислювані поля, завантаження, карта, рейтинг і індикатор прогресу.",
    loadTitle: "Завантажити схему та UI",
    loadBody:
      "documentFromJSONWithExtensions() зберігає атрибути розширень. Завантажте схему UI або згенеруйте її зі схеми.",
    renderTitle: "Відрендерити форму",
    renderBody:
      "JsonSchemaForm зв’язує дані через v-model. JsonSchemaFormEditor редагує схему та макет у тій самій моделі.",
    packagesHeading: "Пакети коротко",
    packageRoles: [
      "Модель схеми, валідація, шляхи",
      "Формати, списки, x-computed, x-file, x-geometry, …",
      "Типи схеми UI і bridge",
      "Форма та візуальний редактор",
      "Віджети для розширень",
    ],
    tryHeading: "Спробувати одразу",
    tryBody:
      "У сценаріях є готові форми — від профілактики та страхових заявок до логістики, будівельних проєктів і конфігуратора. Тестуйте форму, редагуйте схему й макет, стежте за JSON наживо.",
    tryCta: "До сценаріїв",
  },
  ru: {
    title: "Первые шаги",
    lead: "Вместо того чтобы программировать каждую форму поле за полем, опишите её — и получите проверяемую форму. Меньше своего кода, быстрее изменения. Ниже старт с Vue.",
    stepsHeading: "Старт за четыре шага",
    installTitle: "Установить пакеты",
    installBody:
      "В этом монорепозитории достаточно pnpm install в корне. В своём проекте добавьте нужные пакеты @jsonschema-editor/*.",
    registerTitle: "Зарегистрировать расширения",
    registerBody:
      "Достаточно одного вызова: форматы, списки, вычисляемые поля, загрузка, карта, рейтинг и индикатор прогресса.",
    loadTitle: "Загрузить схему и UI",
    loadBody:
      "documentFromJSONWithExtensions() сохраняет атрибуты расширений. Загрузите схему UI или сгенерируйте её из схемы.",
    renderTitle: "Отрендерить форму",
    renderBody:
      "JsonSchemaForm связывает данные через v-model. JsonSchemaFormEditor редактирует схему и макет в той же модели.",
    packagesHeading: "Пакеты кратко",
    packageRoles: [
      "Модель схемы, валидация, пути",
      "Форматы, списки, x-computed, x-file, x-geometry, …",
      "Типы схемы UI и bridge",
      "Форма и визуальный редактор",
      "Виджеты для расширений",
    ],
    tryHeading: "Попробовать сразу",
    tryBody:
      "В сценариях есть готовые формы — от осмотров и страховых заявок до логистики, строительных проектов и конфигуратора. Тестируйте форму, редактируйте схему и макет, следите за JSON в реальном времени.",
    tryCta: "К сценариям",
  },
  zh: {
    title: "入门",
    lead: "不必逐个字段手写表单：描述即可得到可校验的表单。更少定制代码，更快调整。以下是 Vue 入门路径。",
    stepsHeading: "四步开始",
    installTitle: "安装包",
    installBody:
      "在本 monorepo 中于仓库根目录运行 pnpm install。在你自己的项目中添加所需的 @jsonschema-editor/* 包。",
    registerTitle: "注册扩展",
    registerBody: "一次调用即可：格式、列表、计算字段、文件上传、地图、评分和进度条。",
    loadTitle: "加载 Schema 与 UI",
    loadBody:
      "documentFromJSONWithExtensions() 会保留扩展属性。加载 UI Schema，或从 Schema 生成。",
    renderTitle: "渲染表单",
    renderBody:
      "JsonSchemaForm 通过 v-model 绑定数据。JsonSchemaFormEditor 在同一模型中编辑 Schema 与布局。",
    packagesHeading: "包一览",
    packageRoles: [
      "Schema 模型、校验、路径",
      "格式、列表、x-computed、x-file、x-geometry、…",
      "UI Schema 类型与 Bridge",
      "表单与可视化编辑器",
      "扩展用组件",
    ],
    tryHeading: "立即试用",
    tryBody:
      "场景中提供现成表单 — 从体检与理赔，到物流、建筑项目再到车辆配置。测试表单，编辑 Schema 与布局，实时查看 JSON。",
    tryCta: "查看场景",
  },
  ja: {
    title: "はじめに",
    lead: "項目ごとに手書きする代わりにフォームを記述すれば、検証付きフォームが得られます。独自コードを減らし、変更を速く。以下は Vue の始め方です。",
    stepsHeading: "4 ステップで開始",
    installTitle: "パッケージをインストール",
    installBody:
      "このモノレポではルートで pnpm install。独自プロジェクトでは必要な @jsonschema-editor/* を追加します。",
    registerTitle: "拡張を登録",
    registerBody:
      "一度の呼び出しで十分: 形式、リスト、計算フィールド、アップロード、地図、評価、プログレスバー。",
    loadTitle: "スキーマと UI を読み込む",
    loadBody:
      "documentFromJSONWithExtensions() で拡張属性が保持されます。UI スキーマを読み込むか、スキーマから生成します。",
    renderTitle: "フォームを描画",
    renderBody:
      "JsonSchemaForm は v-model でデータを束縛。JsonSchemaFormEditor は同じモデルでスキーマとレイアウトを編集します。",
    packagesHeading: "パッケージ一覧",
    packageRoles: [
      "スキーマモデル、検証、パス",
      "形式、リスト、x-computed、x-file、x-geometry、…",
      "UI スキーマ型と Bridge",
      "フォームとビジュアルエディター",
      "拡張用ウィジェット",
    ],
    tryHeading: "すぐ試す",
    tryBody:
      "シナリオには完成済みフォームがあります — 健診や保険請求から物流、建築プロジェクト、車両コンフィギュレーターまで。フォームを試し、スキーマとレイアウトを編集し、JSON をライブで確認。",
    tryCta: "シナリオへ",
  },
};

const reactCopy: Record<AppLocale, StackCopy> = {
  de: {
    title: "Erste Schritte mit React",
    lead: "Dieselbe Low-Code-Idee mit React: Formulare beschreiben statt jedes Feld einzeln zu bauen. Weniger Frontend-Aufwand, schnellere Änderungen.",
    stepsHeading: "In vier Schritten starten",
    installTitle: "Pakete installieren",
    installBody: "React-Kern und Extensions:",
    registerTitle: "Extensions registrieren",
    registerBody:
      "Ein Aufruf reicht: Formate, Wertelisten, berechnete Felder, Datei-Upload, Karte, Bewertung und Fortschrittsbalken.",
    loadTitle: "Schema und UI laden",
    loadBody: "Mit documentFromJSONWithExtensions() bleiben die Erweiterungs-Attribute erhalten.",
    renderTitle: "Formular einbinden",
    renderBody:
      "JsonSchemaForm rendern und Daten per Props steuern. JsonSchemaFormEditor bearbeitet Schema und Layout.",
    packagesHeading: "Pakete im Überblick",
    packageRoles: [
      "Schema-Modell, Validierung, Pfade",
      "Formate, Listen, x-computed, x-file, x-geometry, …",
      "UI-Schema-Typen und Bridge",
      "Formular und visueller Editor",
      "Widgets für die Erweiterungen",
    ],
    tryHeading: "Szenarien ausprobieren",
    tryBody:
      "Wählen Sie ein Praxisbeispiel und testen Sie das React-Formular mit live JSON-Ausgabe — inklusive Editor für Schema und Layout.",
    tryCta: "Zu den Szenarien",
  },
  en: {
    title: "Get started with React",
    lead: "The same low-code idea with React: describe forms instead of building every field by hand. Less front-end effort, faster changes.",
    stepsHeading: "Start in four steps",
    installTitle: "Install packages",
    installBody: "React core and extensions:",
    registerTitle: "Register extensions",
    registerBody:
      "One call enables formats, value lists, computed fields, file upload, maps, rating, and progress bar.",
    loadTitle: "Load schema and UI",
    loadBody: "documentFromJSONWithExtensions() keeps extension attributes.",
    renderTitle: "Use the form",
    renderBody:
      "Render JsonSchemaForm and control data via props. JsonSchemaFormEditor edits schema and layout.",
    packagesHeading: "Packages at a glance",
    packageRoles: [
      "Schema model, validation, paths",
      "Formats, lists, x-computed, x-file, x-geometry, …",
      "UI schema types and bridge",
      "Form and visual editor",
      "Widgets for the extensions",
    ],
    tryHeading: "Try the scenarios",
    tryBody:
      "Pick a real-world scenario and test the React form with live JSON output — including the schema and layout editor.",
    tryCta: "Open examples",
  },
  fr: {
    title: "Premiers pas avec React",
    lead: "La même idée low-code avec React : décrire les formulaires au lieu de construire chaque champ à la main. Moins d’effort front-end, des changements plus rapides.",
    stepsHeading: "Démarrer en quatre étapes",
    installTitle: "Installer les paquets",
    installBody: "Cœur React et extensions :",
    registerTitle: "Enregistrer les extensions",
    registerBody:
      "Un appel suffit : formats, listes, champs calculés, téléversement, carte, notation et barre de progression.",
    loadTitle: "Charger le schéma et l’UI",
    loadBody: "documentFromJSONWithExtensions() conserve les attributs d’extension.",
    renderTitle: "Intégrer le formulaire",
    renderBody:
      "Rendez JsonSchemaForm et pilotez les données via les props. JsonSchemaFormEditor modifie schéma et disposition.",
    packagesHeading: "Paquets en un coup d’œil",
    packageRoles: [
      "Modèle de schéma, validation, chemins",
      "Formats, listes, x-computed, x-file, x-geometry, …",
      "Types de schéma UI et bridge",
      "Formulaire et éditeur visuel",
      "Widgets pour les extensions",
    ],
    tryHeading: "Essayer les scénarios",
    tryBody:
      "Choisissez un cas concret et testez le formulaire React avec JSON en direct — y compris l’éditeur de schéma et de disposition.",
    tryCta: "Vers les scénarios",
  },
  it: {
    title: "Primi passi con React",
    lead: "La stessa idea low-code con React: descrivere i moduli invece di costruire ogni campo a mano. Meno lavoro front-end, modifiche più rapide.",
    stepsHeading: "Iniziare in quattro passi",
    installTitle: "Installare i pacchetti",
    installBody: "Core React ed estensioni:",
    registerTitle: "Registrare le estensioni",
    registerBody:
      "Basta una chiamata: formati, elenchi, campi calcolati, upload, mappa, valutazione e barra di avanzamento.",
    loadTitle: "Caricare schema e UI",
    loadBody: "documentFromJSONWithExtensions() conserva gli attributi di estensione.",
    renderTitle: "Integrare il modulo",
    renderBody:
      "Renderizza JsonSchemaForm e controlla i dati via props. JsonSchemaFormEditor modifica schema e layout.",
    packagesHeading: "Pacchetti in sintesi",
    packageRoles: [
      "Modello schema, validazione, percorsi",
      "Formati, elenchi, x-computed, x-file, x-geometry, …",
      "Tipi schema UI e bridge",
      "Modulo ed editor visuale",
      "Widget per le estensioni",
    ],
    tryHeading: "Provare gli scenari",
    tryBody:
      "Scegli un caso reale e prova il modulo React con JSON in tempo reale — incluso l’editor di schema e layout.",
    tryCta: "Vai agli scenari",
  },
  pl: {
    title: "Pierwsze kroki z React",
    lead: "Ta sama idea low-code z React: opisuj formularze zamiast budować każde pole ręcznie. Mniej pracy frontendowej, szybsze zmiany.",
    stepsHeading: "Start w czterech krokach",
    installTitle: "Zainstaluj pakiety",
    installBody: "Rdzeń React i rozszerzenia:",
    registerTitle: "Zarejestruj rozszerzenia",
    registerBody:
      "Jedno wywołanie włącza formaty, listy, pola obliczane, upload, mapę, ocenę i pasek postępu.",
    loadTitle: "Wczytaj schemat i UI",
    loadBody: "documentFromJSONWithExtensions() zachowuje atrybuty rozszerzeń.",
    renderTitle: "Podłącz formularz",
    renderBody:
      "Wyrenderuj JsonSchemaForm i steruj danymi przez props. JsonSchemaFormEditor edytuje schemat i układ.",
    packagesHeading: "Pakiety w skrócie",
    packageRoles: [
      "Model schematu, walidacja, ścieżki",
      "Formaty, listy, x-computed, x-file, x-geometry, …",
      "Typy schematu UI i bridge",
      "Formularz i edytor wizualny",
      "Widgety dla rozszerzeń",
    ],
    tryHeading: "Wypróbuj scenariusze",
    tryBody:
      "Wybierz przykład z praktyki i przetestuj formularz React z JSON na żywo — wraz z edytorem schematu i układu.",
    tryCta: "Do scenariuszy",
  },
  uk: {
    title: "Перші кроки з React",
    lead: "Та сама ідея low-code з React: описуйте форми замість ручної збірки кожного поля. Менше frontend-роботи, швидші зміни.",
    stepsHeading: "Старт за чотири кроки",
    installTitle: "Встановити пакети",
    installBody: "Ядро React і розширення:",
    registerTitle: "Зареєструвати розширення",
    registerBody:
      "Одного виклику достатньо: формати, списки, обчислювані поля, завантаження, карта, рейтинг і індикатор прогресу.",
    loadTitle: "Завантажити схему та UI",
    loadBody: "documentFromJSONWithExtensions() зберігає атрибути розширень.",
    renderTitle: "Підключити форму",
    renderBody:
      "Відрендеріть JsonSchemaForm і керуйте даними через props. JsonSchemaFormEditor редагує схему та макет.",
    packagesHeading: "Пакети коротко",
    packageRoles: [
      "Модель схеми, валідація, шляхи",
      "Формати, списки, x-computed, x-file, x-geometry, …",
      "Типи схеми UI і bridge",
      "Форма та візуальний редактор",
      "Віджети для розширень",
    ],
    tryHeading: "Спробувати сценарії",
    tryBody:
      "Оберіть приклад і протестуйте React-форму з JSON наживо — включно з редактором схеми та макета.",
    tryCta: "До сценаріїв",
  },
  ru: {
    title: "Первые шаги с React",
    lead: "Та же идея low-code с React: описывайте формы вместо ручной сборки каждого поля. Меньше frontend-работы, быстрее изменения.",
    stepsHeading: "Старт за четыре шага",
    installTitle: "Установить пакеты",
    installBody: "Ядро React и расширения:",
    registerTitle: "Зарегистрировать расширения",
    registerBody:
      "Достаточно одного вызова: форматы, списки, вычисляемые поля, загрузка, карта, рейтинг и индикатор прогресса.",
    loadTitle: "Загрузить схему и UI",
    loadBody: "documentFromJSONWithExtensions() сохраняет атрибуты расширений.",
    renderTitle: "Подключить форму",
    renderBody:
      "Отрендерите JsonSchemaForm и управляйте данными через props. JsonSchemaFormEditor редактирует схему и макет.",
    packagesHeading: "Пакеты кратко",
    packageRoles: [
      "Модель схемы, валидация, пути",
      "Форматы, списки, x-computed, x-file, x-geometry, …",
      "Типы схемы UI и bridge",
      "Форма и визуальный редактор",
      "Виджеты для расширений",
    ],
    tryHeading: "Попробовать сценарии",
    tryBody:
      "Выберите пример и протестируйте React-форму с JSON в реальном времени — включая редактор схемы и макета.",
    tryCta: "К сценариям",
  },
  zh: {
    title: "React 入门",
    lead: "同样的低代码思路，配合 React：描述表单，而不是逐个字段手写。更少前端工作量，更快变更。",
    stepsHeading: "四步开始",
    installTitle: "安装包",
    installBody: "React 核心与扩展：",
    registerTitle: "注册扩展",
    registerBody: "一次调用即可：格式、列表、计算字段、文件上传、地图、评分和进度条。",
    loadTitle: "加载 Schema 与 UI",
    loadBody: "documentFromJSONWithExtensions() 会保留扩展属性。",
    renderTitle: "接入表单",
    renderBody: "渲染 JsonSchemaForm 并通过 props 控制数据。JsonSchemaFormEditor 编辑 Schema 与布局。",
    packagesHeading: "包一览",
    packageRoles: [
      "Schema 模型、校验、路径",
      "格式、列表、x-computed、x-file、x-geometry、…",
      "UI Schema 类型与 Bridge",
      "表单与可视化编辑器",
      "扩展用组件",
    ],
    tryHeading: "试用场景",
    tryBody: "选择一个实际场景，用实时 JSON 测试 React 表单 — 包含 Schema 与布局编辑器。",
    tryCta: "查看场景",
  },
  ja: {
    title: "React ではじめに",
    lead: "同じローコードの考え方を React で: 項目を手組みせずフォームを記述。フロントエンド工数を減らし、変更を速く。",
    stepsHeading: "4 ステップで開始",
    installTitle: "パッケージをインストール",
    installBody: "React コアと拡張:",
    registerTitle: "拡張を登録",
    registerBody:
      "一度の呼び出しで十分: 形式、リスト、計算フィールド、アップロード、地図、評価、プログレスバー。",
    loadTitle: "スキーマと UI を読み込む",
    loadBody: "documentFromJSONWithExtensions() で拡張属性が保持されます。",
    renderTitle: "フォームを組み込む",
    renderBody:
      "JsonSchemaForm を描画し、props でデータを制御。JsonSchemaFormEditor でスキーマとレイアウトを編集。",
    packagesHeading: "パッケージ一覧",
    packageRoles: [
      "スキーマモデル、検証、パス",
      "形式、リスト、x-computed、x-file、x-geometry、…",
      "UI スキーマ型と Bridge",
      "フォームとビジュアルエディター",
      "拡張用ウィジェット",
    ],
    tryHeading: "シナリオを試す",
    tryBody:
      "実例を選び、ライブ JSON で React フォームをテスト — スキーマ／レイアウトエディター付き。",
    tryCta: "シナリオへ",
  },
};

const vueInstallCode = `pnpm add @jsonschema-editor/vue @jsonschema-editor/vue-extensions \\
  @jsonschema-editor/json-schema @jsonschema-editor/json-schema-extensions \\
  @jsonschema-editor/ui-schema`;

const vueRegisterCode = `import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";

registerDefaultVueExtensions();`;

const loadSchemaCode = `import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

const schema = documentFromJSONWithExtensions(schemaJson);
const uiSchema = UiSchema.fromJSON(uiSchemaJson);`;

const reactInstallCode = `npm install @jsonschema-editor/react @jsonschema-editor/react-extensions \\
  @jsonschema-editor/json-schema-extensions react react-dom`;

const reactRegisterCode = `import { registerDefaultReactExtensions } from "@jsonschema-editor/react-extensions";

registerDefaultReactExtensions();`;

function vuePackages(roles: StackCopy["packageRoles"]): GetStartedPackage[] {
  return [
    { name: "@jsonschema-editor/json-schema", role: roles[0] },
    { name: "@jsonschema-editor/json-schema-extensions", role: roles[1] },
    { name: "@jsonschema-editor/ui-schema", role: roles[2] },
    { name: "@jsonschema-editor/vue", role: roles[3] },
    { name: "@jsonschema-editor/vue-extensions", role: roles[4] },
  ];
}

function reactPackages(roles: StackCopy["packageRoles"]): GetStartedPackage[] {
  return [
    { name: "@jsonschema-editor/json-schema", role: roles[0] },
    { name: "@jsonschema-editor/json-schema-extensions", role: roles[1] },
    { name: "@jsonschema-editor/ui-schema", role: roles[2] },
    { name: "@jsonschema-editor/react", role: roles[3] },
    { name: "@jsonschema-editor/react-extensions", role: roles[4] },
  ];
}

function buildVueStack(locale: AppLocale, copy: StackCopy) {
  return {
    title: copy.title,
    lead: copy.lead,
    stepsHeading: copy.stepsHeading,
    steps: [
      { title: copy.installTitle, body: copy.installBody, code: vueInstallCode },
      { title: copy.registerTitle, body: copy.registerBody, code: vueRegisterCode },
      { title: copy.loadTitle, body: copy.loadBody, code: loadSchemaCode },
      {
        title: copy.renderTitle,
        body: copy.renderBody,
        code: `<JsonSchemaForm
  v-model="formData"
  :schema="schema"
  :ui-schema="uiSchema"
  locale="${locale}"
/>`,
      },
    ],
    packagesHeading: copy.packagesHeading,
    packages: vuePackages(copy.packageRoles),
    tryHeading: copy.tryHeading,
    tryBody: copy.tryBody,
    tryCta: copy.tryCta,
  };
}

function buildReactStack(locale: AppLocale, copy: StackCopy) {
  return {
    title: copy.title,
    lead: copy.lead,
    stepsHeading: copy.stepsHeading,
    steps: [
      { title: copy.installTitle, body: copy.installBody, code: reactInstallCode },
      { title: copy.registerTitle, body: copy.registerBody, code: reactRegisterCode },
      { title: copy.loadTitle, body: copy.loadBody, code: loadSchemaCode },
      {
        title: copy.renderTitle,
        body: copy.renderBody,
        code: `import { JsonSchemaForm } from "@jsonschema-editor/react";
import "@jsonschema-editor/react/style.css";

<JsonSchemaForm
  schema={schema}
  uiSchema={uiSchema}
  data={formData}
  onDataChange={setFormData}
  locale="${locale}"
/>`,
      },
    ],
    packagesHeading: copy.packagesHeading,
    packages: reactPackages(copy.packageRoles),
    tryHeading: copy.tryHeading,
    tryBody: copy.tryBody,
    tryCta: copy.tryCta,
  };
}

export function getStartedFor(locale: AppLocale, stack: AppStack = "vue"): GetStartedContent {
  const concepts = sharedConcepts[locale];
  const features = sharedFeatures[locale];
  const stackPart =
    stack === "react"
      ? buildReactStack(locale, reactCopy[locale])
      : buildVueStack(locale, vueCopy[locale]);

  return {
    ...stackPart,
    conceptsHeading: concepts.heading,
    concepts: concepts.concepts,
    featuresHeading: features.heading,
    features: features.features,
  };
}
