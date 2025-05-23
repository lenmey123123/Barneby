// BarnebyAppNeu/screens/SetupScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator'; //
import { t } from '../i18n'; //
import { GameSettings } from '../types/gameTypes'; //
import { useGame } from '../contexts/GameContext'; //
import { DEFAULT_WORD_LISTS } from '../constants/wordLists'; //

type SetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Setup'>;

interface Props {
  navigation: SetupScreenNavigationProp;
}

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 12;

const SetupScreen: React.FC<Props> = ({ navigation }) => {
  const { initializeGame, gameState, setGameState } = useGame();

  const initialNumPlayers = gameState.numberOfPlayers > 0 && gameState.numberOfPlayers >= MIN_PLAYERS && gameState.numberOfPlayers <= MAX_PLAYERS
    ? gameState.numberOfPlayers
    : MIN_PLAYERS;

  const [numPlayers, setNumPlayers] = useState(initialNumPlayers);
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    const defaultPlayerPlaceholder = t('setupScreen.playerPlaceholder', { defaultValue: "Player " });
    // Erstelle ein Array der Länge initialNumPlayers
    let names = Array(initialNumPlayers).fill('');

    // Fülle mit gameState-Namen, falls vorhanden und gültig
    if (gameState.playerNames && gameState.playerNames.length > 0) {
        for (let i = 0; i < initialNumPlayers; i++) {
            if (gameState.playerNames[i] && gameState.playerNames[i].trim() !== '') {
                names[i] = gameState.playerNames[i];
            }
        }
    }
    // Setze Standardnamen für Spieler 1-3, falls deren Felder noch leer sind
    for (let i = 0; i < Math.min(initialNumPlayers, 3); i++) {
        if (names[i] === '') {
            names[i] = `${defaultPlayerPlaceholder}${i + 1}`;
        }
    }
    return names;
  });

  const [numErzfeinde, setNumErzfeinde] = useState<1 | 2>(gameState.numberOfErzfeinde || 1);
  const [roundTime, setRoundTime] = useState<30 | 60 | 120 | 180>(gameState.roundTimeInSeconds || 60);
  const [hintMode, setHintMode] = useState(gameState.hintModeEnabled || false);
  const [selectedCategory, setSelectedCategory] = useState<string>(gameState.selectedCategory || t('setupScreen.randomCategoryValue', { defaultValue: "Random"}));

  useEffect(() => {
    setPlayerNames(currentNames => {
      const newPlayerNames = Array(numPlayers).fill('');
      const defaultPlayerPlaceholder = t('setupScreen.playerPlaceholder', { defaultValue: "Player " });
      for (let i = 0; i < numPlayers; i++) {
        if (currentNames[i] !== undefined && currentNames[i].trim() !== '') {
          newPlayerNames[i] = currentNames[i]; // Behalte existierende, nicht-leere Namen
        } else if (i < 3) { // Für die ersten drei potenziellen Spieler-Slots
          newPlayerNames[i] = `${defaultPlayerPlaceholder}${i + 1}`; // Standardname
        } else {
          newPlayerNames[i] = ''; // Leerer String für weitere Spieler
        }
      }
      return newPlayerNames;
    });

    if (numPlayers < 6 && numErzfeinde === 2) {
      setNumErzfeinde(1);
    }
  }, [numPlayers, t]); // t als Abhängigkeit, da es im Effekt verwendet wird

  const handleNumPlayersChange = (increment: boolean) => {
    setNumPlayers(prevNumPlayers => {
      let newNum = increment ? prevNumPlayers + 1 : prevNumPlayers - 1;
      newNum = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, newNum));
      return newNum;
    });
  };

  const handlePlayerNameChange = (text: string, index: number) => {
    setPlayerNames(currentNames => {
      const newPlayerNames = [...currentNames];
      newPlayerNames[index] = text;
      return newPlayerNames;
    });
  };

  const handleStartGame = useCallback(() => {
    if (gameState.isLoading) return;

    const relevantPlayerNames = playerNames.slice(0, numPlayers);
    const defaultPlayerPlaceholder = t('setupScreen.playerPlaceholder', { defaultValue: "Player " });

    const finalPlayerNames = relevantPlayerNames.map((name, idx) =>
      name.trim() === '' ? `${defaultPlayerPlaceholder}${idx + 1}` : name.trim()
    );

    const settings: GameSettings = {
      numberOfPlayers: numPlayers,
      playerNames: finalPlayerNames,
      numberOfErzfeinde: numErzfeinde,
      roundTimeInSeconds: roundTime,
      hintModeEnabled: hintMode,
      selectedCategory: selectedCategory,
    };

    console.log("[SetupScreen] Starting game with settings:", settings);
    initializeGame(settings);
    navigation.navigate('RoleReveal');
  }, [numPlayers, playerNames, numErzfeinde, roundTime, hintMode, selectedCategory, initializeGame, navigation, gameState.isLoading, t]);


  const handleTestNavigateToGameScreen = () => { // Nur für Entwicklung, falls benötigt
    const defaultPlayerPlaceholder = t('setupScreen.playerPlaceholder', {defaultValue: "Player "});
    const testPlayerNames = Array.from({ length: numPlayers }, (_, i) => playerNames[i] || `${defaultPlayerPlaceholder}${i + 1}`);
    const tempSettings: GameSettings = {
        numberOfPlayers: numPlayers,
        playerNames: testPlayerNames,
        numberOfErzfeinde: numErzfeinde,
        roundTimeInSeconds: roundTime,
        hintModeEnabled: hintMode,
        selectedCategory: selectedCategory,
    };
    initializeGame(tempSettings);
    setTimeout(() => {
        setGameState(prev => ({
            ...prev,
            gamePhase: 'WordPhase',
            currentPlayerTurnForRoleReveal: prev.players.length,
        }));
        navigation.navigate('Game');
    }, 150);
  };

  const categoryOptions = [
    t('setupScreen.randomCategoryValue', { defaultValue: "Random" }),
    ...DEFAULT_WORD_LISTS.map(cat => cat.categoryName)
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{t('setupScreen.title')}</Text>

      {/* Spieleranzahl */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>{t('setupScreen.numberOfPlayers')}</Text>
        <View style={styles.controls}>
          <Button title="-" onPress={() => handleNumPlayersChange(false)} disabled={numPlayers <= MIN_PLAYERS} />
          <Text style={styles.valueText}>{numPlayers}</Text>
          <Button title="+" onPress={() => handleNumPlayersChange(true)} disabled={numPlayers >= MAX_PLAYERS} />
        </View>
      </View>

      {/* Spielernamen-Eingabefelder */}
      {Array.from({ length: numPlayers }).map((_, index) => (
        <TextInput
          key={`player-input-${index}`}
          style={styles.input}
          // Der Placeholder wird dynamisch, aber der Value kommt vom State, der die Standardnamen enthält
          placeholder={`${t('setupScreen.playerPlaceholder')}${index + 1}`}
          value={playerNames[index] || ''}
          onChangeText={(text) => handlePlayerNameChange(text, index)}
          placeholderTextColor="#aaa"
        />
      ))}

      {/* Anzahl Erzfeinde */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>{t('setupScreen.numberOfArchEnemies')}</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.optionButton, numErzfeinde === 1 && styles.optionButtonSelected]}
            onPress={() => setNumErzfeinde(1)}
          >
            <Text style={[styles.optionButtonText, numErzfeinde === 1 && styles.optionButtonTextSelected]}>{t('setupScreen.oneArchEnemy')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, numErzfeinde === 2 && styles.optionButtonSelected, numPlayers < 6 && styles.optionButtonDisabled]}
            onPress={() => setNumErzfeinde(2)}
            disabled={numPlayers < 6}
          >
            <Text style={[styles.optionButtonText, numErzfeinde === 2 && styles.optionButtonTextSelected, numPlayers < 6 && styles.optionButtonTextDisabled]}>{t('setupScreen.twoArchEnemies')}</Text>
          </TouchableOpacity>
        </View>
        {numPlayers < 6 && numErzfeinde === 2 && <Text style={styles.warningText}>{t('warnings.twoArchEnemiesDisabled')}</Text>}
      </View>

      {/* Rundenzeit */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>{t('setupScreen.roundTime')}</Text>
        <View style={styles.controls}>
          {[30, 60, 120, 180].map(time => (
            <TouchableOpacity
              key={time}
              style={[styles.optionButton, roundTime === time && styles.optionButtonSelected]}
              onPress={() => setRoundTime(time as 30 | 60 | 120 | 180)}
            >
              <Text style={[styles.optionButtonText, roundTime === time && styles.optionButtonTextSelected]}>
                {time === 30 && t('times.30s')}
                {time === 60 && t('times.1m')}
                {time === 120 && t('times.2m')}
                {time === 180 && t('times.3m')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Kategorieauswahl */}
      <View style={styles.settingRow}>
          <Text style={styles.label}>{t('setupScreen.selectCategory')}</Text>
          <View style={styles.categorySelector}>
              {categoryOptions.map((categoryName) => (
                  <TouchableOpacity
                      key={categoryName}
                      style={[
                          styles.categoryButton,
                          selectedCategory === categoryName && styles.categoryButtonSelected,
                      ]}
                      onPress={() => setSelectedCategory(categoryName)}
                  >
                      <Text style={[
                          styles.categoryButtonText,
                          selectedCategory === categoryName && styles.categoryButtonTextSelected
                      ]}>
                          {categoryName}
                      </Text>
                  </TouchableOpacity>
              ))}
          </View>
      </View>

      {/* Tipp-Modus */}
      <TouchableOpacity
        onPress={() => setHintMode(!hintMode)}
        style={[styles.hintButton, hintMode ? styles.hintButtonEnabled : styles.hintButtonDisabled]}
      >
        <Text style={styles.hintButtonText}>
          {hintMode ? t('setupScreen.hintModeOn') : t('setupScreen.hintModeOff')}
        </Text>
      </TouchableOpacity>

      {/* Spiel starten Button */}
      <View style={styles.buttonContainer}>
        <Button title={t('setupScreen.startGame')} onPress={handleStartGame} disabled={gameState.isLoading} color="#27ae60" />
      </View>
      {/* Regeln anzeigen Button */}
      <View style={styles.buttonContainer}>
        <Button title={t('setupScreen.navigateToRules')} onPress={() => navigation.navigate('Rules')} color="#3498db" />
      </View>

      {/* Test-Button (nur im Entwicklungsmodus, falls du ihn doch mal brauchst) */}
      {__DEV__ && (
        <View style={[styles.buttonContainer, { marginTop: 10, display: 'none' /* Standardmäßig ausblenden */ }]}>
          <Button title={t('common.testToSetup', {defaultValue: "TEST: To Game"})} onPress={handleTestNavigateToGameScreen} color="#e74c3c" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  settingRow: {
    width: '100%',
    maxWidth: 450,
    marginBottom: 18,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
    color: '#34495e',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  valueText: {
    fontSize: 18,
    marginHorizontal: 15,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    maxWidth: 450,
    height: 48,
    borderColor: '#bdc3c7',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
  },
  warningText: {
    fontSize: 13,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    width: '85%',
    maxWidth: 380,
    marginTop: 12,
    marginBottom: 5,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#3498db',
    marginHorizontal: 4, // Etwas horizontalen Abstand
    marginVertical: 4, // Vertikalen Abstand für Umbruch
    minWidth: 70,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#3498db',
  },
  optionButtonText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  optionButtonTextSelected: {
    color: '#ffffff',
  },
  optionButtonDisabled: {
    borderColor: '#bdc3c7',
    backgroundColor: '#ecf0f1',
  },
  optionButtonTextDisabled: {
      color: '#95a5a6',
  },
  hintButton: {
    width: '85%',
    maxWidth: 380,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  hintButtonEnabled: {
    backgroundColor: '#2ecc71',
    borderColor: '#27ae60',
  },
  hintButtonDisabled: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  hintButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Zentriert die Buttons, wenn sie umbrechen
    marginTop: 5,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#3498db', // Konsistente Farbe
    margin: 5,
  },
  categoryButtonSelected: {
    backgroundColor: '#3498db',
  },
  categoryButtonText: {
    color: '#3498db',
    fontSize: 14,
  },
  categoryButtonTextSelected: {
    color: '#ffffff',
  }
});

export default SetupScreen;