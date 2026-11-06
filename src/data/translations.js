// Bilingual translations for PixelCoder tasks
export const TRANSLATIONS = {
  python: {
    1: {
      question: {
        en: 'Create a variable named hero_name with value "Aria" and hero_level with value 1. Then print both on separate lines using print().',
        id: 'Buat variabel bernama hero_name dengan nilai "Aria" dan hero_level dengan nilai 1. Lalu print keduanya di baris terpisah menggunakan print().'
      },
      hint: {
        en: 'Variables in Python don\'t need type declaration. Use print(variable_name) to output.\n\nCode example:\nhero_name = "Aria"\nhero_level = 1\nprint(hero_name)\nprint(hero_level)',
        id: 'Variabel di Python tidak perlu deklarasi tipe. Gunakan print(nama_variabel) untuk output.\n\nContoh kode:\nhero_name = "Aria"\nhero_level = 1\nprint(hero_name)\nprint(hero_level)'
      }
    },
    2: {
      question: {
        en: 'Convert mana_str = "80" to an integer, multiply it by 2, and store the result in total_mana. Print total_mana.',
        id: 'Ubah mana_str = "80" menjadi integer, kalikan dengan 2, lalu simpan hasilnya di total_mana. Print total_mana.'
      },
      hint: {
        en: 'Use int() to convert string to integer. Then multiply with * operator.\n\nCode example:\nmana_str = "80"\ntotal_mana = int(mana_str) * 2\nprint(total_mana)',
        id: 'Gunakan int() untuk mengubah string ke integer. Lalu kalikan dengan operator *.\n\nContoh kode:\nmana_str = "80"\ntotal_mana = int(mana_str) * 2\nprint(total_mana)'
      }
    },
    3: {
      question: {
        en: 'Given player_gold = 150 and sword_cost = 120. Calculate remaining_gold = player_gold - sword_cost. Check if can_afford_potion = remaining_gold >= 50. Print remaining_gold and then can_afford_potion.',
        id: 'Diberikan player_gold = 150 dan sword_cost = 120. Hitung remaining_gold = player_gold - sword_cost. Cek apakah can_afford_potion = remaining_gold >= 50. Print remaining_gold lalu can_afford_potion.'
      },
      hint: {
        en: 'Use >= operator to compare numbers. It returns True or False (boolean).\n\nCode example:\nplayer_gold = 150\nsword_cost = 120\nremaining_gold = player_gold - sword_cost\ncan_afford_potion = remaining_gold >= 50\nprint(remaining_gold)\nprint(can_afford_potion)',
        id: 'Gunakan operator >= untuk membandingkan angka. Hasilnya True atau False (boolean).\n\nContoh kode:\nplayer_gold = 150\nsword_cost = 120\nremaining_gold = player_gold - sword_cost\ncan_afford_potion = remaining_gold >= 50\nprint(remaining_gold)\nprint(can_afford_potion)'
      }
    },
    4: {
      question: {
        en: 'Create a function evaluate_boss(boss_hp). If boss_hp <= 0 return "Defeated". If boss_hp <= 50 return "Enraged". Otherwise return "Fighting". Call and print evaluate_boss(35).',
        id: 'Buat fungsi evaluate_boss(boss_hp). Jika boss_hp <= 0 return "Defeated". Jika boss_hp <= 50 return "Enraged". Lainnya return "Fighting". Panggil dan print evaluate_boss(35).'
      },
      hint: {
        en: 'Use if/elif/else for multiple conditions. Indentation defines blocks in Python.\n\nCode example:\ndef evaluate_boss(boss_hp):\n    if boss_hp <= 0:\n        return "Defeated"\n    elif boss_hp <= 50:\n        return "Enraged"\n    else:\n        return "Fighting"\nprint(evaluate_boss(35))',
        id: 'Gunakan if/elif/else untuk banyak kondisi. Indentasi mendefinisikan blok di Python.\n\nContoh kode:\ndef evaluate_boss(boss_hp):\n    if boss_hp <= 0:\n        return "Defeated"\n    elif boss_hp <= 50:\n        return "Enraged"\n    else:\n        return "Fighting"\nprint(evaluate_boss(35))'
      }
    },
    5: {
      question: {
        en: 'Use a for loop and range() to print all even numbers from 2 to 10 inclusive, each on its own line.',
        id: 'Gunakan for loop dan range() untuk print semua angka genap 2-10 inclusive, tiap angka baris baru.'
      },
      hint: {
        en: 'range(start, stop, step) with step=2 gives even numbers. range(2, 11, 2) = 2,4,6,8,10.\n\nCode example:\nfor i in range(2, 11, 2):\n    print(i)',
        id: 'range(start, stop, step) dengan step=2 menghasilkan angka genap. range(2, 11, 2) = 2,4,6,8,10.\n\nContoh kode:\nfor i in range(2, 11, 2):\n    print(i)'
      }
    },
    6: {
      question: {
        en: 'Create inventory = ["potion", "shield"]. Append "sword" and print inventory.',
        id: 'Buat inventory = ["potion", "shield"]. Append "sword" dan print inventory.'
      },
      hint: {
        en: 'Use .append() to add item to end of list. Then print the list.\n\nCode example:\ninventory = ["potion", "shield"]\ninventory.append("sword")\nprint(inventory)',
        id: 'Gunakan .append() untuk tambah item ke akhir list. Lalu print list-nya.\n\nContoh kode:\ninventory = ["potion", "shield"]\ninventory.append("sword")\nprint(inventory)'
      }
    },
    7: {
      question: {
        en: 'Create hero = {"name": "Pixel", "hp": 100}. Print hero["hp"].',
        id: 'Buat hero = {"name": "Pixel", "hp": 100}. Print hero["hp"].'
      },
      hint: {
        en: 'Access dictionary values using square brackets with the key name.\n\nCode example:\nhero = {"name": "Pixel", "hp": 100}\nprint(hero["hp"])',
        id: 'Akses nilai dictionary pakai bracket notation dengan key-nya.\n\nContoh kode:\nhero = {"name": "Pixel", "hp": 100}\nprint(hero["hp"])'
      }
    },
    8: {
      question: {
        en: 'Define sum_all(*nums) that returns sum(nums). Print sum_all(10, 20, 30).',
        id: 'Definikan sum_all(*nums) yang return sum(nums). Print sum_all(10, 20, 30).'
      },
      hint: {
        en: '*args collects all positional arguments into a tuple. Use sum() to add them.\n\nCode example:\ndef sum_all(*nums):\n    return sum(nums)\nprint(sum_all(10, 20, 30))',
        id: '*args kumpulkan semua argumen posisi jadi tuple. Pakai sum() untuk jumlahkan.\n\nContoh kode:\ndef sum_all(*nums):\n    return sum(nums)\nprint(sum_all(10, 20, 30))'
      }
    },
    9: {
      question: {
        en: 'Use lambda to double [1, 2, 3] and print list(result).',
        id: 'Gunakan lambda untuk double [1, 2, 3] dan print list(result).'
      },
      hint: {
        en: 'lambda x: x*2 creates anonymous function. map() applies it to each element.\n\nCode example:\nnums = [1, 2, 3]\nprint(list(map(lambda x: x*2, nums)))',
        id: 'lambda x: x*2 bikin fungsi anonim. map() terapin ke tiap elemen.\n\nContoh kode:\nnums = [1, 2, 3]\nprint(list(map(lambda x: x*2, nums)))'
      }
    },
    10: {
      question: {
        en: 'Create class Knight with self.atk = 50. Instantiate and print knight.atk.',
        id: 'Buat class Knight dengan self.atk = 50. Instantiate dan print knight.atk.'
      },
      hint: {
        en: 'Use class keyword, __init__ for constructor, self for instance attributes.\n\nCode example:\nclass Knight:\n    def __init__(self):\n        self.atk = 50\nk = Knight()\nprint(k.atk)',
        id: 'Gunakan keyword class, __init__ untuk constructor, self untuk atribut instance.\n\nContoh kode:\nclass Knight:\n    def __init__(self):\n        self.atk = 50\nk = Knight()\nprint(k.atk)'
      }
    },
    11: {
      question: {
        en: 'Subclass Hero from Entity. Print "Inherited".',
        id: 'Subclass Hero dari Entity. Print "Inherited".'
      },
      hint: {
        en: 'Inheritance: class Child(Parent). Child gets all Parent attributes/methods.\n\nCode example:\nclass Entity:\n    pass\nclass Hero(Entity):\n    pass\nprint("Inherited")',
        id: 'Inheritance: class Child(Parent). Child dapet semua atribut/metode Parent.\n\nContoh kode:\nclass Entity:\n    pass\nclass Hero(Entity):\n    pass\nprint("Inherited")'
      }
    },
    12: {
      question: {
        en: 'Write generator yield_mana() yielding 10 then 20.',
        id: 'Tulis generator yield_mana() yang yield 10 lalu 20.'
      },
      hint: {
        en: 'Generators use yield instead of return. They produce values lazily.\n\nCode example:\ndef yield_mana():\n    yield 10\n    yield 20\nfor m in yield_mana():\n    print(m)',
        id: 'Generator pakai yield bukan return. Menghasilkan nilai secara lazy.\n\nContoh kode:\ndef yield_mana():\n    yield 10\n    yield 20\nfor m in yield_mana():\n    print(m)'
      }
    },
    13: {
      question: {
        en: 'Simulate file read with content = "SAVE_POINT". Print content.',
        id: 'Simulasi baca file dengan content = "SAVE_POINT". Print content.'
      },
      hint: {
        en: 'File handling uses with open() for safety. Here we simulate with variable.\n\nCode example:\ncontent = "SAVE_POINT"\nprint(content)',
        id: 'File handling pakai with open() untuk safety. Di sini simulasi pakai variabel.\n\nContoh kode:\ncontent = "SAVE_POINT"\nprint(content)'
      }
    },
    14: {
      question: {
        en: 'Catch ZeroDivisionError and print "Shield Protected".',
        id: 'Tangkap ZeroDivisionError dan print "Shield Protected".'
      },
      hint: {
        en: 'try/except catches specific exceptions. ZeroDivisionError for divide by zero.\n\nCode example:\ntry:\n    x = 10 / 0\nexcept ZeroDivisionError:\n    print("Shield Protected")',
        id: 'try/except tangkap exception spesifik. ZeroDivisionError untuk bagi nol.\n\nContoh kode:\ntry:\n    x = 10 / 0\nexcept ZeroDivisionError:\n    print("Shield Protected")'
      }
    },
    15: {
      question: {
        en: 'Calculate total damage: attacks = [40, 60, 80], boss_hp = 180. Print "Boss Defeated" if sum(attacks) >= boss_hp.',
        id: 'Hitung total damage: attacks = [40, 60, 80], boss_hp = 180. Print "Boss Defeated" jika sum(attacks) >= boss_hp.'
      },
      hint: {
        en: 'sum() adds all list elements. Compare with >= for victory condition.\n\nCode example:\nattacks = [40, 60, 80]\nboss_hp = 180\nif sum(attacks) >= boss_hp:\n    print("Boss Defeated")',
        id: 'sum() jumlahin semua elemen list. Bandingin dengan >= untuk kondisi menang.\n\nContoh kode:\nattacks = [40, 60, 80]\nboss_hp = 180\nif sum(attacks) >= boss_hp:\n    print("Boss Defeated")'
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
        en: 'Use cout << "text" << endl; Remember to include <iostream> and using namespace std;\n\nCode example:\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Ready Player 1" << endl;\n    return 0;\n}',
        id: 'Gunakan cout << "teks" << endl; Jangan lupa include <iostream> dan using namespace std;\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Ready Player 1" << endl;\n    return 0;\n}'
      }
    },
    2: {
      question: {
        en: 'Declare int shields = 50 and double shieldMultiplier = 1.5. Output shields * shieldMultiplier.',
        id: 'Deklarasikan int shields = 50 dan double shieldMultiplier = 1.5. Output shields * shieldMultiplier.'
      },
      hint: {
        en: 'Declare variables with types. int for integers, double for decimals. Use * for multiplication.\n\nCode example:\n#include <iostream>\nusing namespace std;\nint main() {\n    int shields = 50;\n    double shieldMultiplier = 1.5;\n    cout << shields * shieldMultiplier << endl;\n    return 0;\n}',
        id: 'Deklarasikan variabel dengan tipe. int untuk integer, double untuk desimal. Pakai * untuk kali.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nint main() {\n    int shields = 50;\n    double shieldMultiplier = 1.5;\n    cout << shields * shieldMultiplier << endl;\n    return 0;\n}'
      }
    },
    3: {
      question: {
        en: 'Given int baseAtk = 20 and int buff = 15. Store their sum in int finalAtk and print "Attack: " followed by finalAtk.',
        id: 'Diberikan int baseAtk = 20 dan int buff = 15. Simpan jumlahnya di int finalAtk dan print "Attack: " diikuti finalAtk.'
      },
      hint: {
        en: 'Add two ints with +. Concatenate string + int with << operator.\n\nCode example:\n#include <iostream>\nusing namespace std;\nint main() {\n    int baseAtk = 20;\n    int buff = 15;\n    int finalAtk = baseAtk + buff;\n    cout << "Attack: " << finalAtk << endl;\n    return 0;\n}',
        id: 'Tambah dua int dengan +. Gabungkan string + int dengan operator <<.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nint main() {\n    int baseAtk = 20;\n    int buff = 15;\n    int finalAtk = baseAtk + buff;\n    cout << "Attack: " << finalAtk << endl;\n    return 0;\n}'
      }
    },
    4: {
      question: {
        en: 'Given int durability = 25. If durability > 50 print "Pristine", else if durability >= 20 print "Worn", else print "Broken".',
        id: 'Diberikan int durability = 25. Jika durability > 50 print "Pristine", else if durability >= 20 print "Worn", else print "Broken".'
      },
      hint: {
        en: 'Use if/else if/else chain. Conditions checked top to bottom.\n\nCode example:\n#include <iostream>\nusing namespace std;\nint main() {\n    int durability = 25;\n    if (durability > 50) cout << "Pristine";\n    else if (durability >= 20) cout << "Worn";\n    else cout << "Broken";\n    return 0;\n}',
        id: 'Gunakan rantai if/else if/else. Kondisi dicek dari atas ke bawah.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nint main() {\n    int durability = 25;\n    if (durability > 50) cout << "Pristine";\n    else if (durability >= 20) cout << "Worn";\n    else cout << "Broken";\n    return 0;\n}'
      }
    },
    5: {
      question: {
        en: 'Use a for loop to calculate the sum of numbers from 1 to 5 inclusive. Store in int totalSum = 0 and print totalSum.',
        id: 'Gunakan for loop untuk hitung jumlah angka 1-5 inclusive. Simpan di int totalSum = 0 dan print totalSum.'
      },
      hint: {
        en: 'for loop: for(int i=1; i<=5; i++) totalSum += i; adds each number.\n\nCode example:\n#include <iostream>\nusing namespace std;\nint main() {\n    int totalSum = 0;\n    for(int i = 1; i <= 5; i++) totalSum += i;\n    cout << totalSum << endl;\n    return 0;\n}',
        id: 'for loop: for(int i=1; i<=5; i++) totalSum += i; menjumlahkan tiap angka.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nint main() {\n    int totalSum = 0;\n    for(int i = 1; i <= 5; i++) totalSum += i;\n    cout << totalSum << endl;\n    return 0;\n}'
      }
    },
    6: {
      question: {
        en: 'Declare int gems[3] = {10, 20, 30}. Print gems[1].',
        id: 'Deklarasikan int gems[3] = {10, 20, 30}. Print gems[1].'
      },
      hint: {
        en: 'Arrays are zero-indexed. gems[1] is the second element (20).\n\nCode example:\n#include <iostream>\nusing namespace std;\nint main() {\n    int gems[3] = {10, 20, 30};\n    cout << gems[1] << endl;\n    return 0;\n}',
        id: 'Array zero-indexed. gems[1] adalah elemen kedua (20).\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nint main() {\n    int gems[3] = {10, 20, 30};\n    cout << gems[1] << endl;\n    return 0;\n}'
      }
    },
    7: {
      question: {
        en: 'Create int mana = 100; int &ref = mana; Print ref.',
        id: 'Buat int mana = 100; int &ref = mana; Print ref.'
      },
      hint: {
        en: 'Reference (&) creates alias. ref and mana refer to same memory.\n\nCode example:\n#include <iostream>\nusing namespace std;\nint main() {\n    int mana = 100;\n    int &ref = mana;\n    cout << ref << endl;\n    return 0;\n}',
        id: 'Reference (&) bikin alias. ref dan mana refer ke memori yang sama.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nint main() {\n    int mana = 100;\n    int &ref = mana;\n    cout << ref << endl;\n    return 0;\n}'
      }
    },
    8: {
      question: {
        en: 'int hp = 50; int* ptr = &hp; Print *ptr.',
        id: 'int hp = 50; int* ptr = &hp; Print *ptr.'
      },
      hint: {
        en: '& gets address, * dereferences pointer to get value.\n\nCode example:\n#include <iostream>\nusing namespace std;\nint main() {\n    int hp = 50;\n    int* ptr = &hp;\n    cout << *ptr << endl;\n    return 0;\n}',
        id: '& dapatkan alamat, * dereference pointer untuk dapat nilai.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nint main() {\n    int hp = 50;\n    int* ptr = &hp;\n    cout << *ptr << endl;\n    return 0;\n}'
      }
    },
    9: {
      question: {
        en: 'Write void heal(int &hp) that adds 25. Call heal on int p=75 and print p.',
        id: 'Tulis void heal(int &hp) yang nambah 25. Panggil heal pada int p=75 dan print p.'
      },
      hint: {
        en: 'Pass by reference (& in parameter) lets function modify caller variable.\n\nCode example:\n#include <iostream>\nusing namespace std;\nvoid heal(int &hp) { hp += 25; }\nint main() {\n    int p = 75;\n    heal(p);\n    cout << p << endl;\n    return 0;\n}',
        id: 'Pass by reference (& di parameter) biar fungsi bisa ubah variabel caller.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nvoid heal(int &hp) { hp += 25; }\nint main() {\n    int p = 75;\n    heal(p);\n    cout << p << endl;\n    return 0;\n}'
      }
    },
    10: {
      question: {
        en: 'Create class Hero with public method attack() returning 40. Print result.',
        id: 'Buat class Hero dengan public method attack() return 40. Print hasilnya.'
      },
      hint: {
        en: 'Class with private field and public getter method for encapsulation.\n\nCode example:\n#include <iostream>\nusing namespace std;\nclass Hero { int atk = 40; public: int attack() { return atk; } };\nint main() { Hero h; cout << h.attack() << endl; return 0; }',
        id: 'Class dengan field private dan public getter untuk enkapsulasi.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nclass Hero { int atk = 40; public: int attack() { return atk; } };\nint main() { Hero h; cout << h.attack() << endl; return 0; }'
      }
    },
    11: {
      question: {
        en: 'Constructor that initializes score = 999. Print score.',
        id: 'Constructor yang inisialisasi score = 999. Print score.'
      },
      hint: {
        en: 'Constructor runs on object creation. Initialize members in initializer list.\n\nCode example:\n#include <iostream>\nusing namespace std;\nclass Hero { int score; public: Hero(): score(999) {} int get() { return score; } };\nint main() { Hero h; cout << h.get() << endl; return 0; }',
        id: 'Constructor jalan pas object dibuat. Inisialisasi member di initializer list.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nclass Hero { int score; public: Hero(): score(999) {} int get() { return score; } };\nint main() { Hero h; cout << h.get() << endl; return 0; }'
      }
    },
    12: {
      question: {
        en: 'Print "Virtual Sword Attack".',
        id: 'Print "Virtual Sword Attack".'
      },
      hint: {
        en: 'Virtual functions enable polymorphism. Derived class overrides base method.\n\nCode example:\n#include <iostream>\nusing namespace std;\nclass Weapon { virtual string hit() { return "Attack"; } };\nclass Sword : public Weapon { string hit() override { return "Virtual Sword Attack"; } };\nint main() { Weapon* w = new Sword(); cout << w->hit() << endl; return 0; }',
        id: 'Fungsi virtual enable polymorphism. Derived class override metode base.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\nclass Weapon { virtual string hit() { return "Attack"; } };\nclass Sword : public Weapon { string hit() override { return "Virtual Sword Attack"; } };\nint main() { Weapon* w = new Sword(); cout << w->hit() << endl; return 0; }'
      }
    },
    13: {
      question: {
        en: 'Push 1, 2 into vector<int> v and print v.size().',
        id: 'Push 1, 2 ke vector<int> v dan print v.size().'
      },
      hint: {
        en: 'vector::push_back adds elements. size() returns element count.\n\nCode example:\n#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> v;\n    v.push_back(1);\n    v.push_back(2);\n    cout << v.size() << endl;\n    return 0;\n}',
        id: 'vector::push_back nambah elemen. size() return jumlah elemen.\n\nContoh kode:\n#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> v;\n    v.push_back(1);\n    v.push_back(2);\n    cout << v.size() << endl;\n    return 0;\n}'
      }
    },
    14: {
      question: {
        en: 'Template maxVal returning larger of two values. Test with 15, 25.',
        id: 'Template maxVal return nilai lebih besar dari dua nilai. Test dengan 15, 25.'
      },
      hint: {
        en: 'Templates create generic functions. Use ternary operator for max.\n\nCode example:\n#include <iostream>\nusing namespace std;\ntemplate<typename T> T maxVal(T a, T b) { return a > b ? a : b; }\nint main() { cout << maxVal(15, 25) << endl; return 0; }',
        id: 'Template bikin fungsi generik. Pakai ternary operator untuk max.\n\nContoh kode:\n#include <iostream>\nusing namespace std;\ntemplate<typename T> T maxVal(T a, T b) { return a > b ? a : b; }\nint main() { cout << maxVal(15, 25) << endl; return 0; }'
      }
    },
    15: {
      question: {
        en: 'Allocate dynamic buffer and output "Memory Secure".',
        id: 'Alokasikan dynamic buffer dan output "Memory Secure".'
      },
      hint: {
        en: 'Combine vector (RAII), templates, and pointers for memory-safe systems.\n\nCode example:\n#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> buffer(1024);\n    cout << "Memory Secure" << endl;\n    return 0;\n}',
        id: 'Gabungkan vector (RAII), template, dan pointer untuk sistem memory-safe.\n\nContoh kode:\n#include <iostream>\n#include <vector>\nusing namespace std;\nint main() {\n    vector<int> buffer(1024);\n    cout << "Memory Secure" << endl;\n    return 0;\n}'
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
        en: 'Use const for variables that won\'t change. Syntax: const name = value;\n\nCode example:\nconst hero = "PixelMage";\nconsole.log(hero);',
        id: 'Gunakan const untuk variabel yang tidak berubah. Sintaks: const nama = nilai;\n\nContoh kode:\nconst hero = "PixelMage";\nconsole.log(hero);'
      }
    },
    2: {
      question: {
        en: 'Declare const gameTitle = "Pixel Quest" and let stage = 1. Log both separated by a space using console.log().',
        id: 'Deklarasikan const gameTitle = "Pixel Quest" dan let stage = 1. Log keduanya dipisah spasi pakai console.log().'
      },
      hint: {
        en: 'const for immutable, let for mutable. console.log(a, b) prints with space.\n\nCode example:\nconst gameTitle = "Pixel Quest";\nlet stage = 1;\nconsole.log(gameTitle, stage);',
        id: 'const untuk immutable, let untuk mutable. console.log(a, b) print dengan spasi.\n\nContoh kode:\nconst gameTitle = "Pixel Quest";\nlet stage = 1;\nconsole.log(gameTitle, stage);'
      }
    },
    3: {
      question: {
        en: 'Given const quest = "dragon hunt" and const reward = 500. Create const summary = `Quest: ${quest.toUpperCase()} | Reward: ${reward} Gold` and log summary.',
        id: 'Diberikan const quest = "dragon hunt" dan const reward = 500. Buat const summary = `Quest: ${quest.toUpperCase()} | Reward: ${reward} Gold` dan log summary.'
      },
      hint: {
        en: 'Template literals use backticks (`) and ${expression} for interpolation.\n\nCode example:\nconst quest = "dragon hunt";\nconst reward = 500;\nconst summary = `Quest: ${quest.toUpperCase()} | Reward: ${reward} Gold`;\nconsole.log(summary);',
        id: 'Template literal pakai backticks (`) dan ${expression} untuk interpolasi.\n\nContoh kode:\nconst quest = "dragon hunt";\nconst reward = 500;\nconst summary = `Quest: ${quest.toUpperCase()} | Reward: ${reward} Gold`;\nconsole.log(summary);'
      }
    },
    4: {
      question: {
        en: 'Write an arrow function calculateXP = (base, multiplier) => base * multiplier. Log calculateXP(100, 2.5).',
        id: 'Tulis arrow function calculateXP = (base, multiplier) => base * multiplier. Log calculateXP(100, 2.5).'
      },
      hint: {
        en: 'Arrow functions: (params) => expression. Implicit return for single expression.\n\nCode example:\nconst calculateXP = (base, multiplier) => base * multiplier;\nconsole.log(calculateXP(100, 2.5));',
        id: 'Arrow function: (params) => expression. Implicit return untuk single expression.\n\nContoh kode:\nconst calculateXP = (base, multiplier) => base * multiplier;\nconsole.log(calculateXP(100, 2.5));'
      }
    },
    5: {
      question: {
        en: 'Given const inventory = [12, 5, 20, 8, 30]. Use .filter() to keep only numbers >= 10 in const rareItems. Log JSON.stringify(rareItems).',
        id: 'Diberikan const inventory = [12, 5, 20, 8, 30]. Gunakan .filter() simpan angka >= 10 di const rareItems. Log JSON.stringify(rareItems).'
      },
      hint: {
        en: 'filter() creates new array with elements passing the test function.\n\nCode example:\nconst inventory = [12, 5, 20, 8, 30];\nconst rareItems = inventory.filter(x => x >= 10);\nconsole.log(JSON.stringify(rareItems));',
        id: 'filter() bikin array baru dengan elemen lolos test function.\n\nContoh kode:\nconst inventory = [12, 5, 20, 8, 30];\nconst rareItems = inventory.filter(x => x >= 10);\nconsole.log(JSON.stringify(rareItems));'
      }
    },
    6: {
      question: {
        en: 'Given const character = { name: "Byte", health: 100, weapon: "Pixel Blade" }. Destructure name and weapon from character, and log them separated by space.',
        id: 'Diberikan const character = { name: "Byte", health: 100, weapon: "Pixel Blade" }. Destructure name dan weapon dari character, log dipisah spasi.'
      },
      hint: {
        en: 'Destructuring: const { name, weapon } = object; extracts properties.\n\nCode example:\nconst character = { name: "Byte", health: 100, weapon: "Pixel Blade" };\nconst { name, weapon } = character;\nconsole.log(name, weapon);',
        id: 'Destructuring: const { name, weapon } = object; ekstrak properti.\n\nContoh kode:\nconst character = { name: "Byte", health: 100, weapon: "Pixel Blade" };\nconst { name, weapon } = character;\nconsole.log(name, weapon);'
      }
    },
    7: {
      question: {
        en: 'Combine arr1=[1,2] and arr2=[3,4] with spread. Log result.',
        id: 'Gabungkan arr1=[1,2] dan arr2=[3,4] dengan spread. Log hasilnya.'
      },
      hint: {
        en: 'Spread operator (...) expands arrays into elements.\n\nCode example:\nconsole.log([...[1,2], ...[3,4]]);',
        id: 'Spread operator (...) expand array jadi elemen-elemen.\n\nContoh kode:\nconsole.log([...[1,2], ...[3,4]]);'
      }
    },
    8: {
      question: {
        en: 'Resolve a Promise with "Loaded" and log it.',
        id: 'Resolve Promise dengan "Loaded" dan log.'
      },
      hint: {
        en: 'Promise.resolve() creates resolved promise. .then() handles success.\n\nCode example:\nPromise.resolve("Loaded").then(console.log);',
        id: 'Promise.resolve() bikin promise resolved. .then() handle success.\n\nContoh kode:\nPromise.resolve("Loaded").then(console.log);'
      }
    },
    9: {
      question: {
        en: 'Write async function loadGame() returning "Game Active". Log it.',
        id: 'Tulis async function loadGame() return "Game Active". Log.'
      },
      hint: {
        en: 'async functions auto-return Promise. Call with .then() or await.\n\nCode example:\nasync function loadGame() { return "Game Active"; }\nloadGame().then(console.log);',
        id: 'async function auto-return Promise. Panggil dengan .then() atau await.\n\nContoh kode:\nasync function loadGame() { return "Game Active"; }\nloadGame().then(console.log);'
      }
    },
    10: {
      question: {
        en: 'Log "Saved to Storage".',
        id: 'Log "Saved to Storage".'
      },
      hint: {
        en: 'localStorage.setItem(key, value) stores. localStorage.getItem(key) retrieves.\n\nCode example:\nlocalStorage.setItem("save", "checkpoint");\nconsole.log("Saved to Storage");',
        id: 'localStorage.setItem(key, value) simpan. localStorage.getItem(key) ambil.\n\nContoh kode:\nlocalStorage.setItem("save", "checkpoint");\nconsole.log("Saved to Storage");'
      }
    },
    11: {
      question: {
        en: 'Log "Button Clicked: XP +50".',
        id: 'Log "Button Clicked: XP +50".'
      },
      hint: {
        en: 'Create button element, add onclick handler, dispatch click.\n\nCode example:\nconst btn = document.createElement("button");\nbtn.textContent = "Click";\nbtn.onclick = () => console.log("Button Clicked: XP +50");\nbtn.click();',
        id: 'Buat element button, tambah onclick handler, dispatch click.\n\nContoh kode:\nconst btn = document.createElement("button");\nbtn.textContent = "Click";\nbtn.onclick = () => console.log("Button Clicked: XP +50");\nbtn.click();'
      }
    },
    12: {
      question: {
        en: 'Log "Module Loaded".',
        id: 'Log "Module Loaded".'
      },
      hint: {
        en: 'ES6 modules use export/import. Files must be served via HTTP.\n\nCode example:\n// utils.js\nexport const xp = 50;\n// main.js\nimport { xp } from "./utils.js";\nconsole.log("Module Loaded");',
        id: 'ES6 modules pakai export/import. File harus di-serve via HTTP.\n\nContoh kode:\n// utils.js\nexport const xp = 50;\n// main.js\nimport { xp } from "./utils.js";\nconsole.log("Module Loaded");'
      }
    },
    13: {
      question: {
        en: 'Create new Set([1,1,2,3]). Log its size.',
        id: 'Buat new Set([1,1,2,3]). Log size-nya.'
      },
      hint: {
        en: 'Set auto-removes duplicates. .size property returns count.\n\nCode example:\nconsole.log(new Set([1,1,2,3]).size);',
        id: 'Set auto-hapus duplikat. Properti .size return jumlah.\n\nContoh kode:\nconsole.log(new Set([1,1,2,3]).size);'
      }
    },
    14: {
      question: {
        en: 'Test /pixel/i on "PixelCoder". Log result.',
        id: 'Test /pixel/i pada "PixelCoder". Log hasilnya.'
      },
      hint: {
        en: 'RegExp /pattern/flags. test() returns boolean. i = case-insensitive.\n\nCode example:\nconsole.log(/pixel/i.test("PixelCoder"));',
        id: 'RegExp /pattern/flags. test() return boolean. i = case-insensitive.\n\nContoh kode:\nconsole.log(/pixel/i.test("PixelCoder"));'
      }
    },
    15: {
      question: {
        en: 'Log "Canvas Render 60FPS".',
        id: 'Log "Canvas Render 60FPS".'
      },
      hint: {
        en: 'Canvas: getContext("2d") for drawing. requestAnimationFrame for game loop.\n\nCode example:\nconst canvas = document.createElement("canvas");\nconst ctx = canvas.getContext("2d");\nctx.fillRect(10, 10, 100, 100);\nconsole.log("Canvas Render 60FPS");',
        id: 'Canvas: getContext("2d") untuk gambar. requestAnimationFrame untuk game loop.\n\nContoh kode:\nconst canvas = document.createElement("canvas");\nconst ctx = canvas.getContext("2d");\nctx.fillRect(10, 10, 100, 100);\nconsole.log("Canvas Render 60FPS");'
      }
    },
    16: {
      question: {
        en: 'Execute gameLoop() and print "Victory: Coding Master!".',
        id: 'Jalankan gameLoop() dan print "Victory: Coding Master!".'
      },
      hint: {
        en: 'Game loop with requestAnimationFrame recursively calls itself.\n\nCode example:\nfunction gameLoop() {\n    // update & render\n    requestAnimationFrame(gameLoop);\n}\ngameLoop();\nconsole.log("Victory: Coding Master!");',
        id: 'Game loop dengan requestAnimationFrame recursive call dirinya sendiri.\n\nContoh kode:\nfunction gameLoop() {\n    // update & render\n    requestAnimationFrame(gameLoop);\n}\ngameLoop();\nconsole.log("Victory: Coding Master!");'
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
