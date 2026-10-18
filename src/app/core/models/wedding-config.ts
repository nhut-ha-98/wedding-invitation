import { InjectionToken } from '@angular/core';

export interface WeddingConfig {
  coverOpenPromptDelayMs: number;
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
  album: AlbumPhoto[];
  /** Fixed photo slots before stacking cycles. Positive integer; defaults to 3. */
  albumStackThreshold?: number;
  /** Polaroid drop duration in seconds. Defaults to 0.7; capped at 1. */
  albumTransitionDuration?: number;
  /** Seconds to wait after each capture. Clicks restart this wait. Defaults to 3. */
  albumAutoStackDelay?: number;
  proposalStory: string;
  closingQuote: string;
  closingQuoteAuthor: string;
  constellation: ConstellationConfig;
}

/** Scroll timing for the constellation, expressed from 0 to 1. */
export interface ConstellationConfig {
  /** First scroll position. Must be within 0..0.99. */
  drawStart: number;
  /** Reveal length. Must be within 0.01..(1 - drawStart). */
  drawDuration: number;
  /** First visible scroll position. Must be within 0..0.99. */
  opacityStart: number;
  /** Fade-in length. Must be within 0.01..(1 - opacityStart). */
  opacityDuration: number;
}

export type TimelineImageStyle = 'landscape' | 'portrait' | 'square';

export interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  image?: string;
  imageStyle?: TimelineImageStyle;
  icon?: string;
}

export interface ScheduleEvent {
  time: string;
  label: string;
}

export interface AlbumPhoto {
  imageUrl: string;
  alt: string;
  caption?: string;
}

export interface CoupleProfile {
  name: string;
  portraitUrl: string;
  alt: string;
  intro: string;
}

export const WEDDING_CONFIG = new InjectionToken<WeddingConfig>('WEDDING_CONFIG');

