# PixelCoder - Curriculum Syllabus & Stage Mapping (w3schools Style)

**Version:** 1.0.0  
**Languages Covered:** Python, C++, JavaScript  
**Stages per Language:** 15 Stages Total (Stages 1-5 Detailed with Core Validation Engine)  

---

## Part 1: Python Track (Stages 1 to 5)

### Stage 1: Syntax & Variables
- **Track:** Python
- **Stage Name:** Variables & Data Types
- **Material (w3schools Syllabus):**
  Variables are containers for storing data values. In Python, variables are created when you assign a value to it:
  ```python
  x = 5
  name = "PixelKnight"
  print(x)
  ```
- **Task Type:** Code Problem
- **Question:** Create a variable named `hero_name` and assign it the string `"Aria"`. Then create a variable `hero_level` and assign it the integer `1`. Finally, print both on separate lines using `print()`.
- **Expected Answer:**
  ```python
  hero_name = "Aria"
  hero_level = 1
  print(hero_name)
  print(hero_level)
  ```
- **Validation Logic:**
  1. AST/Regex parse ensures `hero_name` equals `"Aria"` or `'Aria'`.
  2. AST/Regex parse checks `hero_level == 1`.
  3. Stdout output capture matches `"Aria\n1"`.
  4. Reward: 100 XP.

### Stage 2: Data Types & Casting
- **Track:** Python
- **Stage Name:** Numbers, Strings & Type Casting
- **Material (w3schools Syllabus):**
  Specify data types or cast between them using `int()`, `float()`, `str()`:
  ```python
  score = "250"
  numeric_score = int(score)
  print(type(numeric_score))
  ```
- **Task Type:** Code Problem
- **Question:** You have a string variable `mana_str = "80"`. Cast it to an integer and multiply it by `2`. Store the result in `total_mana` and output `total_mana`.
- **Expected Answer:**
  ```python
  mana_str = "80"
  total_mana = int(mana_str) * 2
  print(total_mana)
  ```
- **Validation Logic:**
  1. Code must contain invocation of `int(mana_str)`.
  2. Stdout must yield exact string `"160"`.
  3. Reject string concatenation `"8080"`.
  4. Reward: 120 XP.

### Stage 3: Operators & Expressions
- **Track:** Python
- **Stage Name:** Arithmetic & Comparison Operators
- **Material (w3schools Syllabus):**
  Comparison operators compare values: `==`, `!=`, `>`, `<`, `>=`, `<=`:
  ```python
  health = 100
  damage = 45
  is_alive = (health - damage) > 0
  ```
- **Task Type:** Coding Problem
- **Question:** Given `player_gold = 150` and `sword_cost = 120`. Write code to calculate remaining gold after purchasing the sword in `remaining_gold`, and check if `can_afford_potion = remaining_gold >= 50`. Print `remaining_gold` and `can_afford_potion`.
- **Expected Answer:**
  ```python
  player_gold = 150
  sword_cost = 120
  remaining_gold = player_gold - sword_cost
  can_afford_potion = remaining_gold >= 50
  print(remaining_gold)
  print(can_afford_potion)
  ```
- **Validation Logic:**
  1. Stdout must match `"30\nFalse"`.
  2. Check for subtraction operator `-` and `>= 50`.
  3. Reward: 150 XP.

### Stage 4: Conditionals (If...Else)
- **Track:** Python
- **Stage Name:** If, Elif, Else Branching
- **Material (w3schools Syllabus):**
  Python uses indentation for blocks:
  ```python
  if score >= 90:
      print("Rank S")
  elif score >= 50:
      print("Rank A")
  else:
      print("Rank F")
  ```
- **Task Type:** Coding Challenge
- **Question:** Write a function `evaluate_boss(boss_hp)` that takes an integer `boss_hp`. If `boss_hp <= 0`, return `"Defeated"`. If `boss_hp <= 50`, return `"Enraged"`. Otherwise return `"Fighting"`. Test with `print(evaluate_boss(35))`.
- **Expected Answer:**
  ```python
  def evaluate_boss(boss_hp):
      if boss_hp <= 0:
          return "Defeated"
      elif boss_hp <= 50:
          return "Enraged"
      else:
          return "Fighting"

  print(evaluate_boss(35))
  ```
- **Validation Logic:**
  1. Evaluated over test assertions: `evaluate_boss(0)` -> `"Defeated"`, `evaluate_boss(35)` -> `"Enraged"`, `evaluate_boss(100)` -> `"Fighting"`.
  2. Stdout check for `"Enraged"`.
  3. Reward: 180 XP.

### Stage 5: Loops (For & While)
- **Track:** Python
- **Stage Name:** Iteration with For & Range
- **Material (w3schools Syllabus):**
  Iterate sequences using `range(start, stop, step)`:
  ```python
  for i in range(1, 4):
      print("Round", i)
  ```
- **Task Type:** Code Problem
- **Question:** Use a `for` loop and `range()` to print all even numbers from `2` to `10` inclusive, each on its own line.
- **Expected Answer:**
  ```python
  for i in range(2, 11, 2):
      print(i)
  ```
