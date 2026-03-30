import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the language context
const LanguageContext = createContext();

// Custom hook to use the language
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Language definitions
export const LANGUAGES = {
    th: {
        code: 'th',
        name: 'ไทย',
        flag: '🇹🇭',
        nativeName: 'ภาษาไทย',
    },
    en: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        nativeName: 'English',
    },
    zh: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        nativeName: '中文',
    },
    ja: {
        code: 'ja',
        name: '日本語',
        flag: '🇯🇵',
        nativeName: '日本語',
    },
};

const TRANSLATIONS = {
    th: {
        // Nav
        about: 'เกี่ยวกับ',
        settings: 'ตั้งค่า',
        language: 'ภาษา',
        darkMode: 'โหมดมืด',
        lightMode: 'โหมดสว่าง',
        theme: 'ธีม',
        currency: 'สกุลเงิน',
        editCategory: 'แก้ไขหมวดหมู่',
        editNewName: 'แก้ไขชื่อใหม่',

        // Home
        bank: 'ธนาคาร',
        cash: 'เงินสด',
        netProfit: 'กำไรสุทธิ',
        balance: 'ยอดคงเหลือ',
        income: 'รายรับ',
        expense: 'รายจ่าย',
        monthlyData: 'ข้อมูลประจำเดือน',
        totalRatio: 'สัดส่วนทั้งหมด',
        expenseByCat: 'สัดส่วนรายจ่ายหมวดหมู่',

        // Categories (default display names)
        essentials: 'เงินจำเป็น',
        wants: 'เงินตามใจ',
        investment: 'เงินลงทุน',
        savings: 'เงินออม',

        // About
        aboutTitle: 'เกี่ยวกับ MyBank',
        aboutDesc: 'แอปสำหรับบันทึกและวิเคราะห์รายรับ-รายจ่ายของคุณ',
        version: 'เวอร์ชัน',
        close: 'ปิด',

        // Footer
        home: 'หน้าหลัก',
        record: 'ประวัติ',
        add: 'เพิ่ม',
        notebook: 'บันทึก',

        // Record
        transactionHistory: 'ประวัติการทำรายการ',
        noTransaction: 'ยังไม่มีรายการ',
        deleteConfirm: 'ยืนยันลบรายการ',
        deleteDesc: 'คุณต้องการลบรายการนี้?',
        delete: 'ลบ',
        cancel: 'ยกเลิก',
        edit: 'แก้ไข',
        all: 'ทั้งหมด',
        clear: 'ล้าง',
        confirm: 'ตกลง',
        anonymous: 'ไม่ระบุชื่อ',

        // AddList
        addIncome: 'เพิ่มรายรับ',
        addExpense: 'เพิ่มรายจ่าย',
        addItem: 'เพิ่มรายการ',
        editItem: 'แก้ไขรายการ',
        title: 'ชื่อรายการ',
        amount: 'จำนวนเงิน',
        date: 'วันที่',
        category: 'หมวดหมู่',
        type: 'ประเภทเงิน',
        listTypeTitle: 'ประเภทของรายการ',
        accountTypeTitle: 'ประเภทบัญชี',
        accountInBank: 'เงินในบัญชี',
        save: 'บันทึก',
        saveSuccess: 'บันทึกสำเร็จ',
        saveSuccessDesc: 'รายการของคุณได้รับการบันทึกเรียบร้อยแล้ว',
        amountAlert: 'กรุณาระบุจำนวนเงิน',
        amountAlertDesc: 'โปรดกรอกจำนวนเงินก่อนบันทึกรายการ',
        ok: 'ตกลง',
        selectListType: 'กรุณาเลือกประเภทรายการ',
        saveError: 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่',
        itemName: 'ชื่อรายการ',

        // Notebook
        noteTitle: 'ชื่อโน้ต',
        noteColor: 'สีโน้ต',
        addNote: 'เพิ่มโน้ต',
        noNote: 'ยังไม่มีบันทึกช่วยจำ',
        editNote: 'แก้ไขบันทึก',
        noteDetail: 'รายละเอียด (ไม่บังคับ)',
        noteTitlePlaceholder: 'พิมพ์หัวข้อ...',
        noteDetailPlaceholder: 'พิมพ์รายละเอียดเพิ่มเติม...',
        saveEdit: 'บันทึกการแก้ไข',
        noteAlert: 'กรุณาระบุหัวข้อ',
        noteAlertDesc: 'โปรดกรอกหัวข้อก่อนบันทึก',

        // Confirm Popup
        deleteData: 'ลบข้อมูล',
        confirmDelete: 'ยืนยันการลบ',
        confirmDeleteDesc: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? ถ้าลบแล้วจะไม่สามารถกู้คืนได้',

        // Notifications (Warn)
        notifications: 'การแจ้งเตือน',
        markAllRead: 'อ่านทั้งหมด',
        noNotification: 'ไม่มีการแจ้งเตือน',
        noNotificationDesc: 'เมื่อมีการเคลื่อนไหวในบัญชีของคุณ\nการแจ้งเตือนจะแสดงที่นี่',
        notifTransaction: 'ธุรกรรม',
        notifBudget: 'งบประมาณ',
        notifReminder: 'เตือนความจำ',
        notifSystem: 'ระบบ',

        // Notification mock data
        notifTitle1: 'บันทึกรายจ่ายสำเร็จ',
        notifMsg1: 'คุณบันทึกการซื้ออาหาร ฿150',
        notifTime1: '10 นาที',
        notifTitle2: 'ใกล้ถึงวงเงิน',
        notifMsg2: 'หมวด "เงินตามใจ" เหลืออีก ฿200',
        notifTime2: '1 ชม.',
        notifTitle3: 'เตือนบันทึกรายการ',
        notifMsg3: 'อย่าลืมบันทึกรายรับ-รายจ่ายวันนี้',
        notifTime3: '2 ชม.',
        notifTitle4: 'รายรับใหม่',
        notifMsg4: 'บันทึกรายรับ ฿5,000 จากเงินเดือน',
        notifTime4: 'เมื่อวาน',
        notifTitle5: 'อัปเดตแอป',
        notifMsg5: 'MyBank v1.0.0 พร้อมใช้งานแล้ว',
        notifTime5: '2 วัน',

        // Onboarding
        onboardingTitle: 'ตั้งค่าเริ่มต้น',
        selectLanguage: 'เลือกภาษา',
        selectCurrency: 'เลือกสกุลเงิน',
        next: 'ถัดไป',
        welcomeTitle: 'ยินดีต้อนรับ! 🎉',
        welcomeDesc: 'ขอบคุณที่เลือกใช้ FakeWalletHub\nแอปจัดการรายรับ-รายจ่ายอัจฉริยะ',
        github: 'GitHub',
        contact: 'ติดต่อเรา',
        getStarted: 'เริ่มใช้งาน',
    },
    en: {
        // Nav
        about: 'About',
        settings: 'Settings',
        language: 'Language',
        darkMode: 'Dark Mode',
        lightMode: 'Light Mode',
        theme: 'Theme',
        currency: 'Currency',
        editCategory: 'Edit Categories',
        editNewName: 'Edit new name',

        // Home
        bank: 'Bank',
        cash: 'Cash',
        netProfit: 'Net Profit',
        balance: 'Balance',
        income: 'Income',
        expense: 'Expense',
        monthlyData: 'Monthly Data',
        totalRatio: 'Total Ratio',
        expenseByCat: 'Expense by Category',

        // Categories
        essentials: 'Essentials',
        wants: 'Wants',
        investment: 'Investment',
        savings: 'Savings',

        // About
        aboutTitle: 'About MyBank',
        aboutDesc: 'App for recording and analyzing your income and expenses',
        version: 'Version',
        close: 'Close',

        // Footer
        home: 'Home',
        record: 'Record',
        add: 'Add',
        notebook: 'Notebook',

        // Record
        transactionHistory: 'Transaction History',
        noTransaction: 'No transactions yet',
        deleteConfirm: 'Confirm Delete',
        deleteDesc: 'Do you want to delete this item?',
        delete: 'Delete',
        cancel: 'Cancel',
        edit: 'Edit',
        all: 'All',
        clear: 'Clear',
        confirm: 'Confirm',
        anonymous: 'Anonymous',

        // AddList
        addIncome: 'Add Income',
        addExpense: 'Add Expense',
        addItem: 'Add Item',
        editItem: 'Edit Item',
        title: 'Title',
        amount: 'Amount',
        date: 'Date',
        category: 'Category',
        type: 'Money Type',
        listTypeTitle: 'List Type',
        accountTypeTitle: 'Account Type',
        accountInBank: 'In Bank',
        save: 'Save',
        saveSuccess: 'Saved Successfully',
        saveSuccessDesc: 'Your item has been successfully saved.',
        amountAlert: 'Please enter amount',
        amountAlertDesc: 'Please fill in the amount before saving.',
        ok: 'OK',
        selectListType: 'Please select a list type',
        saveError: 'Error saving. Please try again.',
        itemName: 'Item name',

        // Notebook
        noteTitle: 'Note Title',
        noteColor: 'Note Color',
        addNote: 'Add Note',
        noNote: 'No notes yet',
        editNote: 'Edit Note',
        noteDetail: 'Detail (optional)',
        noteTitlePlaceholder: 'Type a title...',
        noteDetailPlaceholder: 'Type additional details...',
        saveEdit: 'Save Changes',
        noteAlert: 'Please enter a title',
        noteAlertDesc: 'Please fill in the title before saving.',

        // Confirm Popup
        deleteData: 'Delete Data',
        confirmDelete: 'Confirm Delete',
        confirmDeleteDesc: 'Are you sure you want to delete this item? This action cannot be undone.',

        // Notifications (Warn)
        notifications: 'Notifications',
        markAllRead: 'Read all',
        noNotification: 'No notifications',
        noNotificationDesc: 'When there is activity in your account,\nnotifications will appear here.',
        notifTransaction: 'Transaction',
        notifBudget: 'Budget',
        notifReminder: 'Reminder',
        notifSystem: 'System',

        // Notification mock data
        notifTitle1: 'Expense recorded',
        notifMsg1: 'You recorded a food purchase ฿150',
        notifTime1: '10 min',
        notifTitle2: 'Nearing budget limit',
        notifMsg2: '"Wants" category has ฿200 remaining',
        notifTime2: '1 hr',
        notifTitle3: 'Record reminder',
        notifMsg3: "Don't forget to record today's transactions",
        notifTime3: '2 hrs',
        notifTitle4: 'New income',
        notifMsg4: 'Recorded income ฿5,000 from salary',
        notifTime4: 'Yesterday',
        notifTitle5: 'App update',
        notifMsg5: 'MyBank v1.0.0 is now available',
        notifTime5: '2 days',

        // Onboarding
        onboardingTitle: 'Get Started',
        selectLanguage: 'Select Language',
        selectCurrency: 'Select Currency',
        next: 'Next',
        welcomeTitle: 'Welcome! 🎉',
        welcomeDesc: 'Thank you for choosing FakeWalletHub\nYour smart income & expense manager',
        github: 'GitHub',
        contact: 'Contact Us',
        getStarted: 'Get Started',
    },
    zh: {
        // Nav
        about: '关于',
        settings: '设置',
        language: '语言',
        darkMode: '深色模式',
        lightMode: '浅色模式',
        theme: '主题',
        currency: '货币',
        editCategory: '编辑类别',
        editNewName: '编辑新名称',

        // Home
        bank: '银行',
        cash: '现金',
        netProfit: '净利润',
        balance: '余额',
        income: '收入',
        expense: '支出',
        monthlyData: '月度数据',
        totalRatio: '总比例',
        expenseByCat: '分类支出比例',

        // Categories
        essentials: '必需品',
        wants: '个人消费',
        investment: '投资',
        savings: '储蓄',

        // About
        aboutTitle: '关于 MyBank',
        aboutDesc: '用于记录和分析您的收入和支出的应用程序',
        version: '版本',
        close: '关闭',

        // Footer
        home: '首页',
        record: '记录',
        add: '添加',
        notebook: '笔记',

        // Record
        transactionHistory: '交易记录',
        noTransaction: '暂无交易记录',
        deleteConfirm: '确认删除',
        deleteDesc: '您要删除此项目吗？',
        delete: '删除',
        cancel: '取消',
        edit: '编辑',
        all: '全部',
        clear: '清除',
        confirm: '确定',
        anonymous: '匿名',

        // AddList
        addIncome: '添加收入',
        addExpense: '添加支出',
        addItem: '添加项目',
        editItem: '编辑项目',
        title: '标题',
        amount: '金额',
        date: '日期',
        category: '类别',
        type: '货币类型',
        listTypeTitle: '列表类型',
        accountTypeTitle: '账户类型',
        accountInBank: '银行账户',
        save: '保存',
        saveSuccess: '保存成功',
        saveSuccessDesc: '您的项目已成功保存。',
        amountAlert: '请输入金额',
        amountAlertDesc: '保存前请填写金额。',
        ok: '确定',
        selectListType: '请选择列表类型',
        saveError: '保存失败，请重试。',
        itemName: '项目名称',

        // Notebook
        noteTitle: '笔记标题',
        noteColor: '笔记颜色',
        addNote: '添加笔记',
        noNote: '暂无笔记',
        editNote: '编辑笔记',
        noteDetail: '详情（可选）',
        noteTitlePlaceholder: '输入标题...',
        noteDetailPlaceholder: '输入详细内容...',
        saveEdit: '保存修改',
        noteAlert: '请输入标题',
        noteAlertDesc: '保存前请填写标题。',

        // Confirm Popup
        deleteData: '删除数据',
        confirmDelete: '确认删除',
        confirmDeleteDesc: '您确定要删除此项目吗？删除后将无法恢复。',

        // Notifications (Warn)
        notifications: '通知',
        markAllRead: '全部已读',
        noNotification: '暂无通知',
        noNotificationDesc: '当您的账户有动态时，\n通知将显示在此处。',
        notifTransaction: '交易',
        notifBudget: '预算',
        notifReminder: '提醒',
        notifSystem: '系统',

        // Notification mock data
        notifTitle1: '支出记录成功',
        notifMsg1: '您记录了一笔购买食品 ฿150',
        notifTime1: '10 分钟',
        notifTitle2: '接近预算上限',
        notifMsg2: '"个人消费"类别还剩 ฿200',
        notifTime2: '1 小时',
        notifTitle3: '记录提醒',
        notifMsg3: '别忘了记录今天的收支',
        notifTime3: '2 小时',
        notifTitle4: '新收入',
        notifMsg4: '记录了工资收入 ฿5,000',
        notifTime4: '昨天',
        notifTitle5: '应用更新',
        notifMsg5: 'MyBank v1.0.0 已上线',
        notifTime5: '2 天',

        // Onboarding
        onboardingTitle: '初始设置',
        selectLanguage: '选择语言',
        selectCurrency: '选择货币',
        next: '下一步',
        welcomeTitle: '欢迎！🎉',
        welcomeDesc: '感谢您选择 FakeWalletHub\n您的智能收支管理工具',
        github: 'GitHub',
        contact: '联系我们',
        getStarted: '开始使用',
    },
    ja: {
        // Nav
        about: 'について',
        settings: '設定',
        language: '言語',
        darkMode: 'ダークモード',
        lightMode: 'ライトモード',
        theme: 'テーマ',
        currency: '通貨',
        editCategory: 'カテゴリを編集',
        editNewName: '新しい名前を編集',

        // Home
        bank: '銀行',
        cash: '現金',
        netProfit: '純利益',
        balance: '残高',
        income: '収入',
        expense: '支出',
        monthlyData: '月間データ',
        totalRatio: '総比率',
        expenseByCat: 'カテゴリ別支出',

        // Categories
        essentials: '必需品',
        wants: '個人消費',
        investment: '投資',
        savings: '貯蓄',

        // About
        aboutTitle: 'MyBankについて',
        aboutDesc: '収入と支出を記録・分析するアプリ',
        version: 'バージョン',
        close: '閉じる',

        // Footer
        home: 'ホーム',
        record: '記録',
        add: '追加',
        notebook: 'ノート',

        // Record
        transactionHistory: '取引履歴',
        noTransaction: '取引はまだありません',
        deleteConfirm: '削除確認',
        deleteDesc: 'この項目を削除しますか？',
        delete: '削除',
        cancel: 'キャンセル',
        edit: '編集',
        all: 'すべて',
        clear: 'クリア',
        confirm: '確認',
        anonymous: '匿名',

        // AddList
        addIncome: '収入を追加',
        addExpense: '支出を追加',
        addItem: 'アイテムを追加',
        editItem: 'アイテムを編集',
        title: 'タイトル',
        amount: '金額',
        date: '日付',
        category: 'カテゴリ',
        type: '通貨タイプ',
        listTypeTitle: 'リストタイプ',
        accountTypeTitle: 'アカウントタイプ',
        accountInBank: '銀行口座',
        save: '保存',
        saveSuccess: '保存しました',
        saveSuccessDesc: 'アイテムが正常に保存されました。',
        amountAlert: '金額を入力してください',
        amountAlertDesc: '保存する前に金額を入力してください。',
        ok: 'OK',
        selectListType: 'リストタイプを選択してください',
        saveError: '保存に失敗しました。もう一度お試しください。',
        itemName: 'アイテム名',

        // Notebook
        noteTitle: 'ノートタイトル',
        noteColor: 'ノートカラー',
        addNote: 'ノートを追加',
        noNote: 'メモはまだありません',
        editNote: 'ノートを編集',
        noteDetail: '詳細（任意）',
        noteTitlePlaceholder: 'タイトルを入力...',
        noteDetailPlaceholder: '追加の詳細を入力...',
        saveEdit: '変更を保存',
        noteAlert: 'タイトルを入力してください',
        noteAlertDesc: '保存する前にタイトルを入力してください。',

        // Confirm Popup
        deleteData: 'データ削除',
        confirmDelete: '削除確認',
        confirmDeleteDesc: 'この項目を削除してもよろしいですか？削除すると元に戻せません。',

        // Notifications (Warn)
        notifications: '通知',
        markAllRead: 'すべて既読',
        noNotification: '通知はありません',
        noNotificationDesc: 'アカウントに動きがあると、\nここに通知が表示されます。',
        notifTransaction: '取引',
        notifBudget: '予算',
        notifReminder: 'リマインダー',
        notifSystem: 'システム',

        // Notification mock data
        notifTitle1: '支出を記録しました',
        notifMsg1: '食品の購入 ฿150 を記録しました',
        notifTime1: '10 分',
        notifTitle2: '予算上限に近づいています',
        notifMsg2: '「個人消費」カテゴリの残り ฿200',
        notifTime2: '1 時間',
        notifTitle3: '記録リマインダー',
        notifMsg3: '今日の収支を記録するのをお忘れなく',
        notifTime3: '2 時間',
        notifTitle4: '新しい収入',
        notifMsg4: '給与からの収入 ฿5,000 を記録しました',
        notifTime4: '昨日',
        notifTitle5: 'アプリ更新',
        notifMsg5: 'MyBank v1.0.0 が利用可能になりました',
        notifTime5: '2 日前',

        // Onboarding
        onboardingTitle: '初期設定',
        selectLanguage: '言語を選択',
        selectCurrency: '通貨を選択',
        next: '次へ',
        welcomeTitle: 'ようこそ！🎉',
        welcomeDesc: 'FakeWalletHubをお選びいただきありがとうございます\nスマート収支管理ツール',
        github: 'GitHub',
        contact: 'お問い合わせ',
        getStarted: '始める',
    },
};

