import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    Platform,
    Alert
} from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FileEdit, Trash2, ListPlus, X } from 'lucide-react-native';

import { SIZES, FONTS, CARD_SHADOW, COLORS } from '../style/Theme';
import { useTheme } from '../context/ThemeContext';
import Footer from '../components/Footer';
import ConfirmPopup from '../components/ConfirmPopup';
import { useNote } from '../context/NoteContext';
import { useLanguage } from '../context/LanguageContext';
import AlertPopup from '../components/AlertPopup';

const NOTE_COLORS = [
    '#FCA5A5', // Red
    '#FCD34D', // Yellow
    '#86EFAC', // Green
    '#93C5FD', // Blue
    '#C4B5FD', // Purple
    '#F9A8D4', // Pink
];

export default function Notebook() {
    const { colors } = useTheme();
    const { notes, addNote, editNote, deleteNote, isLoading } = useNote();
    const { t } = useLanguage();

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [popup, setPopup] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [popupAlert, setPopupAlert] = useState(false);

    const handleDeleteClick = (note) => {
        setNoteToDelete(note);
        setPopup(true);
    };

    const confirmDelete = async () => {
        if (noteToDelete) {
            await deleteNote(noteToDelete.id);
            setPopup(false);
            setNoteToDelete(null);
        }
    };

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [noteColor, setNoteColor] = useState(NOTE_COLORS[1]);

    // Date state
    const initialDate = new Date();
    const [dateTime, setDateTime] = useState(initialDate);
    const [dateText, setDateText] = useState(initialDate.toLocaleDateString());
    const [showDatePicker, setShowDatePicker] = useState(false);

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

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || dateTime;
        setShowDatePicker(Platform.OS === 'ios');
        setDateTime(currentDate);
        setDateText(currentDate.toLocaleDateString());
    };

    const renderNoteCard = ({ item }) => (
        <View style={[styles.noteCard, { backgroundColor: item.color }]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                        <FileEdit size={20} color="#1F2937" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteClick(item)} style={styles.actionBtn}>
                        <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.cardDate}>{item.date}</Text>

            {item.content ? (
                <Text style={styles.cardContent} numberOfLines={3}>{item.content}</Text>
            ) : null}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.textHeader, { color: colors.text }]}>{t('notebook')}</Text>

            <FlatList
                data={notes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderNoteCard}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    !isLoading && (
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.gray }]}>{t('noNote') || 'ยังไม่มีบันทึกช่วยจำ'}</Text>
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

            {/* Add / Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {isEditMode ? t('editNote') || 'แก้ไขบันทึก' : t('addNote')}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields */}
                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('noteTitle')}</Text>
                        <TextInput
                            style={[styles.textInput, { color: colors.text, backgroundColor: colors.background }]}
                            placeholder={t('noteTitlePlaceholder') || "พิมพ์หัวข้อ..."}
                            placeholderTextColor={colors.gray}
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('noteDetail') || 'รายละเอียด (ไม่บังคับ)'}</Text>
                        <TextInput
                            style={[
                                styles.textInput,
                                styles.textArea,
                                { color: colors.text, backgroundColor: colors.background }
                            ]}
                            placeholder={t('noteDetailPlaceholder') || "พิมพ์รายละเอียดเพิ่มเติม..."}
                            placeholderTextColor={colors.gray}
                            value={content}
                            onChangeText={setContent}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Date Picker */}
                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('date')}</Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            style={[styles.dateButton, { backgroundColor: colors.background }]}
                        >
                            <Text style={[styles.dateText, { color: colors.text }]}>{dateText}</Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={dateTime}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                            />
                        )}

                        {/* Color Picker */}
                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('noteColor')}</Text>
                        <View style={styles.colorPalette}>
                            {NOTE_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color },
                                        noteColor === color && styles.colorCircleSelected
                                    ]}
                                    onPress={() => setNoteColor(color)}
                                />
                            ))}
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: colors.accent }]}
                            onPress={handleSave}
                        >
                            <Text style={[styles.saveBtnText, { color: colors.background }]}>
                                {isEditMode ? t('saveEdit') || 'บันทึกการแก้ไข' : t('save')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Confirm Delete Popup */}
            <ConfirmPopup 
                visible={popup}
                onCancel={() => {
                    setPopup(false);
                    setNoteToDelete(null);
                }}
                onConfirm={confirmDelete}
            />

            <AlertPopup
                visible={popupAlert}
                title={t('ok') || "แจ้งเตือน"}
                description={t('amountAlertDesc') || "โปรดระบุข้อมูลให้ครบถ้วน"}
                onClose={() => {setPopupAlert(false)}}
                buttonText={t('ok')}
                type="warning"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    textHeader: {
        fontSize: SIZES.xl,
        fontWeight: FONTS.bold,
        marginTop: 30,
        marginBottom: 20,
        textAlign: "center",
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        marginTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: SIZES.base,
        fontWeight: FONTS.medium,
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        right: 20,
        bottom: 130,
        ...CARD_SHADOW,
    },
    // Card styles
    noteCard: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        ...CARD_SHADOW,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: SIZES.medium,
        fontWeight: FONTS.bold,
        color: '#1F2937',
        flex: 1,
        marginRight: 10,
    },
    cardActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        padding: 4,
    },
    cardDate: {
        fontSize: SIZES.small,
        color: '#4B5563',
        marginTop: 4,
        marginBottom: 8,
        fontWeight: FONTS.medium,
    },
    cardContent: {
        fontSize: SIZES.sm,
        color: '#374151',
        lineHeight: 20,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: SIZES.lg,
        fontWeight: FONTS.bold,
    },
    inputLabel: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.bold,
        marginBottom: 8,
        marginTop: 16,
    },
    textInput: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: SIZES.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 100,
        paddingTop: 16,
    },
    dateButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    dateText: {
        fontSize: SIZES.sm,
        fontWeight: FONTS.medium,
    },
    colorPalette: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    colorCircleSelected: {
        borderWidth: 3,
        borderColor: '#111827',
    },
    saveBtn: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    saveBtnText: {
        fontSize: SIZES.base,
        fontWeight: FONTS.bold,
    },
});