- **Validation Logic:**
  1. Stdout must equal `"2\n4\n6\n8\n10"`.
  2. Code inspects presence of `for` and `range`.
  3. Reward: 200 XP.

---

## Part 2: C++ Track (Stages 1 to 5)

### Stage 1: Basic Structure & Cout
- **Track:** C++
- **Stage Name:** Structure & Standard Output
- **Material (w3schools Syllabus):**
  Every C++ program has a `main()` function and uses `#include <iostream>` with `std::cout`:
  ```cpp
  #include <iostream>
  using namespace std;

  int main() {
      cout << "Hello Pixel!";
      return 0;
  }
  ```
- **Task Type:** Code Problem
- **Question:** Print the message `"Ready Player 1"` to standard output followed by a newline using `cout` and `endl`.
- **Expected Answer:**
  ```cpp
  #include <iostream>
  using namespace std;

  int main() {
      cout << "Ready Player 1" << endl;
      return 0;
  }
  ```
- **Validation Logic:**
  1. Tokenizer verifies `#include <iostream>` and `int main()`.
  2. Output stream check matches `"Ready Player 1\n"`.
  3. Reward: 100 XP.

### Stage 2: Primitive Types & Variables
- **Track:** C++
- **Stage Name:** Statically Typed Variables
- **Material (w3schools Syllabus):**
  C++ requires explicit variable types: `int`, `double`, `char`, `string`, `bool`:
  ```cpp
  int hp = 100;
  double critRate = 0.25;
  char rank = 'S';
  ```
- **Task Type:** Code Problem
- **Question:** Declare an integer variable `shields` with value `50` and a double variable `shieldMultiplier` with value `1.5`. Multiply them and output the result via `cout`.
- **Expected Answer:**
  ```cpp
  #include <iostream>
  using namespace std;

  int main() {
      int shields = 50;
      double shieldMultiplier = 1.5;
      cout << shields * shieldMultiplier << endl;
      return 0;
  }
  ```
- **Validation Logic:**
  1. Code checks for `int shields = 50;` and `double shieldMultiplier = 1.5;`.
  2. Stdout matches `"75"`.
  3. Reward: 120 XP.

### Stage 3: User Input (cin) & Math
- **Track:** C++
- **Stage Name:** Input Stream & Operators
- **Material (w3schools Syllabus):**
  Read standard input using `cin >> variable`:
  ```cpp
  int coins;
  cin >> coins;
  cout << "Coins: " << coins;
  ```
- **Task Type:** Coding Challenge
- **Question:** Given `int baseAtk = 20;` and `int buff = 15;`. Add them together into `int finalAtk` and print `"Attack: "` followed by `finalAtk`.
- **Expected Answer:**
  ```cpp
  #include <iostream>
  using namespace std;

  int main() {
      int baseAtk = 20;
      int buff = 15;
      int finalAtk = baseAtk + buff;
      cout << "Attack: " << finalAtk << endl;
      return 0;
  }
  ```
- **Validation Logic:**
  1. Stdout must equal `"Attack: 35"`.
  2. Ensures proper identifier declarations.
  3. Reward: 150 XP.

### Stage 4: Conditionals & Switch Statements
- **Track:** C++
- **Stage Name:** Logic Branching & Switch Cases
- **Material (w3schools Syllabus):**
  Use `if`, `else if`, `else` or `switch` statements to branch game logic:
  ```cpp
  if (level > 10) {
      cout << "Pro";
  } else {
      cout << "Rookie";
  }
  ```
- **Task Type:** Coding Challenge
- **Question:** Check an integer `durability = 25`. If `durability > 50`, print `"Pristine"`. If `durability >= 20`, print `"Worn"`. Otherwise print `"Broken"`.
- **Expected Answer:**
  ```cpp
  #include <iostream>
  using namespace std;

  int main() {
      int durability = 25;
      if (durability > 50) {
          cout << "Pristine";
      } else if (durability >= 20) {
          cout << "Worn";
      } else {
          cout << "Broken";
      }
      return 0;
  }
  ```
- **Validation Logic:**
  1. Output matches `"Worn"`.
  2. Tests logic boundary conditions against 55, 25, 10.
  3. Reward: 180 XP.

### Stage 5: While & For Loops
- **Track:** C++
- **Stage Name:** Repetition & Counter Control
- **Material (w3schools Syllabus):**
  Execute code blocks repeatedly:
  ```cpp
  for (int i = 0; i < 5; i++) {
      cout << i << " ";
  }
  ```
- **Task Type:** Code Problem
- **Question:** Use a `for` loop to compute the sum of numbers from `1` to `5` inclusive. Store the total in an `int totalSum` and print it.
- **Expected Answer:**
  ```cpp
  #include <iostream>
  using namespace std;

  int main() {
      int totalSum = 0;
      for (int i = 1; i <= 5; i++) {
          totalSum += i;
      }
      cout << totalSum << endl;
      return 0;
  }
  ```
