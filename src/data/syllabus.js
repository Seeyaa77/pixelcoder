export const SYLLABUS_TRACKS = {
  python: {
    id: 'python',
    name: 'Python',
    tagline: 'Clean, dynamic scripting for wizards & data mages',
    color: '#3B82F6',
    icon: '🐍',
    stages: [
      {
        stageNumber: 1,
        title: 'Variables & Data Types',
        xp: 100,
        concept: 'w3schools: Python Variables',
        theory: {
          en: 'Variables are containers for storing data values. In Python, variables are created the moment you first assign a value to it.\n\nExample:\nx = 5\nname = "PixelKnight"\nprint(x)\n\nPython has dynamic typing: you do not need to declare types explicitly!',
          id: 'Variabel adalah wadah untuk menyimpan nilai data. Di Python, variabel dibuat saat Anda pertama kali memberikan nilai padanya.\n\nContoh:\nx = 5\nname = "PixelKnight"\nprint(x)\n\nPython memiliki dynamic typing: Anda tidak perlu mendeklarasikan tipe secara eksplisit!'
        },
        taskType: 'code',
        question: 'Create a variable named hero_name with value "Aria" and hero_level with value 1. Then print both on separate lines using print().',
        starterCode: '# Create hero_name and hero_level below:\n\n',
        solution: 'hero_name = "Aria"\nhero_level = 1\nprint(hero_name)\nprint(hero_level)',
        expectedOutput: 'Aria\n1',
        regexMatch: 'hero_name\\s*=\\s*["\']Aria["\']'
      },
      {
        stageNumber: 2,
        title: 'Numbers & Casting',
        xp: 120,
        concept: 'w3schools: Python Casting',
        theory: {
          en: 'You can specify or change a type using casting functions like int(), float(), and str().\n\nExample:\nscore_str = "250"\nnumeric_score = int(score_str)\nprint(numeric_score + 50) # 300',
          id: 'Anda dapat menentukan atau mengubah tipe menggunakan fungsi casting seperti int(), float(), dan str().\n\nContoh:\nscore_str = "250"\nnumeric_score = int(score_str)\nprint(numeric_score + 50) # 300'
        },
        taskType: 'code',
        question: 'Convert mana_str = "80" to an integer, multiply it by 2, and store the result in total_mana. Print total_mana.',
        starterCode: 'mana_str = "80"\n# Convert and double it:\n',
        solution: 'mana_str = "80"\ntotal_mana = int(mana_str) * 2\nprint(total_mana)',
        expectedOutput: '160',
        regexMatch: 'int\\s*\\(\\s*mana_str\\s*\\)'
      },
      {
        stageNumber: 3,
        title: 'Operators & Booleans',
        xp: 150,
        concept: 'w3schools: Python Operators',
        theory: {
          en: 'Comparison operators compare two values and evaluate to True or False:\n== (Equal), != (Not equal), > (Greater), < (Less), >=, <=\n\nExample:\nshield = 40\nis_broken = shield <= 0 # False',
          id: 'Operator perbandingan membandingkan dua nilai dan mengevaluasi ke True atau False:\n== (Sama), != (Tidak sama), > (Lebih besar), < (Lebih kecil), >=, <=\n\nContoh:\nshield = 40\nis_broken = shield <= 0 # False'
        },
        taskType: 'code',
        question: 'Given player_gold = 150 and sword_cost = 120. Calculate remaining_gold = player_gold - sword_cost. Check if can_afford_potion = remaining_gold >= 50. Print remaining_gold and then can_afford_potion.',
        starterCode: 'player_gold = 150\nsword_cost = 120\n# Calculate and check:\n',
        solution: 'player_gold = 150\nsword_cost = 120\nremaining_gold = player_gold - sword_cost\ncan_afford_potion = remaining_gold >= 50\nprint(remaining_gold)\nprint(can_afford_potion)',
        expectedOutput: '30\nFalse',
        regexMatch: 'remaining_gold'
      },
      {
        stageNumber: 4,
        title: 'If...Else Branching',
        xp: 180,
        concept: 'w3schools: Python If...Else',
        theory: {
          en: 'Python conditions rely on indentation to define code blocks:\n\nif hp <= 0:\n    print("Defeated")\nelif hp < 30:\n    print("Danger")\nelse:\n    print("Safe")',
          id: 'Kondisi Python mengandalkan indentasi untuk mendefinisikan blok kode:\n\nif hp <= 0:\n    print("Defeated")\nelif hp < 30:\n    print("Danger")\nelse:\n    print("Safe")'
        },
        taskType: 'code',
        question: 'Create a function evaluate_boss(boss_hp). If boss_hp <= 0 return "Defeated". If boss_hp <= 50 return "Enraged". Otherwise return "Fighting". Call and print evaluate_boss(35).',
        starterCode: 'def evaluate_boss(boss_hp):\n    # Write logic here\n    pass\n\nprint(evaluate_boss(35))\n',
        solution: 'def evaluate_boss(boss_hp):\n    if boss_hp <= 0:\n        return "Defeated"\n    elif boss_hp <= 50:\n        return "Enraged"\n    else:\n        return "Fighting"\n\nprint(evaluate_boss(35))',
        expectedOutput: 'Enraged',
        regexMatch: 'def\\s+evaluate_boss'
      },
      {
        stageNumber: 5,
        title: 'Loops with Range',
        xp: 200,
        concept: 'w3schools: Python For Loops',
        theory: {
          en: 'The range() function returns a sequence of numbers, starting from 0 by default, and increments by 1, and stops before a specified number.\n\nExample:\nfor i in range(1, 4):\n    print(i) # 1, 2, 3',
          id: 'Fungsi range() mengembalikan urutan angka, dimulai dari 0 secara default, dan bertambah 1, dan berhenti sebelum angka yang ditentukan.\n\nContoh:\nfor i in range(1, 4):\n    print(i) # 1, 2, 3'
        },
        taskType: 'code',
        question: 'Use a for loop and range() to print all even numbers from 2 to 10 inclusive, each on its own line.',
        starterCode: '# Loop even numbers 2 to 10:\n',
        solution: 'for i in range(2, 11, 2):\n    print(i)',
        expectedOutput: '2\n4\n6\n8\n10',
        regexMatch: 'for\\s+.*in\\s+range'
      },
      { stageNumber: 6, title: 'Lists & Methods', xp: 220, concept: 'w3schools: Python Lists', theory: { en: 'Lists are ordered, changeable collections. You can add, remove, and modify elements.\n\nExample:\ninventory = ["potion", "shield"]\ninventory.append("sword")  # Add to end\nprint(inventory[0])  # Access first item', id: 'List adalah koleksi yang terurut dan dapat diubah. Anda bisa menambah, menghapus, dan memodifikasi elemen.\n\nContoh:\ninventory = ["potion", "shield"]\ninventory.append("sword")  # Tambah ke akhir\nprint(inventory[0])  # Akses item pertama' }, taskType: 'code', question: 'Create inventory = ["potion", "shield"]. Append "sword" and print inventory.', starterCode: 'inventory = ["potion", "shield"]\n', solution: 'inventory = ["potion", "shield"]\ninventory.append("sword")\nprint(inventory)', expectedOutput: "['potion', 'shield', 'sword']", regexMatch: 'append' },
            { stageNumber: 7, title: 'Dictionaries & Keys', xp: 240, concept: 'w3schools: Python Dictionaries', theory: { en: 'Dictionaries store data in key:value pairs. Keys must be unique and immutable.\n\nExample:\nhero = {"name": "Pixel", "hp": 100}\nprint(hero["name"])  # Access by key\nhero["mp"] = 50  # Add new key', id: 'Dictionary menyimpan data dalam pasangan key:value. Key harus unik dan immutable.\n\nContoh:\nhero = {"name": "Pixel", "hp": 100}\nprint(hero["name"])  # Akses via key\nhero["mp"] = 50  # Tambah key baru' }, taskType: 'code', question: 'Create hero = {"name": "Pixel", "hp": 100}. Print hero["hp"].', starterCode: '', solution: 'hero = {"name": "Pixel", "hp": 100}\nprint(hero["hp"])', expectedOutput: '100', regexMatch: 'hp' },
            { stageNumber: 8, title: 'Functions & *args', xp: 260, concept: 'w3schools: Python Functions', theory: { en: 'Functions with *args accept arbitrary positional arguments as a tuple.\n\nExample:\ndef sum_all(*nums):\n    return sum(nums)\nprint(sum_all(10, 20, 30))', id: 'Fungsi dengan *args menerima argumen posisi arbitrary sebagai tuple.\n\nContoh:\ndef sum_all(*nums):\n    return sum(nums)\nprint(sum_all(10, 20, 30))' }, taskType: 'code', question: 'Define sum_all(*nums) that returns sum(nums). Print sum_all(10, 20, 30).', starterCode: '', solution: 'def sum_all(*nums):\n    return sum(nums)\nprint(sum_all(10, 20, 30))', expectedOutput: '60', regexMatch: 'sum_all' },
            { stageNumber: 9, title: 'Lambda & Map', xp: 280, concept: 'w3schools: Python Lambda', theory: { en: 'Lambda creates small anonymous functions. map() applies a function to all items.\n\nExample:\nnums = [1, 2, 3]\ndoubled = list(map(lambda x: x*2, nums))\nprint(doubled)', id: 'Lambda membuat fungsi anonim kecil. map() menerapkan fungsi ke semua item.\n\nContoh:\nnums = [1, 2, 3]\ndoubled = list(map(lambda x: x*2, nums))\nprint(doubled)' }, taskType: 'code', question: 'Use lambda to double [1, 2, 3] and print list(result).', starterCode: 'nums = [1, 2, 3]\n', solution: 'nums = [1, 2, 3]\nprint(list(map(lambda x: x*2, nums)))', expectedOutput: '[2, 4, 6]', regexMatch: 'lambda' },
            { stageNumber: 10, title: 'Classes & Objects', xp: 300, concept: 'w3schools: Python Classes', theory: { en: 'Classes define blueprints. __init__ initializes instance attributes.\n\nExample:\nclass Knight:\n    def __init__(self):\n        self.atk = 50\nk = Knight()\nprint(k.atk)', id: 'Class mendefinisikan blueprint. __init__ menginisialisasi atribut instance.\n\nContoh:\nclass Knight:\n    def __init__(self):\n        self.atk = 50\nk = Knight()\nprint(k.atk)' }, taskType: 'code', question: 'Create class Knight with self.atk = 50. Instantiate and print knight.atk.', starterCode: '', solution: 'class Knight:\n    def __init__(self):\n        self.atk = 50\nk = Knight()\nprint(k.atk)', expectedOutput: '50', regexMatch: 'class\\s+Knight' },
            { stageNumber: 11, title: 'Inheritance & Super', xp: 320, concept: 'w3schools: Python Inheritance', theory: { en: 'Subclasses inherit from parent. super() calls parent methods.\n\nExample:\nclass Entity:\n    def __init__(self):\n        self.alive = True\nclass Hero(Entity):\n    pass\nh = Hero()\nprint(h.alive)', id: 'Subclass mewarisi dari parent. super() memanggil metode parent.\n\nContoh:\nclass Entity:\n    def __init__(self):\n        self.alive = True\nclass Hero(Entity):\n    pass\nh = Hero()\nprint(h.alive)' }, taskType: 'code', question: 'Subclass Hero from Entity. Print "Inherited".', starterCode: '', solution: 'class Entity:\n    pass\nclass Hero(Entity):\n    pass\nprint("Inherited")', expectedOutput: 'Inherited', regexMatch: 'Hero' },
            { stageNumber: 12, title: 'Iterators & Generators', xp: 350, concept: 'w3schools: Python Iterators', theory: { en: 'Generators use yield to produce values lazily, one at a time.\n\nExample:\ndef yield_mana():\n    yield 10\n    yield 20\nfor m in yield_mana():\n    print(m)', id: 'Generator menggunakan yield untuk menghasilkan nilai secara lazy, satu per satu.\n\nContoh:\ndef yield_mana():\n    yield 10\n    yield 20\nfor m in yield_mana():\n    print(m)' }, taskType: 'code', question: 'Write generator yield_mana() yielding 10 then 20.', starterCode: '', solution: 'def yield_mana():\n    yield 10\n    yield 20\nfor m in yield_mana():\n    print(m)', expectedOutput: '10\n20', regexMatch: 'yield' },
            { stageNumber: 13, title: 'File Handling & With', xp: 380, concept: 'w3schools: Python Files', theory: { en: 'The with statement ensures files are properly closed after operations.\n\nExample:\nwith open("save.txt", "w") as f:\n    f.write("SAVE_POINT")\n\nwith open("save.txt", "r") as f:\n    content = f.read()\nprint(content)', id: 'Statement with memastikan file tertutup dengan benar setelah operasi.\n\nContoh:\nwith open("save.txt", "w") as f:\n    f.write("SAVE_POINT")\n\nwith open("save.txt", "r") as f:\n    content = f.read()\nprint(content)' }, taskType: 'code', question: 'Simulate file read with content = "SAVE_POINT". Print content.', starterCode: '', solution: 'content = "SAVE_POINT"\nprint(content)', expectedOutput: 'SAVE_POINT', regexMatch: 'SAVE_POINT' },
            { stageNumber: 14, title: 'Try...Except Errors', xp: 400, concept: 'w3schools: Python Exceptions', theory: { en: 'Try/except catches exceptions to prevent crashes and handle errors gracefully.\n\nExample:\ntry:\n    x = 10 / 0\nexcept ZeroDivisionError:\n    print("Shield Protected")', id: 'Try/except menangkap exception untuk mencegah crash dan handle error dengan graceful.\n\nContoh:\ntry:\n    x = 10 / 0\nexcept ZeroDivisionError:\n    print("Shield Protected")' }, taskType: 'code', question: 'Catch ZeroDivisionError and print "Shield Protected".', starterCode: '', solution: 'try:\n    x = 10 / 0\nexcept ZeroDivisionError:\n    print("Shield Protected")', expectedOutput: 'Shield Protected', regexMatch: 'except' },
            { stageNumber: 15, title: 'Master Project: Dungeon Boss', xp: 500, concept: 'Python Boss Battle', theory: { en: 'Combine loops, conditionals, functions, and data structures to defeat the final boss.\n\nExample:\nattacks = [40, 60, 80]\nboss_hp = 180\nif sum(attacks) >= boss_hp:\n    print("Boss Defeated")', id: 'Gabungkan loop, kondisional, fungsi, dan struktur data untuk mengalahkan boss final.\n\nContoh:\nattacks = [40, 60, 80]\nboss_hp = 180\nif sum(attacks) >= boss_hp:\n    print("Boss Defeated")' }, taskType: 'code', question: 'Calculate total damage: attacks = [40, 60, 80], boss_hp = 180. Print "Boss Defeated" if sum(attacks) >= boss_hp.', starterCode: 'attacks = [40, 60, 80]\nboss_hp = 180\n', solution: 'attacks = [40, 60, 80]\nboss_hp = 180\nif sum(attacks) >= boss_hp:\n    print("Boss Defeated")', expectedOutput: 'Boss Defeated', regexMatch: 'Boss Defeated' }
    ]
  },
  cpp: {
      id: 'cpp',
      name: 'C++',
      tagline: 'High-speed systems, pointers, and memory mastery',
      color: '#6366F1',
      icon: '⚡',
      stages: [
        {
          stageNumber: 1,
          title: 'Structure & Cout',
          xp: 100,
          concept: 'w3schools: C++ Syntax & Output',
          theory: {
            en: 'C++ programs execute from main(). Output text using cout and the << insertion operator from <iostream>:\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Pixel Arena";\n    return 0;\n}',
            id: 'Program C++ dieksekusi dari main(). Output teks menggunakan cout dan operator << dari <iostream>:\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Pixel Arena";\n    return 0;\n}'
          },
          taskType: 'code',
          question: 'Print the message "Ready Player 1" to standard output followed by endl.',
          starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Output here:\n    \n    return 0;\n}',
          solution: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Ready Player 1" << endl;\n    return 0;\n}',
          expectedOutput: 'Ready Player 1',
          regexMatch: 'cout\\s*<<\\s*["\']Ready Player 1["\']'
        },
        {
          stageNumber: 2,
          title: 'Primitive Types & Math',
          xp: 120,
          concept: 'w3schools: C++ Data Types',
          theory: {
            en: 'C++ variables must specify types: int (integer), double (float), char (character), string (text), bool (boolean).\n\nint health = 100;\ndouble ratio = 1.75;',
            id: 'Variabel C++ harus menentukan tipe: int (integer), double (float), char (karakter), string (teks), bool (boolean).\n\nint health = 100;\ndouble ratio = 1.75;'
          },
          taskType: 'code',
          question: 'Declare int shields = 50 and double shieldMultiplier = 1.5. Output shields * shieldMultiplier.',
          starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Declare and output:\n    \n    return 0;\n}',
          solution: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int shields = 50;\n    double shieldMultiplier = 1.5;\n    cout << shields * shieldMultiplier << endl;\n    return 0;\n}',
          expectedOutput: '75',
          regexMatch: 'int\\s+shields\\s*=\\s*50'
        },
        {
          stageNumber: 3,
          title: 'Operators & Strings',
          xp: 150,
          concept: 'w3schools: C++ Operators',
          theory: {
            en: 'Combine expressions using arithmetic operators (+, -, *, /). Strings can be concatenated with +:\n\nstring a = "Pixel ";\nstring b = "Hero";\ncout << a + b;',
            id: 'Gabungkan ekspresi menggunakan operator aritmatika (+, -, *, /). String dapat dikonkatenasi dengan +:\n\nstring a = "Pixel ";\nstring b = "Hero";\ncout << a + b;'
          },
          taskType: 'code',
          question: 'Given int baseAtk = 20 and int buff = 15. Store their sum in int finalAtk and print "Attack: " followed by finalAtk.',
          starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int baseAtk = 20;\n    int buff = 15;\n    // Write code:\n    \n    return 0;\n}',
          solution: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int baseAtk = 20;\n    int buff = 15;\n    int finalAtk = baseAtk + buff;\n    cout << "Attack: " << finalAtk << endl;\n    return 0;\n}',
          expectedOutput: 'Attack: 35',
          regexMatch: 'Attack:\\s*35'
        },
        {
          stageNumber: 4,
          title: 'If...Else Logic',
          xp: 180,
          concept: 'w3schools: C++ Conditions',
          theory: {
            en: 'Use if, else if, and else statements for decision trees:\n\nif (score >= 90) {\n    cout << "Rank S";\n} else {\n    cout << "Continue";\n}',
            id: 'Gunakan pernyataan if, else if, dan else untuk pohon keputusan:\n\nif (score >= 90) {\n    cout << "Rank S";\n} else {\n    cout << "Continue";\n}'
          },
          taskType: 'code',
          question: 'Given int durability = 25. If durability > 50 print "Pristine", else if durability >= 20 print "Worn", else print "Broken".',
          starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int durability = 25;\n    // Conditional check:\n    \n    return 0;\n}',
          solution: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int durability = 25;\n    if (durability > 50) cout << "Pristine";\n    else if (durability >= 20) cout << "Worn";\n    else cout << "Broken";\n    return 0;\n}',
          expectedOutput: 'Worn',
          regexMatch: 'Worn'
        },
        {
          stageNumber: 5,
          title: 'For Loops & Sums',
          xp: 200,
          concept: 'w3schools: C++ For Loop',
          theory: {
            en: 'for (initialization; condition; increment) {\n    // code to repeat\n}',
            id: 'for (inisialisasi; kondisi; inkremen) {\n    // kode yang diulang\n}'
          },
          taskType: 'code',
          question: 'Use a for loop to calculate the sum of numbers from 1 to 5 inclusive. Store in int totalSum = 0 and print totalSum.',
          starterCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int totalSum = 0;\n    // Loop and add:\n    \n    return 0;\n}',
          solution: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int totalSum = 0;\n    for(int i = 1; i <= 5; i++) totalSum += i;\n    cout << totalSum << endl;\n    return 0;\n}',
          expectedOutput: '15',
          regexMatch: 'totalSum'
        },
        {
          stageNumber: 6,
          title: 'Arrays & Indexing',
          xp: 220,
          concept: 'w3schools: C++ Arrays',
          theory: {
            en: 'Arrays are fixed-size collections of elements of the same type, addressed with a zero-based index.\n\nExample:\nint gems[3] = {10, 20, 30};\ncout << gems[1]; // 20',
            id: 'Array adalah koleksi ukuran tetap berisi elemen sejenis, diakses dengan index mulai dari 0.\n\nContoh:\nint gems[3] = {10, 20, 30};\ncout << gems[1]; // 20'
          },
          taskType: 'code',
          question: 'Declare int gems[3] = {10, 20, 30}. Print the middle element, then on a new line print the sum of the first and last element.',
          starterCode: 'int gems[3] = {10, 20, 30};\n// Print gems[1], then gems[0] + gems[2]\n',
          solution: 'int gems[3] = {10, 20, 30};\ncout << gems[1] << "\\n";\ncout << gems[0] + gems[2] << "\\n";',
          expectedOutput: '20\n40',
          regexMatch: 'gems\\s*\\[\\s*1\\s*\\]'
        },
        {
          stageNumber: 7,
          title: 'References & Memory',
          xp: 240,
          concept: 'w3schools: C++ References',
          theory: {
            en: 'A reference (&) is an alias for an existing variable: writing through it changes the original.\n\nExample:\nint mana = 100;\nint &ref = mana;\nref = 150;\ncout << mana; // 150',
            id: 'Reference (&) adalah alias untuk variabel yang sudah ada: menulis lewat reference mengubah variabel aslinya.\n\nContoh:\nint mana = 100;\nint &ref = mana;\nref = 150;\ncout << mana; // 150'
          },
          taskType: 'code',
          question: 'Create int mana = 100 and int &ref = mana. Add 50 through the reference, then print mana and ref * 2 on one line separated by a space.',
          starterCode: 'int mana = 100;\n// Bind a reference and change mana through it\n',
          solution: 'int mana = 100;\nint &ref = mana;\nref += 50;\ncout << mana << " " << ref * 2 << "\\n";',
          expectedOutput: '150 300',
          regexMatch: 'int\\s*&\\s*ref'
        },
        {
          stageNumber: 8,
          title: 'Pointers & Dereference',
          xp: 260,
          concept: 'w3schools: C++ Pointers',
          theory: {
            en: 'A pointer stores a memory address. * dereferences it (reads/writes the value), & takes an address.\n\nExample:\nint hp = 50;\nint* ptr = &hp;\n*ptr += 10;\ncout << hp; // 60',
            id: 'Pointer menyimpan alamat memori. * melakukan dereference (baca/tulis nilainya), & mengambil alamat.\n\nContoh:\nint hp = 50;\nint* ptr = &hp;\n*ptr += 10;\ncout << hp; // 60'
          },
          taskType: 'code',
          question: 'Create int hp = 50 and int* ptr = &hp. Add 25 to hp through the pointer, then print hp and *ptr separated by a space.',
          starterCode: 'int hp = 50;\n// Point at hp and modify it through the pointer\n',
          solution: 'int hp = 50;\nint* ptr = &hp;\n*ptr += 25;\ncout << hp << " " << *ptr << "\\n";',
          expectedOutput: '75 75',
          regexMatch: '\\*\\s*ptr'
        },
        {
          stageNumber: 9,
          title: 'Functions & Pass by Ref',
          xp: 280,
          concept: 'w3schools: C++ Functions',
          theory: {
            en: 'Passing by reference (& in the parameter list) lets a function modify the caller variable.\n\nExample:\nvoid heal(int &hp, int amount) { hp += amount; }\nint p = 75;\nheal(p, 25);\ncout << p; // 100',
            id: 'Pass by reference (& di parameter) membuat fungsi bisa mengubah variabel milik pemanggil.\n\nContoh:\nvoid heal(int &hp, int amount) { hp += amount; }\nint p = 75;\nheal(p, 25);\ncout << p; // 100'
          },
          taskType: 'code',
          question: 'Write void heal(int &hp, int amount) that adds amount to hp. Call it with p = 75 and amount 25, then print p.',
          starterCode: '// Define heal above main, then call it\n',
          solution: 'void heal(int &hp, int amount) { hp += amount; }\nint main() {\n  int p = 75;\n  heal(p, 25);\n  cout << p << "\\n";\n  return 0;\n}',
          expectedOutput: '100',
          regexMatch: 'void\\s+heal\\s*\\(\\s*int\\s*&'
        },
        {
          stageNumber: 10,
          title: 'Classes & Encapsulation',
          xp: 300,
          concept: 'w3schools: C++ Classes',
          theory: {
            en: 'A class bundles data with methods. Private members are only reachable through public methods.\n\nExample:\nclass Hero {\n  int atk = 40;\npublic:\n  int attack() { return atk; }\n};',
            id: 'Class menggabungkan data dengan method. Member private hanya bisa diakses lewat method public.\n\nContoh:\nclass Hero {\n  int atk = 40;\npublic:\n  int attack() { return atk; }\n};'
          },
          taskType: 'code',
          question: 'Create class Hero with a private int atk = 40 and public method attack() returning atk. In main, print h.attack() for a Hero h.',
          starterCode: 'class Hero {\n  // private atk, public attack()\n};\n',
          solution: 'class Hero {\n  int atk = 40;\npublic:\n  int attack() { return atk; }\n};\nint main() {\n  Hero h;\n  cout << h.attack() << "\\n";\n  return 0;\n}',
          expectedOutput: '40',
          regexMatch: 'class\\s+Hero[\\s\\S]*attack\\s*\\('
        },
        {
          stageNumber: 11,
          title: 'Constructors & Destructors',
          xp: 320,
          concept: 'w3schools: C++ Constructors',
          theory: {
            en: 'A constructor initializes an object; a destructor cleans up when it leaves scope. Initializer lists set fields before the body runs.\n\nExample:\nclass Hero {\n  int score;\npublic:\n  Hero(int s) : score(s) {}\n  ~Hero() {}\n  int get() { return score; }\n};',
            id: 'Constructor menginisialisasi object; destructor membersihkan saat object keluar scope. Initializer list mengisi field sebelum body berjalan.\n\nContoh:\nclass Hero {\n  int score;\npublic:\n  Hero(int s) : score(s) {}\n  ~Hero() {}\n  int get() { return score; }\n};'
          },
          taskType: 'code',
          question: 'Give Hero a constructor Hero(int s) that stores s in score, an empty destructor, and get(). Create Hero h(999) in main and print h.get().',
          starterCode: 'class Hero {\n  int score;\npublic:\n  // constructor + destructor + get()\n};\n',
          solution: 'class Hero {\n  int score;\npublic:\n  Hero(int s) : score(s) {}\n  ~Hero() {}\n  int get() { return score; }\n};\nint main() {\n  Hero h(999);\n  cout << h.get() << "\\n";\n  return 0;\n}',
          expectedOutput: '999',
          regexMatch: 'Hero\\s*\\(\\s*999\\s*\\)'
        },
        {
          stageNumber: 12,
          title: 'Inheritance & Virtual',
          xp: 350,
          concept: 'w3schools: C++ Polymorphism',
          theory: {
            en: 'virtual functions dispatch at runtime, so a base pointer calls the derived override. Always give polymorphic bases a virtual destructor.\n\nExample:\nclass Weapon {\npublic:\n  virtual string hit() { return "Attack"; }\n  virtual ~Weapon() {}\n};',
            id: 'Fungsi virtual dipilih saat runtime, jadi pointer base memanggil override milik derived. Selalu beri virtual destructor pada base polimorfik.\n\nContoh:\nclass Weapon {\npublic:\n  virtual string hit() { return "Attack"; }\n  virtual ~Weapon() {}\n};'
          },
          taskType: 'code',
          question: 'Create Weapon with virtual string hit() returning "Attack" and a virtual destructor, plus Sword : public Weapon overriding hit() to return "Virtual Sword Attack". Print w->hit() through a Weapon*.',
          starterCode: '#include <string>\n// Weapon + Sword, then a Weapon* pointing at new Sword\n',
          solution: '#include <string>\nclass Weapon {\npublic:\n  virtual string hit() { return "Attack"; }\n  virtual ~Weapon() {}\n};\nclass Sword : public Weapon {\npublic:\n  string hit() override { return "Virtual Sword Attack"; }\n};\nint main() {\n  Weapon* w = new Sword();\n  cout << w->hit() << "\\n";\n  delete w;\n  return 0;\n}',
          expectedOutput: 'Virtual Sword Attack',
          regexMatch: 'override'
        },
        {
          stageNumber: 13,
          title: 'Vectors & Dynamic Arrays',
          xp: 380,
          concept: 'w3schools: C++ Vectors',
          theory: {
            en: 'std::vector is a resizable array. push_back appends, size() reports the length, and range-for walks the values.\n\nExample:\nvector<int> v;\nv.push_back(1);\nv.push_back(2);\ncout << v.size(); // 2',
            id: 'std::vector adalah array yang bisa membesar. push_back menambah, size() memberi panjang, range-for menelusuri nilainya.\n\nContoh:\nvector<int> v;\nv.push_back(1);\nv.push_back(2);\ncout << v.size(); // 2'
          },
          taskType: 'code',
          question: 'Push 1, 2 and 3 into vector<int> v. Print v.size() and the sum of all elements on one line separated by a space.',
          starterCode: 'vector<int> v;\n// push_back three values, then print size and sum\n',
          solution: 'vector<int> v;\nv.push_back(1);\nv.push_back(2);\nv.push_back(3);\nint sum = 0;\nfor (int x : v) sum += x;\ncout << v.size() << " " << sum << "\\n";',
          expectedOutput: '3 6',
          regexMatch: 'push_back'
        },
        {
          stageNumber: 14,
          title: 'Templates & Generics',
          xp: 400,
          concept: 'w3schools: C++ Templates',
          theory: {
            en: 'Templates let one function work for any type; the compiler generates a version per type used.\n\nExample:\ntemplate <typename T>\nT maxVal(T a, T b) { return a > b ? a : b; }\ncout << maxVal(15, 25); // 25',
            id: 'Template membuat satu fungsi berlaku untuk tipe apa pun; compiler membuat versi per tipe yang dipakai.\n\nContoh:\ntemplate <typename T>\nT maxVal(T a, T b) { return a > b ? a : b; }\ncout << maxVal(15, 25); // 25'
          },
          taskType: 'code',
          question: 'Write template <typename T> T maxVal(T a, T b) returning the larger value. Print maxVal(15, 25) and maxVal(2.5, 1.5) on one line separated by a space.',
          starterCode: '// template <typename T> T maxVal(T a, T b)\n',
          solution: 'template <typename T>\nT maxVal(T a, T b) { return a > b ? a : b; }\nint main() {\n  cout << maxVal(15, 25) << " " << maxVal(2.5, 1.5) << "\\n";\n  return 0;\n}',
          expectedOutput: '25 2.5',
          regexMatch: 'template\\s*<'
        },
        {
          stageNumber: 15,
          title: 'Master Project: Memory Fortress',
          xp: 500,
          concept: 'C++ Systems Boss',
          theory: {
            en: 'Combine containers, loops and RAII: a vector owns its buffer, so filling it needs no manual delete. Sum the buffer, then report the vault status.\n\nExample:\nvector<int> buffer(4);\nfor (int i = 0; i < 4; i++) buffer[i] = i * 10;\nint sum = 0;\nfor (int v : buffer) sum += v;\ncout << sum; // 60',
            id: 'Gabungkan container, loop dan RAII: vector memiliki buffer-nya sendiri, jadi tidak perlu delete manual. Jumlahkan buffer, lalu laporkan status vault.\n\nContoh:\nvector<int> buffer(4);\nfor (int i = 0; i < 4; i++) buffer[i] = i * 10;\nint sum = 0;\nfor (int v : buffer) sum += v;\ncout << sum; // 60'
          },
          taskType: 'code',
          question: 'Allocate vector<int> buffer(4) and fill each slot with index * 10. Print the sum of the buffer, then print "Memory Secure" on the next line.',
          starterCode: 'vector<int> buffer(4);\n// fill, sum, then report the vault\n',
          solution: 'vector<int> buffer(4);\nfor (int i = 0; i < 4; i++) buffer[i] = i * 10;\nint sum = 0;\nfor (int value : buffer) sum += value;\ncout << sum << "\\n";\ncout << "Memory Secure" << "\\n";',
          expectedOutput: '60\nMemory Secure',
          regexMatch: 'vector|new'
        }
      ]
    },
  javascript: {
      id: 'javascript',
      name: 'JavaScript',
      tagline: 'The interactive web language of sprites and spells',
      color: '#06B6D4',
      icon: '⚡',
      stages: [
        {
          stageNumber: 1,
          title: 'Console, Let & Const',
          xp: 100,
          concept: 'w3schools: JS Variables',
          theory: {
            en: 'Use const for identifiers that cannot be reassigned, and let for mutable variables:\n\nconst name = "Pixel";\nlet score = 0;\nconsole.log(name, score);',
            id: 'Gunakan const untuk identifier yang tidak bisa di-reassign, dan let untuk variabel mutable:\n\nconst name = "Pixel";\nlet score = 0;\nconsole.log(name, score);'
          },
          taskType: 'code',
          question: 'Declare const gameTitle = "Pixel Quest" and let stage = 1. Log both separated by a space using console.log().',
          starterCode: '// Declare and log variables:\n',
          solution: 'const gameTitle = "Pixel Quest";\nlet stage = 1;\nconsole.log(gameTitle, stage);',
          expectedOutput: 'Pixel Quest 1',
          regexMatch: 'const\\s+gameTitle'
        },
        {
          stageNumber: 2,
          title: 'Template Literals',
          xp: 120,
          concept: 'w3schools: JS Template Strings',
          theory: {
            en: 'Template literals use backticks (`) and string interpolation (${expression}):\n\nconst hero = "Aria";\nconsole.log(`Hero: ${hero.toUpperCase()}`);',
            id: 'Template literal menggunakan backticks (`) dan interpolasi string (${expression}):\n\nconst hero = "Aria";\nconsole.log(`Hero: ${hero.toUpperCase()}`);'
          },
          taskType: 'code',
          question: 'Given const quest = "dragon hunt" and const reward = 500. Create const summary = `Quest: ${quest.toUpperCase()} | Reward: ${reward} Gold` and log summary.',
          starterCode: 'const quest = "dragon hunt";\nconst reward = 500;\n// Create summary template:\n',
          solution: 'const quest = "dragon hunt";\nconst reward = 500;\nconst summary = `Quest: ${quest.toUpperCase()} | Reward: ${reward} Gold`;\nconsole.log(summary);',
          expectedOutput: 'Quest: DRAGON HUNT | Reward: 500 Gold',
          regexMatch: 'toUpperCase'
        },
        {
          stageNumber: 3,
          title: 'Arrow Functions',
          xp: 150,
          concept: 'w3schools: JS Arrow Function',
          theory: {
            en: 'Arrow functions provide compact syntax:\n\nconst add = (a, b) => a + b;\nconsole.log(add(5, 3));',
            id: 'Arrow function menyediakan sintaks ringkas:\n\nconst add = (a, b) => a + b;\nconsole.log(add(5, 3));'
          },
          taskType: 'code',
          question: 'Write an arrow function calculateXP = (base, multiplier) => base * multiplier. Log calculateXP(100, 2.5).',
          starterCode: '// Define calculateXP:\n\nconsole.log(calculateXP(100, 2.5));\n',
          solution: 'const calculateXP = (base, multiplier) => base * multiplier;\nconsole.log(calculateXP(100, 2.5));',
          expectedOutput: '250',
          regexMatch: '=>'
        },
        {
          stageNumber: 4,
          title: 'Array Methods (Filter)',
          xp: 180,
          concept: 'w3schools: JS Array Filter',
          theory: {
            en: 'The filter() method creates a new array with all elements that pass the test implemented by the provided function:\n\nconst nums = [5, 12, 8, 130];\nconst big = nums.filter(n => n >= 10);',
            id: 'Metode filter() membuat array baru dengan semua elemen yang lolos tes fungsi yang disediakan:\n\nconst nums = [5, 12, 8, 130];\nconst big = nums.filter(n => n >= 10);'
          },
          taskType: 'code',
          question: 'Given const inventory = [12, 5, 20, 8, 30]. Use .filter() to keep only numbers >= 10 in const rareItems. Log JSON.stringify(rareItems).',
          starterCode: 'const inventory = [12, 5, 20, 8, 30];\n// Filter items:\n',
          solution: 'const inventory = [12, 5, 20, 8, 30];\nconst rareItems = inventory.filter(x => x >= 10);\nconsole.log(JSON.stringify(rareItems));',
          expectedOutput: '[12,20,30]',
          regexMatch: '\\.filter'
        },
        {
          stageNumber: 5,
          title: 'Destructuring & Objects',
          xp: 200,
          concept: 'w3schools: JS Destructuring',
          theory: {
            en: 'Destructuring assignment allows unpacking properties from objects:\n\nconst user = { name: "Byte", level: 10 };\nconst { name, level } = user;\nconsole.log(name);',
            id: 'Destructuring assignment memungkinkan unpacking properti dari object:\n\nconst user = { name: "Byte", level: 10 };\nconst { name, level } = user;\nconsole.log(name);'
          },
          taskType: 'code',
          question: 'Given const character = { name: "Byte", health: 100, weapon: "Pixel Blade" }. Destructure name and weapon from character, and log them separated by space.',
          starterCode: 'const character = { name: "Byte", health: 100, weapon: "Pixel Blade" };\n// Destructure and log:\n',
          solution: 'const character = { name: "Byte", health: 100, weapon: "Pixel Blade" };\nconst { name, weapon } = character;\nconsole.log(name, weapon);',
          expectedOutput: 'Byte Pixel Blade',
          regexMatch: 'name.*weapon'
        },
        { stageNumber: 6, title: 'Spread & Rest Operator', xp: 220, concept: 'w3schools: JS Spread Operator', theory: { en: 'Spread (...) expands iterables. Rest collects remaining elements into an array.\n\nExample:\nconst arr1 = [1, 2];\nconst arr2 = [3, 4];\nconst combined = [...arr1, ...arr2];\nconsole.log(combined);', id: 'Spread (...) expand iterable. Rest kumpulkan elemen tersisa jadi array.\n\nContoh:\nconst arr1 = [1, 2];\nconst arr2 = [3, 4];\nconst combined = [...arr1, ...arr2];\nconsole.log(combined);' }, taskType: 'code', question: 'Combine arr1=[1,2] and arr2=[3,4] with spread. Log result.', starterCode: '', solution: 'console.log([1,2, ...[3,4]]);', expectedOutput: '1,2,3,4', regexMatch: '\\.\\.\\.' },
              { stageNumber: 7, title: 'Promises & Async', xp: 240, concept: 'w3schools: JS Promises', theory: { en: 'Promises represent eventual completion/failure of async operations.\n\nExample:\nPromise.resolve("Loaded").then(msg => console.log(msg));\n// Or use .catch() for errors', id: 'Promise mewakili completion/failure eventual operasi async.\n\nContoh:\nPromise.resolve("Loaded").then(msg => console.log(msg));\n// Atau gunakan .catch() untuk error' }, taskType: 'code', question: 'Resolve a Promise with "Loaded" and log it.', starterCode: '', solution: 'Promise.resolve("Loaded").then(console.log);', expectedOutput: 'Loaded', regexMatch: 'Promise' },
              {
                stageNumber: 8,
                title: 'Async / Await Flow',
                xp: 260,
                concept: 'w3schools: JS Async/Await',
                theory: {
                  en: 'An async function returns a Promise; await pauses inside it until another Promise settles. Code after await runs as a microtask.\n\nExample:\nasync function loadGame() {\n  const status = await Promise.resolve("Ready");\n  console.log(status);\n}\nloadGame();',
                  id: 'Fungsi async mengembalikan Promise; await menjeda eksekusi sampai Promise lain selesai. Kode setelah await berjalan sebagai microtask.\n\nContoh:\nasync function loadGame() {\n  const status = await Promise.resolve("Ready");\n  console.log(status);\n}\nloadGame();'
                },
                taskType: 'code',
                question: 'Write an async function loadGame() that awaits Promise.resolve("Game Active") and logs the resolved value. Call loadGame().',
                starterCode: 'async function loadGame() {\n  // await a resolved promise, then log it\n}\n',
                solution: 'async function loadGame() {\n  const status = await Promise.resolve("Game Active");\n  console.log(status);\n}\nloadGame();',
                expectedOutput: 'Game Active',
                regexMatch: 'async[\\s\\S]*await'
              },
              {
                stageNumber: 9,
                title: 'Local Storage API',
                xp: 280,
                concept: 'w3schools: Web Storage API',
                theory: {
                  en: 'Browsers expose localStorage (setItem/getItem/removeItem) which persists as strings. Background workers have no localStorage, so games use a small storage wrapper that can swap in a Map during tests.\n\nExample:\nconst store = new Map();\nstore.set("score", String(1000));\nconsole.log(store.get("score")); // 1000',
                  id: 'Browser menyediakan localStorage (setItem/getItem/removeItem) yang menyimpan string secara persisten. Worker latar belakang tidak punya localStorage, jadi game memakai wrapper penyimpanan kecil yang bisa diganti Map saat pengujian.\n\nContoh:\nconst store = new Map();\nstore.set("score", String(1000));\nconsole.log(store.get("score")); // 1000'
                },
                taskType: 'code',
                question: 'Build a storage wrapper over a Map with setItem(key, value) and getItem(key). Store score = 1000, read it back and log "Score: 1000" using a template literal.',
                starterCode: 'const storage = new Map();\n// write setItem / getItem over the Map, then use them\n',
                solution: 'const storage = new Map();\nconst setItem = (key, value) => storage.set(key, String(value));\nconst getItem = (key) => storage.get(key);\nsetItem("score", 1000);\nconsole.log(`Score: ${getItem("score")}`);',
                expectedOutput: 'Score: 1000',
                regexMatch: 'setItem[\\s\\S]*getItem'
              },
              {
                stageNumber: 10,
                title: 'DOM & Events',
                xp: 300,
                concept: 'w3schools: JS HTML DOM',
                theory: {
                  en: 'UI code registers handlers and the browser calls them on events. Workers have no DOM, but the same pattern works with an array of listeners.\n\nExample:\nconst listeners = [];\nconst onClick = (fn) => listeners.push(fn);\nonClick(() => console.log("Clicked"));\nlisteners.forEach((fn) => fn());',
                  id: 'Kode UI mendaftarkan handler dan browser memanggilnya saat event terjadi. Worker tidak punya DOM, tapi pola yang sama bisa dipakai dengan array listener.\n\nContoh:\nconst listeners = [];\nconst onClick = (fn) => listeners.push(fn);\nonClick(() => console.log("Clicked"));\nlisteners.forEach((fn) => fn());'
                },
                taskType: 'code',
                question: 'Register a click handler with onClick() that adds 50 to xp and logs "XP: 50" (use a template literal), then trigger all listeners once.',
                starterCode: 'const listeners = [];\nconst onClick = (handler) => listeners.push(handler);\nlet xp = 0;\n',
                solution: 'const listeners = [];\nconst onClick = (handler) => listeners.push(handler);\nlet xp = 0;\nonClick(() => {\n  xp += 50;\n  console.log(`XP: ${xp}`);\n});\nlisteners.forEach((handler) => handler());',
                expectedOutput: 'XP: 50',
                regexMatch: 'onClick\\s*\\('
              },
              {
                stageNumber: 11,
                title: 'Modules & Export/Import',
                xp: 320,
                concept: 'w3schools: JS Modules',
                theory: {
                  en: 'ES modules split code into files with export/import. A worker needs a script URL, so games also ship plain objects of helpers that tests can import directly.\n\nExample:\nexport const utils = { xpForLevel: (level) => level * 100 };',
                  id: 'ES module memecah kode ke file dengan export/import. Worker butuh URL script, jadi game juga menyediakan objek helper biasa yang bisa diimpor langsung oleh test.\n\nContoh:\nexport const utils = { xpForLevel: (level) => level * 100 };'
                },
                taskType: 'code',
                question: 'Create a helpers object with xpForLevel(level) returning level * 100. Log "Level 3 needs 300 XP" using the helper and a template literal.',
                starterCode: 'const utils = {\n  // xpForLevel(level)\n};\n',
                solution: 'const utils = {\n  xpForLevel: (level) => level * 100,\n};\nconsole.log(`Level 3 needs ${utils.xpForLevel(3)} XP`);',
                expectedOutput: 'Level 3 needs 300 XP',
                regexMatch: 'xpForLevel'
              },
              {
                stageNumber: 12,
                title: 'Set & Map Collections',
                xp: 350,
                concept: 'w3schools: JS Maps/Sets',
                theory: {
                  en: 'Set keeps unique values; Map keeps key-value pairs with any key type and has get/set/size.\n\nExample:\nconst unique = new Set([1, 1, 2]);\nconsole.log(unique.size); // 2\nconst m = new Map([["hp", 100]]);\nconsole.log(m.get("hp")); // 100',
                  id: 'Set menyimpan nilai unik; Map menyimpan pasangan key-value dengan tipe key apa pun dan punya get/set/size.\n\nContoh:\nconst unique = new Set([1, 1, 2]);\nconsole.log(unique.size); // 2\nconst m = new Map([["hp", 100]]);\nconsole.log(m.get("hp")); // 100'
                },
                taskType: 'code',
                question: 'Deduplicate [1, 1, 2, 3, 3, 3] with a Set, build a Map with aria = 100 and byte = 80, then log "Unique: 3 | Aria HP: 100".',
                starterCode: 'const unique = new Set(/* values */);\nconst heroes = new Map(/* entries */);\n',
                solution: 'const unique = new Set([1, 1, 2, 3, 3, 3]);\nconst heroes = new Map([\n  ["aria", 100],\n  ["byte", 80],\n]);\nconsole.log(`Unique: ${unique.size} | Aria HP: ${heroes.get("aria")}`);',
                expectedOutput: 'Unique: 3 | Aria HP: 100',
                regexMatch: 'new\\s+Set[\\s\\S]*new\\s+Map'
              },
              {
                stageNumber: 13,
                title: 'Regular Expressions',
                xp: 380,
                concept: 'w3schools: JS RegExp',
                theory: {
                  en: 'RegExp matches patterns. Anchors (^ $) pin the whole string, character classes limit allowed characters, and flags like i add case-insensitivity.\n\nExample:\nconst ok = /^[a-z]{3,8}$/i;\nconsole.log(ok.test("Pixel")); // true',
                  id: 'RegExp mencocokkan pola. Anchor (^ $) mengunci seluruh string, character class membatasi karakter yang boleh, dan flag seperti i menambah case-insensitive.\n\nContoh:\nconst ok = /^[a-z]{3,8}$/i;\nconsole.log(ok.test("Pixel")); // true'
                },
                taskType: 'code',
                question: 'Use /^[a-z][a-z0-9_]{2,15}$/i to validate "Pixel_Knight" and "bad name!". Log "<name>: <true|false>" for each, one per line.',
                starterCode: 'const validName = /* regex */;\nfor (const name of ["Pixel_Knight", "bad name!"]) {\n  // log `${name}: ${validName.test(name)}`\n}\n',
                solution: 'const validName = /^[a-z][a-z0-9_]{2,15}$/i;\nfor (const name of ["Pixel_Knight", "bad name!"]) {\n  console.log(`${name}: ${validName.test(name)}`);\n}',
                expectedOutput: 'Pixel_Knight: true\nbad name!: false',
                regexMatch: 'test\\s*\\('
              },
              {
                stageNumber: 14,
                title: 'Canvas 2D Rendering',
                xp: 400,
                concept: 'w3schools: HTML Canvas',
                theory: {
                  en: 'Canvas drawing is coordinate math: each tile occupies tileSize pixels, so the last column starts at (columns - 1) * tileSize. Workers compute layouts before the main thread paints them.\n\nExample:\nconst tileSize = 32;\nconsole.log((8 - 1) * tileSize); // 224',
                  id: 'Menggambar di canvas adalah matematika koordinat: tiap tile berukuran tileSize piksel, jadi kolom terakhir mulai di (columns - 1) * tileSize. Worker menghitung layout sebelum main thread menggambarnya.\n\nContoh:\nconst tileSize = 32;\nconsole.log((8 - 1) * tileSize); // 224'
                },
                taskType: 'code',
                question: 'A sprite sheet has 8 columns of 32px tiles starting at x = 0. Compute the x of the last column and log "Tiles: 8 | Last X: 224".',
                starterCode: 'const tileSize = 32;\nconst columns = 8;\n',
                solution: 'const tileSize = 32;\nconst columns = 8;\nconst lastX = (columns - 1) * tileSize;\nconsole.log(`Tiles: ${columns} | Last X: ${lastX}`);',
                expectedOutput: 'Tiles: 8 | Last X: 224',
                regexMatch: 'tileSize|columns'
              },
              {
                stageNumber: 15,
                title: 'Master Project: Pixel Engine WebGL',
                xp: 500,
                concept: 'JavaScript Boss Battle',
                theory: {
                  en: 'A game loop advances the world by dt each frame. Summing dt over frames gives elapsed time, the base for movement, cooldowns and animation.\n\nExample:\nlet elapsed = 0;\nfor (let i = 0; i < 3; i += 1) elapsed += 1 / 60;\nconsole.log(elapsed.toFixed(2)); // 0.05',
                  id: 'Game loop memajukan dunia sebesar dt tiap frame. Menjumlahkan dt menghasilkan waktu berjalan, dasar untuk gerakan, cooldown dan animasi.\n\nContoh:\nlet elapsed = 0;\nfor (let i = 0; i < 3; i += 1) elapsed += 1 / 60;\nconsole.log(elapsed.toFixed(2)); // 0.05'
                },
                taskType: 'code',
                question: 'Write gameLoop(frames) that advances dt = 1/60 per frame, accumulates elapsed time and logs "Frames: 3 | Time: 0.05s" using toFixed(2). Call gameLoop(3).',
                starterCode: 'function gameLoop(frames) {\n  // accumulate dt per frame, then log with toFixed(2)\n}\n',
                solution: 'function gameLoop(frames) {\n  const dt = 1 / 60;\n  let elapsed = 0;\n  for (let i = 0; i < frames; i += 1) elapsed += dt;\n  console.log(`Frames: ${frames} | Time: ${elapsed.toFixed(2)}s`);\n}\ngameLoop(3);',
                expectedOutput: 'Frames: 3 | Time: 0.05s',
                regexMatch: 'gameLoop'
              }
      ]
    }
  };
