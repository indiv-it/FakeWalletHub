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
        aboutTitle: 'เกี่ยวกับ FakeWalletHub',
        aboutDesc: 'แอปสำหรับบันทึกและวิเคราะห์รายรับ-รายจ่ายของคุณ',
        aboutDescFull: 'FakeWalletHub คือเครื่องมือจัดการการเงินส่วนบุคคลที่ออกแบบมาเพื่อช่วยให้คุณติดตามรายรับและรายจ่ายได้อย่างง่ายดาย ด้วยอินเทอร์เฟซที่สวยงามและใช้งานง่าย ช่วยให้คุณวางแผนการออมและบรรลุเป้าหมายทางการเงินได้รวดเร็วยิ่งขึ้น',
        developer: 'พัฒนาโดย',
        license: 'ลิขสิทธิ์ซอฟต์แวร์',
        contact: 'ติดต่อเรา',
        github: 'GitHub',
        version: 'เวอร์ชัน',
        close: 'ปิด',
        editIcon: 'เลือกไอคอน',
        selectIcon: 'เลือกไอคอนสำหรับหมวดหมู่',

        // Footer
        home: 'หน้าหลัก',
        record: 'ประวัติ',
        add: 'เพิ่มรายการแรกของคุณ',
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
        search: 'ค้นหา',

        // AddList
        addIncome: 'เพิ่มรายรับ',
        addExpense: 'เพิ่มรายจ่าย',
        addItem: 'เพิ่มรายการ',
        editItem: 'แก้ไขรายการ',
        title: 'รายการ',
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
        selectListTypeAndCategory: 'กรุณาเลือกประเภทบัญชีหรือหมวดหมู่',
        selectListTypeAndCategoryDesc: 'กรุณาเลือกประเภทบัญชีหรือหมวดหมู่มาอย่างน้อย 1 อย่างก่อนบันทึก',

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
        notSpecified: 'ไม่ระบุ',
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
        aboutTitle: 'About FakeWalletHub',
        aboutDesc: 'App for recording and analyzing your income and expenses',
        aboutDescFull: 'FakeWalletHub is a personal finance tool designed to help you track income and expenses effortlessly. With a beautiful and intuitive interface, we help you plan savings and reach financial goals faster.',
        developer: 'Developed by',
        license: 'Software License',
        contact: 'Contact Us',
        github: 'GitHub',
        version: 'Version',
        close: 'Close',
        editIcon: 'Select Icon',
        selectIcon: 'Select an icon for this category',

        // Footer
        home: 'Home',
        record: 'Record',
        add: 'Add your first item',
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
        search: 'Search',

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
        selectListTypeAndCategory: 'Please select a account type or category',
        selectListTypeAndCategoryDesc: 'Please select at least 1 account type or category before saving',

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
        notSpecified: 'Not Specified',
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
        aboutTitle: '关于 FakeWalletHub',
        aboutDesc: '用于记录和分析您的收入和支出的应用程序',
        aboutDescFull: 'FakeWalletHub 是一款旨在帮助您轻松追踪收入和支出的个人理财工具。凭借精美直观的界面，我们协助您规划储蓄，更快速地实现财务目标。',
        developer: '开发者',
        license: '软件许可',
        contact: '联系我们',
        github: 'GitHub',
        version: '版本',
        close: '关闭',
        editIcon: '选择图标',
        selectIcon: '为该类别选择一个图标',

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
        search: '搜索',

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
        selectListTypeAndCategory: '请选择账户类型或类别',
        selectListTypeAndCategoryDesc: '请选择至少 1 个账户类型或类别后再保存',

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
        notSpecified: '未指定',
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
        aboutTitle: 'FakeWalletHubについて',
        aboutDesc: '収入と支出を記録・分析するアプリ',
        aboutDescFull: 'FakeWalletHubは、収支を簡単に追跡できるように設計された個人財務管理ツールです。美しく直感的なインターフェースで、貯蓄計画を立て、財務目標をより早く達成するお手伝いをします。',
        developer: '開発者',
        license: 'ソフトウェアライセンス',
        contact: 'お問い合わせ',
        github: 'GitHub',
        version: 'バージョン',
        close: '閉じる',
        editIcon: 'アイコンを選択',
        selectIcon: 'このカテゴリーのアイコンを選択してください',

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
        search: '検索',

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
        selectListTypeAndCategory: 'アカウントタイプまたはカテゴリを選択してください',
        selectListTypeAndCategoryDesc: 'アカウントタイプまたはカテゴリを少なくとも 1 つ選択してください',

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
        notSpecified: '未指定',
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
