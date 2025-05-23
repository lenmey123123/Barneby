// BarnebyAppNeu/screens/ResolutionScreen.tsx
import React, { useState } from 'react'; // useEffect entfernt, da nicht mehr für Auto-Reveal benötigt
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGame } from '../contexts/GameContext';
import { t } from '../i18n';

type ResolutionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Resolution'>;

interface Props {
  navigation: ResolutionScreenNavigationProp;
}

const ResolutionScreen: React.FC<Props> = ({ navigation }) => {
  const { gameState } = useGame();
  const { players, currentSecretWord, roundEndReason } = gameState; // roundEndReason wird jetzt verwendet

  const [showSecretWord, setShowSecretWord] = useState(false);
  const [showArchEnemies, setShowArchEnemies] = useState(false);

  const erzfeinde = players && Array.isArray(players) ? players.filter(player => player.role === 'Erzfeind') : [];
  const erzfeindNamen = erzfeinde.length > 0 ? erzfeinde.map(player => player.name || "Unbekannt").join(' & ') : t('roles.archEnemyUnknown', {defaultValue: "Arch-Enemy not identified"});

  const secretWordText = currentSecretWord || t('resolutionScreen.unknownValue', {defaultValue: "Unknown"});
  
  // Der useEffect, der bei 'timeUpInfo' automatisch aufdeckt, wird entfernt,
  // um das Verhalten an den "Stop"-Button anzupassen (manuelles Aufdecken).

  const handlePlayAgain = () => {
    navigation.replace('Setup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('resolutionScreen.title', { defaultValue: "Game Over" })}</Text>
      
      {roundEndReason && ( // Zeige den Grund für das Rundenende an
        <Text style={styles.roundEndReasonText}>{roundEndReason}</Text>
      )}
      
      {/* Die Aufforderung zum Aufdecken ist jetzt immer sichtbar, da es keine automatische Aufdeckung mehr gibt */}
      <Text style={styles.infoTextCentered}>{t('resolutionScreen.revealInfoPrompt', {defaultValue: "Tap to reveal information:"})}</Text>

      <TouchableOpacity 
        style={[styles.revealButton, showSecretWord && styles.revealedButton]} 
        onPress={() => setShowSecretWord(true)}
        disabled={showSecretWord}
      >
        <Text style={styles.revealButtonText}>
          {showSecretWord ? `${t('resolutionScreen.wordWas', {defaultValue: "Word:"})} ${secretWordText}` : t('resolutionScreen.revealWordButton', {defaultValue: "Reveal Secret Word"})}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.revealButton, showArchEnemies && styles.revealedButton]} 
        onPress={() => setShowArchEnemies(true)}
        disabled={showArchEnemies}
      >
        <Text style={styles.revealButtonText}>
          {showArchEnemies ? `${t('resolutionScreen.enemyWas', {defaultValue: "Arch-Enemy:"})} ${erzfeindNamen}` : t('resolutionScreen.revealArchEnemyButton', {defaultValue: "Reveal Arch-Enemy/Enemies"})}
        </Text>
      </TouchableOpacity>

      {(showSecretWord && showArchEnemies) && (
        <View style={styles.playAgainContainer}>
          <Button title={t('resolutionScreen.playAgain', { defaultValue: "Play Again" })} onPress={handlePlayAgain} color="#27ae60"/>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#34495e' },
  header: { fontSize: 34, fontWeight: 'bold', marginBottom: 15, color: '#ecf0f1', textAlign: 'center' }, // marginBottom angepasst
  roundEndReasonText: { fontSize: 16, color: '#bdc3c7', textAlign: 'center', marginBottom: 15, fontStyle: 'italic' }, // Hinzugefügt
  infoTextCentered: { fontSize: 18, color: '#bdc3c7', textAlign: 'center', marginBottom: 20 },
  revealButton: { backgroundColor: '#3498db', paddingVertical: 18, paddingHorizontal: 25, borderRadius: 10, marginVertical: 10, width: '90%', maxWidth: 380, alignItems: 'center', borderWidth: 1, borderColor: '#2980b9' },
  revealedButton: { backgroundColor: '#2ecc71', borderColor: '#27ae60' },
  revealButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  playAgainContainer: { marginTop: 40, width: '80%', maxWidth: 300 }
});

export default ResolutionScreen;