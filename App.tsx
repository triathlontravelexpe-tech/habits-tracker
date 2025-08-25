import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface Habit {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  completedDates: string[];
  reminderTime?: string;
  hasReminder: boolean;
  selectedDays: number[]; // 0 = Dimanche, 1 = Lundi, ... 6 = Samedi
}

const HABITS_STORAGE_KEY = '@habits_tracker_habits';

const AVAILABLE_ICONS = ['💪', '📚', '💧', '🏃', '🧘', '🥗', '😴', '🎯', '🎨', '🎵', '📱', '🌱'];

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lundi', short: 'Lun' },
  { id: 2, name: 'Mardi', short: 'Mar' },
  { id: 3, name: 'Mercredi', short: 'Mer' },
  { id: 4, name: 'Jeudi', short: 'Jeu' },
  { id: 5, name: 'Vendredi', short: 'Ven' },
  { id: 6, name: 'Samedi', short: 'Sam' },
  { id: 0, name: 'Dimanche', short: 'Dim' },
];

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💪');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [currentView, setCurrentView] = useState<'main' | 'history'>('main');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]); // Tous les jours par défaut

  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    loadHabits();
  }, []);

  // Chargement des données
  const loadHabits = async () => {
    try {
      const habitsData = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      if (habitsData) {
        const parsedHabits: Habit[] = JSON.parse(habitsData);
        const today = new Date().toDateString();
        const todayDayOfWeek = new Date().getDay();
        
        const updatedHabits = parsedHabits.map(habit => ({
          ...habit,
          // Assurer la compatibilité avec les anciennes habitudes
          selectedDays: habit.selectedDays || [1, 2, 3, 4, 5, 6, 0],
          completed: habit.completedDates.includes(today),
        }));
        setHabits(updatedHabits);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des habitudes:', error);
    }
  };

  // Sauvegarde des données
  const saveHabits = async (habitsToSave: Habit[]) => {
    try {
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habitsToSave));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Ajouter une nouvelle habitude
  const addHabit = async () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        icon: selectedIcon,
        completed: false,
        completedDates: [],
        reminderTime: hasReminder ? reminderTime : undefined,
        hasReminder,
        selectedDays: selectedDays.length > 0 ? selectedDays : [1, 2, 3, 4, 5, 6, 0],
      };

      const updatedHabits = [...habits, newHabit];
      setHabits(updatedHabits);
      await saveHabits(updatedHabits);

      setNewHabitName('');
      setSelectedIcon('💪');
      setHasReminder(false);
      setReminderTime('09:00');
      setSelectedDays([1, 2, 3, 4, 5, 6, 0]);
      setModalVisible(false);
    }
  };

  // Basculer le statut d'une habitude
  const toggleHabit = async (id: string) => {
    const today = new Date().toDateString();
    const updatedHabits = habits.map(habit => {
      if (habit.id === id) {
        const isCurrentlyCompleted = habit.completedDates.includes(today);
        let newCompletedDates = [...habit.completedDates];

        if (isCurrentlyCompleted) {
          newCompletedDates = newCompletedDates.filter(date => date !== today);
        } else {
          newCompletedDates.push(today);
        }

        return {
          ...habit,
          completed: !isCurrentlyCompleted,
          completedDates: newCompletedDates,
        };
      }
      return habit;
    });

    setHabits(updatedHabits);
    await saveHabits(updatedHabits);
  };

  // Supprimer une habitude
  const deleteHabit = async (id: string) => {
    Alert.alert(
      'Supprimer l\'habitude',
      'Êtes-vous sûr de vouloir supprimer cette habitude ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            const updatedHabits = habits.filter(habit => habit.id !== id);
            setHabits(updatedHabits);
            await saveHabits(updatedHabits);
          },
        },
      ]
    );
  };

  // Calculer les statistiques (seulement les habitudes du jour)
  const getStats = () => {
    const todayDayOfWeek = new Date().getDay();
    const todayHabits = habits.filter(habit => habit.selectedDays.includes(todayDayOfWeek));
    const total = todayHabits.length;
    const completed = todayHabits.filter(h => h.completed).length;
    return { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Fonction pour basculer la sélection d'un jour
  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => {
      if (prev.includes(dayId)) {
        return prev.filter(d => d !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  // Filtrer les habitudes selon le jour actuel
  const getTodayHabits = () => {
    const todayDayOfWeek = new Date().getDay();
    return habits.filter(habit => habit.selectedDays.includes(todayDayOfWeek));
  };

  // Rendu d'un élément d'habitude
  const renderHabit = ({ item }: { item: Habit }) => {
    const todayDayOfWeek = new Date().getDay();
    const isActiveToday = item.selectedDays.includes(todayDayOfWeek);
    
    return (
      <View style={[
        styles.habitItem, 
        { 
          backgroundColor: theme.cardBackground,
          opacity: isActiveToday ? 1 : 0.5
        }
      ]}>
        <TouchableOpacity
          style={styles.habitContent}
          onPress={() => isActiveToday && toggleHabit(item.id)}
          activeOpacity={0.7}
          disabled={!isActiveToday}
        >
          <View style={styles.habitLeft}>
            <Text style={styles.habitIcon}>{item.icon}</Text>
            <View style={styles.habitInfo}>
              <Text style={[styles.habitName, { color: theme.text }]}>{item.name}</Text>
              <View style={styles.habitDays}>
                {DAYS_OF_WEEK.filter(day => item.selectedDays.includes(day.id)).map(day => (
                  <Text key={day.id} style={[
                    styles.dayBadge, 
                    { 
                      color: day.id === todayDayOfWeek ? theme.primary : theme.textSecondary,
                      fontWeight: day.id === todayDayOfWeek ? 'bold' : 'normal'
                    }
                  ]}>
                    {day.short}
                  </Text>
                ))}
              </View>
              {item.hasReminder && (
                <Text style={[styles.reminderText, { color: theme.textSecondary }]}>
                  🔔 {item.reminderTime}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.habitRight}>
            {isActiveToday && (
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: item.completed ? '#4CAF50' : 'transparent',
                    borderColor: item.completed ? '#4CAF50' : theme.border,
                  },
                ]}
              >
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
            )}
            {!isActiveToday && (
              <Text style={[styles.notTodayText, { color: theme.textSecondary }]}>
                Pas aujourd'hui
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteHabit(item.id)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Rendu de la vue principale
  const renderMainView = () => {
    const stats = getStats();
    
    return (
      <View style={styles.container}>
        <View style={[styles.statsContainer, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.statsTitle, { color: theme.text }]}>
            Aujourd'hui
          </Text>
          <Text style={[styles.statsText, { color: theme.textSecondary }]}>
            {stats.completed} sur {stats.total} habitudes complétées
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${stats.percentage}%` },
              ]}
            />
          </View>
          <Text style={[styles.percentage, { color: theme.primary }]}>
            {stats.percentage}%
          </Text>
        </View>

        <FlatList
          data={habits}
          renderItem={renderHabit}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.habitsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Aucune habitude ajoutée.
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Appuyez sur + pour commencer !
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.habitListHeader}>
              <Text style={[styles.sectionHeaderText, { color: theme.text }]}>
                Habitudes du jour ({new Date().toLocaleDateString('fr-FR', { weekday: 'long' })})
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Rendu de la vue historique
  const renderHistoryView = () => {
    const getDatesInMonth = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const dates = [];
      const lastDay = new Date(year, month + 1, 0).getDate();
      
      for (let i = 1; i <= lastDay; i++) {
        dates.push(new Date(year, month, i));
      }
      return dates;
    };

    const dates = getDatesInMonth();
    const today = new Date().toDateString();

    return (
      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Historique - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        
        <ScrollView style={styles.calendarContainer}>
          <View style={styles.calendar}>
            {dates.map(date => {
              const dateStr = date.toDateString();
              const habitsCompletedToday = habits.filter(h => 
                h.completedDates.includes(dateStr)
              ).length;
              const totalHabits = habits.length;
              const completionRate = totalHabits > 0 ? habitsCompletedToday / totalHabits : 0;
              
              return (
                <View
                  key={dateStr}
                  style={[
                    styles.calendarDay,
                    {
                      backgroundColor: dateStr === today 
                        ? theme.primary 
                        : completionRate === 1 
                          ? '#4CAF50' 
                          : completionRate > 0.5 
                            ? '#FFC107' 
                            : completionRate > 0 
                              ? '#FF9800'
                              : theme.cardBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayText,
                      {
                        color: dateStr === today || completionRate > 0.5 ? 'white' : theme.text,
                      },
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {habitsCompletedToday > 0 && (
                    <Text
                      style={[
                        styles.calendarDayCount,
                        {
                          color: dateStr === today || completionRate > 0.5 ? 'white' : theme.textSecondary,
                        },
                      ]}
                    >
                      {habitsCompletedToday}/{totalHabits}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />

        {/* Barre de navigation */}
        <View style={[styles.tabBar, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity
            style={[styles.tabItem, currentView === 'main' && { backgroundColor: theme.primary }]}
            onPress={() => setCurrentView('main')}
          >
            <Text style={[
              styles.tabText, 
              { color: currentView === 'main' ? 'white' : theme.textSecondary }
            ]}>
              🏠 Accueil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, currentView === 'history' && { backgroundColor: theme.primary }]}
            onPress={() => setCurrentView('history')}
          >
            <Text style={[
              styles.tabText, 
              { color: currentView === 'history' ? 'white' : theme.textSecondary }
            ]}>
              📅 Historique
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.themeToggle}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={{ fontSize: 20 }}>
              {isDarkMode ? "☀️" : "🌙"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenu principal */}
        {currentView === 'main' ? renderMainView() : renderHistoryView()}

        {/* Modal d'ajout d'habitude */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Nouvelle habitude
              </Text>

              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.background, 
                  color: theme.text,
                  borderColor: theme.border 
                }]}
                placeholder="Nom de l'habitude"
                placeholderTextColor={theme.textSecondary}
                value={newHabitName}
                onChangeText={setNewHabitName}
              />

              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Jours de la semaine :
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Sélectionnez les jours où vous voulez pratiquer cette habitude
              </Text>
              <View style={styles.daysSelector}>
                {DAYS_OF_WEEK.map(day => (
                  <TouchableOpacity
                    key={day.id}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: selectedDays.includes(day.id) 
                          ? theme.primary 
                          : theme.background,
                        borderColor: theme.border,
                      }
                    ]}
                    onPress={() => toggleDay(day.id)}
                  >
                    <Text style={[
                      styles.dayButtonText,
                      {
                        color: selectedDays.includes(day.id) 
                          ? 'white' 
                          : theme.text
                      }
                    ]}>
                      {day.short}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Choisir une icône :
              </Text>
              <ScrollView horizontal style={styles.iconSelector}>
                {AVAILABLE_ICONS.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.selectedIcon,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.reminderSection}>
                <View style={styles.reminderToggle}>
                  <Text style={[styles.reminderLabel, { color: theme.text }]}>
                    Rappel quotidien
                  </Text>
                  <Switch
                    value={hasReminder}
                    onValueChange={setHasReminder}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={hasReminder ? 'white' : '#f4f3f4'}
                  />
                </View>
                {hasReminder && (
                  <TextInput
                    style={[styles.timeInput, { 
                      backgroundColor: theme.background, 
                      color: theme.text,
                      borderColor: theme.border 
                    }]}
                    placeholder="09:00"
                    placeholderTextColor={theme.textSecondary}
                    value={reminderTime}
                    onChangeText={setReminderTime}
                  />
                )}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.addHabitButton, { backgroundColor: theme.primary }]}
                  onPress={addHabit}
                >
                  <Text style={styles.addButtonText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// Thèmes
const lightTheme = {
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  primary: '#007AFF',
  border: '#E9ECEF',
};

const darkTheme = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  primary: '#007AFF',
  border: '#333333',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeToggle: {
    marginLeft: 'auto',
    padding: 8,
  },
  header: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  habitsList: {
    paddingBottom: 80,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  habitContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 4,
  },
  dayBadge: {
    fontSize: 10,
    marginRight: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  notTodayText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  habitListHeader: {
    marginBottom: 16,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reminderText: {
    fontSize: 12,
    marginTop: 4,
  },
  habitRight: {
    marginLeft: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
    minWidth: 45,
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconSelector: {
    marginBottom: 20,
  },
  iconOption: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIcon: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  iconText: {
    fontSize: 24,
  },
  reminderSection: {
    marginBottom: 24,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  addHabitButton: {
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  calendarContainer: {
    flex: 1,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 8,
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarDayCount: {
    fontSize: 10,
    marginTop: 2,
  },
});
