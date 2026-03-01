import { useCallback, useState } from 'react';
import { Header } from './components/Header';
import { Display } from './components/Display';
import { NumberPad } from './components/NumberPad';
import { OperatorPad } from './components/OperatorPad';
import { ControlPad } from './components/ControlPad';
import { ChoiceButtons } from './components/ChoiceButtons';
import { FeedbackOverlay } from './components/FeedbackOverlay';
import { GiveUpConfirmDialog } from './components/GiveUpConfirmDialog';
import { AmbientBackground } from './components/AmbientBackground';
import { LevelUpOverlay } from './components/LevelUpOverlay';
import { TitleScreen } from './components/TitleScreen';
import { useMake10 } from './hooks/useMake10';

function App() {
  const [showTitle, setShowTitle] = useState(true);

  const handleStart = useCallback(() => {
    setShowTitle(false);
  }, []);
  const {
    expression,
    numbers,
    score,
    feedback,
    solutions,
    showGiveUpConfirm,
    celebrationVariant,
    correctMessage,
    level,
    showLevelUp,
    newLevel,
    fillInBlankPuzzle,
    partialPuzzle,
    wrongChoiceIndex,
    wrongChoiceKey,
    currentBlankStep,
    filledBlanks,
    appendDigit,
    appendOperator,
    appendBracket,
    backspace,
    clear,
    judge,
    selectChoice,
    dismissFeedback,
    dismissLevelUp,
    requestGiveUp,
    cancelGiveUp,
    confirmGiveUp,
  } = useMake10();

  // Use the digits themselves as the puzzle key for pop-in animation.
  // When the digits change (new puzzle), the key changes and triggers remount.
  const puzzleKey = numbers.map((n) => n.digit).join(',');

  // Check if all 4 numbers have been used in the expression
  const allNumbersUsed = numbers.every((n) => n.used);

  // Determine the answer to show (first/simplest solution)
  const answerToShow = feedback === 'answer' && solutions.length > 0 ? solutions[0] : undefined;

  // Disable all controls when feedback is showing or give up confirm is open
  const controlsDisabled = feedback !== null || showGiveUpConfirm;

  // v5: Determine current blank info for Level 1
  const currentBlank = fillInBlankPuzzle?.blanks[currentBlankStep];
  const stepLabels = ['1つめの くうらん', '2つめの くうらん'];

  return (
    <div className="relative mx-auto flex h-full max-w-[428px] flex-col bg-gradient-to-br from-amber-100 via-pink-100 to-indigo-100">
      <AmbientBackground />

      <div className="relative z-10 flex h-full flex-col">
        <Header score={score} level={level} />

        <div className="flex flex-1 flex-col justify-between pb-6">
          <Display
            expression={expression}
            answer={answerToShow}
            level={level}
            fillInBlankTokens={fillInBlankPuzzle?.tokens}
            currentBlankStep={currentBlankStep}
            filledBlanks={filledBlanks}
          />

          <div className="flex flex-col gap-3">
            {/* Level 1: Choice buttons only (no NumberPad, OperatorPad, ControlPad) */}
            {level === 1 && fillInBlankPuzzle && currentBlank && (
              <ChoiceButtons
                choices={currentBlank.choices}
                blankType={currentBlank.type}
                onSelect={selectChoice}
                puzzleKey={puzzleKey}
                wrongChoiceKey={wrongChoiceKey > 0 ? String(wrongChoiceKey) : null}
                wrongChoiceIdx={wrongChoiceIndex}
                blankStep={currentBlankStep + 1}
                stepLabel={stepLabels[currentBlankStep]}
              />
            )}

            {/* Level 2: NumberPad (with hinted numbers) + OperatorPad (no brackets) + ControlPad */}
            {level === 2 && (
              <>
                <NumberPad
                  numbers={numbers}
                  onPress={appendDigit}
                  puzzleKey={puzzleKey}
                  hintedIndices={partialPuzzle?.hintedIndices}
                />
                <OperatorPad onOperator={appendOperator} onBracket={appendBracket} hideBrackets />
                <ControlPad
                  onBackspace={backspace}
                  onClear={clear}
                  onJudge={judge}
                  disabled={controlsDisabled}
                  onGiveUp={requestGiveUp}
                  allNumbersUsed={allNumbersUsed && !controlsDisabled}
                />
              </>
            )}

            {/* Level 3: Full controls (existing layout) */}
            {level === 3 && (
              <>
                <NumberPad
                  numbers={numbers}
                  onPress={appendDigit}
                  puzzleKey={puzzleKey}
                />
                <OperatorPad onOperator={appendOperator} onBracket={appendBracket} />
                <ControlPad
                  onBackspace={backspace}
                  onClear={clear}
                  onJudge={judge}
                  disabled={controlsDisabled}
                  onGiveUp={requestGiveUp}
                  allNumbersUsed={allNumbersUsed && !controlsDisabled}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <FeedbackOverlay
        feedback={feedback}
        onDismiss={dismissFeedback}
        answer={answerToShow}
        celebrationVariant={celebrationVariant}
        correctMessage={correctMessage}
      />
      <GiveUpConfirmDialog
        open={showGiveUpConfirm}
        onConfirm={confirmGiveUp}
        onCancel={cancelGiveUp}
      />
      {showLevelUp && newLevel && (
        <LevelUpOverlay
          newLevel={newLevel}
          onDismiss={dismissLevelUp}
        />
      )}
      {showTitle && (
        <TitleScreen score={score} onStart={handleStart} />
      )}
    </div>
  );
}

export default App;
