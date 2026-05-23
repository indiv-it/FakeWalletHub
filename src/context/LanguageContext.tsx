import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Types ---
export interface LanguageInfo {
    code: string;
    name: string;
    flag: string;
    nativeName: string;
}

interface LanguageContextValue {
    currentLang: string;
    changeLanguage: (langCode: string) => void;
    t: (key: string) => string;
    languages: typeof LANGUAGES;
    langInfo: LanguageInfo;
    isLanguageReady: boolean;
    getDateLocale: () => string;
    formatDateByLang: (dateStr: string) => string;
    formatMonthYear: () => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const useLanguage = (): LanguageContextValue => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};

export const LANGUAGES: Record<string, LanguageInfo> = {
    th: { code: 'th', name: 'ไทย', flag: '🇹🇭', nativeName: 'ภาษาไทย' },
    en: { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    zh: { code: 'zh', name: '中文', flag: '🇨🇳', nativeName: '中文' },
    ja: { code: 'ja', name: '日本語', flag: '🇯🇵', nativeName: '日本語' },
};

type TranslationMap = Record<string, string>;
type Translations = Record<string, TranslationMap>;

const TRANSLATIONS: Translations = {
    th: {
        about: 'เกี่ยวกับ', settings: 'ตั้งค่า', language: 'ภาษา',
        darkMode: 'โหมดมืด', lightMode: 'โหมดสว่าง', theme: 'ธีม',
        currency: 'สกุลเงิน', editCategory: 'แก้ไขหมวดหมู่', editNewName: 'แก้ไขชื่อใหม่',
        bank: 'ธนาคาร', cash: 'เงินสด', netProfit: 'กำไรสุทธิ',
        balance: 'ยอดคงเหลือ', income: 'รายรับ', expense: 'รายจ่าย',
        monthlyData: 'ข้อมูลประจำเดือน', allTimeData: 'ข้อมูลทั้งหมด',
        totalRatio: 'สัดส่วนทั้งหมด', expenseByCat: 'สัดส่วนรายจ่ายหมวดหมู่',
        moneySumText: 'รายรับ-รายจ่ายทั้งหมด',
        essentials: 'เงินจำเป็น', wants: 'เงินตามใจ', investment: 'เงินลงทุน', savings: 'เงินออม',
        aboutTitle: 'เกี่ยวกับ FakeWalletHub',
        aboutDesc: 'แอปสำหรับบันทึกและวิเคราะห์รายรับ-รายจ่ายของคุณ',
        aboutDescFull: 'FakeWalletHub คือเครื่องมือจัดการการเงินส่วนบุคคลที่ออกแบบมาเพื่อช่วยให้คุณติดตามรายรับและรายจ่ายได้อย่างง่ายดาย ด้วยอินเทอร์เฟซที่สวยงามและใช้งานง่าย ช่วยให้คุณวางแผนการออมและบรรลุเป้าหมายทางการเงินได้รวดเร็วยิ่งขึ้น',
        developer: 'พัฒนาโดย', license: 'ลิขสิทธิ์ซอฟต์แวร์',
        contact: 'ติดต่อเรา', github: 'GitHub', version: 'เวอร์ชัน',
        close: 'ปิด', editIcon: 'เลือกไอคอน', selectIcon: 'เลือกไอคอนสำหรับหมวดหมู่',
        home: 'หน้าหลัก', record: 'ประวัติ', add: 'เพิ่มรายการแรกของคุณ', notebook: 'บันทึก',
        transactionHistory: 'ประวัติการทำรายการ', noTransaction: 'ยังไม่มีรายการ',
        deleteConfirm: 'ยืนยันลบรายการ', deleteDesc: 'คุณต้องการลบรายการนี้?',
        delete: 'ลบ', cancel: 'ยกเลิก', edit: 'แก้ไข', all: 'ทั้งหมด',
        clear: 'ล้าง', confirm: 'ตกลง', anonymous: 'ไม่ระบุชื่อ', search: 'ค้นหา',
        addIncome: 'เพิ่มรายรับ', addExpense: 'เพิ่มรายจ่าย',
        addItem: 'เพิ่มรายการ', editItem: 'แก้ไขรายการ',
        title: 'รายการ', amount: 'จำนวนเงิน', date: 'วันที่',
        category: 'หมวดหมู่', type: 'ประเภทเงิน',
        listTypeTitle: 'ประเภทของรายการ', accountTypeTitle: 'ประเภทบัญชี',
        accountInBank: 'เงินในบัญชี', save: 'บันทึก',
        saveSuccess: 'บันทึกสำเร็จ', saveSuccessDesc: 'รายการของคุณได้รับการบันทึกเรียบร้อยแล้ว',
        amountAlert: 'กรุณาระบุจำนวนเงิน', amountAlertDesc: 'โปรดกรอกจำนวนเงินก่อนบันทึกรายการ',
        ok: 'ตกลง', selectListType: 'กรุณาเลือกประเภทรายการ',
        saveError: 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่', itemName: 'ชื่อรายการ',
        selectListTypeAndCategory: 'กรุณาเลือกประเภทบัญชีหรือหมวดหมู่',
        selectListTypeAndCategoryDesc: 'กรุณาเลือกประเภทบัญชีหรือหมวดหมู่มาอย่างน้อย 1 อย่างก่อนบันทึก',
        noteTitle: 'ชื่อโน้ต', noteColor: 'สีโน้ต', addNote: 'เพิ่มโน้ต',
        noNote: 'ยังไม่มีบันทึกช่วยจำ', editNote: 'แก้ไขบันทึก',
        noteDetail: 'รายละเอียด (ไม่บังคับ)', noteTitlePlaceholder: 'พิมพ์หัวข้อ...',
        noteDetailPlaceholder: 'พิมพ์รายละเอียดเพิ่มเติม...', saveEdit: 'บันทึกการแก้ไข',
        noteAlert: 'กรุณาระบุหัวข้อ', noteAlertDesc: 'โปรดกรอกหัวข้อก่อนบันทึก',
        deleteData: 'ลบข้อมูล', confirmDelete: 'ยืนยันการลบ',
        confirmDeleteDesc: 'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? ถ้าลบแล้วจะไม่สามารถกู้คืนได้',
        onboardingTitle: 'ตั้งค่าเริ่มต้น', selectLanguage: 'เลือกภาษา',
        selectCurrency: 'เลือกสกุลเงิน', next: 'ถัดไป',
        welcomeTitle: 'ยินดีต้อนรับ!',
        welcomeDesc: 'ขอบคุณที่เลือกใช้ FakeWalletHub\nแอปจัดการรายรับ-รายจ่ายอัจฉริยะ',
        getStarted: 'เริ่มใช้งาน', notSpecified: 'ไม่ระบุ',
        notifications: 'แจ้งเตือน',
        savingsGoal: 'เป้าหมายการออม', savingsGoalAmount: 'จำนวนเงินเป้าหมาย',
        goalAmountZeroAlert: 'จำนวนเป้าหมายไม่ถูกต้อง',
        goalAmountZeroAlertDesc: 'เมื่อเปิดเป้าหมายการออม โปรดระบุจำนวนเงินเป้าหมายมากกว่า 0',
        howToUse: 'วิธีใช้งาน',
        howToUseTitle: 'วิธีใช้งาน FakeWalletHub',
        howToUseStep1Title: '🏠 หน้าหลัก (Home)',
        howToUseStep1Desc: 'แสดงยอดรวมรายรับ-รายจ่ายทั้งหมด แบ่งตามหมวดหมู่ และแสดงกราฟวงกลม กดที่กราฟเพื่อดูรายละเอียดเพิ่มเติม',
        howToUseStep2Title: '➕ เพิ่มรายการ',
        howToUseStep2Desc: 'กดปุ่ม + ที่แถบด้านล่าง กรอกจำนวนเงิน เลือกประเภท (รายรับ/รายจ่าย) เลือกบัญชี และหมวดหมู่ แล้วกด บันทึก',
        howToUseStep3Title: '📋 ประวัติ (Record)',
        howToUseStep3Desc: 'ดูรายการธุรกรรมทั้งหมด กรองตามประเภทหรือวันที่ กดที่รายการเพื่อแก้ไขหรือลบ',
        howToUseStep4Title: '📝 บันทึก (Notebook)',
        howToUseStep4Desc: 'จดบันทึกส่วนตัว เช่น เป้าหมาย หรือสิ่งที่ต้องการซื้อ กดปุ่ม + เพื่อเพิ่มโน้ตใหม่',
        howToUseStep5Title: '🏷️ แก้ไขหมวดหมู่',
        howToUseStep5Desc: 'เปิดเมนู → แก้ไขหมวดหมู่ เพื่อเปลี่ยนชื่อ ไอคอน หรือตั้งเป้าหมายการออมให้แต่ละหมวดหมู่',
    },
    en: {
        about: 'About', settings: 'Settings', language: 'Language',
        darkMode: 'Dark Mode', lightMode: 'Light Mode', theme: 'Theme',
        currency: 'Currency', editCategory: 'Edit Categories', editNewName: 'Edit new name',
        bank: 'Bank', cash: 'Cash', netProfit: 'Net Profit',
        balance: 'Balance', income: 'Income', expense: 'Expense',
        monthlyData: 'Monthly Data', allTimeData: 'All Time Data',
        totalRatio: 'Total Ratio', expenseByCat: 'Expense by Category',
        moneySumText: 'Total Income-Expense',
        essentials: 'Essentials', wants: 'Wants', investment: 'Investment', savings: 'Savings',
        aboutTitle: 'About FakeWalletHub',
        aboutDesc: 'App for recording and analyzing your income and expenses',
        aboutDescFull: 'FakeWalletHub is a personal finance tool designed to help you track income and expenses effortlessly. With a beautiful and intuitive interface, we help you plan savings and reach financial goals faster.',
        developer: 'Developed by', license: 'Software License',
        contact: 'Contact Us', github: 'GitHub', version: 'Version',
        close: 'Close', editIcon: 'Select Icon', selectIcon: 'Select an icon for this category',
        home: 'Home', record: 'Record', add: 'Add your first item', notebook: 'Notebook',
        transactionHistory: 'Transaction History', noTransaction: 'No transactions yet',
        deleteConfirm: 'Confirm Delete', deleteDesc: 'Do you want to delete this item?',
        delete: 'Delete', cancel: 'Cancel', edit: 'Edit', all: 'All',
        clear: 'Clear', confirm: 'Confirm', anonymous: 'Anonymous', search: 'Search',
        addIncome: 'Add Income', addExpense: 'Add Expense',
        addItem: 'Add Item', editItem: 'Edit Item',
        title: 'Title', amount: 'Amount', date: 'Date',
        category: 'Category', type: 'Money Type',
        listTypeTitle: 'List Type', accountTypeTitle: 'Account Type',
        accountInBank: 'In Bank', save: 'Save',
        saveSuccess: 'Saved Successfully', saveSuccessDesc: 'Your item has been successfully saved.',
        amountAlert: 'Please enter amount', amountAlertDesc: 'Please fill in the amount before saving.',
        ok: 'OK', selectListType: 'Please select a list type',
        saveError: 'Error saving. Please try again.', itemName: 'Item name',
        selectListTypeAndCategory: 'Please select a account type or category',
        selectListTypeAndCategoryDesc: 'Please select at least 1 account type or category before saving',
        noteTitle: 'Note Title', noteColor: 'Note Color', addNote: 'Add Note',
        noNote: 'No notes yet', editNote: 'Edit Note',
        noteDetail: 'Detail (optional)', noteTitlePlaceholder: 'Type a title...',
        noteDetailPlaceholder: 'Type additional details...', saveEdit: 'Save Changes',
        noteAlert: 'Please enter a title', noteAlertDesc: 'Please fill in the title before saving.',
        deleteData: 'Delete Data', confirmDelete: 'Confirm Delete',
        confirmDeleteDesc: 'Are you sure you want to delete this item? This action cannot be undone.',
        onboardingTitle: 'Get Started', selectLanguage: 'Select Language',
        selectCurrency: 'Select Currency', next: 'Next',
        welcomeTitle: 'Welcome!',
        welcomeDesc: 'Thank you for choosing FakeWalletHub\nYour smart income & expense manager',
        getStarted: 'Get Started', notSpecified: 'Not Specified',
        notifications: 'Notifications',
        savingsGoal: 'Savings Goal', savingsGoalAmount: 'Goal Amount',
        goalAmountZeroAlert: 'Invalid goal amount',
        goalAmountZeroAlertDesc: 'When savings goal is on, enter a goal amount greater than 0.',
        howToUse: 'How To Use',
        howToUseTitle: 'How To Use FakeWalletHub',
        howToUseStep1Title: '🏠 Home',
        howToUseStep1Desc: 'Shows total income/expense summary split by category with pie charts. Tap a chart for more details.',
        howToUseStep2Title: '➕ Add Transaction',
        howToUseStep2Desc: 'Tap the + button at the bottom bar. Fill in the amount, select type (income/expense), account type, and category. Then tap Save.',
        howToUseStep3Title: '📋 Record',
        howToUseStep3Desc: 'View all transaction history. Filter by type or date. Tap any item to edit or delete it.',
        howToUseStep4Title: '📝 Notebook',
        howToUseStep4Desc: 'Write personal notes such as goals or wish lists. Tap + to add a new note.',
        howToUseStep5Title: '🏷️ Edit Categories',
        howToUseStep5Desc: 'Open menu → Edit Categories to rename, change icon, or set a savings goal for each category.',
    },
    zh: {
        about: '关于', settings: '设置', language: '语言',
        darkMode: '深色模式', lightMode: '浅色模式', theme: '主题',
        currency: '货币', editCategory: '编辑类别', editNewName: '编辑新名称',
        bank: '银行', cash: '现金', netProfit: '净利润',
        balance: '余额', income: '收入', expense: '支出',
        monthlyData: '月度数据', allTimeData: '所有时间数据',
        totalRatio: '总比例', expenseByCat: '分类支出比例',
        moneySumText: '总收入-总支出',
        essentials: '必需品', wants: '个人消费', investment: '投资', savings: '储蓄',
        aboutTitle: '关于 FakeWalletHub',
        aboutDesc: '用于记录和分析您的收入和支出的应用程序',
        aboutDescFull: 'FakeWalletHub 是一款旨在帮助您轻松追踪收入和支出的个人理财工具。凭借精美直观的界面，我们协助您规划储蓄，更快速地实现财务目标。',
        developer: '开发者', license: '软件许可',
        contact: '联系我们', github: 'GitHub', version: '版本',
        close: '关闭', editIcon: '选择图标', selectIcon: '为该类别选择一个图标',
        home: '首页', record: '记录', add: '添加', notebook: '笔记',
        transactionHistory: '交易记录', noTransaction: '暂无交易记录',
        deleteConfirm: '确认删除', deleteDesc: '您要删除此项目吗？',
        delete: '删除', cancel: '取消', edit: '编辑', all: '全部',
        clear: '清除', confirm: '确定', anonymous: '匿名', search: '搜索',
        addIncome: '添加收入', addExpense: '添加支出',
        addItem: '添加项目', editItem: '编辑项目',
        title: '标题', amount: '金额', date: '日期',
        category: '类别', type: '货币类型',
        listTypeTitle: '列表类型', accountTypeTitle: '账户类型',
        accountInBank: '银行账户', save: '保存',
        saveSuccess: '保存成功', saveSuccessDesc: '您的项目已成功保存。',
        amountAlert: '请输入金额', amountAlertDesc: '保存前请填写金额。',
        ok: '确定', selectListType: '请选择列表类型',
        saveError: '保存失败，请重试。', itemName: '项目名称',
        selectListTypeAndCategory: '请选择账户类型或类别',
        selectListTypeAndCategoryDesc: '请选择至少 1 个账户类型或类别后再保存',
        noteTitle: '笔记标题', noteColor: '笔记颜色', addNote: '添加笔记',
        noNote: '暂无笔记', editNote: '编辑笔记',
        noteDetail: '详情（可选）', noteTitlePlaceholder: '输入标题...',
        noteDetailPlaceholder: '输入详细内容...', saveEdit: '保存修改',
        noteAlert: '请输入标题', noteAlertDesc: '保存前请填写标题。',
        deleteData: '删除数据', confirmDelete: '确认删除',
        confirmDeleteDesc: '您确定要删除此项目吗？删除后将无法恢复。',
        onboardingTitle: '初始设置', selectLanguage: '选择语言',
        selectCurrency: '选择货币', next: '下一步',
        welcomeTitle: '欢迎！',
        welcomeDesc: '感谢您选择 FakeWalletHub\n您的智能收支管理工具',
        getStarted: '开始使用', notSpecified: '未指定',
        notifications: '通知',
        savingsGoal: '储蓄目标', savingsGoalAmount: '目标金额',
        goalAmountZeroAlert: '目标金额无效',
        goalAmountZeroAlertDesc: '开启储蓄目标时，请输入大于 0 的目标金额。',
        howToUse: '使用指南',
        howToUseTitle: 'FakeWalletHub 使用指南',
        howToUseStep1Title: '🏠 首页',
        howToUseStep1Desc: '显示按类别分类的总收支摘要和饼图。点击图表可查看更多详情。',
        howToUseStep2Title: '➕ 添加交易',
        howToUseStep2Desc: '点击底部栏的 + 按钮，填写金额，选择类型（收入/支出）、账户类型和类别，然后点击保存。',
        howToUseStep3Title: '📋 记录',
        howToUseStep3Desc: '查看所有交易记录。按类型或日期筛选。点击任意项目进行编辑或删除。',
        howToUseStep4Title: '📝 笔记',
        howToUseStep4Desc: '记录个人笔记，如目标或心愿单。点击 + 添加新笔记。',
        howToUseStep5Title: '🏷️ 编辑类别',
        howToUseStep5Desc: '打开菜单 → 编辑类别，可重命名、更换图标或为每个类别设置储蓄目标。',
    },
    ja: {
        about: 'について', settings: '設定', language: '言語',
        darkMode: 'ダークモード', lightMode: 'ライトモード', theme: 'テーマ',
        currency: '通貨', editCategory: 'カテゴリを編集', editNewName: '新しい名前を編集',
        bank: '銀行', cash: '現金', netProfit: '純利益',
        balance: '残高', income: '収入', expense: '支出',
        monthlyData: '月間データ', allTimeData: '全期間データ',
        totalRatio: '総比率', expenseByCat: 'カテゴリ別支出',
        moneySumText: '総収入-総支出',
        essentials: '必需品', wants: '個人消費', investment: '投資', savings: '貯蓄',
        aboutTitle: 'FakeWalletHubについて',
        aboutDesc: '収入と支出を記録・分析するアプリ',
        aboutDescFull: 'FakeWalletHubは、収支を簡単に追跡できるように設計された個人財務管理ツールです。美しく直感的なインターフェースで、貯蓄計画を立て、財務目標をより早く達成するお手伝いをします。',
        developer: '開発者', license: 'ソフトウェアライセンス',
        contact: 'お問い合わせ', github: 'GitHub', version: 'バージョン',
        close: '閉じる', editIcon: 'アイコンを選択', selectIcon: 'このカテゴリーのアイコンを選択してください',
        home: 'ホーム', record: '記録', add: '追加', notebook: 'ノート',
        transactionHistory: '取引履歴', noTransaction: '取引はまだありません',
        deleteConfirm: '削除確認', deleteDesc: 'この項目を削除しますか？',
        delete: '削除', cancel: 'キャンセル', edit: '編集', all: 'すべて',
        clear: 'クリア', confirm: '確認', anonymous: '匿名', search: '検索',
        addIncome: '収入を追加', addExpense: '支出を追加',
        addItem: 'アイテムを追加', editItem: 'アイテムを編集',
        title: 'タイトル', amount: '金額', date: '日付',
        category: 'カテゴリ', type: '通貨タイプ',
        listTypeTitle: 'リストタイプ', accountTypeTitle: 'アカウントタイプ',
        accountInBank: '銀行口座', save: '保存',
        saveSuccess: '保存しました', saveSuccessDesc: 'アイテムが正常に保存されました。',
        amountAlert: '金額を入力してください', amountAlertDesc: '保存する前に金額を入力してください。',
        ok: 'OK', selectListType: 'リストタイプを選択してください',
        saveError: '保存に失敗しました。もう一度お試しください。', itemName: 'アイテム名',
        selectListTypeAndCategory: 'アカウントタイプまたはカテゴリを選択してください',
        selectListTypeAndCategoryDesc: 'アカウントタイプまたはカテゴリを少なくとも 1 つ選択してください',
        noteTitle: 'ノートタイトル', noteColor: 'ノートカラー', addNote: 'ノートを追加',
        noNote: 'メモはまだありません', editNote: 'ノートを編集',
        noteDetail: '詳細（任意）', noteTitlePlaceholder: 'タイトルを入力...',
        noteDetailPlaceholder: '追加の詳細を入力...', saveEdit: '変更を保存',
        noteAlert: 'タイトルを入力してください', noteAlertDesc: '保存する前にタイトルを入力してください。',
        deleteData: 'データ削除', confirmDelete: '削除確認',
        confirmDeleteDesc: 'この項目を削除してもよろしいですか？削除すると元に戻せません。',
        onboardingTitle: '初期設定', selectLanguage: '言語を選択',
        selectCurrency: '通貨を選択', next: '次へ',
        welcomeTitle: 'ようこそ！',
        welcomeDesc: 'FakeWalletHubをお選びいただきありがとうございます\nスマート収支管理ツール',
        getStarted: '始める', notSpecified: '未指定',
        notifications: '通知',
        savingsGoal: '貯蓄目標', savingsGoalAmount: '目標金額',
        goalAmountZeroAlert: '目標金額が無効です',
        goalAmountZeroAlertDesc: '貯蓄目標をオンにする場合は、0より大きい目標金額を入力してください。',
        howToUse: '使い方',
        howToUseTitle: 'FakeWalletHub の使い方',
        howToUseStep1Title: '🏠 ホーム',
        howToUseStep1Desc: 'カテゴリ別の収支合計と円グラフが表示されます。グラフをタップして詳細を確認できます。',
        howToUseStep2Title: '➕ 取引を追加',
        howToUseStep2Desc: '下部バーの + ボタンをタップ。金額を入力し、種類（収入/支出）、口座タイプ、カテゴリを選択して保存してください。',
        howToUseStep3Title: '📋 記録',
        howToUseStep3Desc: 'すべての取引履歴を表示します。種類や日付でフィルタリングできます。項目をタップして編集や削除ができます。',
        howToUseStep4Title: '📝 ノート',
        howToUseStep4Desc: 'ゴールや欲しいものリストなど、個人的なメモを書けます。+ をタップして新しいノートを追加できます。',
        howToUseStep5Title: '🏷️ カテゴリを編集',
        howToUseStep5Desc: 'メニュー → カテゴリを編集 で名前変更、アイコン変更、または各カテゴリへの貯蓄目標設定ができます。',
    },
};

export const DATE_LOCALES: Record<string, string> = {
    th: 'th-TH', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP',
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentLang, setCurrentLang] = useState('th');
    const [isLanguageReady, setIsLanguageReady] = useState(false);

    useEffect(() => { loadLanguagePreference(); }, []);

    const loadLanguagePreference = async () => {
        try {
            const savedLang = await AsyncStorage.getItem('appLanguage');
            if (savedLang && LANGUAGES[savedLang]) setCurrentLang(savedLang);
        } catch (error) {
            console.log('Error loading language preference:', error);
        } finally {
            setIsLanguageReady(true);
        }
    };

    const changeLanguage = (langCode: string) => {
        if (LANGUAGES[langCode]) {
            setCurrentLang(langCode);
            try { AsyncStorage.setItem('appLanguage', langCode); }
            catch (error) { console.log('Error saving language preference:', error); }
        }
    };

    const t = (key: string): string =>
        TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['th']?.[key] || key;

    const getDateLocale = (): string => DATE_LOCALES[currentLang] || 'th-TH';

    const formatDateByLang = (dateStr: string): string => {
        try {
            const date = new Date(dateStr + 'T00:00:00');
            if (currentLang === 'zh' || currentLang === 'ja') {
                return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
            }
            return date.toLocaleDateString(getDateLocale(), {
                day: 'numeric', month: 'short', year: 'numeric',
            });
        } catch { return dateStr; }
    };

    const formatMonthYear = (): string => {
        try {
            const date = new Date();
            if (currentLang === 'zh' || currentLang === 'ja') {
                return `${date.getFullYear()}年${date.getMonth() + 1}月`;
            }
            return date.toLocaleDateString(getDateLocale(), { month: 'long', year: 'numeric' });
        } catch { return ''; }
    };

    const language: LanguageContextValue = {
        currentLang, changeLanguage, t,
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
