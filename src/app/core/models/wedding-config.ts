import { InjectionToken } from '@angular/core';

export interface WeddingConfig {
  couple: {
    partner1: string;
    partner2: string;
  };
  date: string;
  time: string;
  venue: {
    name: string;
    address: string;
    mapUrl: string;
  };
  dressCode: string;
  openingQuote: string;
  openingQuoteAuthor: string;
  introduction: string;
  chapterOne: {
    photoAlt: string;
    narrative: string;
  };
  timeline: TimelineEvent[];
  proposalStory: string;
  closingQuote: string;
  closingQuoteAuthor: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

export const WEDDING_CONFIG = new InjectionToken<WeddingConfig>('WEDDING_CONFIG');

export const DEFAULT_WEDDING_CONFIG: WeddingConfig = {
  couple: {
    partner1: 'Nhut Ha',
    partner2: 'Hoa Ha',
  },
  date: 'November 11, 2026',
  time: '6:00 PM',
  venue: {
    name: 'The Lacasa',
    address: 'Nguyen Van Huong, Thao Dien',
    mapUrl: 'https://maps.google.com',
  },
  dressCode: 'Formal attire',
  openingQuote:
    'A great marriage is not when the perfect couple come together. It is when an imperfect couple learns to enjoy their differences.',
  openingQuoteAuthor: 'Dave Meurer',
  introduction:
    'We first met on a crisp autumn morning, both reaching for the same book at a small coffee shop. What started as a shared love for literature blossomed into a beautiful journey of friendship, adventure, and love. Today, we invite you to celebrate with us as we begin our greatest chapter yet.',
  chapterOne: {
    photoAlt: 'A couple sharing a quiet moment in a sunlit library',
    narrative:
      'Our story began in the most unexpected way. Alex, an architect with a passion for vintage bookstores, and Jamie, a musician who found inspiration in the pages of old novels. We discovered that our favorite authors overlapped, our dreams aligned, and our hearts spoke the same language. Through long walks in the rain, countless cups of tea, and conversations that stretched into the dawn, we built a friendship that would become the foundation of our love.',
  },
  timeline: [
    {
      year: '2019',
      title: 'First Meeting',
      description:
        'Bumped into each other at The Cozy Nook Bookshop. Bonded over a shared love for old poetry.',
    },
    {
      year: '2020',
      title: 'First Trip',
      description:
        'A spontaneous weekend trip to the mountains. We watched the sunrise from the peak and knew this was forever.',
    },
    {
      year: '2024',
      title: 'The Proposal',
      description:
        'Under the same oak tree where we had our first picnic, Alex got down on one knee.',
    },
    {
      year: '2026',
      title: 'Our Wedding',
      description: 'Surrounded by our loved ones, we will say "I do" and begin our forever.',
    },
  ],
  proposalStory:
    'It was a golden autumn afternoon. Alex had planned a picnic at our favorite spot by the lake — the place where we had our first real conversation about the future. The trees were painted in shades of amber and crimson, and the air carried the scent of fallen leaves. After a quiet lunch, Alex pulled out a worn copy of our favorite poetry collection. Tucked between the pages was a simple velvet box. With trembling hands and a heart full of hope, Alex asked the question that would change everything.',
  closingQuote:
    'Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.',
  closingQuoteAuthor: 'Unknown',
};
