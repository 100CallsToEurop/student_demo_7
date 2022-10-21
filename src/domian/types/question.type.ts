export enum AnswerStatus {
    CORRECT = 'Correct',
    INCORRECT = 'Incorrect',
}

export type QuestionViewModel = {
    id: string,
    body: string
}

export type AnswerViewModel = {
    questionId: string,
    answerStatus: AnswerStatus,
    addedAt: string
}

export type AnswerInputModel = {
    answer: string
}
