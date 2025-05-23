// BarnebyAppNeu/contexts/GameContext.tsx
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction, useRef, useCallback, useEffect } from 'react';
import { Player, GameState, GamePhase, GameSettings } from '../types/gameTypes';
import { DEFAULT_WORD_LISTS } from '../constants/wordLists';
import { t } from '../i18n';
import { Alert, InteractionManager } from 'react-native';

if (!DEFAULT_WORD_LISTS) {
    console.error("[GameContext] CRITICAL ERROR: DEFAULT_WORD_LISTS not imported or undefined!");
} else if (DEFAULT_WORD_LISTS.length === 0) {
    console.warn("[GameContext] WARNING: DEFAULT_WORD_LISTS is empty! Game cannot be initialized correctly.");
}

interface GameContextType {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  initializeGame: (settings: GameSettings) => void;
  proceedToNextRoleReveal: (caller?: string) => void;
  startGameTimer: () => void;
  stopGameTimer: () => void;
  goToResolutionPhase: (params?: { reasonKey?: string, reasonParams?: object }) => void;
  changeSecretWord: (newWord: string, caller?: string) => void; // NEUE FUNKTION
}

// ... (initialGameState bleibt gleich) ...
const initialGameState: GameState = {
  numberOfPlayers: 3, playerNames: ["", "", ""], numberOfErzfeinde: 1, roundTimeInSeconds: 60,
  selectedCategory: undefined, hintModeEnabled: false, players: [], gamePhase: 'Setup',
  currentSecretWord: '', currentCategory: '', currentPlayerTurnForRoleReveal: 0,
  timerValue: 60, isTimerRunning: false, isLoading: false, roundEndReason: undefined,
};