// Date locale mapping
export const DATE_LOCALES = {
    th: 'th-TH',
    en: 'en-US',
    zh: 'zh-CN',
    ja: 'ja-JP',
};

// Language provider component
export const LanguageProvider = ({ children }) => {
    const [currentLang, setCurrentLang] = useState('th');
    const [isLanguageReady, setIsLanguageReady] = useState(false);

    // Load language preference from storage on app start
    useEffect(() => {
        loadLanguagePreference();
    }, []);

    // Load language preference from storage
    const loadLanguagePreference = async () => {
        try {
            const savedLang = await AsyncStorage.getItem('appLanguage');
            if (savedLang && LANGUAGES[savedLang]) {
                setCurrentLang(savedLang);
            }
        } catch (error) {
            console.log('Error loading language preference:', error);
        } finally {
            setIsLanguageReady(true);
        }
    };

    // Change language
    const changeLanguage = (langCode) => {
        if (LANGUAGES[langCode]) {
            setCurrentLang(langCode);
            try {
                AsyncStorage.setItem('appLanguage', langCode);
            } catch (error) {
                console.log('Error saving language preference:', error);
            }
        }
    };

    // Get translation string
    const t = (key) => {
        return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['th']?.[key] || key;
    };

    // Get date locale string
    const getDateLocale = () => DATE_LOCALES[currentLang] || 'th-TH';

    // Format date according to current language
    const formatDateByLang = (dateStr) => {
        try {
            const date = new Date(dateStr + 'T00:00:00');
            
            // Manual formatting for Chinese and Japanese to avoid Android Intl fallback bugs
            if (currentLang === 'zh' || currentLang === 'ja') {
                return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
            }

            return date.toLocaleDateString(getDateLocale(), {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Format month+year for display
    const formatMonthYear = () => {
        try {
            const date = new Date();
            
            if (currentLang === 'zh' || currentLang === 'ja') {
                return `${date.getFullYear()}年${date.getMonth() + 1}月`;
            }

            return date.toLocaleDateString(getDateLocale(), {
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return '';
        }
    };

    // Language object
    const language = {
        currentLang,
        changeLanguage,
        t,
        languages: LANGUAGES,
        langInfo: LANGUAGES[currentLang],
        isLanguageReady,
        getDateLocale,
        formatDateByLang,
        formatMonthYear,
    };

    return (
        <LanguageContext.Provider value={language}>
            {children}
        </LanguageContext.Provider>
    );
};
