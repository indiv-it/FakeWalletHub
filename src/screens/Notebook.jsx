import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    Platform
} from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';

// --- Icons ---
import { FileEdit, Trash2, ListPlus, X, NotebookPen } from 'lucide-react-native';

// --- Theme & Context ---
import { horizontalScale, verticalScale, moderateScale } from '../utils/responsive';
import { SIZES, FONTS, CARD_SHADOW, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useNote } from '../context/NoteContext';

// --- Components ---
import Footer from '../components/Footer';
import ConfirmPopup from '../components/ConfirmPopup';
import AlertPopup from '../components/AlertPopup';

// --- Constants ---
const NOTE_COLORS = [
    '#FCA5A5', // Red
    '#FCD34D', // Yellow
    '#86EFAC', // Green
    '#93C5FD', // Blue
    '#C4B5FD', // Purple
    '#F9A8D4', // Pink
];

/**
* Notebook Screen Component
* Displays a grid/list of notes, and allows users to add, edit, or delete notes.
*/
export default function Notebook() {
    // --- Contexts ---
    const { colors } = useTheme();
    const { notes, addNote, editNote, deleteNote, isLoading } = useNote();
    const { t } = useLanguage();

    // --- State: Modal & Popups ---
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [popup, setPopup] = useState(false); // Delete confirmation popup
    const [popupAlert, setPopupAlert] = useState(false); // Validation error popup
    const [noteToDelete, setNoteToDelete] = useState(null);

    // --- State: Form Inputs ---
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [noteColor, setNoteColor] = useState(NOTE_COLORS[1]);

    // --- State: Date Picker ---
    const initialDate = new Date();
    const [dateTime, setDateTime] = useState(initialDate);
    const [dateText, setDateText] = useState(initialDate.toLocaleDateString());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // --- Handlers: Modal Actions ---

    /**
    * Opens modal in "Add" mode
    */
    const openAddModal = () => {
        setIsEditMode(false);
        setEditId(null);
        setTitle('');
        setContent('');
        setNoteColor(NOTE_COLORS[1]);
        setDateTime(new Date());
        setDateText(new Date().toLocaleDateString());
        setModalVisible(true);
    };

    /**
    * Opens modal in "Edit" mode with pre-filled data
    * @param {Object} note - Note to edit
    */
    const openEditModal = (note) => {
        setIsEditMode(true);
        setEditId(note.id);
        setTitle(note.title);
        setContent(note.content || '');
        setNoteColor(note.color);

        const noteDate = new Date(note.date + "T00:00:00");
        setDateTime(noteDate);
        setDateText(noteDate.toLocaleDateString());

        setModalVisible(true);
    };

    /**
    * Handles saving the note (add or edit)
    */
    const handleSave = async () => {
        if (!title.trim()) {
            setPopupAlert(true);
            return;
        }

        const dateStr = `${dateTime.getFullYear()}-${String(dateTime.getMonth() + 1).padStart(2, '0')}-${String(dateTime.getDate()).padStart(2, '0')}`;

        const noteData = {
            title,
            content,
            color: noteColor,
            date: dateStr,
            created_at: new Date().toISOString()
        };

        if (isEditMode) {
            await editNote(editId, noteData);
        } else {
            await addNote(noteData);
        }

        setModalVisible(false);
    };

    // --- Handlers: Delete Actions ---
    /**
    * Handles the delete button click, opening the confirmation popup
    * @param {Object} note - The note to delete
    */
    const handleDeleteClick = (note) => {
        setNoteToDelete(note);
        setPopup(true);
    };

    /**
    * Confirms and executes note deletion
    */
    const confirmDelete = async () => {
        if (noteToDelete) {
            await deleteNote(noteToDelete.id);
            setPopup(false);
            setNoteToDelete(null);
        }
    };

    // --- Handlers: Date Picker ---
    const onDateChange = (selectedDate) => {
        const currentDate = selectedDate || dateTime;
        setShowDatePicker(Platform.OS === 'ios');
        setDateTime(currentDate);
        setDateText(currentDate.toLocaleDateString());
    };

    // --- Renderers ---
    /**
    * Renders an individual note card
    */
    const renderNoteCard = ({ item }) => (
        <View style={[styles.noteCard, { backgroundColor: item.color }]}>
            {/* Header: Title and Actions */}
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                </Text>

                {/* Actions: Edit and Delete */}
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                        <FileEdit size={20} color="#1F2937" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteClick(item)} style={styles.actionBtn}>
                        <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content: Date and Details */}
            <Text style={styles.cardDate}>
                {item.date}
            </Text>
            {item.content ? (
                <Text style={styles.cardContent} numberOfLines={3}>
                    {item.content}
                </Text>
            ) : null}
        </View>
    );

    // --- Render Main screen ---
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header Component */}
            <View style={styles.headerContainer}>
                <NotebookPen size={20} color={colors.accent} />
                <Text style={[styles.textHeader, { color: colors.text }]}>
                    {t('notebook')}
                </Text>
            </View>

            {/* List of Notes */}
            <FlatList
                data={notes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNoteCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !isLoading && (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.gray }]}>
                                {t('noNote')}
                            </Text>
                        </View>
                    )
                }
            />

            {/* Floating Action Button */}
            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.accent }]}
                onPress={openAddModal}
                activeOpacity={0.8}
            >
                <ListPlus size={24} color={colors.background} />
            </TouchableOpacity>

            {/* Empty space for footer */}
            <View style={{ height: 80 }} />
            <Footer />

            {/* Add / Edit Note Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView
                    intensity={30}
                    tint="dark"
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: horizontalScale(10) }}>
                                <NotebookPen size={20} color={colors.accent} />
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    {isEditMode
                                        ? t('editNote')
                                        : t('addNote')
                                    }
                                </Text>
                            </View>

                            {/* Close Button */}
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Modal Form Fields */}
                        <Text style={[styles.inputLabel, { color: colors.text }]}>
                            {t('noteTitle')}
                        </Text>
                        <TextInput
                            placeholder={t('noteTitlePlaceholder')}
                            placeholderTextColor={colors.gray}
                            value={title}
                            onChangeText={setTitle}
                            style={[styles.textInput, {
                                color: colors.text,
                                backgroundColor: colors.background
                            }]}
                        />

                        {/* Content Input */}
                        <Text style={[styles.inputLabel, { color: colors.text }]}>
                            {t('noteDetail')}
                        </Text>
                        <TextInput
                            placeholder={t('noteDetailPlaceholder')}
                            placeholderTextColor={colors.gray}
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                            style={[
                                styles.textInput,
                                styles.textArea,
                                { color: colors.text, backgroundColor: colors.background }
                            ]}
                        />

                        {/* Date Picker Form */}
                        <Text style={[styles.inputLabel, { color: colors.text }]}>
                            {t('date')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={[styles.dateButton, { backgroundColor: colors.background }]}
                        >
                            <Text style={[styles.dateText, { color: colors.text }]}>
                                {dateText}
                            </Text>
                        </TouchableOpacity>

                        {/* Date Picker */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={dateTime}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                            />
                        )}

                        {/* Color Picker Form */}
                        <Text style={[styles.inputLabel, { color: colors.text }]}>
                            {t('noteColor')}
                        </Text>
                        <View style={styles.colorPalette}>
                            {NOTE_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color, borderColor: colors.cardBg },
                                        noteColor === color && styles.colorCircleSelected,
                                    ]}
                                    onPress={() => setNoteColor(color)}
                                />
                            ))}
                        </View>

                        {/* Save Action Button */}
                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                            onPress={handleSave}
                        >
                            <Text style={[styles.saveBtnText, { color: colors.background }]}>
                                {isEditMode
                                    ? t('saveEdit')
                                    : t('save')
                                }
                            </Text>
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </Modal>

            {/* Shared Popup Modals */}
            <ConfirmPopup
                visible={popup}
                onCancel={() => {
                    setPopup(false);
                    setNoteToDelete(null);
                }}
                onConfirm={confirmDelete}
            />

            {/* Alert Popup */}
            <AlertPopup
                visible={popupAlert}
                title={t('noteAlert')}
                description={t('noteAlertDesc')}
                onClose={() => { setPopupAlert(false) }}
                buttonText={t('ok')}
                type="warning"
            />
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: horizontalScale(20),
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: horizontalScale(10),
        marginTop: verticalScale(30),
        marginBottom: verticalScale(20),
    },
    textHeader: {
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
        textAlign: "center",
    },
    listContent: {
        paddingBottom: verticalScale(20),
    },
    emptyContainer: {
        marginTop: verticalScale(50),
        alignItems: 'center',
    },
    emptyText: {
        fontSize: SIZES.base,
        fontWeight: FONTS.medium,
    },
    fab: {
        position: 'absolute',
        width: horizontalScale(60),
        height: horizontalScale(60),
        borderRadius: moderateScale(30),
        justifyContent: 'center',
        alignItems: 'center',
        right: horizontalScale(20),
        bottom: verticalScale(130),
        ...CARD_SHADOW,
    },
    // Card styles
    noteCard: {
        padding: horizontalScale(16),
        borderRadius: moderateScale(16),
        marginBottom: verticalScale(16),
        ...CARD_SHADOW,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: moderateScale(18),
        fontWeight: FONTS.bold,
        color: '#1F2937',
        flex: 1,
        marginRight: horizontalScale(10),
    },
    cardActions: {
        flexDirection: 'row',
        gap: horizontalScale(12),
    },
    actionBtn: {
        padding: horizontalScale(4),
    },
    cardDate: {
        fontSize: moderateScale(12),
        color: '#4B5563',
        marginTop: verticalScale(4),
        marginBottom: verticalScale(8),
        fontWeight: FONTS.medium,
    },
    cardContent: {
        fontSize: SIZES.sm,
        color: '#374151',
        lineHeight: moderateScale(20),
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        padding: horizontalScale(24),
        paddingBottom: Platform.OS === 'ios' ? verticalScale(25) : verticalScale(55),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: FONTS.bold,
    },
    inputLabel: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        marginBottom: verticalScale(8),
        marginTop: verticalScale(16),
    },
    textInput: {
        height: verticalScale(50),
        borderRadius: moderateScale(12),
        paddingHorizontal: horizontalScale(16),
        fontSize: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: verticalScale(100),
        paddingTop: verticalScale(16),
    },
    dateButton: {
        height: verticalScale(50),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        paddingHorizontal: horizontalScale(16),
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dateText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.medium,
    },
    colorPalette: {
        flexDirection: 'row',
        gap: horizontalScale(12),
        flexWrap: 'wrap',
    },
    colorCircle: {
        width: horizontalScale(40),
        height: horizontalScale(40),
        borderRadius: moderateScale(20),
        borderWidth: 5,
    },
    colorCircleSelected: {
        borderWidth: 0,
    },
    saveBtn: {
        height: verticalScale(50),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(30),
    },
    saveBtnText: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
    },
});;
