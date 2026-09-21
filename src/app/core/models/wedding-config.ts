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
    name: 'Lacasa',
    address: '30 Nguyễn Văn Hưởng, An Khánh',
    mapUrl: 'https://maps.app.goo.gl/PHCvCBcgiyN7i56w8',
  },
  dressCode: 'Trang phục lịch sự',
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
      title: 'Lần Đầu Gặp',
      description:
        'Tình cờ gặp nhau ở nhà sách The Cozy Nook. Gắn kết vì cùng yêu thơ xưa.',
      icon: '📖',
    },
    {
      year: '2017',
      title: 'Chuyến Đi Đầu Tiên',
      description:
        'Một chuyến đi chơi núi đầy hứng khởi. Ngắm bình minh trên đỉnh và biết đây là mãi mãi.',
      icon: '🏔️',
    },
    {
      year: '2024',
      title: 'Lời Cầu Hôn',
      description:
        'Dưới gốc sồi nơi có buổi picnic đầu tiên, Nhut quỳ xuống cầu hôn.',
      icon: '💍',
    },
    {
      year: '2026',
      title: 'Đám Cưới Của Chúng Mình',
      description: 'Bên người thương yêu, chúng mình nói "đồng ý" và bắt đầu mãi mãi.',
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
    'Tình yêu không phải là bao nhiêu ngày, tháng hay năm bên nhau. Mà là yêu nhau nhiều đến đâu mỗi ngày.',
  closingQuoteAuthor: 'Khuyết danh',
};
