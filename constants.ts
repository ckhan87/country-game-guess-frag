
import { Country, Difficulty } from './types';

export const TOTAL_QUESTIONS = 20;

export const DIFFICULTY_CONFIG = {
  [Difficulty.EASY]: {
    duration: 180,
    optionCount: 3,
    multiplier: 1.0,
    label: '入门',
    color: 'border-green-500 text-green-400'
  },
  [Difficulty.MEDIUM]: {
    duration: 120,
    optionCount: 4,
    multiplier: 1.5,
    label: '进阶',
    color: 'border-blue-500 text-blue-400'
  },
  [Difficulty.HARD]: {
    duration: 60,
    optionCount: 4,
    multiplier: 2.5,
    label: '大师',
    color: 'border-red-500 text-red-400'
  }
};

export const COUNTRY_DATA: Country[] = [
  { id: "us", name: "United States", cnName: "美国", lat: 37, lon: -95 },
  { id: "br", name: "Brazil", cnName: "巴西", lat: -14, lon: -51 },
  { id: "au", name: "Australia", cnName: "澳大利亚", lat: -25, lon: 133 },
  { id: "fr", name: "France", cnName: "法国", lat: 46, lon: 2 },
  { id: "jp", name: "Japan", cnName: "日本", lat: 36, lon: 138 },
  { id: "in", name: "India", cnName: "印度", lat: 20, lon: 78 },
  { id: "gb", name: "United Kingdom", cnName: "英国", lat: 55, lon: -3 },
  { id: "ca", name: "Canada", cnName: "加拿大", lat: 56, lon: -106 },
  { id: "cn", name: "China", cnName: "中国", lat: 35, lon: 104 },
  { id: "eg", name: "Egypt", cnName: "埃及", lat: 26, lon: 30 },
  { id: "za", name: "South Africa", cnName: "南非", lat: -30, lon: 24 },
  { id: "ru", name: "Russia", cnName: "俄罗斯", lat: 61, lon: 105 },
  { id: "mx", name: "Mexico", cnName: "墨西哥", lat: 23, lon: -102 },
  { id: "ar", name: "Argentina", cnName: "阿根廷", lat: -38, lon: -63 },
  { id: "th", name: "Thailand", cnName: "泰国", lat: 15, lon: 100 },
  { id: "it", name: "Italy", cnName: "意大利", lat: 41, lon: 12 },
  { id: "es", name: "Spain", cnName: "西班牙", lat: 40, lon: -3 },
  { id: "tr", name: "Turkey", cnName: "土耳其", lat: 38, lon: 35 },
  { id: "id", name: "Indonesia", cnName: "印度尼西亚", lat: -0.7, lon: 113 },
  { id: "sa", name: "Saudi Arabia", cnName: "沙特阿拉伯", lat: 23, lon: 45 },
  { id: "de", name: "Germany", cnName: "德国", lat: 51, lon: 10 },
  { id: "kr", name: "South Korea", cnName: "韩国", lat: 36, lon: 127 },
  { id: "nz", name: "New Zealand", cnName: "新西兰", lat: -40, lon: 174 },
  { id: "se", name: "Sweden", cnName: "瑞典", lat: 60, lon: 18 },
  { id: "gr", name: "Greece", cnName: "希腊", lat: 39, lon: 22 },
  { id: "no", name: "Norway", cnName: "挪威", lat: 60, lon: 8 },
  { id: "ke", name: "Kenya", cnName: "肯尼亚", lat: -1, lon: 38 },
  { id: "pe", name: "Peru", cnName: "秘鲁", lat: -9, lon: -75 },
  { id: "vn", name: "Vietnam", cnName: "越南", lat: 14, lon: 108 },
  { id: "pl", name: "Poland", cnName: "波兰", lat: 52, lon: 19 },
  { id: "ch", name: "Switzerland", cnName: "瑞士", lat: 47, lon: 8 },
  { id: "cl", name: "Chile", cnName: "智利", lat: -35, lon: -71 },
  { id: "my", name: "Malaysia", cnName: "马来西亚", lat: 4, lon: 101 },
  { id: "fi", name: "Finland", cnName: "芬兰", lat: 61, lon: 25 },
  { id: "nl", name: "Netherlands", cnName: "荷兰", lat: 52, lon: 5 },
  { id: "at", name: "Austria", cnName: "奥地利", lat: 47, lon: 14 },
  { id: "pt", name: "Portugal", cnName: "葡萄牙", lat: 39, lon: -8 },
  { id: "cz", name: "Czech Republic", cnName: "捷克", lat: 49, lon: 15 },
  { id: "hu", name: "Hungary", cnName: "匈牙利", lat: 47, lon: 19 },
  { id: "ie", name: "Ireland", cnName: "爱尔兰", lat: 53, lon: -8 },
  { id: "ph", name: "Philippines", cnName: "菲律宾", lat: 13, lon: 121 },
  { id: "pk", name: "Pakistan", cnName: "巴基斯坦", lat: 30, lon: 69 },
  { id: "is", name: "Iceland", cnName: "冰岛", lat: 64, lon: -18 },
  { id: "il", name: "Israel", cnName: "以色列", lat: 31, lon: 35 },
  { id: "ua", name: "Ukraine", cnName: "乌克兰", lat: 48, lon: 31 },
  { id: "dz", name: "Algeria", cnName: "阿尔及利亚", lat: 28, lon: 1 },
  { id: "ng", name: "Nigeria", cnName: "尼日利亚", lat: 9, lon: 8 },
  { id: "ma", name: "Morocco", cnName: "摩洛哥", lat: 31, lon: -7 },
  { id: "sg", name: "Singapore", cnName: "新加坡", lat: 1.3, lon: 103 },
  { id: "co", name: "Colombia", cnName: "哥伦比亚", lat: 4, lon: -74 },
  { id: "kh", name: "Cambodia", cnName: "柬埔寨", lat: 12, lon: 104 }
];
