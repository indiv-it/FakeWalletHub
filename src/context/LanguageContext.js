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

        // Categories
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

        // Notebook
        noteTitle: 'ชื่อโน้ต',
        noteColor: 'สีโน้ต',
        addNote: 'เพิ่มโน้ต',
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

        // Notebook
        noteTitle: 'Note Title',
        noteColor: 'Note Color',
        addNote: 'Add Note',
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

        // Notebook
        noteTitle: '笔记标题',
        noteColor: '笔记颜色',
        addNote: '添加笔记',
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

        // Notebook
        noteTitle: 'ノートタイトル',
        noteColor: 'ノートカラー',
        addNote: 'ノートを追加',
    },
};

// Language provider component
export const LanguageProvider = ({ children }) => {
    const [currentLang, setCurrentLang] = useState('th');

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

    // Language object
    const language = {
        currentLang,
        changeLanguage,
        t,
        languages: LANGUAGES,
        langInfo: LANGUAGES[currentLang],
    };

    return (
        <LanguageContext.Provider value={language}>
            {children}
        </LanguageContext.Provider>
    );
};
