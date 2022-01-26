# How The Compiler Works

## 1. Parse Tokens ✔️
  Tokenizer.js splits the code into very basic tokens such as `NEWLINE` and `INTEGER`.

## 2. Sperate Lines ✔️
  Compiler.js then splits the tokens into lists by the `NEWLINE` token.

## 3. Build Code Blocks ✔️
  Compiler.js then combines all lines within the `{` and `}` symbols into a `CODEBLOCK`.

## 4. Build Compound Types ✔️
  Compiler.js combines different tokens such as numbers and strings into one token. This also allows `$Flag` to create a `FLAG` token. This also removes any `WHITESPACE` tokens not in a string already.

## 5. Build Expressions and Function Params ⚠️
  Compiler.js creates expressions from symbols such as `+ - * / ^ && || ! == != > < <= >=` along with any ones grouped in parantheses into an `EXPRESSION` and function calls.

## 6. Build Function Calls

## 7. Build Asignments

## 8. Build Delays / Ifs

## 9. Build Functions

## Example
  We will break down how this code is compiled:
  ```
  dyn running = ?"q.is_running"

  func die => {
    if($kill) => {
      delay(1) => {
        rc("kill @a")
      }
    }
  }
  ```