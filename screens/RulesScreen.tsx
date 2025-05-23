// BarnebyAppNeu/screens/RulesScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { t } from '../i18n'; // Korrekter Import gemäß deiner Anweisung

type RulesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Rules'>;

interface Props {
  navigation: RulesScreenNavigationProp;
}

const RulesScreen: React.FC<Props> = ({ navigation }) => {
  console.log('[RulesScreen] GERENDERT');
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{t('rulesScreen.title', {defaultValue: "Game Rules"})}</Text>
      
      <Text style={styles.paragraph}>
        {t('rulesScreen.welcome', {defaultValue: 'Welcome to "The Arch-Enemy"! One player is secretly the Arch-Enemy, the others are Word-Knowers and know a secret word.'})}
      </Text>
      <Text style={styles.subHeader}>{t('rulesScreen.objectiveTitle', {defaultValue: 'Objective of the Game:'})}</Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>{t('roles.wordKnower', {defaultValue: "Word-Knowers"})}:</Text> {t('rulesScreen.objectiveWordKnower', {defaultValue: "Unmask the Arch-Enemy!"})}
      </Text>
      <Text style={styles.paragraph}>
        <Text style={styles.bold}>{t('roles.archEnemy', {defaultValue: "Arch-Enemy"})}:</Text> {t('rulesScreen.objectiveArchEnemy', {defaultValue: "Stay undetected. If you announce a guess for the secret word, the round ends."})}
      </Text>

      <Text style={styles.subHeader}>{t('rulesScreen.gameFlowTitle', {defaultValue: 'Gameplay:'})}</Text>
      <Text style={styles.paragraph}>
        1. <Text style={styles.bold}>{t('rulesScreen.step1Reveal', {defaultValue: "View Roles:"})}</Text> {t('rulesScreen.step1Detail', {defaultValue: "Everyone secretly views their role and, if applicable, the secret word."})}
      </Text>
      <Text style={styles.paragraph}>
        2. <Text style={styles.bold}>{t('rulesScreen.step2WordRound', {defaultValue: "Word Round:"})}</Text> {t('rulesScreen.step2Detail', {defaultValue: "In turns, each player says ONE word that fits the secret word. The Arch-Enemy must bluff and say a word that fits the (known to them) category without being too obvious."})}
      </Text>
      <Text style={styles.paragraph}>
        3. <Text style={styles.bold}>{t('rulesScreen.step3Discussion', {defaultValue: "Discussion:"})}</Text> {t('rulesScreen.step3Detail', {defaultValue: "Freely discuss who made themselves suspicious."})}
      </Text>
      <Text style={styles.paragraph}>
        4. <Text style={styles.bold}>{t('rulesScreen.step4ArchEnemyGuess', {defaultValue: "Arch-Enemy Guesses (Optional):"})}</Text> {t('rulesScreen.step4Detail', {defaultValue: "The Arch-Enemy can attempt to guess the secret word by pressing the button. This immediately ends the round and leads to the resolution."})}
      </Text>
       <Text style={styles.paragraph}>
        5. <Text style={styles.bold}>{t('rulesScreen.step5Resolution', {defaultValue: "Resolution:"})}</Text> {t('rulesScreen.step5Detail', {defaultValue: "After the time is up or the Arch-Enemy attempts a guess, it's revealed who the Arch-Enemy was and what the word is."})}
      </Text>
      
      {/* Das Beispiel wurde entfernt, um den Screen übersichtlicher zu halten, kann bei Bedarf wieder hinzugefügt werden */}

      <View style={styles.buttonContainer}>
        <Button title={t('setupScreen.title', {defaultValue: "Setup"})} onPress={() => navigation.replace('Setup')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, 
    paddingVertical: 30, // Mehr Platz oben/unten
    paddingHorizontal: 20,
    alignItems: 'flex-start', 
    backgroundColor: '#fdf6e3', 
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25, // Mehr Abstand
    color: '#657b83', 
    alignSelf: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20, // Mehr Abstand
    marginBottom: 10, // Mehr Abstand
    color: '#073642', 
  },
  paragraph: {
    fontSize: 17, // Etwas größer für Lesbarkeit
    marginBottom: 12,
    lineHeight: 26, // Angepasste Zeilenhöhe
    color: '#586e75', 
  },
  bold: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 40, // Mehr Abstand
    alignSelf: 'center', 
    width: '80%',
    maxWidth: 300,
  }
});

export default RulesScreen;