- **Validation Logic:**
  1. Output must equal `"15"`.
  2. Presence of `for` loop construct verified.
  3. Reward: 200 XP.

---

## Part 3: JavaScript Track (Stages 1 to 5)

### Stage 1: Console, Variables (const, let)
- **Track:** JavaScript
- **Stage Name:** Declarations & Console Logging
- **Material (w3schools Syllabus):**
  Use `let` for reassignable variables and `const` for immutable bindings:
  ```javascript
  const heroClass = "Mage";
  let mana = 100;
  console.log(heroClass, mana);
  ```
- **Task Type:** Code Problem
- **Question:** Declare a `const` named `gameTitle` with value `"Pixel Quest"` and a `let` named `stage` with value `1`. Log them using `console.log(gameTitle, stage)`.
- **Expected Answer:**
  ```javascript
  const gameTitle = "Pixel Quest";
  let stage = 1;
  console.log(gameTitle, stage);
  ```
- **Validation Logic:**
  1. AST verify `const gameTitle = "Pixel Quest"` and `let stage = 1`.
  2. Console output capture: `"Pixel Quest 1"`.
  3. Reward: 100 XP.

### Stage 2: Template Literals & String Operations
- **Track:** JavaScript
- **Stage Name:** String Interpolation & Methods
- **Material (w3schools Syllabus):**
  Backticks `` ` `` permit expressions inside strings:
  ```javascript
  const player = "Pixel";
  console.log(`Hello, ${player.toUpperCase()}!`);
  ```
- **Task Type:** Coding Challenge
- **Question:** Given `const quest = "dragon hunt"` and `const reward = 500`. Create a message string `const summary = `Quest: ${quest.toUpperCase()} | Reward: ${reward} Gold`` and log `summary`.
- **Expected Answer:**
  ```javascript
  const quest = "dragon hunt";
  const reward = 500;
  const summary = `Quest: ${quest.toUpperCase()} | Reward: ${reward} Gold`;
  console.log(summary);
  ```
- **Validation Logic:**
  1. Console log must output `"Quest: DRAGON HUNT | Reward: 500 Gold"`.
  2. Verifies template literal usage and `.toUpperCase()`.
  3. Reward: 120 XP.

### Stage 3: Arrow Functions
- **Track:** JavaScript
- **Stage Name:** Arrow Functions & Return Values
- **Material (w3schools Syllabus):**
  Concise function syntax with lexical `this`:
  ```javascript
  const double = (n) => n * 2;
  console.log(double(10));
  ```
- **Task Type:** Coding Problem
- **Question:** Write an arrow function `calculateXP = (base, multiplier) => ...` that returns `base * multiplier`. Log `calculateXP(100, 2.5)`.
- **Expected Answer:**
  ```javascript
  const calculateXP = (base, multiplier) => base * multiplier;
  console.log(calculateXP(100, 2.5));
  ```
- **Validation Logic:**
  1. Function call `calculateXP(100, 2.5)` returns `250`.
  2. Function call `calculateXP(40, 3)` returns `120`.
  3. Console log outputs `250`.
  4. Reward: 150 XP.

### Stage 4: Array Methods (map, filter)
- **Track:** JavaScript
- **Stage Name:** Functional Array Transformations
- **Material (w3schools Syllabus):**
  `.filter()` extracts matching items, `.map()` transforms each item:
  ```javascript
  const scores = [10, 45, 80, 95];
  const highScores = scores.filter(s => s >= 50);
  ```
- **Task Type:** Code Problem
- **Question:** Given `const inventory = [12, 5, 20, 8, 30]`. Use `.filter()` to keep only items greater than or equal to `10`, and store in `const rareItems`. Log `rareItems`.
- **Expected Answer:**
  ```javascript
  const inventory = [12, 5, 20, 8, 30];
  const rareItems = inventory.filter(qty => qty >= 10);
  console.log(rareItems);
  ```
- **Validation Logic:**
  1. Output captures array `[12, 20, 30]`.
  2. Verifies `.filter` method call on array.
  3. Reward: 180 XP.

### Stage 5: Objects & Destructuring
- **Track:** JavaScript
- **Stage Name:** Object Structures & Unpacking
- **Material (w3schools Syllabus):**
  Unpack properties directly into distinct variables:
  ```javascript
  const hero = { name: "Raffli", role: "DevOps" };
  const { name, role } = hero;
  console.log(name);
  ```
- **Task Type:** Coding Challenge
- **Question:** Create an object `character` with keys `name: "Byte"`, `health: 100`, `weapon: "Pixel Blade"`. Destructure `name` and `weapon` from `character`, and log them separated by a space.
- **Expected Answer:**
  ```javascript
  const character = {
    name: "Byte",
    health: 100,
    weapon: "Pixel Blade"
  };
  const { name, weapon } = character;
  console.log(name, weapon);
  ```
- **Validation Logic:**
  1. Console output matches `"Byte Pixel Blade"`.
  2. Destructuring pattern verified in AST.
  3. Reward: 200 XP.
