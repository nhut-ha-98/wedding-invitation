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
    mapEmbedUrl?: string;
    mapImageUrl?: string;
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
    name: 'LACASA',
    address: '30 Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức',
    mapUrl: 'https://maps.app.goo.gl/PHCvCBcgiyN7i56w8',
    mapEmbedUrl: 'https://maps.google.com/maps?q=30+Nguy%E1%BB%85n+V%C4%83n+H%C6%B0%E1%BB%9Fng%2C+Th%E1%BA%A3o+%C4%90i%E1%BB%81n%2C+Th%E1%BB%A7+%C4%90%E1%BB%A9c%2C+H%E1%BB%93+Ch%C3%AD+Minh&t=&z=16&ie=UTF8&iwloc=&output=embed',
    mapImageUrl: 'map.png',
  },
  dressCode: 'Trang phục lịch sự, thoải mái cùng chúng mình chung vui',
  openingQuote: 'Ngày chúng mình bắt đầu cũng chỉ là một cái nắm tay.',
  openingQuoteAuthor: 'Chúng mình',
  introduction:
    'Từ những buổi cùng ngồi học trong thư viện đến cái nắm tay đầu tiên trước kỳ thi đại học, chúng mình đã đi cùng nhau qua mười năm thanh xuân. Hôm nay, bên những người thân yêu, chúng mình bắt đầu viết tiếp chương mới.',
  chapterOne: {
    photoAlt: 'Kỷ niệm những ngày cùng học trong thư viện trước kỳ thi đại học',
    narrative:
      'Chúng mình từng là bạn cùng trường, cùng lớp, rồi mỗi người bận rộn với câu chuyện riêng. Những ngày ôn thi trong thư viện đưa hai đứa lại gần nhau. Ngay trước kỳ thi đại học, một cái nắm tay bất ngờ đã mở đầu cho mối tình đầu và hành trình mười năm bên nhau.',
  },
  heAndShe: {
    he: {
      name: 'Nhut Ha',
      portraitUrl: 'he.webp',
      alt: 'Chân dung chú rể',
      intro:
        'Ngày ấy, anh chẳng phải hình mẫu cô thích, thậm chí còn từng bị cô ghét vì học giỏi và lạc quan đến đáng ghét. Nhưng chính sự lạc quan và tử tế của anh đã khiến cô vui vẻ hơn, nhẹ nhàng hơn, và nhìn mọi thứ bằng một ánh mắt khác.',
    },
    she: {
      name: 'Hoa Ha',
      portraitUrl: 'she.webp',
      alt: 'Chân dung cô dâu',
      intro:
        'Cô gái từng chẳng mấy thiện cảm với anh, rồi trở thành người cùng anh đi qua những năm tháng đẹp nhất của tuổi trẻ. Từ những ngày còn là bạn học đến hôm nay, em vẫn là người anh muốn cùng viết tiếp mọi chặng đường.',
    },
  },
  timeline: [
    {
      year: '2009 – 2016',
      title: 'Từ bạn học thành tri kỷ',
      description:
        'Cùng trường, cùng tên, cùng tuổi và từng học chung lớp 8. Lên cấp 3, mỗi người một lớp, cho đến những buổi ôn thi cuối cấp trong thư viện đưa hai đứa lại gần nhau.',
      icon: '📚',
    },
    {
      year: '2016',
      title: 'Cái nắm tay đầu tiên',
      description:
        'Một ngày tháng 6 trước kỳ thi đại học, cái nắm tay bất ngờ mở đầu cho mối tình đầu, bộ phim Me Before You và những chuyến đi đầu tiên cùng nhau.',
      icon: '🤝',
    },
    {
      year: '2017 – 2024',
      title: 'Cùng nhau lớn lên',
      description:
        'Cùng học, cùng làm, cùng tốt nghiệp và rong ruổi qua những cung đường Tây Bắc, miền Tây cùng bao vùng đất mới. Bình dị thôi, nhưng luôn có nhau.',
      icon: '🛣️',
    },
    {
      year: '2025',
      title: 'Một lời hứa',
      description:
        'Trong buổi tối ở Monad Stopover, giữa những lưng đèo Bảo Lộc, một chiếc nhẫn và lời cầu hôn mở ra hành trình dài hơn của hai đứa.',
      icon: '💍',
    },
    {
      year: '2026',
      title: 'Đám Cưới Của Chúng Mình',
      description:
        'Sau mười năm kể từ cái nắm tay đầu tiên, chúng mình cùng những người thân yêu mừng chương mới và hứa sẽ tiếp tục đi bên nhau.',
      icon: '🥂',
    },
  ],
  schedule: [
    { time: '17:30', label: 'TIỆC CƯỚI' },
  ],
  proposalStory:
    'Một buổi tối ở Monad Stopover, giữa khung cảnh đèo Bảo Lộc yên bình, anh trao em chiếc nhẫn cùng lời cầu hôn đã được chờ đợi từ lâu. Sau những năm tháng cùng nhau đi qua tuổi trẻ, chúng mình chọn tiếp tục hành trình ấy, lần này bằng một lời hứa dài lâu.',
  closingQuote:
    'Điều đẹp nhất không phải là đã đi được bao xa, mà là sau từng ấy năm, quay lại vẫn thấy người bên cạnh là người mình muốn cùng đi tiếp.',
  closingQuoteAuthor: 'Chúng mình',
};
