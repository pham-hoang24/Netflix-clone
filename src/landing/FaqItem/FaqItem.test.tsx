import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import * as i18n from 'i18next';
import FaqItem from './FaqItem';
import { faqs } from '../data/faqs';

// Import the translation files
import enTranslations from '../../../public/locales/english/translation.json';
import fiTranslations from '../../../public/locales/suomi/translation.json';
import viTranslations from '../../../public/locales/tieng viet/translation.json';

// Helper to get nested property
const getNestedTranslation = (obj: any, key: string) => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

const languageResources = [
  { lang: 'en', translations: enTranslations },
  { lang: 'fi', translations: fiTranslations },
  { lang: 'vi', translations: viTranslations },
];

describe.each(languageResources)('FaqItem Component with $lang language', ({ lang, translations }) => {
  faqs.forEach((faq, index) => {
    it(`should correctly render and toggle FAQ Item ${index + 1}`, async () => {
      // Create a new i18n instance for each test to ensure isolation
      const i18nInstance = i18n.createInstance();
      await i18nInstance.use(initReactI18next).init({
        resources: {
          [lang]: {
            translation: translations,
          },
        },
        lng: lang,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
      });

      const questionText = getNestedTranslation(translations, faq.question);
      const expectedAnswerHtml = getNestedTranslation(translations, faq.answer);

      if (!questionText || !expectedAnswerHtml) {
        throw new Error(`Translation not found for key in language: ${lang}`);
      }

      render(
        <I18nextProvider i18n={i18nInstance}>
          <FaqItem question={faq.question} answer={faq.answer} />
        </I18nextProvider>
      );

      const questionElement = screen.getByText(questionText);
      expect(questionElement).toBeInTheDocument();

      const answerElement = screen.getByTestId('faq-answer');
      expect(answerElement).toBeInTheDocument();
      expect(answerElement).not.toBeVisible();

      fireEvent.click(questionElement);

      expect(answerElement).toBeVisible();
      expect(answerElement).toHaveProperty('innerHTML', expectedAnswerHtml);
    });
  });
});