export const DEFAULT_WEDDING_CONFIG: WeddingConfig = {
  coverOpenPromptDelayMs: 1500,
  couple: {
    partner1: 'Nhựt Hạ',
    partner2: 'Hoa Hạ',
  },
  date: '01.11.2026',
  time: '18:00',
  venue: {
    name: 'LACASA',
    address: '30 Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức',
    mapUrl: 'https://maps.app.goo.gl/PHCvCBcgiyN7i56w8',
    mapEmbedUrl:
      'https://maps.google.com/maps?q=30+Nguy%E1%BB%85n+V%C4%83n+H%C6%B0%E1%BB%9Fng%2C+Th%E1%BA%A3o+%C4%90i%E1%BB%81n%2C+Th%E1%BB%A7+%C4%90%E1%BB%A9c%2C+H%E1%BB%93+Ch%C3%AD+Minh&t=&z=16&ie=UTF8&iwloc=&output=embed',
    mapImageUrl: 'map.png',
  },
  dressCode: 'Trang phục lịch sự, thoải mái cùng chúng mình chung vui',
  openingQuote: 'Ngày chúng mình bắt đầu cũng chỉ là một cái nắm tay.',
  openingQuoteAuthor: 'Cặp đôi mùa hè',
  introduction:
    'Từ những buổi cùng ngồi học trong thư viện đến cái nắm tay đầu tiên trước kỳ thi đại học, chúng mình đã đi cùng nhau qua mười năm thanh xuân. Hôm nay, bên những người thân yêu, chúng mình bắt đầu viết tiếp chương mới.',
  chapterOne: {
    photoAlt: 'Kỷ niệm những ngày cùng học trong thư viện trước kỳ thi đại học',
    narrative:
      'Chúng mình từng là bạn cùng trường, cùng lớp, rồi mỗi người bận rộn với câu chuyện riêng. Những ngày ôn thi trong thư viện đưa hai đứa lại gần nhau. Ngay trước kỳ thi đại học, một cái nắm tay bất ngờ đã mở đầu cho mối tình đầu và hành trình mười năm bên nhau.',
  },
  heAndShe: {
    he: {
      name: 'Nhựt Hạ',
      portraitUrl: 'he-002.webp',
      alt: 'Chân dung chú rể',
      intro:
        'Ngày ấy, anh chẳng phải hình mẫu cô thích, thậm chí còn từng bị cô ghét vì học giỏi và lạc quan đến đáng ghét. Nhưng chính sự lạc quan và tử tế của anh đã khiến cô vui vẻ hơn, nhẹ nhàng hơn, và nhìn mọi thứ bằng một ánh mắt khác.',
    },
    she: {
      name: 'Hoa Hạ',
      portraitUrl: 'she-002.webp',
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
      image: 'album/timeline-1.webp',
      imageStyle: 'landscape',
    },
    {
      year: '2016',
      title: 'Cái nắm tay đầu tiên',
      description:
        'Tháng Sáu, trước kỳ thi đại học, một cái nắm tay mở đầu câu chuyện. Bộ phim Me Before You, chuyến đi đầu tiên & những ngày tháng thanh xuân đẹp nhất của hai đứa bắt đầu...',
      icon: '🤝',
      image: 'album/timeline-2.webp',
      imageStyle: 'portrait',
    },
    {
      year: '2017 – 2024',
      title: 'Cùng nhau lớn lên',
      description:
        'Cùng học, cùng làm, cùng tốt nghiệp và rong ruổi qua những cung đường Tây Bắc, miền Tây cùng bao vùng đất mới. Bình dị thôi, nhưng luôn có nhau.',
      icon: '🛣️',
      image: 'album/timeline-3.webp',
      imageStyle: 'portrait',
    },
    {
      year: '2025',
      title: 'Một lời hứa',
      description:
        'Một tối tháng 11 ở Monad Stopover, trong ngôi nhà gỗ bên lưng đồi, một chiếc nhẫn và lời cầu hôn mở ra hành trình dài hơn của hai đứa.',
      icon: '💍',
      image: 'album/timeline-4-v002.webp',
      imageStyle: 'portrait',
    },
    {
      year: '2026',
      title: 'Đám Cưới Của Chúng Mình',
      description:
        'Từ cái nắm tay đầu tiên đến mười năm có nhau, hôm nay, giữa những người thân yêu, chúng mình cùng bắt đầu một chương mới, gửi vào đó là lời hẹn ước dài lâu và những điều tốt đẹp nhất.',
      icon: '🥂',
      image: 'album/timeline-5-v002.webp',
      imageStyle: 'landscape',
    },
  ],
  schedule: [
    { time: '16:30', label: 'LỄ VOW' },
    { time: '18:00', label: 'ĐÓN KHÁCH' },
    { time: '19:00', label: 'KHAI TIỆC' },
  ],
  albumStackThreshold: 1,
  albumTransitionDuration: 0.7,
  albumAutoStackDelay: 3,
  album: [
    {
      imageUrl: 'album/album-2-v002.webp',
      alt: '',
      caption: '#11.2026',
    },
    {
      imageUrl: 'album/album-5.webp',
      alt: '#Sapa-9.2024',
      caption: '#Sapa-9.2024',
    },
    {
      imageUrl: 'album/album-6.webp',
      alt: '#LongBien-9.2024',
      caption: '#LongBien-9.2024',
    },
    {
      imageUrl: 'album/album-7.webp',
      alt: '#SocSon-9.2024',
      caption: '#SocSon-9.2024',
    },
    {
      imageUrl: 'album/album-8.webp',
      alt: '#Sapa-9.2024',
      caption: '#Sapa-9.2024',
    },
    {
      imageUrl: 'album/album-9.webp',
      alt: '#HaNoi-9.2024',
      caption: '#HaNoi-9.2024',
    },
    {
      imageUrl: 'album/album-10.webp',
      alt: '#SocSon-9.2024',
      caption: '#SocSon-9.2024',
    },
    {
      imageUrl: 'album/album-3-v002.webp',
      alt: '',
      caption: '#11.2026',
    },
    {
      imageUrl: 'album/album-4-v002.webp',
      alt: '',
      caption: '#11.2026',
    },
  ],
  proposalStory:
    'Một buổi tối ở Monad Stopover, giữa khung cảnh đèo Bảo Lộc yên bình, anh trao em chiếc nhẫn cùng lời cầu hôn đã được chờ đợi từ lâu. Sau những năm tháng cùng nhau đi qua tuổi trẻ, chúng mình chọn tiếp tục hành trình ấy, lần này bằng một lời hứa dài lâu.',
  closingQuote:
    'Điều đẹp nhất không phải là đã đi được bao xa, mà là sau từng ấy năm, quay lại vẫn thấy người bên cạnh là người mình muốn cùng đi tiếp.',
  closingQuoteAuthor: 'Chúng mình',
  constellation: {
    // Dawn starts at 0.175. Begin starlight immediately after it arrives.
    drawStart: 0.18,
    drawDuration: 0.8,
    opacityStart: 0.176,
    opacityDuration: 0.22,
  },
};
