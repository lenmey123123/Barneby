// BarnebyAppNeu/screens/RoleRevealScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'; // Animated, InteractionManager entfernt
import { StackNavigationProp } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useGame } from '../contexts/GameContext';
import { t } from '../i18n';

type RoleRevealScreenNavigationProp = StackNavigationProp<RootStackParamList, 'RoleReveal'>;

interface Props {
  navigation: RoleRevealScreenNavigationProp;
}

const RoleRevealScreen: React.FC<Props> = ({ navigation }) => {
  const { gameState, proceedToNextRoleReveal } = useGame();
  const { players, currentPlayerTurnForRoleReveal, currentCategory, gamePhase, hintModeEnabled } = gameState; // gamePhase direkt verwenden

  console.log(`[RoleRevealScreen SIMPLIFIED] RENDER. Index: ${currentPlayerTurnForRoleReveal}, Phase: ${gamePhase}, Players: ${players?.length}, Focused: ${useIsFocused()}`);

  const [isRoleDetailsVisible, setIsRoleDetailsVisible] = useState(false);
  // InteractionBlocked wird vorerst entfernt, um Komplexität zu reduzieren
  // const [isInteractionBlocked, setIsInteractionBlocked] = useState(true);

  const isFocused = useIsFocused();
  const navigationTriggeredRef = useRef(false);

  // Effekt zum Zurücksetzen der Sichtbarkeit für neuen Spieler
  useEffect(() => {
    console.log(`[RoleRevealScreen SIMPLIFIED] PLAYER_EFFECT. Index: ${currentPlayerTurnForRoleReveal}, Phase: ${gamePhase}, Focused: ${isFocused}`);
    if (isFocused && gamePhase === 'RoleReveal' && players && players.length > 0 && currentPlayerTurnForRoleReveal < players.length) {
      console.log(`[RoleRevealScreen SIMPLIFIED] Setting up for player index ${currentPlayerTurnForRoleReveal}. Resetting details visibility.`);
      setIsRoleDetailsVisible(false); // Rolle/Wort ist anfangs nicht sichtbar
      // setIsInteractionBlocked(false); // Interaktion wäre hier freigegeben
    }
  }, [currentPlayerTurnForRoleReveal, isFocused, gamePhase, players]);

  // Effekt für Navigation zum GameScreen
  useEffect(() => {
    console.log(`[RoleRevealScreen SIMPLIFIED] NAVIGATION_EFFECT. Phase: ${gamePhase}, Index: ${currentPlayerTurnForRoleReveal}, Players: ${players?.length}`);
    const readyToNavigate =
      isFocused &&
      !navigationTriggeredRef.current &&
      gamePhase === 'WordPhase' && // Überprüft direkt gamePhase aus dem Context
      players && players.length > 0 &&
      currentPlayerTurnForRoleReveal >= players.length;

    if (readyToNavigate) {
        if (!navigationTriggeredRef.current) {
          navigationTriggeredRef.current = true;
          console.log("[RoleRevealScreen SIMPLIFIED] NAVIGATING to GameScreen.");
          navigation.replace('Game');
        }
    }
  }, [gameState, navigation, isFocused]); // gameState als Abhängigkeit behalten

  const handleCardPress = () => {
    // if (isInteractionBlocked) return;
    console.log(`[RoleRevealScreen SIMPLIFIED] Card pressed by player index ${currentPlayerTurnForRoleReveal}. DetailsVisible: ${isRoleDetailsVisible}`);
    // setIsInteractionBlocked(true);

    if (!isRoleDetailsVisible) {
      setIsRoleDetailsVisible(true);
      // setIsInteractionBlocked(false);
    } else {
      // Wichtig: proceedToNextRoleReveal sollte den currentPlayerTurnForRoleReveal im Context ändern,
      // was dann den obigen useEffect zum Zurücksetzen von isRoleDetailsVisible auslöst.
      proceedToNextRoleReveal('RoleRevealScreen.handleCardPress (SIMPLIFIED)');
    }
  };

  // ----- Render Logic -----
  if (gameState.isLoading) {
    return <View style={styles.container}><Text style={styles.loadingText}>{t('common.loadingData')}</Text></View>;
  }
  if (!players || players.length === 0) {
    return <View style={styles.container}><Text style={styles.loadingText}>{t('errors.playerDisplayError', {defaultValue: "No player data."})}</Text></View>;
  }

  // Wenn alle Spieler durch sind und Phase noch RoleReveal (warten auf WordPhase)
  if (currentPlayerTurnForRoleReveal >= players.length && gamePhase === 'RoleReveal') {
    return <View style={styles.container}><Text style={styles.loadingText}>{t('roleRevealScreen.rolesDistributed')}</Text></View>;
  }
  // Wenn Phase WordPhase und alle Spieler durch (warten auf Navigation)
  if (gamePhase === 'WordPhase' && currentPlayerTurnForRoleReveal >= players.length) {
    return <View style={styles.container}><Text style={styles.loadingText}>{t('roleRevealScreen.startingGame')}</Text></View>;
  }

  // Wenn Index ungültig
  if (currentPlayerTurnForRoleReveal >= players.length || currentPlayerTurnForRoleReveal < 0) {
      console.error(`[RoleRevealScreen SIMPLIFIED] CRITICAL RENDER ERROR: Index ${currentPlayerTurnForRoleReveal} out of bounds for ${players.length} players in phase ${gamePhase}`);
      return <View style={styles.container}><Text style={[styles.loadingText, {color: 'red'}]}>{t('errors.internalError')}</Text></View>;
  }

  const currentPlayerForDisplay = players[currentPlayerTurnForRoleReveal];
  if (!currentPlayerForDisplay) {
    console.error(`[RoleRevealScreen SIMPLIFIED] CRITICAL RENDER ERROR: currentPlayerForDisplay UNDEFINED at index ${currentPlayerTurnForRoleReveal}.`);
    return <View style={styles.container}><Text style={[styles.loadingText, {color: 'red'}]}>{t('errors.playerDisplayError')}</Text></View>;
  }

  console.log(`[RoleRevealScreen SIMPLIFIED] Displaying card for player ${currentPlayerForDisplay.name} (Index: ${currentPlayerTurnForRoleReveal}). Details visible: ${isRoleDetailsVisible}`);

  return (
    <View style={styles.container}>
      {/* Die Karte wird jetzt immer gerendert, Sichtbarkeit der Details über State */}
      <View style={styles.cardContainer} key={`player-card-${currentPlayerTurnForRoleReveal}`}>
        <Text style={styles.infoTextTop}>{t('roleRevealScreen.passToPlayer', { playerName: currentPlayerForDisplay.name })}</Text>
        <TouchableOpacity
          onPress={handleCardPress}
          activeOpacity={0.9}
          style={styles.card}
          // disabled={isInteractionBlocked}
        >
          <Text style={styles.cardTextName}>{currentPlayerForDisplay.name}</Text>
          {!isRoleDetailsVisible && (
            <Text style={styles.cardHintText}>{t('roleRevealScreen.tapToSeeRole')}</Text>
          )}
          {isRoleDetailsVisible && ( // Details nur anzeigen, wenn isRoleDetailsVisible true ist
            <View style={styles.detailsContainer}>
              {currentPlayerForDisplay.role === 'Erzfeind' ? (
                <Text style={[styles.cardTextRole, styles.erzfeindText]}>{t('roles.archEnemy')}</Text>
              ) : (
                <Text style={styles.cardTextWord}>{currentPlayerForDisplay.secretWord}</Text>
              )}
              {hintModeEnabled && currentPlayerForDisplay.role === 'Erzfeind' && (
                <Text style={styles.cardTextHint}>({t('roleRevealScreen.hintCategory', {category: currentCategory})})</Text>
              )}
              <Text style={styles.cardHintSmallAfterReveal}>{t('roleRevealScreen.tapToContinueAfterReveal')}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles (können erstmal so bleiben, Animations-bezogene Teile sind nicht relevant)
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f0f0f0' },
  cardContainer: { width: '100%', alignItems: 'center' }, // Container für die Karte
  loadingText: { fontSize: 18, color: '#2c3e50', textAlign: 'center'},
  infoTextTop: { fontSize: 24, fontWeight: '600', textAlign: 'center', marginBottom: 30, color: '#2c3e50' },
  card: {
    width: 310,
    height: 460,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 5.84,
    elevation: 10,
  },
  cardTextName: { fontSize: 32, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 20 },
  detailsContainer: { alignItems: 'center', marginTop: 15, width: '100%' },
  cardTextRole: { fontSize: 30, fontWeight: 'bold', color: 'white', textAlign: 'center', marginVertical: 10 },
  cardTextWord: { fontSize: 36, fontWeight: 'bold', color: 'white', textAlign: 'center', marginVertical: 10 },
  cardTextHint: { fontSize: 16, color: '#ecf0f1', textAlign: 'center', marginTop: 15, fontStyle: 'italic' },
  cardHintText: { fontSize: 18, color: '#f0f0f0', marginTop: 25, textAlign: 'center', fontStyle: 'italic' },
  cardHintSmallAfterReveal: { fontSize: 16, color: '#ecf0f1', marginTop: 30, textAlign: 'center', fontStyle: 'italic' },
  erzfeindText: { color: '#e67e22', fontSize: 36, fontWeight: 'bold' },
});

export default RoleRevealScreen;