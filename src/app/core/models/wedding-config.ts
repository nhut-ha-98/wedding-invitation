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
  heAndShe: {
    he: CoupleProfile;
    she: CoupleProfile;
  };
  timeline: TimelineEvent[];
  schedule: ScheduleEvent[];
  proposalStory: string;
  closingQuote: string;
  closingQuoteAuthor: string;
}

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  image?: string;
  icon?: string;
}

export interface ScheduleEvent {
  time: string;
  label: string;
}

export interface CoupleProfile {
  name: string;
  portraitUrl: string;
  alt: string;
  intro: string;
}

export const WEDDING_CONFIG = new InjectionToken<WeddingConfig>('WEDDING_CONFIG');

export const DEFAULT_WEDDING_CONFIG: WeddingConfig = {
  couple: {
    partner1: 'Nhut Ha',
    partner2: 'Hoa Ha',
  },
  date: '01.11.2026',
  time: '17:30',
  venue: {
    name: 'The Lacasa',
    address: 'Nguyen Van Huong, Thao Dien',
    mapUrl: 'https://maps.google.com',
  },
  dressCode: 'Formal attire',
  openingQuote: 'Mỗi câu chuyện đều có một khởi đầu',
  openingQuoteAuthor: '',
  introduction:
    'Câu chuyện của chúng mình bắt đầu từ một lời chào, lớn lên qua năm tháng, và hôm nay mở sang một chương mới.',
  chapterOne: {
    photoAlt: 'Một cặp đôi chia sẻ khoảnh khắc yên tĩnh trong thư viện ngập nắng',
    narrative: 'Câu chuyện của chúng mình bắt đầu một cách bất ngờ.',
  },
  heAndShe: {
    he: {
      name: 'Nhut Ha',
      portraitUrl: 'he.webp',
      alt: 'Huy hiệu vẽ tay của chú rể (ảnh mẫu)',
      intro:
        'Người kiến trúc cho thế giới nhỏ của chúng mình. Anh ấy phác hoạ những giấc mơ bằng mực, tin rằng mỗi câu chuyện tình yêu đều cần một khởi đầu thật nhẹ. Người viết nên những bản nhạc riêng, người giữ lời hứa, và là người luôn mở cửa cho em dù trời không mưa.',
    },
    she: {
      name: 'Hoa Ha',
      portraitUrl: 'she.webp',
      alt: 'Huy hiệu vẽ tay của cô dâu (ảnh mẫu)',
      intro:
        'Người giữ kệ thơ chung của hai đứa. Chị ấy ngân nga khi đọc sách, nhớ từng ngày kỷ niệm nhỏ, và tin rằng những câu chuyện hay nhất phải kể thật chậm. Tiếng cười của chị là nhạc nền của tổ ấm mình, và trái tim chị là nơi cả hai cùng ở.',
    },
  },
  timeline: [
    {
      year: '2016',
      title: 'First Meeting',
      description:
        'Bumped into each other at The Cozy Nook Bookshop. Bonded over a shared love for old poetry.',
      icon: '📖',
    },
    {
      year: '2017',
      title: 'First Trip',
      description:
        'A spontaneous weekend trip to the mountains. We watched the sunrise from the peak and knew this was forever.',
      icon: '🏔️',
    },
    {
      year: '2024',
      title: 'The Proposal',
      description:
        'Under the same oak tree where we had our first picnic, Nhut got down on one knee.',
      icon: '💍',
    },
    {
      year: '2026',
      title: 'Our Wedding',
      description: 'Surrounded by our loved ones, we will say "I do" and begin our forever.',
      icon: '🥂',
    },
  ],
  schedule: [
    { time: '16:45', label: 'LỄ VOW' },
    { time: '17:30', label: 'ĐÓN KHÁCH' },
    { time: '19:30', label: 'LỄ CHÍNH' },
  ],
  proposalStory:
    'Chúng mình đã đi qua những ngày rất đỗi bình thường, để rồi nhận ra chính những ngày ấy đã làm nên câu chuyện đẹp nhất của đời mình.',
  closingQuote:
    'Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.',
  closingQuoteAuthor: 'Unknown',
};
