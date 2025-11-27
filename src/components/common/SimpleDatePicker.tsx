import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

interface SimpleDatePickerProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    initialDate?: string;
}

const SimpleDatePicker: React.FC<SimpleDatePickerProps> = ({
    visible,
    onClose,
    onSelectDate,
    initialDate,
}) => {
    const { t } = useTranslation();

    // Parse initial date or use today
    const parseDate = (dateStr?: string) => {
        if (dateStr) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return {
                    year: parseInt(parts[0]),
                    month: parseInt(parts[1]),
                    day: parseInt(parts[2]),
                };
            }
        }
        const today = new Date();
        return {
            year: today.getFullYear(),
            month: today.getMonth() + 1,
            day: today.getDate(),
        };
    };

    const initial = parseDate(initialDate);
    const [selectedYear, setSelectedYear] = useState(initial.year);
    const [selectedMonth, setSelectedMonth] = useState(initial.month);
    const [selectedDay, setSelectedDay] = useState(initial.day);

    const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month, 0).getDate();
    };
    const days = Array.from({ length: getDaysInMonth(selectedYear, selectedMonth) }, (_, i) => i + 1);

    const handleToday = () => {
        const today = new Date();
        setSelectedYear(today.getFullYear());
        setSelectedMonth(today.getMonth() + 1);
        setSelectedDay(today.getDate());
    };

    const handleConfirm = () => {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
        onSelectDate(dateStr);
        onClose();
    };

    const monthNames = [
        t('common.january'), t('common.february'), t('common.march'),
        t('common.april'), t('common.may'), t('common.june'),
        t('common.july'), t('common.august'), t('common.september'),
        t('common.october'), t('common.november'), t('common.december')
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center px-6">
                <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                    <Text className="text-heading-2 text-text-primary text-center mb-4 font-display">
                        {t('common.selectDate')}
                    </Text>

                    <View className="flex-row justify-between mb-6">
                        {/* Day */}
                        <View className="flex-1 mr-2">
                            <Text className="text-body-md text-text-secondary font-semibold mb-2 text-center font-display">
                                {t('common.day')}
                            </Text>
                            <ScrollView className="h-32 bg-gray-50 rounded-xl">
                                {days.map((day) => (
                                    <TouchableOpacity
                                        key={day}
                                        onPress={() => setSelectedDay(day)}
                                        className={`py-2 ${selectedDay === day ? 'bg-black' : ''}`}
                                    >
                                        <Text className={`text-center font-text ${selectedDay === day ? 'text-white font-semibold' : 'text-text-primary'}`}>
                                            {day}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Month */}
                        <View className="flex-1 mx-1">
                            <Text className="text-body-md text-text-secondary font-semibold mb-2 text-center font-display">
                                {t('common.month')}
                            </Text>
                            <ScrollView className="h-32 bg-gray-50 rounded-xl">
                                {months.map((month) => (
                                    <TouchableOpacity
                                        key={month}
                                        onPress={() => {
                                            setSelectedMonth(month);
                                            // Adjust day if it exceeds the new month's days
                                            const maxDays = getDaysInMonth(selectedYear, month);
                                            if (selectedDay > maxDays) {
                                                setSelectedDay(maxDays);
                                            }
                                        }}
                                        className={`py-2 ${selectedMonth === month ? 'bg-black' : ''}`}
                                    >
                                        <Text className={`text-center font-text text-xs ${selectedMonth === month ? 'text-white font-semibold' : 'text-text-primary'}`}>
                                            {monthNames[month - 1]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Year */}
                        <View className="flex-1 ml-2">
                            <Text className="text-body-md text-text-secondary font-semibold mb-2 text-center font-display">
                                {t('common.year')}
                            </Text>
                            <ScrollView className="h-32 bg-gray-50 rounded-xl">
                                {years.map((year) => (
                                    <TouchableOpacity
                                        key={year}
                                        onPress={() => setSelectedYear(year)}
                                        className={`py-2 ${selectedYear === year ? 'bg-black' : ''}`}
                                    >
                                        <Text className={`text-center font-text ${selectedYear === year ? 'text-white font-semibold' : 'text-text-primary'}`}>
                                            {year}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Today Button */}
                    <TouchableOpacity
                        onPress={handleToday}
                        className="bg-gray-100 rounded-xl py-3 mb-4"
                    >
                        <Text className="text-center text-text-primary font-semibold font-display">
                            {t('common.today')}
                        </Text>
                    </TouchableOpacity>

                    {/* Action Buttons */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 bg-gray-100 rounded-xl py-3"
                        >
                            <Text className="text-center text-text-secondary font-semibold font-display">
                                {t('common.cancel')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleConfirm}
                            className="flex-1 bg-black rounded-xl py-3"
                        >
                            <Text className="text-center text-white font-semibold font-display">
                                {t('common.confirm')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SimpleDatePicker;
