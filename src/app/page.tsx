'use client'

import "./survey-styles.css";
import { useEffect, useState } from "react";
import { QuestionData } from "./types/question-data";
import { questionList } from "./questions/questions";
import { categoryData } from "./game-data/category-data";
import { tagData } from "./game-data/tag-data";
import { Score } from "./types/score";

export default function Survey() {
  const MINIMUM_SCORE = 4;

  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [currentQuestionData, setQuestionData] = 
    useState<QuestionData>(questionList[questionIndex]);
  useEffect(() => {
    setQuestionData(questionList[questionIndex]);
  }, [questionIndex])

  const allGenres = Object.keys(categoryData);
  const genreScores: Record<string, number> = {};
  allGenres.map((genre) => genreScores[genre] = 0);
  const [suggestedGenres, setSuggestedGenres] = useState<Record<string, number>>(genreScores);
  const [completedAnswers, setCompletedAnswers] = useState<string[]>([]);

  const [currentAnswer, setCurrentAnswer] = useState<number>(-1);
  useEffect(() => setCurrentAnswer(-1), [questionIndex]);

  const [isSurveyComplete, setComplete] = useState<boolean>(false);

  const [scoreArray, setScoreArray] = useState<Score[]>([]);
  useEffect(() => {
    if (isSurveyComplete) {
      const finalScores = [];
      for (const genre of Object.keys(suggestedGenres)) {
        finalScores.push({genre, points: suggestedGenres[genre]});
      }
      finalScores.sort(sortByScoreDescending);
      setScoreArray(finalScores);
    }
  }, [isSurveyComplete])

  function sortByScoreDescending(a: Score, b: Score) {
    return b.points - a.points;
  }

  function updateScores(answer: string) {
    const matchingGenres = tagData[answer];
    const newSuggestedGenres = structuredClone(suggestedGenres);
    for (const genre of matchingGenres) {
      const currentScore = newSuggestedGenres[genre];
      newSuggestedGenres[genre] = currentScore + 1;
    }
    setSuggestedGenres(newSuggestedGenres);
  }

  function nextQuestion() {
    const newCompletedAnswers = completedAnswers.slice();
    const answerText = currentQuestionData.answers[currentAnswer];
    newCompletedAnswers.push(answerText);
    setCompletedAnswers(newCompletedAnswers);
    updateScores(answerText);

    if (questionIndex < questionList.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
    else {
      setComplete(true);
    }
  }

  return (
    <div id='survey'>
      <h1>Game Affinity</h1>
      <div id="questionDisplay" className={isSurveyComplete ? 'hidden' : ''}>
        <h2>Answer the questions to find games you would like!</h2>
        <div id="questionText">{currentQuestionData.questionText}</div>
        <div id="answersDisplay">
          {
            currentQuestionData.answers.map((answer, index) => (
            <div key={`${answer}row`}>
              <input type='radio' key={index} name='answer' value={index}
              onChange={() => setCurrentAnswer(index)} />
              {answer}
            </div>))
          }
          <button className='next' disabled={currentAnswer === -1}
            onClick={nextQuestion}>Next &gt;</button>
        </div>
        <p>Question {questionIndex + 1} of {questionList.length}</p>
      </div>
      <div className={isSurveyComplete ? '' : 'hidden'}>
        <h2>Here are some games you might like!</h2>
        <p>The genres are listed in order of preference, based on your answers.
           Examples of each genre are provided as a starting point.
        </p>
        <div className='genres'>
          <ol>
            {scoreArray.filter((score) => score.points >= MINIMUM_SCORE)
              .map((score) => (
              <li key={score.genre}>{score.genre}
                <ul>
                {categoryData[score.genre].map((example) => (<li key={example}>{example}</li>))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