const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // ... (gameStateRef und useEffect für gameStateRef bleiben gleich) ...
  const gameStateRef = useRef(gameState);
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // ... (initializeGame, proceedToNextRoleReveal, goToResolutionPhase, decrementTimer, startGameTimer, stopGameTimer, useEffect für Cleanup bleiben gleich) ...
  const initializeGame = useCallback((settings: GameSettings) => {
    console.log("[GameContext] INITIALIZING GAME with settings:", settings);
    setGameState(prev => ({
        ...initialGameState, 
        ...settings,        
        playerNames: settings.playerNames.slice(0, settings.numberOfPlayers).map(
            (name, index) => name.trim() === '' ? `${t('setupScreen.playerPlaceholder', {defaultValue: "Player "})}${index + 1}` : name.trim()
        ),
        isLoading: true,    
        gamePhase: 'Setup', 
        currentPlayerTurnForRoleReveal: 0, 
        roundEndReason: undefined,
        players: [], 
        currentCategory: '',
        currentSecretWord: '',
    }));

    InteractionManager.runAfterInteractions(() => {
        console.log("[GameContext] IM: Starting detailed game initialization.");
        if (!DEFAULT_WORD_LISTS || DEFAULT_WORD_LISTS.length === 0) {
          Alert.alert(t('appTitle'), t('errors.wordListUnavailable'));
          setGameState(prev => ({ ...prev, isLoading: false, gamePhase: 'Setup' }));
          return;
        }
        let categoryToUse;
        const randomCategoryValue = t('setupScreen.randomCategoryValue', { defaultValue: "Random"});
        if (settings.selectedCategory && settings.selectedCategory !== randomCategoryValue) {
            categoryToUse = DEFAULT_WORD_LISTS.find(c => c.categoryName === settings.selectedCategory);
        }
        if (!categoryToUse) {
            const randomIndex = Math.floor(Math.random() * DEFAULT_WORD_LISTS.length);
            categoryToUse = DEFAULT_WORD_LISTS[randomIndex];
        }

        if (!categoryToUse || !categoryToUse.words || categoryToUse.words.length === 0) {
            Alert.alert(t('appTitle'), t('errors.categoryOrWordUnavailable'));
            setGameState(prev => ({ ...prev, isLoading: false, gamePhase: 'Setup' }));
            return;
        }
        const secretWord = categoryToUse.words[Math.floor(Math.random() * categoryToUse.words.length)];
        const actualPlayerNames = settings.playerNames.slice(0, settings.numberOfPlayers).map(
            (name, index) => name.trim() === '' ? `${t('setupScreen.playerPlaceholder', {defaultValue: "Player "})}${index + 1}` : name.trim()
        );
        let tempPlayers: Player[] = actualPlayerNames.map((name, index) => ({
          id: `player-${index}-${Date.now()}`, name, role: 'Wortkenner', secretWord,
        }));
        if (tempPlayers.length < settings.numberOfErzfeinde) {
          Alert.alert(t('appTitle'), t('errors.playerImpostorMismatch'));
          setGameState(prev => ({ ...prev, isLoading: false, gamePhase: 'Setup' }));
          return;
        }
        let erzfeindIndices: number[] = [];
        while (erzfeindIndices.length < settings.numberOfErzfeinde) {
          const randomIndex = Math.floor(Math.random() * tempPlayers.length);
          if (!erzfeindIndices.includes(randomIndex)) erzfeindIndices.push(randomIndex);
        }
        erzfeindIndices.forEach(index => {
          tempPlayers[index].role = 'Erzfeind';
          tempPlayers[index].secretWord = undefined;
        });
        for (let i = tempPlayers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [tempPlayers[i], tempPlayers[j]] = [tempPlayers[j], tempPlayers[i]];
        }
        console.log(`[GameContext] IM: Finalizing. Players: ${tempPlayers.length}, Setting CPTRFR to 0, Phase to RoleReveal.`);
        setGameState(prevSetupState => ({
            ...prevSetupState,
            ...settings, 
            playerNames: actualPlayerNames,
            players: tempPlayers,
            currentCategory: categoryToUse!.categoryName,
            currentSecretWord: secretWord!,
            gamePhase: 'RoleReveal',
            currentPlayerTurnForRoleReveal: 0, 
            timerValue: settings.roundTimeInSeconds,
            isTimerRunning: false,
            isLoading: false,
        }));
    });
  }, [t]);

  const proceedToNextRoleReveal = (caller: string = "Unknown") => {
    setGameState(prev => {
      const currentTurn = prev.currentPlayerTurnForRoleReveal;
      const nextPlayerIndex = currentTurn + 1;
      console.log(`[GameContext] PROCEED_TO_NEXT_ROLE_REVEAL called by ${caller}. Turn: ${currentTurn} -> ${nextPlayerIndex}. Total: ${prev.players.length}`);
      if (nextPlayerIndex < prev.players.length) {
        return { ...prev, currentPlayerTurnForRoleReveal: nextPlayerIndex };
      } else {
        console.log(`[GameContext] All roles revealed. Switching to WordPhase. Final CPTRFR: ${nextPlayerIndex}`);
        return { ...prev, gamePhase: 'WordPhase', currentPlayerTurnForRoleReveal: nextPlayerIndex };
      }
    });
  };

  const goToResolutionPhase = useCallback((params?: { reasonKey?: string, reasonParams?: object }) => {
    console.log("[GameContext] goToResolutionPhase. Params:", params);
    if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
    }
    const reasonText = params?.reasonKey ? t(params.reasonKey as any, params.reasonParams) : t('resolutionScreen.roundEndedGeneric', {defaultValue: "The round has ended."});
    setGameState(prev => ({ ...prev, isTimerRunning: false, gamePhase: 'Resolution', roundEndReason: reasonText }));
  }, [t]);

  const decrementTimer = useCallback(() => {
    setGameState(prev => {
      if (prev.timerValue > 1 && prev.isTimerRunning) {
        return { ...prev, timerValue: prev.timerValue - 1 };
      }
      if ((prev.timerValue === 1 || prev.timerValue === 0) && prev.isTimerRunning) {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        goToResolutionPhase({ reasonKey: 'resolutionScreen.timeUpInfo' });
        return { ...prev, timerValue: 0, isTimerRunning: false };
      }
      return prev; 
    });
  }, [goToResolutionPhase]);

  const startGameTimer = useCallback(() => {
    setGameState(prev => {
      if (!prev.isTimerRunning && prev.gamePhase === 'WordPhase' && prev.timerValue > 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(decrementTimer, 1000);
        return { ...prev, isTimerRunning: true };
      }
      return prev;
    });
  }, [decrementTimer]);

  const stopGameTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setGameState(prev => (prev.isTimerRunning ? { ...prev, isTimerRunning: false } : prev));
  }, []);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);


  // NEUE FUNKTION: changeSecretWord
  const changeSecretWord = (newWord: string, caller: string = "Unknown") => {
    if (!newWord || newWord.trim() === "") {
        console.warn(`[GameContext] changeSecretWord called by ${caller} with empty new word. No change.`);
        Alert.alert(t('common.error', {defaultValue: "Error"}), t('gameScreen.adminErrorEmptyWord', {defaultValue: "New word cannot be empty."}));
        return;
    }
    const trimmedNewWord = newWord.trim();
    console.log(`[GameContext] changeSecretWord called by ${caller}. New word: "${trimmedNewWord}"`);
    setGameState(prev => {
        const updatedPlayers = prev.players.map(player => {
            if (player.role === 'Wortkenner') {
                return { ...player, secretWord: trimmedNewWord };
            }
            return player;
        });
        return {
            ...prev,
            currentSecretWord: trimmedNewWord,
            players: updatedPlayers,
        };
    });
    Alert.alert(t('common.success', {defaultValue: "Success"}), t('gameScreen.adminSuccessWordChanged', {newWord: trimmedNewWord, defaultValue: `Secret word changed to "${trimmedNewWord}".` }));
  };


  const value = {
      gameState,
      setGameState,
      initializeGame,
      proceedToNextRoleReveal,
      startGameTimer,
      stopGameTimer,
      goToResolutionPhase,
      changeSecretWord // Hinzugefügt
    };
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame must be used within a GameProvider');
  return context;
};