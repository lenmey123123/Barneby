// BarnebyAppNeu/screens/GameScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button, TextInput, Alert } from 'react-native'; // TextInput, Alert hinzugefügt
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGame } from '../contexts/GameContext';
import { t } from '../i18n';
import { useIsFocused } from '@react-navigation/native';

type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;

interface Props {
  navigation: GameScreenNavigationProp;
}

const ADMIN_PIN = "2004"; // Admin PIN

const GameScreen: React.FC<Props> = ({ navigation }) => {
  const { gameState, startGameTimer, stopGameTimer, goToResolutionPhase, changeSecretWord } = useGame(); // changeSecretWord aus Context holen
  const { gamePhase, timerValue, isTimerRunning, currentSecretWord } = gameState;

  const isFocused = useIsFocused();
  const [stopButtonConfirm, setStopButtonConfirm] = useState(false);
  const pausedByButtonRef = useRef(false);
  const timerWasRunningBeforeStopConfirm = useRef(false);

  const [isAdminMenuVisible, setIsAdminMenuVisible] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false); // State für PIN-Modal
  const [pinInput, setPinInput] = useState(""); // State für PIN-Eingabe
  const [newWordInput, setNewWordInput] = useState(""); // State für neues Wort Eingabe

  // ... (useEffect Hooks für Timer und Navigation bleiben gleich) ...
  useEffect(() => {
    if (gamePhase === 'WordPhase' && isFocused && timerValue > 0) {
      if (!isTimerRunning && !stopButtonConfirm && !pausedByButtonRef.current) {
        startGameTimer();
      }
    } else if (gamePhase === 'WordPhase' && isTimerRunning && (!isFocused || timerValue === 0)) {
      stopGameTimer();
    }
  }, [gamePhase, isTimerRunning, isFocused, stopButtonConfirm, timerValue, startGameTimer, stopGameTimer]);

  useEffect(() => {
    if (gamePhase === 'Resolution' && isFocused) {
      navigation.replace('Resolution');
    }
  }, [gamePhase, navigation, isFocused]);


  const handleStopRoundPress = () => {
    if (timerValue === 0 && !stopButtonConfirm) return;
    if (!stopButtonConfirm) {
      setStopButtonConfirm(true);
      timerWasRunningBeforeStopConfirm.current = isTimerRunning;
      if (isTimerRunning) stopGameTimer();
      pausedByButtonRef.current = false;
    } else {
      stopGameTimer();
      goToResolutionPhase({ reasonKey: 'resolutionScreen.roundStoppedByPlayerConfirm' });
      setStopButtonConfirm(false);
      timerWasRunningBeforeStopConfirm.current = false;
      pausedByButtonRef.current = false;
    }
  };

  const handlePausePress = () => {
    if (timerValue === 0 && !stopButtonConfirm) return;
    if (stopButtonConfirm) {
      setStopButtonConfirm(false);
      pausedByButtonRef.current = false;
      if (timerWasRunningBeforeStopConfirm.current) startGameTimer();
      timerWasRunningBeforeStopConfirm.current = false;
    } else {
      if (isTimerRunning) {
        stopGameTimer();
        pausedByButtonRef.current = true;
      } else {
        if (gamePhase === 'WordPhase' && timerValue > 0) {
          pausedByButtonRef.current = false;
          startGameTimer();
        }
      }
    }
  };

   useEffect(() => {
      if (!isFocused) {
          setStopButtonConfirm(false);
          timerWasRunningBeforeStopConfirm.current = false;
      }
  }, [isFocused]);

  const handleAdminButtonPress = () => {
    setPinInput(""); // PIN-Eingabe zurücksetzen
    setIsPinModalVisible(true); // PIN-Modal öffnen
  };

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setIsPinModalVisible(false);
      setNewWordInput(currentSecretWord); // Vorbelegen mit aktuellem Wort
      setIsAdminMenuVisible(true);
    } else {
      Alert.alert(t('common.error', {defaultValue: "Error"}), t('gameScreen.adminPinIncorrect', {defaultValue: "Incorrect PIN."}));
      setPinInput("");
    }
  };

  const handleAdminRestartGame = () => {
    stopGameTimer();
    // ... (andere Resets) ...
    setIsAdminMenuVisible(false);
    navigation.replace('Setup');
  };

  const handleAdminEndRound = () => {
    stopGameTimer();
    goToResolutionPhase({ reasonKey: 'resolutionScreen.roundStoppedByAdmin' });
    // ... (andere Resets) ...
    setIsAdminMenuVisible(false);
  };

  const handleAdminChangeWord = () => {
    if (newWordInput.trim() === "") {
        Alert.alert(t('common.error', {defaultValue: "Error"}), t('gameScreen.adminErrorEmptyWord', {defaultValue: "New word cannot be empty."}));
        return;
    }
    changeSecretWord(newWordInput, 'GameScreen.AdminMenu');
    // Das Wort wird im Context aktualisiert, was einen Re-Render auslösen sollte,
    // der das neue Wort in newWordInput (falls noch im Admin-Menü) zeigt oder wenn man das Menü neu öffnet.
    // Es ist nicht nötig, setIsAdminMenuVisible(false) hier aufzurufen, es sei denn, das ist gewünscht.
  };


  const timerDisplayValue = timerValue > 0 ? timerValue : 0;
  let pauseResumeButtonTextKey = isTimerRunning ? 'gameScreen.pauseButton' : 'gameScreen.resumeButton';
  if (stopButtonConfirm) {
    pauseResumeButtonTextKey = 'gameScreen.cancelStopButton';
  }
  const stopRevealButtonText = stopButtonConfirm ? t('gameScreen.confirmStopButton') : t('gameScreen.stopRoundButton');

  return (
    <View style={styles.container}>
      {__DEV__ && (
        <TouchableOpacity
          style={styles.adminButton}
          onPress={handleAdminButtonPress} // Öffnet jetzt PIN-Modal
        >
          <Text style={styles.adminButtonText}>A</Text>
        </TouchableOpacity>
      )}

      {/* ... (Header, Timer, Instructions, Action Buttons bleiben gleich) ... */}
      <Text style={styles.header}>{t('gameScreen.title')}</Text>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          {timerDisplayValue}
        </Text>
      </View>
      <View style={styles.instructionsContainer}>
        {timerValue > 0 && isTimerRunning && !stopButtonConfirm && (
          <Text style={styles.instructionsText}>{t('gameScreen.discussPrompt')}</Text>
        )}
         {timerValue > 0 && !isTimerRunning && !stopButtonConfirm && pausedByButtonRef.current && (
            <Text style={styles.instructionsText}>{t('gameScreen.gamePaused')}</Text>
        )}
        {stopButtonConfirm && timerValue > 0 && (
             <Text style={styles.instructionsText}>{t('gameScreen.confirmStopPrompt')}</Text>
        )}
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
            style={[ styles.controlButton, styles.pauseButton, (timerValue === 0 && !stopButtonConfirm) && styles.disabledButton ]}
            onPress={handlePausePress}
            disabled={timerValue === 0 && !stopButtonConfirm}
        >
            <Text style={styles.actionButtonText}>{t(pauseResumeButtonTextKey)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
            style={[ styles.controlButton, styles.stopButton, (timerValue === 0 && !stopButtonConfirm) && styles.disabledButton, stopButtonConfirm && styles.actionButtonConfirm ]}
            onPress={handleStopRoundPress}
            disabled={timerValue === 0 && !stopButtonConfirm}
        >
            <Text style={styles.actionButtonText}>{stopRevealButtonText}</Text>
        </TouchableOpacity>
      </View>


      {/* PIN Eingabe Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPinModalVisible}
        onRequestClose={() => setIsPinModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{t('gameScreen.adminEnterPinTitle', {defaultValue: "Enter Admin PIN"})}</Text>
            <TextInput
              style={styles.pinInput}
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={pinInput}
              onChangeText={setPinInput}
              autoFocus={true}
            />
            <View style={styles.modalButtonRow}>
                <Button title={t('common.cancel', {defaultValue: "Cancel"})} onPress={() => setIsPinModalVisible(false)} color="#7f8c8d" />
                <Button title={t('common.submit', {defaultValue: "Submit"})} onPress={handlePinSubmit} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Admin-Menü Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAdminMenuVisible}
        onRequestClose={() => setIsAdminMenuVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{t('gameScreen.adminMenuTitle')}</Text>
            
            {/* Wort ändern Sektion */}
            <Text style={styles.label}>{t('gameScreen.adminChangeWordLabel', {defaultValue: "Change Secret Word:"})}</Text>
            <TextInput
                style={styles.wordInput}
                value={newWordInput}
                onChangeText={setNewWordInput}
                placeholder={t('gameScreen.adminNewWordPlaceholder', {defaultValue: "Enter new word"})}
            />
            <View style={styles.adminMenuButton}>
                <Button
                    title={t('gameScreen.adminApplyWordChange', {defaultValue: "Apply Word Change"})}
                    onPress={handleAdminChangeWord}
                    color="#27ae60"
                />
            </View>
            <View style={styles.separator} />


            <View style={styles.adminMenuButton}>
                <Button title={t('gameScreen.adminRestartGame')} onPress={handleAdminRestartGame} color="#3498db"/>
            </View>
            <View style={styles.adminMenuButton}>
                <Button title={t('gameScreen.adminEndRound')} onPress={handleAdminEndRound} color="#e74c3c"/>
            </View>
            <View style={styles.separator} />
            <View style={styles.adminMenuButton}>
                <Button title={t('common.close')} onPress={() => setIsAdminMenuVisible(false)} color="#7f8c8d"/>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles (mit Ergänzungen für PIN-Modal und Wortänderung)
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-around', padding: 20, backgroundColor: '#2c3e50' },
  adminButton: { position: 'absolute', top: 40, left: 15, backgroundColor: 'rgba(255,255,255,0.2)', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  adminButtonText: { color: 'white', fontWeight: 'bold' },
  header: { fontSize: 32, fontWeight: 'bold', color: '#ecf0f1', textAlign: 'center', marginBottom: 20 },
  timerContainer: { marginBottom: 30, minHeight: 90, justifyContent: 'center' },
  timerText: { fontSize: 72, fontWeight: 'bold', color: '#e74c3c' },
  instructionsContainer: { alignItems: 'center', marginHorizontal: 20, marginBottom: 30, minHeight: 60 },
  instructionsText: { fontSize: 18, textAlign: 'center', color: '#bdc3c7', marginBottom: 8 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '90%', maxWidth: 400, marginBottom: 20 },
  controlButton: { paddingVertical: 15, paddingHorizontal: 20, borderRadius: 30, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flex:1, marginHorizontal: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  pauseButton: { backgroundColor: '#f1c40f', borderColor: '#f39c12' },
  stopButton: { backgroundColor: '#e67e22', borderColor: '#d35400' },
  actionButtonConfirm: { backgroundColor: '#c0392b', borderColor: '#a93226' },
  actionButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  disabledButton: { backgroundColor: '#7f8c8d', borderColor: '#717070', opacity: 0.6 },
  
  modalCenteredView: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: "white", borderRadius: 20, padding: 25, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '85%', maxWidth: 400 },
  modalText: { marginBottom: 15, textAlign: "center", fontSize: 18, fontWeight: 'bold' },
  adminMenuButton: { width: '100%', marginTop: 8, marginBottom: 8 },
  
  pinInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    fontSize: 20,
    textAlign: 'center',
    width: 120,
    marginBottom: 20,
    letterSpacing: 10, // Für besseres Aussehen der PIN
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginTop: 10,
  },
  wordInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#eee',
    marginVertical: 15,
  }
});

export default GameScreen;