// Bilingual translations for PixelCoder tasks
export const TRANSLATIONS = {
  python: {
    1: {
      question: {
        en: 'Create a variable named hero_name with value "Aria" and hero_level with value 1. Then print both on separate lines using print().',
        id: 'Buat variabel bernama hero_name dengan nilai "Aria" dan hero_level dengan nilai 1. Lalu print keduanya di baris terpisah menggunakan print().'
      },
      hint: {
        en: 'Remember: variables in Python don\'t need type declaration. Use print(variable_name) to output.',
        id: 'Ingat: variabel di Python tidak perlu deklarasi tipe. Gunakan print(nama_variabel) untuk output.'
      }
    },
    2: {
      question: {
        en: 'Convert mana_str = "80" to an integer, multiply it by 2, and store the result in total_mana. Print total_mana.',
        id: 'Ubah mana_str = "80" menjadi integer, kalikan dengan 2, lalu simpan hasilnya di total_mana. Print total_mana.'
      },
      hint: {
        en: 'Use int() to convert string to integer. Example: num = int("42")',
        id: 'Gunakan int() untuk mengubah string ke integer. Contoh: num = int("42")'
      }
    },
    3: {
      question: {
        en: 'Given player_gold = 150 and sword_cost = 120. Calculate remaining_gold = player_gold - sword_cost. Check if can_afford_potion = remaining_gold >= 50. Print remaining_gold and then can_afford_potion.',
        id: 'Diberikan player_gold = 150 dan sword_cost = 120. Hitung remaining_gold = player_gold - sword_cost. Cek apakah can_afford_potion = remaining_gold >= 50. Print remaining_gold lalu can_afford_potion.'
      },
      hint: {
        en: 'Use >= operator to compare numbers. It returns True or False.',
        id: 'Gunakan operator >= untuk membandingkan angka. Hasilnya True atau False.'
      }
    }
  },
  cpp: {
    1: {
      question: {
        en: 'Print the message "Ready Player 1" to standard output followed by endl.',
        id: 'Print pesan "Ready Player 1" ke standard output diikuti dengan endl.'
      },
      hint: {
        en: 'Use cout << "text" << endl; Remember to include <iostream>',
        id: 'Gunakan cout << "teks" << endl; Jangan lupa include <iostream>'
      }
    }
  },
  javascript: {
    1: {
      question: {
        en: 'Declare a const variable hero with value "PixelMage" and log it using console.log().',
        id: 'Deklarasikan variabel const bernama hero dengan nilai "PixelMage" dan tampilkan dengan console.log().'
      },
      hint: {
        en: 'Use const for variables that won\'t change. Syntax: const name = value;',
        id: 'Gunakan const untuk variabel yang tidak berubah. Sintaks: const nama = nilai;'
      }
    }
  }
};

// Hint cost formula: base cost * stage number
export const getHintCost = (stageNumber) => {
  const BASE_HINT_COST = 25;
  return BASE_HINT_COST * stageNumber;
};

// Get translated text
export const getTranslation = (trackId, stageNumber, field, language = 'en') => {
  const track = TRANSLATIONS[trackId];
  if (!track || !track[stageNumber]) return null;
  
  const fieldData = track[stageNumber][field];
  return fieldData ? fieldData[language] : null;
};
