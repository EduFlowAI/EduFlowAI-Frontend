import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  ChatMessage,
  RecommendationQuestionKey,
  RecommendationQuestionnaireProgress,
} from '../../models/assistant.models';
import { AssistantApiService } from '../../services/assistant-api.service';

@Component({
  selector: 'app-assistant-page',
  imports: [FormsModule],
  templateUrl: './assistant-page.html',
  styleUrl: './assistant-page.scss',
})
export class AssistantPage {
  private readonly assistantApi = inject(AssistantApiService);

  readonly messages = signal<ChatMessage[]>([]);
  readonly isSending = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isOpen = signal(false);
  readonly isMaximized = signal(false);
  readonly activeRecommendationQuestionKey =
    signal<RecommendationQuestionKey | null>(null);

  message = '';
  sessionId: string | null = null;

  recommendationProgress: RecommendationQuestionnaireProgress = {
    major: null,
    technicalCourses: null,
    skills: null,
    interests: null,
    preferredActivities: null,
    careerGoals: null,
    additionalContext: null,
    skippedFields: [],
  };

  sendMessage(): void {
    const normalizedMessage = this.message.trim();

    if (!normalizedMessage || this.isSending()) {
      return;
    }

    const currentQuestionKey =
      this.activeRecommendationQuestionKey();

    if (currentQuestionKey) {
      this.applyRecommendationAnswer(
        currentQuestionKey,
        normalizedMessage,
      );

      this.activeRecommendationQuestionKey.set(null);
    }

    this.message = '';

    this.sendAssistantRequest(
      normalizedMessage,
      false,
    );
  }

  recommendNow(): void {
    if (this.isSending()) {
      return;
    }

    this.activeRecommendationQuestionKey.set(null);

    this.sendAssistantRequest(
      'Recommend based on the information available.',
      true,
    );
  }

  toggleChat(): void {
    this.isOpen.update(value => !value);
  }

  toggleMaximize(): void {
    this.isMaximized.update(value => !value);
  }

  closeChat(): void {
    this.isOpen.set(false);
    this.isMaximized.set(false);
  }

  private applyRecommendationAnswer(
    questionKey: RecommendationQuestionKey,
    answer: string,
  ): void {
    if (this.isSkippedAnswer(answer)) {
      this.clearRecommendationField(questionKey);
      this.addSkippedField(questionKey);
      return;
    }

    this.removeSkippedField(questionKey);

    if (questionKey === 'major') {
      this.recommendationProgress = {
        ...this.recommendationProgress,
        major: answer.trim(),
      };

      return;
    }

    const values = this.parseAnswerValues(answer);

    this.recommendationProgress = {
      ...this.recommendationProgress,
      [questionKey]: values,
    };
  }

  private isSkippedAnswer(answer: string): boolean {
    const normalizedAnswer = answer
      .trim()
      .toLowerCase()
      .replace(/[.!?]+$/g, '');

    const skippedAnswers = new Set([
      'none',
      'no',
      'skip',
      'not yet',
      'nothing',
      'i have none',
      "i don't have any",
      'i do not have any',
      "i don't know",
      'i do not know',
      'معنديش',
      'مش عندي',
      'لا يوجد',
      'لا أعرف',
      'تخطي',
    ]);

    return skippedAnswers.has(normalizedAnswer);
  }

  private parseAnswerValues(answer: string): string[] {
    return answer
      .split(/[,;\n]+/)
      .map(value => value.trim())
      .filter(Boolean);
  }

  private clearRecommendationField(
    questionKey: RecommendationQuestionKey,
  ): void {
    if (questionKey === 'major') {
      this.recommendationProgress = {
        ...this.recommendationProgress,
        major: null,
      };

      return;
    }

    this.recommendationProgress = {
      ...this.recommendationProgress,
      [questionKey]: null,
    };
  }

  private addSkippedField(
    questionKey: RecommendationQuestionKey,
  ): void {
    const skippedFields = new Set(
      this.recommendationProgress.skippedFields,
    );

    skippedFields.add(questionKey);

    this.recommendationProgress = {
      ...this.recommendationProgress,
      skippedFields: [...skippedFields],
    };
  }

  private removeSkippedField(
    questionKey: RecommendationQuestionKey,
  ): void {
    this.recommendationProgress = {
      ...this.recommendationProgress,
      skippedFields:
        this.recommendationProgress.skippedFields.filter(
          field => field !== questionKey,
        ),
    };
  }

  private sendAssistantRequest(
    message: string,
    recommendWithAvailableData: boolean,
  ): void {
    this.messages.update(messages => [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      },
    ]);

    this.isSending.set(true);
    this.errorMessage.set(null);

    this.assistantApi
      .sendMessage({
        message,
        sessionId: this.sessionId,
        language: 'en',
        recommendation: this.recommendationProgress,
        recommendWithAvailableData,
      })
      .pipe(
        finalize(() => this.isSending.set(false)),
      )
      .subscribe({
        next: response => {
          this.sessionId = response.sessionId;

          const recommendationResult =
            response.results.find(
              result =>
                result.intent === 'recommendation' &&
                result.metadata.state ===
                  'collecting_answers',
            );

          this.activeRecommendationQuestionKey.set(
            recommendationResult?.metadata.questionKey ??
              null,
          );

          this.messages.update(messages => [
            ...messages,
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              response,
              timestamp: response.timestamp,
            },
          ]);
        },
        error: () => {
          this.activeRecommendationQuestionKey.set(null);

          this.errorMessage.set(
            'Could not send the message. Please try again.',
          );
        },
      });
  }
}