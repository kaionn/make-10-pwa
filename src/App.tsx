import { Header } from './components/Header';
import { Display } from './components/Display';
import { NumberPad } from './components/NumberPad';
import { OperatorPad } from './components/OperatorPad';
import { ControlPad } from './components/ControlPad';
import { FeedbackOverlay } from './components/FeedbackOverlay';
import { GiveUpConfirmDialog } from './components/GiveUpConfirmDialog';
import { AmbientBackground } from './components/AmbientBackground';
import { useMake10 } from './hooks/useMake10';

function App() {
  const {
    expression,
    numbers,
    score,
    feedback,
    solutions,
    showGiveUpConfirm,
    celebrationVariant,
    correctMessage,
    appendDigit,
    appendOperator,
    appendBracket,
    backspace,
    clear,
    judge,
    dismissFeedback,
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

  return (
    <div className="relative mx-auto flex h-full max-w-[428px] flex-col bg-gradient-to-br from-amber-100 via-pink-100 to-indigo-100">
      <AmbientBackground />

      <div className="relative z-10 flex h-full flex-col">
        <Header score={score} />

        <div className="flex flex-1 flex-col justify-between pb-6">
          <Display
            expression={expression}
            answer={answerToShow}
          />

          <div className="flex flex-col gap-3">
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
    </div>
  );
}

export default App;
